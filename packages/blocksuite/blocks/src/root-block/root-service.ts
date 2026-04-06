import type { PeekViewService } from '@pulsar/editor-components/peek';
import type { RefNodeSlots } from '@pulsar/editor-components/rich-text';
import type { EmbedCardStyle } from '@pulsar/model';
import type { BlockComponent } from '@pulsar/block-std';

import { CommunityCanvasTextFonts } from '@pulsar/block-surface';
import { RootBlockSchema } from '@pulsar/model';
import { ThemeObserver } from '@pulsar/editor-shared/theme';
import { BlockService } from '@pulsar/block-std';

import type { NotificationService } from '../_common/components/index.js';
import type { RootBlockComponent } from './types.js';

import {
  FileDropManager,
  type FileDropOptions,
} from '../_common/components/file-drop-manager.js';
import { DEFAULT_IMAGE_PROXY_ENDPOINT } from '../_common/consts.js';
import { ExportManager } from '../_common/export-manager/export-manager.js';
import {
  HtmlTransformer,
  MarkdownTransformer,
  ZipTransformer,
} from '../_common/transformers/index.js';
import { EditPropsStore } from './edgeless/services/edit-session.js';
import { FontLoader } from './font-loader/font-loader.js';

export type EmbedOptions = {
  flavour: string;
  urlRegex: RegExp;
  styles: EmbedCardStyle[];
  viewType: 'card' | 'embed';
};

export abstract class RootService extends BlockService {
  private _exportOptions = {
    imageProxyEndpoint: DEFAULT_IMAGE_PROXY_ENDPOINT,
  };

  private _fileDropOptions: FileDropOptions = {
    flavour: this.flavour,
  };

  static override readonly flavour = RootBlockSchema.model.flavour;

  readonly editPropsStore: EditPropsStore = new EditPropsStore(this);

  readonly exportManager = new ExportManager(this, this._exportOptions);

  readonly fileDropManager = new FileDropManager(this, this._fileDropOptions);

  readonly fontLoader = new FontLoader();

  // implements provided by affine
  notificationService: NotificationService | null = null;

  peekViewService: PeekViewService | null = null;

  readonly themeObserver = ThemeObserver.instance;

  transformers = {
    markdown: MarkdownTransformer,
    html: HtmlTransformer,
    zip: ZipTransformer,
  };

  loadFonts() {
    this.fontLoader.load(CommunityCanvasTextFonts);
  }

  override mounted() {
    super.mounted();

    this.loadFonts();

    this.disposables.addFromEvent(
      this.host,
      'dragover',
      this.fileDropManager.onDragOver
    );

    this.disposables.addFromEvent(
      this.host,
      'dragleave',
      this.fileDropManager.onDragLeave
    );

    this.disposables.add(
      this.std.event.add('pointerDown', ctx => {
        const state = ctx.get('pointerState');
        state.raw.stopPropagation();
      })
    );
  }

  override unmounted() {
    this.editPropsStore.dispose();
    this.fontLoader.clear();
  }

  get selectedBlocks() {
    let result: BlockComponent[] = [];
    this.std.command
      .chain()
      .tryAll(chain => [
        chain.getTextSelection(),
        chain.getImageSelections(),
        chain.getBlockSelections(),
      ])
      .getSelectedBlocks()
      .inline(({ selectedBlocks }) => {
        if (!selectedBlocks) return;
        result = selectedBlocks;
      })
      .run();
    return result;
  }

  get selectedModels() {
    return this.selectedBlocks.map(block => block.model);
  }

  get viewportElement() {
    const rootId = this.std.doc.root?.id;
    if (!rootId) return null;
    const rootComponent = this.std.view.getBlock(
      rootId
    ) as RootBlockComponent | null;
    if (!rootComponent) return null;
    const viewportElement = rootComponent.viewportElement;
    return viewportElement;
  }

  abstract slots: RefNodeSlots;
}

declare global {
  namespace BlockSuite {
    interface BlockServices {
      'pulsar:page': RootService;
    }
  }
}
