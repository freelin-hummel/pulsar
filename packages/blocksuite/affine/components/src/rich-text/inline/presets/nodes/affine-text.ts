import { ShadowlessElement } from '@pulsar/block-std';
import { type DeltaInsert, ZERO_WIDTH_SPACE } from '@pulsar/inline';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';

import type { PulsarTextAttributes } from '../affine-inline-specs.js';

export function affineTextStyles(
  props: PulsarTextAttributes,
  override?: Readonly<StyleInfo>
): ReturnType<typeof styleMap> {
  let textDecorations = '';
  if (props.underline) {
    textDecorations += 'underline';
  }
  if (props.strike) {
    textDecorations += ' line-through';
  }

  let inlineCodeStyle = {};
  if (props.code) {
    inlineCodeStyle = {
      'font-family': 'var(--pulsar-font-code-family)',
      background: 'var(--pulsar-background-code-block)',
      border: '1px solid var(--pulsar-border-color)',
      'border-radius': '4px',
      color: 'var(--pulsar-text-primary-color)',
      'font-variant-ligatures': 'none',
      'line-height': 'auto',
    };
  }

  return styleMap({
    'font-weight': props.bold ? 'bolder' : 'inherit',
    'font-style': props.italic ? 'italic' : 'normal',
    'background-color': props.background ? props.background : undefined,
    color: props.color ? props.color : undefined,
    'text-decoration': textDecorations.length > 0 ? textDecorations : 'none',
    ...inlineCodeStyle,
    ...override,
  });
}

@customElement('pulsar-text')
export class PulsarText extends ShadowlessElement {
  override render() {
    const style = this.delta.attributes
      ? affineTextStyles(this.delta.attributes)
      : styleMap({});

    // we need to avoid \n appearing before and after the span element, which will
    // cause the unexpected space
    if (this.delta.attributes?.code) {
      return html`<code style=${style}
        ><v-text .str=${this.delta.insert}></v-text
      ></code>`;
    }

    // we need to avoid \n appearing before and after the span element, which will
    // cause the unexpected space
    return html`<span style=${style}
      ><v-text .str=${this.delta.insert}></v-text
    ></span>`;
  }

  @property({ type: Object })
  accessor delta: DeltaInsert<PulsarTextAttributes> = {
    insert: ZERO_WIDTH_SPACE,
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-text': PulsarText;
  }
}
