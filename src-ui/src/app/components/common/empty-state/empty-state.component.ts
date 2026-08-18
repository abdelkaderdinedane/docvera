import { Component, Input } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'

/**
 * Docvera shared empty state component.
 *
 * Renders a consistent empty state across every list, table and panel.
 * See DOCVERA_DESIGN_SYSTEM section 5.7 for the specification.
 *
 * Usage:
 *   <pngx-empty-state
 *     icon="inbox"
 *     heading="No documents yet"
 *     body="Upload your first document to get started."
 *     actionLabel="Upload documents"
 *     (action)="onUpload()">
 *   </pngx-empty-state>
 */
@Component({
  selector: 'pngx-empty-state',
  standalone: true,
  imports: [NgxBootstrapIconsModule, RouterModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  /** Bootstrap icon name shown above the heading */
  @Input() icon: string = 'inbox'

  /** Short heading stating what is absent, in plain language */
  @Input() heading: string = ''

  /** One sentence explaining why it is empty and what to do */
  @Input() body: string = ''

  /** Optional primary action label. Omit to render without a button. */
  @Input() actionLabel: string = null

  /** Optional router link for the action button */
  @Input() actionLink: string = null

  /** Compact variant for use inside cards and dropdowns */
  @Input() compact: boolean = false
}