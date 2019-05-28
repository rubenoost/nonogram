import { Component, OnInit, Input } from '@angular/core';
import { Nonogram, NonogramCellState } from 'src/app/models/nonogram';
import { NonogramDisplayInfo } from 'src/app/utilities/nonogram-display-info';

@Component({
  selector: 'app-nonogram-display',
  templateUrl: './nonogram-display.component.html',
  styleUrls: ['./nonogram-display.component.scss']
})
export class NonogramDisplayComponent implements OnInit {

  @Input()
  public nonogram: Nonogram;

  public displayInfo: NonogramDisplayInfo;

  constructor() { }

  ngOnInit() {
    this.displayInfo = new NonogramDisplayInfo(this.nonogram);
  }

  public cycleCell(x: number, y: number) {
    let states = Object.values(NonogramCellState);
    states = states.splice(states.length / 2);
    this.nonogram.setStateForCell(x, y, states[(states.indexOf(this.nonogram.getStateForCell(x, y)) + 1) % states.length]);
  }
}
