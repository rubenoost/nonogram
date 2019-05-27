import { Nonogram, NonogramCellState } from './models/nonogram';
import * as _ from 'lodash';

export class Solver {

  public static solve(data: Nonogram): void {
    // Build metadata for rows and columns
    const rowMetadata =
      _.range(0, data.sizeY)
        .map(x => ({ type: 'row', value: x, rank: Solver.rank(data.getInfoForRow(x), data.sizeX), changed: true, done: false }));

    const columnMetadata =
      _.range(0, data.sizeX)
        .map(x => ({ type: 'column', value: x, rank: Solver.rank(data.getInfoForColumn(x), data.sizeY), changed: true, done: false }));

    const metadata = _.orderBy(
      [...rowMetadata, ...columnMetadata],
      [x => x.rank],
      'asc'
    );

    // Find first changed
    let firstChanged = metadata.find(x => !x.done && x.changed);
    while (firstChanged) {
      firstChanged.changed = false;
      if (firstChanged.type === 'column') {
        firstChanged.done = Solver.solveColumn(data, firstChanged.value,
          (x: number, y: number) => {
            if (x !== firstChanged.value) {
              columnMetadata[x].changed = true;
            }
            rowMetadata[y].changed = true;
          });
      } else {
        firstChanged.done = Solver.solveRow(data, firstChanged.value,
          (x: number, y: number) => {
            columnMetadata[x].changed = true;
            if (y !== firstChanged.value) {
              rowMetadata[y].changed = true;
            }
          });
      }

      firstChanged = metadata.find(x => !x.done && x.changed);
    }

  }

  private static solveRow(data: Nonogram, rowIndex: number, cb: (x: number, y: number) => void) {
    const row = data.getStatesForRow(rowIndex);
    const rowInfo = data.getInfoForRow(rowIndex);

    const options = Solver.determineOptions(row, rowInfo);
    const common = Solver.common(options);

    for (let i = 0; i < row.length; i++) {
      if (common[i] !== NonogramCellState.UNKNOWN && common[i] !== data.getStateForCell(i, rowIndex)) {
        data.setState(i, rowIndex, common[i]);
        cb(i, rowIndex);
      }
    }

    return options.length === 1;
  }

  private static solveColumn(data: Nonogram, columnIndex: number, cb: (x: number, y: number) => void) {
    const column = data.getStatesForColumn(columnIndex);
    const columnInfo = data.getInfoForColumn(columnIndex);

    const options = Solver.determineOptions(column, columnInfo);
    const common = Solver.common(options);

    for (let i = 0; i < column.length; i++) {
      if (common[i] !== NonogramCellState.UNKNOWN && common[i] !== data.getStateForCell(columnIndex, i)) {
        data.setState(columnIndex, i, common[i]);
        cb(columnIndex, i);
      }
    }

    return options.length === 1;
  }

  private static determineOptions(states: NonogramCellState[], info: number[]): NonogramCellState[][] {
    // Easy case, no more data to add, return blanks if nothing is in the way, return no options if anything is in the way
    if (info.length === 0) {
      if (Solver.anyState(states, NonogramCellState.FILLED, 0, states.length)) {
        return [];
      } else {
        return [new Array(states.length).fill(NonogramCellState.BLANK)];
      }
    }

    // Make sure it fits into the state
    const minSize = Solver.minSizeFor(info);
    if (minSize > states.length) {
      return [];
    }

    // Determine number of slots to fill
    const firstInfo = info[0];
    const remainingInfo = info.slice(1);
    const totalResults = [];
    for (let i = 0; i <= states.length - minSize; i++) {

      // The states that are skipped
      if (Solver.anyState(states, NonogramCellState.FILLED, 0, i)) {
        continue;
      }

      // If any is blank, no results possible
      if (Solver.anyState(states, NonogramCellState.BLANK, i, i + firstInfo)) {
        continue;
      }

      // If next is filled, not possible
      if (i + firstInfo < states.length && states[i + firstInfo] === NonogramCellState.FILLED) {
        continue;
      }

      // Result can be possible, recurse
      const skippedStates = new Array(i).fill(NonogramCellState.BLANK);
      const filledStates = new Array(firstInfo).fill(NonogramCellState.FILLED);

      if (i + firstInfo < states.length) {
        const remainingStates = states.slice(i + firstInfo + 1);
        const subResults = Solver.determineOptions(remainingStates, remainingInfo);
        // tslint:disable-next-line:prefer-for-of
        for (let x = 0; x < subResults.length; x++) {
          totalResults.push([...skippedStates, ...filledStates, NonogramCellState.BLANK, ...subResults[x]]);
        }
      } else {
        totalResults.push([...skippedStates, ...filledStates]);
      }
    }

    return totalResults;
  }

  private static minSizeFor(info: number[]): number {
    return _.sum(info) + info.length - 1;
  }

  private static anyState(states: NonogramCellState[], state: NonogramCellState, start: number, end: number): boolean {
    for (let i = start; i < end; i++) {
      if (states[i] === state) {
        return true;
      }
    }
    return false;
  }

  private static common(states: NonogramCellState[][]): NonogramCellState[] {
    const result = states[0];

    if (states.length === 0) {
      return result;
    }

    const size = result.length;
    for (let i = 0; i < size; i++) {
      // tslint:disable-next-line:prefer-for-of
      for (let z = 1; z < states.length; z++) {
        const comp = states[z];

        if (comp[i] !== result[i]) {
          result[i] = NonogramCellState.UNKNOWN;
          break;
        }
      }
    }
    return result;
  }

  private static rank(info: number[], length: number): number {
    const a = length - Solver.minSizeFor(info);
    const b = info.length + 1;

    return Solver.fac(a) / Solver.fac(b) / Solver.fac(a - b);
  }

  private static fac(x: number) {
    if (x <= 1) {
      return 1;
    } else {
      return x * Solver.fac(x - 1);
    }
  }
}
