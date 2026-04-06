import type { ImageBlockService } from './image-service.js';

export * from './image-block.js';
export * from './image-edgeless-block.js';
export * from './image-service.js';
export { ImageSelection } from '@pulsar/editor-shared/selection';

declare global {
  namespace BlockSuite {
    interface BlockServices {
      'pulsar:image': ImageBlockService;
    }
  }
}
