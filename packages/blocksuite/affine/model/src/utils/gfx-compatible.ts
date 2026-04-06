import type { Constructor } from '@pulsar/global/utils';
import type { SerializedXYWH } from '@pulsar/global/utils';

import { GfxBlockElementModel } from '@pulsar/block-std/gfx';
import { BlockModel } from '@pulsar/store';

export type GfxCompatibleProps = {
  xywh: SerializedXYWH;
  index: string;
};

export function GfxCompatible<
  Props extends GfxCompatibleProps,
  T extends Constructor<BlockModel<Props>> = Constructor<BlockModel<Props>>,
>(BlockModelSuperClass: T) {
  if (BlockModelSuperClass === BlockModel) {
    return GfxBlockElementModel as unknown as typeof GfxBlockElementModel<Props>;
  } else {
    let currentClass = BlockModelSuperClass;

    while (
      Object.getPrototypeOf(currentClass.prototype) !== BlockModel.prototype &&
      Object.getPrototypeOf(currentClass.prototype) !== null
    ) {
      currentClass = Object.getPrototypeOf(currentClass.prototype).constructor;
    }

    if (Object.getPrototypeOf(currentClass.prototype) === null) {
      throw new Error('The SuperClass is not a subclass of BlockModel');
    }

    Object.setPrototypeOf(
      currentClass.prototype,
      GfxBlockElementModel.prototype
    );
  }

  return BlockModelSuperClass as unknown as typeof GfxBlockElementModel<Props>;
}
