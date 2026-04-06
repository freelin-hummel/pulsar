import { FrameBlockSchema } from '@pulsar/model';
import { BlockService } from '@pulsar/block-std';

export class FrameBlockService extends BlockService {
  static override readonly flavour = FrameBlockSchema.model.flavour;
}
