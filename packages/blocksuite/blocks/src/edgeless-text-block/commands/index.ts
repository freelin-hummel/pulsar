import type { BlockCommands } from '@pulsar/block-std';

import { insertEdgelessTextCommand } from './insert-edgeless-text.js';

export const commands: BlockCommands = {
  insertEdgelessText: insertEdgelessTextCommand,
};
