import type { EmbedCardStyle } from '@pulsar/model';
import type { BlockComponent } from '@pulsar/block-std';
import type { BlockModel } from '@pulsar/store';

export interface EditingState {
  element: BlockComponent;
  model: BlockModel;
  rect: DOMRect;
}

export enum LassoMode {
  FreeHand,
  Polygonal,
}

export type NoteChildrenFlavour =
  | 'pulsar:paragraph'
  | 'pulsar:list'
  | 'pulsar:code'
  | 'pulsar:divider'
  | 'pulsar:database'
  | 'pulsar:data-view'
  | 'pulsar:image'
  | 'pulsar:bookmark'
  | 'pulsar:attachment'
  | 'pulsar:surface-ref';

export interface Viewport {
  left: number;
  top: number;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtendedModel = BlockModel & Record<string, any>;

export type EmbedOptions = {
  flavour: string;
  urlRegex: RegExp;
  styles: EmbedCardStyle[];
  viewType: 'card' | 'embed';
};
