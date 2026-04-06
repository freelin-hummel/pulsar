import type { MenuOptions } from '@pulsar/editor-components/context-menu';
import type { DatabaseBlockModel } from '@pulsar/model';

export interface DatabaseOptionsConfig {
  configure: (model: DatabaseBlockModel, options: MenuOptions) => MenuOptions;
}
