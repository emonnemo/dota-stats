export interface SteamAccount {
  id: number
  name: string
  avatar: string
  profileUri: string
}

export interface SeasonRank {
  seasonRankId: number
  asOfDateTime: number
  isCore: boolean
  rank: number
}

export interface PlayerData {
  steamAccount: SteamAccount
  winCount: number
  lossCount: number
  behaviorScore: number
  ranks: SeasonRank[]
}

export interface HeroInfo {
  id: number
  displayName: string
  shortName: string
}

export interface MatchPlayer {
  steamAccountId: number
  steamAccount?: SteamAccount
  isVictory: boolean
  isRadiant: boolean
  heroId: number
  hero: HeroInfo
  kills: number
  deaths: number
  assists: number
  numLastHits: number
  numDenies: number
  goldPerMinute: number
  experiencePerMinute: number
  networth: number
  heroDamage: number
  heroHealing: number
  towerDamage: number
  level: number
  lane: number
  role: number
  position: number
  item0Id: number
  item1Id: number
  item2Id: number
  item3Id: number
  item4Id: number
  item5Id: number
  imp: number
  award: string
}

export interface MatchData {
  id: number
  didRadiantWin: boolean
  durationSeconds: number
  startDateTime: number
  gameMode: number
  lobbyType: number
  players: MatchPlayer[]
}

export interface SearchPlayerResult {
  id: number
  name: string
  avatar: string
  lastMatchDateTime: number
}

export const GAME_MODES: Record<number, string> = {
  0: "Unknown",
  1: "All Pick",
  2: "Captains Mode",
  3: "Random Draft",
  4: "Single Draft",
  5: "All Random",
  6: "Intro",
  7: "Diretide",
  8: "Reverse Captains Mode",
  9: "Greeviling",
  10: "Tutorial",
  11: "Mid Only",
  12: "Least Played",
  13: "Limited Heroes",
  14: "Compendium Matchmaking",
  15: "Custom",
  16: "Captains Draft",
  17: "Balanced Draft",
  18: "Ability Draft",
  19: "Event",
  20: "All Random Death Match",
  21: "1v1 Mid",
  22: "Ranked All Pick",
  23: "Turbo",
  24: "Mutation",
  25: "Super Turbo",
}

export const RANK_NAMES: Record<number, string> = {
  0: "Uncalibrated",
  1: "Herald",
  2: "Guardian",
  3: "Crusader",
  4: "Archon",
  5: "Legend",
  6: "Ancient",
  7: "Divine",
  8: "Immortal",
}
