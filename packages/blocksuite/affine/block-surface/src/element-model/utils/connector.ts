import type { GfxModel } from '@pulsar/block-std/gfx';

import { ConnectorElementModel } from '@pulsar/model';

export function isConnectorWithLabel(
  model: GfxModel | BlockSuite.SurfaceLocalModel
) {
  return model instanceof ConnectorElementModel && model.hasLabel();
}
