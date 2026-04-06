import { isValidUrl } from '@pulsar/editor-shared/utils';
import { ShadowlessElement } from '@pulsar/block-std';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('pulsar-database-link-node')
export class LinkNode extends ShadowlessElement {
  static override styles = css`
    .link-node {
      word-break: break-all;
      color: var(--pulsar-link-color);
      fill: var(--pulsar-link-color);
      cursor: pointer;
      font-weight: normal;
      font-style: normal;
      text-decoration: none;
    }
  `;

  protected override render() {
    if (!isValidUrl(this.link)) {
      return html`<span class="normal-text">${this.link}</span>`;
    }

    return html`<a
      class="link-node"
      href=${this.link}
      rel="noopener noreferrer"
      target="_blank"
      ><span class="link-node-text">${this.link}</span></a
    >`;
  }

  @property({ attribute: false })
  accessor link!: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-database-link-node': LinkNode;
  }
}
