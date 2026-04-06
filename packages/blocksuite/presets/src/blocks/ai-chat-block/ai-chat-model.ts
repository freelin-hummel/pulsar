import type { SerializedXYWH } from '@pulsar/global/utils';

import { GfxCompatible } from '@pulsar/block-std/gfx';
import { BlockModel, defineBlockSchema } from '@pulsar/store';

type AIChatProps = {
  xywh: SerializedXYWH;
  index: string;
  scale: number;
  messages: string; // JSON string of ChatMessage[]
  sessionId: string; // forked session id
  rootWorkspaceId: string; // workspace id of root chat session
  rootDocId: string; // doc id of root chat session
};

export const AIChatBlockSchema = defineBlockSchema({
  flavour: 'pulsar:embed-ai-chat',
  props: (): AIChatProps => ({
    xywh: '[0,0,0,0]',
    index: 'a0',
    scale: 1,
    messages: '',
    sessionId: '',
    rootWorkspaceId: '',
    rootDocId: '',
  }),
  metadata: {
    version: 1,
    role: 'content',
    children: [],
  },
  toModel: () => {
    return new AIChatBlockModel();
  },
});

export class AIChatBlockModel extends GfxCompatible<AIChatProps>(BlockModel) {}

declare global {
  namespace BlockSuite {
    interface EdgelessBlockModelMap {
      'pulsar:embed-ai-chat': AIChatBlockModel;
    }
    interface BlockModels {
      'pulsar:embed-ai-chat': AIChatBlockModel;
    }
  }
}
