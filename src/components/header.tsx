import Link from "next/link"
import { SearchBar } from "@/components/search-bar"

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
          Dota Stats
        </Link>
        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}
