import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import './embed-edgeless-youtube-block.js';
import { EmbedYoutubeBlockService } from './embed-youtube-service.js';

export const EmbedYoutubeBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:embed-youtube'),
  EmbedYoutubeBlockService,
  BlockViewExtension('pulsar:embed-youtube', model => {
    return model.parent?.flavour === 'pulsar:surface'
      ? literal`pulsar-embed-edgeless-youtube-block`
      : literal`pulsar-embed-youtube-block`;
  }),
];
