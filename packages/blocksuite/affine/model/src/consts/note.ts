import { z } from 'zod';

import { createEnumMap } from '../utils/enum.js';

export const NOTE_WIDTH = 800;

export enum NoteBackgroundColor {
  Black = '--pulsar-note-background-black',
  Blue = '--pulsar-note-background-blue',
  Green = '--pulsar-note-background-green',
  Grey = '--pulsar-note-background-grey',
  Magenta = '--pulsar-note-background-magenta',
  Orange = '--pulsar-note-background-orange',
  Purple = '--pulsar-note-background-purple',
  Red = '--pulsar-note-background-red',
  Teal = '--pulsar-note-background-teal',
  White = '--pulsar-note-background-white',
  Yellow = '--pulsar-note-background-yellow',
}

export const NoteBackgroundColorMap = createEnumMap(NoteBackgroundColor);

export const NOTE_BACKGROUND_COLORS = [
  NoteBackgroundColor.Yellow,
  NoteBackgroundColor.Orange,
  NoteBackgroundColor.Red,
  NoteBackgroundColor.Magenta,
  NoteBackgroundColor.Purple,
  NoteBackgroundColor.Blue,
  NoteBackgroundColor.Teal,
  NoteBackgroundColor.Green,
  NoteBackgroundColor.Black,
  NoteBackgroundColor.Grey,
  NoteBackgroundColor.White,
] as const;

export const DEFAULT_NOTE_BACKGROUND_COLOR = NoteBackgroundColor.Blue;

export const NoteBackgroundColorsSchema = z.nativeEnum(NoteBackgroundColor);

export enum NoteShadow {
  Box = '--pulsar-note-shadow-box',
  Film = '--pulsar-note-shadow-film',
  Float = '--pulsar-note-shadow-float',
  None = '',
  Paper = '--pulsar-note-shadow-paper',
  Sticker = '--pulsar-note-shadow-sticker',
}

export const NoteShadowMap = createEnumMap(NoteShadow);

export const NOTE_SHADOWS = [
  NoteShadow.None,
  NoteShadow.Box,
  NoteShadow.Sticker,
  NoteShadow.Paper,
  NoteShadow.Float,
  NoteShadow.Film,
] as const;

export const DEFAULT_NOTE_SHADOW = NoteShadow.Sticker;

export const NoteShadowsSchema = z.nativeEnum(NoteShadow);

export enum NoteDisplayMode {
  DocAndEdgeless = 'both',
  DocOnly = 'doc',
  EdgelessOnly = 'edgeless',
}

export enum StrokeStyle {
  Dash = 'dash',
  None = 'none',
  Solid = 'solid',
}

export const StrokeStyleMap = createEnumMap(StrokeStyle);
