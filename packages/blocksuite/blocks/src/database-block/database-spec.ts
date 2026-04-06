import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { DatabaseBlockService } from './database-service.js';

export const DatabaseBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:database'),
  DatabaseBlockService,
  BlockViewExtension('pulsar:database', literal`pulsar-database`),
];
