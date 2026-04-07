import { css } from 'lit';

import { EMBED_CARD_HEIGHT, EMBED_CARD_WIDTH } from '../_common/consts.js';

export const styles = css`
  .pulsar-attachment-card {
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    gap: 12px;

    width: 100%;
    height: ${EMBED_CARD_HEIGHT.horizontalThin}px;

    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--pulsar-background-tertiary-color);

    opacity: var(--add, 1);
    background: var(--pulsar-background-primary-color);
    user-select: none;
  }

  .pulsar-attachment-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    flex: 1 0 0;

    border-radius: var(--1, 0px);
    opacity: var(--add, 1);
  }

  .pulsar-attachment-content-title {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;

    align-self: stretch;
    padding: var(--1, 0px);
    border-radius: var(--1, 0px);
    opacity: var(--add, 1);
  }

  .pulsar-attachment-content-title-icon {
    display: flex;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
  }

  .pulsar-attachment-content-title-icon svg {
    width: 16px;
    height: 16px;
    fill: var(--pulsar-background-primary-color);
  }

  .pulsar-attachment-content-title-text {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;

    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--pulsar-text-primary-color);

    font-family: var(--pulsar-font-family);
    font-size: var(--pulsar-font-sm);
    font-style: normal;
    font-weight: 600;
    line-height: 22px;
  }

  .pulsar-attachment-content-info {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    flex: 1 0 0;

    word-break: break-all;
    overflow: hidden;
    color: var(--pulsar-text-secondary-color);
    text-overflow: ellipsis;

    font-family: var(--pulsar-font-family);
    font-size: var(--pulsar-font-xs);
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }

  .pulsar-attachment-banner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulsar-attachment-banner svg {
    width: 40px;
    height: 40px;
  }

  .pulsar-attachment-card.loading {
    background: var(--pulsar-background-secondary-color);

    .pulsar-attachment-content-title-text {
      color: var(--pulsar-placeholder-color);
    }
  }

  .pulsar-attachment-card.error,
  .pulsar-attachment-card.unsynced {
    background: var(--pulsar-background-secondary-color);
  }

  .pulsar-attachment-card.cubeThick {
    width: ${EMBED_CARD_WIDTH.cubeThick}px;
    height: ${EMBED_CARD_HEIGHT.cubeThick}px;

    flex-direction: column-reverse;

    .pulsar-attachment-content {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
    }

    .pulsar-attachment-banner {
      justify-content: flex-start;
    }
  }

  .pulsar-attachment-embed-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .pulsar-attachment-iframe-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .pulsar-attachment-iframe-overlay.hide {
    display: none;
  }
`;
