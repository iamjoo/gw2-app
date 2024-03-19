import {Injectable} from '@angular/core';

import {Observable, combineLatest} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

export interface ItemApiObj {
  readonly id: number;
  readonly name: string;
  readonly icon?: string;
  readonly description?: string;
  readonly type: ItemType;
  readonly rarity: ItemRarity;
  readonly details?:
    | ArmorDetailsApiObj
    | BackItemDetailsApiObj
    | TrinketDetailsApiObj
    | WeaponDetailsApiObj; // add more
}

interface BackItemDetailsApiObj {
  readonly stat_choices?: number[]; // use /v2/itemstats
}

interface TrinketDetailsApiObj {
  readonly type: TrinketType;
  readonly stat_choices?: number[]; // use /v2/itemstats
}

type TrinketType = 'Accessory' | 'Amulet' | 'Ring';

interface WeaponDetailsApiObj {
  readonly type:
    | OneHandedMainHandWeaponType
    | OneHandedOffHandWeaponType
    | TwoHandedWeaponType
    | AquaticWeaponType
    | OtherWeaponType;
  readonly damage_type: DamageType;
  readonly min_power: number;
  readonly max_power: number;
  readonly defense: number;
  readonly infix_upgrade: InfixUpgradeApiObj;
  readonly stat_choices?: number[]; // use /v2/itemstats
}

type OneHandedMainHandWeaponType =
  | 'Axe'
  | 'Dagger'
  | 'Mace'
  | 'Pistol'
  | 'Scepter'
  | 'Sword';
type OneHandedOffHandWeaponType = 'Focus' | 'Shield' | 'Torch' | 'Warhorn';
type TwoHandedWeaponType =
  | 'Greatsword'
  | 'Hammer'
  | 'LongBow'
  | 'Rifle'
  | 'ShortBow'
  | 'Staff';
type AquaticWeaponType = 'Harpoon' | 'Speargun' | 'Trident';
type OtherWeaponType = 'LargeBundle' | 'SmallBundle' | 'Toy' | 'ToyTwoHanded';
type DamageType = 'Fire' | 'Ice' | 'Lightning' | 'Physical' | 'Choking';

type ItemType =
  | 'Armor'
  | 'Back'
  | 'Bag'
  | 'Consumable'
  | 'Container'
  | 'CraftingMaterial'
  | 'Gathering'
  | 'Gizmo'
  | 'Key'
  | 'MiniPet'
  | 'Tool'
  | 'Trait'
  | 'Trinket'
  | 'Trophy'
  | 'UpgradeComponent'
  | 'Weapon';

interface InfixUpgradeApiObj {
  readonly id: number; // use /v2/itemstats
  readonly attributes: AttributeApiObj[];
}

interface AttributeApiObj {
  readonly attribute: AttributeType;
  readonly modifier: number;
}

type AttributeType =
  | 'AgonyResistance'
  | 'BoonDuration'
  | 'ConditionDamage'
  | 'ConditionDuration'
  | 'CritDamage'
  | 'Healing'
  | 'Power'
  | 'Precision'
  | 'Toughness'
  | 'Vitality';

export type ItemRarity =
  | 'Junk'
  | 'Basic'
  | 'Fine'
  | 'Masterwork'
  | 'Rare'
  | 'Exotic'
  | 'Ascended'
  | 'Legendary';

interface ArmorDetailsApiObj {
  readonly type: ArmorType;
  readonly weight_class: WeightClass;
  readonly defense: number;
  readonly stat_choices?: number[]; // use /v2/itemstats
}

type ArmorType =
  | 'Boots'
  | 'Coat'
  | 'Gloves'
  | 'Helm'
  | 'HelmAquatic'
  | 'Leggings'
  | 'Shoulders';

type WeightClass = 'Heavy' | 'Medium' | 'Light' | 'Clothing';

const ITEMS_LIMIT = 199;
const ITEMS_PATH = 'items';

@Injectable({providedIn: 'root'})
export class ItemApiService {

  constructor(private readonly apiService: ApiService) {}

  getItem(id: number): Observable<ItemApiObj> {
    const path = `${ITEMS_PATH}/${id}`;
    return this.apiService.nonAuthenticatedFetch<ItemApiObj>(path);
  }

  getItems(ids: number[]): Observable<ItemApiObj[]> {
    if (ids.length <= ITEMS_LIMIT) {
      const joinedIds = ids.join(',');
      const path = `${ITEMS_PATH}?ids=${joinedIds}`;
      return this.apiService.nonAuthenticatedFetch<ItemApiObj[]>(path);
    }

    let i: number;
    let j: number;
    const allJoinedIds: string[] = [];
    for (i = 0, j = ids.length; i < j; i += ITEMS_LIMIT) {
      const joinedIds = ids.slice(i, i + ITEMS_LIMIT).join(',');
      allJoinedIds.push(joinedIds);
    }

    const itemRequests$ = allJoinedIds.map((ids) => {
      const path = `${ITEMS_PATH}?ids=${ids}`
      return this.apiService.nonAuthenticatedFetch<ItemApiObj[]>(
          path);
    });

    return combineLatest(itemRequests$).pipe(
        map((items) => items.flat(1)),
    );
  }
}
