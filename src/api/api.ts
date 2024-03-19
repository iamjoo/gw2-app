import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {combineLatest, EMPTY, Observable} from 'rxjs';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';

import {AccountApiObj, AchievementApiObj, BankApiObj, CharacterApiObj, CurrencyApiObj, DailyAchievementsApiObj, FileApiObj, GuildApiObj, ItemApiObj, MaterialApiObj, PriceApiObj, SharedInventoryApiObj, TitleApiObj, WalletApiObj} from './models';
import {ApiKeyService} from '../api_key/api_key';
// https://wiki.guildwars2.com/wiki/API:Main

const ITEMS_LIMIT = 199;
const ROOT_URL = 'https://api.guildwars2.com/v2/';

enum Path {
  ACCOUNT = 'account',
  ACHIEVEMENTS = 'achievements',
  BANK = 'account/bank',
  CHARACTERS = 'characters',
  CURRENCIES = 'currencies',
  DAILY_ACHIEVEMENTS = 'achievements/daily',
  DAILY_ACHIEVEMENTS_TOMORROW = 'achievements/daily/tomorrow',
  FILES = 'files',
  GUILD = 'guild',
  INVENTORY = 'account/inventory',
  ITEMS = 'items',
  MATERIALS = 'account/materials',
  PRICES = 'commerce/prices',
  TITLES = 'titles',
  WALLET = 'account/wallet',
  WVW_RANKS = 'wvw/ranks',
}

@Injectable({providedIn: 'root'})
export class ApiService {

  private readonly guildIdToGuild = new Map<string, Observable<GuildApiObj>>();

