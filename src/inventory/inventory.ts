import {CommonModule} from '@angular/common';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import {combineLatest, EMPTY, Observable, of as observableOf, ReplaySubject} from 'rxjs';
import {debounceTime, filter, map, shareReplay, startWith, switchMap, take, takeUntil, withLatestFrom} from 'rxjs/operators';

import {AccountService} from '../api/account_service';
import {AddApiKey} from '../api_key/add_api_key';
import {API_KEY_PRESENT_OBS} from '../api_key/api_key_present';
import {BankService} from '../api/bank_service';
import {CharactersService} from '../api/characters_service';
import {GuildService} from '../api/guild_service';
import {ItemApiObj} from '../api/item_api_service';
import {ItemPrice} from './item_price';
import {ItemService} from '../item/item_service';
import {MaterialsService} from '../api/materials_service';
import {SharedInventoryService} from '../api/shared_inventory_service';

interface CharacterCounter {
  readonly name: string;
  readonly count: number;
}

interface ItemCounter {
  id: number;
  count: number;
  characterCounts: Map<string, number>;
}

function sortByName(a: ItemApiObj, b: ItemApiObj): number {
  const nameA = a.name.toUpperCase();
  const nameB = b.name.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }

  if (nameA > nameB) {
    return 1;
  }

  return 0;
}

@Component({
  selector: 'gw-inventory',
  templateUrl: './inventory.ng.html',
  styleUrls: ['./inventory.scss'],
  imports: [
    AddApiKey,
    CommonModule,
    ItemPrice,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    ReactiveFormsModule,
  ],
  standalone: true,
})
export class Inventory implements OnInit, OnDestroy {

  private readonly allItemCounts = new Map<number, ItemCounter>();
  private readonly destroy$ = new ReplaySubject<void>();

  readonly allItems$ = this.itemService.getAllCharacterItems();
  readonly myControl = new FormControl<string|ItemApiObj>('');

  filteredItems!: Observable<ItemApiObj[]>;
  selectedItem$: Observable<ItemApiObj>|null = null;
  selectedItemCounts$: Observable<ItemCounter>|null = null;
  characterCounts$: Observable<CharacterCounter[]>|null = null;

  constructor(
      private readonly accountService: AccountService,
      @Inject(API_KEY_PRESENT_OBS) readonly apiKeyPresent$: Observable<boolean>,
      private readonly bankService: BankService,
      private readonly charactersService: CharactersService,
      private readonly itemService: ItemService,
      private readonly guildService: GuildService,
      private readonly materialsService: MaterialsService,
      private readonly sharedInventoryService: SharedInventoryService,
  ) {
    this.setupAllItemCounts();
  }

  ngOnInit(): void {
    this.filteredItems = this.myControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(200),
        map((enteredValue) => {
          if (enteredValue == null) {
            return '';
          }

          return typeof enteredValue === 'string' ? enteredValue :
              enteredValue.name;
        }),
        withLatestFrom(this.allItems$),
        map(([name, allItems]) => {
          if (name) {
            const filterValue = name.toLowerCase();
            return allItems.filter((item) => {
              return item.name.toLowerCase().includes(filterValue);
            }).sort(sortByName);
          }

          return allItems.slice().sort(sortByName);
        }),
      );

    this.selectedItem$ = this.myControl.valueChanges.pipe(
        filter((value): value is ItemApiObj => {
          return value != null && typeof value !== 'string';
        }),
        shareReplay({bufferSize: 1, refCount: true}),
    );

    this.selectedItemCounts$ = this.selectedItem$.pipe(
        map((item) => this.allItemCounts.get(item.id)),
        filter((itemCount): itemCount is ItemCounter => !!itemCount),
        shareReplay({bufferSize: 1, refCount: true}),
    );

    this.characterCounts$ = this.selectedItemCounts$.pipe(
        map((itemCount) => {
          return Array.from(itemCount.characterCounts.entries()).map(
              ([name, count]) => {
                return {name, count};
              });
        }),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getItemClass(item: ItemApiObj): string {
    return item?.rarity.toLowerCase() ?? '';
  }

  getItemName(item: ItemApiObj): string {
    return item?.name ?? '';
  }

  private setupAllItemCounts(): void {
    const equipmentCounts$ = this.charactersService.getCharacters().pipe(
        map((characters) => {
          for (const character of characters) {
            for (const equipment of character.equipment) {
              this.updateItemCounts(equipment.id, /* increment= */ 1,
                  character.name);
            }
          }
        }),
    );

    const bagCounts$ = this.charactersService.getCharacters().pipe(
        map((characters) => {
          for (const character of characters) {
            for (const bag of character.bags) {
              if (!bag) {
                continue;
              }

              this.updateItemCounts(bag.id, /* increment= */ 1,
                  character.name);
            }
          }
        }),
    );

    const inventoryCounts$ = this.charactersService.getCharacters().pipe(
        map((characters) => {
          for (const character of characters) {
            for (const bag of character.bags) {
              if (!bag) {
                continue;
              }

              for (const item of bag.inventory) {
                if (!item) {
                  continue;
                }

                this.updateItemCounts(item.id, item.count, character.name);
              }
            }
          }
        }),
    );

    const sharedInventoryCounts$ =
        this.sharedInventoryService.getSharedInventory().pipe(
            map((inventory) => {
              for (const item of inventory) {
                if (!item) {
                  continue;
                }

                this.updateItemCounts(item.id, item.count, 'Shared Inventory');
              }
            }),
    );

    const bankCounts$ = this.bankService.getBank().pipe(
        map((bank) => {
          for (const item of bank) {
            if (!item) {
              continue;
            }

            this.updateItemCounts(item.id, item.count, 'Bank');
          }
        }),
    );

    const materialCounts$ = this.materialsService.getMaterials().pipe(
        map((materials) => {
          for (const material of materials) {
            if (!material) {
              continue;
            }

            this.updateItemCounts(material.id, material.count,
                'Material Storage');
          }
        }),
    );

    const guildStashCounts$ = this.accountService.getAccount().pipe(
        switchMap((account) => {
          return combineLatest(account.guilds.map((guildId) => {
            return combineLatest([
                this.guildService.getGuildStash(guildId),
                this.guildService.getGuild(guildId),
            ]);
          })).pipe(map((results) => {
            for (const [guildVaults, guild] of results) {
              for (const guildVault of guildVaults) {
                for (const item of guildVault.inventory) {
                  if (!item) {
                    continue;
                  }

                  const guildName = `[Guild] ${guild.name}`;
                  this.updateItemCounts(item.id, item.count, guildName);
                }
              }
            }
          }));
        }),
    );

    combineLatest([
      equipmentCounts$,
      bagCounts$,
      inventoryCounts$,
      sharedInventoryCounts$,
      bankCounts$,
      materialCounts$,
      guildStashCounts$,
    ]).pipe(
        take(1),
        takeUntil(this.destroy$),
    ).subscribe();
  }

  private updateItemCounts(
      itemId: number, increment: number, characterName: string): void {
    const itemCounter: ItemCounter = this.allItemCounts.get(itemId) ??
            {
              id: itemId,
              count: 0,
              characterCounts: new Map<string, number>(),
            };

        itemCounter.count += increment;
        this.allItemCounts.set(itemId, itemCounter);

        const characterCount =
            itemCounter.characterCounts.get(characterName) ?? 0;
        itemCounter.characterCounts.set(characterName,
            characterCount + increment);
  }
}
