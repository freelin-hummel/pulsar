import { EmbedSyncedDocBlockSchema } from '@pulsar/model';
import { BlockService } from '@pulsar/block-std';

export class EmbedSyncedDocBlockService extends BlockService {
  static override readonly flavour = EmbedSyncedDocBlockSchema.model.flavour;
}
