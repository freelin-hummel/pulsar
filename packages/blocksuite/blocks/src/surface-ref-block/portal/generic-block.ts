import type { ImageBlockModel } from '@pulsar/model';
import type {
  AttachmentBlockModel,
  BookmarkBlockModel,
  EmbedFigmaModel,
  EmbedGithubModel,
  EmbedHtmlModel,
  EmbedLinkedDocModel,
  EmbedLoomModel,
  EmbedSyncedDocModel,
  EmbedYoutubeModel,
} from '@pulsar/model';
import type { BlockModel } from '@pulsar/store';

import { ShadowlessElement, WithDisposable } from '@pulsar/block-std';
import { Bound } from '@pulsar/global/utils';
import { type TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit/static-html.js';

@customElement('surface-ref-generic-block-portal')
export class SurfaceRefGenericBlockPortal extends WithDisposable(
  ShadowlessElement
) {
  static override styles = css`
    surface-ref-generic-block-portal {
      position: relative;
    }
  `;

  override firstUpdated() {
    this.disposables.add(
      this.model.propsUpdated.on(() => this.requestUpdate())
    );
  }

  override render() {
    const { model, index } = this;
    const bound = Bound.deserialize(model.xywh);
    const style = {
      position: 'absolute',
      zIndex: `${index}`,
      width: `${bound.w}px`,
      height: `${bound.h}px`,
      transform: `translate(${bound.x}px, ${bound.y}px)`,
    };

    return html`
      <div
        style=${styleMap(style)}
        data-portal-reference-block-id="${model.id}"
      >
        ${this.renderModel(model)}
      </div>
    `;
  }

  @property({ attribute: false })
  accessor index!: number;

  @property({ attribute: false })
  accessor model!:
    | ImageBlockModel
    | AttachmentBlockModel
    | BookmarkBlockModel
    | EmbedGithubModel
    | EmbedYoutubeModel
    | EmbedFigmaModel
    | EmbedLinkedDocModel
    | EmbedSyncedDocModel
    | EmbedHtmlModel
    | EmbedLoomModel;

  @property({ attribute: false })
  accessor renderModel!: (model: BlockModel) => TemplateResult;
}

declare global {
  interface HTMLElementTagNameMap {
    'surface-ref-generic-block-portal': SurfaceRefGenericBlockPortal;
  }
}
