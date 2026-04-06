import { noop } from '@pulsar/global/utils';

import type { EmbedYoutubeBlockService } from './embed-youtube-service.js';

import { EmbedYoutubeBlockComponent } from './embed-youtube-block.js';
noop(EmbedYoutubeBlockComponent);

export * from './embed-youtube-block.js';
export * from './embed-youtube-model.js';
export * from './embed-youtube-service.js';
export * from './embed-youtube-spec.js';

declare global {
  namespace BlockSuite {
    interface BlockServices {
      'pulsar:embed-youtube': EmbedYoutubeBlockService;
    }
  }
}
