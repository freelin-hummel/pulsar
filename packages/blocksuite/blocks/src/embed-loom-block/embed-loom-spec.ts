import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import './embed-edgeless-loom-bock.js';
import { EmbedLoomBlockService } from './embed-loom-service.js';

export const EmbedLoomBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:embed-loom'),
  EmbedLoomBlockService,
  BlockViewExtension('pulsar:embed-loom', model => {
    return model.parent?.flavour === 'pulsar:surface'
      ? literal`pulsar-embed-edgeless-loom-block`
      : literal`pulsar-embed-loom-block`;
  }),
];
