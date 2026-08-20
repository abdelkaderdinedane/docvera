import { DatePipe } from '@angular/common'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import {
  PermissionAction,
  PermissionsService,
  PermissionType,
} from 'src/app/services/permissions.service'
import { environment } from 'src/environments/environment'
import { RecentDocumentsWidgetComponent } from './recent-documents-widget.component'

// Default: can view everything except custom fields — false there so
// DocumentService's own constructor-time custom-fields fetch (gated on
// View+CustomField, unrelated to this widget) doesn't fire in every test.
const canViewExceptCustomFields = (
  action: PermissionAction,
  type: PermissionType
) => !(action === PermissionAction.View && type === PermissionType.CustomField)

describe('RecentDocumentsWidgetComponent', () => {
  let component: RecentDocumentsWidgetComponent
  let fixture: ComponentFixture<RecentDocumentsWidgetComponent>
  let httpTestingController: HttpTestingController
  let permissionsService: PermissionsService

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgxBootstrapIconsModule.pick(allIcons),
        RecentDocumentsWidgetComponent,
      ],
      providers: [
        {
          provide: PermissionsService,
          useValue: {
            currentUserCan: jest.fn().mockImplementation(canViewExceptCustomFields),
          },
        },
        DatePipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents()

    httpTestingController = TestBed.inject(HttpTestingController)
    permissionsService = TestBed.inject(PermissionsService)
    fixture = TestBed.createComponent(RecentDocumentsWidgetComponent)
    component = fixture.componentInstance
  })

  afterEach(() => {
    httpTestingController.verify({ ignoreCancelled: true })
  })

  it('does not request tasks/ for a user without PaperlessTask view rights, still loads documents', () => {
    jest
      .spyOn(permissionsService, 'currentUserCan')
      .mockImplementation(
        (action, type) =>
          canViewExceptCustomFields(action, type) &&
          !(
            action === PermissionAction.View &&
            type === PermissionType.PaperlessTask
          )
      )
    fixture.detectChanges()

    httpTestingController.expectNone((r) =>
      r.url.startsWith(`${environment.apiBaseUrl}tasks/`)
    )
    const docsReq = httpTestingController.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}documents/`
    )
    docsReq.flush({
      count: 1,
      results: [{ id: 1, title: 'Doc', added: '2024-01-01T00:00:00Z' }],
      all: [1],
    })
    const tagsReq = httpTestingController.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}tags/`
    )
    tagsReq.flush({ count: 0, results: [], all: [] })
    fixture.detectChanges()

    expect(component.error).toBeFalsy()
    expect(component.permissionDenied).toBeFalsy()
    expect(component.documents.length).toEqual(1)
  })

  it('renders documents with no processing badges if tasks/ fails, rather than failing the whole widget', () => {
    fixture.detectChanges()
    const docsReq = httpTestingController.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}documents/`
    )
    docsReq.flush({
      count: 1,
      results: [
        {
          id: 1,
          title: 'Doc',
          added: '2024-01-01T00:00:00Z',
          original_file_name: 'doc.pdf',
        },
      ],
      all: [1],
    })
    const tagsReq = httpTestingController.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}tags/`
    )
    tagsReq.flush({ count: 0, results: [], all: [] })
    const tasksReq = httpTestingController.expectOne((r) =>
      r.url.startsWith(`${environment.apiBaseUrl}tasks/`)
    )
    tasksReq.flush('forbidden', { status: 403, statusText: 'Forbidden' })
    fixture.detectChanges()

    expect(component.error).toBeFalsy()
    expect(component.permissionDenied).toBeFalsy()
    expect(component.documents.length).toEqual(1)
    expect(component.getStatus(component.documents[0])).not.toEqual(
      'processing'
    )
  })

  it('shows a permission-denied empty state, not the generic error state, when documents/ itself 403s', () => {
    fixture.detectChanges()
    const docsReq = httpTestingController.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}documents/`
    )
    docsReq.flush('forbidden', { status: 403, statusText: 'Forbidden' })
    fixture.detectChanges()

    expect(component.permissionDenied).toBeTruthy()
    expect(component.error).toBeFalsy()
  })

  it('shows the generic error state (with retry) for a non-permission documents/ failure', () => {
    fixture.detectChanges()
    const docsReq = httpTestingController.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}documents/`
    )
    docsReq.flush('boom', { status: 500, statusText: 'Server Error' })
    fixture.detectChanges()

    expect(component.error).toBeTruthy()
    expect(component.permissionDenied).toBeFalsy()
  })
})
