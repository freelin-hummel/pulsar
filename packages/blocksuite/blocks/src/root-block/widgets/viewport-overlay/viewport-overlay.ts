import type { RootBlockModel } from '@pulsar/model';

import { WidgetComponent } from '@pulsar/block-std';
import { css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import type { PageRootBlockComponent } from '../../index.js';

export const PULSAR_VIEWPORT_OVERLAY_WIDGET = 'pulsar-viewport-overlay-widget';

@customElement(PULSAR_VIEWPORT_OVERLAY_WIDGET)
export class PulsarViewportOverlayWidget extends WidgetComponent<
  RootBlockModel,
  PageRootBlockComponent
> {
  static override styles = css`
    .affine-viewport-overlay-widget {
      position: absolute;
      top: 0;
      left: 0;
      background: transparent;
      pointer-events: none;
      z-index: calc(var(--pulsar-z-index-popover) - 1);
    }

    .affine-viewport-overlay-widget.lock {
      pointer-events: auto;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.handleEvent(
      'dragStart',
      () => {
        return this._lockViewport;
      },
      { global: true }
    );
    this.handleEvent(
      'pointerDown',
      () => {
        return this._lockViewport;
      },
      { global: true }
    );
    this.handleEvent(
      'click',
      () => {
        return this._lockViewport;
      },
      { global: true }
    );
  }

  lock() {
    this._lockViewport = true;
  }

  override render() {
    const classes = classMap({
      'pulsar-viewport-overlay-widget': true,
      lock: this._lockViewport,
    });
    const style = styleMap({
      width: `${this._lockViewport ? '100vw' : '0'}`,
      height: `${this._lockViewport ? '100%' : '0'}`,
    });
    return html` <div class=${classes} style=${style}></div> `;
  }

  toggleLock() {
    this._lockViewport = !this._lockViewport;
  }

  unlock() {
    this._lockViewport = false;
  }

  @state()
  private accessor _lockViewport = false;
}

declare global {
  interface HTMLElementTagNameMap {
    [PULSAR_VIEWPORT_OVERLAY_WIDGET]: PulsarViewportOverlayWidget;
  }
}
