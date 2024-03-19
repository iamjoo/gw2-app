import {CommonModule} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTableModule} from '@angular/material/table';

import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {AccountApiObj, AccountService} from '../api/account_service';
import {AddApiKey} from '../api_key/add_api_key';
import {API_KEY_PRESENT_OBS} from '../api_key/api_key_present';
import {GuildService} from '../api/guild_service';
import {MapChests} from './map_chests';
import {MasteryPointsApiObj, MasteryPointsService} from '../api/mastery_points_service';
import {PvpApiObj, PvpService} from '../api/pvp_service';
import {Wallet} from './wallet';
import {WorldApiObj, WorldService} from '../api/world_service';
import {dateStringToMediumDate, secondsToDuration} from '../util/dates';

interface DataSourceObject {
  readonly key: string;
  readonly value: string | number | string[];
}

@Component({
  selector: 'gw-account-info',
  templateUrl: './account_info.ng.html',
  styleUrls: ['./account_info.scss'],
  imports: [
    AddApiKey,
    CommonModule,
    MapChests,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    Wallet,
  ],
  standalone: true,
})
export class AccountInfo {

  readonly data$ = this.createData();
  readonly displayedColumns = ['key', 'value'];

  constructor(
    private readonly accountService: AccountService,
    @Inject(API_KEY_PRESENT_OBS) readonly apiKeyPresent$: Observable<boolean>,
    private readonly guildService: GuildService,
    private readonly masteryPointsService: MasteryPointsService,
    private readonly pvpService: PvpService,
    private readonly worldService: WorldService,
  ) {}

  private createData(): Observable<DataSourceObject[]> {
    return combineLatest([
      this.accountService.getAccount(),
      this.masteryPointsService.getMasteryPoints(),
      this.pvpService.getPvpStats(),
      this.worldService.getWorlds(),
    ]).pipe(
      switchMap(([account, masteryPoints, pvpStats, worlds]) => {
        const guildNames$ = combineLatest(
          account.guilds.map(guildId => {
            return this.guildService.getGuild(guildId);
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
    dataArray.push({key: 'Guilds', value: guildNames.join('\r\n')});

    return dataArray;
  }
}

function computeMasteryPoints(masteryPoints: MasteryPointsApiObj): string {
  return masteryPoints.totals
    .map(mastery => mastery.earned)
    .reduce((prev, curr) => prev + curr, 0)
    .toLocaleString();
}
