import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {map, shareReplay, switchMap, withLatestFrom} from 'rxjs/operators';

import {ApiService} from './api';

export type WorldPopulationApiString =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'Full';

export interface WorldApiObj {
  readonly id: number;
  readonly name: string;
  readonly population: WorldPopulationApiString;
}

interface MatchupWorldsApiObj {
  readonly red: number[];
  readonly blue: number[];
  readonly green: number[];
}

interface MatchupScoreApiObj {
  readonly red: number;
  readonly blue: number;
  readonly green: number;
}

interface MatchupApiObj {
  readonly id: string;
  readonly scores: MatchupScoreApiObj;
  readonly all_worlds: MatchupWorldsApiObj;
}

export type Region = 'na'|'eu';

export interface WvwMatchup {
  readonly region: Region;
  readonly tier: number;
  readonly red: WvwTeamInfo;
  readonly blue: WvwTeamInfo;
  readonly green: WvwTeamInfo;
}

interface WvwTeamInfo {
  readonly worldNames: string[];
  readonly worldIds: number[];
  readonly score: number;
}

export const EU_ID_PREFIX = '2';
export const NA_ID_PREFIX = '1';

const MATCHUPS_PATH = 'wvw/matches';
const WORLDS_PATH = 'worlds';

@Injectable({providedIn: 'root'})
export class WorldService {

  private readonly worlds$ = this.createWorlds();
  private readonly wvwMatchups$ = this.createWvwMatchups();

  constructor(private readonly apiService: ApiService) {}

  getWorlds(): Observable<WorldApiObj[]> {
    return this.worlds$;
  }

  getWvwMatchups(): Observable<WvwMatchup[]> {
    return this.wvwMatchups$;
  }

  private createWorlds(): Observable<WorldApiObj[]> {
    const params = {ids: 'all'};

    return this.apiService
      .nonAuthenticatedFetch<WorldApiObj[]>(WORLDS_PATH, {params})
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }

  private createWvwMatchups(): Observable<WvwMatchup[]> {
    return this.apiService
        .nonAuthenticatedFetch<string[]>(MATCHUPS_PATH)
        .pipe(
            switchMap((matchupIds) => {
              const path = `${MATCHUPS_PATH}?ids=${matchupIds.join(',')}`;
              return this.apiService
                  .nonAuthenticatedFetch<MatchupApiObj[]>(path).pipe(
                      withLatestFrom(this.worlds$),
                      map(([matchups, worlds]) => {
                        const worldIdToNameMap = new Map<number, string>(
                            worlds.map(({id, name}) => [id, name]));

                        return matchups.map((matchup) => {
                          const matchupId = matchup.id;
                          const worldMatchups = matchup.all_worlds;
                          const redWorldNames = worldMatchups.red
                              .map((worldId) => {
                                    return worldIdToNameMap.get(worldId) ?? '';
                                  })
                              .filter((worldName) => worldName);
                          const blueWorldNames = worldMatchups.blue
                              .map((worldId) => {
                                    return worldIdToNameMap.get(worldId) ?? '';
                                  })
                              .filter((worldName) => worldName);
                          const greenWorldNames = worldMatchups.green
                              .map((worldId) => {
                                    return worldIdToNameMap.get(worldId) ?? '';
                                  })
                              .filter((worldName) => worldName);

                          const region: Region =
                              matchup.id.split('-')[0] === NA_ID_PREFIX ?
                                  'na' : 'eu';
                          const tier = Number(matchup.id.split('-')[1]);

                          return {
                            matchupId,
                            region,
                            tier,
                            red: {
                              worldIds: worldMatchups.red,
                              worldNames: redWorldNames,
                              score: matchup.scores.red,
                            },
                            blue: {
                              worldIds: worldMatchups.blue,
                              worldNames: blueWorldNames,
                              score: matchup.scores.blue,
                            },
                            green: {
                              worldIds: worldMatchups.green,
                              worldNames: greenWorldNames,
                              score: matchup.scores.green,
                            },
                          };
                        });
                      }),
              );
            }),
            shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
