import { EdgelessTextBlockSchema } from '@pulsar/model';
import { BlockService } from '@pulsar/block-std';

export class EdgelessTextBlockService extends BlockService {
  static override readonly flavour = EdgelessTextBlockSchema.model.flavour;
}

declare global {
  namespace BlockSuite {
    interface BlockServices {
      'pulsar:edgeless-text': EdgelessTextBlockService;
    }
  }
}
