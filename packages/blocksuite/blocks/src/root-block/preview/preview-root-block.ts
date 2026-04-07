// import { PageRootBlockComponent } from '../page/page-root-block.js';
import { BlockComponent } from '@pulsar/block-std';
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('pulsar-preview-root')
export class PreviewRootBlockComponent extends BlockComponent {
  static override styles = css`
    pulsar-preview-root {
      display: block;
    }
  `;

  override renderBlock() {
    return html`<div class="pulsar-preview-root">
      ${this.host.renderChildren(this.model)}
    </div>`;
  }
}
