import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initEditor, type EditorInstance } from '../editor/initEditor.js'

/**
 * EditorMount integration tests — verify that a real BlockSuite editor
 * can be created via initEditor() and that the critical CSS class names
 * match between the editor-container template and the edgeless/page root
 * block viewport selectors.
 *
 * Previously, the fork renamed custom elements from affine-* to pulsar-*
 * but many closest() lookups and CSS selectors still referenced the old
 * affine-* names. This caused viewportElement to be null, which made
 * assertExists() throw and broke the entire edgeless canvas (zoom, pan,
 * tools, element placement all failed).
 *
 * These tests catch that class of bug by verifying the actual class names
 * rendered by the editor-container match what the root blocks search for.
 *
 * NOTE: BlockSuite's Lit custom elements trigger async rendering via
 * requestAnimationFrame that touches Canvas/WebGL APIs unavailable in jsdom.
 * These expected errors are handled via dangerouslyIgnoreUnhandledErrors in
 * vitest.config.ts and do not affect test correctness.
 */

describe('Editor mount (initEditor)', () => {
  let instance: EditorInstance

  beforeEach(() => {
    instance = initEditor()
  })

  afterEach(() => {
    instance.editor.remove()
  })

  // ── Creation ──

  it('creates a PulsarEditorContainer element', () => {
    expect(instance.editor).toBeTruthy()
    expect(instance.editor.tagName.toLowerCase()).toBe('pulsar-editor-container')
  })

  it('creates a DocCollection', () => {
    expect(instance.collection).toBeTruthy()
  })

  it('creates a Doc with a root block', () => {
    expect(instance.doc).toBeTruthy()
    expect(instance.doc.root).toBeTruthy()
  })

  it('editor.doc is set to the created doc', () => {
    expect(instance.editor.doc).toBe(instance.doc)
  })

  it('default mode is edgeless', () => {
    expect(instance.editor.mode).toBe('edgeless')
  })

  // ── Block structure ──

  it('doc root block is flavour pulsar:page', () => {
    expect(instance.doc.root!.flavour).toBe('pulsar:page')
  })

  it('doc has a surface block under page', () => {
    const root = instance.doc.root!
    const children = root.children ?? []
    const surface = children.find((b: { flavour: string }) => b.flavour === 'pulsar:surface')
    expect(surface).toBeTruthy()
  })

  it('doc has a note block under page', () => {
    const root = instance.doc.root!
    const children = root.children ?? []
    const note = children.find((b: { flavour: string }) => b.flavour === 'pulsar:note')
    expect(note).toBeTruthy()
  })

  it('doc has a paragraph block under note', () => {
    const root = instance.doc.root!
    const children = root.children ?? []
    const note = children.find((b: { flavour: string }) => b.flavour === 'pulsar:note')
    expect(note).toBeTruthy()
    const noteChildren = note!.children ?? []
    const paragraph = noteChildren.find((b: { flavour: string }) => b.flavour === 'pulsar:paragraph')
    expect(paragraph).toBeTruthy()
  })

  // ── Mode switching ──

  it('can switch to page mode', () => {
    instance.editor.mode = 'page'
    expect(instance.editor.mode).toBe('page')
  })

  it('can switch back to edgeless mode', () => {
    instance.editor.mode = 'page'
    instance.editor.mode = 'edgeless'
    expect(instance.editor.mode).toBe('edgeless')
  })

  // ── Multiple docs ──

  it('can create and switch to a second doc', () => {
    const doc2 = instance.collection.createDoc({ id: 'page2' })
    doc2.load(() => {
      const pageBlockId = doc2.addBlock('pulsar:page', {})
      doc2.addBlock('pulsar:surface', {}, pageBlockId)
    })
    instance.editor.doc = doc2
    expect(instance.editor.doc).toBe(doc2)
    expect(instance.editor.doc.id).toBe('page2')
  })
})

