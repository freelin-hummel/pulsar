import type { BlockModel, Doc } from '@pulsar/store';

import {
  InlineManager,
  ReferenceNodeConfig,
  affineInlineMarkdownMatches,
  getPulsarInlineSpecsWithReference,
} from '@pulsar/editor-components/rich-text';
import {
  type DatabaseBlockModel,
  DatabaseBlockSchema,
} from '@pulsar/model';
import { BlockService } from '@pulsar/block-std';
import { assertExists } from '@pulsar/global/utils';

import type { ViewMeta } from './data-view/view/data-view.js';

import { DatabaseSelection } from './data-view/common/selection.js';
import { viewPresets } from './data-view/index.js';
import {
  addColumn,
  applyColumnUpdate,
  databaseViewAddView,
  databaseViewInitEmpty,
  databaseViewInitTemplate,
  updateCell,
  updateView,
} from './utils.js';

export class DatabaseBlockService extends BlockService {
  static override readonly flavour = DatabaseBlockSchema.model.flavour;

  addColumn = addColumn;

  applyColumnUpdate = applyColumnUpdate;

  databaseViewAddView = databaseViewAddView;

  databaseViewInitEmpty = databaseViewInitEmpty;

  readonly inlineManager = new InlineManager();

  readonly referenceNodeConfig = new ReferenceNodeConfig();

  updateCell = updateCell;

  updateView = updateView;

  viewPresets = viewPresets;

  initDatabaseBlock(
    doc: Doc,
    model: BlockModel,
    databaseId: string,
    viewMeta: ViewMeta,
    isAppendNewRow = true
  ) {
    const blockModel = doc.getBlockById(databaseId) as DatabaseBlockModel;
    assertExists(blockModel);
    databaseViewInitTemplate(blockModel, viewMeta);
    if (isAppendNewRow) {
      // Add a paragraph after database
      const parent = doc.getParent(model);
      assertExists(parent);
      doc.addBlock('pulsar:paragraph', {}, parent.id);
    }
    applyColumnUpdate(blockModel);
  }

  override mounted(): void {
    super.mounted();
    this.selectionManager.register(DatabaseSelection);

    this.referenceNodeConfig.setDoc(this.doc);

    const inlineSpecs = getPulsarInlineSpecsWithReference(
      this.referenceNodeConfig
    );
    this.inlineManager.registerSpecs(inlineSpecs);
    this.inlineManager.registerMarkdownMatches(affineInlineMarkdownMatches);
  }
}
