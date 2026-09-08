# Beauty Hub

Каталог кабинетов, мероприятий и вакансий для бьюти-индустрии Ростова-на-Дону. Основной клиент — Telegram Mini App.

Локальная разработка: `npm install`, MongoDB на `localhost:27017`, `npm run dev`.

## Production (Ubuntu + Docker)

Сервер: `72.56.107.90`  
Домен: `https://beautyrostov.mooo.com`

Нужны DNS A-запись `beautyrostov.mooo.com → 72.56.107.90` и открытые порты 22, 80, 443.

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
# выйти из SSH и зайти снова

git clone <YOUR_REPO_URL> /opt/beauty-hub
cd /opt/beauty-hub
cp .env.example .env
nano .env
chmod +x deploy.sh
./deploy.sh
```

В `.env` обязательно:

- `NEXT_PUBLIC_APP_URL=https://beautyrostov.mooo.com`
- `DOMAIN=beautyrostov.mooo.com`
- `ACME_EMAIL` — ваш email для Let's Encrypt
- `MONGO_USER` / `MONGO_PASSWORD` (только буквы и цифры)
- `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`

Mongo наружу не публикуется. HTTPS выдаёт Caddy. После деплоя в BotFather:

- Domain: `beautyrostov.mooo.com`
- Menu Button и Main Mini App: `https://beautyrostov.mooo.com/telegram`
