import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { RANK_NAMES } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRankName(rank: number): string {
  if (!rank || rank === 0) return "Uncalibrated"
  const tier = Math.floor((rank - 1) / 10)
  const star = Math.floor(((rank - 1) % 10) / 2) + 1
  const name = RANK_NAMES[tier + 1] ?? "Unknown"
  if (tier + 1 >= 8) return name
  return `${name} ${"★".repeat(star)}`
}

export function getRankStars(rank: number): number {
  if (!rank || rank === 0) return 0
  return Math.floor(((rank - 1) % 10) / 2) + 1
}

export function getRankTier(rank: number): number {
  if (!rank) return 0
  return Math.floor((rank - 1) / 10) + 1
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString()
}

export function kdaRatio(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return kills + assists > 0 ? "∞" : "0.00"
  return ((kills + assists) / deaths).toFixed(2)
}

export function performanceScore(match: {
  kills: number
  deaths: number
  assists: number
  goldPerMinute: number
  experiencePerMinute: number
  numLastHits: number
  numDenies: number
  heroDamage: number
  heroHealing: number
  towerDamage: number
}): number {
  const { kills, deaths, assists, goldPerMinute, experiencePerMinute, numLastHits, heroDamage, heroHealing, towerDamage } = match
  const kda = deaths === 0 ? (kills + assists > 0 ? 5 : 0) : (kills + assists) / deaths
  const kdaScore = Math.min(kda / 3, 10)
  const gpmScore = Math.min(goldPerMinute / 100, 10)
  const xpmScore = Math.min(experiencePerMinute / 100, 10)
  const lhScore = Math.min(numLastHits / 50, 10)
  const dmgScore = Math.min(heroDamage / 5000, 10)
  const healScore = Math.min(heroHealing / 2000, 10)
  const towerScore = Math.min(towerDamage / 2000, 10)

  const total = kdaScore * 3 + gpmScore * 2 + xpmScore * 2 + lhScore + dmgScore + healScore + towerScore
  return Math.round((total / 11) * 10)
}

export function performanceLabel(score: number): string {
  if (score >= 85) return "MVP"
  if (score >= 70) return "Great"
  if (score >= 55) return "Good"
  if (score >= 40) return "Average"
  if (score >= 25) return "Below Avg"
  return "Rough"
}

export function performanceColor(score: number): string {
  if (score >= 85) return "text-yellow-500"
  if (score >= 70) return "text-green-500"
  if (score >= 55) return "text-blue-500"
  if (score >= 40) return "text-gray-400"
  return "text-red-500"
}
