import { WidgetComponent } from '@pulsar/block-std';
import { nothing } from 'lit';
import { customElement } from 'lit/decorators.js';

import { createCustomModal } from './custom-modal.js';

export const PULSAR_MODAL_WIDGET = 'pulsar-modal-widget';

@customElement(PULSAR_MODAL_WIDGET)
export class PulsarModalWidget extends WidgetComponent {
  open(options: Parameters<typeof createCustomModal>[0]) {
    return createCustomModal(options, this.ownerDocument.body);
  }

  override render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [PULSAR_MODAL_WIDGET]: PulsarModalWidget;
  }
}
