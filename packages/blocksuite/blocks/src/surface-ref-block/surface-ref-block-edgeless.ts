import type { SurfaceRefBlockModel } from '@pulsar/model';

import { BlockComponent } from '@pulsar/block-std';
import { nothing } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('pulsar-edgeless-surface-ref')
export class EdgelessSurfaceRefBlockComponent extends BlockComponent<SurfaceRefBlockModel> {
  override render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-edgeless-surface-ref': EdgelessSurfaceRefBlockComponent;
  }
}
