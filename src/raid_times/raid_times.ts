import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';

import {combineLatest, Observable, of as observableOf, Subject} from 'rxjs';
import {catchError, distinctUntilChanged, filter, map, shareReplay, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {GapiService, GapiStatus} from '../gapi/gapi_service';
import {SheetsService} from '../sheets/sheets_service';
import {SecondsToDurationShort} from '../util/seconds_to_duration';
import {StringToDate} from '../util/string_to_date';

const WING_ICON = 'https://render.guildwars2.com/file/5866630DA52DCB5C423FB81ECF69FD071611E36B/1128644.png';

enum PofEncounter {
  SOULLESS_HORROR = 'Soulless Horror',
  RIVER = 'River of Souls',
  BROKEN_KING = 'Broken King',
  EATER = 'Eater of Souls',
  EYES = 'Eyes',
  DHUUM = 'Dhuum',
  CA = 'Conjured Amalgamate',
  TL = 'Twin Largos',
  Q1 = 'Qadim',
  ADINA = 'Adina',
  SABIR = 'Sabir',
  QTP = 'Qadim the Peerless',
}

enum Wing {
  WING_5 = 'Wing 5: Hall of Chains',
  WING_6 = 'Wing 6: Mythwright Gambit',
  WING_7 = 'Wing 7: The Key of Ahdashim',
}

const POF_ENCOUNTER_BY_ROW = [
    null, // first row is empty
    PofEncounter.SOULLESS_HORROR,
    PofEncounter.RIVER,
    PofEncounter.BROKEN_KING,
    PofEncounter.EATER,
    PofEncounter.EYES,
    PofEncounter.DHUUM,
    PofEncounter.CA,
    PofEncounter.TL,
    PofEncounter.Q1,
    PofEncounter.ADINA,
    PofEncounter.SABIR,
    PofEncounter.QTP,
];

function durationStringToSeconds(durationString: string): number {
  const splitStrings = durationString.split(':');
  const minutesString = splitStrings[0];
  const secondsString = splitStrings[1];
  return (60 * Number(minutesString)) + Number(secondsString);
}

interface DayInfo {
  readonly date: Date;
  readonly durationSeconds: number;
  readonly beatGoal: boolean;
  readonly goalDiffSeconds: number;
  readonly isNewRecord: boolean;
  readonly prevRecordDiffSeconds: number;
}

interface DataSourceObject {
  readonly encounter: PofEncounter|Wing;
  readonly goalTimeSeconds: number;
  readonly recordTimeSeconds: number;
  readonly beatGoal: boolean;
  readonly goalDiffSeconds: number;
  readonly isWing?: boolean;
  readonly dayInfos: DayInfo[];
}

@Component({
  selector: 'gw-raid-times',
  templateUrl: './raid_times.ng.html',
  styleUrls: ['./raid_times.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    SecondsToDurationShort,
    StringToDate,
  ],
  standalone: true,
})
export class RaidTimes {
  private readonly refreshData$ = new Subject<void>();
  private readonly goalTimes$: Observable<Map<PofEncounter, number>> =
      this.createGoalTimes();
  private readonly weeklyClearTimes$: Observable<string[][] | undefined> =
      this.createWeeklyClearTimes();
  private readonly recordTimes$: Observable<Map<PofEncounter, number>> =
      this.createRecordTimes(this.weeklyClearTimes$);

  readonly GapiStatus = GapiStatus;
  readonly wingIcon = WING_ICON;
  readonly gapiStatus$: Observable<GapiStatus> = this.gapiService.gapiStatus$;
  readonly isAuthorized$: Observable<boolean> = this.createIsAuthorized();
  readonly isMissingKeys$: Observable<boolean> = this.createIsMissingKeys();
  readonly displayedColumns$: Observable<string[]> =
      this.createDisplayedColumns(this.weeklyClearTimes$);
  readonly data$: Observable<DataSourceObject[]> =
      this.createData(
          this.weeklyClearTimes$, this.goalTimes$, this.recordTimes$);

  constructor(
      private readonly gapiService: GapiService,
      private readonly sheetsService: SheetsService,
  ) {}

  authorizeUser(): void {
    this.gapiService.authorizeUser();
  }

  refreshData(): void {
    this.refreshData$.next();
  }

  setApiKeys(): void {
    this.gapiService.setApiKey();
  }

  private createIsAuthorized(): Observable<boolean> {
    return this.gapiService.isUserAuthorized$.pipe(
        distinctUntilChanged(),
        tap(a => console.log('isAuthorized', a)),
    );
  }

  private createIsMissingKeys(): Observable<boolean> {
    return this.gapiService.apiKeys$.pipe(
        map(({apiKey, clientId}) => !apiKey || !clientId),
        distinctUntilChanged(),
        tap(a => console.log('isMissingKeys', a)),
    );
  }

  private createDisplayedColumns(
      weeklyClearTimes$: Observable<string[][] | undefined>):
          Observable<string[]> {
    return weeklyClearTimes$.pipe(
        map((clearTimes) => {
          const columns = ['encounter', 'goalTime', 'recordTime'];
          if (!clearTimes) {
            return columns;
          }

          // [
          //   ['', '2023-01-01', '2023-01-08'], // the header row
          //   ['Qadim', '03:02', '05:24'],
          // ]
          // clearTimes[r][c], where r is the row number and c is the column.
          const dates = clearTimes[0]
              .filter((val) => val.includes('-'))
              .reverse();
          return columns.concat(dates);
        }),
    );
  }

  private createData(
      weeklyClearTimes$: Observable<string[][] | undefined>,
      goalTimes$: Observable<Map<PofEncounter, number>>,
      recordTimes$: Observable<Map<PofEncounter, number>>,
  ): Observable<DataSourceObject[]> {
    return combineLatest([
      weeklyClearTimes$,
      goalTimes$,
      recordTimes$,
    ]).pipe(
        map(([clearTimes, goalTimes, recordTimes]) => {
          const dataSourceObjects: DataSourceObject[] = [];
          const dates = clearTimes ? clearTimes[0] : [];

          for (let i = 1; i < POF_ENCOUNTER_BY_ROW.length; i++) {
            const encounter = POF_ENCOUNTER_BY_ROW[i];
            if (!encounter) {
              continue;
            }

            let wing: Wing|undefined;
            switch (encounter) {
              case PofEncounter.SOULLESS_HORROR:
                wing = Wing.WING_5;
                break;
              case PofEncounter.CA:
                wing = Wing.WING_6;
                break;
              case PofEncounter.ADINA:
                wing = Wing.WING_7;
                break;
              default:
                // do nothing
            }

            if (wing) {
              dataSourceObjects.push({
                encounter: wing,
                goalTimeSeconds: 0,
                recordTimeSeconds: 0,
                beatGoal: false,
                goalDiffSeconds: 0,
                isWing: true,
                dayInfos: [],
              });
            }

            const goalTimeSeconds = goalTimes.get(encounter) ?? 0;
            const recordTimeSeconds = recordTimes.get(encounter) ?? 0;
            const beatGoal = recordTimeSeconds < goalTimeSeconds;
            const goalDiffSeconds = goalTimeSeconds - recordTimeSeconds;
            const dayInfos: DayInfo[] = [];
            if (!clearTimes) {
              dataSourceObjects.push({
                encounter,
                goalTimeSeconds,
                recordTimeSeconds,
                beatGoal,
                goalDiffSeconds,
                dayInfos,
              });
              continue;
            }

            // [
            //   ['', '2023-01-01', '2023-01-08'], // the header row
            //   ['Qadim', '03:02', '05:24'],
            // ]
            // clearTimes[r][c], where r is the row number and c is the column.
            const weeklyEncounterTimes = clearTimes[i];

            // Use dates instead of weeklyEncounterTimes because trailing
            // empty columns are excluded from the response.
            for (let j = 1; j < dates.length; j++) {
              const date = new Date(dates[j]);

              const durationString = weeklyEncounterTimes[j];
              if (!durationString) {
                dayInfos.push({
                  date,
                  durationSeconds: 0,
                  beatGoal: false,
                  goalDiffSeconds: 0,
                  isNewRecord: false,
                  prevRecordDiffSeconds: 0,
                });
                continue;
              }

              const durationSeconds = durationStringToSeconds(durationString);
              const beatGoal = durationSeconds < goalTimeSeconds;
              const goalDiffSeconds = goalTimeSeconds - durationSeconds;

              if (j === 1) {
                dayInfos.push({
                  date,
                  durationSeconds,
                  beatGoal,
                  goalDiffSeconds,
                  isNewRecord: false,
                  prevRecordDiffSeconds: 0,
                });
                continue;
              }

              // We only care about times so we filter by values with ':' in them
              // and then convert them to seconds.
              const previousTimes = weeklyEncounterTimes.slice(1, j)
                  .filter((val) => val.includes(':'))
                  .map((val) => durationStringToSeconds(val));
              const previousRecordTime = previousTimes.length > 0 ?
                  Math.min(...previousTimes) : -1;

              if (previousRecordTime < 0) {
                dayInfos.push({
                  date,
                  durationSeconds,
                  beatGoal,
                  goalDiffSeconds,
                  isNewRecord: false,
                  prevRecordDiffSeconds: 0,
                });
                continue;
              }

              const isNewRecord = durationSeconds < previousRecordTime;
              const prevRecordDiffSeconds =
                  previousRecordTime - durationSeconds;

              dayInfos.push({
                date,
                durationSeconds,
                beatGoal,
                goalDiffSeconds,
                isNewRecord,
                prevRecordDiffSeconds,
              });
            }

            dataSourceObjects.push({
              encounter,
              goalTimeSeconds,
              recordTimeSeconds,
              beatGoal,
              goalDiffSeconds,
              dayInfos: dayInfos.reverse(),
            });
          }

          return dataSourceObjects;
        }),
    );
  }

  private createGoalTimes(): Observable<Map<PofEncounter, number>> {
    return this.gapiService.isUserAuthorized$.pipe(
        filter((isAuthorized) => isAuthorized),
        distinctUntilChanged(),
        switchMap(() => {
          return this.refreshData$.pipe(
              startWith(undefined),
              switchMap(() => {
                return this.sheetsService.getGoalTimes().pipe(
                    catchError((e) => {
                      console.warn(e);
                      return observableOf(undefined);
                    }),
                );
              }),
          )
        }),
        map((response) => {
          const data = response?.result.values;
          const encounterGoalTimes = new Map<PofEncounter, number>();
          if (!data) {
            return encounterGoalTimes;
          }

          for (let i = 1; i < POF_ENCOUNTER_BY_ROW.length; i++) {
            const encounter = POF_ENCOUNTER_BY_ROW[i];
            if (!encounter) {
              continue;
            }

            // [
            //   ['', 'Target'],      // the header row
            //   ['Qadim', '03:00'],
            // ]
            // data[r][c], where r is the row number and c is the column. The
            // first column is the encounter name and the second column is the
            // goal time
            encounterGoalTimes.set(
                encounter, durationStringToSeconds(data[i][1]));
          }

          return encounterGoalTimes;
        }),
    );
  }

  private createRecordTimes(
      weeklyClearTimes$: Observable<string[][] | undefined>):
          Observable<Map<PofEncounter, number>> {
    return weeklyClearTimes$.pipe(
        map((clearTimes) => {
          const encounterRecordTimes = new Map<PofEncounter, number>();
          if (!clearTimes) {
            return encounterRecordTimes;
          }

          for (let i = 1; i < POF_ENCOUNTER_BY_ROW.length; i++) {
            const encounter = POF_ENCOUNTER_BY_ROW[i];
            if (!encounter) {
              continue;
            }

            // [
            //   ['', '2023-01-01', '2023-01-08'], // the header row
            //   ['Qadim', '03:02', '05: 24'],
            // ]
            // clearTimes[r][c], where r is the row number and c is the column.
            // We only care about times so we filter by values with ':' in them
            // and then convert them to seconds.
            const encounterTimes = clearTimes[i]
                .filter((val) => val.includes(':'))
                .map((val) => durationStringToSeconds(val));
            const recordTime = encounterTimes.length > 0 ?
                Math.min(...encounterTimes) : -1;

            if (recordTime > 0) {
              encounterRecordTimes.set(encounter, recordTime);
            }
          }

          return encounterRecordTimes;
        }),
    );
  }

  private createWeeklyClearTimes(): Observable<string[][] | undefined> {
    return this.gapiService.isUserAuthorized$.pipe(
        filter((isAuthorized) => isAuthorized),
        distinctUntilChanged(),
        switchMap(() => {
          return this.refreshData$.pipe(
              startWith(undefined),
              switchMap(() => {
                return this.sheetsService.getWeeklyClearTimes().pipe(
                    catchError((e) => {
                      console.warn(e);
                      return observableOf(undefined);
                    }),
                );
              }),
          )
        }),
        map((response) => {
          const data = response?.result.values;
          return data;
        }),
        shareReplay({bufferSize: 1, refCount: true}),
    );
  }
}
