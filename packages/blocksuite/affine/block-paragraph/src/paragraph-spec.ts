import {
  BlockViewExtension,
  CommandExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { commands } from './commands/index.js';
import { ParagraphBlockService } from './paragraph-service.js';

export const ParagraphBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:paragraph'),
  ParagraphBlockService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:paragraph', literal`pulsar-paragraph`),
];
