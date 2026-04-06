import {
  BlockViewExtension,
  CommandExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { commands } from './commands/index.js';
import './surface-block-void.js';
import { SurfaceBlockService } from './surface-service.js';

export const PageSurfaceBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:surface'),
  SurfaceBlockService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:surface', literal`pulsar-surface-void`),
];

export const EdgelessSurfaceBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:surface'),
  SurfaceBlockService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:surface', literal`pulsar-surface`),
];
