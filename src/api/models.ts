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
