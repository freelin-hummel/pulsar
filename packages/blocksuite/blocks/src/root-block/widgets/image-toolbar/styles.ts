import { css } from 'lit';

export const styles = css`
  :host {
    position: absolute;
    top: 0;
    right: 0;
    z-index: var(--pulsar-z-index-popover);
  }

  .affine-image-toolbar-container {
    height: 24px;
    gap: 4px;
    padding: 4px;
    margin: 0;
  }

  .image-toolbar-button {
    color: var(--pulsar-icon-color);
    background-color: var(--pulsar-background-primary-color);
    box-shadow: var(--pulsar-shadow-1);
    border-radius: 4px;
  }
`;
