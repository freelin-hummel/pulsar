import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { AIChatBlockService } from './ai-chat-service.js';

export const AIChatBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:embed-ai-chat'),
  AIChatBlockService,
  BlockViewExtension('pulsar:embed-ai-chat', model => {
    const parent = model.doc.getParent(model.id);

    if (parent?.flavour === 'pulsar:surface') {
      return literal`pulsar-edgeless-ai-chat`;
    }

    return literal`pulsar-ai-chat`;
  }),
];
