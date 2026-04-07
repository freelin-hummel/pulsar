import { css } from 'lit';

import { EMBED_CARD_HEIGHT, EMBED_CARD_WIDTH } from '../_common/consts.js';

export const styles = css`
  .pulsar-bookmark-card {
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    width: 100%;
    height: ${EMBED_CARD_HEIGHT.horizontal}px;

    border-radius: 8px;
    border: 1px solid var(--pulsar-background-tertiary-color);

    opacity: var(--add, 1);
    background: var(--pulsar-background-primary-color);
    user-select: none;
  }

  .pulsar-bookmark-content {
    width: calc(100% - 204px);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-self: stretch;
    gap: 4px;
    padding: 12px;
    border-radius: var(--1, 0px);
    opacity: var(--add, 1);
  }

  .pulsar-bookmark-content-title {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;

    align-self: stretch;
    padding: var(--1, 0px);
    border-radius: var(--1, 0px);
    opacity: var(--add, 1);
  }

  .pulsar-bookmark-content-title-icon {
    display: flex;
    width: 16px;
    height: 16px;
    justify-content: center;
    align-items: center;
  }

  .pulsar-bookmark-content-title-icon img,
  .pulsar-bookmark-content-title-icon object,
  .pulsar-bookmark-content-title-icon svg {
    width: 16px;
    height: 16px;
    fill: var(--pulsar-background-primary-color);
  }

  .pulsar-bookmark-content-title-text {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;

    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--pulsar-text-primary-color);

    font-family: var(--pulsar-font-family);
    font-size: var(--pulsar-font-sm);
    font-style: normal;
    font-weight: 600;
    line-height: 22px;
  }

  .pulsar-bookmark-content-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    flex-grow: 1;

    white-space: normal;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--pulsar-text-primary-color);

    font-family: var(--pulsar-font-family);
    font-size: var(--pulsar-font-xs);
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }

  .pulsar-bookmark-content-url {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    width: max-content;
    max-width: 100%;
    cursor: pointer;
  }

  .pulsar-bookmark-content-url > span {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;

    word-break: break-all;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--pulsar-text-secondary-color);

    font-family: var(--pulsar-font-family);
    font-size: var(--pulsar-font-xs);
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
  .pulsar-bookmark-content-url:hover > span {
    color: var(--pulsar-link-color);
  }
  .pulsar-bookmark-content-url:hover .open-icon {
    fill: var(--pulsar-link-color);
  }

  .pulsar-bookmark-content-url-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 20px;
  }
  .pulsar-bookmark-content-url-icon .open-icon {
    height: 12px;
    width: 12px;
    fill: var(--pulsar-text-secondary-color);
  }

  .pulsar-bookmark-banner {
    margin: 12px 12px 0px 0px;
    width: 204px;
    max-width: 100%;
    height: 102px;
    opacity: var(--add, 1);
  }

  .pulsar-bookmark-banner img,
  .pulsar-bookmark-banner object,
  .pulsar-bookmark-banner svg {
    width: 204px;
    max-width: 100%;
    height: 102px;
    object-fit: cover;
    border-radius: 4px 4px var(--1, 0px) var(--1, 0px);
  }

  .pulsar-bookmark-card.loading {
    .pulsar-bookmark-content-title-text {
      color: var(--pulsar-placeholder-color);
    }
  }

  .pulsar-bookmark-card.error {
    .pulsar-bookmark-content-description {
      color: var(--pulsar-placeholder-color);
    }
  }

  .pulsar-bookmark-card.selected {
    .pulsar-bookmark-content-url > span {
      color: var(--pulsar-link-color);
    }
    .pulsar-bookmark-content-url .open-icon {
      fill: var(--pulsar-link-color);
    }
  }

  .pulsar-bookmark-card.list {
    height: ${EMBED_CARD_HEIGHT.list}px;

    .pulsar-bookmark-content {
      width: 100%;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .pulsar-bookmark-content-title {
      width: calc(100% - 204px);
    }

    .pulsar-bookmark-content-url {
      width: 204px;
      justify-content: flex-end;
    }

    .pulsar-bookmark-content-description {
      display: none;
    }

    .pulsar-bookmark-banner {
      display: none;
    }
  }

  .pulsar-bookmark-card.vertical {
    width: ${EMBED_CARD_WIDTH.vertical}px;
    height: ${EMBED_CARD_HEIGHT.vertical}px;
    flex-direction: column-reverse;

    .pulsar-bookmark-content {
      width: 100%;
    }

    .pulsar-bookmark-content-description {
      -webkit-line-clamp: 6;
      max-height: 120px;
    }

    .pulsar-bookmark-content-url {
      flex-grow: 1;
      align-items: flex-end;
    }

    .pulsar-bookmark-banner {
      width: 340px;
      height: 170px;
      margin-left: 12px;
    }

    .pulsar-bookmark-banner img,
    .pulsar-bookmark-banner object,
    .pulsar-bookmark-banner svg {
      width: 340px;
      height: 170px;
    }
  }

  .pulsar-bookmark-card.cube {
    width: ${EMBED_CARD_WIDTH.cube}px;
    height: ${EMBED_CARD_HEIGHT.cube}px;

    .pulsar-bookmark-content {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
    }

    .pulsar-bookmark-content-title {
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }

    .pulsar-bookmark-content-title-text {
      -webkit-line-clamp: 2;
    }

    .pulsar-bookmark-content-description {
      display: none;
    }

    .pulsar-bookmark-banner {
      display: none;
    }
  }
`;
