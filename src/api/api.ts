import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {combineLatest, EMPTY, Observable} from 'rxjs';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';

import {AchievementApiObj, BankApiObj, DailyAchievementsApiObj, ItemApiObj, MaterialApiObj, SharedInventoryApiObj, TitleApiObj} from './models';
import {ApiKeyService} from '../api_key/api_key';
// https://wiki.guildwars2.com/wiki/API:Main

const ITEMS_LIMIT = 199;
const ROOT_URL = 'https://api.guildwars2.com/v2/';

enum Path {
  ACHIEVEMENTS = 'achievements',
  BANK = 'account/bank',
  DAILY_ACHIEVEMENTS = 'achievements/daily',
  DAILY_ACHIEVEMENTS_TOMORROW = 'achievements/daily/tomorrow',
  INVENTORY = 'account/inventory',
  ITEMS = 'items',
  MATERIALS = 'account/materials',
  TITLES = 'titles',
  WVW_RANKS = 'wvw/ranks',
}

@Injectable({providedIn: 'root'})
export class ApiService {

  private readonly bank$ = this.createBank();
  private readonly dailyAchievements$ = this.createDailyAchievements();
  private readonly dailyAchievementsTomorrow$ = this.createDailyAchievementsTomorrow();
  private readonly materials$ = this.createMaterials();
  private readonly sharedInventory$ = this.createSharedInventory();

  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly http: HttpClient
  ) {}

  getAchievements(ids: number[]): Observable<AchievementApiObj[]> {
    const params = {ids: `${ids.join(',')}`};
    return this.http.get<AchievementApiObj[]>(
      `${ROOT_URL}${Path.ACHIEVEMENTS}`,
      {params}
    );
  }

  getBank(): Observable<BankApiObj[]> {
    return this.bank$;
  }

  getDailyAchievements(): Observable<DailyAchievementsApiObj> {
    return this.dailyAchievements$;
  }

  getDailyAchievementsTomorrow(): Observable<DailyAchievementsApiObj> {
    return this.dailyAchievementsTomorrow$;
  }

  getItem(id: number): Observable<ItemApiObj> {
    return this.http.get<ItemApiObj>(`${ROOT_URL}${Path.ITEMS}/${id}`);
  }

  getItems(ids: number[]): Observable<ItemApiObj[]> {
    if (ids.length <= ITEMS_LIMIT) {
      const joinedIds = ids.join(',');
      return this.http.get<ItemApiObj[]>(
          `${ROOT_URL}${Path.ITEMS}?ids=${joinedIds}`);
    }

    let i: number;
    let j: number;
    const allJoinedIds: string[] = [];
    for (i = 0, j = ids.length; i < j; i += ITEMS_LIMIT) {
      const joinedIds = ids.slice(i, i + ITEMS_LIMIT).join(',');
      allJoinedIds.push(joinedIds);
    }

    const itemRequests$ = allJoinedIds.map((ids) => {
      return this.http.get<ItemApiObj[]>(
          `${ROOT_URL}${Path.ITEMS}?ids=${ids}`);
    });

    return combineLatest(itemRequests$).pipe(
        map((items) => items.flat(1)),
    );
  }

  getMaterials(): Observable<MaterialApiObj[]> {
    return this.materials$;
  }

  getSharedInventory(): Observable<SharedInventoryApiObj[]> {
    return this.sharedInventory$;
  }

  getTitle(id: number): Observable<TitleApiObj> {
    return this.http.get<TitleApiObj>(`${ROOT_URL}${Path.TITLES}/${id}`);
  }

  private createBank(): Observable<BankApiObj[]> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http.get<BankApiObj[]>(`${ROOT_URL}${Path.BANK}`, {
              params,
            });
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createDailyAchievements(): Observable<DailyAchievementsApiObj> {
    return this.http
      .get<DailyAchievementsApiObj>(`${ROOT_URL}${Path.DAILY_ACHIEVEMENTS}`)
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }

  private createDailyAchievementsTomorrow(): Observable<DailyAchievementsApiObj> {
    return this.http
      .get<DailyAchievementsApiObj>(`${ROOT_URL}${Path.DAILY_ACHIEVEMENTS_TOMORROW}`)
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }

  private createMaterials(): Observable<MaterialApiObj[]> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http.get<MaterialApiObj[]>(`${ROOT_URL}${Path.MATERIALS}`, {
              params,
            });
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createSharedInventory(): Observable<SharedInventoryApiObj[]> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http
            .get<SharedInventoryApiObj[]>(`${ROOT_URL}${Path.INVENTORY}`, {
              params,
            });
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  authenticatedFetch<T>(path: string, requestParams = {}): Observable<T> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap((apiKey) => {
        if (apiKey == null) {
          return EMPTY;
        }

        const params = {...requestParams, access_token: apiKey};
        return this.http.get<T>(`${ROOT_URL}${path}`, {params});
      }),
    );
  }

  nonAuthenticatedFetch<T>(path: string, params = {}): Observable<T> {
    return this.http.get<T>(`${ROOT_URL}${path}`, params);
  }
}
