import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { NgxBootstrapIconsModule, allIcons } from 'ngx-bootstrap-icons'
import { SettingsService } from 'src/app/services/settings.service'
import { environment } from 'src/environments/environment'
import { OnboardingChecklistComponent } from './onboarding-checklist.component'

interface Counts {
  documents?: number
  tags?: number
  documentTypes?: number
  correspondents?: number
  users?: number
  mailAccounts?: number
}

describe('OnboardingChecklistComponent', () => {
  let component: OnboardingChecklistComponent
  let fixture: ComponentFixture<OnboardingChecklistComponent>
  let httpTestingController: HttpTestingController
  let settingsService: SettingsService

  const flushCounts = (counts: Counts) => {
    const flushOne = (resource: string, count: number) => {
      const req = httpTestingController.expectOne(
        (r) => r.url === `${environment.apiBaseUrl}${resource}/`
      )
      req.flush({ count, results: [], all: [] })
    }
    flushOne('documents', counts.documents ?? 0)
    flushOne('tags', counts.tags ?? 0)
    flushOne('document_types', counts.documentTypes ?? 0)
    flushOne('correspondents', counts.correspondents ?? 0)
    flushOne('users', counts.users ?? 0)
    flushOne('mail_accounts', counts.mailAccounts ?? 0)
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgxBootstrapIconsModule.pick(allIcons),
        OnboardingChecklistComponent,
      ],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            onboardingChecklistDismissed: false,
            dismissOnboardingChecklist: jest.fn(),
            get: jest.fn().mockReturnValue(true),
          },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents()

    httpTestingController = TestBed.inject(HttpTestingController)
    settingsService = TestBed.inject(SettingsService)
    fixture = TestBed.createComponent(OnboardingChecklistComponent)
    component = fixture.componentInstance
  })

  afterEach(() => {
    httpTestingController.verify({ ignoreCancelled: true })
  })

  it('does not fetch counts if already dismissed', () => {
    ;(
      settingsService as unknown as { onboardingChecklistDismissed: boolean }
    ).onboardingChecklistDismissed = true
    fixture.detectChanges()
    expect(component.visible).toBeFalsy()
    httpTestingController.expectNone(`${environment.apiBaseUrl}documents/`)
  })

  it('derives step completion from object counts, taxonomy satisfied by tag OR document type', () => {
    fixture.detectChanges()
    flushCounts({
      documents: 3,
      tags: 0,
      documentTypes: 1,
      correspondents: 0,
      users: 1,
      mailAccounts: 0,
    })
    fixture.detectChanges()

    expect(component.uploadStep.done).toBeTruthy()
    expect(component.taxonomyStep.done).toBeTruthy()
    expect(component.correspondentStep.done).toBeFalsy()
    expect(component.inviteStep.done).toBeFalsy()
    expect(component.mailStep.done).toBeFalsy()
    expect(component.mailStep.optional).toBeTruthy()
    expect(component.completedRequiredCount).toEqual(2)
    expect(component.requiredTotal).toEqual(4)
  })

  it('dismisses automatically once the four required steps are complete, without counting the optional step', () => {
    const dismissSpy = jest.spyOn(settingsService, 'dismissOnboardingChecklist')
    fixture.detectChanges()
    flushCounts({
      documents: 1,
      tags: 1,
      documentTypes: 0,
      correspondents: 1,
      users: 2,
      mailAccounts: 0,
    })
    fixture.detectChanges()

    expect(dismissSpy).toHaveBeenCalled()
    expect(component.visible).toBeFalsy()
  })

  it('stays visible when only the optional mail step is incomplete', () => {
    fixture.detectChanges()
    flushCounts({
      documents: 1,
      tags: 1,
      documentTypes: 0,
      correspondents: 1,
      users: 2,
      mailAccounts: 0,
    })
    fixture.detectChanges()

    expect(component.mailStep.done).toBeFalsy()
    expect(component.completedRequiredCount).toEqual(component.requiredTotal)
  })

  it('hides silently, without surfacing an error, if a count request fails', () => {
    fixture.detectChanges()
    const req = httpTestingController.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}documents/`
    )
    req.flush('failure', { status: 500, statusText: 'Server Error' })
    fixture.detectChanges()

    expect(component.visible).toBeFalsy()
  })

  it('dismisses manually via dismiss()', () => {
    const dismissSpy = jest.spyOn(settingsService, 'dismissOnboardingChecklist')
    fixture.detectChanges()
    flushCounts({ documents: 0 })
    fixture.detectChanges()

    component.dismiss()

    expect(component.visible).toBeFalsy()
    expect(dismissSpy).toHaveBeenCalled()
  })
})
