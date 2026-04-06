import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import './embed-edgeless-github-block.js';
import { EmbedGithubBlockService } from './embed-github-service.js';

export const EmbedGithubBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:embed-github'),
  EmbedGithubBlockService,
  BlockViewExtension('pulsar:embed-github', model => {
    return model.parent?.flavour === 'pulsar:surface'
      ? literal`pulsar-embed-edgeless-github-block`
      : literal`pulsar-embed-github-block`;
  }),
];
