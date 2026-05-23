"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getPlayer, getRecentMatches } from "@/lib/client-api"
import { getRankName, formatDuration, formatTime, kdaRatio, performanceScore, performanceLabel, performanceColor } from "@/lib/utils"
import { GAME_MODES } from "@/lib/types"
import { HeroIcon } from "@/components/hero-icon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PlayerData, MatchData } from "@/lib/types"

export function PlayerView() {
  const params = useParams()
  const steamAccountId = Number(params.id)

  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [matches, setMatches] = useState<MatchData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (isNaN(steamAccountId)) {
      setError(true)
      return
    }
    getPlayer(steamAccountId)
      .then(setPlayer)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
    getRecentMatches(steamAccountId)
      .then(setMatches)
      .catch(() => setMatches([]))
  }, [steamAccountId])

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-muted-foreground">Loading player data...</p>
      </main>
    )
  }

  if (error || !player) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-muted-foreground">Player not found.</p>
      </main>
    )
  }

  const latestRank = player.ranks.length > 0
    ? player.ranks.sort((a, b) => b.asOfDateTime - a.asOfDateTime)[0]
    : null
  const rankName = latestRank ? getRankName(latestRank.rank) : "Uncalibrated"
  const totalGames = player.winCount + player.lossCount
  const winRate = totalGames > 0 ? Math.round((player.winCount / totalGames) * 100) : 0

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Card className="mb-8">
        <CardContent className="flex items-center gap-6 pt-6">
          <img
            src={player.steamAccount.avatar}
            alt={player.steamAccount.name}
            className="h-20 w-20 rounded-full"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold">{player.steamAccount.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>ID: {player.steamAccount.id}</span>
              {totalGames > 0 && (
                <span>
                  W/L: {player.winCount}/{player.lossCount} ({winRate}%)
                </span>
              )}
              <span>Behavior: {player.behaviorScore}</span>
            </div>
          </div>
          {latestRank && latestRank.rank > 0 && (
            <div className="text-right">
              <div className="text-lg font-bold">{rankName}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {matches.length === 0 && (
            <p className="text-sm text-muted-foreground">No recent matches found.</p>
          )}
          {matches.map((match) => {
            const playerEntry = match.players.find((p) => p.steamAccountId === steamAccountId)
            if (!playerEntry) return null
            const won = playerEntry.isVictory
            const score = performanceScore({
              kills: playerEntry.kills,
              deaths: playerEntry.deaths,
              assists: playerEntry.assists,
              goldPerMinute: playerEntry.goldPerMinute,
              experiencePerMinute: playerEntry.experiencePerMinute,
              numLastHits: playerEntry.numLastHits,
              numDenies: playerEntry.numDenies,
              heroDamage: playerEntry.heroDamage,
              heroHealing: playerEntry.heroHealing,
              towerDamage: playerEntry.towerDamage,
            })
            return (
              <Link
                key={match.id}
                href={`/player/${steamAccountId}/match/${match.id}`}
                className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <HeroIcon heroId={playerEntry.heroId} size={48} />
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="w-20">
                    <Badge variant={won ? "default" : "destructive"} className="w-full justify-center">
                      {won ? "WIN" : "LOSS"}
                    </Badge>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">
                      {GAME_MODES[match.gameMode] ?? `Mode ${match.gameMode}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(match.durationSeconds)} &middot; {formatTime(match.startDateTime)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-lg font-bold">
                      {playerEntry.kills}/{playerEntry.deaths}/{playerEntry.assists}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      KDA: {kdaRatio(playerEntry.kills, playerEntry.deaths, playerEntry.assists)}
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-xs text-muted-foreground">GPM/XPM</div>
                    <div className="font-mono text-sm">
                      {playerEntry.goldPerMinute}/{playerEntry.experiencePerMinute}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${performanceColor(score)}`}>
                      {score}
                    </div>
                    <div className="text-xs text-muted-foreground">{performanceLabel(score)}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </main>
  )
}
