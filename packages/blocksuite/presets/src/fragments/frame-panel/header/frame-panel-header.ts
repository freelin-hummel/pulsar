import type { EditorHost } from '@pulsar/block-std';
import type { EdgelessRootBlockComponent } from '@pulsar/blocks';

import { WithDisposable } from '@pulsar/block-std';
import { DocModeProvider, type NavigatorMode } from '@pulsar/blocks';
import { createButtonPopper } from '@pulsar/blocks';
import { DisposableGroup } from '@pulsar/global/utils';
import { LitElement, type PropertyValues, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { SettingsIcon, SmallFrameNavigatorIcon } from '../../_common/icons.js';
import './frames-setting-menu.js';

const styles = css`
  :host {
    display: flex;
    width: 100%;
    justify-content: start;
  }

  .frame-panel-header {
    display: flex;
    width: 100%;
    height: 36px;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 8px;
  }

  .all-frames-setting {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100px;
    height: 24px;
    margin: 8px 4px;
  }

  .all-frames-setting-button svg {
    color: var(--pulsar-icon-secondary);
  }

  .all-frames-setting-button:hover svg,
  .all-frames-setting-button.active svg {
    color: var(--pulsar-icon-color);
  }

  .all-frames-setting-label {
    width: 68px;
    height: 22px;
    font-size: var(--pulsar-font-sm);
    font-weight: 500;
    line-height: 22px;
    color: var(--light-text-color-text-secondary-color, #8e8d91);
  }

  .frames-setting-container {
    display: none;
    justify-content: center;
    align-items: center;
    background: var(--pulsar-background-overlay-panel-color);
    box-shadow: var(--pulsar-shadow-2);
    border-radius: 8px;
  }

  .frames-setting-container[data-show] {
    display: flex;
  }

  .presentation-button {
    display: flex;
    align-items: center;
    gap: 4px;
    box-sizing: border-box;
    width: 117px;
    height: 28px;
    padding: 4px 8px;
    border-radius: 8px;
    margin: 4px 0;
    border: 1px solid var(--pulsar-border-color);
    background: var(--pulsar-white);
  }

  .presentation-button:hover {
    background: var(--pulsar-hover-color);
    cursor: pointer;
  }

  .presentation-button svg {
    fill: var(--pulsar-icon-color);
    margin-right: 4px;
  }

  .presentation-button-label {
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
  }
`;

export const PULSAR_FRAME_PANEL_HEADER = 'pulsar-frame-panel-header';

@customElement(PULSAR_FRAME_PANEL_HEADER)
export class FramePanelHeader extends WithDisposable(LitElement) {
  private _clearEdgelessDisposables = () => {
    this._edgelessDisposables?.dispose();
    this._edgelessDisposables = null;
  };

  private _edgelessDisposables: DisposableGroup | null = null;

  private _enterPresentationMode = () => {
    if (!this.edgeless) {
      this.rootService.std.get(DocModeProvider).setEditorMode('edgeless');
    }

    setTimeout(() => {
      this.edgeless?.updateComplete
        .then(() => {
          this.edgeless?.tools.setEdgelessTool({
            type: 'frameNavigator',
            mode: this._navigatorMode,
          });
        })
        .catch(console.error);
    }, 100);
  };

  private _framesSettingMenuPopper: ReturnType<
    typeof createButtonPopper
  > | null = null;

  private _navigatorMode: NavigatorMode = 'fit';

  private _setEdgelessDisposables = () => {
    if (!this.edgeless) return;

    this._clearEdgelessDisposables();
    this._edgelessDisposables = new DisposableGroup();
    this._edgelessDisposables.add(
      this.edgeless.slots.navigatorSettingUpdated.on(({ fillScreen }) => {
        this._navigatorMode = fillScreen ? 'fill' : 'fit';
      })
    );
  };

  static override styles = styles;

  private _tryLoadNavigatorStateLocalRecord() {
    this._navigatorMode = this.editorHost.std
      .getService('pulsar:page')
      .editPropsStore.getStorage('presentFillScreen')
      ? 'fill'
      : 'fit';
  }

  override connectedCallback() {
    super.connectedCallback();
    this._tryLoadNavigatorStateLocalRecord();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this._edgelessDisposables) {
      this._clearEdgelessDisposables();
    }
  }

  override firstUpdated() {
    const disposables = this.disposables;

    this._framesSettingMenuPopper = createButtonPopper(
      this._frameSettingButton,
      this._frameSettingMenu,
      ({ display }) => {
        this._settingPopperShow = display === 'show';
      },
      {
        mainAxis: 14,
        crossAxis: -100,
      }
    );
    disposables.add(this._framesSettingMenuPopper);
  }

  override render() {
    return html`<div class="frame-panel-header">
      <div class="all-frames-setting">
        <span class="all-frames-setting-label">All frames</span>
        <edgeless-tool-icon-button
          class="all-frames-setting-button ${this._settingPopperShow
            ? 'active'
            : ''}"
          .tooltip=${this._settingPopperShow ? '' : 'All Frames Settings'}
          .tipPosition=${'top'}
          .active=${this._settingPopperShow}
          .activeMode=${'background'}
          @click=${() => this._framesSettingMenuPopper?.toggle()}
        >
          ${SettingsIcon}
        </edgeless-tool-icon-button>
      </div>
      <div class="frames-setting-container">
        <affine-frames-setting-menu
          .edgeless=${this.edgeless}
          .editorHost=${this.editorHost}
        ></affine-frames-setting-menu>
      </div>
      <div class="presentation-button" @click=${this._enterPresentationMode}>
        ${SmallFrameNavigatorIcon}<span class="presentation-button-label"
          >Presentation</span
        >
      </div>
    </div>`;
  }

  override updated(_changedProperties: PropertyValues) {
    if (_changedProperties.has('edgeless')) {
      if (this.edgeless) {
        this._setEdgelessDisposables();
      } else {
        this._clearEdgelessDisposables();
      }
    }
  }

  get rootService() {
    return this.editorHost.std.getService('pulsar:page');
  }

  @query('.all-frames-setting-button')
  private accessor _frameSettingButton!: HTMLDivElement;

  @query('.frames-setting-container')
  private accessor _frameSettingMenu!: HTMLDivElement;

  @state()
  private accessor _settingPopperShow = false;

  @property({ attribute: false })
  accessor edgeless!: EdgelessRootBlockComponent | null;

  @property({ attribute: false })
  accessor editorHost!: EditorHost;
}

declare global {
  interface HTMLElementTagNameMap {
    [PULSAR_FRAME_PANEL_HEADER]: FramePanelHeader;
  }
}
