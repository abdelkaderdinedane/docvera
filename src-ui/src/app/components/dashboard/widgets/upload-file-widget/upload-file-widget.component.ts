import { NgClass, NgTemplateOutlet } from '@angular/common'
import {
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core'
import { RouterModule } from '@angular/router'
import {
  NgbAlert,
  NgbAlertModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { TourNgBootstrapModule } from 'ngx-ui-tour-ng-bootstrap'
import { ComponentWithPermissions } from 'src/app/components/with-permissions/with-permissions.component'
import { SETTINGS_KEYS } from 'src/app/data/ui-settings'
import { IfPermissionsDirective } from 'src/app/directives/if-permissions.directive'
import { SettingsService } from 'src/app/services/settings.service'
import { UploadDocumentsService } from 'src/app/services/upload-documents.service'
import {
  FileStatus,
  FileStatusPhase,
  WebsocketStatusService,
} from 'src/app/services/websocket-status.service'
import { WidgetFrameComponent } from '../widget-frame/widget-frame.component'

@Component({
  selector: 'pngx-upload-file-widget',
  templateUrl: './upload-file-widget.component.html',
  styleUrls: ['./upload-file-widget.component.scss'],
  imports: [
    WidgetFrameComponent,
    IfPermissionsDirective,
    NgClass,
    NgTemplateOutlet,
    RouterModule,
    NgbAlertModule,
    NgbProgressbarModule,
    NgxBootstrapIconsModule,
    TourNgBootstrapModule,
  ],
})
export class UploadFileWidgetComponent
  extends ComponentWithPermissions
  implements OnDestroy
{
  private websocketStatusService = inject(WebsocketStatusService)
  private uploadDocumentsService = inject(UploadDocumentsService)
  settingsService = inject(SettingsService)

  @ViewChildren(NgbAlert) alerts: QueryList<NgbAlert>
  @ViewChild('fileUpload') fileUploadInput: ElementRef<HTMLInputElement>

  // Local, immediate acknowledgment shown next to the upload control itself
  // (distinct from the shared fixed-bottom consumer-status-list panel below)
  // so a first-time user doesn't have to notice a panel that can render far
  // from wherever they triggered the upload from (e.g. the dashboard's quick
  // actions card). Driven by the same FileStatus objects the shared panel
  // already tracks, not a separate parallel state, so it can't drift out of
  // sync with what actually got queued. Auto-hides after a few seconds — it
  // is a brief "yes, that worked" acknowledgment, not a second progress
  // display competing with the real one.
  recentlyAdded: FileStatus[] = []
  private recentlyAddedTimeout: ReturnType<typeof setTimeout>

  openFilePicker(): void {
    this.fileUploadInput?.nativeElement.click()
  }

  getStatus() {
    return this.websocketStatusService.getConsumerStatus()
  }

  getStatusSummary() {
    let strings = []
    let countUploadingAndProcessing =
      this.websocketStatusService.getConsumerStatusNotCompleted().length
    let countFailed = this.getStatusFailed().length
    let countSuccess = this.getStatusSuccess().length
    if (countUploadingAndProcessing > 0) {
      strings.push($localize`Processing: ${countUploadingAndProcessing}`)
    }
    if (countFailed > 0) {
      strings.push($localize`Failed: ${countFailed}`)
    }
    if (countSuccess > 0) {
      strings.push($localize`Added: ${countSuccess}`)
    }
    return strings.join(
      $localize`:this string is used to separate processing, failed and added on the file upload widget:, `
    )
  }

  getStatusUploading() {
    return this.websocketStatusService.getConsumerStatus(
      FileStatusPhase.UPLOADING
    )
  }

  getStatusFailed() {
    return this.websocketStatusService.getConsumerStatus(FileStatusPhase.FAILED)
  }

  getStatusSuccess() {
    return this.websocketStatusService.getConsumerStatus(
      FileStatusPhase.SUCCESS
    )
  }

  getStatusCompleted() {
    return this.websocketStatusService.getConsumerStatusCompleted()
  }

  getTotalUploadProgress() {
    let current = 0
    let max = 0

    this.getStatusUploading().forEach((status) => {
      current += status.currentPhaseProgress
      max += status.currentPhaseMaxProgress
    })

    return current / Math.max(max, 1)
  }

  isFinished(status: FileStatus) {
    return (
      status.phase == FileStatusPhase.FAILED ||
      status.phase == FileStatusPhase.SUCCESS
    )
  }

  // The backend only reports a handful of fixed checkpoints during
  // consumption (0/20/70/90/95/100, see documents.consumer.py) — there is no
  // real per-page or per-second signal within the WORKING phase, so the bar
  // sits at one width for however long that stage actually takes (the OCR
  // pass alone can hold it at 20% for most of a 40-second job). The striped/
  // animated treatment communicates "still working" without moving the bar
  // itself — Bootstrap's animation only scrolls the stripe pattern's
  // background-position within the existing width, it never changes the
  // width — so it can't be misread as fabricated advancement. See
  // DOCVERA_CHANGELOG.md for why real per-stage progress isn't available.
  isPlateaued(status: FileStatus): boolean {
    return status.phase === FileStatusPhase.WORKING
  }

  getStatusColor(status: FileStatus) {
    switch (status.phase) {
      case FileStatusPhase.UPLOADING:
      case FileStatusPhase.STARTED:
      case FileStatusPhase.WORKING:
        return 'primary'
      case FileStatusPhase.FAILED:
        return 'danger'
      case FileStatusPhase.SUCCESS:
        return 'success'
    }
  }

  dismiss(status: FileStatus) {
    this.websocketStatusService.dismiss(status)
  }

  dismissCompleted() {
    this.getStatusCompleted().forEach((status) =>
      this.websocketStatusService.dismiss(status)
    )
  }

  public onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files
    const countBefore = this.getStatus().length
    for (let i = 0; i < files?.length; i++) {
      const file = files.item(i)
      file && this.uploadDocumentsService.uploadFile(file)
    }
    this.acknowledgeRecentUpload(countBefore)
  }

  private acknowledgeRecentUpload(countBefore: number): void {
    // uploadFile() pushes each new FileStatus synchronously before any
    // async work starts, so the slice past countBefore is exactly what this
    // selection just added, in order.
    const added = this.getStatus().slice(countBefore)
    if (!added.length) return

    this.recentlyAdded = added
    clearTimeout(this.recentlyAddedTimeout)
    this.recentlyAddedTimeout = setTimeout(() => {
      this.recentlyAdded = []
    }, 5000)
  }

  ngOnDestroy(): void {
    clearTimeout(this.recentlyAddedTimeout)
  }

  get slimSidebarEnabled(): boolean {
    return this.settingsService.get(SETTINGS_KEYS.SLIM_SIDEBAR)
  }
}
