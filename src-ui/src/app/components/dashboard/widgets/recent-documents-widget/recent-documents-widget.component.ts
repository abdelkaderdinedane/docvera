import { AsyncPipe, NgClass } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, inject, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { catchError, first, forkJoin, of } from 'rxjs'
import { ComponentWithPermissions } from 'src/app/components/with-permissions/with-permissions.component'
import { Document } from 'src/app/data/document'
import { PaperlessTask, PaperlessTaskStatus } from 'src/app/data/paperless-task'
import { Results } from 'src/app/data/results'
import { Tag } from 'src/app/data/tag'
import { IfPermissionsDirective } from 'src/app/directives/if-permissions.directive'
import { CorrespondentNamePipe } from 'src/app/pipes/correspondent-name.pipe'
import { CustomDatePipe } from 'src/app/pipes/custom-date.pipe'
import {
  PermissionAction,
  PermissionsService,
  PermissionType,
} from 'src/app/services/permissions.service'
import { DocumentService } from 'src/app/services/rest/document.service'
import { TagService } from 'src/app/services/rest/tag.service'
import { getHttpErrorDetail } from 'src/app/utils/http'
import { environment } from 'src/environments/environment'
import { EmptyStateComponent } from '../../../common/empty-state/empty-state.component'
import { ErrorStateComponent } from '../../../common/error-state/error-state.component'
import { SkeletonComponent } from '../../../common/skeleton/skeleton.component'
import { WidgetFrameComponent } from '../widget-frame/widget-frame.component'

type RecentDocumentStatus = 'processing' | 'review' | 'processed'

const RECENT_DOCUMENTS_COUNT = 5

@Component({
  selector: 'pngx-recent-documents-widget',
  templateUrl: './recent-documents-widget.component.html',
  styleUrls: ['./recent-documents-widget.component.scss'],
  imports: [
    AsyncPipe,
    NgClass,
    WidgetFrameComponent,
    IfPermissionsDirective,
    RouterModule,
    NgxBootstrapIconsModule,
    CorrespondentNamePipe,
    CustomDatePipe,
    EmptyStateComponent,
    ErrorStateComponent,
    SkeletonComponent,
  ],
})
export class RecentDocumentsWidgetComponent
  extends ComponentWithPermissions
  implements OnInit
{
  private http = inject(HttpClient)
  private documentService = inject(DocumentService)
  private tagService = inject(TagService)
  private permissionsService = inject(PermissionsService)

  loading = true
  error = false
  errorDetail: string = null
  /** Set specifically when the primary documents/ request itself 403s — a
   *  permission boundary, not a broken widget, so it renders a plain
   *  explanation instead of pngx-error-state's retry-oriented alert. */
  permissionDenied = false

  documents: Document[] = []

  private inboxTagIds: number[] = []
  private processingFileNames: Set<string> = new Set()

  ngOnInit(): void {
    this.reload()
  }

  reload(): void {
    this.loading = true
    this.error = false
    this.permissionDenied = false

    const canViewTags = this.permissionsService.currentUserCan(
      PermissionAction.View,
      PermissionType.Tag
    )
    const canViewTasks = this.permissionsService.currentUserCan(
      PermissionAction.View,
      PermissionType.PaperlessTask
    )

    // inboxTags and activeTasks are supplementary — they only decorate
    // documents with status badges. Skip the request entirely when the user
    // can't view that resource, and degrade to an empty result on any other
    // failure (rather than failing the join and hiding documents the user
    // can read perfectly well) — see DOCVERA_CHANGELOG.md for the incident
    // this fixes.
    const inboxTags$ = canViewTags
      ? this.tagService
          .list(1, 100, null, null, { is_inbox_tag: true })
          .pipe(
            catchError(() =>
              of({ count: 0, results: [], all: [] } as Results<Tag>)
            )
          )
      : of({ count: 0, results: [], all: [] } as Results<Tag>)

    const activeTasks$ = canViewTasks
      ? this.http
          .get<
            PaperlessTask[]
          >(`${environment.apiBaseUrl}tasks/?task_name=consume_file&acknowledged=false`)
          .pipe(catchError(() => of([] as PaperlessTask[])))
      : of([] as PaperlessTask[])

    forkJoin({
      documents: this.documentService.list(
        1,
        RECENT_DOCUMENTS_COUNT,
        'added',
        true
      ),
      inboxTags: inboxTags$,
      activeTasks: activeTasks$,
    })
      .pipe(first())
      .subscribe({
        next: ({ documents, inboxTags, activeTasks }) => {
          this.inboxTagIds = inboxTags.results.map((t) => t.id)
          this.processingFileNames = new Set(
            activeTasks
              .filter(
                (t) =>
                  t.status === PaperlessTaskStatus.Pending ||
                  t.status === PaperlessTaskStatus.Started
              )
              .map((t) => t.task_file_name)
          )
          this.documents = documents.results
          this.loading = false
        },
        error: (e) => {
          this.loading = false
          // Only the documents/ request can still error here — inboxTags$/
          // activeTasks$ never emit an error. A 403 on it is a permission
          // boundary, not a broken widget: never surface pngx-error-state
          // (with its retry, which can't help) for that case.
          if (e?.status === 403) {
            this.permissionDenied = true
          } else {
            this.error = true
            this.errorDetail = getHttpErrorDetail(e)
          }
        },
      })
  }

  getStatus(document: Document): RecentDocumentStatus {
    if (this.processingFileNames.has(document.original_file_name)) {
      return 'processing'
    }
    if (document.tags?.some((tagId) => this.inboxTagIds.includes(tagId))) {
      return 'review'
    }
    return 'processed'
  }

  getStatusLabel(document: Document): string {
    switch (this.getStatus(document)) {
      case 'processing':
        return $localize`Processing`
      case 'review':
        return $localize`Needs review`
      default:
        return $localize`Processed`
    }
  }

  getTypeIcon(document: Document): string {
    const mimeType = document.mime_type ?? ''
    if (mimeType === 'application/pdf') {
      return 'file-earmark-pdf'
    }
    if (mimeType.startsWith('image/')) {
      return 'file-earmark-image'
    }
    if (mimeType.startsWith('text/')) {
      return 'file-earmark-text'
    }
    if (mimeType.includes('word') || mimeType.includes('opendocument.text')) {
      return 'file-earmark-word'
    }
    if (
      mimeType.includes('sheet') ||
      mimeType.includes('excel') ||
      mimeType.includes('opendocument.spreadsheet')
    ) {
      return 'file-earmark-spreadsheet'
    }
    return 'file-earmark'
  }
}
