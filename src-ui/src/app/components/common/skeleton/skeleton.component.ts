import { Component, Input, OnDestroy, OnInit } from '@angular/core'

/**
 * Docvera shared skeleton loading state.
 *
 * Renders a placeholder that reproduces the shape of the content being
 * loaded, instead of a spinner + "Loading..." that causes layout shift once
 * the real content arrives. See DOCVERA_DESIGN_SYSTEM section 5.8 for the
 * specification.
 *
 * Usage:
 *   <pngx-skeleton variant="row" [count]="3"></pngx-skeleton>
 */
@Component({
  selector: 'pngx-skeleton',
  standalone: true,
  imports: [],
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class SkeletonComponent implements OnInit, OnDestroy {
  /** Shape of the placeholder content */
  @Input() variant: 'text' | 'card' | 'row' | 'circle' = 'text'

  /** Number of lines/items to repeat */
  @Input() count: number = 3

  /** Optional custom CSS height for each placeholder block */
  @Input() height: string = null

  /** Only becomes true after SHOW_DELAY_MS, to avoid a flash on fast responses */
  visible = false

  private static readonly SHOW_DELAY_MS = 200

  private showTimeout: ReturnType<typeof setTimeout>

  get items(): number[] {
    return Array.from({ length: this.count })
  }

  ngOnInit(): void {
    this.showTimeout = setTimeout(() => {
      this.visible = true
    }, SkeletonComponent.SHOW_DELAY_MS)
  }

  ngOnDestroy(): void {
    clearTimeout(this.showTimeout)
  }
}
