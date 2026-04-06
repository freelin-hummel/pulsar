import type { Command } from '@pulsar/block-std';

import { focusTextModel } from '@pulsar/editor-components/rich-text';
import { getLastNoteBlock } from '@pulsar/editor-shared/utils';

/**
 * Append a paragraph block at the end of the whole page.
 */
export const appendParagraphCommand: Command<
  never,
  never,
  { text?: string }
> = (ctx, next) => {
  const { std, text = '' } = ctx;
  const { doc } = std;
  if (!doc.root) return;

  const note = getLastNoteBlock(doc);
  let noteId = note?.id;
  if (!noteId) {
    noteId = doc.addBlock('pulsar:note', {}, doc.root.id);
  }
  const id = doc.addBlock(
    'pulsar:paragraph',
    { text: new doc.Text(text) },
    noteId
  );

  focusTextModel(std, id, text.length);
  next();
};

declare global {
  namespace BlockSuite {
    interface Commands {
      appendParagraph: typeof appendParagraphCommand;
    }
  }
}
