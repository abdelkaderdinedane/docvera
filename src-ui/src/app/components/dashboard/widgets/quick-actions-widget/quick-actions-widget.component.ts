import { Component, EventEmitter, inject, Output } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { ComponentWithPermissions } from 'src/app/components/with-permissions/with-permissions.component'
import { IfPermissionsDirective } from 'src/app/directives/if-permissions.directive'
import { PermissionsService } from 'src/app/services/permissions.service'
import { WidgetFrameComponent } from '../widget-frame/widget-frame.component'

@Component({
  selector: 'pngx-quick-actions-widget',
  templateUrl: './quick-actions-widget.component.html',
  styleUrls: ['./quick-actions-widget.component.scss'],
  imports: [
    WidgetFrameComponent,
    IfPermissionsDirective,
    RouterModule,
    NgxBootstrapIconsModule,
  ],
})
export class QuickActionsWidgetComponent extends ComponentWithPermissions {
  private permissionsService = inject(PermissionsService)

  @Output() triggerUpload = new EventEmitter<void>()

  /**
   * Each action button below is individually gated by *pngxIfPermissions on
   * the permission its target requires. This mirrors that same set of
   * checks with OR logic (rather than the directive's AND-across-array
   * behavior) so the card itself can hide when none of them survive,
   * instead of rendering an empty bordered box with a title and nothing in
   * it.
   */
  get hasVisibleAction(): boolean {
    return (
      this.permissionsService.currentUserCan(
        this.PermissionAction.Add,
        this.PermissionType.Document
      ) ||
      this.permissionsService.currentUserCan(
        this.PermissionAction.View,
        this.PermissionType.Document
      ) ||
      this.permissionsService.currentUserCan(
        this.PermissionAction.View,
        this.PermissionType.Tag
      )
    )
  }

  onUploadClick(): void {
    this.triggerUpload.emit()
  }
}
