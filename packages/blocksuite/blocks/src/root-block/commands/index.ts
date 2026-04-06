import type { BlockCommands } from '@pulsar/block-std';

import {
  getSelectedPeekableBlocksCommand,
  peekSelectedBlockCommand,
} from '@pulsar/editor-components/peek';
import { textCommands } from '@pulsar/editor-components/rich-text';
import {
  copySelectedModelsCommand,
  deleteSelectedModelsCommand,
  draftSelectedModelsCommand,
  getSelectedModelsCommand,
} from '@pulsar/editor-shared/commands';

export const commands: BlockCommands = {
  // models
  copySelectedModels: copySelectedModelsCommand,
  deleteSelectedModels: deleteSelectedModelsCommand,
  draftSelectedModels: draftSelectedModelsCommand,
  getSelectedModels: getSelectedModelsCommand,
  // text
  ...textCommands,
  // peekable
  peekSelectedBlock: peekSelectedBlockCommand,
  getSelectedPeekableBlocks: getSelectedPeekableBlocksCommand,
};
