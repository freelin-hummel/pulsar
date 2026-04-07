import type { DatabaseBlockModel } from '@pulsar/model';

import { BlockComponent } from '@pulsar/block-std';
import { CloseIcon, DatabaseTableViewIcon } from '@blocksuite/icons/lit';
import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';

import { fullScreenStyles } from './styles.js';

@customElement('pulsar-database-table-view-full-screen')
export class DatabaseTableViewFullScreen extends BlockComponent<DatabaseBlockModel> {
  _renderView = () => {
    return html`
      <pulsar-database
        class="pulsar-block-element"
        .modalMode=${true}
        .host=${this.host}
        .model=${this.model}
      ></pulsar-database>
    `;
  };

  static override styles = fullScreenStyles;

  close = () => {
    this.abortController.abort();
  };

  override renderBlock() {
    return html`<div class="table-view-full-modal-overlay">
      <div class="table-view-full-modal-container">
        <div class="table-view-full-header">
          <div class="titles">
            <span class="title">${this.doc.meta?.title ?? ''}</span>
            <span class="separator">/</span>
            <span class="title"
              >${DatabaseTableViewIcon()}${this.model.title.toString()}</span
            >
          </div>
          <div class="close" @click=${this.close}>${CloseIcon()}</div>
        </div>
        <div class="table-view-full-content">${this._renderView()}</div>
      </div>
    </div>`;
  }

  @property({ attribute: false })
  accessor abortController!: AbortController;
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-database-table-view-full-screen': DatabaseTableViewFullScreen;
  }
}
