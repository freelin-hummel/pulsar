import { createContext, useContext } from 'react'
import type { AffineEditorContainer } from '@blocksuite/presets'
import type { Doc, DocCollection } from '@blocksuite/store'

export interface EditorContextValue {
  editor: AffineEditorContainer
  collection: DocCollection
  doc: Doc
}

export const EditorContext = createContext<EditorContextValue | null>(null)

export function useEditorContext(): EditorContextValue | null {
  return useContext(EditorContext)
}
