import {
  BlockViewExtension,
  CommandExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { commands } from './commands/index.js';
import './embed-edgeless-linked-doc-block.js';
import { EmbedLinkedDocBlockService } from './embed-linked-doc-service.js';

export const EmbedLinkedDocBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:embed-linked-doc'),
  EmbedLinkedDocBlockService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:embed-linked-doc', model => {
    return model.parent?.flavour === 'pulsar:surface'
      ? literal`pulsar-embed-edgeless-linked-doc-block`
      : literal`pulsar-embed-linked-doc-block`;
  }),
];
