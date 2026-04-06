import type { DocCollection } from '@pulsar/store';

export function createDefaultDoc(
  collection: DocCollection,
  options: { id?: string; title?: string } = {}
) {
  const doc = collection.createDoc({ id: options.id });

  doc.load();
  const title = options.title ?? '';
  const rootId = doc.addBlock('pulsar:page', {
    title: new doc.Text(title),
  });
  collection.setDocMeta(doc.id, {
    title,
  });

  // @ts-ignore FIXME: will be fixed when surface model migrated to affine-model
  doc.addBlock('pulsar:surface', {}, rootId);
  const noteId = doc.addBlock('pulsar:note', {}, rootId);
  doc.addBlock('pulsar:paragraph', {}, noteId);
  // To make sure the content of new doc would not be clear
  // By undo operation for the first time
  doc.resetHistory();

  return doc;
}
