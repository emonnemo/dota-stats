import { PlayerView } from "./player-view"

export function generateStaticParams() {
  return [{ id: "0" }]
}

export default function PlayerPage() {
  return <PlayerView />
}
