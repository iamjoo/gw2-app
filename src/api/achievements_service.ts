import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

import {ApiService} from './api';

export interface AchievementApiObj {
  readonly id: number;
  readonly icon?: string;
  readonly name: string;
  readonly description: string;
  readonly requirement: string;
  readonly rewards: RewardApiObj[];
}

interface BaseReward {
  readonly type: 'Coins' | 'Item' | 'Mastery' | 'Title';
}

interface CoinsReward extends BaseReward {
  readonly type: 'Coins';
  readonly count: number;
}

interface ItemReward extends BaseReward {
  readonly type: 'Item';
  readonly id: number;
  readonly count: number;
}

interface MasteryReward extends BaseReward {
  readonly type: 'Mastery';
  readonly id: number;
  readonly region: string;
}

interface TitleReward extends BaseReward {
  readonly type: 'Title';
  readonly id: number;
}

type RewardApiObj = CoinsReward | ItemReward | MasteryReward | TitleReward;

const ACHIEVEMENTS_PATH = 'achievements';

@Injectable({providedIn: 'root'})
export class AchievementsService {

  constructor(private readonly apiService: ApiService) {}

  getAchievements(ids: number[]): Observable<AchievementApiObj[]> {
    const params = {ids: `${ids.join(',')}`};
    return this.apiService.nonAuthenticatedFetch<AchievementApiObj[]>(
      ACHIEVEMENTS_PATH, {params}
    );
  }
}
