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

  /**
   * ARIA heading level (via role="heading" + aria-level, not a real <hN>
   * element) — this is a reusable component dropped into pages with varying
   * heading depth, so a hard-coded <h5> risked skipping levels. Default 2 is
   * safe in effectively every placement: going shallower than the
   * surrounding context is not a WCAG skip, only going deeper would be.
   */
  @Input() headingLevel: number = 2

  /** One sentence explaining why it is empty and what to do */
  @Input() body: string = ''

  /** Optional primary action label. Omit to render without a button. */
  @Input() actionLabel: string = null

  /** Optional router link for the action button */
  @Input() actionLink: string = null

  /** Compact variant for use inside cards and dropdowns */
  @Input() compact: boolean = false
}