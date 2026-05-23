import { MatchView } from "./match-view"

export function generateStaticParams() {
  return [{ id: "0", matchId: "0" }]
}

export default function MatchPage() {
  return <MatchView />
}
