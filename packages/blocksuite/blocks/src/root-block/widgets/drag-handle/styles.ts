import { css } from 'lit';

import { DRAG_HANDLE_CONTAINER_WIDTH } from './config.js';

export const styles = css`
  .pulsar-drag-handle-widget {
    display: flex;
    position: absolute;
    left: 0;
    top: 0;
    contain: size layout;
  }

  .pulsar-drag-handle-container {
    top: 0;
    left: 0;
    position: absolute;
    display: flex;
    justify-content: center;
    width: ${DRAG_HANDLE_CONTAINER_WIDTH}px;
    min-height: 12px;
    pointer-events: auto;
    user-select: none;
    box-sizing: border-box;
  }
  .pulsar-drag-handle-container:hover {
    cursor: grab;
  }

  .pulsar-drag-handle-grabber {
    width: 4px;
    height: 100%;
    border-radius: 1px;
    background: var(--pulsar-placeholder-color);
    transition: width 0.25s ease;
  }

  @media print {
    .pulsar-drag-handle-widget {
      display: none;
    }
  }
  .pulsar-drag-hover-rect {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 6px;
    background: var(--pulsar-hover-color);
    pointer-events: none;
    z-index: 2;
    animation: expand 0.25s forwards;
  }
  @keyframes expand {
    0% {
      width: 0;
      height: 0;
    }
  }
`;
