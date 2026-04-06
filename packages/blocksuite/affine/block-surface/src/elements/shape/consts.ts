import type { StrokeStyle } from '@pulsar/model';

export interface GeneralShapeOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  strokeWidth: number;
  strokeColor: string;
  fillColor: string;
  strokeStyle: StrokeStyle;
  radius?: number;
}
