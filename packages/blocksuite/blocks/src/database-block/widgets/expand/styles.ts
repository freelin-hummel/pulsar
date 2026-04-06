import { baseTheme } from '@toeverything/theme';
import { css, unsafeCSS } from 'lit';

export const fullScreenStyles = css`
  .table-view-full-modal-overlay {
    position: fixed;
    z-index: var(--pulsar-z-index-modal);
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    padding: 24px;
    border: 1px solid var(--pulsar-border-color);
    border-radius: 6px;
    background: var(--pulsar-white);
    box-shadow: var(--pulsar-shadow-2);

    font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
    font-size: var(--pulsar-font-base);
    line-height: var(--pulsar-line-height);
    color: var(--pulsar-text-primary-color);
    font-weight: 400;
  }

  .table-view-full-modal-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .table-view-full-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 0.5px solid var(--pulsar-divider-color);
    color: var(--pulsar-text-secondary-color);
    font-size: 12px;
  }

  .titles {
    display: flex;
    align-items: center;
  }

  .titles .separator {
    margin: 0 8px;
  }

  .titles .title {
    display: flex;
    align-items: center;
  }

  .titles svg {
    margin-right: 6px;
  }

  .table-view-full-header .close {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .table-view-full-header svg {
    width: 14px;
    height: 14px;
    fill: var(--pulsar-icon-color);
  }

  .table-view-full-content {
    flex: 1;
    overflow-y: scroll;
  }
`;
