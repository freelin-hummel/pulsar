import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import './embed-edgeless-html-block.js';
import { EmbedHtmlBlockService } from './embed-html-service.js';

export const EmbedHtmlBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:embed-html'),
  EmbedHtmlBlockService,
  BlockViewExtension('pulsar:embed-html', model => {
    return model.parent?.flavour === 'pulsar:surface'
      ? literal`pulsar-embed-edgeless-html-block`
      : literal`pulsar-embed-html-block`;
  }),
];
