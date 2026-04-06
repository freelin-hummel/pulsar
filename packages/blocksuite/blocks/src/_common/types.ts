import type { RefNodeSlots } from '@pulsar/editor-components/rich-text';
import type { BrushElementModel } from '@pulsar/model';
import type {
  ConnectorElementModel,
  DocMode,
  GroupElementModel,
} from '@pulsar/model';
import type { Slot } from '@pulsar/global/utils';
import type { Doc } from '@pulsar/store';

/** Common context interface definition for block models. */

// TODO: remove
export type CommonSlots = RefNodeSlots;

type EditorSlots = {
  editorModeSwitched: Slot<DocMode>;
  docUpdated: Slot<{ newDocId: string }>;
};

export type AbstractEditor = {
  doc: Doc;
  mode: DocMode;
  readonly slots: CommonSlots & EditorSlots;
} & HTMLElement;

export type Connectable = Exclude<
  BlockSuite.EdgelessModel,
  ConnectorElementModel | BrushElementModel | GroupElementModel
>;

export type { EmbedCardStyle } from '@pulsar/model';
export * from '@pulsar/editor-shared/types';
