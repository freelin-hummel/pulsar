import {
  DocModeService,
  EmbedOptionService,
} from '@pulsar/editor-shared/services';
import {
  BlockViewExtension,
  CommandExtension,
  type ExtensionType,
  WidgetViewMapExtension,
} from '@pulsar/block-std';
import { BlockServiceWatcher, FlavourExtension } from '@pulsar/block-std';
import { literal, unsafeStatic } from 'lit/static-html.js';

import { commands } from '../commands/index.js';
import { PULSAR_DOC_REMOTE_SELECTION_WIDGET } from '../widgets/doc-remote-selection/doc-remote-selection.js';
import { PULSAR_DRAG_HANDLE_WIDGET } from '../widgets/drag-handle/drag-handle.js';
import { PULSAR_EDGELESS_AUTO_CONNECT_WIDGET } from '../widgets/edgeless-auto-connect/edgeless-auto-connect.js';
import { PULSAR_EDGELESS_REMOTE_SELECTION_WIDGET } from '../widgets/edgeless-remote-selection/index.js';
import { PULSAR_EDGELESS_ZOOM_TOOLBAR_WIDGET } from '../widgets/edgeless-zoom-toolbar/index.js';
import { PULSAR_EMBED_CARD_TOOLBAR_WIDGET } from '../widgets/embed-card-toolbar/embed-card-toolbar.js';
import { PULSAR_FORMAT_BAR_WIDGET } from '../widgets/format-bar/format-bar.js';
import { EDGELESS_ELEMENT_TOOLBAR_WIDGET } from '../widgets/index.js';
import { PULSAR_INNER_MODAL_WIDGET } from '../widgets/inner-modal/inner-modal.js';
import { PULSAR_LINKED_DOC_WIDGET } from '../widgets/linked-doc/index.js';
import { PULSAR_MODAL_WIDGET } from '../widgets/modal/modal.js';
import { PULSAR_PIE_MENU_WIDGET } from '../widgets/pie-menu/index.js';
import { PULSAR_SLASH_MENU_WIDGET } from '../widgets/slash-menu/index.js';
import { PULSAR_VIEWPORT_OVERLAY_WIDGET } from '../widgets/viewport-overlay/viewport-overlay.js';
import './edgeless-root-preview-block.js';
import { EdgelessRootService } from './edgeless-root-service.js';

export const edgelessRootWigetViewMap = {
  [PULSAR_MODAL_WIDGET]: literal`${unsafeStatic(PULSAR_MODAL_WIDGET)}`,
  [PULSAR_INNER_MODAL_WIDGET]: literal`${unsafeStatic(PULSAR_INNER_MODAL_WIDGET)}`,
  [PULSAR_PIE_MENU_WIDGET]: literal`${unsafeStatic(PULSAR_PIE_MENU_WIDGET)}`,
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
  [PULSAR_EDGELESS_REMOTE_SELECTION_WIDGET]: literal`${unsafeStatic(
    PULSAR_EDGELESS_REMOTE_SELECTION_WIDGET
  )}`,
  [PULSAR_EDGELESS_ZOOM_TOOLBAR_WIDGET]: literal`${unsafeStatic(
    PULSAR_EDGELESS_ZOOM_TOOLBAR_WIDGET
  )}`,
  [EDGELESS_ELEMENT_TOOLBAR_WIDGET]: literal`${unsafeStatic(EDGELESS_ELEMENT_TOOLBAR_WIDGET)}`,
  [PULSAR_VIEWPORT_OVERLAY_WIDGET]: literal`${unsafeStatic(
    PULSAR_VIEWPORT_OVERLAY_WIDGET
  )}`,
  [PULSAR_EDGELESS_AUTO_CONNECT_WIDGET]: literal`${unsafeStatic(
    PULSAR_EDGELESS_AUTO_CONNECT_WIDGET
  )}`,
};

export const EdgelessRootBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:page'),
  EdgelessRootService,
  DocModeService,
  EmbedOptionService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:page', literal`pulsar-edgeless-root`),
  WidgetViewMapExtension('pulsar:page', edgelessRootWigetViewMap),
];

class EdgelessServiceWatcher extends BlockServiceWatcher {
  static override readonly flavour = 'pulsar:page';

  override mounted() {
    const service = this.blockService;
    service.disposables.add(
      service.specSlots.viewConnected.on(({ service }) => {
        // Does not allow the user to move and zoom.
        (service as EdgelessRootService).locked = true;
      })
    );
  }
}

export const PreviewEdgelessRootBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:page'),
  EdgelessRootService,
  EdgelessServiceWatcher,
  DocModeService,
  EmbedOptionService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:page', literal`pulsar-edgeless-root-preview`),
];
