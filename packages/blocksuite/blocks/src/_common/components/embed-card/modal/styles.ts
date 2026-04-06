import { FONT_XS, PANEL_BASE } from '@pulsar/editor-shared/styles';
import { css } from 'lit';

export const embedCardModalStyles = css`
  .embed-card-modal-mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    z-index: 1;
  }

  .embed-card-modal-wrapper {
    ${PANEL_BASE};
    flex-direction: column;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    z-index: 2;
    width: 305px;
    height: max-content;
    padding: 12px;
    gap: 12px;
    border-radius: 8px;
    font-size: var(--pulsar-font-xs);
    line-height: 20px;
  }

  .embed-card-modal-row {
    display: flex;
    flex-direction: column;
    align-self: stretch;
  }

  .embed-card-modal-row label {
    padding: 0px 2px;
    color: var(--pulsar-text-secondary-color);
    font-weight: 600;
  }
  .embed-card-modal-input {
    display: flex;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 8px;
    border: 1px solid var(--pulsar-border-color);
    background: var(--pulsar-white-10);
    color: var(--pulsar-text-primary-color);
    ${FONT_XS};
  }
  input.embed-card-modal-input {
    padding-top: 4px;
    padding-bottom: 4px;
  }
  textarea.embed-card-modal-input {
    padding-top: 6px;
    padding-bottom: 6px;
    min-width: 100%;
    max-width: 100%;
  }
  .embed-card-modal-input:focus {
    border-color: var(--pulsar-blue-700);
    box-shadow: var(--pulsar-active-shadow);
    outline: none;
  }
  .embed-card-modal-input::placeholder {
    color: var(--pulsar-placeholder-color);
  }

  .embed-card-modal-row:has(.embed-card-modal-button) {
    flex-direction: row;
    gap: 4px;
    align-self: flex-end;
  }

  .embed-card-modal-button {
    padding: 4px 18px;
    border-radius: 8px;
    align-self: self-end;
    box-sizing: border-box;
  }
  .embed-card-modal-button.save {
    border: 1px solid var(--pulsar-black-10);
    background: var(--pulsar-primary-color);
    color: var(--pulsar-pure-white);
  }
  .embed-card-modal-button[disabled] {
    pointer-events: none;
    cursor: not-allowed;
    color: var(--pulsar-text-disable-color);
    background: transparent;
  }

  .embed-card-modal-title {
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
    user-select: none;
  }
  .embed-card-modal-description {
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
    user-select: none;
  }
`;
