import { DatePipe } from '@angular/common'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { RouterTestingModule } from '@angular/router/testing'
import { NgxBootstrapIconsModule, allIcons } from 'ngx-bootstrap-icons'
import { PermissionsService } from 'src/app/services/permissions.service'
import { TagComponent } from '../../common/tag/tag.component'
import { DocumentCardSmallComponent } from './document-card-small.component'

const doc = {
  id: 10,
  title: 'Document 10',
  tags: [1, 2, 3, 4, 5, 6, 7, 8],
  correspondent: 8,
  document_type: 10,
  storage_path: null,
  page_count: 12,
  notes: [
    {
      id: 11,
      note: 'This is some note content bananas',
    },
  ],
  content:
    'Cupcake ipsum dolor sit amet ice cream. Donut shortbread cheesecake caramels tiramisu pastry caramels chocolate bar. Tart tootsie roll muffin icing cotton candy topping sweet roll. Pie lollipop dragée sesame snaps donut tart pudding. Oat cake apple pie danish danish candy canes. Shortbread candy canes sesame snaps muffin tiramisu marshmallow chocolate bar halvah. Cake lemon drops candy apple pie carrot cake bonbon halvah pastry gummi bears. Sweet roll candy ice cream sesame snaps marzipan cookie ice cream. Cake cheesecake apple pie muffin candy toffee lollipop. Carrot cake oat cake cookie biscuit cupcake cake marshmallow. Sweet roll jujubes carrot cake cheesecake cake candy canes sweet roll gingerbread jelly beans. Apple pie sugar plum oat cake halvah cake. Pie oat cake chocolate cake cookie gingerbread marzipan. Lemon drops cheesecake lollipop danish marzipan candy.',
}

describe('DocumentCardSmallComponent', () => {
  let component: DocumentCardSmallComponent
  let fixture: ComponentFixture<DocumentCardSmallComponent>

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgxBootstrapIconsModule.pick(allIcons),
        DocumentCardSmallComponent,
      ],
      providers: [
        DatePipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents()

    jest
      .spyOn(TestBed.inject(PermissionsService), 'currentUserCan')
      .mockReturnValue(true)

    fixture = TestBed.createComponent(DocumentCardSmallComponent)
    component = fixture.componentInstance
    component.document = Object.assign({}, doc)
    fixture.detectChanges()
    jest.useFakeTimers()
  })

  it('should show the card', () => {
    expect(component.show).toBeFalsy()
    component.ngAfterViewInit()
    jest.advanceTimersByTime(100)
    expect(component.show).toBeTruthy()
  })

  it('should display page count', () => {
    expect(fixture.nativeElement.textContent).toContain('12 pages')
  })

  it('should display a document, limit tags to 5', () => {
    expect(fixture.nativeElement.textContent).toContain('Document 10')
    expect(
      fixture.debugElement.queryAll(By.directive(TagComponent))
    ).toHaveLength(5)
    component.document.tags = [1, 2]
    fixture.detectChanges()
    expect(
      fixture.debugElement.queryAll(By.directive(TagComponent))
    ).toHaveLength(2)
  })

  it('should increase limit tags to 6 if no notes', () => {
    component.document.notes = []
    fixture.detectChanges()
    expect(
      fixture.debugElement.queryAll(By.directive(TagComponent))
    ).toHaveLength(6)
  })

  it('should clear hidden tag counter when tag count falls below the limit', () => {
    expect(component.moreTags).toEqual(3)

    component.document.tags = [1, 2, 3, 4, 5, 6]
    fixture.detectChanges()

    expect(component.moreTags).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('+ 3')
  })

  it('should try to close the preview on mouse leave', () => {
    component.popupPreview = {
      close: jest.fn(),
    } as any
    component.mouseLeaveCard()
    expect(component.popupPreview.close).toHaveBeenCalled()
  })

  describe('metadata row reservation', () => {
    // All DEFAULT_DISPLAY_FIELDS are active by default (see displayFields'
    // own default value), and the shared `doc` fixture above deliberately
    // leaves storage_path null and owner/archive_serial_number/
    // is_shared_by_requester unset, so every one of these fields is
    // "active but this document has no value" — exactly the case that used
    // to collapse the row instead of reserving its space.
    function iconRow(iconName: string): HTMLElement {
      const icon: HTMLElement = fixture.nativeElement.querySelector(
        `i-bs[name="${iconName}"]`
      )
      return icon?.closest('.list-group-item, .ps-0')
    }

    it('keeps a row in the DOM for an active field the document has no value for, marked invisible rather than removed', () => {
      const storagePathRow = iconRow('folder')
      expect(storagePathRow).not.toBeNull()
      expect(storagePathRow.classList).toContain('invisible')

      const ownerRow = iconRow('person-fill-lock')
      expect(ownerRow).not.toBeNull()
      expect(ownerRow.classList).toContain('invisible')

      const asnRow = iconRow('upc-scan')
      expect(asnRow).not.toBeNull()
      expect(asnRow.classList).toContain('invisible')

      const sharedRow = iconRow('people-fill')
      expect(sharedRow).not.toBeNull()
      expect(sharedRow.classList).toContain('invisible')
    })

    it('does not mark a row invisible when the document has a value for it', () => {
      const documentTypeRow = iconRow('file-earmark')
      expect(documentTypeRow).not.toBeNull()
      expect(documentTypeRow.classList).not.toContain('invisible')

      const pageCountRow = iconRow('files')
      expect(pageCountRow).not.toBeNull()
      expect(pageCountRow.classList).not.toContain('invisible')
    })

    it('reveals a row and clears invisible once the document gains a value', () => {
      expect(iconRow('folder').classList).toContain('invisible')

      component.document.storage_path = 4
      fixture.detectChanges()

      expect(iconRow('folder').classList).not.toContain('invisible')
    })
  })

  describe('accessible labels on action buttons', () => {
    it('exposes an aria-label on the open and download links, matching their title', () => {
      const openLink: HTMLElement = fixture.nativeElement.querySelector(
        'a[aria-label="Open"]'
      )
      expect(openLink).not.toBeNull()
      expect(openLink.getAttribute('title')).toEqual('Open')

      const downloadLink: HTMLElement = fixture.nativeElement.querySelector(
        'a[aria-label="Download"]'
      )
      expect(downloadLink).not.toBeNull()
      expect(downloadLink.getAttribute('title')).toEqual('Download')
    })
  })
})
