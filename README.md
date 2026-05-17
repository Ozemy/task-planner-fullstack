# Task Planner Fullstack

Full-stack планировщик задач с личным кабинетом, `Guest Mode`, `Account Mode`, PostgreSQL, Docker, Smart Planner, Focus Session и персонализацией главного экрана.

## Overview / О проекте

`Task Planner Fullstack` помогает не только хранить список задач, но и планировать день, начинать работу и постепенно переходить от локального режима к аккаунту с синхронизацией.

- `Guest Mode` работает сразу после открытия приложения и хранит данные в `localStorage`.
- `Account Mode` добавляет backend на Express, PostgreSQL, синхронизацию задач и категорий, регистрацию и личный кабинет.
- Основной интерфейс остаётся спокойным по умолчанию, а дополнительные productivity-виджеты подключаются через персонализацию.

## Features / Возможности

- Задачи, категории, подзадачи, дедлайны, приоритеты и статусы.
- Четыре режима просмотра: список, доска, неделя и календарь.
- Фильтры, поиск, сортировка и визуальное выделение важных задач.
- `Guest Mode` через `localStorage`.
- `Account Mode` через backend + PostgreSQL.
- Регистрация, login, logout и получение текущего пользователя.
- Безопасные сессии через `httpOnly` cookie.
- Синхронизация задач и категорий с backend.
- Перенос локальных данных из `localStorage` в аккаунт.
- Smart Planner с локальной приоритизацией задач.
- Focus Session с локальным таймером.
- Пульс дня и Рабочий ритм.
- Персонализация dashboard и наборы виджетов.
- Email verification.
- Подготовка настоящего Google Sign-In.
- PostgreSQL через Docker Compose.
- Windows one-click запуск через `scripts/start-all.bat`.
- Импорт и экспорт JSON, тёмная и светлая темы, мобильная адаптация.

## Tech Stack / Технологии

**Frontend**

- React
- TypeScript
- Vite
- CSS

**Backend**

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL

**Infrastructure**

- Docker Compose
- GitHub
- Windows scripts

**Security**

- Password hashing
- `httpOnly` cookies
- Env-based configuration
- Auth tokens are not stored in `localStorage`

## Screenshots

> Add screenshots here after final UI review.

- Main planner screen
- Account page
- Dashboard personalization
- Smart Planner
- Calendar view

## Local Quick Start / Быстрый запуск

### Windows quick start

1. Open Docker Desktop.
2. Run `scripts/start-all.bat`.
3. Open the local frontend URL from the terminal output.

### Manual start

```powershell
npm install
npm --prefix server install
Copy-Item server\.env.example server\.env
npm run db:up
npm run db:migrate
npm run dev:server
npm run dev:web
```

Frontend:

- `http://127.0.0.1:5173`

Backend health:

- `http://127.0.0.1:4000/api/health`

## Windows one-click start

Для запуска почти одной кнопкой доступны bat-файлы:

- `scripts/start-all.bat` — поднимает PostgreSQL, применяет миграции, запускает backend и frontend.
- `scripts/check-health.bat` — проверяет backend health endpoint.
- `scripts/stop-all.bat` — останавливает Docker PostgreSQL и напоминает закрыть окна backend/frontend вручную.

Если закрыть окна backend или frontend, соответствующая часть приложения перестанет работать. Если Docker Desktop закрыт, база данных не запустится. Обычный запуск одной копии проекта не меняется; если вы запускаете несколько копий на одной машине, сначала остановите старую через `scripts/stop-all.bat` или `npm run db:down`, чтобы освободить используемые Docker-ресурсы и порт PostgreSQL.

## Guest Mode vs Account Mode

| Режим | Где хранятся данные | Что доступно |
| --- | --- | --- |
| `Guest Mode` | `localStorage` браузера | Полноценный локальный planner без регистрации |
| `Account Mode` | PostgreSQL через backend | Личный кабинет, синхронизация, профиль и настройки |

