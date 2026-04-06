import {
  BlockViewExtension,
  FlavourExtension,
  type ExtensionType,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import './latex-block.js';
import { LatexBlockService } from './latex-service.js';

export const LatexBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:latex'),
  LatexBlockService,
  BlockViewExtension('pulsar:latex', literal`pulsar-latex`),
];
