import type { z } from 'zod';

import { NodePropsSchema } from '@pulsar/editor-shared/utils';

export const EditorSettingSchema = NodePropsSchema;

export type EditorSetting = z.infer<typeof EditorSettingSchema>;