После входа приложение предлагает перенести локальные данные в аккаунт. Пользователь может:

- перенести данные;
- скачать JSON;
- оставить всё локально;
- вернуться к решению позже.

Локальные данные не удаляются автоматически.

## Smart Planner and Focus Session

**Smart Planner** — локальный алгоритм приоритизации, который анализирует просрочки, задачи на сегодня, ближайшие дедлайны, приоритеты и подзадачи. Он не использует внешние AI API и не отправляет пользовательские задачи на сторонние сервисы.

**Focus Session** — локальный таймер фокус-работы для выбранной задачи с быстрым завершением, паузой и выбором длительности 15 / 25 / 45 минут.

## Dashboard Personalization

Главный экран по умолчанию остаётся компактным. Пользователь может включать дополнительные блоки через персонализацию:

- Новая задача
- Smart Planner
- Focus Session
- Пульс дня
- Рабочий ритм
- Сегодня в фокусе
- mobile category chips

Доступны пресеты:

- `Минимальный`
- `Сбалансированный`
- `Фокус`
- `Аналитика`
- `Полный`

Для гостей настройки сохраняются локально, для авторизованных пользователей — в backend `UserSettings`.

## Email Verification

Email verification уже заложен в backend:

- аккаунт не блокируется без подтверждения email;
- в личном кабинете показывается статус email;
- доступна повторная отправка письма подтверждения;
- в development-режиме без SMTP backend выводит ссылку подтверждения в консоль.

Для настоящей отправки писем задаются SMTP-переменные в `server/.env`.

## Google Sign-In Setup

Google Sign-In подготовлен как настоящий сценарий, без фейковой авторизации:

- frontend использует `VITE_GOOGLE_CLIENT_ID`;
- backend использует `GOOGLE_CLIENT_ID`;
- endpoint `POST /api/auth/google` проверяет Google ID token;
- если OAuth Client ID не настроен, кнопка входа через Google отключена.

## Project Structure

```text
public/
src/
  api/
  components/
  context/
  hooks/
  pages/
  storage/
  styles/
  types/
  utils/
server/
  prisma/
  src/
    config/
    db/
    middleware/
    routes/
    services/
    types/
    utils/
scripts/
nginx/
Dockerfile.web
docker-compose.prod.yml
.env.production.example
docker-compose.yml
```

## Environment Variables

### `server/.env`

- `DATABASE_URL`
- `SESSION_SECRET`
- `CLIENT_ORIGIN`
- `NODE_ENV`
- `PORT`
- `COOKIE_SECURE` — `auto` by default; use `false` only for a temporary HTTP/IP smoke-test
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `APP_ORIGIN` — optional public app URL if you later separate it from `CLIENT_ORIGIN`
- `GOOGLE_CLIENT_ID`

Текущая реализация использует `CLIENT_ORIGIN`; `APP_ORIGIN` описан как optional deployment variable for future hosting setups.

### frontend `.env`

- `VITE_GOOGLE_CLIENT_ID`

Реальные `.env`-файлы не должны попадать в GitHub. В репозитории хранятся только example-файлы.

## Full-stack Deployment Notes

Статический хостинг подходит только для frontend и `Guest Mode`.

Для полноценного `Account Mode` нужны:

1. frontend build:

```bash
npm run build
```

2. backend build:

```bash
npm run build:server
```

3. PostgreSQL.
4. Настроенный `server/.env`.
5. Docker или VPS для backend.
6. HTTPS в production.
7. Корректные значения `CLIENT_ORIGIN`, `DATABASE_URL` и `SESSION_SECRET`.

Практичный production-вариант для самостоятельного размещения: VPS + Docker + PostgreSQL + Node backend + отдельно опубликованный frontend build.

## Deploy to VPS

### 1. Выберите VPS

Для небольшого production-деплоя подойдут:

- Ubuntu `22.04` или `24.04`;
- `1-2 vCPU`;
- минимум `2 GB RAM`;
- `20+ GB SSD`.

### 2. Подключитесь по SSH

