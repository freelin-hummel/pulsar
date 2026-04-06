export type SelectOptionColor = {
  color: string;
  name: string;
};

export const selectOptionColors: SelectOptionColor[] = [
  {
    color: 'var(--pulsar-tag-red)',
    name: 'Red',
  },
  {
    color: 'var(--pulsar-tag-pink)',
    name: 'Pink',
  },
  {
    color: 'var(--pulsar-tag-orange)',
    name: 'Orange',
  },
  {
    color: 'var(--pulsar-tag-yellow)',
    name: 'Yellow',
  },
  {
    color: 'var(--pulsar-tag-green)',
    name: 'Green',
  },
  {
    color: 'var(--pulsar-tag-teal)',
    name: 'Teal',
  },
  {
    color: 'var(--pulsar-tag-blue)',
    name: 'Blue',
  },
  {
    color: 'var(--pulsar-tag-purple)',
    name: 'Purple',
  },
  {
    color: 'var(--pulsar-tag-gray)',
    name: 'Gray',
  },
  {
    color: 'var(--pulsar-tag-white)',
    name: 'White',
  },
];

/** select tag color poll */
const selectTagColorPoll = selectOptionColors.map(color => color.color);

function tagColorHelper() {
  let colors = [...selectTagColorPoll];
  return () => {
    if (colors.length === 0) {
      colors = [...selectTagColorPoll];
    }
    const index = Math.floor(Math.random() * colors.length);
    const color = colors.splice(index, 1)[0];
    return color;
  };
}

export const getTagColor = tagColorHelper();
