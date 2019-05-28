import { Component } from '@angular/core';
import { Nonogram } from './models/nonogram';
import { Solver } from './solver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public data: Nonogram;

  private solver: Solver;

  constructor() {
    this.setupData();
  }

  private setupData() {
    this.data = new Nonogram(25, 30);
    this.data.setRowInfo(
      [5],
      [4, 10],
      [5],
      [15],
      [14],

      [3, 9],
      [4, 7],
      [3, 3],
      [4],
      [4],

      [4, 4],
      [12],
      [5, 5],
      [8, 4],
      [9, 5],

      [16],
      [9, 6],
      [8, 7],
      [8, 7],
      [6, 7],

      [6, 9],
      [4, 9],
      [2, 10],
      [13],
      [4, 5],

      [3, 5],
      [2, 1, 1],
      [1, 1, 1],
      [6],
      [11]
    );

    this.data.setColumnInfo(
      [8],
      [9],
      [7, 3],
      [8, 2],
      [8, 2],

      [10, 2, 1, 1],
      [9, 5, 2],
      [9, 10],
      [9, 6, 2],
      [8, 11],

      [6, 2, 4, 7, 2],
      [9, 1, 3, 7, 2],
      [13, 9, 1],
      [5, 17, 1],
      [1, 4, 14, 1],

      [2, 4, 12, 1],
      [1, 4, 8],
      [1, 5, 4],
      [1, 5],
      [1, 5],

      [1, 4],
      [1, 4],
      [1, 3],
      [1, 2],
      [1, 1]
    );

    this.solver = new Solver(this.data);
  }

  public solve() {
    this.solver.init();
    this.solver.solve();
  }

  public step() {
    this.solver.init();
    this.solver.step();
  }

  public benchmark() {
    const oldData = this.data;
    const oldSolver = this.solver;

    const warmupCount = 100;
    const benchMarkCount = 1000;

    console.log('Warmup...');
    for (let i = 0; i < warmupCount; i++) {
      this.setupData();
      this.solver.init();
      this.solver.solve();
    }

    console.log('Benchmarking...');
    let total = 0;
    for (let i = 0; i < benchMarkCount; i++) {
      this.setupData();
      const start = performance.now();
      this.solver.init();
      this.solver.solve();
      const end = performance.now();
      total += (end - start);
    }

    console.log('Took', total / benchMarkCount, 'ms on average');

    this.data = oldData;
    this.solver = oldSolver;
  }
}
