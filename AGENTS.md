<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment

## GitHub Pages (`emonnemo.github.io/dota-stats`)

1. Ensure `NEXT_PUBLIC_STRATZ_API_KEY` is set:
   - **CI (GitHub Actions):** Add `STRATZ_API_KEY` to repo secrets → gets mapped in `.github/workflows/deploy.yml`
   - **Manual:** Copy `.env.example` to `.env.local` and fill in your key, then run `./deploy.sh`

2. Push to `main` → GitHub Actions deploys automatically.
   - Or manually: `./deploy.sh` (requires `npx gh-pages`)

3. GitHub Pages settings: Source = **GitHub Actions**

The app uses `basePath: "/dota-stats"` so all links include the repo name prefix.
