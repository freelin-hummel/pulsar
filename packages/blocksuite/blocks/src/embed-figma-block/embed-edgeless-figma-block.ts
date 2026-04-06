import { customElement } from 'lit/decorators.js';

import { toEdgelessEmbedBlock } from '../_common/embed-block-helper/embed-block-element.js';
import { EmbedFigmaBlockComponent } from './embed-figma-block.js';

@customElement('pulsar-embed-edgeless-figma-block')
export class EmbedEdgelessBlockComponent extends toEdgelessEmbedBlock(
  EmbedFigmaBlockComponent
) {}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-embed-edgeless-figma-block': EmbedEdgelessBlockComponent;
  }
}
