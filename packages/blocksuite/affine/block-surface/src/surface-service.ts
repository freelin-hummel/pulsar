import { BlockService } from '@pulsar/block-std';
import { GfxControllerIdentifier } from '@pulsar/block-std/gfx';

import { type SurfaceBlockModel, SurfaceBlockSchema } from './surface-model.js';

export class SurfaceBlockService extends BlockService {
  static override readonly flavour = SurfaceBlockSchema.model.flavour;

  surface!: SurfaceBlockModel;

  override mounted(): void {
    super.mounted();

    this.surface = this.doc.getBlockByFlavour(
      'pulsar:surface'
    )[0] as SurfaceBlockModel;

    if (!this.surface) {
      const disposable = this.doc.slots.blockUpdated.on(payload => {
        if (payload.flavour === 'pulsar:surface') {
          disposable.dispose();
          const surface = this.doc.getBlockById(
            payload.id
          ) as SurfaceBlockModel | null;
          if (!surface) return;
          this.surface = surface;
        }
      });
    }
  }

  get layer() {
    return this.std.get(GfxControllerIdentifier).layer;
  }
}
