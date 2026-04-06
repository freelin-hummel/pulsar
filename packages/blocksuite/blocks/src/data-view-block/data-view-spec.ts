import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { DataViewBlockService } from './database-service.js';

export const DataViewBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:data-view'),
  DataViewBlockService,
  BlockViewExtension('pulsar:data-view', literal`pulsar-data-view`),
];
