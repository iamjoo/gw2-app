import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

export interface BagApiObj {
  readonly id: number; // use /v2/items
  readonly size: number;
  readonly inventory: InventoryApiObj[];
}

interface InventoryApiObj {
  readonly id: number; // use /v2/items
  readonly count: number;
}

export interface CraftingApiObj {
  readonly active: boolean;
  readonly discipline: DisciplineApiObj;
  readonly rating: number;
}

export interface EquipmentApiObj {
  readonly id: number; // use /v2/items
  readonly infusions?: number[]; // use /v2/items
  readonly slot: EquipmentSlotApiObj;
  readonly skin?: number; // use /v2/skins
  readonly upgrades?: number[]; // use /v2/items
}

type EquipmentSlotApiObj =
  | 'Accessory1'
  | 'Accessory2'
  | 'Amulet'
  | 'Axe'
  | 'Backpack'
  | 'Boots'
  | 'Coat'
  | 'Gloves'
  | 'Helm'
  | 'HelmAquatic'
  | 'Leggings'
  | 'Pick'
  | 'Ring1'
  | 'Ring2'
  | 'Shoulders'
  | 'Sickle'
  | 'WeaponA1'
  | 'WeaponA2'
  | 'WeaponAquaticA'
  | 'WeaponAquaticB'
  | 'WeaponB1'
  | 'WeaponB2';

export type GenderApiObj = 'Male' | 'Female';

export type ProfessionApiObj =
  | 'Elementalist'
  | 'Engineer'
  | 'Guardian'
  | 'Mesmer'
  | 'Necromancer'
  | 'Ranger'
  | 'Revenant'
  | 'Thief'
  | 'Warrior';

export type RaceApiObj = 'Asura' | 'Charr' | 'Human' | 'Norn' | 'Sylvari';

export type DisciplineApiObj =
  | 'Armorsmith'
  | 'Artificer'
  | 'Chef'
  | 'Huntsman'
  | 'Jeweler'
  | 'Leatherworker'
  | 'Scribe'
  | 'Tailor';

export interface CharacterApiObj {
  readonly age: number;
  readonly bags: BagApiObj[];
  readonly crafting: CraftingApiObj[];
  readonly created: string;
  readonly deaths: number;
  readonly equipment: EquipmentApiObj[];
  readonly gender: GenderApiObj;
  readonly level: number;
  readonly name: string;
  readonly profession: ProfessionApiObj;
  readonly race: RaceApiObj;
  readonly title?: number;
}

const CHARACTERS_PATH = 'characters';

@Injectable({providedIn: 'root'})
export class CharactersService {

  private readonly characters$ = this.createCharacters();

  constructor(private readonly apiService: ApiService) {}

  getCharacters(): Observable<CharacterApiObj[]> {
    return this.characters$;
  }

  private createCharacters(): Observable<CharacterApiObj[]> {
    const params = {ids: 'all'};

    return this.apiService.authenticatedFetch<CharacterApiObj[]>(
        CHARACTERS_PATH, params).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
