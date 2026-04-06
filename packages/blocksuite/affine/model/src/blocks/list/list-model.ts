import type { SchemaToModel, Text } from '@pulsar/store';

import { defineBlockSchema } from '@pulsar/store';

// `toggle` type has been deprecated, do not use it
export type ListType = 'bulleted' | 'numbered' | 'todo' | 'toggle';

export interface ListProps {
  type: ListType;
  text: Text;
  checked: boolean;
  collapsed: boolean;
  order: number | null;
}

export const ListBlockSchema = defineBlockSchema({
  flavour: 'pulsar:list',
  props: internal =>
    ({
      type: 'bulleted',
      text: internal.Text(),
      checked: false,
      collapsed: false,

      // number type only for numbered list
      order: null,
    }) as ListProps,
  metadata: {
    version: 1,
    role: 'content',
    parent: [
      'pulsar:note',
      'pulsar:database',
      'pulsar:list',
      'pulsar:paragraph',
      'pulsar:edgeless-text',
    ],
  },
});

export type ListBlockModel = SchemaToModel<typeof ListBlockSchema>;

declare global {
  namespace BlockSuite {
    interface BlockModels {
      'pulsar:list': ListBlockModel;
    }
  }
}
