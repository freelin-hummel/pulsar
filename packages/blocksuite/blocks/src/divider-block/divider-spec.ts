import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { DividerBlockService } from './divider-service.js';

export const DividerBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:divider'),
  DividerBlockService,
  BlockViewExtension('pulsar:divider', literal`pulsar-divider`),
];
