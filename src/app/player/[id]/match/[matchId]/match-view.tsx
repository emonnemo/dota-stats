"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getMatchDetail, getItemImageUrl } from "@/lib/client-api"
import { formatDuration, formatTime, performanceScore } from "@/lib/utils"
import { GAME_MODES } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { MatchData } from "@/lib/types"

export function MatchView() {
  const params = useParams()
  const accountId = Number(params.id)
  const matchIdNum = Number(params.matchId)

  const [match, setMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (isNaN(accountId) || isNaN(matchIdNum)) {
      setError(true)
      setLoading(false)
      return
    }
    getMatchDetail(matchIdNum)
      .then((m) => {
        setMatch(m)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [accountId, matchIdNum])

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-center text-muted-foreground">Loading match data...</p>
      </main>
    )
  }

  if (error || !match) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link href={`/player/${accountId}`} className="mb-4 inline-block text-sm text-muted-foreground hover:underline">
          &larr; Back to player
        </Link>
        <p className="text-center text-muted-foreground">Match not found.</p>
      </main>
    )
  }

  const radiantPlayers = match.players.filter((p) => p.isRadiant)
  const direPlayers = match.players.filter((p) => !p.isRadiant)

  const playerEntry = match.players.find((p) => p.steamAccountId === accountId)
  const won = playerEntry?.isVictory ?? false

  const itemFields = ["item0Id", "item1Id", "item2Id", "item3Id", "item4Id", "item5Id"] as const

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href={`/player/${accountId}`}
        className="mb-4 inline-block text-sm text-muted-foreground hover:underline"
      >
        &larr; Back to player
      </Link>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Match {match.id}</h1>
              <p className="text-sm text-muted-foreground">
                {GAME_MODES[match.gameMode] ?? `Mode ${match.gameMode}`} &middot;{" "}
                {formatDuration(match.durationSeconds)} &middot; {formatTime(match.startDateTime)}
              </p>
            </div>
            <Badge variant={won ? "default" : "destructive"} className="px-4 py-1 text-base">
              {won ? "VICTORY" : "DEFEAT"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {playerEntry && (
        <Card className="mb-6 border-primary/50">
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {playerEntry.kills}/{playerEntry.deaths}/{playerEntry.assists}
                </div>
                <div className="text-xs text-muted-foreground">K/D/A</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{playerEntry.goldPerMinute}</div>
                <div className="text-xs text-muted-foreground">GPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{playerEntry.experiencePerMinute}</div>
                <div className="text-xs text-muted-foreground">XPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceScore(playerEntry)}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="text-center">
                <div className="font-bold">{playerEntry.numLastHits}</div>
                <div className="text-xs text-muted-foreground">Last Hits</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{playerEntry.numDenies}</div>
                <div className="text-xs text-muted-foreground">Denies</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{playerEntry.level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{playerEntry.networth.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Net Worth</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{(playerEntry.heroDamage / 1000).toFixed(1)}k</div>
                <div className="text-xs text-muted-foreground">Hero Dmg</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {itemFields.map((key) => {
                const itemId = playerEntry[key]
                if (!itemId || itemId === 0) return null
                return (
                  <img
                    key={key}
                    src={getItemImageUrl(itemId)}
                    alt={`Item ${itemId}`}
                    className="h-10 w-10 rounded border"
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Radiant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {radiantPlayers.map((p) => (
              <PlayerRow key={p.steamAccountId} player={p} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Dire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {direPlayers.map((p) => (
              <PlayerRow key={p.steamAccountId} player={p} />
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function PlayerRow({ player }: { player: MatchData["players"][0] }) {
  const heroShortName = player.hero?.shortName ?? "antimage"
  return (
    <div className="flex items-center gap-3 rounded-lg border p-2 text-sm">
      <img
        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroShortName}.png`}
        alt=""
        className="h-9 w-9 rounded"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">
          {player.steamAccount?.name || "Anonymous"}
        </div>
        <div className="text-xs text-muted-foreground">
          {player.hero?.displayName || `Hero ${player.heroId}`}
        </div>
      </div>
      <div className="text-right font-mono text-xs">
        <div>
          {player.kills}/{player.deaths}/{player.assists}
        </div>
        <div className="text-muted-foreground">
          {player.goldPerMinute}/{player.experiencePerMinute}
        </div>
      </div>
    </div>
  )
}
