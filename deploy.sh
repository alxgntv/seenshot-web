#!/bin/zsh
set -euo pipefail
cd "$(dirname "$0")"
echo "deploy: npm install"
npm install
echo "deploy: wrangler deploy"
npx wrangler deploy
echo "deploy: seenshot.app"
echo "deploy: workers.dev https://seenshot-web.codemarket.workers.dev"
