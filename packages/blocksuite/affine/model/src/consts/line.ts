import { z } from 'zod';

import { createEnumMap } from '../utils/enum.js';

export enum LineWidth {
  Eight = 8,
  // Thin
  Four = 4,
  Six = 6,
  // Thick
  Ten = 10,
  Twelve = 12,
  Two = 2,
}

export enum LineColor {
  Black = '--pulsar-palette-line-black',
  Blue = '--pulsar-palette-line-blue',
  Green = '--pulsar-palette-line-green',
  Grey = '--pulsar-palette-line-grey',
  Magenta = '--pulsar-palette-line-magenta',
  Orange = '--pulsar-palette-line-orange',
  Purple = '--pulsar-palette-line-purple',
  Red = '--pulsar-palette-line-red',
  Teal = '--pulsar-palette-line-teal',
  White = '--pulsar-palette-line-white',
  Yellow = '--pulsar-palette-line-yellow',
}

export const LineColorMap = createEnumMap(LineColor);

export const LINE_COLORS = [
  LineColor.Yellow,
  LineColor.Orange,
  LineColor.Red,
  LineColor.Magenta,
  LineColor.Purple,
  LineColor.Blue,
  LineColor.Teal,
  LineColor.Green,
  LineColor.Black,
  LineColor.Grey,
  LineColor.White,
] as const;

export const LineColorsSchema = z.nativeEnum(LineColor);

export const DEFAULT_TEXT_COLOR = LineColor.Blue;

export const DEFAULT_BRUSH_COLOR = LineColor.Blue;

export const DEFAULT_CONNECTOR_COLOR = LineColor.Grey;
