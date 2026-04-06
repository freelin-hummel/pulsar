import type { GfxElementGeometry } from '@pulsar/block-std/gfx';
import type { SerializedXYWH } from '@pulsar/global/utils';

import { BlockModel, defineBlockSchema } from '@pulsar/store';

import type { EmbedCardStyle, LinkPreviewData } from '../../utils/index.js';

import { GfxCompatible } from '../../utils/index.js';

export interface BookmarkBlockEdgelessProps {
  index: string;
  xywh: SerializedXYWH;
  rotate: number;
}

export const BookmarkStyles: EmbedCardStyle[] = [
  'vertical',
  'horizontal',
  'list',
  'cube',
] as const;

export type BookmarkBlockProps = {
  style: (typeof BookmarkStyles)[number];
  url: string;
  caption: string | null;
} & LinkPreviewData &
  BookmarkBlockEdgelessProps;

const defaultBookmarkProps: BookmarkBlockProps = {
  style: BookmarkStyles[1],
  url: '',
  caption: null,

  description: null,
  icon: null,
  image: null,
  title: null,

  index: 'a0',
  xywh: '[0,0,0,0]',
  rotate: 0,
};

export const BookmarkBlockSchema = defineBlockSchema({
  flavour: 'pulsar:bookmark',
  props: (): BookmarkBlockProps => defaultBookmarkProps,
  metadata: {
    version: 1,
    role: 'content',
    parent: [
      'pulsar:note',
      'pulsar:surface',
      'pulsar:edgeless-text',
      'pulsar:paragraph',
      'pulsar:list',
    ],
  },
  toModel: () => new BookmarkBlockModel(),
});

export class BookmarkBlockModel
  extends GfxCompatible<BookmarkBlockProps>(BlockModel)
  implements GfxElementGeometry {}

declare global {
  namespace BlockSuite {
    interface EdgelessBlockModelMap {
      'pulsar:bookmark': BookmarkBlockModel;
    }
    interface BlockModels {
      'pulsar:bookmark': BookmarkBlockModel;
    }
  }
}
