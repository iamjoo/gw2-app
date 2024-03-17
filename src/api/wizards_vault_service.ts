import {Injectable} from '@angular/core';

import {EMPTY, Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

enum Path {
  WIZARDS_VAULT_DAILY = 'account/wizardsvault/daily',
  WIZARDS_VAULT_SPECIAL = 'account/wizardsvault/special',
  WIZARDS_VAULT_WEEKLY = 'account/wizardsvault/weekly',
}

type WizardsVaultObjectiveTrack = 'PvE'|'WvW'|'PvP';

export interface WizardsVaultProgressApiObj {
  readonly meta_progress_current: number;
  readonly meta_progress_complete: number;
  readonly meta_reward_astral: number;
  readonly objectives: WizardsVaultObjectiveApiObj[];
}

export interface WizardsVaultSpecialProgressApiObj {
  readonly objectives: WizardsVaultObjectiveApiObj[];
}

export interface WizardsVaultObjectiveApiObj {
  readonly id: number;
  readonly title: string;
  readonly track: WizardsVaultObjectiveTrack;
  readonly acclaim: number;
  readonly progress_current: number;
  readonly progress_complete: number;
  readonly claimed: boolean;
}

@Injectable({providedIn: 'root'})
export class WizardsVaultService {

  private readonly wizardsVaultDaily$ = this.createWizardsVaultDaily();
  private readonly wizardsVaultSpecial$ = this.createWizardsVaultSpecial();
  private readonly wizardsVaultWeekly$ = this.createWizardsVaultWeekly();

  constructor(private readonly apiService: ApiService) {}

  getWizardsVaultDaily(): Observable<WizardsVaultProgressApiObj> {
    return this.wizardsVaultDaily$;
  }

  getWizardsVaultSpecial(): Observable<WizardsVaultSpecialProgressApiObj> {
    return this.wizardsVaultSpecial$;
  }

  getWizardsVaultWeekly(): Observable<WizardsVaultProgressApiObj> {
    return this.wizardsVaultWeekly$;
  }

  private createWizardsVaultDaily(): Observable<WizardsVaultProgressApiObj> {
    return this.apiService.authenticatedFetch<WizardsVaultProgressApiObj>(
        Path.WIZARDS_VAULT_DAILY).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }

  private createWizardsVaultSpecial(): Observable<WizardsVaultSpecialProgressApiObj> {
    return this.apiService.authenticatedFetch<WizardsVaultProgressApiObj>(
        Path.WIZARDS_VAULT_SPECIAL).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }

  private createWizardsVaultWeekly(): Observable<WizardsVaultProgressApiObj> {
    return this.apiService.authenticatedFetch<WizardsVaultProgressApiObj>(
        Path.WIZARDS_VAULT_WEEKLY).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
