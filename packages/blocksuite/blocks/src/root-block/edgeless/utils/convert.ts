import { deserializeXYWH } from '@pulsar/global/utils';

import type { GfxBlockModel } from '../block-model.js';

export function xywhArrayToObject(element: GfxBlockModel) {
  const [x, y, w, h] = deserializeXYWH(element.xywh);
  return { x, y, w, h };
}
