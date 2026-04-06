import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { PageRootService } from '../page/page-root-service.js';

export const PreviewPageSpec: ExtensionType[] = [
  FlavourExtension('pulsar:page'),
  PageRootService,
  BlockViewExtension('pulsar:page', literal`pulsar-preview-root`),
];