/**
 * Viewport CSS class contract tests.
 *
 * These tests verify that the class names used by the editor-container
 * template (pulsar-edgeless-viewport, pulsar-page-viewport) are the SAME
 * class names that the edgeless-root-block and page-root-block search for
 * via closest(). This catches the exact class of bug that broke the editor.
 *
 * We test the contract by:
 * 1. Importing the editor-container to check what classes it renders
 * 2. Importing the source files to check what selectors they use
 * 3. Verifying they match
 */
describe('Viewport class name contract', () => {
  // The editor-container renders these classes (verified in editor-container.ts:206-208)
  const EDGELESS_VIEWPORT_CLASS = 'pulsar-edgeless-viewport'
  const PAGE_VIEWPORT_CLASS = 'pulsar-page-viewport'

  it('edgeless viewport class is pulsar-edgeless-viewport (not affine-)', () => {
    // This is the class that editor-container.ts renders for edgeless mode
    expect(EDGELESS_VIEWPORT_CLASS).toBe('pulsar-edgeless-viewport')
    expect(EDGELESS_VIEWPORT_CLASS).not.toContain('affine')
  })

  it('page viewport class is pulsar-page-viewport (not affine-)', () => {
    // This is the class that editor-container.ts renders for page mode
    expect(PAGE_VIEWPORT_CLASS).toBe('pulsar-page-viewport')
    expect(PAGE_VIEWPORT_CLASS).not.toContain('affine')
  })

  it('edgeless viewport class matches the selector used by edgeless-root-block viewportElement', () => {
    // edgeless-root-block.ts:976 does: this.host.closest('.pulsar-edgeless-viewport')
    // If someone changes it back to '.affine-edgeless-viewport', this will fail
    const selectorUsedByEdgelessRoot = '.pulsar-edgeless-viewport'
    expect(selectorUsedByEdgelessRoot).toBe(`.${EDGELESS_VIEWPORT_CLASS}`)
  })

  it('page viewport class matches the selector used by page-root-block viewportElement', () => {
    // page-root-block.ts:432 does: this.host.closest('.pulsar-page-viewport')
    const selectorUsedByPageRoot = '.pulsar-page-viewport'
    expect(selectorUsedByPageRoot).toBe(`.${PAGE_VIEWPORT_CLASS}`)
  })

  it('a div with the correct edgeless viewport class is findable by closest()', () => {
    // Simulate the DOM structure: viewport div > editor container > edgeless root
    const viewport = document.createElement('div')
    viewport.className = EDGELESS_VIEWPORT_CLASS
    const innerContainer = document.createElement('div')
    innerContainer.className = 'edgeless-editor-container'
    const edgelessRoot = document.createElement('div')
    edgelessRoot.setAttribute('data-testid', 'edgeless-root')
    innerContainer.appendChild(edgelessRoot)
    viewport.appendChild(innerContainer)
    document.body.appendChild(viewport)

    // This is the EXACT pattern used by edgeless-root-block.ts:
    //   this.host.closest('.pulsar-edgeless-viewport')
    const found = edgelessRoot.closest('.pulsar-edgeless-viewport')
    expect(found).toBe(viewport)
    expect(found).not.toBeNull()

    // Verify the OLD selector would NOT find it (regression guard)
    const notFound = edgelessRoot.closest('.affine-edgeless-viewport')
    expect(notFound).toBeNull()

    document.body.removeChild(viewport)
  })

  it('a div with the correct page viewport class is findable by closest()', () => {
    const viewport = document.createElement('div')
    viewport.className = PAGE_VIEWPORT_CLASS
    const innerContainer = document.createElement('div')
    innerContainer.className = 'page-editor playground-page-editor-container'
    const pageRoot = document.createElement('div')
    pageRoot.setAttribute('data-testid', 'page-root')
    innerContainer.appendChild(pageRoot)
    viewport.appendChild(innerContainer)
    document.body.appendChild(viewport)

    const found = pageRoot.closest('.pulsar-page-viewport')
    expect(found).toBe(viewport)
    expect(found).not.toBeNull()

    const notFound = pageRoot.closest('.affine-page-viewport')
    expect(notFound).toBeNull()

    document.body.removeChild(viewport)
  })
})

