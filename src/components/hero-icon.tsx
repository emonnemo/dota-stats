import { getHeroImageUrl } from "@/lib/client-api"

export function HeroIcon({ heroId, size = 32 }: { heroId: number; size?: number }) {
  return (
    <img
      src={getHeroImageUrl(heroId)}
      alt={`Hero ${heroId}`}
      width={size}
      height={size}
      className="rounded"
    />
  )
}