  private readonly account$ = this.createAccount();
  private readonly bank$ = this.createBank();
  private readonly characters$ = this.createCharacters();
  private readonly currencies$ = this.createCurrencyMap();
  private readonly dailyAchievements$ = this.createDailyAchievements();
  private readonly dailyAchievementsTomorrow$ = this.createDailyAchievementsTomorrow();
  private readonly files$ = this.createFilesMap();
  private readonly materials$ = this.createMaterials();
  private readonly sharedInventory$ = this.createSharedInventory();
  private readonly wallet$ = this.createWallet();

  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly http: HttpClient
  ) {}

  getAccount(): Observable<AccountApiObj> {
    return this.account$;
  }

  getAchievements(ids: number[]): Observable<AchievementApiObj[]> {
    const params = {ids: `${ids.join(',')}`};
    return this.http.get<AchievementApiObj[]>(
      `${ROOT_URL}${Path.ACHIEVEMENTS}`,
      {params}
    );
  }

  getBank(): Observable<BankApiObj[]> {
    return this.bank$;
  }

  getCharacters(): Observable<CharacterApiObj[]> {
    return this.characters$;
  }

  getCurrenciesMap(): Observable<Map<number, CurrencyApiObj>> {
    return this.currencies$;
  }

  getDailyAchievements(): Observable<DailyAchievementsApiObj> {
    return this.dailyAchievements$;
  }

  getDailyAchievementsTomorrow(): Observable<DailyAchievementsApiObj> {
    return this.dailyAchievementsTomorrow$;
  }

  getFilesMap(): Observable<Map<string, string>> {
    return this.files$;
  }

  getGuild(id: string): Observable<GuildApiObj> {
    if (!this.guildIdToGuild.has(id)) {
      const guild$ =
          this.http.get<GuildApiObj>(`${ROOT_URL}${Path.GUILD}/${id}`)
              .pipe(
                  shareReplay({bufferSize: 1, refCount: false}),
              );
      this.guildIdToGuild.set(id, guild$);
    }

    return this.guildIdToGuild.get(id)!;
  }

  getItem(id: number): Observable<ItemApiObj> {
    return this.http.get<ItemApiObj>(`${ROOT_URL}${Path.ITEMS}/${id}`);
  }

  getItems(ids: number[]): Observable<ItemApiObj[]> {
    if (ids.length <= ITEMS_LIMIT) {
      const joinedIds = ids.join(',');
      return this.http.get<ItemApiObj[]>(
          `${ROOT_URL}${Path.ITEMS}?ids=${joinedIds}`);
    }

    let i: number;
    let j: number;
    const allJoinedIds: string[] = [];
    for (i = 0, j = ids.length; i < j; i += ITEMS_LIMIT) {
      const joinedIds = ids.slice(i, i + ITEMS_LIMIT).join(',');
      allJoinedIds.push(joinedIds);
    }

    const itemRequests$ = allJoinedIds.map((ids) => {
      return this.http.get<ItemApiObj[]>(
          `${ROOT_URL}${Path.ITEMS}?ids=${ids}`);
    });

    return combineLatest(itemRequests$).pipe(
        map((items) => items.flat(1)),
    );
  }

  getMaterials(): Observable<MaterialApiObj[]> {
    return this.materials$;
  }

  getPrices(id: number): Observable<PriceApiObj> {
    return this.http.get<PriceApiObj>(`${ROOT_URL}${Path.PRICES}/${id}`);
  }

  getSharedInventory(): Observable<SharedInventoryApiObj[]> {
    return this.sharedInventory$;
  }

  getTitle(id: number): Observable<TitleApiObj> {
    return this.http.get<TitleApiObj>(`${ROOT_URL}${Path.TITLES}/${id}`);
  }

  getWallet(): Observable<WalletApiObj[]> {
    return this.wallet$;
  }

  private createAccount(): Observable<AccountApiObj> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http.get<AccountApiObj>(`${ROOT_URL}${Path.ACCOUNT}`, {
          params,
        });
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createBank(): Observable<BankApiObj[]> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http.get<BankApiObj[]>(`${ROOT_URL}${Path.BANK}`, {
              params,
            });
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createCharacters(): Observable<CharacterApiObj[]> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey, ids: 'all'};
        return this.http.get<CharacterApiObj[]>(
          `${ROOT_URL}${Path.CHARACTERS}`,
          {params}
        );
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createCurrencyMap(): Observable<Map<number, CurrencyApiObj>> {
    const params = {ids: 'all'};
    return this.http
      .get<CurrencyApiObj[]>(`${ROOT_URL}${Path.CURRENCIES}`, {params})
      .pipe(
        map((currencies) => {
          const currencyMap = new Map<number, CurrencyApiObj>();
          for (const currency of currencies) {
            currencyMap.set(currency.id, currency);
          }

          return currencyMap;
        }),
        shareReplay({bufferSize: 1, refCount: false})
      );
  }

  private createDailyAchievements(): Observable<DailyAchievementsApiObj> {
    return this.http
      .get<DailyAchievementsApiObj>(`${ROOT_URL}${Path.DAILY_ACHIEVEMENTS}`)
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }

  private createDailyAchievementsTomorrow(): Observable<DailyAchievementsApiObj> {
    return this.http
      .get<DailyAchievementsApiObj>(`${ROOT_URL}${Path.DAILY_ACHIEVEMENTS_TOMORROW}`)
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }

  private createFilesMap(): Observable<Map<string, string>> {
    const params = {ids: 'all'};
    return this.http
      .get<FileApiObj[]>(`${ROOT_URL}${Path.FILES}`, {params})
      .pipe(
        map((files) => {
          const fileMap = new Map<string, string>();
          for (const file of files) {
            fileMap.set(file.id, file.icon);
          }

          return fileMap;
        }),
        shareReplay({bufferSize: 1, refCount: false})
      );
  }

  private createMaterials(): Observable<MaterialApiObj[]> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http.get<MaterialApiObj[]>(`${ROOT_URL}${Path.MATERIALS}`, {
              params,
            });
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createSharedInventory(): Observable<SharedInventoryApiObj[]> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http
            .get<SharedInventoryApiObj[]>(`${ROOT_URL}${Path.INVENTORY}`, {
              params,
            });
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  private createWallet(): Observable<WalletApiObj[]> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap(apiKey => {
        if (apiKey === null) {
          return EMPTY;
        }

        const params = {access_token: apiKey};
        return this.http.get<WalletApiObj[]>(`${ROOT_URL}${Path.WALLET}`, {
          params,
        });
      }),
      shareReplay({bufferSize: 1, refCount: false})
    );
  }

  authenticatedFetch<T>(path: string, requestParams = {}): Observable<T> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap((apiKey) => {
        if (apiKey == null) {
          return EMPTY;
        }

        const params = {...requestParams, access_token: apiKey};
        return this.http.get<T>(`${ROOT_URL}${path}`, {params});
      }),
    );
  }

  nonAuthenticatedFetch<T>(path: string, params = {}): Observable<T> {
    return this.http.get<T>(`${ROOT_URL}${path}`, params);
  }
}
