import {
  BlockViewExtension,
  CommandExtension,
  type ExtensionType,
  FlavourExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { commands } from './commands/index.js';
import { NoteBlockService } from './note-service.js';

export const NoteBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:note'),
  NoteBlockService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:note', literal`pulsar-note`),
];

export const EdgelessNoteBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:note'),
  NoteBlockService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:note', literal`pulsar-edgeless-note`),
];
