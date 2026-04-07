import { ShadowlessElement } from '@pulsar/block-std';
import { PlusIcon } from '@blocksuite/icons/lit';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('pulsar-database-new-record-preview')
export class NewRecordPreview extends ShadowlessElement {
  override render() {
    return html`
      <style>
        pulsar-database-new-record-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;
          height: 32px;
          width: 32px;
          border: 1px solid var(--pulsar-border-color);
          border-radius: 50%;
          background: var(--pulsar-blue-100);
          box-shadow:
            0px 0px 10px rgba(0, 0, 0, 0.05),
            0px 0px 0px 0.5px var(--pulsar-black-10);
          cursor: none;
          user-select: none;
          pointer-events: none;
          caret-color: transparent;
          z-index: 99999;
        }

        pulsar-database-new-record-preview svg {
          width: 16px;
          height: 16px;
        }

        pulsar-database-new-record-preview path {
          fill: var(--pulsar-brand-color);
        }
      </style>
      ${PlusIcon()}
    `;
  }
}
