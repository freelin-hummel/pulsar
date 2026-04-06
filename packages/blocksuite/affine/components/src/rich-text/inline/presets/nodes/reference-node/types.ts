import type { ReferenceInfo } from '@pulsar/model';
import type { Slot } from '@pulsar/global/utils';

// TODO: remove these slots
export type RefNodeSlots = {
  docLinkClicked: Slot<ReferenceInfo>;
  tagClicked: Slot<{ tagId: string }>;
};
