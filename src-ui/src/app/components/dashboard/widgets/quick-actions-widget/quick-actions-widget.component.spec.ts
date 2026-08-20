import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { PermissionsGuard } from 'src/app/guards/permissions.guard'
import {
  PermissionAction,
  PermissionsService,
  PermissionType,
} from 'src/app/services/permissions.service'
import { WidgetFrameComponent } from '../widget-frame/widget-frame.component'
import { QuickActionsWidgetComponent } from './quick-actions-widget.component'

describe('QuickActionsWidgetComponent', () => {
  let component: QuickActionsWidgetComponent
  let fixture: ComponentFixture<QuickActionsWidgetComponent>
  let permissionsService: PermissionsService

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgxBootstrapIconsModule.pick(allIcons),
        QuickActionsWidgetComponent,
        WidgetFrameComponent,
      ],
      providers: [
        PermissionsGuard,
        {
          provide: PermissionsService,
          useValue: {
            currentUserCan: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compileComponents()

    permissionsService = TestBed.inject(PermissionsService)
    fixture = TestBed.createComponent(QuickActionsWidgetComponent)
    component = fixture.componentInstance
  })

  it('renders the card when at least one action is permitted', () => {
    fixture.detectChanges()
    expect(
      fixture.nativeElement.querySelector('.docvera-section-card')
    ).not.toBeNull()
  })

  it('hides the whole card, not an empty bordered box, when no action survives permission gating', () => {
    jest.spyOn(permissionsService, 'currentUserCan').mockReturnValue(false)
    fixture.detectChanges()

    expect(component.hasVisibleAction).toBeFalsy()
    expect(
      fixture.nativeElement.querySelector('.docvera-section-card')
    ).toBeNull()
  })

  it('still shows the card for a user who can only view tags, though upload/search are hidden', () => {
    jest
      .spyOn(permissionsService, 'currentUserCan')
      .mockImplementation(
        (action, type) =>
          action === PermissionAction.View && type === PermissionType.Tag
      )
    fixture.detectChanges()

    expect(component.hasVisibleAction).toBeTruthy()
    const card = fixture.nativeElement.querySelector('.docvera-section-card')
    expect(card).not.toBeNull()
    expect(card.querySelectorAll('button, a').length).toEqual(1)
  })
})
