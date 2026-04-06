import { PulsarSchemas } from '@pulsar/blocks/schemas';
import { DocCollection, Schema } from '@pulsar/store';

export function createEmptyDoc() {
  const schema = new Schema().register(PulsarSchemas);
  const collection = new DocCollection({ schema });
  collection.meta.initialize();
  const doc = collection.createDoc();

  return {
    doc,
    init() {
      doc.load();
      const rootId = doc.addBlock('pulsar:page', {});
      doc.addBlock('pulsar:surface', {}, rootId);
      const noteId = doc.addBlock('pulsar:note', {}, rootId);
      doc.addBlock('pulsar:paragraph', {}, noteId);
      return doc;
    },
  };
}
