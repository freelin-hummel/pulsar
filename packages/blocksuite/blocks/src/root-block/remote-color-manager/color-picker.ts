class RandomPicker<T> {
  private _copyArray: T[];

  private _originalArray: T[];

  constructor(array: T[]) {
    this._originalArray = [...array];
    this._copyArray = [...array];
  }

  private randomIndex(max: number): number {
    return Math.floor(Math.random() * max);
  }

  pick(): T {
    if (this._copyArray.length === 0) {
      this._copyArray = [...this._originalArray];
    }

    const index = this.randomIndex(this._copyArray.length);
    const item = this._copyArray[index];
    this._copyArray.splice(index, 1);
    return item;
  }
}

export const multiPlayersColor = new RandomPicker([
  'var(--pulsar-multi-players-purple)',
  'var(--pulsar-multi-players-magenta)',
  'var(--pulsar-multi-players-red)',
  'var(--pulsar-multi-players-orange)',
  'var(--pulsar-multi-players-green)',
  'var(--pulsar-multi-players-blue)',
  'var(--pulsar-multi-players-brown)',
  'var(--pulsar-multi-players-grey)',
]);
