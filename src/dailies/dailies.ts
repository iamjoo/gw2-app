import {Component} from '@angular/core';
import {MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions} from '@angular/material/checkbox';

import {combineLatest, Observable, of as observableOf, pipe} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {ApiService} from '../api/api';
import {AchievementApiObj, DailyAchievementApiObj, DailyAchievementsApiObj, ItemApiObj, ItemReward} from '../api/models';
import {ItemService} from '../item/item_service';
import {FRACTAL_LEVELS_MAP} from '../util/fractal_levels';

interface DailyDataSourceObject {
  readonly id: number;
  readonly name: string;
  readonly type: 'PvE'|'PvP'|'WvW'|'Fractals'|'Special';
  readonly fractalName?: string;
}

type MapChestName = 'Verdant Brink'|'Auric Basin'|'Tangled Depths'|
    'Dragon\'s Stand';

interface MapChestReward {
  readonly name: 'Amalgamated Gemstone'|'Reclaimed Metal Plate';
  readonly url: string;
}

interface MapChestDataSourceObject {
  readonly completed: boolean;
  readonly name: MapChestName;
  readonly rewards: MapChestReward[];
}

const AMALGAMATED_GEMSTONE: MapChestReward = {
  name: 'Amalgamated Gemstone',
  url: 'https://render.guildwars2.com/file/35BC2D35511C806348730A5E63152B2E260D4A5C/919363.png',
};

const RECLAIMED_METAL_PLATE: MapChestReward = {
  name: 'Reclaimed Metal Plate',
  url: 'https://render.guildwars2.com/file/AC2729C25DE5C2A3E925083570C2161F52280163/1203052.png',
};

function createMapChestDataSourceObject(id: string, apiData: string[]) {
  let name: MapChestName;
  let rewards: MapChestReward[];
  let completed: boolean;
  let itemUrls: string[];

  switch (id) {
    case 'vb':
      name = 'Verdant Brink';
      rewards = [AMALGAMATED_GEMSTONE, RECLAIMED_METAL_PLATE];
      completed = apiData.includes('verdant_brink_heros_choice_chest');
      break;
    case 'ab':
      name = 'Auric Basin';
      rewards = [AMALGAMATED_GEMSTONE];
      completed = apiData.includes('auric_basin_heros_choice_chest');
      break;
    case 'td':
      name = 'Tangled Depths';
      rewards = [AMALGAMATED_GEMSTONE];
      completed = apiData.includes('tangled_depths_heros_choice_chest');
      break;
    case 'ds':
      name = 'Dragon\'s Stand';
      rewards = [AMALGAMATED_GEMSTONE];
      completed = apiData.includes('dragons_stand_heros_choice_chest');
      break;
    default:
      throw new Error('Invalid map!');
  }

  return {name, rewards, completed};
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
  styleUrls: ['./dailies.scss'],
  providers: [
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: {clickAction: 'noop'} as MatCheckboxDefaultOptions,
    }
  ]
})
export class Dailies {

  readonly dailiesData$ = this.createDailiesData();
  readonly dailiesTomorrowData$ = this.createDailiesTomorrowData();
  readonly dailiesDisplayedColumns = [
      'type',
      'name',
  ];

  readonly mapChestsData$ = this.createMapChestsData();
  readonly mapChestsDisplayedColumns = [
      'name',
      'reward',
  ];

  constructor(
      private readonly apiService: ApiService,
      private readonly itemService: ItemService,
  ) {}

  private createDailiesData(): Observable<DailyDataSourceObject[]> {
    return this.apiService.getDailyAchievements().pipe(
        this.createDailyDataSourceObject(),
    );
  }

  private createDailiesTomorrowData(): Observable<DailyDataSourceObject[]> {
    return this.apiService.getDailyAchievementsTomorrow().pipe(
        this.createDailyDataSourceObject(),
    );
  }

  private createDailyDataSourceObject() {
    return pipe(
        switchMap((dailyAchievements: DailyAchievementsApiObj) => {
          const achievementIds = Object.values(dailyAchievements)
              .flat()
              .map((dailyAchievement: DailyAchievementApiObj) => {
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
        map(([achievementsMap, dailyAchievements]) => {
          const array: DailyDataSourceObject[] = [];
          for (const dailyAchievement of dailyAchievements.pve) {
            if (dailyAchievement.level.max !== 80) {
              continue;
            }

            const achievement = achievementsMap.get(dailyAchievement.id);
            if (!achievement) {
              continue;
            }

            array.push({
              id: achievement.id,
              name: achievement.name,
              type: 'PvE',
            });
          }

          for (const dailyAchievement of dailyAchievements.fractals) {
            const achievement = achievementsMap.get(dailyAchievement.id);
            if (!achievement) {
              continue;
            }

            const name = achievement.name;
            if (!name.toLowerCase().includes('tier 4') &&
                !name.toLowerCase().includes('recommended')) {
              continue;
            }

            const index = name.toLowerCase().lastIndexOf('scale');
            if (index < 0) {
              array.push({
                id: achievement.id,
                name,
                type: 'Fractals',
              });
              continue;
            }

            const level = Number(name.slice(index + 6));
            if (isNaN(level)) {
              array.push({
                id: achievement.id,
                name,
                type: 'Fractals',
              });
              continue;
            }

            const fractalName = FRACTAL_LEVELS_MAP[level] ?? '';
            array.push({
              id: achievement.id,
              name: `Daily Recommended ${level} ${fractalName}`,
              type: 'Fractals',
            });
          }

          for (const dailyAchievement of dailyAchievements.wvw) {
            const achievement = achievementsMap.get(dailyAchievement.id);
            if (!achievement) {
              continue;
            }

            array.push({
              id: achievement.id,
              name: achievement.name,
              type: 'WvW',
            });
          }

          for (const dailyAchievement of dailyAchievements.pvp) {
            const achievement = achievementsMap.get(dailyAchievement.id);
            if (!achievement) {
              continue;
            }

            array.push({
              id: achievement.id,
              name: achievement.name,
              type: 'PvP',
            });
          }

          return array;
        }),
    );
  }

  private createMapChestsData(): Observable<MapChestDataSourceObject[]> {
    return this.apiService.getMapChestsCompleted().pipe(
        map((chestsCompleted) => {
          return ['vb', 'ab', 'td', 'ds'].map((id) => {
            return createMapChestDataSourceObject(id, chestsCompleted);
          });
        }),
    );
  }
}
