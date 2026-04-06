import { FONT_XS, PANEL_BASE } from '@pulsar/editor-shared/styles';
import { css } from 'lit';

export const renameStyles = css`
  .affine-attachment-rename-container {
    ${PANEL_BASE};
    position: relative;
    display: flex;
    align-items: center;
    width: 320px;
    gap: 12px;
    padding: 12px;
    z-index: var(--pulsar-z-index-popover);
  }

  .affine-attachment-rename-input-wrapper {
    display: flex;
    min-width: 280px;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 10px;
    background: var(--pulsar-white-10);
    border-radius: 4px;
    border: 1px solid var(--pulsar-border-color);
  }

  .affine-attachment-rename-input-wrapper:focus-within {
    border-color: var(--pulsar-blue-700);
    box-shadow: var(--pulsar-active-shadow);
  }

  .affine-attachment-rename-input-wrapper input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--pulsar-text-primary-color);
    ${FONT_XS};
  }

  .affine-attachment-rename-input-wrapper input::placeholder {
    color: var(--pulsar-placeholder-color);
  }

  .affine-attachment-rename-extension {
    font-size: var(--pulsar-font-xs);
    color: var(--pulsar-text-secondary-color);
  }

  .affine-attachment-rename-overlay-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: var(--pulsar-z-index-popover);
  }
`;

export const moreMenuStyles = css`
  .affine-attachment-options-more {
    box-sizing: border-box;
    padding-bottom: 4px;
  }

  .affine-attachment-options-more-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--pulsar-text-primary-color);

    border-radius: 8px;
    padding: 8px;
    background: var(--pulsar-background-overlay-panel-color);
    box-shadow: var(--pulsar-shadow-2);
  }

  .affine-attachment-options-more-container > icon-button {
    display: flex;
    align-items: center;
    padding: 8px;
    gap: 8px;
  }
  .affine-attachment-options-more-container > icon-button[hidden] {
    display: none;
  }

  .affine-attachment-options-more-container > icon-button:hover.danger {
    background: var(--pulsar-background-error-color);
    color: var(--pulsar-error-color);
  }
  .affine-attachment-options-more-container > icon-button:hover.danger > svg {
    color: var(--pulsar-error-color);
  }
`;

export const styles = css`
  :host {
    z-index: 1;
  }
`;
