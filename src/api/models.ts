export interface AccountApiObj {
  readonly age: number;
  readonly created: string;
  readonly fractal_level: number;
  readonly guilds: string[];
  readonly id: string;
  readonly name: string;
  readonly world: number;
  readonly wvw_rank: number;
}

export interface AchievementApiObj {
  readonly id: number;
  readonly icon?: string;
  readonly name: string;
  readonly description: string;
  readonly requirement: string;
  readonly rewards: RewardApiObj[];
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
  readonly description?: string;
  readonly type: ItemType;
  readonly rarity: ItemRarity;
}

type ItemType = 'Armor'|'Back'|'Bag'|'Consumable'|'Container'|
    'CraftingMaterial'|'Gathering'|'Gizmo'|'Key'|'MiniPet'|'Tool'|'Trait'|
    'Trinket'|'Trophy'|'UpgradeComponent'|'Weapon';

type ItemRarity = 'Junk'|'Basic'|'Fine'|'Masterwork'|'Rare'|'Exotic'|
    'Ascended'|'Legendary';

export type WorldPopulationApi = 'Low'|'Medium'|'High'|'VeryHigh'|'Full';

export interface WorldApiObj {
  readonly id: number;
  readonly name: string;
  readonly population: WorldPopulationApi;
}

type RewardApiObj = CoinsReward|ItemReward|MasteryReward|TitleReward;

interface BaseReward {
  readonly type: 'Coins'|'Item'|'Mastery'|'Title';
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
