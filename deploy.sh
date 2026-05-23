#!/usr/bin/env bash
set -euo pipefail

# Build static site
npm run build

# SPA fallback: GitHub Pages serves 404.html for unknown routes
cp out/index.html out/404.html

# Deploy to gh-pages branch
npx gh-pages -d out
