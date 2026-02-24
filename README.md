# School Portal

2-folder structure:

- **`backend`** – Node.js + Express + MySQL API (deploy: **Render**)
- **`frontend`** – React + Vite UI (deploy: **Vercel**)
- Database: MySQL (deploy: **Railway**)

## Local run

```bash
npm install
npm run install:all
# Set backend/.env (MySQL, etc.), then:
npm run db:init
npm run dev
```

## Deploy (Render + Vercel + Railway)

Step-by-step guide: **[DEPLOY.md](./DEPLOY.md)**

Credentials for demo logins: **LOGIN_DETAILS.md**
