import { EmbedLinkedDocBlockSchema } from '@pulsar/model';
import { BlockService } from '@pulsar/block-std';

export class EmbedLinkedDocBlockService extends BlockService {
  static override readonly flavour = EmbedLinkedDocBlockSchema.model.flavour;
}
