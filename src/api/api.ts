import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {combineLatest, EMPTY, Observable} from 'rxjs';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';

import {DailyAchievementsApiObj} from './models';
import {ApiKeyService} from '../api_key/api_key';
// https://wiki.guildwars2.com/wiki/API:Main

const ROOT_URL = 'https://api.guildwars2.com/v2/';

enum Path {
  DAILY_ACHIEVEMENTS = 'achievements/daily',
  DAILY_ACHIEVEMENTS_TOMORROW = 'achievements/daily/tomorrow',
}

@Injectable({providedIn: 'root'})
export class ApiService {

  private readonly dailyAchievements$ = this.createDailyAchievements();
  private readonly dailyAchievementsTomorrow$ = this.createDailyAchievementsTomorrow();

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
