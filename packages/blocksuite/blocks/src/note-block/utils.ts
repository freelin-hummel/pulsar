import type { BlockComponent } from '@pulsar/block-std';

export const ensureBlockInContainer = (
  block: BlockComponent,
  containerElement: BlockComponent
) => containerElement.contains(block) && block !== containerElement;
