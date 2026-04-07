/// <reference types="vite/client" />
import type { NoteBlockModel } from '@pulsar/model';

import { BlockComponent } from '@pulsar/block-std';
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { NoteBlockService } from './note-service.js';

import { KeymapController } from './keymap-controller.js';

@customElement('pulsar-note')
export class NoteBlockComponent extends BlockComponent<
  NoteBlockModel,
  NoteBlockService
> {
  static override styles = css`
    .pulsar-note-block-container {
      display: flow-root;
    }
    .pulsar-note-block-container.selected {
      background-color: var(--pulsar-hover-color);
    }
  `;

  keymapController = new KeymapController(this);

  override connectedCallback() {
    super.connectedCallback();

    this.keymapController.bind();
  }

  override renderBlock() {
    return html`
      <div class="pulsar-note-block-container">
        <div class="pulsar-block-children-container">
          ${this.renderChildren(this.model)}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-note': NoteBlockComponent;
  }
}
