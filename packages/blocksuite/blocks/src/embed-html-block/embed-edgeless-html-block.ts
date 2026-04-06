import { Bound } from '@pulsar/global/utils';
import { customElement } from 'lit/decorators.js';

import type { EdgelessRootService } from '../root-block/index.js';

import { toEdgelessEmbedBlock } from '../_common/embed-block-helper/embed-block-element.js';
import { EmbedHtmlBlockComponent } from './embed-html-block.js';

@customElement('pulsar-embed-edgeless-html-block')
export class EmbedEdgelessHtmlBlockComponent extends toEdgelessEmbedBlock(
  EmbedHtmlBlockComponent
) {
  override renderGfxBlock() {
    const bound = Bound.deserialize(this.model.xywh);
    this._width = bound.w;
    this._height = bound.h;

    const width = this._width;
    const height = this._height;
    const scaleX = bound.w / width;
    const scaleY = bound.h / height;

    this.embedContainerStyle.transform = `scale(${scaleX}, ${scaleY})`;
    this.embedHtmlStyle = {
      width: `${this._width}px`,
      height: `${this._height}px`,
    };

    return this.renderPageContent();
  }

  get rootService() {
    return this.std.getService('pulsar:page') as EdgelessRootService;
  }
}
