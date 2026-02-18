# Database Setup (cPanel MySQL)

This project now supports a real MySQL database (cPanel). You can choose either:
- Option A: Use Prisma commands via SSH (recommended)
- Option B: Import SQL via phpMyAdmin (no SSH)

---

## 1) Connection Details (.env)

Create a `.env` file in the project root:

```
DATABASE_URL="mysql://corpora5_webprometrics:YOUR_PASSWORD@localhost:3306/corpora5_webprometricske?connection_limit=5&pool_timeout=15"
JWT_SECRET="change-me-in-production"
TOKEN_ENCRYPTION_KEY="change-me-too"
```

Replace `YOUR_PASSWORD` with your actual DB password.

> Example (do not commit secrets):
>
> `mysql://corpora5_webprometrics:5eJF)*QROqRTisR@localhost:3306/corpora5_webprometricske?connection_limit=5&pool_timeout=15`

---

## 2) Option A — SSH + Prisma (Recommended)

Prereqs: SSH access on your hosting plan, Node 18+ available.

Commands:

```bash
# From project root on the server
npm ci
npx prisma generate
# For first-time schema creation (no migrations yet)
npx prisma db push
# Or if using migrations
npx prisma migrate deploy
```

Tools:
- `npx prisma studio` (optional) opens browser DB viewer (may require port access).

---

## 3) Option B — phpMyAdmin Import (No SSH)

Use the SQL file we provide:

1. Open cPanel > phpMyAdmin > select `corpora5_webprometricske` database
2. Import the file: `prisma/mysql-init.sql`
3. Verify tables appear: `User`, `Client`, `Report`, `Template`, `Invoice`, `Integration`, `OAuthToken`, `AuditLog`, `ScheduledReport`, `Subscription`

Later, when SSH is available, you can switch to Prisma migrations.

---

## 4) App Configuration

- The server reads `DATABASE_URL`. If present and Prisma is installed, move features from JSON storage to MySQL incrementally.
- Current release still reads/writes JSON (`db.json`) for many routes. We will gradually port endpoints to Prisma (auth, clients, reports)
  and leave JSON as a fallback.

---

## 5) Next Steps (Backend Porting Plan)

1) Auth & Users
- Store users in MySQL; login/signup query via Prisma
- Keep JSON fallback for local dev

2) Clients & Reports
- Read filtered by tenant (`tenantId`, `companyName`, `userId`) via Prisma
- Create/update attach `tenantId` and `userId`

3) Integrations & OAuth Tokens
- Persist `OAuthToken` with encryption
- Add provider-specific tables if needed later

4) Scheduled Reports & Invoices
- Move schedule storage to `ScheduledReport`
- Keep invoices in `Invoice`

---

## 6) cPanel Notes

- DB names and users are prefixed: expect `corpora5_...`
- Host is usually `localhost`
- If you need remote DB access from your IP, use cPanel > Remote MySQL®
- For backups, use cPanel backups or scheduled `mysqldump`

---

## 7) Troubleshooting

- If Prisma CLI not available on server: use Option B (phpMyAdmin) then deploy updated code.
- If Node is old on your host: run migrations locally against a remote MySQL (allow your IP) or generate SQL locally and import.
- If `npm ci` fails due to network limits: vendor the Prisma client locally and upload `node_modules` (not ideal), or switch to Option B.
