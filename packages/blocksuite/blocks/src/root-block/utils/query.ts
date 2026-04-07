import type { RootBlockComponent } from '../types.js';

export function getClosestRootBlockComponent(
  el: HTMLElement
): RootBlockComponent | null {
  return el.closest('pulsar-edgeless-root, pulsar-page-root');
}
