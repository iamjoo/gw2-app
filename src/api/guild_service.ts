import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

interface GuildApiObj {
  readonly name: string;
  readonly id: string;
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
}
