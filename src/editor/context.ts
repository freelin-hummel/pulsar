import { createContext, useContext } from 'react'
import type { PulsarEditorContainer } from '@pulsar/presets'
import type { Doc, DocCollection } from '@pulsar/store'

export interface EditorContextValue {
  editor: PulsarEditorContainer
  collection: DocCollection
  doc: Doc
}

export const EditorContext = createContext<EditorContextValue | null>(null)

export function useEditorContext(): EditorContextValue | null {
  return useContext(EditorContext)
}
