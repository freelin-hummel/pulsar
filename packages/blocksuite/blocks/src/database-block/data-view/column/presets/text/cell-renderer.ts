import { baseTheme } from '@toeverything/theme';
import { css, html, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { createIcon } from '../../../utils/uni-icon.js';
import { BaseCellRenderer } from '../../base-cell.js';
import { createFromBaseCellRenderer } from '../../renderer.js';
import { textColumnModelConfig } from './define.js';

@customElement('pulsar-database-text-cell')
export class TextCell extends BaseCellRenderer<string> {
  static override styles = css`
    pulsar-database-text-cell {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pulsar-database-text {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      padding: 0;
      border: none;
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
      font-size: var(--pulsar-font-base);
      line-height: var(--pulsar-line-height);
      color: var(--pulsar-text-primary-color);
      font-weight: 400;
      background-color: transparent;
    }
  `;

  override render() {
    return html` <div class="pulsar-database-text">${this.value ?? ''}</div>`;
  }
}
@customElement('pulsar-database-text-cell-editing')
export class TextCellEditing extends BaseCellRenderer<string> {
  private _keydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.isComposing) {
      this._setValue();
      setTimeout(() => {
        this.selectCurrentCell(false);
      });
    }
  };

  private _setValue = (str: string = this._inputEle.value) => {
    this._inputEle.value = `${this.value ?? ''}`;
    this.onChange(str);
  };

  static override styles = css`
    pulsar-database-text-cell-editing {
      display: block;
      width: 100%;
      height: 100%;
      cursor: text;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pulsar-database-text {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      padding: 0;
      border: none;
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
      font-size: var(--pulsar-font-base);
      line-height: var(--pulsar-line-height);
      color: var(--pulsar-text-primary-color);
      font-weight: 400;
      background-color: transparent;
    }

    .pulsar-database-text:focus {
      outline: none;
    }
  `;

  focusEnd = () => {
    const end = this._inputEle.value.length;
    this._inputEle.focus();
    this._inputEle.setSelectionRange(end, end);
  };

  override firstUpdated() {
    this.focusEnd();
  }

  override onExitEditMode() {
    this._setValue();
  }

  override render() {
    return html`<input
      .value="${this.value ?? ''}"
      @keydown="${this._keydown}"
      class="pulsar-database-text"
    />`;
  }

  @query('input')
  private accessor _inputEle!: HTMLInputElement;
}

export const textColumnConfig = textColumnModelConfig.renderConfig({
  icon: createIcon('TextIcon'),

  cellRenderer: {
    view: createFromBaseCellRenderer(TextCell),
    edit: createFromBaseCellRenderer(TextCellEditing),
  },
});
