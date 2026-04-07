import { css } from 'lit';

export const listPrefix = css`
  .pulsar-list-block__prefix {
    display: flex;
    color: var(--pulsar-blue-700);
    font-size: var(--pulsar-font-sm);
    user-select: none;
    position: relative;
  }

  .pulsar-list-block__numbered {
    min-width: 22px;
    height: 24px;
    margin-left: 2px;
  }

  .pulsar-list-block__todo-prefix {
    display: flex;
    align-items: center;
    cursor: pointer;
    width: 24px;
    height: 24px;
    color: var(--pulsar-icon-color);
  }

  .pulsar-list-block__todo-prefix.readonly {
    cursor: default;
  }

  .pulsar-list-block__todo-prefix > svg {
    width: 20px;
    height: 20px;
  }
`;

export const toggleStyles = css`
  .toggle-icon {
    display: flex;
    align-items: center;
    height: 16px;
    margin: 4px 0;
    position: absolute;
    left: 0;
    transform: translateX(-100%);
    border-radius: 4px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  .toggle-icon:hover {
    background: var(--pulsar-hover-color);
  }
  .pulsar-list-rich-text-wrapper:hover .toggle-icon {
    opacity: 1;
  }
  .toggle-icon__collapsed {
    opacity: 1;
  }

  .with-drag-handle .pulsar-list-rich-text-wrapper .toggle-icon {
    opacity: 1;
  }
  .with-drag-handle .pulsar-block-children-container .toggle-icon {
    opacity: 0;
  }

  .pulsar-list__collapsed {
    display: none;
  }
`;

export const listBlockStyles = css`
  pulsar-list {
    display: block;
    font-size: var(--pulsar-font-base);
  }

  .pulsar-list-block-container {
    box-sizing: border-box;
    border-radius: 4px;
    position: relative;
  }
  .pulsar-list-block-container .pulsar-list-block-container {
    margin-top: 0;
  }
  .pulsar-list-rich-text-wrapper {
    position: relative;
    display: flex;
  }
  .pulsar-list-rich-text-wrapper rich-text {
    flex: 1;
  }

  .pulsar-list--checked {
    color: var(--pulsar-text-secondary-color);
  }

  ${listPrefix}
  ${toggleStyles}
`;
