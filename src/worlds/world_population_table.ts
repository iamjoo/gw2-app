import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTableModule} from '@angular/material/table';

type WorldPopulationString = 'Low'|'Medium'|'High'|'Very High'|'Full';

export interface WorldPopulationDataSourceObject {
  readonly barValue: number;
  readonly isHome: boolean;
  readonly name: string;
  readonly population: WorldPopulationString;
}

@Component({
  selector: 'gw-world-population-table',
  templateUrl: './world_population_table.ng.html',
  styleUrls: ['./world_population_table.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
  ],
  standalone: true,
})
export class WorldPopulationTable {

  @Input({required: true}) dataSource!: WorldPopulationDataSourceObject[];

  readonly displayedColumns = ['name', 'population'];
}
