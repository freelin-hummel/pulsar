import { ShadowlessElement } from '@pulsar/block-std';
import * as icons from '@blocksuite/icons/lit';
import { type TemplateResult, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { map } from './uni-component/operation.js';
import { createUniComponentFromWebComponent } from './uni-component/uni-component.js';

@customElement('pulsar-lit-icon')
export class PulsarLitIcon extends ShadowlessElement {
  static override styles = css`
    pulsar-lit-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    pulsar-lit-icon svg {
      fill: var(--pulsar-icon-color);
    }
  `;

  protected override render(): unknown {
    const createIcon = icons[this.name] as () => TemplateResult;
    return html`${createIcon?.()}`;
  }

  @property({ attribute: false })
  accessor name!: keyof typeof icons;
}

const litIcon = createUniComponentFromWebComponent<{ name: string }>(
  PulsarLitIcon
);
export const createIcon = (name: keyof typeof icons) => {
  return map(litIcon, () => ({ name }));
};
