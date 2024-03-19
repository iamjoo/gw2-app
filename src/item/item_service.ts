import {Injectable} from '@angular/core';

import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';

import {AccountService} from '../api/account_service';
import {BankService} from '../api/bank_service';
import {CharactersService} from '../api/characters_service';
import {GuildService} from '../api/guild_service';
import {ItemApiObj, ItemApiService} from '../api/item_api_service';
import {MaterialsService} from '../api/materials_service';
import {SharedInventoryService} from '../api/shared_inventory_service';

@Injectable({providedIn: 'root'})
export class ItemService {

  private readonly idToItemObs = new Map<number, Observable<ItemApiObj>>();
  private readonly allCharacterItems$ = this.createAllItems();
  private readonly allCharacterItemIdsToItems$ =
      this.createAllItemIdToItem(this.allCharacterItems$);

  constructor(
      private readonly accountService: AccountService,
      private readonly bankService: BankService,
      private readonly charactersService: CharactersService,
      private readonly guildService: GuildService,
      private readonly itemApiService: ItemApiService,
      private readonly materialsService: MaterialsService,
      private readonly sharedInventoryService: SharedInventoryService,
  ) {}

  getAllCharacterItemIdsToItems(): Observable<Map<number, ItemApiObj>> {
    return this.allCharacterItemIdsToItems$;
  }

  getAllCharacterItems(): Observable<ItemApiObj[]> {
    return this.allCharacterItems$;
  }

  getItem(id: number): Observable<ItemApiObj> {
    if (!this.idToItemObs.has(id)) {
      const item$ = this.itemApiService.getItem(id).pipe(
          shareReplay({bufferSize: 1, refCount: false}),
          );
      this.idToItemObs.set(id, item$);
    }

    return this.idToItemObs.get(id)!;
  }

  private createAllItems(): Observable<ItemApiObj[]> {
    const equipmentIds$ = this.charactersService.getCharacters().pipe(
        map((characters) => {
          return characters
              .flatMap((character) => character.equipment)
              .filter((equipment) => equipment)
              .map((equipment) => equipment.id);
        }),
    );

    const bagIds$ = this.charactersService.getCharacters().pipe(
        map((characters) => {
          return characters
              .flatMap((character) => character.bags)
              .filter((bag) => bag)
              .map((bag) => bag.id);
        }),
    );

    const inventoryIds$ = this.charactersService.getCharacters().pipe(
        map((characters) => {
          return characters
              .flatMap((character) => character.bags)
              .filter((bag) => bag)
              .flatMap((bag) => bag.inventory)
              .filter((item) => item)
              .map((item) => item.id);
        }),
    );

    const sharedInventoryIds$ =
        this.sharedInventoryService.getSharedInventory().pipe(
            map((inventory) => {
              return inventory
                  .filter((item) => item)
                  .map((item) => item.id);
            }),
    );

    const bankIds$ = this.bankService.getBank().pipe(
        map((bank) => {
          return bank
              .filter((item) => item)
              .map((item) => item.id);
        }),
    );

    const materialIds$ = this.materialsService.getMaterials().pipe(
        map((materials) => {
          return materials
              .filter((material) => material)
              .map((material) => material.id);
        }),
    );

    const guildStashIds$ = this.accountService.getAccount().pipe(
        switchMap((account) => {
          return combineLatest(account.guilds.map((guildId) => {
            return this.guildService.getGuildStash(guildId);
          }));
        })).pipe(map((results) => {
          const ids = [];
          for (const guildVaults of results) {
            for (const guildVault of guildVaults) {
              for (const item of guildVault.inventory) {
                if (!item) {
                  continue;
                }

                ids.push(item.id);
              }
            }
          }

          return ids;
        }));

    return combineLatest([
      equipmentIds$,
      bagIds$,
      inventoryIds$,
      sharedInventoryIds$,
      bankIds$,
      materialIds$,
      guildStashIds$,
    ]).pipe(
        map(([
          equipmentIds,
          bagIds,
          inventoryIds,
          sharedInventoryIds,
          bankIds,
          materialIds,
          guildStashIds,
        ]) => {
          return new Set([
            ...equipmentIds,
            ...bagIds,
            ...inventoryIds,
            ...sharedInventoryIds,
            ...bankIds,
            ...materialIds,
            ...guildStashIds,
          ]);
        }),
        switchMap((itemIds) => {
          return this.itemApiService.getItems(Array.from(itemIds));
        }),
        shareReplay({bufferSize: 1, refCount: false}),
    );
  }

  private createAllItemIdToItem(allItems$: Observable<ItemApiObj[]>):
      Observable<Map<number, ItemApiObj>> {
    return allItems$.pipe(
        map((items) => {
          const mapping = new Map<number, ItemApiObj>();

          for (const item of items) {
            mapping.set(item.id, item);
          }

          return mapping;
        }),
        shareReplay({bufferSize: 1, refCount: false}),
    );
  }
}
