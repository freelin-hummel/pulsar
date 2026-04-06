import { EmbedHtmlBlockSchema } from '@pulsar/model';
import { BlockService } from '@pulsar/block-std';

export class EmbedHtmlBlockService extends BlockService {
  static override readonly flavour = EmbedHtmlBlockSchema.model.flavour;
}
