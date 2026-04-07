import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('pulsar-template-loading')
export class PulsarTemplateLoading extends LitElement {
  static override styles = css`
    @keyframes affine-template-block-rotate {
      from {
        rotate: 0deg;
      }
      to {
        rotate: 360deg;
      }
    }

    .pulsar-template-block-container {
      width: 20px;
      height: 20px;
      overflow: hidden;
    }

    .pulsar-template-block-loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      position: relative;
      background: conic-gradient(
        rgba(30, 150, 235, 1) 90deg,
        rgba(0, 0, 0, 0.1) 90deg 360deg
      );
      border-radius: 50%;
      animation: affine-template-block-rotate 1s infinite ease-in;
    }

    .pulsar-template-block-loading::before {
      content: '';
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: white;
      position: absolute;
      top: 3px;
      left: 3px;
    }
  `;

  override render() {
    return html`<div class="pulsar-template-block-container">
      <div class="pulsar-template-block-loading"></div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-template-loading': PulsarTemplateLoading;
  }
}
