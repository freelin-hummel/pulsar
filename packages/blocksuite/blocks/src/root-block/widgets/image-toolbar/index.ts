import type {
  AdvancedMenuItem,
  MenuItemGroup,
} from '@pulsar/editor-components/toolbar';
import type { ImageBlockModel } from '@pulsar/model';

import { HoverController } from '@pulsar/editor-components/hover';
import { cloneGroups } from '@pulsar/editor-components/toolbar';
import { WidgetComponent } from '@pulsar/block-std';
import { limitShift, shift } from '@floating-ui/dom';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { ImageBlockComponent } from '../../../image-block/image-block.js';

import { PAGE_HEADER_HEIGHT } from '../../../_common/consts.js';
import { getMoreMenuConfig } from '../../configs/toolbar.js';
import './components/image-toolbar.js';
import { MORE_GROUPS, PRIMARY_GROUPS } from './config.js';
import { ImageToolbarContext } from './context.js';

export const PULSAR_IMAGE_TOOLBAR_WIDGET = 'pulsar-image-toolbar-widget';

@customElement(PULSAR_IMAGE_TOOLBAR_WIDGET)
export class PulsarImageToolbarWidget extends WidgetComponent<
  ImageBlockModel,
  ImageBlockComponent
> {
  private _hoverController: HoverController | null = null;

  private _isActivated = false;

  private _setHoverController = () => {
    this._hoverController = null;
    this._hoverController = new HoverController(
      this,
      ({ abortController }) => {
        const imageBlock = this.block;
        const selection = this.host.selection;

        const textSelection = selection.find('text');
        if (
          !!textSelection &&
          (!!textSelection.to || !!textSelection.from.length)
        ) {
          return null;
        }

        const blockSelections = selection.filter('block');
        if (
          blockSelections.length > 1 ||
          (blockSelections.length === 1 &&
            blockSelections[0].blockId !== imageBlock.blockId)
        ) {
          return null;
        }

        const imageContainer =
          imageBlock.resizableImg ?? imageBlock.fallbackCard;
        if (!imageContainer) {
          return null;
        }

        const context = new ImageToolbarContext(imageBlock, abortController);

        return {
          template: html`<pulsar-image-toolbar
            .context=${context}
            .primaryGroups=${this.primaryGroups}
            .moreGroups=${this.moreGroups}
            .onActiveStatusChange=${(active: boolean) => {
              this._isActivated = active;
              if (!active && !this._hoverController?.isHovering) {
                this._hoverController?.abort();
              }
            }}
          ></pulsar-image-toolbar>`,
          container: this.block,
          // stacking-context(editor-host)
          portalStyles: {
            zIndex: 'var(--pulsar-z-index-popover)',
          },
          computePosition: {
            referenceElement: imageContainer,
            placement: 'right-start',
            middleware: [
              shift({
                crossAxis: true,
                padding: {
                  top: PAGE_HEADER_HEIGHT + 12,
                  bottom: 12,
                  right: 12,
                },
                limiter: limitShift(),
              }),
            ],
            autoUpdate: true,
          },
        };
      },
      { allowMultiple: true }
    );

    const imageBlock = this.block;
    this._hoverController.setReference(imageBlock);
    this._hoverController.onAbort = () => {
      // If the more menu is opened, don't close it.
      if (this._isActivated) return;
      this._hoverController?.abort();
      return;
    };
  };

  addMoreItems = (
    items: AdvancedMenuItem<ImageToolbarContext>[],
    index?: number,
    type?: string
  ) => {
    let group;
    if (type) {
      group = this.moreGroups.find(g => g.type === type);
    }
    if (!group) {
      group = this.moreGroups[0];
    }

    if (index === undefined) {
      group.items.push(...items);
      return this;
    }

    group.items.splice(index, 0, ...items);
    return this;
  };

  addPrimaryItems = (
    items: AdvancedMenuItem<ImageToolbarContext>[],
    index?: number
  ) => {
    if (index === undefined) {
      this.primaryGroups[0].items.push(...items);
      return this;
    }

    this.primaryGroups[0].items.splice(index, 0, ...items);
    return this;
  };

  /*
   * Caches the more menu items.
   * Currently only supports configuring more menu.
   */
  moreGroups: MenuItemGroup<ImageToolbarContext>[] = cloneGroups(MORE_GROUPS);

  primaryGroups: MenuItemGroup<ImageToolbarContext>[] =
    cloneGroups(PRIMARY_GROUPS);

  override firstUpdated() {
    if (this.doc.getParent(this.model.id)?.flavour === 'pulsar:surface') {
      return;
    }

    this.moreGroups = getMoreMenuConfig(this.std).configure(this.moreGroups);
    this._setHoverController();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [PULSAR_IMAGE_TOOLBAR_WIDGET]: PulsarImageToolbarWidget;
  }
}
