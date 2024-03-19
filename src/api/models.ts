export interface SharedInventoryApiObj {
  readonly id: number;
  readonly count: number;
}

export interface DailyAchievementsApiObj {
  readonly pve: DailyAchievementApiObj[];
  readonly pvp: DailyAchievementApiObj[];
  readonly wvw: DailyAchievementApiObj[];
  readonly fractals: DailyAchievementApiObj[];
  readonly special: DailyAchievementApiObj[];
}

export interface DailyAchievementApiObj {
  readonly id: number;
  readonly level: {
    readonly min: number;
    readonly max: number;
  };
}

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
