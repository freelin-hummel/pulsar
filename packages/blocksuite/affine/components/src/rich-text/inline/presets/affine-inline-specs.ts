import type { ReferenceInfo } from '@pulsar/model';
import type { InlineEditor, InlineRootElement } from '@pulsar/inline';

import { ReferenceInfoSchema } from '@pulsar/model';
import { html } from 'lit';
import { z } from 'zod';

import type { InlineSpecs } from '../inline-manager.js';
import type { ReferenceNodeConfig } from './nodes/reference-node/reference-config.js';

export type PulsarInlineEditor = InlineEditor<PulsarTextAttributes>;
export type PulsarInlineRootElement = InlineRootElement<PulsarTextAttributes>;

export interface PulsarTextAttributes {
  bold?: true | null;
  italic?: true | null;
  underline?: true | null;
  strike?: true | null;
  code?: true | null;
  link?: string | null;
  reference?:
    | ({
        type: 'Subpage' | 'LinkedPage';
      } & ReferenceInfo)
    | null;
  background?: string | null;
  color?: string | null;
  latex?: string | null;
}

export const basicPulsarInlineSpecs: InlineSpecs<PulsarTextAttributes>[] = [
  {
    name: 'bold',
    schema: z.literal(true).optional().nullable().catch(undefined),
    match: delta => {
      return !!delta.attributes?.bold;
    },
    renderer: ({ delta }) => {
      return html`<pulsar-text .delta=${delta}></pulsar-text>`;
    },
  },
  {
    name: 'italic',
    schema: z.literal(true).optional().nullable().catch(undefined),
    match: delta => {
      return !!delta.attributes?.italic;
    },
    renderer: ({ delta }) => {
      return html`<pulsar-text .delta=${delta}></pulsar-text>`;
    },
  },
  {
    name: 'underline',
    schema: z.literal(true).optional().nullable().catch(undefined),
    match: delta => {
      return !!delta.attributes?.underline;
    },
    renderer: ({ delta }) => {
      return html`<pulsar-text .delta=${delta}></pulsar-text>`;
    },
  },
  {
    name: 'strike',
    schema: z.literal(true).optional().nullable().catch(undefined),
    match: delta => {
      return !!delta.attributes?.strike;
    },
    renderer: ({ delta }) => {
      return html`<pulsar-text .delta=${delta}></pulsar-text>`;
    },
  },
  {
    name: 'code',
    schema: z.literal(true).optional().nullable().catch(undefined),
    match: delta => {
      return !!delta.attributes?.code;
    },
    renderer: ({ delta }) => {
      return html`<pulsar-text .delta=${delta}></pulsar-text>`;
    },
  },
  {
    name: 'background',
    schema: z.string().optional().nullable().catch(undefined),
    match: delta => {
      return !!delta.attributes?.background;
    },
    renderer: ({ delta }) => {
      return html`<pulsar-text .delta=${delta}></pulsar-text>`;
    },
  },
  {
    name: 'color',
    schema: z.string().optional().nullable().catch(undefined),
    match: delta => {
      return !!delta.attributes?.color;
    },
    renderer: ({ delta }) => {
      return html`<pulsar-text .delta=${delta}></pulsar-text>`;
    },
  },
  {
    name: 'latex',
    schema: z.string().optional().nullable().catch(undefined),
    match: delta => typeof delta.attributes?.latex === 'string',
    renderer: ({ delta, selected, editor, startOffset, endOffset }) => {
      return html`<pulsar-latex-node
        .delta=${delta}
        .selected=${selected}
        .editor=${editor}
        .startOffset=${startOffset}
        .endOffset=${endOffset}
      ></pulsar-latex-node>`;
    },
    embed: true,
  },
];

export function getPulsarInlineSpecsWithReference(
  referenceNodeConfig: ReferenceNodeConfig
): InlineSpecs<PulsarTextAttributes>[] {
  return [
    ...basicPulsarInlineSpecs,
    {
      name: 'reference',
      schema: z
        .object({
          type: z.enum([
            // @deprecated Subpage is deprecated, use LinkedPage instead
            'Subpage',
            'LinkedPage',
          ]),
        })
        .merge(ReferenceInfoSchema)
        .optional()
        .nullable()
        .catch(undefined),
      match: delta => {
        return !!delta.attributes?.reference;
      },
      renderer: ({ delta, selected }) => {
        return html`<pulsar-reference
          .delta=${delta}
          .selected=${selected}
          .config=${referenceNodeConfig}
        ></pulsar-reference>`;
      },
      embed: true,
    },
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
}
