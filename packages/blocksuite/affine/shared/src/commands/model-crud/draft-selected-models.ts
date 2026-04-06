import type { Command } from '@pulsar/block-std';
import type { BlockModel } from '@pulsar/store';

import { type DraftModel, toDraftModel } from '@pulsar/store';

export const draftSelectedModelsCommand: Command<
  'selectedModels',
  'draftedModels'
> = (ctx, next) => {
  const models = ctx.selectedModels;
  if (!models) {
    console.error(
      '`selectedModels` is required, you need to use `getSelectedModels` command before adding this command to the pipeline.'
    );
    return;
  }

  const draftedModelsPromise = new Promise<DraftModel[]>(resolve => {
    const draftedModels = models.map(toDraftModel);

    const modelMap = new Map(draftedModels.map(model => [model.id, model]));

    const traverse = (model: DraftModel) => {
      const isDatabase = model.flavour === 'pulsar:database';
      const children = isDatabase
        ? model.children
        : model.children.filter(child => modelMap.has(child.id));

      children.forEach(child => {
        modelMap.delete(child.id);
        traverse(child);
      });
      model.children = children;
    };

    draftedModels.forEach(traverse);

    const remainingDraftedModels = Array.from(modelMap.values());

    resolve(remainingDraftedModels);
  });

  return next({ draftedModels: draftedModelsPromise });
};

declare global {
  namespace BlockSuite {
    interface CommandContext {
      draftedModels?: Promise<DraftModel<BlockModel<object>>[]>;
    }

    interface Commands {
      draftSelectedModels: typeof draftSelectedModelsCommand;
    }
  }
}
