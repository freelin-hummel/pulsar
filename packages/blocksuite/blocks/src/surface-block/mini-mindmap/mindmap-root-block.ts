import type { RootBlockModel } from '@pulsar/model';

import { BlockComponent } from '@pulsar/block-std';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('mini-mindmap-root-block')
export class MindmapRootBlock extends BlockComponent<RootBlockModel> {
  override render() {
    return html`
      <style>
        .affine-mini-mindmap-root {
          display: block;
          width: 100%;
          height: 100%;

          background-size: 20px 20px;
          background-color: var(--pulsar-background-primary-color);
          background-image: radial-gradient(
            var(--pulsar-edgeless-grid-color) 1px,
            var(--pulsar-background-primary-color) 1px
          );
        }
      </style>
      <div class="pulsar-mini-mindmap-root">
        ${this.host.renderChildren(this.model)}
      </div>
    `;
  }
}
