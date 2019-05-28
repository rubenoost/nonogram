// tslint:disable:member-ordering
import { Nonogram, NonogramCellState } from './models/nonogram';
import * as _ from 'lodash';

interface Metadata {
  type: 'row' | 'column';
  value: number;
  rank: number;
  changed: boolean;
  solver: (data: Nonogram, rowIndex: number) => number;
}

export class Solver {

  private rowMetadata: Metadata[];
  private columnMetadata: Metadata[];
  private metadata: Metadata[];

  private initialised = false;

  constructor(private data: Nonogram) {
  }

  public init() {
    if (this.initialised) {
      return;
    }

    this.initialised = true;

    // Build metadata for rows and columns
    this.rowMetadata =
      _.range(0, this.data.rowCount)
        .map(x => ({
          type: 'row',
          value: x,
          rank: Solver.rank(this.data.getInfoForRow(x), this.data.columnCount),
          changed: true,
          solver: Solver.solveRow
        }));

    this.columnMetadata =
      _.range(0, this.data.columnCount)
        .map(x => ({
          type: 'column',
          value: x,
          rank: Solver.rank(this.data.getInfoForColumn(x), this.data.rowCount),
          changed: true,
          solver: Solver.solveColumn
        }));

    this.metadata = [...this.rowMetadata, ...this.columnMetadata];


    this.data.addChangeCallback((x, y) => {
      this.columnMetadata[x].changed = true;
      this.rowMetadata[y].changed = true;
    });
  }

  public solve() {
    while (this.step()) { }
  }

  public step(): boolean {
    // Find first changed
    let firstChanged: Metadata = null;
    let firstChangedIdx = 0;
    for (let q = 0; q < this.metadata.length; q++) {
      const m = this.metadata[q];
      if (m.rank > 1 && m.changed && (!firstChanged || firstChanged.rank > m.rank)) {
        firstChanged = m;
        firstChangedIdx = q;
      }
    }

    if (!firstChanged) {
      return false;
    }

    const options = firstChanged.solver(this.data, firstChanged.value);
    if (options > 1) {
      firstChanged.rank = options;
      firstChanged.changed = false;
    } else {
      this.metadata.splice(firstChangedIdx, 1);
    }
    return true;
  }

  private static solveRow(data: Nonogram, rowIndex: number): number {
    const row = data.getStatesForRow(rowIndex);
    const rowInfo = data.getInfoForRow(rowIndex);

    const options = Solver.determineOptions(row, rowInfo);
    const common = options.options;

    for (let i = 0; i < row.length; i++) {
      if (common[i] !== NonogramCellState.UNKNOWN && common[i] !== data.getStateForCell(i, rowIndex)) {
        data.setStateForCell(i, rowIndex, common[i]);
      }
    }

    return options.count;
  }

  private static solveColumn(data: Nonogram, columnIndex: number): number {
    const column = data.getStatesForColumn(columnIndex);
    const columnInfo = data.getInfoForColumn(columnIndex);

    const options = Solver.determineOptions(column, columnInfo);
    const common = options.options;

    for (let i = 0; i < column.length; i++) {
      if (common[i] !== NonogramCellState.UNKNOWN && common[i] !== data.getStateForCell(columnIndex, i)) {
        data.setStateForCell(columnIndex, i, common[i]);
      }
    }

    return options.count;
  }

  private static determineOptions(states: NonogramCellState[], info: number[]): { count: number, options: NonogramCellState[] } {
    // Easy case, no more data to add, return blanks if nothing is in the way, return no options if anything is in the way
    if (info.length === 0) {
      if (Solver.anyState(states, NonogramCellState.FILLED, 0, states.length)) {
        return { count: 0, options: [] };
      } else {
        return { count: 1, options: new Array(states.length).fill(NonogramCellState.BLANK) };
      }
    }

    // Make sure it fits into the state
    const minSize = Solver.minSizeFor(info);
    if (minSize > states.length) {
      return { count: 0, options: [] };
    }

    // Determine number of slots to fill
    const firstInfo = info[0];
    const remainingInfo = info.slice(1);
    const totalResults: NonogramCellState[][] = [];
    let totalResultCount = 0;
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
      const skippedStates: NonogramCellState[] = new Array(i).fill(NonogramCellState.BLANK);
      const filledStates: NonogramCellState[] = new Array(firstInfo).fill(NonogramCellState.FILLED);

      if (i + firstInfo < states.length) {
        const remainingStates = states.slice(i + firstInfo + 1);
        const subResults = Solver.determineOptions(remainingStates, remainingInfo);
        if (subResults.count > 0) {
          totalResultCount += subResults.count;
          totalResults.push([...skippedStates, ...filledStates, NonogramCellState.BLANK, ...subResults.options]);
        }
      } else {
        totalResultCount++;
        totalResults.push([...skippedStates, ...filledStates]);
      }
    }

    return { count: totalResultCount, options: totalResultCount === 0 ? [] : Solver.common(totalResults) };
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

    if (states.length === 1) {
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
    let a = length - Solver.minSizeFor(info);
    let b = info.length + 1;
    if (b > a) { const c = b; b = a; a = c; }

    return Solver.fac(a) / Solver.fac(b) / Solver.fac(a - b);
  }

  private static fac(x: number) {
    return x <= 1 ? 1 : x * Solver.fac(x - 1);
  }
}
