import {Component} from '@angular/core';

import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {ApiService} from '../api/api';
import {AccountApiObj, WorldApiObj} from '../api/models';
import {dateStringToMediumDate, secondsToDuration} from '../util/dates';

interface DataSourceObject {
  readonly key: string;
  readonly value: string|number|string[];
}

@Component({
  selector: 'gw-account-info',
  templateUrl: './account_info.ng.html',
  styleUrls: ['./account_info.scss']
})
export class AccountInfo {

  readonly account$ = this.createAccount();
  readonly data$ = this.createData();
  readonly displayedColumns = ['key', 'value'];

  constructor(private readonly apiService: ApiService) {}

  private createAccount(): Observable<AccountApiObj> {
    return this.apiService.getAccount();
  }

  private createData(): Observable<DataSourceObject[]> {
    return combineLatest([
        this.apiService.getAccount(),
        this.apiService.getWorlds(),
    ]).pipe(
        switchMap(([account, worlds]) => {
          const guildNames$ = combineLatest(account.guilds.map((guildId) => {
            return this.apiService.getGuild(guildId);
          })).pipe(map((guilds) => guilds.map((guild) => guild.name)));

          return combineLatest([
              observableOf(account),
              observableOf(worlds),
              guildNames$,
          ]);
        }),
        map(([account, worlds, guildNames]) => {
          return this.createDataSourceFromAccount(account, worlds, guildNames);
        }),
    );
  }

  private createDataSourceFromAccount(
      account: AccountApiObj, worlds: WorldApiObj[], guildNames: string[]):
      DataSourceObject[] {
    const dataArray = [];
    const world = worlds.find((world) => world.id === account.world);

    dataArray.push({key: 'Name', value: account.name});
    dataArray.push({key: 'Age', value: secondsToDuration(account.age)});
    dataArray.push({key: 'World', value: world?.name ?? ''});
    dataArray.push({key: 'WvW Rank', value: account.wvw_rank});
    dataArray.push({
      key: 'Created',
      value: dateStringToMediumDate(account.created),
    });
    dataArray.push({key: 'Fractal Level', value: account.fractal_level});
    dataArray.push({key: 'Guilds', value: guildNames.join(', ')});

    return dataArray;
  }
}
