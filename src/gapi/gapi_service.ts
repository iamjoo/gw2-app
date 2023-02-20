import {Injectable, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

import {BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, takeUntil} from 'rxjs/operators';

import {GoogleApiKeyDialog} from './google_api_key_dialog';

const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const RETRY_MS = 500;
const RETRY_LIMIT = 3;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const STORAGE_KEY_GOOGLE_API_KEY = 'gw2-google-api-key';
const STORAGE_KEY_GOOGLE_CLIENT_ID = 'gw2-google-client-id';

interface GapiKeys {
  readonly apiKey: string;
  readonly clientId: string;
}

function getKeys(): GapiKeys {
  const apiKey = localStorage.getItem(STORAGE_KEY_GOOGLE_API_KEY) ?? '';
  const clientId = localStorage.getItem(STORAGE_KEY_GOOGLE_CLIENT_ID) ?? '';

  return {apiKey, clientId};
}

export enum GapiStatus {
  PENDING = 1,
  READY,
  ERROR,
}

@Injectable({
  providedIn: 'root',
})
export class GapiService implements OnDestroy {
  private readonly destroy$ = new ReplaySubject<void>(1);
  private readonly apiKeysInternal$ = new BehaviorSubject<GapiKeys>(getKeys());
  private readonly gapiClientStatusInternal$ =
      new BehaviorSubject<GapiStatus>(GapiStatus.PENDING);
  private readonly tokenClientStatusInternal$ =
      new BehaviorSubject<GapiStatus>(GapiStatus.PENDING);
  private readonly isUserAuthorizedInternal$ =
      new BehaviorSubject<boolean>(false);
  private readonly initGapiClient$ = new Subject<void>();
  private readonly initTokenClient$ = new Subject<void>();
  private tokenClient: google.accounts.oauth2.TokenClient | null = null;

  readonly apiKeys$: Observable<GapiKeys> = this.apiKeysInternal$;
  readonly gapiStatus$ = this.createGapiStatus();
  readonly isUserAuthorized$: Observable<boolean> =
      this.isUserAuthorizedInternal$;

  constructor(private readonly matDialog: MatDialog) {
    this.setupInitGapiClient();
    this.setupSetTokenClient();
    this.loadGapiClient();
    this.initTokenClient();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  authorizeUser(): void {
    if (!this.tokenClient) {
      console.warn('no tokenClient');
      return;
    }

    this.tokenClient.requestAccessToken({prompt: ''});
  }

  setApiKey(): void {
    const {apiKey, clientId} = this.apiKeysInternal$.getValue();
    const config = {
      autoFocus: false,
      data: {
        apiKey,
        clientId,
      },
      width: '850px',
    };
    const dialogRef = this.matDialog.open(GoogleApiKeyDialog, config);

    dialogRef
      .afterClosed()
      .subscribe((newApiKeys: GapiKeys | null | undefined) => {
        // User clicked cancel
        if (newApiKeys === undefined) {
          return;
        }

        if (newApiKeys === null) {
          // User clicked remove key
          localStorage.removeItem(STORAGE_KEY_GOOGLE_API_KEY);
          localStorage.removeItem(STORAGE_KEY_GOOGLE_CLIENT_ID);
          this.apiKeysInternal$.next({apiKey: '', clientId: ''});
          return;
        }

        // setItem should be caught
        const {apiKey, clientId} = newApiKeys;
        localStorage.setItem(STORAGE_KEY_GOOGLE_API_KEY, apiKey);
        localStorage.setItem(STORAGE_KEY_GOOGLE_CLIENT_ID, clientId);

        this.apiKeysInternal$.next({apiKey, clientId});
      });
  }

  private createGapiStatus(): Observable<GapiStatus> {
    return combineLatest([
        this.gapiClientStatusInternal$,
        this.tokenClientStatusInternal$,
    ]).pipe(
        map(([gapiClientStatus, tokenClientStatus]) => {
          if (gapiClientStatus === GapiStatus.ERROR ||
              tokenClientStatus === GapiStatus.ERROR) {
            return GapiStatus.ERROR;
          }

          if (gapiClientStatus === GapiStatus.READY &&
              tokenClientStatus === GapiStatus.READY) {
            return GapiStatus.READY;
          }

          return GapiStatus.PENDING;
        }),
        distinctUntilChanged(),
        shareReplay({bufferSize: 1, refCount: false}),
    );
  }

  private loadGapiClient(attemptNum = 0): void {
    if (attemptNum >= RETRY_LIMIT) {
      console.log('GAPI retry exceeded');
      this.gapiClientStatusInternal$.next(GapiStatus.ERROR);
      return;
    }

    if (!window.gapi) {
      setTimeout(() => this.loadGapiClient(attemptNum + 1), RETRY_MS);
      return;
    }

    gapi.load('client', () => this.initGapiClient$.next());
  }

  private setupInitGapiClient(): void {
    combineLatest([
        this.initGapiClient$,
        this.apiKeysInternal$,
    ]).pipe(
      takeUntil(this.destroy$),
    ).subscribe(async ([, {apiKey}]) => {
      if (!apiKey) {
        return;
      }

      await gapi.client.init({
        apiKey,
        discoveryDocs: [DISCOVERY_DOC],
      });
      this.gapiClientStatusInternal$.next(GapiStatus.READY);
    });
  }

  private initTokenClient(attemptNum = 0): void {
    if (attemptNum >= RETRY_LIMIT) {
      console.log('GIS retry exceeded');
      this.tokenClientStatusInternal$.next(GapiStatus.ERROR);
      return;
    }

    if (!window.google) {
      setTimeout(() => this.initTokenClient(attemptNum + 1), RETRY_MS);
      return;
    }

    this.initTokenClient$.next();
  }

  private setupSetTokenClient(): void {
    combineLatest([
        this.initTokenClient$,
        this.apiKeysInternal$,
    ]).pipe(
      takeUntil(this.destroy$),
    ).subscribe(async ([, {clientId}]) => {
      console.log('new client id', clientId);
      if (!clientId) {
        return;
      }

      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: async (resp) => {
          if (!!resp.error) {
            console.warn(resp.error_description);
            return;
          }
          this.isUserAuthorizedInternal$.next(true);
        },
        error_callback: (e) => {
          console.warn(e);
        },
      });

      this.tokenClientStatusInternal$.next(GapiStatus.READY);
    });
  }
}
