# VPS deployment checklist

## Before launch

- [ ] Use a strong `POSTGRES_PASSWORD`.
- [ ] Use a long random `SESSION_SECRET`.
- [ ] Keep `.env.production` outside git.
- [ ] Verify `CLIENT_ORIGIN`, `APP_ORIGIN`, and `DATABASE_URL`.
- [ ] Decide how HTTPS will be terminated in production.

## First deploy

1. Clone the repository on the VPS.
2. Copy `.env.production.example` to `.env.production`.
3. Fill in the real production values.
4. Run:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production exec api npm run prisma:migrate:deploy
```

5. Check:

```bash
curl http://SERVER_IP/api/health
curl http://SERVER_IP
```

## Security checklist

- [ ] Do not expose PostgreSQL directly to the internet.
- [ ] Open only SSH, 80, and 443 on the VPS firewall.
- [ ] Enable HTTPS for production cookies and login flows.
- [ ] Configure PostgreSQL backups.
- [ ] Keep the server updated.
- [ ] Re-check CORS and `CLIENT_ORIGIN` after domain changes.
