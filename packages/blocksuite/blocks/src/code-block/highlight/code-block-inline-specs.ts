import {
  type PulsarTextAttributes,
  type InlineSpecs,
  basicPulsarInlineSpecs,
} from '@pulsar/editor-components/rich-text';
import { html } from 'lit';
import { z } from 'zod';

export type CodeBlockTextAttributes = PulsarTextAttributes & {
  'code-block-unit'?: null;
};

export const codeBlockInlineSpecs: InlineSpecs<CodeBlockTextAttributes>[] = [
  {
    name: 'code-block-unit',
    schema: z.undefined(),
    match: () => true,
    renderer: ({ delta }) => {
      return html`<pulsar-code-unit .delta=${delta}></pulsar-code-unit>`;
    },
  },
  ...basicPulsarInlineSpecs,
  {
    name: 'link',
    schema: z.string().optional().nullable().catch(undefined),
    match: delta => {
      return !!delta.attributes?.link;
    },
    renderer: ({ delta }) => {
      return html`<pulsar-link .delta=${delta}></pulsar-link>`;
    },
  },
];
