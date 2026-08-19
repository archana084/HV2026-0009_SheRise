# 🎓 TrustCred — Blockchain & AI Academic Credential Platform

A full-stack, decentralized academic credential issuance and verification platform built with **TypeScript**, **React 19**, **Vite**, **Express.js**, **Ethers.js**, and **Groq AI** (`llama-3.3-70b-versatile`).

TrustCred empowers universities to issue tamper-proof academic credentials, enables students to manage and share verified profiles, and provides employers with instant 5-step cryptographic verification and AI security audits.

---

## 🌟 Key Features

### 🏛️ 1. College & University Portal
* **Institutional Authentication**: Secure login for authorized university administrators and registrars.
* **Credential Issuance**: Issue official Degree Certificates, Transcripts, and Diplomas.
* **Canonical Hashing**: Normalizes academic data into a deterministic canonical string and generates an immutable SHA-256 cryptographic digest.
* **Blockchain Registration**: Records credential hashes and metadata on the `TrustCredRegistry` smart contract.
* **Revocation & Tamper Simulation**: Allows registrars to revoke credentials on-chain or simulate data tampering to demonstrate security features.

### 🎓 2. Student Portal
* **Verified Record Access**: View authenticated degrees, GPA/grades, and official transcripts.
* **QR Code Verification**: Generate instant QR codes for fast sharing with employers and institutions.
* **Groq AI Profile Synthesizer**: Generate an executive summary profile and verified skill badge matrix strictly from authenticated academic records.
* **Live AI Student Assistant**: Interactive AI chatbot powered by Groq AI (`llama-3.3-70b-versatile`) to answer questions on credential security, blockchain hashing, and platform usage.

### 🔍 3. Employer & Verifier Portal
* **Instant Verification**: Search by Credential ID (e.g., `TC-2026-89421`) or QR code scan.
* **5-Step Cryptographic Audit**:
  1. Registry Database existence check.
  2. Immutable Blockchain smart contract record lookup.
  3. On-chain revocation status verification.
  4. Real-time SHA-256 canonical hash recalculation (Tamper Detection).
  5. Final authenticity determination (**VERIFIED**, **TAMPERED**, **REVOKED**, **NOT_FOUND**).
* **Groq AI Risk Audit**: Analyzes verification outcomes to output authenticity scores, risk levels (Low/Medium/High), and skill extractions.

---

## 🛠️ Technology Stack & Languages

### 🎨 Frontend
* **Language**: TypeScript (`.tsx`, `.ts`), HTML5, CSS3
* **Framework**: React 19, Vite 6
* **Styling**: Tailwind CSS 4, Lucide React Icons, Framer Motion
* **Utilities**: `qrcode.react` (QR generation)

### ⚙️ Backend API
* **Language**: TypeScript (`.ts`), Node.js
* **Server Framework**: Express 4
* **AI Engine**: Groq SDK (`groq-sdk` — model `llama-3.3-70b-versatile`)
* **Environment**: `dotenv`
* **Deployment Runtime**: Vercel Serverless Functions (`api/index.ts`)

### ⛓️ Blockchain & Security
* **Smart Contract Language**: Solidity (`contracts/TrustCredRegistry.sol`)
* **Framework**: Hardhat
* **Web3 Library**: Ethers.js v6
* **Hashing Algorithm**: Cryptographic SHA-256 (Canonical String Format)

---

## 📁 Project Structure

```
trustcred/
├── api/                   # Vercel Serverless API Functions
│   └── index.ts           # Express serverless entry point
├── contracts/             # Solidity Smart Contracts
│   └── TrustCredRegistry.sol
├── src/                   # React Frontend Source
│   ├── components/        # Reusable UI Components (Navbar, Footer, Modals, Chatbot)
│   ├── pages/             # Landing, College, Student, & Verifier Pages
│   ├── services/          # Auth, Blockchain, & Credential API Services
│   ├── types/             # TypeScript Interfaces & Definitions
│   ├── utils/             # Canonical hashing & helper functions
│   ├── App.tsx            # Main App Routing & State
│   └── main.tsx           # React DOM Entrypoint
├── hardhat.config.cjs     # Hardhat Blockchain Config
├── server.ts              # Express API Server & Groq AI Endpoints
├── vercel.json            # Vercel SPA & Serverless Rewrite Config
├── package.json           # Dependencies & Scripts
├── tsconfig.json          # TypeScript Configuration
├── vite.config.ts         # Vite Bundler Config
└── README.md              # Project Documentation
```

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the root directory:

```env
# Groq AI API Key (Get your free key at https://console.groq.com)
GROQ_API_KEY="gsk_your_groq_api_key_here"

# Application URL
APP_URL="http://localhost:3000"
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
Make sure you have the following installed on your machine:
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher (comes with Node.js)
* **Git**

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/archana084/HV2026-0009_SheRise.git
   cd HV2026-0009_SheRise
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   Add your Groq API key in `.env`:
   ```env
   GROQ_API_KEY="gsk_your_actual_groq_key_here"
   APP_URL="http://localhost:3000"
   ```

4. **Run Local Development Server**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to **`http://localhost:3000`**.

5. **Build for Production**
   ```bash
   npm run build
   ```

6. **Start Production Server**
   ```bash
   npm run start
   ```

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the full-stack development server with Vite & Express |
| `npm run build` | Builds static Vite assets into `dist/` and bundles `server.ts` |
| `npm run start` | Runs the production server from `dist/server.cjs` |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Removes build outputs (`dist/`) |

---

## 🔑 Demo Accounts & Test Credentials

### 🏛️ Authorized College Accounts (College Portal)
> **Password for all demo accounts:** `demo1234`

* **JNTUH (JNTUH-HYD-01)**: `trrcollege121@gmail.com` or `registrar@jntuh.ac.in`
* **Osmania University**: `trrcollege121@gmail.com` or `registrar@osmania.ac.in`
* **AUTONOMOUS**: `trrcollege121@gmail.com` or `principal@autonomous.edu.in`
* **SBTET**: `trrcollege121@gmail.com` or `secretary@sbtet.telangana.gov.in`

### 🔍 Sample Credential IDs (For Employer Verification)
* **`TC-2026-89421`** — Divya Mudavath (B.Tech AI & Data Science - JNTUH) — **VERIFIED**
* **`TC-2026-89422`** — Divya Mudavath (Official Transcript - JNTUH) — **VERIFIED**
* **`TC-2026-77319`** — Aarav Patel (B.Tech Computer Science - Osmania) — **VERIFIED**
* **`TC-2025-41092`** — Elena Rostova (M.S. Software Engineering - AUTONOMOUS) — **REVOKED**

### 🎓 Student Portal Demo Sign-In
* **Student ID**: `STU-2022-9102` (Divya Mudavath)
* **Student ID**: `STU-2022-8419` (Aarav Patel)

---

## 🌐 Deploying to Vercel

This repository is pre-configured for deployment on **Vercel** with static frontend assets and Express Serverless API functions.

### Deployment Steps:
1. Push your repository to **GitHub**.
2. Log in to [Vercel](https://vercel.com/new) and click **Add New Project**.
3. Import your **TrustCred** repository.
4. Set **Framework Preset** to **Vite**.
5. Add **Environment Variables** in Vercel Project Settings:
   - `GROQ_API_KEY`: Your Groq API key (`gsk_...`)
   - `APP_URL`: Your Vercel deployed domain (e.g., `https://hv-2026-0009-she-rise.vercel.app`)
6. Click **Deploy**. Vercel will automatically build the site and deploy the serverless API routes!

---

## 📄 License

This project is licensed under the MIT License.
