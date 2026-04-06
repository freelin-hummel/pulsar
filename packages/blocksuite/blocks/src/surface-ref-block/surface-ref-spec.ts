import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
  WidgetViewMapExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { SurfaceRefBlockService } from './surface-ref-service.js';

export const PageSurfaceRefBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:surface-ref'),
  SurfaceRefBlockService,
  BlockViewExtension('pulsar:surface-ref', literal`pulsar-surface-ref`),
  WidgetViewMapExtension('pulsar:surface-ref', {
    surfaceToolbar: literal`pulsar-surface-ref-toolbar`,
  }),
];

export const EdgelessSurfaceRefBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:surface-ref'),
  SurfaceRefBlockService,
  BlockViewExtension(
    'pulsar:surface-ref',
    literal`pulsar-edgeless-surface-ref`
  ),
];
