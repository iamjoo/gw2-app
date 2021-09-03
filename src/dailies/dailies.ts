import {Component} from '@angular/core';

import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {ApiService} from '../api/api';
import {AchievementApiObj, DailyAchievementApiObj, ItemApiObj, ItemReward} from '../api/models';

interface DataSourceObject {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly requirement: string;
  readonly level: string;
  readonly type: 'PvE'|'PvP'|'WvW'|'Fractals'|'Special';
  readonly rewards?: string;
}

function getRewardsNamesFromAchievement(
    achievement: AchievementApiObj, itemsMap: Map<number, ItemApiObj>): string {
  if (!achievement.rewards.length) {
    return 'None';
  }

  const rewardNames = [];
  for (const reward of achievement.rewards) {
    if (reward.type !== 'Item') {
      continue;
    }

    const item = itemsMap.get(reward.id);
    if (!item) {
      continue;
    }
    rewardNames.push(item.name);
  }

  if (!rewardNames.length) {
    return 'None';
  }
  return rewardNames.join(', ');
}

@Component({
  selector: 'gw-dailies',
  templateUrl: './dailies.ng.html',
  styleUrls: ['./dailies.scss']
})
export class Dailies {

  readonly data$ = this.createData();
  readonly displayedColumns = [
      'type',
      'level',
      'name',
      'requirement',
      'rewards',
  ];

  constructor(private readonly apiService: ApiService) {}

  private createData(): Observable<DataSourceObject[]> {
    return this.apiService.getDailyAchievements().pipe(
        switchMap((dailyAchievements) => {
          const achievementIds = Object.values(dailyAchievements).flat().map(
              (dailyAchievement: DailyAchievementApiObj) => {
                return dailyAchievement.id;
              });
          const achievementsMap$ =
              this.apiService.getAchievements(achievementIds).pipe(
                  map((achievements) => {
                    const map = new Map<number, AchievementApiObj>();
                    for (const achievement of achievements) {
                      map.set(achievement.id, achievement);
                    }
                    return map;
                  }));

          return combineLatest([
              achievementsMap$,
              observableOf(dailyAchievements),
          ]);
        }),
        switchMap(([achievementsMap, dailyAchievements]) => {
          const rewardsIds = Array.from(achievementsMap.values()).map(
              (achievement: AchievementApiObj) => {
                return achievement.rewards;
              })
          .flat()
          .filter((reward): reward is ItemReward => reward.type === 'Item')
          .map((reward) => reward.id);

          const itemsMap$ =
              combineLatest(rewardsIds.map((id) => this.apiService.getItem(id)))
                  .pipe(
                      map((items) => {
                        const map = new Map<number, ItemApiObj>();
                        for (const item of items) {
                          map.set(item.id, item);
                        }
                        return map;
                      }),
                  );

          return combineLatest([
              observableOf(achievementsMap),
              observableOf(dailyAchievements),
              itemsMap$,
          ]);
        }),
        map(([achievementsMap, dailyAchievements, itemsMap]) => {
          const array: DataSourceObject[] = [];
          console.log(achievementsMap);
          console.log(dailyAchievements);

          for (const dailyAchievement of dailyAchievements.pve) {
            const achievement = achievementsMap.get(dailyAchievement.id);
            if (!achievement) {
              continue;
            }

            array.push({
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              requirement: achievement.requirement,
              type: 'PvE',
              level: `${dailyAchievement.level.min} - ${dailyAchievement.level.max}`,
              rewards: getRewardsNamesFromAchievement(achievement, itemsMap),
            });
          }

          return array;
        }),
    );
  }
}
