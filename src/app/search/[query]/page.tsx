"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { searchPlayers } from "@/lib/client-api"
import type { SearchPlayerResult } from "@/lib/types"

const LOAD_LIMITS = [10, 50, 100]

export default function SearchPage() {
  const params = useParams()
  const router = useRouter()
  const query = decodeURIComponent(String(params.query))

  const [results, setResults] = useState<SearchPlayerResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [loadIndex, setLoadIndex] = useState(0)
  const [searchInput, setSearchInput] = useState(query)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const currentLimit = LOAD_LIMITS[loadIndex]
  const isFinalLoad = loadIndex >= LOAD_LIMITS.length - 1

  const fetchPage = useCallback(
    async (limitIndex: number) => {
      setLoading(true)
      setError(false)
      try {
        const limit = LOAD_LIMITS[limitIndex]
        const data = await searchPlayers(query, limit)
        setResults(data)
        setLoadIndex(limitIndex)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    },
    [query],
  )

  useEffect(() => {
    fetchPage(0)
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (!loading && !isFinalLoad) {
      fetchPage(loadIndex + 1)
    }
  }, [loading, isFinalLoad, fetchPage, loadIndex])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: "200px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchInput.trim().length >= 2) {
      router.push(`/search/${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const loadedFully = !loading && results.length >= currentLimit && !isFinalLoad

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <form onSubmit={handleSearch} className="mb-8">
        <Input
          placeholder="Search Dota 2 player..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </form>

      {loading && results.length === 0 && (
        <p className="text-center text-muted-foreground">Searching...</p>
      )}

      {error && results.length === 0 && (
        <p className="text-center text-muted-foreground">Search failed. Try again.</p>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="text-center text-muted-foreground">
          No players found for &ldquo;{query}&rdquo;
        </p>
      )}

      {results.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""} for
            &ldquo;{query}&rdquo;
          </p>
          <div className="space-y-2">
            {results.map((r) => (
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

          <div ref={sentinelRef} className="h-4" />

          {loading && results.length > 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading more...</p>
          )}

          {loadedFully && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Scroll for more results...
            </p>
          )}

          {!loading && (isFinalLoad || results.length < currentLimit) && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              All results loaded
            </p>
          )}
        </>
      )}
    </main>
  )
}