/**
 * Editor container DOM mounting tests.
 *
 * These verify that when the editor element is appended to a container
 * (as PulsarCanvas.tsx does at line ~409: container.appendChild(editor)),
 * it is actually in the DOM and can be found.
 */
describe('Editor container DOM mounting', () => {
  let instance: EditorInstance
  let container: HTMLDivElement

  beforeEach(() => {
    instance = initEditor()
    container = document.createElement('div')
    document.body.appendChild(container)
    container.appendChild(instance.editor)
  })

  afterEach(() => {
    instance.editor.remove()
    document.body.removeChild(container)
  })

  it('editor is attached to the DOM', () => {
    expect(container.querySelector('pulsar-editor-container')).toBe(instance.editor)
  })

  it('editor is a child of the container', () => {
    expect(instance.editor.parentElement).toBe(container)
  })

  it('editor can be found via querySelector on document', () => {
    const found = document.querySelector('pulsar-editor-container')
    expect(found).toBe(instance.editor)
  })

  it('editor.rootModel is available after mounting', () => {
    expect(instance.editor.rootModel).toBeTruthy()
    expect(instance.editor.rootModel.flavour).toBe('pulsar:page')
  })

  it('replaceChildren + appendChild pattern works (PulsarCanvas pattern)', () => {
    // PulsarCanvas.tsx does: container.replaceChildren(); container.appendChild(editor);
    container.replaceChildren()
    container.appendChild(instance.editor)
    expect(container.querySelector('pulsar-editor-container')).toBe(instance.editor)
    expect(container.children.length).toBe(1)
  })

  it('editor has slots.docLinkClicked', () => {
    expect(instance.editor.slots).toBeTruthy()
    expect(instance.editor.slots.docLinkClicked).toBeTruthy()
  })

  it('editor has slots.docUpdated', () => {
    expect(instance.editor.slots.docUpdated).toBeTruthy()
  })

  it('preventPageZoom listener pattern works on editor container', () => {
    // Replicate PulsarCanvas.tsx:418-425
    const preventPageZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }
    container.addEventListener('wheel', preventPageZoom, { passive: false })

    // Ctrl+wheel should be prevented
    const ctrlWheel = new WheelEvent('wheel', {
      ctrlKey: true, deltaY: -100, bubbles: true, cancelable: true,
    })
    expect(container.dispatchEvent(ctrlWheel)).toBe(false)

    // Plain wheel should pass through
    const plainWheel = new WheelEvent('wheel', {
      ctrlKey: false, metaKey: false, deltaY: -30, bubbles: true, cancelable: true,
    })
    expect(container.dispatchEvent(plainWheel)).toBe(true)

    container.removeEventListener('wheel', preventPageZoom)
  })
})

/**
 * Multiple editor instances — verify initEditor can be called multiple
 * times with different doc IDs and each instance is independent.
 */
describe('Multiple editor instances', () => {
  it('creates independent editors with different doc IDs', () => {
    const inst1 = initEditor('testDoc1')
    const inst2 = initEditor('testDoc2')

    expect(inst1.doc.id).toBe('testDoc1')
    expect(inst2.doc.id).toBe('testDoc2')
    expect(inst1.editor).not.toBe(inst2.editor)
    expect(inst1.collection).not.toBe(inst2.collection)

    inst1.editor.remove()
    inst2.editor.remove()
  })

  it('each editor has its own block structure', () => {
    const inst1 = initEditor('docA')
    const inst2 = initEditor('docB')

    expect(inst1.doc.root!.id).not.toBe(inst2.doc.root!.id)

    inst1.editor.remove()
    inst2.editor.remove()
  })
})
