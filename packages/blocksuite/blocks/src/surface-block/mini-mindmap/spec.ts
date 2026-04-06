import type { BlockSchema } from '@pulsar/store';
import type { z } from 'zod';

import { SurfaceBlockSchema } from '@pulsar/block-surface';
import { RootBlockSchema } from '@pulsar/model';
import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { MindmapService } from './service.js';

export const MiniMindmapSpecs: ExtensionType[] = [
  FlavourExtension('pulsar:page'),
  MindmapService,
  BlockViewExtension('pulsar:page', literal`mini-mindmap-root-block`),

  FlavourExtension('pulsar:surface'),
  BlockViewExtension('pulsar:surface', literal`mini-mindmap-surface-block`),
];

export const MiniMindmapSchema: z.infer<typeof BlockSchema>[] = [
  RootBlockSchema,
  SurfaceBlockSchema,
];
