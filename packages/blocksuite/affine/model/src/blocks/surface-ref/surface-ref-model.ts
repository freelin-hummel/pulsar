import { type SchemaToModel, defineBlockSchema } from '@pulsar/store';

type SurfaceRefProps = {
  reference: string;
  caption: string;
  refFlavour: string;
};

export const SurfaceRefBlockSchema = defineBlockSchema({
  flavour: 'pulsar:surface-ref',
  props: () =>
    ({
      reference: '',
      caption: '',
    }) as SurfaceRefProps,
  metadata: {
    version: 1,
    role: 'content',
    parent: ['pulsar:note', 'pulsar:paragraph', 'pulsar:list'],
  },
});

export type SurfaceRefBlockModel = SchemaToModel<typeof SurfaceRefBlockSchema>;

declare global {
  namespace BlockSuite {
    interface BlockModels {
      'pulsar:surface-ref': SurfaceRefBlockModel;
    }
  }
}
