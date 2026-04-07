import { WithDisposable } from '@pulsar/block-std';
import { createButtonPopper } from '@pulsar/blocks';
import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { SettingsIcon, SortingIcon } from '../../_common/icons.js';
import './outline-setting-menu.js';

const styles = css`
  :host {
    display: flex;
    width: 100%;
    height: 40px;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 8px 16px;
  }

  .outline-panel-header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding-right: 6px;
  }

  .note-setting-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .outline-panel-header-label {
    width: 119px;
    height: 22px;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    color: var(--pulsar-text-secondary-color, #8e8d91);
  }

  .note-sorting-button {
    justify-self: end;
  }

  .note-setting-button svg,
  .note-sorting-button svg {
    color: var(--pulsar-icon-secondary);
  }

  .note-setting-button:hover svg,
  .note-setting-button.active svg,
  .note-sorting-button:hover svg {
    color: var(--pulsar-icon-color);
  }

  .note-sorting-button.active svg {
    color: var(--pulsar-primary-color);
  }

  .note-preview-setting-container {
    display: none;
    justify-content: center;
    align-items: center;
    background: var(--pulsar-background-overlay-panel-color);
    box-shadow: var(--pulsar-shadow-2);
    border-radius: 8px;
  }

  .note-preview-setting-container[data-show] {
    display: flex;
  }
`;

export const PULSAR_OUTLINE_PANEL_HEADER = 'pulsar-outline-panel-header';

@customElement(PULSAR_OUTLINE_PANEL_HEADER)
export class OutlinePanelHeader extends WithDisposable(LitElement) {
  private _notePreviewSettingMenuPopper: ReturnType<
    typeof createButtonPopper
  > | null = null;

  static override styles = styles;

  override firstUpdated() {
    const _disposables = this._disposables;

    this._notePreviewSettingMenuPopper = createButtonPopper(
      this._noteSettingButton,
      this._notePreviewSettingMenu,
      ({ display }) => {
        this._settingPopperShow = display === 'show';
      },
      {
        mainAxis: 14,
        crossAxis: -30,
      }
    );
    _disposables.add(this._notePreviewSettingMenuPopper);
  }

  override render() {
    return html`<div class="outline-panel-header-container">
        <div class="note-setting-container">
          <span class="outline-panel-header-label">Table of Contents</span>
          <edgeless-tool-icon-button
            class="note-setting-button ${this._settingPopperShow
              ? 'active'
              : ''}"
            .tooltip=${this._settingPopperShow ? '' : 'Preview Settings'}
            .tipPosition=${'bottom'}
            .active=${this._settingPopperShow}
            .activeMode=${'background'}
            @click=${() => this._notePreviewSettingMenuPopper?.toggle()}
          >
            ${SettingsIcon}
          </edgeless-tool-icon-button>
        </div>
        <edgeless-tool-icon-button
          class="note-sorting-button ${this.enableNotesSorting ? 'active' : ''}"
          .tooltip=${'Note Sort Options'}
          .tipPosition=${'left'}
          .iconContainerPadding=${0}
          .active=${this.enableNotesSorting}
          .activeMode=${'color'}
          @click=${() => this.toggleNotesSorting()}
        >
          ${SortingIcon}
        </edgeless-tool-icon-button>
      </div>
      <div class="note-preview-setting-container">
        <pulsar-outline-note-preview-setting-menu
          .showPreviewIcon=${this.showPreviewIcon}
          .toggleShowPreviewIcon=${this.toggleShowPreviewIcon}
        ></pulsar-outline-note-preview-setting-menu>
      </div>`;
  }

  @query('.note-preview-setting-container')
  private accessor _notePreviewSettingMenu!: HTMLDivElement;

  @query('.note-setting-button')
  private accessor _noteSettingButton!: HTMLDivElement;

  @state()
  private accessor _settingPopperShow = false;

  @property({ attribute: false })
  accessor enableNotesSorting!: boolean;

  @property({ attribute: false })
  accessor showPreviewIcon!: boolean;

  @property({ attribute: false })
  accessor toggleNotesSorting!: () => void;

  @property({ attribute: false })
  accessor toggleShowPreviewIcon!: (on: boolean) => void;
}

declare global {
  interface HTMLElementTagNameMap {
    [PULSAR_OUTLINE_PANEL_HEADER]: OutlinePanelHeader;
  }
}
