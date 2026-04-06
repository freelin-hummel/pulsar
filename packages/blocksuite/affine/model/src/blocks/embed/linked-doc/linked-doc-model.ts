import { BlockModel } from '@pulsar/store';

import type { ReferenceInfo } from '../../../consts/doc.js';
import type { EmbedCardStyle } from '../../../utils/index.js';

import { defineEmbedModel } from '../../../utils/index.js';

export const EmbedLinkedDocStyles: EmbedCardStyle[] = [
  'vertical',
  'horizontal',
  'list',
  'cube',
  'horizontalThin',
];

export type EmbedLinkedDocBlockProps = {
  style: EmbedCardStyle;
  caption: string | null;
} & ReferenceInfo;

export class EmbedLinkedDocModel extends defineEmbedModel<EmbedLinkedDocBlockProps>(
  BlockModel
) {}

declare global {
  namespace BlockSuite {
    interface EdgelessBlockModelMap {
      'pulsar:embed-linked-doc': EmbedLinkedDocModel;
    }
    interface BlockModels {
      'pulsar:embed-linked-doc': EmbedLinkedDocModel;
    }
  }
}
