import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import {combineLatest, Observable} from 'rxjs';
import {map, shareReplay, startWith, withLatestFrom} from 'rxjs/operators';

import {AccountService} from '../api/account_service';
import {Region, WorldService} from '../api/world_service';
import {Team, WorldMatchupDataSourceObject, WorldMatchupsTable} from './world_matchups_table';

@Component({
  selector: 'gw-wvw-matches',
  templateUrl: './wvw_matches.ng.html',
  styleUrls: ['./wvw_matches.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
    WorldMatchupsTable,
  ],
  standalone: true,
})
export class WvwMatches {

  private readonly homeWorldId$ = this.createHomeWorldId();
  readonly euMatchups$ = this.createEuMatchups();
  readonly naMatchups$ = this.createNaMatchups();

  constructor(
      private readonly accountService: AccountService,
      private readonly worldService: WorldService,
  ) {}

  private createHomeWorldId(): Observable<number> {
    return this.accountService.getAccount().pipe(
        startWith({world: 0}),
        map(({world}) => world),
    )
  }

  private createEuMatchups(): Observable<WorldMatchupDataSourceObject[]> {
    return this.createMatchupsForRegion('eu');
  }

  private createNaMatchups(): Observable<WorldMatchupDataSourceObject[]> {
    return this.createMatchupsForRegion('na');
  }

  private createMatchupsForRegion(region: Region): Observable<WorldMatchupDataSourceObject[]> {
    return this.worldService.getWvwMatchups().pipe(
        withLatestFrom(this.homeWorldId$),
        map(([matchups, homeWorldId]) => {
          const euMatchups = matchups
              .filter((matchup) => matchup.region === region);

          const dataSourceObjects: WorldMatchupDataSourceObject[] = [];
          euMatchups.forEach((matchup) => {
            const redNames = matchup.red.worldNames.sort().join(', ');
            const redVictoryPoints = matchup.red.victoryPoints;
            const redTeam = {
              team: Team.RED,
              worldNames: redNames,
              victoryPoints: redVictoryPoints,
              isHomeTeam: matchup.red.worldIds.includes(homeWorldId),
            };
            const greenNames = matchup.green.worldNames.sort().join(', ');
            const greenVictoryPoints = matchup.green.victoryPoints;
            const greenTeam = {
              team: Team.GREEN,
              worldNames: greenNames,
              victoryPoints: greenVictoryPoints,
              isHomeTeam: matchup.green.worldIds.includes(homeWorldId),
            };
            const blueNames = matchup.blue.worldNames.sort().join(', ');
            const blueVictoryPoints = matchup.blue.victoryPoints;
            const blueTeam = {
              team: Team.BLUE,
              worldNames: blueNames,
              victoryPoints: blueVictoryPoints,
              isHomeTeam: matchup.blue.worldIds.includes(homeWorldId),
            };

            dataSourceObjects.push({
              tier: matchup.tier,
              teamInfos: [redTeam, greenTeam, blueTeam].sort(
                  (a, b) => b.victoryPoints - a.victoryPoints),
            });
          });

          return dataSourceObjects
              .sort((a, b) => a.tier - b.tier);
        }),
    );
  }
}