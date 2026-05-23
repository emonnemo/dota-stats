"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { searchPlayers } from "@/lib/client-api"

interface SearchResult {
  id: number
  name: string
  avatar: string
  lastMatchDateTime: number
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const data = await searchPlayers(q)
      setResults(data)
      setOpen(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(timer.current)
  }, [query, doSearch])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative w-full max-w-lg">
      <Input
        placeholder="Search Dota 2 player..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ...
        </div>
      )}
      {open && results.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg">
          {results.map((r) => (
            <button
              key={r.id}
              className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted"
              onClick={() => {
                setOpen(false)
                setQuery("")
                router.push(`/player/${r.id}`)
              }}
            >
              <img src={r.avatar} alt="" className="h-8 w-8 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">ID: {r.id}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
