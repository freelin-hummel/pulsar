import type { Doc } from '@pulsar/store';

import { BlockStdScope } from '@pulsar/block-std';
import {
  EditorHost,
  ShadowlessElement,
  WithDisposable,
} from '@pulsar/block-std';
import { EdgelessEditorBlockSpecs } from '@pulsar/blocks';
import { noop } from '@pulsar/global/utils';
import { type TemplateResult, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { guard } from 'lit/directives/guard.js';

noop(EditorHost);

@customElement('edgeless-editor')
export class EdgelessEditor extends WithDisposable(ShadowlessElement) {
  static override styles = css`
    edgeless-editor {
      font-family: var(--pulsar-font-family);
      background: var(--pulsar-background-primary-color);
    }

    edgeless-editor * {
      box-sizing: border-box;
    }

    @media print {
      edgeless-editor {
        height: auto;
      }
    }

    .affine-edgeless-viewport {
      display: block;
      height: 100%;
      position: relative;
      overflow: clip;
      container-name: viewport;
      container-type: inline-size;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this._disposables.add(
      this.doc.slots.rootAdded.on(() => this.requestUpdate())
    );
    this.std = new BlockStdScope({
      doc: this.doc,
      extensions: this.specs,
    });
  }

  override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    await this.host?.updateComplete;
    return result;
  }

  override render() {
    const std = this.std;
    if (!this.doc.root) return nothing;

    return html`
      <div class="pulsar-edgeless-viewport">
        ${guard([std], () => std.render())}
      </div>
    `;
  }

  override willUpdate(
    changedProperties: Map<string | number | symbol, unknown>
  ) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('doc')) {
      this.std = new BlockStdScope({
        doc: this.doc,
        extensions: this.specs,
      });
    }
  }

  get host() {
    try {
      return this.std.host;
    } catch {
      return null;
    }
  }

  @property({ attribute: false })
  accessor doc!: Doc;

  @property({ attribute: false })
  accessor editor!: TemplateResult;

  @property({ attribute: false })
  accessor specs = EdgelessEditorBlockSpecs;

  @state()
  accessor std!: BlockStdScope;
}

declare global {
  interface HTMLElementTagNameMap {
    'edgeless-editor': EdgelessEditor;
  }
}
