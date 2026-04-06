import type { ImageBlockModel } from '@pulsar/model';

import { humanFileSize } from '@pulsar/editor-shared/utils';
import {
  ShadowlessElement,
  WithDisposable,
  modelContext,
} from '@pulsar/block-std';
import { consume } from '@lit/context';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { FailedImageIcon, ImageIcon, LoadingIcon } from '../styles.js';

export const SURFACE_IMAGE_CARD_WIDTH = 220;
export const SURFACE_IMAGE_CARD_HEIGHT = 122;
export const NOTE_IMAGE_CARD_WIDTH = 752;
export const NOTE_IMAGE_CARD_HEIGHT = 78;

@customElement('pulsar-image-fallback-card')
export class ImageBlockFallbackCard extends WithDisposable(ShadowlessElement) {
  static override styles = css`
    .affine-image-fallback-card-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .affine-image-fallback-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-color: var(--pulsar-background-secondary-color, #f4f4f5);
      border-radius: 8px;
      border: 1px solid var(--pulsar-background-tertiary-color, #eee);
      padding: 12px;
    }

    .affine-image-fallback-card-content {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--pulsar-placeholder-color);
      text-align: justify;
      font-family: var(--pulsar-font-family);
      font-size: var(--pulsar-font-sm);
      font-style: normal;
      font-weight: 600;
      line-height: var(--pulsar-line-height);
      user-select: none;
    }

    .affine-image-card-size {
      overflow: hidden;
      padding-top: 12px;
      color: var(--pulsar-text-secondary-color);
      text-overflow: ellipsis;
      font-size: 10px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      user-select: none;
    }
  `;

  override render() {
    const { mode, loading, error, model } = this;

    const isEdgeless = mode === 'edgeless';
    const width = isEdgeless
      ? `${SURFACE_IMAGE_CARD_WIDTH}px`
      : `${NOTE_IMAGE_CARD_WIDTH}px`;
    const height = isEdgeless
      ? `${SURFACE_IMAGE_CARD_HEIGHT}px`
      : `${NOTE_IMAGE_CARD_HEIGHT}px`;

    const rotate = isEdgeless ? model.rotate : 0;

    const cardStyleMap = styleMap({
      transform: `rotate(${rotate}deg)`,
      transformOrigin: 'center',
      width,
      height,
    });

    const titleIcon = loading
      ? LoadingIcon
      : error
        ? FailedImageIcon
        : ImageIcon;

    const titleText = loading
      ? 'Loading image...'
      : error
        ? 'Image loading failed.'
        : 'Image';

    const size =
      !!model.size && model.size > 0
        ? humanFileSize(model.size, true, 0)
        : null;

    return html`
      <div class="pulsar-image-fallback-card-container">
        <div
          class="pulsar-image-fallback-card drag-target"
          style=${cardStyleMap}
        >
          <div class="pulsar-image-fallback-card-content">
            ${titleIcon}
            <span class="pulsar-image-fallback-card-title-text"
              >${titleText}</span
            >
          </div>
          <div class="pulsar-image-card-size">${size}</div>
        </div>
      </div>
    `;
  }

  @property({ attribute: false })
  accessor error!: boolean;

  @property({ attribute: false })
  accessor loading!: boolean;

  @property({ attribute: false })
  accessor mode!: 'page' | 'edgeless';

  @consume({ context: modelContext })
  accessor model!: ImageBlockModel;
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-image-fallback-card': ImageBlockFallbackCard;
  }
}
