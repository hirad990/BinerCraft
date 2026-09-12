# BinerCraft backend — cPanel MySQL setup

## 1. Create/use the database

The current cPanel database shown for BinerCraft is:

- Database: `oxubyqf_projectz`
- User: `oxubyqf_hirad990`
- Host: `localhost`
- Port: `3306`

Make sure the user has **ALL PRIVILEGES** on the database.

## 2. Configure the Node.js application's environment

Set these variables in cPanel. Do not commit the real values to GitHub.

```env
PORT=3000
FRONTEND_URL=https://binercraft.ir
API_PREFIX=/loloh
DB_HOST=localhost
DB_PORT=3306
DB_NAME=oxubyqf_projectz
DB_USER=oxubyqf_hirad990
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_CONNECTION_LIMIT=10
ADMIN_USERNAME=hirad990
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
AUTH_SECRET=USE_A_LONG_RANDOM_SECRET
MIGRATE_JSON=false
```

## 3. Install dependencies

From the backend directory run:

```bash
npm install
```

The backend now uses `mysql2`; PostgreSQL is no longer required.

## 4. Start/restart the Node.js application

The application creates its required MySQL tables automatically on first start.

## 5. Optional migration from the old db.json

If the old JSON data needs to be preserved, run once:

```bash
npm run migrate:json
```

The importer stops automatically if the users table already contains data, which prevents accidental duplicate imports.

## 6. Test

Open:

`https://binercraft.ir/loloh/api/health`

Expected response includes:

```json
{
  "status": "ok",
  "database": "mysql",
  "apiPrefix": "/loloh"
}
```

Never put the real MySQL password, admin password, or `AUTH_SECRET` in GitHub.
