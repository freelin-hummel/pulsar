import { PulsarEditorContainer } from '@pulsar/presets'
import { Doc, Schema } from '@pulsar/store'
import { DocCollection } from '@pulsar/store'
import { PulsarSchemas } from '@pulsar/blocks'
import '@pulsar/presets/themes/pulsar.css'

export interface EditorInstance {
  editor: PulsarEditorContainer
  collection: DocCollection
  doc: Doc
}

/**
 * Initialize a BlockSuite editor in edgeless (canvas/whiteboard) mode.
 *
 * Creates a DocCollection, a Doc with the required block structure,
 * and a PulsarEditorContainer configured for edgeless editing.
 */
export function initEditor(docId = 'page1'): EditorInstance {
  const schema = new Schema().register(PulsarSchemas)
  const collection = new DocCollection({ schema })
  collection.meta.initialize()

  const doc = collection.createDoc({ id: docId })
  doc.load(() => {
    const pageBlockId = doc.addBlock('pulsar:page', {})
    doc.addBlock('pulsar:surface', {}, pageBlockId)
    const noteId = doc.addBlock('pulsar:note', {}, pageBlockId)
    doc.addBlock('pulsar:paragraph', {}, noteId)
  })

  const editor = new PulsarEditorContainer()
  editor.doc = doc
  // Default to edgeless (canvas) mode for the VTT whiteboard experience
  editor.mode = 'edgeless'

  return { editor, collection, doc }
}
