import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { FrameBlockService } from './frame-service.js';

export const FrameBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:frame'),
  FrameBlockService,
  BlockViewExtension('pulsar:frame', literal`pulsar-frame`),
];
