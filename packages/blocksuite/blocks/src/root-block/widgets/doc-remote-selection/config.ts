import type { BlockModel } from '@pulsar/store';

export type DocRemoteSelectionConfig = {
  blockSelectionBackgroundTransparent: (block: BlockModel) => boolean;
};
