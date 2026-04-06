/* CSS variables. You need to handle all places where `CSS variables` are marked. */

import { LINE_COLORS, SHAPE_FILL_COLORS } from '@pulsar/model';

export const ColorVariables = [
  '--pulsar-brand-color',
  '--pulsar-primary-color',
  '--pulsar-secondary-color',
  '--pulsar-tertiary-color',
  '--pulsar-hover-color',
  '--pulsar-icon-color',
  '--pulsar-icon-secondary',
  '--pulsar-border-color',
  '--pulsar-divider-color',
  '--pulsar-placeholder-color',
  '--pulsar-quote-color',
  '--pulsar-link-color',
  '--pulsar-edgeless-grid-color',
  '--pulsar-success-color',
  '--pulsar-warning-color',
  '--pulsar-error-color',
  '--pulsar-processing-color',
  '--pulsar-text-emphasis-color',
  '--pulsar-text-primary-color',
  '--pulsar-text-secondary-color',
  '--pulsar-text-disable-color',
  '--pulsar-black-10',
  '--pulsar-black-30',
  '--pulsar-black-50',
  '--pulsar-black-60',
  '--pulsar-black-80',
  '--pulsar-black-90',
  '--pulsar-black',
  '--pulsar-white-10',
  '--pulsar-white-30',
  '--pulsar-white-50',
  '--pulsar-white-60',
  '--pulsar-white-80',
  '--pulsar-white-90',
  '--pulsar-white',
  '--pulsar-background-code-block',
  '--pulsar-background-tertiary-color',
  '--pulsar-background-processing-color',
  '--pulsar-background-error-color',
  '--pulsar-background-warning-color',
  '--pulsar-background-success-color',
  '--pulsar-background-primary-color',
  '--pulsar-background-secondary-color',
  '--pulsar-background-modal-color',
  '--pulsar-background-overlay-panel-color',
  '--pulsar-tag-blue',
  '--pulsar-tag-green',
  '--pulsar-tag-teal',
  '--pulsar-tag-white',
  '--pulsar-tag-purple',
  '--pulsar-tag-red',
  '--pulsar-tag-pink',
  '--pulsar-tag-yellow',
  '--pulsar-tag-orange',
  '--pulsar-tag-gray',
  ...LINE_COLORS,
  ...SHAPE_FILL_COLORS,
  '--pulsar-tooltip',
  '--pulsar-blue',
];

export const SizeVariables = [
  '--pulsar-font-h-1',
  '--pulsar-font-h-2',
  '--pulsar-font-h-3',
  '--pulsar-font-h-4',
  '--pulsar-font-h-5',
  '--pulsar-font-h-6',
  '--pulsar-font-base',
  '--pulsar-font-sm',
  '--pulsar-font-xs',
  '--pulsar-line-height',
  '--pulsar-z-index-modal',
  '--pulsar-z-index-popover',
];

export const FontFamilyVariables = [
  '--pulsar-font-family',
  '--pulsar-font-number-family',
  '--pulsar-font-code-family',
];

export const StyleVariables = [
  '--pulsar-editor-width',

  '--pulsar-theme-mode',
  '--pulsar-editor-mode',
  /* --pulsar-palette-transparent: special values added for the sake of logical consistency. */
  '--pulsar-palette-transparent',

  '--pulsar-popover-shadow',
  '--pulsar-menu-shadow',
  '--pulsar-float-button-shadow',
  '--pulsar-shadow-1',
  '--pulsar-shadow-2',
  '--pulsar-shadow-3',

  '--pulsar-paragraph-space',
  '--pulsar-popover-radius',
  '--pulsar-scale',
  ...SizeVariables,
  ...ColorVariables,
  ...FontFamilyVariables,
] as const;

type VariablesType = typeof StyleVariables;
export type CssVariableName = Extract<
  VariablesType[keyof VariablesType],
  string
>;

export type CssVariablesMap = Record<CssVariableName, string>;
