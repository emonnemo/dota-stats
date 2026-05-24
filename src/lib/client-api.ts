import type { SearchPlayerResult, PlayerData, MatchData, MatchPlayer } from "./types"

const TOKEN = (process.env.STRATZ_API_KEY ?? "").replace(/[^\x21-\x7E]/g, "")

function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "https://api.stratz.com/graphql")
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.setRequestHeader("Accept", "application/json")
    xhr.setRequestHeader("Authorization", `Bearer ${TOKEN}`)
    xhr.responseType = "json"

    const timeout = setTimeout(() => {
      xhr.abort()
      reject(new Error("STRATZ timeout"))
    }, 15000)

    xhr.onload = () => {
      clearTimeout(timeout)
      const json = xhr.response
      if (json?.errors && !json?.data) {
        reject(new Error(json.errors[0]?.message ?? "STRATZ GraphQL error"))
      } else if (xhr.status >= 200 && xhr.status < 300) {
        resolve(json.data as T)
      } else {
        reject(new Error(`STRATZ error ${xhr.status}: ${(xhr.responseText ?? "").substring(0, 200)}`))
      }
    }

    xhr.onerror = () => {
      clearTimeout(timeout)
      reject(new Error("STRATZ network error"))
    }

    xhr.send(JSON.stringify({ query, variables }))
  })
}

export async function searchPlayers(query: string): Promise<SearchPlayerResult[]> {
  const data = await gql<{
    stratz: { search: { players: { id: number; name: string; avatar: string; lastMatchDateTime: number }[] } }
  }>(
    `query SearchPlayers($q: String!) {
      stratz {
        search(request: { query: $q, take: 50 }) {
          players {
            id
            name
            avatar
            lastMatchDateTime
          }
        }
      }
    }`,
    { q: query },
  )
  return (data.stratz.search.players ?? []).map((p) => ({
    id: p.id,
    name: p.name ?? "Anonymous",
    avatar: p.avatar ?? "",
    lastMatchDateTime: p.lastMatchDateTime ?? 0,
  }))
}

export async function getPlayer(steamAccountId: number): Promise<PlayerData> {
  const data = await gql<{
    player: {
      steamAccount: { id: number; name: string; avatar: string; profileUri: string }
      winCount: number
      matchCount: number
      behaviorScore: number
      ranks: { seasonRankId: number; asOfDateTime: number; isCore: boolean; rank: number }[]
    }
  }>(
    `query GetPlayer($id: Long!) {
      player(steamAccountId: $id) {
        steamAccount {
          id
          name
          avatar
          profileUri
        }
        winCount
        matchCount
        behaviorScore
        ranks {
          seasonRankId
          asOfDateTime
          isCore
          rank
        }
      }
    }`,
    { id: steamAccountId },
  )
  return {
    steamAccount: data.player.steamAccount,
    winCount: data.player.winCount ?? 0,
    lossCount: (data.player.matchCount ?? 0) - (data.player.winCount ?? 0),
    behaviorScore: data.player.behaviorScore ?? 0,
    ranks: data.player.ranks ?? [],
  }
}

export async function getRecentMatches(steamAccountId: number): Promise<MatchData[]> {
  const data = await gql<{
    player: {
      matches: {
        id: number
        didRadiantWin: boolean
        durationSeconds: number
        startDateTime: number
        gameMode: number
        lobbyType: number
        players: MatchPlayer[]
      }[]
    }
  }>(
    `query GetRecentMatches($id: Long!) {
      player(steamAccountId: $id) {
        matches(request: { take: 20 }) {
          id
          didRadiantWin
          durationSeconds
          startDateTime
          gameMode
          lobbyType
          players {
            steamAccountId
            isVictory
            isRadiant
            heroId
            hero {
              id
              displayName
              shortName
            }
            kills
            deaths
            assists
            numLastHits
            numDenies
            goldPerMinute
            experiencePerMinute
            networth
            heroDamage
            heroHealing
            towerDamage
            level
            lane
            role
            position
            item0Id
            item1Id
            item2Id
            item3Id
            item4Id
            item5Id
            imp
            award
          }
        }
      }
    }`,
    { id: steamAccountId },
  )
  return data.player.matches ?? []
}

