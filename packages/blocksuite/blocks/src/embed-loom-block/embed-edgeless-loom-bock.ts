import { customElement } from 'lit/decorators.js';

import { toEdgelessEmbedBlock } from '../_common/embed-block-helper/embed-block-element.js';
import { EmbedLoomBlockComponent } from './embed-loom-block.js';

@customElement('pulsar-embed-edgeless-loom-block')
export class EmbedEdgelessLoomBlockComponent extends toEdgelessEmbedBlock(
  EmbedLoomBlockComponent
) {}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-embed-edgeless-loom-block': EmbedEdgelessLoomBlockComponent;
  }
}
