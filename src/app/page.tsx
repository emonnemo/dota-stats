export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Dota Stats</h1>
        <p className="mt-2 text-muted-foreground">
          Search any Dota 2 player to see their stats and recent matches
        </p>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        Powered by{" "}
        <a
          href="https://www.stratz.com/api"
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          STRATZ API
        </a>
      </p>
    </main>
  )
}
