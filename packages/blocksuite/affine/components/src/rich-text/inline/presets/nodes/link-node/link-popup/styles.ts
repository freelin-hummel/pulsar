import { FONT_XS, PANEL_BASE } from '@pulsar/editor-shared/styles';
import { css } from 'lit';

const editLinkStyle = css`
  .pulsar-link-edit-popover {
    ${PANEL_BASE};
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: repeat(2, 1fr);
    grid-template-areas:
      'text-area .'
      'link-area btn';
    justify-items: center;
    align-items: center;
    width: 320px;
    gap: 8px 12px;
    padding: 12px;
    box-sizing: content-box;
  }

  .pulsar-link-edit-popover label {
    box-sizing: border-box;
    color: var(--pulsar-icon-color);
    ${FONT_XS};
    font-weight: 400;
  }

  .pulsar-link-edit-popover input {
    color: inherit;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--pulsar-text-primary-color);
    ${FONT_XS};
  }
  .pulsar-link-edit-popover input::placeholder {
    color: var(--pulsar-placeholder-color);
  }
  input:focus {
    outline: none;
  }
  .pulsar-link-edit-popover input:focus ~ label,
  .pulsar-link-edit-popover input:active ~ label {
    color: var(--pulsar-primary-color);
  }

  .pulsar-edit-area {
    width: 280px;
    padding: 4px 10px;
    display: grid;
    gap: 8px;
    grid-template-columns: 26px auto;
    grid-template-rows: repeat(1, 1fr);
    grid-template-areas: 'label input';
    user-select: none;
    box-sizing: border-box;

    border: 1px solid var(--pulsar-border-color);
    box-sizing: border-box;

    outline: none;
    border-radius: 4px;
    background: transparent;
  }
  .pulsar-edit-area:focus-within {
    border-color: var(--pulsar-blue-700);
    box-shadow: var(--pulsar-active-shadow);
  }

  .pulsar-edit-area.text {
    grid-area: text-area;
  }

  .pulsar-edit-area.link {
    grid-area: link-area;
  }

  .pulsar-edit-label {
    grid-area: label;
  }

  .pulsar-edit-input {
    grid-area: input;
  }

  .pulsar-confirm-button {
    grid-area: btn;
    user-select: none;
  }
`;

export const linkPopupStyle = css`
  :host {
    box-sizing: border-box;
  }

  .mock-selection {
    position: absolute;
    background-color: rgba(35, 131, 226, 0.28);
  }

  .pulsar-link-popover-container {
    z-index: var(--pulsar-z-index-popover);
    animation: affine-popover-fade-in 0.2s ease;
    position: absolute;
  }

  @keyframes affine-popover-fade-in {
    from {
      opacity: 0;
      transform: translateY(-3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .pulsar-link-popover-overlay-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: var(--pulsar-z-index-popover);
  }

  .pulsar-link-preview {
    display: flex;
    justify-content: flex-start;
    min-width: 60px;
    max-width: 140px;
    padding: var(--1, 0px);
    border-radius: var(--1, 0px);
    opacity: var(--add, 1);
    user-select: none;
    cursor: pointer;

    color: var(--pulsar-link-color);
    font-feature-settings:
      'clig' off,
      'liga' off;
    font-family: var(--pulsar-font-family);
    font-size: var(--pulsar-font-sm);
    font-style: normal;
    font-weight: 400;
    text-decoration: none;
    text-wrap: nowrap;
  }

  .pulsar-link-preview > span {
    display: inline-block;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;

    text-overflow: ellipsis;
    overflow: hidden;
    opacity: var(--add, 1);
  }

  .pulsar-link-popover.create {
    ${PANEL_BASE};
    gap: 12px;
    padding: 12px;

    color: var(--pulsar-text-primary-color);
  }

  .pulsar-link-popover-input {
    min-width: 280px;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 10px;
    background: var(--pulsar-white-10);
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
    border-color: var(--pulsar-border-color);
    color: var(--pulsar-text-primary-color);
    ${FONT_XS};
  }
  .pulsar-link-popover-input::placeholder {
    color: var(--pulsar-placeholder-color);
  }
  .pulsar-link-popover-input:focus {
    border-color: var(--pulsar-blue-700);
    box-shadow: var(--pulsar-active-shadow);
  }

  ${editLinkStyle}
`;
