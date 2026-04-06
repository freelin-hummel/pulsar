import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import './attachment-edgeless-block.js';
import { AttachmentBlockService } from './attachment-service.js';

export const AttachmentBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:attachment'),
  AttachmentBlockService,
  BlockViewExtension('pulsar:attachment', model => {
    return model.parent?.flavour === 'pulsar:surface'
      ? literal`pulsar-edgeless-attachment`
      : literal`pulsar-attachment`;
  }),
];
