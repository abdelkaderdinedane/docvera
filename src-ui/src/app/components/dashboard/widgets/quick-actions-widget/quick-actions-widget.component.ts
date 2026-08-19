import { Component, EventEmitter, Output } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { ComponentWithPermissions } from 'src/app/components/with-permissions/with-permissions.component'
import { IfPermissionsDirective } from 'src/app/directives/if-permissions.directive'
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
  @Output() triggerUpload = new EventEmitter<void>()

  onUploadClick(): void {
    this.triggerUpload.emit()
  }
}
