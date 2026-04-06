/**
 * Map Pulsar tool IDs to BlockSuite EdgelessTool objects.
 *
 * Extracted to a separate module so it can be tested directly
 * without triggering react-refresh/only-export-components.
 */

export type Tool =
  | 'select'
  | 'hand'
  | 'rect'
  | 'ellipse'
  | 'text'
  | 'pen'
  | 'note'
  | 'image'
  | 'line'

export function toEdgelessTool(tool: Tool): Record<string, unknown> | null {
  switch (tool) {
    case 'select':
      return { type: 'default' }
    case 'hand':
      return { type: 'pan', panning: true }
    case 'rect':
      return { type: 'shape', shapeName: 'rect' }
    case 'ellipse':
      return { type: 'shape', shapeName: 'ellipse' }
    case 'line':
      return { type: 'connector', mode: 0 }
    case 'pen':
      return { type: 'brush' }
    case 'text':
      return { type: 'text' }
    case 'note':
      return { type: 'affine:note', childFlavour: 'pulsar:paragraph', childType: 'text', tip: 'Note' }
    case 'image':
      // Image insertion is handled by triggering a file input, not a tool switch
      return null
    default:
      return { type: 'default' }
  }
}
