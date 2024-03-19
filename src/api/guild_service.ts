import {Injectable} from '@angular/core';

import {Observable, of as observableOf} from 'rxjs';
import {catchError, shareReplay, switchMap} from 'rxjs/operators';

import {ApiService} from './api';

export interface GuildApiObj {
  readonly name: string;
  readonly id: string;
}

export interface GuildVaultApiObj {
  readonly inventory: Array<GuildStashInventoryApiObj|null>;
}

interface GuildStashInventoryApiObj {
  readonly id: number;
  readonly count: number;
}

const GUILD_PATH = 'guild';

@Injectable({providedIn: 'root'})
export class GuildService {

  private readonly guildIdToGuild = new Map<string, Observable<GuildApiObj>>();

  constructor(private readonly apiService: ApiService) {}

  getGuild(id: string): Observable<GuildApiObj> {
    if (!this.guildIdToGuild.has(id)) {
      const guild$ =
          this.apiService.nonAuthenticatedFetch<GuildApiObj>(
              `${GUILD_PATH}/${id}`).pipe(
              shareReplay({bufferSize: 1, refCount: false}));

      this.guildIdToGuild.set(id, guild$);
    }

    return this.guildIdToGuild.get(id)!;
  }

  getGuildStash(id: string): Observable<GuildVaultApiObj[]> {
    const path = `${GUILD_PATH}/${id}/stash`;
    return this.apiService.authenticatedFetch<GuildVaultApiObj[]>(path).pipe(
        catchError((err) => {
          const emptyVault: GuildVaultApiObj = {inventory: []};
          return observableOf([emptyVault]);
        }),
    );
  }
}
