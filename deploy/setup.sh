#!/usr/bin/env bash
# One-time setup for an Oracle Cloud "Always Free" Ubuntu server.
# Run as the default `ubuntu` user:  bash setup.sh
# Safe to re-run: existing .env, database and keys are kept.
set -euo pipefail

REPO="git@github.com:DIGITX-LLC/Cloth_Web_APP.git"
APP=/home/ubuntu/app
DATA=/home/ubuntu/data

PUBLIC_IP=$(curl -fsS https://ifconfig.me || curl -fsS https://api.ipify.org)
DOMAIN="${DOMAIN:-${PUBLIC_IP//./-}.sslip.io}"
echo "==> Site address will be https://$DOMAIN"

echo "==> Swap (the free 1 GB servers run out of memory during the build)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "==> System packages, Node 24 and Caddy"
sudo apt-get update -y
sudo apt-get install -y git curl ca-certificates gnupg debian-keyring debian-archive-keyring apt-transport-https iptables-persistent
if ! node -v 2>/dev/null | grep -q '^v24'; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update -y && sudo apt-get install -y caddy
fi

echo "==> Firewall: open ports 80 and 443 (Oracle's Ubuntu image blocks them)"
for port in 80 443; do
  sudo iptables -C INPUT -p tcp --dport $port -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 1 -p tcp --dport $port -j ACCEPT
done
sudo netfilter-persistent save

echo "==> GitHub deploy key (read-only access to the private repo)"
if [ ! -f ~/.ssh/id_ed25519 ]; then
  ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519 -C "oracle-store-deploy"
fi
ssh-keyscan -H github.com >> ~/.ssh/known_hosts 2>/dev/null
if [ ! -d "$APP/.git" ]; then
  until git clone "$REPO" "$APP" 2>/dev/null; do
    echo
    echo "Add this key on GitHub: repo Settings -> Deploy keys -> Add deploy key (leave write access off):"
    echo
    cat ~/.ssh/id_ed25519.pub
    echo
    read -rp "Press Enter once the key is added... "
  done
fi
cd "$APP"

echo "==> Environment file"
mkdir -p "$DATA"
if [ ! -f .env ]; then
  rand() { node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"; }
  cat > .env <<EOF
DATABASE_URL="file:$DATA/store.db"
SESSION_SECRET="$(rand)"
SITE_URL="https://$DOMAIN"
RESEND_API_KEY=""
EMAIL_FROM=""
JOBS_SECRET="$(rand)"
EOF
  chmod 600 .env
fi

echo "==> Install, migrate and build"
npm ci
npx prisma generate
[ -f "$DATA/store.db" ] && npm run db:backup
npm run db:deploy
NODE_ENV=production npm run build

echo "==> App service"
sudo tee /etc/systemd/system/store.service >/dev/null <<EOF
[Unit]
Description=Wholesale store
After=network.target

[Service]
User=ubuntu
WorkingDirectory=$APP
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npx next start -H 127.0.0.1 -p 3000
Restart=always

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now store
sudo systemctl restart store

echo "==> HTTPS proxy"
sudo tee /etc/caddy/Caddyfile >/dev/null <<EOF
$DOMAIN {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}
EOF
sudo systemctl reload caddy || sudo systemctl restart caddy

echo "==> Scheduled jobs: email queue every minute, database backup daily"
JOBS_SECRET=$(grep '^JOBS_SECRET=' .env | cut -d'"' -f2)
( crontab -l 2>/dev/null | grep -v 'api/jobs/email' | grep -v 'db:backup'
  echo "* * * * * curl -fsS -X POST -H 'Authorization: Bearer $JOBS_SECRET' http://127.0.0.1:3000/api/jobs/email >/dev/null 2>&1"
  echo "30 3 * * * cd $APP && npm run db:backup >> $DATA/backup.log 2>&1"
) | crontab -

echo
echo "Done. Site: https://$DOMAIN"
echo "Next: create your admin account with  node deploy/create-admin.cjs"
