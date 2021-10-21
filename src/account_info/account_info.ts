import {Component} from '@angular/core';

import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {ApiService} from '../api/api';
import {AccountApiObj, MasteryPointsApiObj, PvpApiObj, WorldApiObj} from '../api/models';
import {ApiKeyService} from '../api_key/api_key';
import {dateStringToMediumDate, secondsToDuration} from '../util/dates';

interface DataSourceObject {
  readonly key: string;
  readonly value: string | number | string[];
}

@Component({
  selector: 'gw-account-info',
  templateUrl: './account_info.ng.html',
  styleUrls: ['./account_info.scss'],
})
export class AccountInfo {
  readonly data$ = this.createData();
  readonly displayedColumns = ['key', 'value'];
  readonly needsKey$ = this.createNeedsKey();

  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly apiService: ApiService
  ) {}

  setApiKey(): void {
    this.apiKeyService.setApiKey();
  }

  private createData(): Observable<DataSourceObject[]> {
    return combineLatest([
      this.apiService.getAccount(),
      this.apiService.getMasteryPoints(),
      this.apiService.getPvpStats(),
      this.apiService.getWorlds(),
    ]).pipe(
      switchMap(([account, masteryPoints, pvpStats, worlds]) => {
        const guildNames$ = combineLatest(
          account.guilds.map(guildId => {
            return this.apiService.getGuild(guildId);
          })
        ).pipe(map(guilds => guilds.map(guild => guild.name)));

        return combineLatest([
          observableOf(account),
          observableOf(masteryPoints),
          observableOf(pvpStats),
          observableOf(worlds),
          guildNames$,
        ]);
      }),
      map(([account, masteryPoints, pvpStats, worlds, guildNames]) => {
        return this.createDataSourceFromAccount(
          account,
          masteryPoints,
          pvpStats,
          worlds,
          guildNames
        );
      })
    );
  }

  private createDataSourceFromAccount(
    account: AccountApiObj,
    masteryPoints: MasteryPointsApiObj,
    pvpStats: PvpApiObj,
    worlds: WorldApiObj[],
    guildNames: string[]
  ): DataSourceObject[] {
    const dataArray = [];
    const world = worlds.find(world => world.id === account.world);

    dataArray.push({key: 'Name', value: account.name});
    dataArray.push({key: 'Age', value: secondsToDuration(account.age)});
    dataArray.push({key: 'World', value: world?.name ?? ''});
    dataArray.push({key: 'WvW Rank', value: account.wvw_rank});
    dataArray.push({key: 'PvP Rank', value: pvpStats.pvp_rank});
    dataArray.push({
      key: 'Mastery Points',
      value: computeMasteryPoints(masteryPoints),
    });
    dataArray.push({
      key: 'Created',
      value: dateStringToMediumDate(account.created),
    });
    dataArray.push({
      key: 'AP',
      value: (account.daily_ap + account.monthly_ap).toLocaleString(),
    });
    dataArray.push({key: 'Fractal Level', value: account.fractal_level});
    dataArray.push({key: 'Guilds', value: guildNames.join(', ')});

    return dataArray;
  }

  private createNeedsKey(): Observable<boolean> {
    return this.apiKeyService.apiKey$.pipe(map(apiKey => apiKey === null));
  }
}

function computeMasteryPoints(masteryPoints: MasteryPointsApiObj): string {
  return masteryPoints.totals
    .map(mastery => mastery.earned)
    .reduce((prev, curr) => prev + curr, 0)
    .toLocaleString();
}
