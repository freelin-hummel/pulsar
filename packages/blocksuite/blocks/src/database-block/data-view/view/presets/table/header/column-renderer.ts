import {
  ShadowlessElement,
  WithDisposable,
  SignalWatcher,
} from '@pulsar/block-std';
import { css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit/static-html.js';

import type { Column } from '../../../../view-manager/column.js';
import type { TableSingleView } from '../table-view-manager.js';

@customElement('pulsar-data-view-column-preview')
export class DataViewColumnPreview extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  static override styles = css`
    pulsar-data-view-column-preview {
      pointer-events: none;
      display: block;
    }
  `;

  private renderGroup(rows: string[]) {
    const columnIndex = this.tableViewManager.columnGetIndex(this.column.id);
    return html`
      <div
        style="background-color: var(--pulsar-background-primary-color);border-top: 1px solid var(--pulsar-border-color);box-shadow: var(--pulsar-shadow-2);"
      >
        <pulsar-database-header-column
          .tableViewManager="${this.tableViewManager}"
          .column="${this.column}"
        ></pulsar-database-header-column>
        ${repeat(rows, (id, index) => {
          const height = this.table.querySelector(
            `pulsar-database-cell-container[data-row-id="${id}"]`
          )?.clientHeight;
          const style = styleMap({
            height: height + 'px',
          });
          return html`<div
            style="border-top: 1px solid var(--pulsar-border-color)"
          >
            <div style="${style}">
              <pulsar-database-cell-container
                .column="${this.column}"
                .view="${this.tableViewManager}"
                .rowId="${id}"
                .columnId="${this.column.id}"
                .rowIndex="${index}"
                .columnIndex="${columnIndex}"
              ></pulsar-database-cell-container>
            </div>
          </div>`;
        })}
      </div>
      <div style="height: 45px;"></div>
    `;
  }

  override render() {
    const groups = this.tableViewManager.groupManager.groupsDataList$.value;
    if (!groups) {
      const rows = this.tableViewManager.rows$.value;
      return this.renderGroup(rows);
    }
    return groups.map(group => {
      return html`
        <div style="height: 44px;"></div>
        ${this.renderGroup(group.rows)}
      `;
    });
  }

  @property({ attribute: false })
  accessor column!: Column;

  @property({ attribute: false })
  accessor table!: HTMLElement;

  @property({ attribute: false })
  accessor tableViewManager!: TableSingleView;
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-data-view-column-preview': DataViewColumnPreview;
  }
}