export async function getMatchDetail(matchId: number): Promise<MatchData> {
  const data = await gql<{
    match: {
      id: number
      didRadiantWin: boolean
      durationSeconds: number
      startDateTime: number
      gameMode: number
      lobbyType: number
      players: MatchPlayer[]
    }
  }>(
    `query GetMatch($id: Long!) {
      match(id: $id) {
        id
        didRadiantWin
        durationSeconds
        startDateTime
        gameMode
        lobbyType
        players {
          steamAccountId
          steamAccount {
            id
            name
            avatar
            profileUri
          }
          isVictory
          isRadiant
          heroId
          hero {
            id
            displayName
            shortName
          }
          kills
          deaths
          assists
          numLastHits
          numDenies
          goldPerMinute
          experiencePerMinute
          networth
          heroDamage
          heroHealing
          towerDamage
          level
          lane
          role
          position
          item0Id
          item1Id
          item2Id
          item3Id
          item4Id
          item5Id
          imp
          award
        }
      }
    }`,
    { id: matchId },
  )
  return data.match
}

export function getHeroImageUrl(heroId: number): string {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${getHeroShortName(heroId)}.png`
}

function getHeroShortName(heroId: number): string {
  const map: Record<number, string> = {
    1: "antimage", 2: "axe", 3: "bane", 4: "bloodseeker", 5: "crystal_maiden",
    6: "drow_ranger", 7: "earthshaker", 8: "juggernaut", 9: "mirana", 10: "morphling",
    11: "nevermore", 12: "phantom_lancer", 13: "puck", 14: "pudge", 15: "razor",
    16: "sand_king", 17: "storm_spirit", 18: "sven", 19: "tiny", 20: "vengefulspirit",
    21: "windrunner", 22: "zeus", 23: "kunkka", 25: "lina", 26: "lion",
    27: "shadow_shaman", 28: "slardar", 29: "tidehunter", 30: "witch_doctor", 31: "lich",
    32: "riki", 33: "enigma", 34: "tinker", 35: "sniper", 36: "necrolyte",
    37: "warlock", 38: "beastmaster", 39: "queenofpain", 40: "venomancer", 41: "faceless_void",
    42: "skeleton_king", 43: "death_prophet", 44: "phantom_assassin", 45: "pugna", 46: "ta",
    47: "viper", 48: "luna", 49: "dragon_knight", 50: "dazzle", 51: "rattletrap",
    52: "leshrac", 53: "furion", 54: "life_stealer", 55: "dark_seer", 56: "clinkz",
    57: "omniknight", 58: "enchantress", 59: "huskar", 60: "night_stalker", 61: "broodmother",
    62: "bounty_hunter", 63: "weaver", 64: "jakiro", 65: "batrider", 66: "chen",
    67: "spectre", 68: "ancient_apparition", 69: "doom_bringer", 70: "ursa", 71: "spirit_breaker",
    72: "gyrocopter", 73: "alchemist", 74: "invoker", 75: "silencer", 76: "obsidian_destroyer",
    77: "lycan", 78: "brewmaster", 79: "shadow_demon", 80: "lone_druid", 81: "chaos_knight",
    82: "meepo", 83: "treant", 84: "ogre_magi", 85: "undying", 86: "rubick",
    87: "disruptor", 88: "nyx_assassin", 89: "naga_siren", 90: "keeper_of_the_light",
    91: "wisp", 92: "visage", 93: "slark", 94: "medusa", 95: "troll_warlord",
    96: "centaur", 97: "magnataur", 98: "shredder", 99: "bristleback", 100: "tusk",
    101: "skywrath_mage", 102: "abaddon", 103: "elder_titan", 104: "legion_commander",
    105: "techies", 106: "ember_spirit", 107: "earth_spirit", 108: "abyssal_underlord",
    109: "terrorblade", 110: "phoenix", 111: "oracle", 112: "winter_wyvern",
    113: "arc_warden", 114: "monkey_king", 119: "dark_willow", 120: "pangolier",
    121: "grimstroke", 123: "hoodwink", 126: "void_spirit", 128: "snapfire",
    129: "mars", 131: "ringmaster", 135: "dawnbreaker", 136: "marci",
    137: "primal_beast", 138: "muerta", 142: "kez",
  }
  return map[heroId] ?? "antimage"
}

export function getItemImageUrl(itemId: number): string {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemId}.png`
}
