import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {map, shareReplay, switchMap, withLatestFrom} from 'rxjs/operators';

import {ApiService} from './api';

export type WorldPopulationApi =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'Full';

export interface WorldApiObj {
  readonly id: number;
  readonly name: string;
  readonly population: WorldPopulationApi;
}

interface MatchupWorldsApiObj {
  readonly red: number[];
  readonly blue: number[];
  readonly green: number[];
}

interface MatchupApiObj {
  readonly id: string;
  readonly all_worlds: MatchupWorldsApiObj;
}

export interface WvwMatchup {
  readonly matchupId: string;
  readonly redWorlds: string[];
  readonly blueWorlds: string[];
  readonly greenWorlds: string[];
}

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

  getWvwMatchups(): Observable<Map<string, WvwMatchup>> {
    return this.wvwMatchups$;
  }

  private createWorlds(): Observable<WorldApiObj[]> {
    const params = {ids: 'all'};

    return this.apiService
      .nonAuthenticatedFetch<WorldApiObj[]>(WORLDS_PATH, {params})
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }

  private createWvwMatchups(): Observable<Map<string, WvwMatchup>> {
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

                        const matchupIdToMatchupMap =
                            new Map<string, WvwMatchup>();

                        matchups.forEach((matchup) => {
                          const matchupId = matchup.id;
                          const worldMatchups = matchup.all_worlds;
                          const redWorlds = worldMatchups.red
                              .map((worldId) => {
                                    return worldIdToNameMap.get(worldId) ?? '';
                                  })
                              .filter((worldName) => worldName);
                          const blueWorlds = worldMatchups.blue
                              .map((worldId) => {
                                    return worldIdToNameMap.get(worldId) ?? '';
                                  })
                              .filter((worldName) => worldName);
                          const greenWorlds = worldMatchups.green
                              .map((worldId) => {
                                    return worldIdToNameMap.get(worldId) ?? '';
                                  })
                              .filter((worldName) => worldName);

                          const matchupObj = {
                            matchupId,
                            redWorlds,
                            blueWorlds,
                            greenWorlds,
                          };
                          matchupIdToMatchupMap.set(matchupId, matchupObj);
                        });

                        return matchupIdToMatchupMap;
                      }),
              );
            }),
            shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
