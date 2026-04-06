import type { CodeBlockModel } from '@pulsar/model';

import { HoverController } from '@pulsar/editor-components/hover';
import { WidgetComponent } from '@pulsar/block-std';
import { sleep } from '@pulsar/global/utils';
import { offset } from '@floating-ui/dom';
import { computed } from '@lit-labs/preact-signals';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { CodeBlockComponent } from '../../../code-block/index.js';

import './components/lang-button.js';

export const PULSAR_CODE_LANGUAGE_LIST_WIDGET =
  'pulsar-code-language-list-widget';

@customElement(PULSAR_CODE_LANGUAGE_LIST_WIDGET)
export class PulsarCodeLanguageListWidget extends WidgetComponent<
  CodeBlockModel,
  CodeBlockComponent
> {
  private _hoverController = new HoverController(
    this,
    () => {
      if (!this._shouldDisplay.value) {
        return null;
      }

      return {
        template: html`<language-list-button
          .blockComponent=${this.block}
          .onActiveStatusChange=${async (active: boolean) => {
            this._isActivated = active;
            if (!active) {
              // Wait a moment for the user to see the result.
              // This is to prevent the language list from closing immediately.
              //
              // This snippet is not perfect, it only checks the hover status at the moment.
              if (this._hoverController.isHovering) return;
              await sleep(1000);
              if (this._hoverController.isHovering || this._isActivated) return;
              this._hoverController.abort();
            }
          }}
        >
        </language-list-button>`,
        // stacking-context(editor-host)
        portalStyles: {
          zIndex: 'var(--pulsar-z-index-popover)',
        },
        container: this.block,
        computePosition: {
          referenceElement: this.block,
          placement: 'left-start',
          middleware: [offset({ mainAxis: -5, crossAxis: 5 })],
          autoUpdate: true,
        },
      };
    },
    {
      allowMultiple: true,
    }
  );

  private _isActivated = false;

  private _shouldDisplay = computed(() => {
    const selection = this.host.selection;

    const textSelection = selection.find('text');
    const hasTextSelection =
      !!textSelection && (!!textSelection.to || !!textSelection.from.length);

    if (hasTextSelection) {
      return false;
    }

    const blockSelections = selection.filter('block');
    const hasMultipleBlockSelections =
      blockSelections.length > 1 ||
      (blockSelections.length === 1 &&
        blockSelections[0].blockId !== this.block.blockId);

    if (hasMultipleBlockSelections) {
      return false;
    }

    return true;
  });

  override connectedCallback() {
    super.connectedCallback();
    this._hoverController.setReference(this.block);
    this._hoverController.onAbort = () => {
      // If the language list is opened, don't close it.
      if (this._isActivated) return;
      this._hoverController.abort();
      return;
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [PULSAR_CODE_LANGUAGE_LIST_WIDGET]: PulsarCodeLanguageListWidget;
  }
}
