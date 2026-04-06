import {
  BlockViewExtension,
  CommandExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import './bookmark-edgeless-block.js';
import { BookmarkBlockService } from './bookmark-service.js';
import { commands } from './commands/index.js';

export const BookmarkBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:bookmark'),
  BookmarkBlockService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:bookmark', model => {
    return model.parent?.flavour === 'pulsar:surface'
      ? literal`pulsar-edgeless-bookmark`
      : literal`pulsar-bookmark`;
  }),
];
