import {CommonModule, DecimalPipe} from '@angular/common';
import {Component, Input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';

export enum Team {
  RED = 1,
  GREEN,
  BLUE,
}

interface TeamInfo {
  readonly team: Team;
  readonly worldNames: string;
  readonly score: number;
  readonly isHomeTeam: boolean;
}

export interface WorldMatchupDataSourceObject {
  readonly tier: number;
  readonly teamInfos: TeamInfo[];
}

@Component({
  selector: 'gw-world-matchups-table',
  templateUrl: './world_matchups_table.ng.html',
  styleUrls: ['./world_matchups_table.scss'],
  imports: [
    CommonModule,
    DecimalPipe,
    MatIconModule,
    MatTableModule,
  ],
  standalone: true,
})
export class WorldMatchupsTable {

  @Input({required: true}) dataSource!: WorldMatchupDataSourceObject[];

  readonly Team = Team;
  readonly displayedColumns = ['tier', 'names', 'score'];
}
