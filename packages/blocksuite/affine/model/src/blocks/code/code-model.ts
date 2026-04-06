import type { Text } from '@pulsar/store';

import { type SchemaToModel, defineBlockSchema } from '@pulsar/store';

interface CodeBlockProps {
  text: Text;
  language: string | null;
  wrap: boolean;
  caption: string;
}

export const CodeBlockSchema = defineBlockSchema({
  flavour: 'pulsar:code',
  props: internal =>
    ({
      text: internal.Text(),
      language: null,
      wrap: false,
      caption: '',
    }) as CodeBlockProps,
  metadata: {
    version: 1,
    role: 'content',
    parent: [
      'pulsar:note',
      'pulsar:paragraph',
      'pulsar:list',
      'pulsar:edgeless-text',
    ],
    children: [],
  },
});

export type CodeBlockModel = SchemaToModel<typeof CodeBlockSchema>;

declare global {
  namespace BlockSuite {
    interface BlockModels {
      'pulsar:code': CodeBlockModel;
    }
  }
}
