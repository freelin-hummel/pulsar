import type { SerializedXYWH } from '@pulsar/global/utils';

import {
  GfxCompatible,
  type GfxElementGeometry,
} from '@pulsar/block-std/gfx';
import { BlockModel, defineBlockSchema } from '@pulsar/store';

type LatexProps = {
  xywh: SerializedXYWH;
  index: string;
  scale: number;
  rotate: number;
  latex: string;
};

export const LatexBlockSchema = defineBlockSchema({
  flavour: 'pulsar:latex',
  props: (): LatexProps => ({
    xywh: '[0,0,16,16]',
    index: 'a0',
    scale: 1,
    rotate: 0,
    latex: '',
  }),
  metadata: {
    version: 1,
    role: 'content',
    parent: [
      'pulsar:note',
      'pulsar:edgeless-text',
      'pulsar:paragraph',
      'pulsar:list',
    ],
  },
  toModel: () => {
    return new LatexBlockModel();
  },
});

export class LatexBlockModel
  extends GfxCompatible<LatexProps>(BlockModel)
  implements GfxElementGeometry {}

declare global {
  namespace BlockSuite {
    interface BlockModels {
      'pulsar:latex': LatexBlockModel;
    }

    interface EdgelessBlockModelMap {
      'pulsar:latex': LatexBlockModel;
    }
  }
}
