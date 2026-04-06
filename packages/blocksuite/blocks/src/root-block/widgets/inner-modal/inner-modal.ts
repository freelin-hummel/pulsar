import { WidgetComponent } from '@pulsar/block-std';
import {
  type FloatingElement,
  type ReferenceElement,
  autoUpdate,
  computePosition,
  size,
} from '@floating-ui/dom';
import { nothing } from 'lit';
import { customElement } from 'lit/decorators.js';

export const PULSAR_INNER_MODAL_WIDGET = 'pulsar-inner-modal-widget';

@customElement(PULSAR_INNER_MODAL_WIDGET)
export class PulsarInnerModalWidget extends WidgetComponent {
  private _getTarget?: () => ReferenceElement;

  open(
    modal: FloatingElement,
    ops: { onClose?: () => void }
  ): { close(): void } {
    const cancel = autoUpdate(this.target, modal, () => {
      computePosition(this.target, modal, {
        middleware: [
          size({
            apply: ({ rects }) => {
              Object.assign(modal.style, {
                left: `${rects.reference.x}px`,
                top: `${rects.reference.y}px`,
                width: `${rects.reference.width}px`,
                height: `${rects.reference.height}px`,
              });
            },
          }),
        ],
      }).catch(console.error);
    });
    const close = () => {
      modal.remove();
      ops.onClose?.();
      cancel();
    };
    return { close };
  }

  override render() {
    return nothing;
  }

  setTarget(fn: () => ReferenceElement) {
    this._getTarget = fn;
  }

  get target(): ReferenceElement {
    if (this._getTarget) {
      return this._getTarget();
    }
    return document.body;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [PULSAR_INNER_MODAL_WIDGET]: PulsarInnerModalWidget;
  }
}
