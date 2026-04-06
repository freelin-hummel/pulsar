import type { EditorHost } from '@pulsar/block-std';

export interface EmbedLinkedDocBlockConfig {
  handleClick?: (e: MouseEvent, host: EditorHost) => void;
  handleDoubleClick?: (e: MouseEvent, host: EditorHost) => void;
}

declare global {
  namespace BlockSuite {
    interface BlockConfigs {
      'pulsar:embed-linked-doc': EmbedLinkedDocBlockConfig;
    }
  }
}
