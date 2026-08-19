# TrustCred - Academic Credential Verification Platform

A full-stack, blockchain-backed academic credential verification system built with React, Vite, Express, and Ethers.js.

## Local Development

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Steps
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set environment variables in `.env` (e.g. `GEMINI_API_KEY`).
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## Deploying to Vercel

This repository is pre-configured for seamless deployment on **Vercel** with:
- Static Frontend build (`dist/` via Vite)
- Express Serverless API (`/api/*` via `api/index.ts`)

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. Push your repository to **GitHub** / **GitLab** / **Bitbucket**.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **Add New Project**.
3. Import your **TrustCred** repository.
4. Framework Preset will auto-detect as **Vite**.
5. Configure Environment Variables (if needed):
   - `GEMINI_API_KEY`: Your Gemini API key
6. Click **Deploy**. Vercel will build the frontend and set up the `/api` serverless endpoints automatically!

### Method 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Login to Vercel:
   ```bash
   vercel login
   ```
3. Deploy to preview:
   ```bash
   vercel
   ```
4. Deploy to production:
   ```bash
   vercel --prod
   ```
"# HV2026-0009_SheRise" 
