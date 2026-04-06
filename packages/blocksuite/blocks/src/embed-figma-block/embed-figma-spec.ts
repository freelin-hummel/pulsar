import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import './embed-edgeless-figma-block.js';
import { EmbedFigmaBlockService } from './embed-figma-service.js';

export const EmbedFigmaBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:embed-figma'),
  EmbedFigmaBlockService,
  BlockViewExtension('pulsar:embed-figma', model => {
    return model.parent?.flavour === 'pulsar:surface'
      ? literal`pulsar-embed-edgeless-figma-block`
      : literal`pulsar-embed-figma-block`;
  }),
];
