import { EmbedFigmaBlockSchema } from '@pulsar/model';
import { EmbedFigmaStyles } from '@pulsar/model';
import { EmbedOptionProvider } from '@pulsar/editor-shared/services';
import { BlockService } from '@pulsar/block-std';

import { figmaUrlRegex } from './embed-figma-model.js';

export class EmbedFigmaBlockService extends BlockService {
  static override readonly flavour = EmbedFigmaBlockSchema.model.flavour;

  override mounted() {
    super.mounted();

    this.std.get(EmbedOptionProvider).registerEmbedBlockOptions({
      flavour: this.flavour,
      urlRegex: figmaUrlRegex,
      styles: EmbedFigmaStyles,
      viewType: 'embed',
    });
  }
}
