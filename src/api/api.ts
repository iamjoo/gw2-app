import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {EMPTY, Observable} from 'rxjs';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';

import {AccountApiObj, AchievementApiObj, CharacterApiObj, DailyAchievementsApiObj, FileApiObj, GuildApiObj, ItemApiObj, MasteryPointsApiObj, TitleApiObj, PvpApiObj, WorldApiObj} from './models';
import {ApiKeyService} from '../api_key/api_key';
// https://wiki.guildwars2.com/wiki/API:Main

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
  MASTERY_POINTS = 'account/mastery/points',
  PVP = 'pvp/stats',
  TITLES = 'titles',
  WORLDS = 'worlds',
  WVW_RANKS = 'wvw/ranks',
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly account$ = this.createAccount();
  private readonly characters$ = this.createCharacters();
  private readonly dailyAchievements$ = this.createDailyAchievements();
  private readonly files$ = this.createFilesMap();
  private readonly masteryPoints$ = this.createMasteryPoints();
  private readonly pvpStats$ = this.createPvpStats();
  private readonly worlds$ = this.createWorlds();

  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly http: HttpClient
  ) {}

  getAccount(): Observable<AccountApiObj> {
    return this.account$;
  }

  getAchievements(ids: number[]): Observable<AchievementApiObj[]> {
    const params = {ids: `${ids.join(',')}`};
    return this.http.get<AchievementApiObj[]>(
      `${ROOT_URL}${Path.ACHIEVEMENTS}`,
      {params}
    );
  }

  getCharacters(): Observable<CharacterApiObj[]> {
    return this.characters$;
  }

  getDailyAchievements(): Observable<DailyAchievementsApiObj> {
    return this.dailyAchievements$;
  }

  getFilesMap(): Observable<Map<string, string>> {
    return this.files$;
  }

  getGuild(id: string): Observable<GuildApiObj> {
    return this.http.get<GuildApiObj>(`${ROOT_URL}${Path.GUILD}/${id}`);
  }

  getItem(id: number): Observable<ItemApiObj> {
    return this.http.get<ItemApiObj>(`${ROOT_URL}${Path.ITEMS}/${id}`);
  }

  getMasteryPoints(): Observable<MasteryPointsApiObj> {
    return this.masteryPoints$;
  }

  getPvpStats(): Observable<PvpApiObj> {
    return this.pvpStats$;
  }

  getTitle(id: number): Observable<TitleApiObj> {
    return this.http.get<TitleApiObj>(`${ROOT_URL}${Path.TITLES}/${id}`);
  }

  getWorlds(): Observable<WorldApiObj[]> {
    return this.worlds$;
  }

  private createAccount(): Observable<AccountApiObj> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http.get<AccountApiObj>(`${ROOT_URL}${Path.ACCOUNT}`, {
          params,
        });
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createCharacters(): Observable<CharacterApiObj[]> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey, ids: 'all'};
        return this.http.get<CharacterApiObj[]>(
          `${ROOT_URL}${Path.CHARACTERS}`,
          {params}
        );
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createDailyAchievements(): Observable<DailyAchievementsApiObj> {
    return this.http
      .get<DailyAchievementsApiObj>(`${ROOT_URL}${Path.DAILY_ACHIEVEMENTS}`)
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }

  private createFilesMap(): Observable<Map<string, string>> {
    const params = {ids: 'all'};
    return this.http
      .get<FileApiObj[]>(`${ROOT_URL}${Path.FILES}`, {params})
      .pipe(
        map(files => {
          const fileMap = new Map<string, string>();
          for (const file of files) {
            fileMap.set(file.id, file.icon);
          }

          return fileMap;
        }),
        shareReplay({bufferSize: 1, refCount: false})
      );
  }

  private createMasteryPoints(): Observable<MasteryPointsApiObj> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http.get<MasteryPointsApiObj>(
          `${ROOT_URL}${Path.MASTERY_POINTS}`,
          {params}
        );
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createPvpStats(): Observable<PvpApiObj> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http.get<PvpApiObj>(`${ROOT_URL}${Path.PVP}`, {params});
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createWorlds(): Observable<WorldApiObj[]> {
    const params = {ids: 'all'};
    return this.http
      .get<WorldApiObj[]>(`${ROOT_URL}${Path.WORLDS}`, {params})
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }
}
