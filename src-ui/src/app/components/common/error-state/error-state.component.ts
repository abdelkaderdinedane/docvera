import { Component, EventEmitter, Input, Output } from '@angular/core'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'

/**
 * Docvera shared error state component.
 *
 * Renders a human-readable error in place of a raw exception, stack trace or
 * HTTP status code. See DOCVERA_DESIGN_SYSTEM section 5.9: never show a raw
 * exception, stack trace or HTTP code to a client — log the detail, show a
 * human sentence. Technical detail, when useful for support, is folded away
 * behind a collapsed "Technical details" disclosure and is never visible by
 * default.
 *
 * Usage:
 *   <pngx-error-state
 *     level="page"
 *     heading="Couldn't load documents"
 *     body="Something went wrong while loading this list. Try again in a moment."
 *     retryLabel="Retry"
 *     [showDetails]="true"
 *     [details]="rawErrorText"
 *     (retry)="reload()">
 *   </pngx-error-state>
 */
@Component({
  selector: 'pngx-error-state',
  standalone: true,
  imports: [NgxBootstrapIconsModule],
  templateUrl: './error-state.component.html',
  styleUrls: ['./error-state.component.scss'],
})
export class ErrorStateComponent {
  /** Severity/scope of the error — affects sizing, not color or copy */
  @Input() level: 'section' | 'page' = 'section'

  /** Short heading stating what failed, in plain language */
  @Input() heading: string = ''

  /**
   * ARIA heading level (via role="heading" + aria-level, not a real <hN>
   * element) — this is a reusable component dropped into pages with varying
   * heading depth, so a hard-coded <h5> risked skipping levels. Default 2 is
   * safe in effectively every placement: going shallower than the
   * surrounding context is not a WCAG skip, only going deeper would be.
   */
  @Input() headingLevel: number = 2

  /** One sentence explaining what happened and what to do, no jargon */
  @Input() body: string = ''

  /** Optional retry action label. Omit to render without a button. */
  @Input() retryLabel: string = null

  /**
   * Whether a technical-details disclosure is offered at all. When true and
   * `details` has content, renders a collapsed <details> block — never open
   * by default — for support/troubleshooting use.
   */
  @Input() showDetails: boolean = false

  /** Raw technical detail (status code, backend message, ...) for support */
  @Input() details: string = null

  /** Bootstrap icon name shown above the heading */
  @Input() icon: string = 'exclamation-triangle'

  @Output() retry: EventEmitter<void> = new EventEmitter<void>()
}
