import { LatexBlockSchema } from '@pulsar/model';
import { BlockService } from '@pulsar/block-std';

export class LatexBlockService extends BlockService {
  static override readonly flavour = LatexBlockSchema.model.flavour;
}
