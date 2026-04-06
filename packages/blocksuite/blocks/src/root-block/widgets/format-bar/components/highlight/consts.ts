interface HighlightConfig {
  name: string;
  color: string | null;
  hotkey: string | null;
}

const colors = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'grey',
];

export const backgroundConfig: HighlightConfig[] = [
  {
    name: 'Default Background',
    color: null,
    hotkey: null,
  },
  ...colors.map(color => ({
    name: `${color[0].toUpperCase()}${color.slice(1)} Background`,
    color: `var(--pulsar-text-highlight-${color})`,
    hotkey: null,
  })),
];

export const foregroundConfig: HighlightConfig[] = [
  {
    name: 'Default Color',
    color: null,
    hotkey: null,
  },
  ...colors.map(color => ({
    name: `${color[0].toUpperCase()}${color.slice(1)}`,
    color: `var(--pulsar-text-highlight-foreground-${color})`,
    hotkey: null,
  })),
];
