import type { BlockComponent } from '@pulsar/block-std';

import { focusTextModel } from '@pulsar/editor-components/rich-text';
import { stopPropagation } from '@pulsar/editor-shared/utils';
import { ZERO_WIDTH_SPACE } from '@pulsar/inline/consts';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('block-zero-width')
export class BlockZeroWidth extends LitElement {
  static override styles = css`
    .block-zero-width {
      position: absolute;
      bottom: -10px;
      width: 100%;
      cursor: text;
      z-index: 1;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
  }

  handleClick(e: MouseEvent) {
    stopPropagation(e);
    if (this.block.doc.readonly) return;
    const nextBlock = this.block.model.doc.getNext(this.block.model);
    if (nextBlock?.flavour !== 'pulsar:paragraph') {
      const [paragraphId] = this.block.doc.addSiblingBlocks(this.block.model, [
        { flavour: 'pulsar:paragraph' },
      ]);
      focusTextModel(this.block.host.std, paragraphId);
    }
  }

  override render() {
    return html`<div class="block-zero-width" @click=${this.handleClick}>
      <span>${ZERO_WIDTH_SPACE}</span>
    </div>`;
  }

  @property({ attribute: false })
  accessor block!: BlockComponent;
}

declare global {
  interface HTMLElementTagNameMap {
    'block-zero-width': BlockZeroWidth;
  }
}
