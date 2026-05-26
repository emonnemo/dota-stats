"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { searchPlayers } from "@/lib/client-api"
import type { SearchPlayerResult } from "@/lib/types"

const PAGE_SIZE = 10

export default function SearchPage() {
  const params = useParams()
  const router = useRouter()
  const query = decodeURIComponent(String(params.query))

  const [allResults, setAllResults] = useState<SearchPlayerResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState(query)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setPage(0)
    searchPlayers(query)
      .then(setAllResults)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [query])

  const totalPages = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE))
  const pageResults = useMemo(
    () => allResults.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [allResults, page],
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchInput.trim().length >= 2) {
      router.push(`/search/${encodeURIComponent(searchInput.trim())}`)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <form onSubmit={handleSearch} className="mb-8">
        <Input
          placeholder="Search Dota 2 player..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </form>

      {loading && (
        <p className="text-center text-muted-foreground">Searching...</p>
      )}

      {error && (
        <p className="text-center text-muted-foreground">Search failed. Try again.</p>
      )}

      {!loading && !error && allResults.length === 0 && (
        <p className="text-center text-muted-foreground">
          No players found for &ldquo;{query}&rdquo;
        </p>
      )}

      {!loading && !error && allResults.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {allResults.length} result{allResults.length !== 1 ? "s" : ""} for
            &ldquo;{query}&rdquo;
          </p>
          <div className="space-y-2">
            {pageResults.map((r) => (
              <button
                key={r.id}
                className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                onClick={() => router.push(`/player/${r.id}`)}
              >
                <img src={r.avatar} alt="" className="h-12 w-12 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-medium">{r.name}</div>
                  <div className="text-sm text-muted-foreground">ID: {r.id}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </main>
  )
}
