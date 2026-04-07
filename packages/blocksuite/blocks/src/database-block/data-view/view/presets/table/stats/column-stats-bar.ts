import {
  ShadowlessElement,
  WithDisposable,
  SignalWatcher,
} from '@pulsar/block-std';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import type { GroupData } from '../../../../common/group-by/helper.js';
import type { TableSingleView } from '../table-view-manager.js';

import { LEFT_TOOL_BAR_WIDTH, STATS_BAR_HEIGHT } from '../consts.js';

const styles = css`
  .pulsar-database-column-stats {
    width: 100%;
    margin-left: ${LEFT_TOOL_BAR_WIDTH}px;
    height: ${STATS_BAR_HEIGHT}px;
    display: flex;
  }
`;

@customElement('pulsar-database-column-stats')
export class DataBaseColumnStats extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  static override styles = styles;

  protected override render() {
    const cols = this.view.columnManagerList$.value;

    return html`
      <div class="pulsar-database-column-stats">
        ${repeat(
          cols,
          col => col.id,
          col => {
            return html`<pulsar-database-column-stats-cell
              .column=${col}
              .group=${this.group}
            ></pulsar-database-column-stats-cell>`;
          }
        )}
      </div>
    `;
  }

  @property({ attribute: false })
  accessor group: GroupData | undefined = undefined;

  @property({ attribute: false })
  accessor view!: TableSingleView;
}

declare global {
  interface HTMLElementTagNameMap {
    'pulsar-database-column-stats': DataBaseColumnStats;
  }
}
