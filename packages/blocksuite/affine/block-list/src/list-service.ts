import type { BlockComponent } from '@pulsar/block-std';

import {
  type PulsarTextAttributes,
  InlineManager,
  ReferenceNodeConfig,
  affineInlineMarkdownMatches,
  getPulsarInlineSpecsWithReference,
  textKeymap,
} from '@pulsar/editor-components/rich-text';
import { ListBlockSchema } from '@pulsar/model';
import { matchFlavours } from '@pulsar/editor-shared/utils';
import { BlockService } from '@pulsar/block-std';

import { correctNumberedListsOrderToPrev } from './commands/utils.js';
import { listPrefix, toggleStyles } from './styles.js';
import { getListIcon } from './utils/get-list-icon.js';

export class ListBlockService extends BlockService {
  static override readonly flavour = ListBlockSchema.model.flavour;

  readonly inlineManager = new InlineManager<PulsarTextAttributes>();

  readonly referenceNodeConfig = new ReferenceNodeConfig();

  readonly styles = {
    icon: getListIcon,
    prefix: listPrefix,
    toggle: toggleStyles,
  };

  override mounted(): void {
    super.mounted();

    this.referenceNodeConfig.setDoc(this.doc);

    const inlineSpecs = getPulsarInlineSpecsWithReference(
      this.referenceNodeConfig
    );
    this.inlineManager.registerSpecs(inlineSpecs);
    this.inlineManager.registerMarkdownMatches(affineInlineMarkdownMatches);

    this.bindHotKey(textKeymap(this.std));
    const rootId = this.std.doc.root?.id;
    if (!rootId) return;

    requestAnimationFrame(() => {
      const widget = this.host.view.getWidget(
        'pulsar-drag-handle-widget',
        rootId
      );
      if (!widget) return;
      this.disposables.add(
        // @ts-expect-error TODO: fix after migrate drag handle widget to a standalone package
        widget.constructor.registerOption({
          flavour: ListBlockSchema.model.flavour,
          onDragEnd: ({
            draggingElements,
          }: {
            draggingElements: BlockComponent[];
          }) => {
            draggingElements.forEach((el: BlockComponent) => {
              const model = el.model;
              const doc = el.doc;
              if (
                matchFlavours(model, ['pulsar:list']) &&
                model.type === 'numbered'
              ) {
                const next = el.doc.getNext(model);
                this.host.updateComplete
                  .then(() => {
                    correctNumberedListsOrderToPrev(doc, model);
                    if (next) {
                      correctNumberedListsOrderToPrev(doc, next);
                    }
                  })
                  .catch(console.error);
              }
            });
            return false;
          },
        })
      );
    });
  }
}
