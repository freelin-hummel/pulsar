import type { InlineRange } from '@pulsar/inline';

import type { PulsarInlineEditor } from '../../../affine-inline-specs.js';

import './link-popup.js';
import { LinkPopup } from './link-popup.js';

export function toggleLinkPopup(
  inlineEditor: PulsarInlineEditor,
  type: LinkPopup['type'],
  targetInlineRange: InlineRange,
  abortController: AbortController
): LinkPopup {
  const popup = new LinkPopup();
  popup.inlineEditor = inlineEditor;
  popup.type = type;
  popup.targetInlineRange = targetInlineRange;
  popup.abortController = abortController;

  document.body.append(popup);

  return popup;
}
