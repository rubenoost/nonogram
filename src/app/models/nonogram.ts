import * as _ from 'lodash';

export class Nonogram {

  public rows: NonogramCell[][];
  public columns: NonogramCell[][];

  public rowInfo: number[][];
  public columnInfo: number[][];

  constructor(public readonly sizeX: number, public readonly sizeY: number) {
    this.columns = _.times(sizeX, _.stubArray);
    this.rows = _.times(sizeY, _.stubArray);


    for (let y = 0; y < sizeY; y++) {
      for (let x = 0; x < sizeX; x++) {
        const cell = new NonogramCell(x, y);
        this.columns[x].push(cell);
        this.rows[y].push(cell);
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

  public setState(x: number, y: number, state: NonogramCellState) {
    this.rows[y][x].state = state;
  }

  public getStateForCell(x: number, y: number) {
    return this.rows[y][x].state;
  }
}

class NonogramCell {
  public state: NonogramCellState = NonogramCellState.UNKNOWN;

  constructor(public readonly x: number, public readonly y: number) {

  }
}

export enum NonogramCellState {
  UNKNOWN,
  BLANK,
  FILLED
}
