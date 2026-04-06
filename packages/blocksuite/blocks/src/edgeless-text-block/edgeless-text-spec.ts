import {
  BlockViewExtension,
  CommandExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { commands } from './commands/index.js';
import { EdgelessTextBlockService } from './edgeless-text-service.js';

export const EdgelessTextBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:edgeless-text'),
  EdgelessTextBlockService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:edgeless-text', literal`pulsar-edgeless-text`),
];
