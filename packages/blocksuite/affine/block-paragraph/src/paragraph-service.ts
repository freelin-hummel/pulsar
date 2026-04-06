import {
  type PulsarTextAttributes,
  InlineManager,
  ReferenceNodeConfig,
  affineInlineMarkdownMatches,
  getPulsarInlineSpecsWithReference,
  textKeymap,
} from '@pulsar/editor-components/rich-text';
import {
  type ParagraphBlockModel,
  ParagraphBlockSchema,
} from '@pulsar/model';
import { BlockService } from '@pulsar/block-std';

export class ParagraphBlockService extends BlockService {
  static override readonly flavour = ParagraphBlockSchema.model.flavour;

  readonly inlineManager = new InlineManager<PulsarTextAttributes>();

  placeholderGenerator: (model: ParagraphBlockModel) => string = model => {
    if (model.type === 'text') {
      return "Type '/' for commands";
    }

    const placeholders = {
      h1: 'Heading 1',
      h2: 'Heading 2',
      h3: 'Heading 3',
      h4: 'Heading 4',
      h5: 'Heading 5',
      h6: 'Heading 6',
      quote: '',
    };
    return placeholders[model.type];
  };

  readonly referenceNodeConfig = new ReferenceNodeConfig();

  override mounted(): void {
    super.mounted();

    this.bindHotKey(textKeymap(this.std));
    this.referenceNodeConfig.setDoc(this.doc);

    const inlineSpecs = getPulsarInlineSpecsWithReference(
      this.referenceNodeConfig
    );
    this.inlineManager.registerSpecs(inlineSpecs);
    this.inlineManager.registerMarkdownMatches(affineInlineMarkdownMatches);
  }
}
