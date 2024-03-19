import {CommonModule} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import {combineLatest, Observable, of as observableOf, pipe} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {AchievementsService, AchievementApiObj} from '../api/achievements_service';
import {AddApiKey} from '../api_key/add_api_key';
import {DailyAchievementApiObj, DailyAchievementsApiObj, DailyAchievementsService} from '../api/daily_achievements_service';
import {API_KEY_PRESENT_OBS} from '../api_key/api_key_present';
import {FRACTAL_LEVELS_MAP} from '../util/fractal_levels';
import {WizardsVaultProgressApiObj, WizardsVaultService, WizardsVaultSpecialProgressApiObj} from '../api/wizards_vault_service';
import {WizardsVaultDataSourceObject, WizardsVaultTable} from './wizards_vault_table';

interface DailyDataSourceObject {
  readonly id: number;
  readonly name: string;
  readonly type: 'PvE'|'PvP'|'WvW'|'Fractals'|'Special';
  readonly fractalName?: string;
}

type WizardsVaultApiObj = WizardsVaultProgressApiObj|WizardsVaultSpecialProgressApiObj;

function isDailyOrWeekly(apiObj: WizardsVaultApiObj): apiObj is WizardsVaultProgressApiObj {
  return (apiObj as WizardsVaultProgressApiObj).meta_progress_current != undefined;
}

function createWizardsVaultDataSourceObject() {
  return pipe(
      map((progress: WizardsVaultApiObj) => {
        const dataSourceObjects = [];

        // Add meta-progress for daily and weekly objectives
        if (isDailyOrWeekly(progress)) {
          const metaPercentProgress =
              progress.meta_progress_current / progress.meta_progress_complete;
          const metaProgress = 100 * metaPercentProgress;

          dataSourceObjects.push({
            name: 'Overall',
            acclaim: progress.meta_reward_astral,
            current: progress.meta_progress_current,
            total: progress.meta_progress_complete,
            progress: metaProgress,
          });
        }

        const objectives = progress.objectives.map((objective) => {
          const percentProgress =
              objective.progress_current / objective.progress_complete;
          const progress = 100 * percentProgress;

          return {
            name: objective.title,
            acclaim: objective.acclaim,
            current: objective.progress_current,
            total: objective.progress_complete,
            progress,
          }
        }).sort((a, b) => a.progress - b.progress);

        return dataSourceObjects.concat(objectives);
      }),
      );
}

@Component({
  selector: 'gw-wizards-vault',
  templateUrl: './wizards_vault.ng.html',
  styleUrls: ['./wizards_vault.scss'],
  imports: [AddApiKey, CommonModule, MatProgressBarModule, WizardsVaultTable],
  standalone: true,
})
export class WizardsVault {

  readonly daily$ = this.createWizardsVaultDailyData();
  readonly weekly$ = this.createWizardsVaultWeeklyData();
  readonly special$ = this.createWizardsVaultSpecialData();

  constructor(
      private readonly achievementsService: AchievementsService,
      @Inject(API_KEY_PRESENT_OBS) readonly apiKeyPresent$: Observable<boolean>,
      private readonly dailyAchievementsService: DailyAchievementsService,
      private readonly wizardsVaultService: WizardsVaultService,
  ) {}

  private createWizardsVaultDailyData(): Observable<WizardsVaultDataSourceObject[]> {
    return this.wizardsVaultService.getWizardsVaultDaily().pipe(
        createWizardsVaultDataSourceObject(),
        );
  }

  private createWizardsVaultWeeklyData(): Observable<WizardsVaultDataSourceObject[]> {
    return this.wizardsVaultService.getWizardsVaultWeekly().pipe(
        createWizardsVaultDataSourceObject(),
        );
  }

  private createWizardsVaultSpecialData(): Observable<WizardsVaultDataSourceObject[]> {
    return this.wizardsVaultService.getWizardsVaultSpecial().pipe(
        createWizardsVaultDataSourceObject(),
        );
  }

  // Keeping in case a daily fractals endpoint returns
  private createDailiesData(): Observable<DailyDataSourceObject[]> {
    return this.dailyAchievementsService.getDailyAchievements().pipe(
        this.createDailyDataSourceObject(),
    );
  }

  // Keeping in case a daily fractals endpoint returns
  private createDailiesTomorrowData(): Observable<DailyDataSourceObject[]> {
    return this.dailyAchievementsService.getDailyAchievementsTomorrow().pipe(
        this.createDailyDataSourceObject(),
    );
  }

  // Keeping in case a daily fractals endpoint returns
  private createDailyDataSourceObject() {
    return pipe(
        switchMap((dailyAchievements: DailyAchievementsApiObj) => {
          const achievementIds = Object.values(dailyAchievements)
              .flat()
              .map((dailyAchievement: DailyAchievementApiObj) => {
                return dailyAchievement.id;
              });
          const achievementsMap$ =
              this.achievementsService.getAchievements(achievementIds).pipe(
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
}
