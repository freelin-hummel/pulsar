import type { EditorHost } from '@pulsar/block-std';

export function isInsidePageEditor(host: EditorHost) {
  return Array.from(host.children).some(
    v => v.tagName.toLowerCase() === 'pulsar-page-root'
  );
}

export function isInsideEdgelessEditor(host: EditorHost) {
  return Array.from(host.children).some(
    v => v.tagName.toLowerCase() === 'pulsar-edgeless-root'
  );
}
