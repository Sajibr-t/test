#!/usr/bin/env bash
# Pull the latest code from GitHub and redeploy.  Run on the server:  bash ~/app/deploy/update.sh
set -euo pipefail
cd /home/ubuntu/app
git pull --ff-only
npm ci
npx prisma generate
npm run db:backup
npm run db:deploy
NODE_ENV=production npm run build
sudo systemctl restart store
echo "Updated."
