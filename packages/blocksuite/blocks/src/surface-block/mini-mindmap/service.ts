import { RootBlockSchema } from '@pulsar/model';
import { BlockService } from '@pulsar/block-std';
import { Slot } from '@pulsar/store';

export class MindmapService extends BlockService {
  static override readonly flavour = RootBlockSchema.model.flavour;

  requestCenter = new Slot();

  center() {
    this.requestCenter.emit();
  }

  override mounted(): void {}
}
