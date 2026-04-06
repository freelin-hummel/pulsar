import { type SchemaToModel, defineBlockSchema } from '@pulsar/store';

export type ParagraphType =
  | 'text'
  | 'quote'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';

export const ParagraphBlockSchema = defineBlockSchema({
  flavour: 'pulsar:paragraph',
  props: internal => ({
    type: 'text' as ParagraphType,
    text: internal.Text(),
  }),
  metadata: {
    version: 1,
    role: 'content',
    parent: [
      'pulsar:note',
      'pulsar:database',
      'pulsar:paragraph',
      'pulsar:list',
      'pulsar:edgeless-text',
    ],
  },
});

export type ParagraphBlockModel = SchemaToModel<typeof ParagraphBlockSchema>;

declare global {
  namespace BlockSuite {
    interface BlockModels {
      'pulsar:paragraph': ParagraphBlockModel;
    }
  }
}
