import type { BlockCommands } from '@pulsar/block-std';

import { getImageSelectionsCommand } from '@pulsar/editor-shared/commands';

export const commands: BlockCommands = {
  getImageSelections: getImageSelectionsCommand,
};
