import * as _ from 'lodash';

export class Nonogram {

  public rows: NonogramCell[][];
  public columns: NonogramCell[][];

  public rowInfo: number[][];
  public columnInfo: number[][];

  private callbacks: ((colIdx: number, rowIdx: number) => void)[] = [];

  constructor(public readonly columnCount: number, public readonly rowCount: number) {
    this.columns = _.times(columnCount, _.stubArray);
    this.rows = _.times(rowCount, _.stubArray);


    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      for (let colIdx = 0; colIdx < columnCount; colIdx++) {
        const cell = new NonogramCell(colIdx, rowIdx);
        this.columns[colIdx].push(cell);
        this.rows[rowIdx].push(cell);
      }
    }
  }

  public setRowInfo(...info: number[][]) {
    this.rowInfo = info;
  }

  public setColumnInfo(...info: number[][]) {
    this.columnInfo = info;
  }

  public getStatesForRow(index: number): NonogramCellState[] {
    return this.rows[index].map(x => x.state);
  }

  public getInfoForRow(index: number): number[] {
    return this.rowInfo[index];
  }

  public getStatesForColumn(index: number): NonogramCellState[] {
    return this.columns[index].map(x => x.state);
  }

  public getInfoForColumn(index: number): number[] {
    return this.columnInfo[index];
  }

  public setStateForCell(colIdx: number, rowIdx: number, state: NonogramCellState) {
    this.rows[rowIdx][colIdx].state = state;
    this.callbacks.forEach(f => f(colIdx, rowIdx));
  }

  public getStateForCell(x: number, y: number) {
    return this.rows[y][x].state;
  }

  public addChangeCallback(func: (colIdx: number, rowIdx: number) => void) {
    this.callbacks.push(func);
  }

  public clear() {
    for (let rowIdx = 0; rowIdx < this.rowCount; rowIdx++) {
      for (let colIdx = 0; colIdx < this.columnCount; colIdx++) {
        this.setStateForCell(colIdx, rowIdx, NonogramCellState.UNKNOWN);
      }
    }
  }
}

class NonogramCell {
  public state: NonogramCellState = NonogramCellState.UNKNOWN;

  constructor(public readonly colIdx: number, public readonly rowIdx: number) {

  }
}

export enum NonogramCellState {
  UNKNOWN,
  FILLED,
  BLANK
}
