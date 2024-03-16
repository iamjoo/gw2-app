import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTableModule} from '@angular/material/table';

import {combineLatest, Observable, of as observableOf, pipe} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {ApiService} from '../api/api';
import {AchievementApiObj, DailyAchievementApiObj, DailyAchievementsApiObj, WizardsVaultProgressApiObj, WizardsVaultSpecialProgressApiObj} from '../api/models';
import {FRACTAL_LEVELS_MAP} from '../util/fractal_levels';

interface DailyDataSourceObject {
  readonly id: number;
  readonly name: string;
  readonly type: 'PvE'|'PvP'|'WvW'|'Fractals'|'Special';
  readonly fractalName?: string;
}

interface WizardsVaultDataSourceObject {
  readonly name: string;
  readonly acclaim: number;
  readonly current: number;
  readonly total: number;
  readonly progress: number;
}

function createWizardsVaultDataSourceObject() {
  return pipe(
      map((progress: WizardsVaultProgressApiObj|WizardsVaultSpecialProgressApiObj) => {
        return progress.objectives.map((objective) => {
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
      }),
      );
}

@Component({
  selector: 'gw-wizards-vault',
  templateUrl: './wizards_vault.ng.html',
  styleUrls: ['./wizards_vault.scss'],
  imports: [CommonModule, MatProgressBarModule, MatTableModule],
  standalone: true,
})
export class WizardsVault {

  readonly wizardsVaultDaily$ = this.createWizardsVaultDailyData();
  readonly wizardsVaultWeekly$ = this.createWizardsVaultWeeklyData();
  readonly wizardsVaultSpecial$ = this.createWizardsVaultSpecialData();
  readonly wizardsVaultDisplayedColumns = ['name', 'acclaim'];

  constructor(
      private readonly apiService: ApiService,
  ) {}

  private createWizardsVaultDailyData(): Observable<WizardsVaultDataSourceObject[]> {
    return this.apiService.getWizardsVaultDaily().pipe(
        createWizardsVaultDataSourceObject(),
        tap((a) => console.log(a)),
        );
  }

  private createWizardsVaultWeeklyData(): Observable<WizardsVaultDataSourceObject[]> {
    return this.apiService.getWizardsVaultWeekly().pipe(
        createWizardsVaultDataSourceObject(),
        tap((a) => console.log(a)),
        );
  }

  private createWizardsVaultSpecialData(): Observable<WizardsVaultDataSourceObject[]> {
    return this.apiService.getWizardsVaultSpecial().pipe(
        createWizardsVaultDataSourceObject(),
        tap((a) => console.log(a)),
        );
  }

  // Keeping in case a daily fractals endpoint returns
  private createDailiesData(): Observable<DailyDataSourceObject[]> {
    return this.apiService.getDailyAchievements().pipe(
        this.createDailyDataSourceObject(),
    );
  }

  // Keeping in case a daily fractals endpoint returns
  private createDailiesTomorrowData(): Observable<DailyDataSourceObject[]> {
    return this.apiService.getDailyAchievementsTomorrow().pipe(
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
}
