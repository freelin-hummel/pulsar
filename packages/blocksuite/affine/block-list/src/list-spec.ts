import {
  BlockViewExtension,
  CommandExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { commands } from './commands/index.js';
import { ListBlockService } from './list-service.js';

export const ListBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:list'),
  ListBlockService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:list', literal`pulsar-list`),
];
