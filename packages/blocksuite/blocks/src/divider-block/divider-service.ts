import { DividerBlockSchema } from '@pulsar/model';
import { BlockService } from '@pulsar/block-std';

export class DividerBlockService extends BlockService {
  static override readonly flavour = DividerBlockSchema.model.flavour;
}
