import type { BlockViewType } from '../spec/type.js';
import type { ExtensionType } from './extension.js';

import { BlockViewIdentifier } from '../identifier.js';

/**
 * Create a block view extension.
 *
 * @param flavour The flavour of the block that the view is for.
 * @param view Lit literal template for the view. Example: `my-list-block`
 *
 * The view is a lit template that is used to render the block.
 *
 * @example
 * ```ts
 * import { BlockViewExtension } from '@pulsar/block-std';
 *
 * const MyListBlockViewExtension = BlockViewExtension(
 *   'pulsar:list',
 *   literal`my-list-block`
 * );
 * ```
 */
export function BlockViewExtension(
  flavour: BlockSuite.Flavour,
  view: BlockViewType
): ExtensionType {
  return {
    setup: di => {
      di.addImpl(BlockViewIdentifier(flavour), () => view);
    },
  };
}
