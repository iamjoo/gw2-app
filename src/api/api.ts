import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {combineLatest, EMPTY, Observable} from 'rxjs';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';

import {DailyAchievementsApiObj, ItemApiObj, SharedInventoryApiObj} from './models';
import {ApiKeyService} from '../api_key/api_key';
// https://wiki.guildwars2.com/wiki/API:Main

const ITEMS_LIMIT = 199;
const ROOT_URL = 'https://api.guildwars2.com/v2/';

enum Path {
  DAILY_ACHIEVEMENTS = 'achievements/daily',
  DAILY_ACHIEVEMENTS_TOMORROW = 'achievements/daily/tomorrow',
  INVENTORY = 'account/inventory',
  ITEMS = 'items',
}

@Injectable({providedIn: 'root'})
export class ApiService {

  private readonly dailyAchievements$ = this.createDailyAchievements();
  private readonly dailyAchievementsTomorrow$ = this.createDailyAchievementsTomorrow();
  private readonly sharedInventory$ = this.createSharedInventory();

  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly http: HttpClient
  ) {}

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

  getSharedInventory(): Observable<SharedInventoryApiObj[]> {
    return this.sharedInventory$;
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
