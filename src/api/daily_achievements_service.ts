import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

export interface DailyAchievementsApiObj {
  readonly pve: DailyAchievementApiObj[];
  readonly pvp: DailyAchievementApiObj[];
  readonly wvw: DailyAchievementApiObj[];
  readonly fractals: DailyAchievementApiObj[];
  readonly special: DailyAchievementApiObj[];
}

export interface DailyAchievementApiObj {
  readonly id: number;
  readonly level: {
    readonly min: number;
    readonly max: number;
  };
}

enum Path {
  DAILY_ACHIEVEMENTS = 'achievements/daily',
  DAILY_ACHIEVEMENTS_TOMORROW = 'achievements/daily/tomorrow',
}

@Injectable({providedIn: 'root'})
export class DailyAchievementsService {

  private readonly dailyAchievements$ = this.createDailyAchievements();
  private readonly dailyAchievementsTomorrow$ = this.createDailyAchievementsTomorrow();

  constructor(private readonly apiService: ApiService) {}

  getDailyAchievements(): Observable<DailyAchievementsApiObj> {
    return this.dailyAchievements$;
  }

  getDailyAchievementsTomorrow(): Observable<DailyAchievementsApiObj> {
    return this.dailyAchievementsTomorrow$;
  }

  private createDailyAchievements(): Observable<DailyAchievementsApiObj> {
    return this.apiService
      .nonAuthenticatedFetch<DailyAchievementsApiObj>(Path.DAILY_ACHIEVEMENTS)
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }

  private createDailyAchievementsTomorrow(): Observable<DailyAchievementsApiObj> {
    return this.apiService
      .nonAuthenticatedFetch<DailyAchievementsApiObj>(Path.DAILY_ACHIEVEMENTS_TOMORROW)
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }
}
