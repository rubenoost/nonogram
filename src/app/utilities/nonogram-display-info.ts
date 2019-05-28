import { Nonogram, NonogramCellState } from '../models/nonogram';
import * as _ from 'lodash';

export class NonogramDisplayInfo {

  public maxRowInfoSize: number[];
  public maxColumnInfoSize: number[];

  public isRowCorrect: boolean[];
  public isColumnCorrect: boolean[];

  constructor(private data: Nonogram) {
    this.maxRowInfoSize = _.range(_.max(data.rowInfo.map(i => i.length)) - 1, -1, -1);
    this.maxColumnInfoSize = _.range(0, _.max(data.columnInfo.map(i => i.length)), 1);

    this.isColumnCorrect = new Array(this.data.rowCount).fill(false);
    this.isRowCorrect = new Array(this.data.columnCount).fill(false);

    this.data.addChangeCallback((colIdx, rowIdx) => {
      this.checkColumnCorrect(colIdx);
      this.checkRowCorrect(rowIdx);
    });
  }

  private checkRowCorrect(i: number): void {
    const info = this.data.getInfoForRow(i);
    const states = this.data.getStatesForRow(i);
    this.isRowCorrect[i] = this.isCorrect(info, states);
  }

  private checkColumnCorrect(i: number): void {
    const info = this.data.getInfoForColumn(i);
    const states = this.data.getStatesForColumn(i);
    this.isColumnCorrect[i] = this.isCorrect(info, states);
  }

  private isCorrect(info: number[], states: NonogramCellState[]): boolean {
    const stateInfo = this.getStateInfo(states);
    return _.isEqual(info, stateInfo);
  }

  private getStateInfo(states: NonogramCellState[]): number[] {
    const result = [];
    let counter = 0;
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      if (state === NonogramCellState.FILLED) {
        counter++;
      } else if (counter !== 0) {
        result.push(counter);
        counter = 0;
      }
    }
    if (counter > 0) {
      result.push(counter);
    }

    return result;
  }
}
