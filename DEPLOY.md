# School Portal – Deploy Guide (Render + Vercel + Railway)

Project **2 folders** mein hai:
- **`backend`** – Node.js API (Render par deploy)
- **`frontend`** – React + Vite (Vercel par deploy)
- **Database** – MySQL (Railway par)

---

## 1. Kahan kya deploy hoga

| Cheez        | Platform | Kya karna hai |
|-------------|----------|----------------|
| **Database (MySQL)** | Railway | MySQL service banao, connection details copy karo |
| **Backend (API)**   | Render  | Web Service, root = `backend` |
| **Frontend (UI)**   | Vercel  | Project, root = `frontend` |

---

## 2. Pehle GitHub par code push karo

- Repo banao, phir local se:
```bash
cd C:\Users\ankit\OneDrive\Desktop\project
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git add .
git commit -m "School portal - backend + frontend"
git branch -M main
git push -u origin main
```
- **`.env` / `backend/.env` commit mat karna** (already `.gitignore` mein hai).

---

## 3. Railway – MySQL database

1. [railway.app](https://railway.app) → Login (GitHub se).
2. **New Project** → **Provision MySQL** (ya Add Plugin → MySQL).
3. MySQL service open karo → **Variables** / **Connect** tab se ye 5 cheezein copy karo:
   - `MYSQLHOST` (ya `host`)
   - `MYSQLPORT` (usually 3306)
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
4. Inko safe rakh lo – Render backend mein daalenge.

**Seed data daalna (tables + demo schools/teachers/students):**  
Apne PC se, **temporarily** `backend/.env` mein Railway wale values daal kar:

```bash
cd backend
npm install
npm run db:init
```

---

## 4. Render – Backend deploy

1. [render.com](https://render.com) → Login (GitHub).
2. **New +** → **Web Service**.
3. GitHub repo select karo.
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. **Environment Variables** add karo (Add Environment Variable):

   **Database (Railway wale):**
   - `MYSQL_HOST` = Railway ka host
   - `MYSQL_PORT` = 3306 (ya Railway port)
   - `MYSQL_USER` = Railway user
   - `MYSQL_PASSWORD` = Railway password
   - `MYSQL_DATABASE` = Railway database name

   **Auth:**
   - `JWT_SECRET` = koi strong random string (e.g. `my-super-secret-key-123-change-this`)

   **Optional (email / WhatsApp / AI):**
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `PARENT_NOTIFY_EMAIL`
   - `SMTP_ALLOW_SELF_SIGNED` = `true` ya `false`
   - `FONNTE_TOKEN`
   - `WHATSAPP_NOTIFY_NUMBER`
   - `GEMINI_API_KEY`

6. **Create Web Service** → deploy hone do.
7. Jo URL mile (e.g. `https://school-backend-xxxx.onrender.com`) – ye **Backend URL** hai.  
   Check: `https://YOUR-BACKEND-URL/api/health` → `{"ok":true,"db":true}` aana chahiye.

---

## 5. Vercel – Frontend deploy

**Zaroori:** Sirf **frontend** (React/Vite) ko Vercel par deploy karo. Backend Render par hi rahega.

1. [vercel.com](https://vercel.com) → Login (GitHub).
2. **Add New Project** → same repo select karo.
3. **Settings (bahut important – white screen nahi aayega):**
   - **Root Directory:** `frontend` **zaroor set karo.** (Edit → Root Directory → `frontend` likho.)
   - **Build Command:** `npm run build` (default rehne do ya explicitly set karo.)
   - **Output Directory:** `dist` (Vite build yahi deta hai.)
   - Framework: Vite auto-detect ho jayega.
4. **Environment Variables**:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://YOUR-BACKEND-URL/api`  
     (Render wala backend URL, end mein `/api` laga ke)
5. **Deploy** dabao.
6. Jo URL mile (e.g. `https://school-portal-xxx.vercel.app`) – ye aapka **live frontend** hai.

---

## 6. Local run (development)

```bash
cd C:\Users\ankit\OneDrive\Desktop\project
npm install
npm run install:all
# MySQL chalu karo, backend/.env set karo, phir:
npm run db:init
npm run dev
```

- Frontend: http://localhost:5173 (ya 5174)
- Backend: http://localhost:4000

---

## 7. Deploy ke baad check

1. **Backend:** Browser me `https://YOUR-RENDER-URL/api/health` → `ok: true`, `db: true`.
2. **Frontend:** Vercel URL kholo → School select karo → Principal / Teacher / Parent login try karo (LOGIN_DETAILS.md ke credentials se).

Agar koi step fail ho to us platform (Render / Vercel / Railway) ke dashboard me **Logs** dekh kar error check karo.

---

## 8. White screen / "MIME type application/octet-stream" (Vercel)

Agar Vercel par open karne par **sirf white screen** aaye aur console me error aaye:  
*"Failed to load module script... MIME type of application/octet-stream"* – matlab **frontend build use nahi ho raha**, browser ko source file `main.tsx` mil rahi hai.

**Fix:**
1. Vercel project → **Settings** → **General**.
2. **Root Directory** ko **`frontend`** set karo (pehle blank ya `backend` tha to change karo).
3. **Build & Development** me ensure karo:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Save** karke **Redeploy** karo (Deployments → latest → three dots → Redeploy).
5. Ab page load hone par built JS chalega, white screen nahi aayega.
