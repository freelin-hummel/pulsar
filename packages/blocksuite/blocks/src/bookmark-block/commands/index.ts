import type { BlockCommands } from '@pulsar/block-std';

import { insertBookmarkCommand } from './insert-bookmark.js';

export const commands: BlockCommands = {
  insertBookmark: insertBookmarkCommand,
};
