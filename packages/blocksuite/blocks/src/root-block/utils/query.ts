import type { RootBlockComponent } from '../types.js';

export function getClosestRootBlockComponent(
  el: HTMLElement
): RootBlockComponent | null {
  return el.closest('pulsar-edgeless-root, affine-page-root');
}
