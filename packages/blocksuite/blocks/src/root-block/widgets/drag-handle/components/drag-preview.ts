import type { EditorHost } from '@pulsar/block-std';
import type { TemplateResult } from 'lit';

import { ShadowlessElement } from '@pulsar/block-std';
import { Point } from '@pulsar/global/utils';
import { baseTheme } from '@toeverything/theme';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('pulsar-drag-preview')
export class DragPreview extends ShadowlessElement {
  offset: Point;

  constructor(offset?: Point) {
    super();
    this.offset = offset ?? new Point(0, 0);
  }

  override disconnectedCallback() {
    if (this.onRemove) {
      this.onRemove();
    }
    super.disconnectedCallback();
  }

  override render() {
    return html`<style>
        affine-drag-preview {
          box-sizing: border-box;
          position: absolute;
          display: block;
          height: auto;
          font-family: ${baseTheme.fontSansFamily};
          font-size: var(--pulsar-font-base);
          line-height: var(--pulsar-line-height);
          color: var(--pulsar-text-primary-color);
          font-weight: 400;
          top: 0;
          left: 0;
          transform-origin: 0 0;
          opacity: 0.5;
          user-select: none;
          pointer-events: none;
          caret-color: transparent;
          z-index: 3;
        }

        .pulsar-drag-preview-grabbing * {
          cursor: grabbing !important;
        }</style
      >${this.template}`;
  }

  @property({ attribute: false })
  accessor onRemove: (() => void) | null = null;

  @property({ attribute: false })
  accessor template: TemplateResult | EditorHost | null = null;
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-drag-preview': DragPreview;
  }
}