```bash
ssh user@SERVER_IP
```

### 3. Установите Docker и Docker Compose

Установите Docker Engine и Docker Compose plugin по инструкции вашего хостинга или официальной документации Docker, затем проверьте:

```bash
docker --version
docker compose version
```

### 4. Склонируйте репозиторий

```bash
git clone https://github.com/Ozemy/task-planner-fullstack.git
cd task-planner-fullstack
```

### 5. Создайте production env

```bash
cp .env.production.example .env.production
```

### 6. Заполните production значения

Минимум замените:

- `POSTGRES_PASSWORD`
- `SESSION_SECRET`
- `CLIENT_ORIGIN`
- `APP_ORIGIN`
- `DATABASE_URL`

Примерно так:

```env
CLIENT_ORIGIN=https://your-domain.ru
APP_ORIGIN=https://your-domain.ru
DATABASE_URL=postgresql://task_planner_user:strong_password@postgres:5432/task_planner
```

### 7. Запустите production stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### 8. Примените production migrations

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec api npm run prisma:migrate:deploy
```

### 9. Проверьте первый запуск

```bash
curl http://SERVER_IP/api/health
curl http://SERVER_IP
```

Для первичного smoke-test сайт можно открыть по IP через HTTP. `Guest Mode` при этом работает полностью локально через `localStorage` и не зависит от backend-авторизации. По умолчанию в `NODE_ENV=production` auth cookie помечаются как `secure`, поэтому полноценный `Account Mode` нужно проверять уже через HTTPS.

Если вам нужно временно проверить регистрацию и вход именно по `http://SERVER_IP`, можно выставить `COOKIE_SECURE=false` в `.env.production`. Это допустимо только для короткого smoke-test. Для настоящего production-деплоя с доменом и HTTPS оставьте `COOKIE_SECURE=auto` или задайте `COOKIE_SECURE=true`.

### 10. Подключите домен

Создайте `A`-запись домена на IP вашего VPS.

### 11. Включите HTTPS

Контейнер `web` уже отдаёт frontend и проксирует `/api` на backend внутри Docker-сети. Для настоящего production-деплоя добавьте HTTPS на уровне VPS:

1. Установите host-level `nginx` и `certbot`.
2. Настройте reverse proxy на контейнерный web-сервис.
3. Выполните:

```bash
sudo certbot --nginx
```

На первом этапе допустимо открыть контейнерный web-сервис напрямую на `80` для проверки по IP. Когда включаете host-level Nginx/Certbot, перенесите внутренний web upstream за reverse proxy, например на localhost-порт, чтобы host Nginx мог занять `80/443`.

### VPS security checklist

- Используйте сильный `SESSION_SECRET`.
- Используйте сильный `POSTGRES_PASSWORD`.
- Не коммитьте `.env.production`.
- Для реального production используйте HTTPS и `COOKIE_SECURE=auto` или `COOKIE_SECURE=true`.
- Не открывайте прямой доступ к PostgreSQL снаружи.
- Оставьте наружу только SSH, `80` и `443`.
- Обязательно включите HTTPS.
- Настройте backup PostgreSQL.
- Следите за обновлениями сервера.
- После смены домена перепроверьте CORS и `CLIENT_ORIGIN`.

Короткая отдельная памятка также лежит в [`scripts/deploy-checklist.md`](scripts/deploy-checklist.md).

## Security Notes

- Пароли хранятся только как hash.
- Сессии работают через `httpOnly` cookie.
- Auth tokens не сохраняются в `localStorage`.
- Конфигурация идёт через env-переменные.
- Реальные `.env`-файлы, сборочные артефакты и зависимости исключены из git.

## Roadmap

- Смена email и пароля.
- Полноценный production mail-flow.
- Серверные напоминания о дедлайнах.
- Повторяющиеся задачи.
- Совместная работа.
- Расширенные сценарии синхронизации и аналитики.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm run typecheck:server
npm run build:server
npm --prefix server run prisma:generate
```
