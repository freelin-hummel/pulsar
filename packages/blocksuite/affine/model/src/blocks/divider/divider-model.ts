import { type SchemaToModel, defineBlockSchema } from '@pulsar/store';

export const DividerBlockSchema = defineBlockSchema({
  flavour: 'pulsar:divider',
  metadata: {
    version: 1,
    role: 'content',
    children: [],
  },
});

export type DividerBlockModel = SchemaToModel<typeof DividerBlockSchema>;

declare global {
  namespace BlockSuite {
    interface BlockModels {
      'pulsar:divider': DividerBlockModel;
    }
  }
}
