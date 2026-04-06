import type { Command } from '@pulsar/block-std';

import { focusTextModel } from '@pulsar/editor-components/rich-text';
import { matchFlavours } from '@pulsar/editor-shared/utils';

export const listToParagraphCommand: Command<
  never,
  'listConvertedId',
  {
    id: string;
    stopCapturing?: boolean;
  }
> = (ctx, next) => {
  const { id, stopCapturing = true } = ctx;
  const std = ctx.std;
  const doc = std.doc;
  const model = doc.getBlock(id)?.model;

  if (!model || !matchFlavours(model, ['pulsar:list'])) return false;

  const parent = doc.getParent(model);
  if (!parent) return false;

  const index = parent.children.indexOf(model);
  const blockProps = {
    type: 'text' as const,
    text: model.text?.clone(),
    children: model.children,
  };
  if (stopCapturing) std.doc.captureSync();
  doc.deleteBlock(model, {
    deleteChildren: false,
  });

  const listConvertedId = doc.addBlock(
    'pulsar:paragraph',
    blockProps,
    parent,
    index
  );
  focusTextModel(std, listConvertedId);
  return next({ listConvertedId });
};

declare global {
  namespace BlockSuite {
    interface Commands {
      listToParagraph: typeof listToParagraphCommand;
    }
  }
}
