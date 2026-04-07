import { css } from 'lit';

export const styles = css`
  :host {
    box-sizing: border-box;
  }

  .pulsar-reference-popover-container {
    z-index: var(--pulsar-z-index-popover);
    animation: pulsar-popover-fade-in 0.2s ease;
    position: absolute;
  }

  @keyframes pulsar-popover-fade-in {
    from {
      opacity: 0;
      transform: translateY(-3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
