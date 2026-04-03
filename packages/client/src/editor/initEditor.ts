import { AffineEditorContainer } from '@blocksuite/presets'
import { Doc, Schema } from '@blocksuite/store'
import { DocCollection } from '@blocksuite/store'
import { AffineSchemas } from '@blocksuite/blocks'
import '@blocksuite/presets/themes/affine.css'

export interface EditorInstance {
  editor: AffineEditorContainer
  collection: DocCollection
  doc: Doc
}

/**
 * Initialize a BlockSuite editor in edgeless (canvas/whiteboard) mode.
 *
 * Creates a DocCollection, a Doc with the required block structure,
 * and an AffineEditorContainer configured for edgeless editing.
 */
export function initEditor(docId = 'page1'): EditorInstance {
  const schema = new Schema().register(AffineSchemas)
  const collection = new DocCollection({ schema })
  collection.meta.initialize()

  const doc = collection.createDoc({ id: docId })
  doc.load(() => {
    const pageBlockId = doc.addBlock('affine:page', {})
    doc.addBlock('affine:surface', {}, pageBlockId)
    const noteId = doc.addBlock('affine:note', {}, pageBlockId)
    doc.addBlock('affine:paragraph', {}, noteId)
  })

  const editor = new AffineEditorContainer()
  editor.doc = doc
  // Default to edgeless (canvas) mode for the VTT whiteboard experience
  editor.mode = 'edgeless'

  return { editor, collection, doc }
}
