import {
  DocModeService,
  EmbedOptionService,
} from '@pulsar/editor-shared/services';
import {
  BlockViewExtension,
  CommandExtension,
  type ExtensionType,
  FlavourExtension,
  WidgetViewMapExtension,
} from '@pulsar/block-std';
import { literal, unsafeStatic } from 'lit/static-html.js';

import { commands } from '../commands/index.js';
import { PULSAR_DOC_REMOTE_SELECTION_WIDGET } from '../widgets/doc-remote-selection/doc-remote-selection.js';
import { PULSAR_DRAG_HANDLE_WIDGET } from '../widgets/drag-handle/drag-handle.js';
import { PULSAR_EMBED_CARD_TOOLBAR_WIDGET } from '../widgets/embed-card-toolbar/embed-card-toolbar.js';
import { PULSAR_FORMAT_BAR_WIDGET } from '../widgets/format-bar/format-bar.js';
import { PULSAR_INNER_MODAL_WIDGET } from '../widgets/inner-modal/inner-modal.js';
import { PULSAR_LINKED_DOC_WIDGET } from '../widgets/linked-doc/index.js';
import { PULSAR_MODAL_WIDGET } from '../widgets/modal/modal.js';
import { PULSAR_PAGE_DRAGGING_AREA_WIDGET } from '../widgets/page-dragging-area/page-dragging-area.js';
import { PULSAR_SLASH_MENU_WIDGET } from '../widgets/slash-menu/index.js';
import { PULSAR_VIEWPORT_OVERLAY_WIDGET } from '../widgets/viewport-overlay/viewport-overlay.js';
import { PageRootService } from './page-root-service.js';

export const pageRootWidgetViewMap = {
  [PULSAR_MODAL_WIDGET]: literal`${unsafeStatic(PULSAR_MODAL_WIDGET)}`,
  [PULSAR_INNER_MODAL_WIDGET]: literal`${unsafeStatic(PULSAR_INNER_MODAL_WIDGET)}`,
  [PULSAR_SLASH_MENU_WIDGET]: literal`${unsafeStatic(
    PULSAR_SLASH_MENU_WIDGET
  )}`,
  [PULSAR_LINKED_DOC_WIDGET]: literal`${unsafeStatic(
    PULSAR_LINKED_DOC_WIDGET
  )}`,
  [PULSAR_DRAG_HANDLE_WIDGET]: literal`${unsafeStatic(
    PULSAR_DRAG_HANDLE_WIDGET
  )}`,
  [PULSAR_EMBED_CARD_TOOLBAR_WIDGET]: literal`${unsafeStatic(
    PULSAR_EMBED_CARD_TOOLBAR_WIDGET
  )}`,
  [PULSAR_FORMAT_BAR_WIDGET]: literal`${unsafeStatic(
    PULSAR_FORMAT_BAR_WIDGET
  )}`,
  [PULSAR_DOC_REMOTE_SELECTION_WIDGET]: literal`${unsafeStatic(
    PULSAR_DOC_REMOTE_SELECTION_WIDGET
  )}`,
  [PULSAR_PAGE_DRAGGING_AREA_WIDGET]: literal`${unsafeStatic(
    PULSAR_PAGE_DRAGGING_AREA_WIDGET
  )}`,
  [PULSAR_VIEWPORT_OVERLAY_WIDGET]: literal`${unsafeStatic(
    PULSAR_VIEWPORT_OVERLAY_WIDGET
  )}`,
};

export const PageRootBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:page'),
  PageRootService,
  DocModeService,
  EmbedOptionService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:page', literal`pulsar-page-root`),
  WidgetViewMapExtension('pulsar:page', pageRootWidgetViewMap),
];
