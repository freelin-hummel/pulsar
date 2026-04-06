/// <reference types="@pulsar/global" />
import '@pulsar/block-paragraph';
import '@pulsar/block-list';
import '@pulsar/block-surface';
import '@pulsar/editor-components/context-menu';
import '@pulsar/editor-components/rich-text';
import '@pulsar/editor-components/toolbar';
import { Point, deserializeXYWH } from '@pulsar/global/utils';

import { matchFlavours } from './_common/utils/index.js';
import './code-block/highlight/affine-code-unit.js';
import './database-block/index.js';
import './divider-block/index.js';
import './frame-block/index.js';
import './image-block/index.js';
import './note-block/index.js';
import { splitElements } from './root-block/edgeless/utils/clipboard-utils.js';
import { isCanvasElement } from './root-block/edgeless/utils/query.js';
// manual import to avoid being tree-shaken
import './root-block/index.js';
import './surface-ref-block/index.js';

export * from './_common/adapters/index.js';

export * from './_common/components/ai-item/index.js';
export type { NotificationService } from './_common/components/index.js';
export { scrollbarStyle } from './_common/components/index.js';
export { type NavigatorMode } from './_common/edgeless/frame/consts.js';
export { EmbedBlockComponent } from './_common/embed-block-helper/index.js';
export * from './_common/test-utils/test-utils.js';
export * from './_common/transformers/index.js';
export { type AbstractEditor } from './_common/types.js';
export * from './_specs/index.js';
export * from './attachment-block/index.js';
export * from './bookmark-block/index.js';
export * from './code-block/index.js';
export * from './data-view-block/index.js';
export {
  type SelectTag,
  popTagSelect,
} from './database-block/data-view/utils/tags/multi-tag-select.js';
export * from './database-block/index.js';
export * from './divider-block/index.js';
export * from './edgeless-text-block/index.js';
export * from './embed-figma-block/index.js';
export * from './embed-github-block/index.js';
export * from './embed-html-block/index.js';
export * from './embed-linked-doc-block/index.js';
export * from './embed-loom-block/index.js';
export * from './embed-synced-doc-block/index.js';
export * from './embed-youtube-block/index.js';
export * from './frame-block/index.js';
export * from './image-block/index.js';
export * from './note-block/index.js';
export { EdgelessTemplatePanel } from './root-block/edgeless/components/toolbar/template/template-panel.js';
export type {
  Template,
  TemplateCategory,
  TemplateManager,
} from './root-block/edgeless/components/toolbar/template/template-type.js';
export { CopilotSelectionController } from './root-block/edgeless/tools/copilot-tool.js';
export * from './root-block/index.js';
export * from './schemas.js';
export {
  markdownToMindmap,
  MiniMindmapPreview,
} from './surface-block/mini-mindmap/mindmap-preview.js';
export * from './surface-ref-block/index.js';
export * from '@pulsar/block-list';
export * from '@pulsar/block-paragraph';
export * from '@pulsar/block-surface';
export { type MenuOptions } from '@pulsar/editor-components/context-menu';
export {
  HoverController,
  whenHover,
} from '@pulsar/editor-components/hover';
export {
  ArrowDownSmallIcon,
  CloseIcon,
  DocIcon,
  DualLinkIcon16,
  LinkedDocIcon,
  PlusIcon,
  TagsIcon,
} from '@pulsar/editor-components/icons';
export * from '@pulsar/editor-components/icons';
export {
  type PeekViewService,
  Peekable,
  PeekableController,
  isPeekable,
  peek,
} from '@pulsar/editor-components/peek';
export {
  createLitPortal,
  createSimplePortal,
} from '@pulsar/editor-components/portal';
export {
  type PulsarInlineEditor,
  PulsarReference,
  type PulsarTextAttributes,
  InlineManager,
  type InlineMarkdownMatch,
  type InlineSpecs,
  ReferenceNodeConfig,
  RichText,
  getPulsarInlineSpecsWithReference,
} from '@pulsar/editor-components/rich-text';
export { toast } from '@pulsar/editor-components/toast';
export {
  type AdvancedMenuItem,
  type FatMenuItems,
  type MenuItem,
  type MenuItemGroup,
  Tooltip,
  groupsToActions,
  renderActions,
  renderGroups,
  renderToolbarSeparator,
} from '@pulsar/editor-components/toolbar';
export * from '@pulsar/model';
export * from '@pulsar/editor-shared/services';
export {
  ColorVariables,
  FontFamilyVariables,
  SizeVariables,
  StyleVariables,
  ThemeObserver,
} from '@pulsar/editor-shared/theme';

export {
  createButtonPopper,
  createDefaultDoc,
  findNoteBlockModel,
  isInsideEdgelessEditor,
  isInsidePageEditor,
  matchFlavours,
  on,
  once,
  openFileOrFiles,
  printToPdf,
} from '@pulsar/editor-shared/utils';

export const BlocksUtils = {
  splitElements,
  matchFlavours,
  deserializeXYWH,
  isCanvasElement,
  Point,
};

const env: Record<string, unknown> =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
      ? window
      : // @ts-ignore
        typeof global !== 'undefined'
        ? // @ts-ignore
          global
        : {};
const importIdentifier = '__ $BLOCKSUITE_BLOCKS$ __';

if (env[importIdentifier] === true) {
  // https://github.com/yjs/yjs/issues/438
  console.error(
    '@pulsar/blocks was already imported. This breaks constructor checks and will lead to issues!'
  );
}

env[importIdentifier] = true;
