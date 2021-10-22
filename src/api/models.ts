export interface AccountApiObj {
  readonly age: number;
  readonly created: string;
  readonly daily_ap: number;
  readonly fractal_level: number;
  readonly guilds: string[];
  readonly id: string;
  readonly monthly_ap: number;
  readonly name: string;
  readonly world: number;
  readonly wvw_rank: number;
}

export interface PvpApiObj {
  readonly pvp_rank: number;
}

export interface MasteryPointsApiObj {
  readonly totals: MasteryApiObj[];
}

interface MasteryApiObj {
  readonly region: string;
  readonly spent: number;
  readonly earned: number;
}

export interface AchievementApiObj {
  readonly id: number;
  readonly icon?: string;
  readonly name: string;
  readonly description: string;
  readonly requirement: string;
  readonly rewards: RewardApiObj[];
}

export interface MaterialApiObj {
  readonly id: number;
  readonly count: number;
}

export interface FileApiObj {
  readonly id: string;
  readonly icon: string;
}

export interface BankApiObj {
  readonly id: number;
  readonly count: number;
}

export interface SharedInventoryApiObj {
  readonly id: number;
  readonly count: number;
}

export interface PriceApiObj {
  readonly id: number;
  readonly buys: BuySellApiObj;
  readonly sells: BuySellApiObj;
}

interface BuySellApiObj {
  readonly unit_price: number;
  readonly quantity: number;
}

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

export interface TitleApiObj {
  readonly id: number;
  readonly name: string;
}

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

export interface CraftingApiObj {
  readonly active: boolean;
  readonly discipline: DisciplineApiObj;
  readonly rating: number;
}

export type DisciplineApiObj =
  | 'Armorsmith'
  | 'Artificer'
  | 'Chef'
  | 'Huntsman'
  | 'Jeweler'
  | 'Leatherworker'
  | 'Scribe'
  | 'Tailor';

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

interface BagApiObj {
  readonly id: number; // use /v2/items
  readonly size: number;
  readonly inventory: InventoryApiObj[];
}

interface InventoryApiObj {
  readonly id: number; // use /v2/items
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

export interface GuildApiObj {
  readonly name: string;
  readonly id: string;
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

export type WorldPopulationApi =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'Full';

export interface WorldApiObj {
  readonly id: number;
  readonly name: string;
  readonly population: WorldPopulationApi;
}

type RewardApiObj = CoinsReward | ItemReward | MasteryReward | TitleReward;

interface BaseReward {
  readonly type: 'Coins' | 'Item' | 'Mastery' | 'Title';
}

interface CoinsReward extends BaseReward {
  readonly type: 'Coins';
  readonly count: number;
}

export interface ItemReward extends BaseReward {
  readonly type: 'Item';
  readonly id: number;
  readonly count: number;
}

interface MasteryReward extends BaseReward {
  readonly type: 'Mastery';
  readonly id: number;
  readonly region: string;
}

interface TitleReward extends BaseReward {
  readonly type: 'Title';
  readonly id: number;
}
