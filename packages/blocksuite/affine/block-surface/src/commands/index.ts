import type { BlockCommands } from '@pulsar/block-std';

import { reassociateConnectorsCommand } from './reassociate-connectors.js';

export const commands: BlockCommands = {
  reassociateConnectors: reassociateConnectorsCommand,
};
