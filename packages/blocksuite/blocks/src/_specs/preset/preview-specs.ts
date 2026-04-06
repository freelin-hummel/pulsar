import { PageSurfaceBlockSpec } from '@pulsar/block-surface';
import {
  DocModeService,
  EmbedOptionService,
} from '@pulsar/editor-shared/services';
import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { LatexBlockSpec } from '../../latex-block/latex-spec.js';
import { PageRootService } from '../../root-block/page/page-root-service.js';
import { PageSurfaceRefBlockSpec } from '../../surface-ref-block/surface-ref-spec.js';
import { CommonFirstPartyBlockSpecs } from '../common.js';

const PreviewPageSpec: ExtensionType[] = [
  FlavourExtension('pulsar:page'),
  PageRootService,
  DocModeService,
  EmbedOptionService,
  BlockViewExtension('pulsar:page', literal`pulsar-preview-root`),
];

export const PreviewEditorBlockSpecs: ExtensionType[] = [
  PreviewPageSpec,
  ...CommonFirstPartyBlockSpecs,
  PageSurfaceBlockSpec,
  PageSurfaceRefBlockSpec,
  LatexBlockSpec,
].flat();
