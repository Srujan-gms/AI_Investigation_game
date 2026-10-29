# 🚀 Vercel Deployment & API Requirements Guide

> **Project:** AI Mystery Room — Detective Investigation Experience  
> **Target Environment:** Vercel (Edge CDN + Node Serverless Functions)  
> **Localhost Behavior:** Zero authentication required (auth automatically bypassed for testing)  
> **Production / Hosting Behavior:** Google Authentication via Firebase + Gemini AI Procedural Pipeline  

---

## 📋 Table of Contents
1. [Architecture on Vercel](#1-architecture-on-vercel)
2. [Complete API & Environment Variables Checklist](#2-complete-api--environment-variables-checklist)
3. [Firebase Setup for Google Authentication](#3-firebase-setup-for-google-authentication)
4. [Step-by-Step Vercel Deployment](#4-step-by-step-vercel-deployment)
5. [Localhost vs. Vercel Hosting Behavior](#5-localhost-vs-vercel-hosting-behavior)
6. [Post-Deployment Verification & Troubleshooting](#6-post-deployment-verification--troubleshooting)

---

## 1. Architecture on Vercel

The project uses a dual-service setup configured in [`vercel.json`](vercel.json):

```
                       User Request
                            │
               ┌────────────┴────────────┐
               │                         │
     Path: /api/*                  Path: /* (All UI)
               │                         │
               ▼                         ▼
   ┌───────────────────────┐   ┌───────────────────┐
   │ Vercel Serverless Fn  │   │  Vercel Edge CDN  │
   │   (server/server.js)  │   │   (client/dist)   │
   │  API & Game Engine    │   │  Vite SPA Assets  │
   └───────────────────────┘   └───────────────────┘
```

* **Frontend (`client/`)**: Built using Vite, served globally from Vercel's high-speed Edge CDN.
* **Backend (`server/`)**: Runs as a universal Node.js serverless function (`server/server.js` & `server/handler.js`).
* **API Rewrites**: Automatically routes `/api/(.*)` to the backend serverless service.

---

## 2. Complete API & Environment Variables Checklist

Set these variables in your **Vercel Project Dashboard** under **Settings > Environment Variables**:

| Variable Name | Required? | Category | Description | Where to Get |
|---|---|---|---|---|
| `GEMINI_API_KEY` | **Recommended** | AI Engine | Powers the real-time mystery generator, dynamic alibi synthesis, and AI hint system. *(If omitted, falls back to built-in procedural engine)* | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `VITE_FIREBASE_API_KEY` | **Required for Auth** | Google Sign-In | Firebase Web API key for Google OAuth authentication. | [Firebase Console](https://console.firebase.google.com/) |
| `VITE_FIREBASE_AUTH_DOMAIN` | **Required for Auth** | Google Sign-In | Firebase Auth domain (`<project-id>.firebaseapp.com`). | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | **Required for Auth** | Google Sign-In | Google Cloud / Firebase Project ID. | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | Optional | File Storage | Firebase Storage bucket (`<project-id>.firebasestorage.app`). | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Optional | Push / Telemetry | Firebase Cloud Messaging Sender ID. | Firebase Console |
| `VITE_FIREBASE_APP_ID` | **Required for Auth** | Google Sign-In | Firebase Web Application ID (`1:xxx:web:xxx`). | Firebase Console |
| `MONGO_URI` | Optional | Database | MongoDB Atlas connection string for persistent cross-session storage. *(If omitted, in-memory cache is used)* | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| `CLOUDINARY_CLOUD_NAME` | Optional | Image CDN | Cloudinary cloud name for custom evidence image hosting. | [Cloudinary](https://cloudinary.com) |
| `CLOUDINARY_API_KEY` | Optional | Image CDN | Cloudinary API Key. | Cloudinary |
| `CLOUDINARY_API_SECRET` | Optional | Image CDN | Cloudinary API Secret. | Cloudinary |

> [!NOTE]
> Variables prefixed with `VITE_` are bundled by Vite for client-side Google authentication.
> Non-prefixed variables (e.g. `GEMINI_API_KEY`, `MONGO_URI`) remain **strictly private on the backend** and are never exposed to the browser.

---

## 3. Firebase Setup for Google Authentication

To enable Google Sign-In on your Vercel deployment:

### Step 3.1: Create a Project in Firebase
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** (or select an existing Google Cloud project).
3. Disable or enable Google Analytics (optional), then click **Create Project**.

### Step 3.2: Enable the Google Sign-In Provider
1. In the Firebase sidebar, navigate to **Build > Authentication**.
2. Click **Get Started**, then select the **Sign-in method** tab.
3. Click **Google** under Additional Providers.
4. Toggle **Enable**, configure your project support email, and click **Save**.

### Step 3.3: Whitelist your Vercel Domain (Crucial)
1. In the **Authentication** section, click the **Settings** tab.
2. Select **Authorized domains** from the sub-menu.
3. Click **Add domain**.
4. Enter your Vercel deployment domain:
   * Example: `your-project-name.vercel.app`
   * *(If you use a custom domain, e.g. `detective.yourdomain.com`, add that as well)*.

### Step 3.4: Register Web App & Retrieve Credentials
1. Click the **Gear icon (Project Settings)** at the top of the sidebar.
2. Under the **General** tab, scroll down to **Your apps** and click the **Web icon (</>)**.
3. Name your app (e.g., `AI Mystery Room Web`) and click **Register app**.
4. Copy the `firebaseConfig` properties:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

---

## 4. Step-by-Step Vercel Deployment

### Method A: Deploy via Vercel Web Dashboard (Recommended)

1. **Push Code to Git**:
   Push your repository to GitHub, GitLab, or Bitbucket:
   ```bash
   git add .
   git commit -m "feat: complete noir mystery room with cctv & auth"
   git push origin main
   ```

2. **Import to Vercel**:
   * Open [vercel.com](https://vercel.com) and log in.
   * Click **Add New... > Project**.
   * Select your Git repository and click **Import**.

3. **Configure Build Settings**:
   Vercel reads [`vercel.json`](vercel.json) automatically. Ensure these settings are matched:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `client` (or leave default `.` as handled by `vercel.json`)
   * **Build Command**: `vite build`
   * **Output Directory**: `dist`

4. **Add Environment Variables**:
   In the **Environment Variables** section, paste the values collected in Section 2:
   * `GEMINI_API_KEY`
   * `VITE_FIREBASE_API_KEY`
   * `VITE_FIREBASE_AUTH_DOMAIN`
   * `VITE_FIREBASE_PROJECT_ID`
   * `VITE_FIREBASE_STORAGE_BUCKET`
   * `VITE_FIREBASE_MESSAGING_SENDER_ID`
   * `VITE_FIREBASE_APP_ID`
   * *(Optional)* `MONGO_URI`

5. **Deploy**:
   * Click **Deploy**. Vercel will build the Vite client and deploy the serverless backend function.

---

### Method B: Deploy via Vercel CLI

If you prefer deploying directly from your terminal:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Log In to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   Run from the project root:
   ```bash
   vercel
   ```
   Follow the prompts to link the project.

4. **Add Environment Variables via CLI**:
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN
   vercel env add VITE_FIREBASE_PROJECT_ID
   vercel env add VITE_FIREBASE_APP_ID
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## 5. Localhost vs. Vercel Hosting Behavior

The codebase automatically detects its operating environment:

| Feature | Localhost (`http://localhost:5001`) | Vercel Hosting (`https://*.vercel.app`) |
|---|---|---|
| **Authentication Requirement** | **None (100% Bypassed)** | **Google Account** (or Guest Detective mode) |
| **Default User Clearance** | Lead Detective Vance (`DET-8420-LOCAL`) | Verified Google Identity (or `DET-GUEST`) |
| **Navbar Status Badge** | `● LOCALHOST CLEARANCE` (Green) | `● GOOGLE VERIFIED` or `○ GUEST MODE` |
| **Account Management** | View detective profile & career stats | Manage Google Account, Sign In / Sign Out |
| **Data Storage** | Instant In-Memory + `localStorage` | In-Memory Serverless / MongoDB Atlas |

---

## 6. Post-Deployment Verification & Troubleshooting

Once deployed to Vercel, verify your live URL:

1. **Check API Health**:
   Open `https://your-app.vercel.app/api/auth/me`. It should return a valid JSON user object.
2. **Verify Google Sign-In**:
   Click the detective badge in the top navbar, then click **Sign In with Google**. Verify the Google OAuth popup appears and signs you in.
3. **Inspect CCTV Surveillance Monitor**:
   Open an active investigation room and click the **CCTV Feeds** tab. Test:
   * Switching between `CAM 01`, `CAM 02`, and `CAM 03`.
   * Toggling vision modes (`B&W`, `IR NIGHT`, `THERMAL`).
   * Clicking `⚡ KEYFRAME ANOMALY` to jump directly to the suspicious silhouette movement.
4. **Troubleshooting Google Sign-In Errors**:
   * If you receive `auth/unauthorized-domain`: ensure you added your exact `*.vercel.app` URL to **Firebase Console > Authentication > Settings > Authorized Domains**.
   * If you receive `auth/popup-blocked`: the application automatically redirects to standard Google OAuth flow.

