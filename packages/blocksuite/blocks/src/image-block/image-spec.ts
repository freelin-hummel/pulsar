import {
  BlockViewExtension,
  CommandExtension,
  type ExtensionType,
  FlavourExtension,
  WidgetViewMapExtension,
} from '@pulsar/block-std';
import { literal } from 'lit/static-html.js';

import { commands } from './commands/index.js';
import { ImageBlockService } from './image-service.js';

export const ImageBlockSpec: ExtensionType[] = [
  FlavourExtension('pulsar:image'),
  ImageBlockService,
  CommandExtension(commands),
  BlockViewExtension('pulsar:image', model => {
    const parent = model.doc.getParent(model.id);

    if (parent?.flavour === 'pulsar:surface') {
      return literal`pulsar-edgeless-image`;
    }

    return literal`pulsar-image`;
  }),
  WidgetViewMapExtension('pulsar:image', {
    imageToolbar: literal`pulsar-image-toolbar-widget`,
  }),
];
