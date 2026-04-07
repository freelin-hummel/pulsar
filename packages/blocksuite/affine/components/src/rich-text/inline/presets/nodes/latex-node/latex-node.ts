import type { InlineEditor } from '@pulsar/inline';

import {
  type BlockComponent,
  ShadowlessElement,
  WithDisposable,
  SignalWatcher,
} from '@pulsar/block-std';
import {
  type DeltaInsert,
  ZERO_WIDTH_NON_JOINER,
  ZERO_WIDTH_SPACE,
} from '@pulsar/inline';
import { effect, signal } from '@lit-labs/preact-signals';
import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import katex from 'katex';
import { css, html, render, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { PulsarTextAttributes } from '../../affine-inline-specs.js';

import { createLitPortal } from '../../../../../portal/helper.js';
import './latex-editor-menu.js';
import './latex-editor-unit.js';

@customElement('pulsar-latex-node')
export class PulsarLatexNode extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  private _editorAbortController: AbortController | null = null;

  static override styles = css`
    pulsar-latex-node {
      display: inline-block;
    }

    pulsar-latex-node .pulsar-latex {
      white-space: nowrap;
      word-break: break-word;
      color: ${unsafeCSS(cssVar('textPrimaryColor'))};
      fill: var(--pulsar-icon-color);
      border-radius: 4px;
      text-decoration: none;
      cursor: pointer;
      user-select: none;
      padding: 1px 2px 1px 0;
      display: grid;
      grid-template-columns: auto 0;
      place-items: center;
      padding: 0 4px;
      margin: 0 2px;
    }
    pulsar-latex-node .pulsar-latex:hover {
      background: ${unsafeCSS(cssVar('hoverColor'))};
    }
    pulsar-latex-node .pulsar-latex[data-selected='true'] {
      background: ${unsafeCSS(cssVar('hoverColor'))};
    }

    pulsar-latex-node .error-placeholder {
      display: flex;
      padding: 2px 4px;
      justify-content: center;
      align-items: flex-start;
      gap: 10px;

      border-radius: 4px;
      background: ${unsafeCSS(cssVarV2('label/red'))};

      color: ${unsafeCSS(cssVarV2('text/highlight/fg/red'))};
      font-family: Inter;
      font-size: 12px;
      font-weight: 500;
      line-height: normal;
    }

    pulsar-latex-node .placeholder {
      display: flex;
      padding: 2px 4px;
      justify-content: center;
      align-items: flex-start;

      border-radius: 4px;
      background: ${unsafeCSS(cssVarV2('layer/background/secondary'))};

      color: ${unsafeCSS(cssVarV2('text/secondary'))};
      font-family: Inter;
      font-size: 12px;
      font-weight: 500;
      line-height: normal;
    }
  `;

  readonly latex$ = signal('');

  override connectedCallback() {
    const result = super.connectedCallback();

    this.latex$.value = this.deltaLatex;

    this.disposables.add(
      effect(() => {
        const latex = this.latex$.value;

        if (latex !== this.deltaLatex) {
          this.editor.formatText(
            {
              index: this.startOffset,
              length: this.endOffset - this.startOffset,
            },
            {
              latex,
            }
          );
        }

        this.updateComplete
          .then(() => {
            const latexContainer = this.latexContainer;
            if (!latexContainer) return;

            latexContainer.replaceChildren();
            // @ts-ignore
            delete latexContainer['_$litPart$'];

            if (latex.length === 0) {
              render(
                html`<span class="placeholder">Equation</span>`,
                latexContainer
              );
            } else {
              try {
                katex.render(latex, latexContainer, {
                  displayMode: true,
                  output: 'mathml',
                });
              } catch {
                latexContainer.replaceChildren();
                // @ts-ignore
                delete latexContainer['_$litPart$'];
                render(
                  html`<span class="error-placeholder">Error equation</span>`,
                  latexContainer
                );
              }
            }
          })
          .catch(console.error);
      })
    );

    this._editorAbortController?.abort();
    this._editorAbortController = new AbortController();
    this.disposables.add(() => {
      this._editorAbortController?.abort();
    });

    this.disposables.addFromEvent(this, 'click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleEditor();
    });

    return result;
  }

  override render() {
    return html`<span class="pulsar-latex" data-selected=${this.selected}
      ><div class="latex-container"></div>
      <v-text .str=${ZERO_WIDTH_NON_JOINER}></v-text
    ></span>`;
  }

  toggleEditor() {
    const blockComponent = this.closest<BlockComponent>('[data-block-id]');
    if (!blockComponent) return;

    this._editorAbortController?.abort();
    this._editorAbortController = new AbortController();

    const portal = createLitPortal({
      template: html`<latex-editor-menu
        .latexSignal=${this.latex$}
        .abortController=${this._editorAbortController}
      ></latex-editor-menu>`,
      container: blockComponent.host,
      computePosition: {
        referenceElement: this,
        placement: 'bottom-start',
        autoUpdate: {
          animationFrame: true,
        },
      },
      closeOnClickAway: true,
      abortController: this._editorAbortController,
      shadowDom: false,
      portalStyles: {
        zIndex: 'var(--pulsar-z-index-popover)',
      },
    });

    this._editorAbortController.signal.addEventListener(
      'abort',
      () => {
        portal.remove();
      },
      { once: true }
    );
  }

  get deltaLatex() {
    return this.delta.attributes?.latex as string;
  }

  get latexContainer() {
    return this.querySelector<HTMLElement>('.latex-container');
  }

  @property({ attribute: false })
  accessor delta: DeltaInsert<PulsarTextAttributes> = {
    insert: ZERO_WIDTH_SPACE,
  };

  @property({ attribute: false })
  accessor editor!: InlineEditor<PulsarTextAttributes>;

  @property({ attribute: false })
  accessor endOffset!: number;

  @property({ attribute: false })
  accessor selected = false;

  @property({ attribute: false })
  accessor startOffset!: number;
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-latex-node': PulsarLatexNode;
  }
}
