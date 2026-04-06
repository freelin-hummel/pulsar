import { toGfxBlockComponent } from '@pulsar/block-std';
import { Bound } from '@pulsar/global/utils';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { AIChatBlockComponent } from './ai-chat-block.js';

@customElement('pulsar-edgeless-ai-chat')
export class EdgelessAIChatBlockComponent extends toGfxBlockComponent(
  AIChatBlockComponent
) {
  override renderGfxBlock() {
    const bound = Bound.deserialize(this.model.xywh$.value);
    const scale = this.model.scale$.value;
    const width = bound.w / scale;
    const height = bound.h / scale;
    const style = {
      width: `${width}px`,
      height: `${height}px`,
      borderRadius: '8px',
      transformOrigin: '0 0',
      boxShadow: 'var(--pulsar-shadow-1)',
      border: '1px solid var(--pulsar-border-color)',
      transform: `scale(${scale})`,
    };

    return html`
      <div class="edgeless-ai-chat" style=${styleMap(style)}>
        ${this.renderPageContent()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-edgeless-ai-chat': EdgelessAIChatBlockComponent;
  }
}
