import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import './embed-edgeless-synced-doc-block.js';
import { EmbedSyncedDocBlockService } from './embed-synced-doc-service.js';

export const EmbedSyncedDocBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:embed-synced-doc'),
  EmbedSyncedDocBlockService,
  BlockViewExtension('pulsar:embed-synced-doc', model => {
    return model.parent?.flavour === 'pulsar:surface'
      ? literal`pulsar-embed-edgeless-synced-doc-block`
      : literal`pulsar-embed-synced-doc-block`;
  }),
];
