import { BlockModel } from '@pulsar/store';

import type { EmbedCardStyle } from '../../../utils/index.js';

import { defineEmbedModel } from '../../../utils/index.js';

export const EmbedHtmlStyles: EmbedCardStyle[] = ['html'] as const;

export type EmbedHtmlBlockProps = {
  style: (typeof EmbedHtmlStyles)[number];
  caption: string | null;
  html?: string;
  design?: string;
};

export class EmbedHtmlModel extends defineEmbedModel<EmbedHtmlBlockProps>(
  BlockModel
) {}

declare global {
  namespace BlockSuite {
    interface EdgelessBlockModelMap {
      'pulsar:embed-html': EmbedHtmlModel;
    }
    interface BlockModels {
      'pulsar:embed-html': EmbedHtmlModel;
    }
  }
}
