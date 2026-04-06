import type { GfxElementGeometry } from '@pulsar/block-std/gfx';
import type { SerializedXYWH } from '@pulsar/global/utils';

import { BlockModel, defineBlockSchema } from '@pulsar/store';

import {
  FontFamily,
  FontStyle,
  FontWeight,
  TextAlign,
  type TextStyleProps,
} from '../../consts/index.js';
import { GfxCompatible } from '../../utils/index.js';

type EdgelessTextProps = {
  xywh: SerializedXYWH;
  index: string;
  scale: number;
  rotate: number;
  hasMaxWidth: boolean;
} & Omit<TextStyleProps, 'fontSize'>;

export const EdgelessTextBlockSchema = defineBlockSchema({
  flavour: 'pulsar:edgeless-text',
  props: (): EdgelessTextProps => ({
    xywh: '[0,0,16,16]',
    index: 'a0',
    color: '#000000',
    fontFamily: FontFamily.Inter,
    fontStyle: FontStyle.Normal,
    fontWeight: FontWeight.Regular,
    textAlign: TextAlign.Left,
    scale: 1,
    rotate: 0,
    hasMaxWidth: false,
  }),
  metadata: {
    version: 1,
    role: 'hub',
    parent: ['pulsar:surface'],
    children: [
      'pulsar:paragraph',
      'pulsar:list',
      'pulsar:code',
      'pulsar:image',
      'pulsar:bookmark',
      'pulsar:attachment',
      'pulsar:embed-!(synced-doc)',
      'pulsar:latex',
    ],
  },
  toModel: () => {
    return new EdgelessTextBlockModel();
  },
});

export class EdgelessTextBlockModel
  extends GfxCompatible<EdgelessTextProps>(BlockModel)
  implements GfxElementGeometry {}

declare global {
  namespace BlockSuite {
    interface BlockModels {
      'pulsar:edgeless-text': EdgelessTextBlockModel;
    }

    interface EdgelessBlockModelMap {
      'pulsar:edgeless-text': EdgelessTextBlockModel;
    }

    interface EdgelessTextModelMap {
      'edgeless-text': EdgelessTextBlockModel;
    }
  }
}
