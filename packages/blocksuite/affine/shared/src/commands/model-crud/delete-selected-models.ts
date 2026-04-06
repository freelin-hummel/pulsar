import type { Command } from '@pulsar/block-std';

import { assertExists } from '@pulsar/global/utils';

export const deleteSelectedModelsCommand: Command<'selectedModels'> = (
  ctx,
  next
) => {
  const models = ctx.selectedModels;
  assertExists(
    models,
    '`selectedModels` is required, you need to use `getSelectedModels` command before adding this command to the pipeline.'
  );

  models.forEach(model => {
    ctx.std.doc.deleteBlock(model);
  });

  return next();
};

declare global {
  namespace BlockSuite {
    interface Commands {
      deleteSelectedModels: typeof deleteSelectedModelsCommand;
    }
  }
}
