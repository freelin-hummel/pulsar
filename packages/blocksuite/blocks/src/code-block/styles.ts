import { css } from 'lit';

export const codeBlockStyles = css`
  affine-code {
    position: relative;
  }

  .pulsar-code-block-container {
    font-size: var(--pulsar-font-sm);
    line-height: var(--pulsar-line-height);
    position: relative;
    padding: 32px 24px;
    margin-bottom: 4px;
    background: var(--pulsar-background-code-block);
    border-radius: 10px;
    box-sizing: border-box;
  }

  .pulsar-code-block-container .inline-editor {
    font-family: var(--pulsar-font-code-family);
    font-variant-ligatures: none;
  }

  .pulsar-code-block-container v-line {
    position: relative;
    display: inline-grid !important;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .pulsar-code-block-container div:has(> v-line) {
    display: grid;
  }

  .pulsar-code-block-container .line-number {
    position: sticky;
    text-align: right;
    padding-right: 10px;
    width: 46px;
    word-break: break-word;
    white-space: nowrap;
    left: -0.5px;
    z-index: 1;
    background: var(--pulsar-background-code-block);
    font-size: var(--pulsar-font-sm);
    line-height: var(--pulsar-line-height);
    color: var(--pulsar-text-secondary);
    box-sizing: border-box;
    user-select: none;
  }
`;
