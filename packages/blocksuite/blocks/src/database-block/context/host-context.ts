import type { EditorHost } from '@pulsar/block-std';

import { createContextKey } from '../data-view/common/data-source/context.js';

export const HostContextKey = createContextKey<EditorHost>('editor-host');
