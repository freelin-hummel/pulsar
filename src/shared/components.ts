import { defineComponent } from '../ecs/index.js'

/**
 * Built-in components that provide core canvas element behaviors.
 * These map to BlockSuite block properties and are managed
 * through the ECS for composable extension.
 */
export const BuiltInComponents = {
  /**
   * Transform component - position, rotation, and scale.
   * All canvas elements have this by default.
   */
  Transform: defineComponent({
    name: 'transform',
    defaults: () => ({
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    }),
  }),

  /**
   * Dimensions component - width and height.
   */
  Dimensions: defineComponent({
    name: 'dimensions',
    defaults: () => ({
      width: 100,
      height: 100,
    }),
  }),

  /**
   * Visual style component - appearance properties.
   */
  Style: defineComponent({
    name: 'style',
    defaults: () => ({
      color: '#000000',
      fill: 'none' as string,
      opacity: 1,
      dash: 'draw' as string,
      size: 'm' as string,
    }),
  }),

  /**
   * Label component - text content on an element.
   */
  Label: defineComponent({
    name: 'label',
    defaults: () => ({
      text: '',
      fontSize: 14,
      fontFamily: 'sans-serif' as string,
      textAlign: 'center' as string,
    }),
  }),

  /**
   * Shader component - attach a WebGL shader effect.
   */
  Shader: defineComponent({
    name: 'shader',
    defaults: () => ({
      programId: '' as string,
      uniforms: {} as Record<string, number | number[]>,
      enabled: true,
    }),
  }),

  /**
   * Interactable component - marks an element as interactive.
   */
  Interactable: defineComponent({
    name: 'interactable',
    defaults: () => ({
      draggable: true,
      selectable: true,
      resizable: true,
      rotatable: true,
    }),
  }),

  /**
   * Metadata component - arbitrary key/value data for extensions.
   */
  Metadata: defineComponent({
    name: 'metadata',
    defaults: () => ({
      tags: [] as string[],
      properties: {} as Record<string, unknown>,
    }),
  }),

  /**
   * BoardType component - identifies the board kind and relationships.
   * Attached to the root page entity of each board.
   */
  BoardType: defineComponent({
    name: 'board-type',
    defaults: () => ({
      kind: 'scene' as string,
      parentRefs: [] as string[],
      childRefs: [] as string[],
    }),
  }),

  /**
   * BoardMode component - edit/view mode and user role.
   * Server-authoritative — only the GM can toggle mode.
   */
  BoardMode: defineComponent({
    name: 'board-mode',
    defaults: () => ({
      mode: 'edit' as string,
      role: 'gm' as string,
    }),
  }),
} as const
