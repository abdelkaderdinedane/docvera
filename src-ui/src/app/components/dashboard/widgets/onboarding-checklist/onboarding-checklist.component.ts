import { HttpClient } from '@angular/common/http'
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { first, forkJoin, of } from 'rxjs'
import {
  PermissionAction,
  PermissionsService,
  PermissionType,
} from 'src/app/services/permissions.service'
import { MailAccountService } from 'src/app/services/rest/mail-account.service'
import { UserService } from 'src/app/services/rest/user.service'
import { SettingsService } from 'src/app/services/settings.service'
import { getHttpErrorDetail } from 'src/app/utils/http'
import { environment } from 'src/environments/environment'
import { ErrorStateComponent } from '../../../common/error-state/error-state.component'
import { SkeletonComponent } from '../../../common/skeleton/skeleton.component'

interface OnboardingStep {
  id: 'upload' | 'tag' | 'correspondent' | 'mail' | 'collaborator'
  label: string
  done: boolean
  routerLink?: string
  canLink: boolean
}

interface OnboardingStatistics {
  documents_total?: number
  tag_count?: number
  correspondent_count?: number
}

/**
 * Onboarding checklist shown to admins at the top of an under-configured
 * dashboard. Steps are derived from real system state (never a static,
 * hand-checked list), and dismissal — manual or because all steps are done —
 * is persisted server-side via SettingsService so it never reappears.
 */
@Component({
  selector: 'pngx-onboarding-checklist',
  templateUrl: './onboarding-checklist.component.html',
  styleUrls: ['./onboarding-checklist.component.scss'],
  imports: [
    RouterModule,
    NgxBootstrapIconsModule,
    SkeletonComponent,
    ErrorStateComponent,
  ],
})
export class OnboardingChecklistComponent implements OnInit {
  private http = inject(HttpClient)
  private mailAccountService = inject(MailAccountService)
  private userService = inject(UserService)
  private permissionsService = inject(PermissionsService)
  settingsService = inject(SettingsService)

  @Output() triggerUpload = new EventEmitter<void>()

  /**
   * Snapshot of "not dismissed yet" taken once at load, rather than a live
   * read of settingsService on every change-detection pass. Completing the
   * last step calls dismissOnboardingChecklist() so it never shows again on
   * a *future* load, but that must not erase it from *this* render — the
   * admin who just finished setup should see the 5-of-5 confirmation, not
   * have the card vanish out from under them the instant it's satisfied.
   * Only the manual close button sets this false immediately.
   */
  visible = false

  loading = true
  error = false
  errorDetail: string = null

  steps: OnboardingStep[] = []

  private readonly canViewMail = this.permissionsService.currentUserCan(
    PermissionAction.View,
    PermissionType.MailAccount
  )
  private readonly canViewUsers = this.permissionsService.currentUserCan(
    PermissionAction.View,
    PermissionType.User
  )

  get completedCount(): number {
    return this.steps.filter((s) => s.done).length
  }

  get progressPercent(): number {
    return this.steps.length
      ? (this.completedCount / this.steps.length) * 100
      : 0
  }

  get allComplete(): boolean {
    return this.steps.length > 0 && this.completedCount === this.steps.length
  }

  ngOnInit(): void {
    this.visible = !this.settingsService.onboardingChecklistDismissed
    if (this.visible) {
      this.reload()
    }
  }

  reload(): void {
    this.loading = true
    this.error = false

    forkJoin({
      statistics: this.http.get<OnboardingStatistics>(
        `${environment.apiBaseUrl}statistics/`
      ),
      mailAccounts: this.canViewMail
        ? this.mailAccountService.listAll()
        : of(null),
      users: this.canViewUsers ? this.userService.listAll() : of(null),
    })
      .pipe(first())
      .subscribe({
        next: ({ statistics, mailAccounts, users }) => {
          this.loading = false
          this.steps = [
            {
              id: 'upload',
              label: $localize`Import your first document`,
              done: (statistics.documents_total ?? 0) > 0,
              canLink: true,
            },
            {
              id: 'tag',
              label: $localize`Create a tag`,
              done: (statistics.tag_count ?? 0) > 0,
              routerLink: '/tags',
              canLink: true,
            },
            {
              id: 'correspondent',
              label: $localize`Set up a correspondent`,
              done: (statistics.correspondent_count ?? 0) > 0,
              routerLink: '/correspondents',
              canLink: true,
            },
            {
              id: 'mail',
              label: $localize`Connect a mailbox`,
              done: this.canViewMail
                ? (mailAccounts?.results?.length ?? 0) > 0
                : false,
              routerLink: '/mail',
              canLink: this.canViewMail,
            },
            {
              id: 'collaborator',
              label: $localize`Invite a collaborator`,
              done: this.canViewUsers
                ? (users?.results?.length ?? 0) > 1
                : false,
              routerLink: '/usersgroups',
              canLink: this.canViewUsers,
            },
          ]

          if (this.allComplete) {
            this.settingsService.dismissOnboardingChecklist()
          }
        },
        error: (e) => {
          this.loading = false
          this.error = true
          this.errorDetail = getHttpErrorDetail(e)
        },
      })
  }

  dismiss(): void {
    this.visible = false
    this.settingsService.dismissOnboardingChecklist()
  }

  onUploadStepClick(): void {
    this.triggerUpload.emit()
  }
}
