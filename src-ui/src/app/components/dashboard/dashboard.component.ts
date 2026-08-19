import {
  CdkDragDrop,
  CdkDragEnd,
  CdkDragStart,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop'
import { Component, inject, ViewChild } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { TourNgBootstrapModule, TourService } from 'ngx-ui-tour-ng-bootstrap'
import { SavedView } from 'src/app/data/saved-view'
import { IfPermissionsDirective } from 'src/app/directives/if-permissions.directive'
import { PermissionsService } from 'src/app/services/permissions.service'
import { SavedViewService } from 'src/app/services/rest/saved-view.service'
import { SettingsService } from 'src/app/services/settings.service'
import { ToastService } from 'src/app/services/toast.service'
import { environment } from 'src/environments/environment'
import { LogoComponent } from '../common/logo/logo.component'
import { PageHeaderComponent } from '../common/page-header/page-header.component'
import { ComponentWithPermissions } from '../with-permissions/with-permissions.component'
import { OnboardingChecklistComponent } from './widgets/onboarding-checklist/onboarding-checklist.component'
import { QuickActionsWidgetComponent } from './widgets/quick-actions-widget/quick-actions-widget.component'
import { RecentDocumentsWidgetComponent } from './widgets/recent-documents-widget/recent-documents-widget.component'
import { SavedViewWidgetComponent } from './widgets/saved-view-widget/saved-view-widget.component'
import { StatisticsWidgetComponent } from './widgets/statistics-widget/statistics-widget.component'
import { UploadFileWidgetComponent } from './widgets/upload-file-widget/upload-file-widget.component'
import { WelcomeWidgetComponent } from './widgets/welcome-widget/welcome-widget.component'

@Component({
  selector: 'pngx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    LogoComponent,
    PageHeaderComponent,
    SavedViewWidgetComponent,
    StatisticsWidgetComponent,
    UploadFileWidgetComponent,
    WelcomeWidgetComponent,
    OnboardingChecklistComponent,
    QuickActionsWidgetComponent,
    RecentDocumentsWidgetComponent,
    IfPermissionsDirective,
    DragDropModule,
    TourNgBootstrapModule,
    NgxBootstrapIconsModule,
    RouterModule,
  ],
})
export class DashboardComponent extends ComponentWithPermissions {
  settingsService = inject(SettingsService)
  savedViewService = inject(SavedViewService)
  permissionsService = inject(PermissionsService)
  private tourService = inject(TourService)
  private toastService = inject(ToastService)

  @ViewChild(UploadFileWidgetComponent)
  private uploadWidget: UploadFileWidgetComponent

  public dashboardViews: SavedView[] = []
  constructor() {
    super()

    this.savedViewService.listAll().subscribe(() => {
      this.dashboardViews = this.savedViewService.dashboardViews
    })
  }

  triggerUpload(): void {
    this.uploadWidget?.openFilePicker()
  }

  get subtitle() {
    if (this.settingsService.displayName) {
      return $localize`Hello ${this.settingsService.displayName}, welcome to ${environment.appTitle}`
    } else {
      return $localize`Welcome to ${environment.appTitle}`
    }
  }

  completeTour() {
    if (this.tourService.getStatus() !== 0) {
      this.tourService.end() // will call settingsService.completeTour()
    } else {
      this.settingsService.completeTour()
    }
  }

  onDragStart(event: CdkDragStart) {
    this.settingsService.globalDropzoneEnabled = false
  }

  onDragEnd(event: CdkDragEnd) {
    this.settingsService.globalDropzoneEnabled = true
  }

  onDrop(event: CdkDragDrop<SavedView[]>) {
    moveItemInArray(
      this.dashboardViews,
      event.previousIndex,
      event.currentIndex
    )

    this.settingsService
      .updateDashboardViewsSort(this.dashboardViews)
      .subscribe({
        next: () => {
          this.toastService.showInfo($localize`Dashboard updated`)
        },
        error: (e) => {
          this.toastService.showError($localize`Error updating dashboard`, e)
        },
      })
  }
}
