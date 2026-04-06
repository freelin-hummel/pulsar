/**
 * Board type system.
 *
 * A "Board" is the base container for all canvas workspaces.
 * Boards have types (scene, map) and can reference each other
 * in a many-to-many graph (scenes can contain maps and vice-versa).
 */

/** The kind of board */
export type BoardKind = 'scene' | 'map'

/** Edit/view mode for a board */
export type BoardMode = 'edit' | 'view'

/** Role of the current user relative to a board */
export type BoardRole = 'gm' | 'player'

/**
 * Descriptor for a board stored in the board graph.
 * Each board maps 1:1 to a BlockSuite Doc.
 */
export interface BoardDescriptor {
  /** Unique identifier — matches the BlockSuite Doc id */
  id: string
  /** Human-readable label */
  label: string
  /** Board kind determines which tools and rendering are available */
  kind: BoardKind
  /** IDs of boards that contain this one */
  parentRefs: string[]
  /** IDs of boards nested inside this one */
  childRefs: string[]
}

/**
 * State for the board graph — tracks all boards and their relationships.
 * Synced via Yjs as document state.
 */
export interface BoardGraph {
  boards: Record<string, BoardDescriptor>
}

/** Create a default BoardDescriptor */
export function createBoard(
  id: string,
  label: string,
  kind: BoardKind = 'scene',
): BoardDescriptor {
  return { id, label, kind, parentRefs: [], childRefs: [] }
}

/**
 * Link two boards in a parent → child relationship.
 * Mutates both descriptors in place.
 */
export function linkBoards(
  graph: BoardGraph,
  parentId: string,
  childId: string,
): void {
  const parent = graph.boards[parentId]
  const child = graph.boards[childId]
  if (!parent || !child) return

  if (!parent.childRefs.includes(childId)) {
    parent.childRefs.push(childId)
  }
  if (!child.parentRefs.includes(parentId)) {
    child.parentRefs.push(parentId)
  }
}

/**
 * Unlink two boards. Mutates both descriptors in place.
 */
export function unlinkBoards(
  graph: BoardGraph,
  parentId: string,
  childId: string,
): void {
  const parent = graph.boards[parentId]
  const child = graph.boards[childId]
  if (!parent || !child) return

  parent.childRefs = parent.childRefs.filter((r) => r !== childId)
  child.parentRefs = child.parentRefs.filter((r) => r !== parentId)
}
