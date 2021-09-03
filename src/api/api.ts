import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {AccountApiObj, AchievementApiObj, BuildApiObj, DailyAchievementsApiObj, GuildApiObj, ItemApiObj, WorldApiObj} from './models';

// https://wiki.guildwars2.com/wiki/API:Main

const API_KEY =
    '480D37DC-78F2-8445-8399-2B68049DE055A1AD299C-7A6B-424B-BF2D-64E620017850';

const ROOT_URL = 'https://api.guildwars2.com/v2/';

enum Path {
  ACCOUNT = 'account',
  ACHIEVEMENTS = 'achievements',
  BUILD = 'build',
  CHARACTERS = 'characters',
  COIN_EXCHANGE = 'commerce/exchange/coins',
  COLORS = 'colors',
  DAILY_ACHIEVEMENTS = 'achievements/daily',
  FILES = 'files',
  GEM_EXCHANGE = 'commerce/exchange/gems',
  GUILD = 'guild',
  ITEMS = 'items',
  WORLDS = 'worlds',
  WVW_RANKS = 'wvw/ranks',
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(private readonly http: HttpClient) {}

  getAccount(): Observable<AccountApiObj> {
    const params = {'access_token': API_KEY}
    return this.http.get<AccountApiObj>(`${ROOT_URL}${Path.ACCOUNT}`, {params});
  }

  getAchievements(ids: number[]): Observable<AchievementApiObj[]> {
    const params = {'ids': `${ids.join(',')}`}
    return this.http.get<AchievementApiObj[]>(`${ROOT_URL}${Path.ACHIEVEMENTS}`,
        {params});
  }

  getBuild(): Observable<BuildApiObj> {
    return this.http.get<BuildApiObj>(`${ROOT_URL}${Path.BUILD}`);
  }

  getDailyAchievements(): Observable<DailyAchievementsApiObj> {
    return this.http.get<DailyAchievementsApiObj>(`${ROOT_URL}${Path.DAILY_ACHIEVEMENTS}`);
  }

  getGuild(id: string): Observable<GuildApiObj> {
    return this.http.get<GuildApiObj>(`${ROOT_URL}${Path.GUILD}/${id}`);
  }

  getItem(id: number): Observable<ItemApiObj> {
    return this.http.get<ItemApiObj>(`${ROOT_URL}${Path.ITEMS}/${id}`);
  }

  getWorlds(): Observable<WorldApiObj[]> {
    const params = {'ids': 'all'}
    return this.http.get<WorldApiObj[]>(`${ROOT_URL}${Path.WORLDS}`, {params});
  }
}
