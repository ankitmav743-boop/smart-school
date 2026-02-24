# Vercel par Frontend Deploy – Step by Step Settings

Ye steps **naya project** bana kar sahi settings ke sath deploy karne ke liye hain.

---

## Step 1: Naya Project banao

1. [vercel.com](https://vercel.com) pe login karo (GitHub se).
2. Dashboard pe **"Add New..."** ya **"Create"** → **"Project"** pe click karo.
3. **"Import Git Repository"** me apna **school-portal** wala repo select karo (jisme `frontend` aur `backend` dono folders hain).
4. **Import** dabao.

---

## Step 2: Configure Project – ye settings zaroor daalo

Import ke baad **"Configure Project"** wala screen aayega. Yahan **sab kuch aise set karo:**

### 2.1 Project Name (optional)
- Jo naam dena ho de do, e.g. `school-portal` ya `school-frontend`.
- URL isi se banta hai: `school-portal.vercel.app`.

### 2.2 Framework Preset
- Dropdown me **"Vite"** select karo.
- Agar Vite na mile to **"Other"** rakh sakte ho (Step 2.4 me Output Directory zaroor set karna hoga).

### 2.3 Root Directory ⚠️ (sabse important)
- **"Root Directory"** ke saamne **Edit** pe click karo.
- **`frontend`** type karo (sirf ye word, bina slash ke).
- Confirm karo taaki build sirf `frontend` folder se chale.

### 2.4 Build and Output Settings
- **Build Command:**  
  Override ON karo aur likho: **`npm run build`**
- **Output Directory:**  
  Override ON karo aur likho: **`dist`**
- **Install Command:**  
  Default rehne do: **`npm install`** (override off)

### 2.5 Environment Variables (optional abhi)
- Agar backend already Render par deploy hai to yahan add kar sakte ho:
  - **Name:** `VITE_API_BASE_URL`  
  - **Value:** `https://YOUR-RENDER-BACKEND-URL/api`  
  (Render wale backend URL ke end me `/api` laga ke)
- Nahi to deploy ke baad bhi **Settings → Environment Variables** me add kar sakte ho.

---

## Step 3: Deploy

- **"Deploy"** button dabao.
- Build chalegi, 1–2 minute me **"Congratulations"** / deployment URL dikhega.
- **"Visit"** pe click karke site kholo.

---

## Step 4: Agar phir bhi "No Output Directory dist" aaye

1. Project open karo → **Settings** (left sidebar).
2. **Build and Deployment** pe jao.
3. Confirm karo:
   - **Root Directory:** `frontend`
   - **Output Directory:** Override ON → value **`dist`**
   - **Build Command:** Override ON → **`npm run build`**
4. **Save** karo.
5. **Deployments** → latest deployment → **⋯** → **Redeploy**.

---

## Short checklist (copy-paste ke liye)

| Setting           | Value        |
|------------------|-------------|
| Root Directory   | `frontend`  |
| Framework Preset | Vite        |
| Build Command    | `npm run build` |
| Output Directory | `dist`      |
| Install Command  | `npm install` (default) |

---

## Purana "school-backend" project

Agar aap **naya project** bana rahe ho to purana **school-backend** Vercel project:
- ya to delete kar do (Settings → scroll down → Delete Project),  
- ya use chhod do – naya project ka alag URL hoga (e.g. `school-portal.vercel.app`).

Backend (API) **Render** par hi chalana hai; Vercel pe sirf **frontend** deploy karna hai.
