import { BlockComponent } from '@pulsar/block-std';
import { nothing } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { SurfaceBlockModel } from './surface-model.js';
import type { SurfaceBlockService } from './surface-service.js';

@customElement('pulsar-surface-void')
export class SurfaceBlockVoidComponent extends BlockComponent<
  SurfaceBlockModel,
  SurfaceBlockService
> {
  override render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-surface-void': SurfaceBlockVoidComponent;
  }
}
