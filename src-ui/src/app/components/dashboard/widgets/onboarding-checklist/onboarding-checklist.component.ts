import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { catchError, first, forkJoin, of } from 'rxjs'
import { CorrespondentService } from 'src/app/services/rest/correspondent.service'
import { DocumentTypeService } from 'src/app/services/rest/document-type.service'
import { DocumentService } from 'src/app/services/rest/document.service'
import { MailAccountService } from 'src/app/services/rest/mail-account.service'
import { TagService } from 'src/app/services/rest/tag.service'
import { UserService } from 'src/app/services/rest/user.service'
import { SettingsService } from 'src/app/services/settings.service'
import { SkeletonComponent } from '../../../common/skeleton/skeleton.component'

interface OnboardingStep {
  id: 'upload' | 'taxonomy' | 'correspondent' | 'invite' | 'mail'
  done: boolean
  optional: boolean
  routerLink?: string
}

/**
 * Onboarding checklist shown to admins on an under-configured dashboard.
 * Every step's completion is derived at read time from real object counts —
 * nothing about step progress is persisted — so the checklist can never go
 * stale relative to data created, deleted or imported outside the UI. The
 * only persisted value is the dismissal flag (manual, or automatic once the
 * four required steps are done), via SettingsService.
 */
@Component({
  selector: 'pngx-onboarding-checklist',
  templateUrl: './onboarding-checklist.component.html',
  styleUrls: ['./onboarding-checklist.component.scss'],
  imports: [RouterModule, NgxBootstrapIconsModule, SkeletonComponent],
})
export class OnboardingChecklistComponent implements OnInit {
  private documentService = inject(DocumentService)
  private tagService = inject(TagService)
  private documentTypeService = inject(DocumentTypeService)
  private correspondentService = inject(CorrespondentService)
  private userService = inject(UserService)
  private mailAccountService = inject(MailAccountService)
  settingsService = inject(SettingsService)

  @Output() triggerUpload = new EventEmitter<void>()

  visible = false
  loading = true
  steps: OnboardingStep[] = []

  get requiredSteps(): OnboardingStep[] {
    return this.steps.filter((s) => !s.optional)
  }

  get completedRequiredCount(): number {
    return this.requiredSteps.filter((s) => s.done).length
  }

  get requiredTotal(): number {
    return this.requiredSteps.length
  }

  get progressPercent(): number {
    return this.requiredTotal
      ? (this.completedRequiredCount / this.requiredTotal) * 100
      : 0
  }

  private get allRequiredComplete(): boolean {
    return (
      this.requiredTotal > 0 &&
      this.completedRequiredCount === this.requiredTotal
    )
  }

  get uploadStep(): OnboardingStep {
    return this.steps.find((s) => s.id === 'upload')
  }

  get taxonomyStep(): OnboardingStep {
    return this.steps.find((s) => s.id === 'taxonomy')
  }

  get correspondentStep(): OnboardingStep {
    return this.steps.find((s) => s.id === 'correspondent')
  }

  get inviteStep(): OnboardingStep {
    return this.steps.find((s) => s.id === 'invite')
  }

  get mailStep(): OnboardingStep {
    return this.steps.find((s) => s.id === 'mail')
  }

  ngOnInit(): void {
    this.visible = !this.settingsService.onboardingChecklistDismissed
    if (this.visible) {
      this.load()
    }
  }

  private load(): void {
    this.loading = true

    forkJoin({
      documents: this.documentService.list(1, 1),
      tags: this.tagService.list(1, 1),
      documentTypes: this.documentTypeService.list(1, 1),
      correspondents: this.correspondentService.list(1, 1),
      users: this.userService.list(1, 1),
      mailAccounts: this.mailAccountService.list(1, 1),
    })
      .pipe(
        first(),
        catchError(() => of(null))
      )
      .subscribe((counts) => {
        this.loading = false

        // Onboarding is non-critical: any failed count request hides the
        // checklist silently rather than surfacing an error on the dashboard.
        if (!counts) {
          this.visible = false
          return
        }

        this.steps = [
          {
            id: 'upload',
            done: counts.documents.count > 0,
            optional: false,
          },
          {
            id: 'taxonomy',
            done: counts.tags.count > 0 || counts.documentTypes.count > 0,
            optional: false,
            routerLink: '/tags',
          },
          {
            id: 'correspondent',
            done: counts.correspondents.count > 0,
            optional: false,
            routerLink: '/correspondents',
          },
          {
            id: 'invite',
            done: counts.users.count > 1,
            optional: false,
            routerLink: '/usersgroups',
          },
          {
            id: 'mail',
            done: counts.mailAccounts.count > 0,
            optional: true,
            routerLink: '/mail',
          },
        ]

        if (this.allRequiredComplete) {
          this.visible = false
          this.settingsService.dismissOnboardingChecklist()
        }
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
