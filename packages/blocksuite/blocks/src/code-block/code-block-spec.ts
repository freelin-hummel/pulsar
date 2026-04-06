import {
  BlockViewExtension,
  type ExtensionType,
  FlavourExtension,
  WidgetViewMapExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { CodeBlockService } from './code-block-service.js';

export const CodeBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:code'),
  CodeBlockService,
  BlockViewExtension('pulsar:code', literal`pulsar-code`),
  WidgetViewMapExtension('pulsar:code', {
    codeToolbar: literal`pulsar-code-toolbar-widget`,
    codeLangList: literal`pulsar-code-language-list-widget`,
  }),
];
