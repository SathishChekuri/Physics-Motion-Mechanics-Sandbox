# Physics Motion Mechanics Sandbox

An interactive educational physics laboratory and simulation platform where students can experiment with 2D projectile mechanics, visualize physical trajectories with vector overlays, compare experiments, generate print-ready laboratory reports, and receive step-by-step AI-powered explanations.

---

## 🌟 Key Features

1. **Deterministic Physics Engine**
   - **Ideal Projectile Motion**: Closed-form analytical kinematic solutions calculating horizontal velocity ($v_x$), vertical velocity ($v_y(t)$), landing time ($t_{land}$), maximum apex elevation ($H_{max}$), and total horizontal range ($R$).
   - **Aerodynamic Fluid Resistance**: 4th-Order Runge-Kutta (RK4) numerical differential solver modeling quadratic air drag ($F_d = \frac{1}{2} \rho C_d A v^2$).
   - **Edge-Case Handled**: Full physical stability for ground-level launches ($h_0 = 0$), elevated sea-cliff drops ($h_0 > 0$), pure vertical rockets ($\theta = 90^\circ$), horizontal pitches ($\theta = 0^\circ$), and zero launch velocities.
   - **Planetary Presets**: Instant physical scenarios for Earth, Moon ($1.62 \text{ m/s}^2$), Mars ($3.72 \text{ m/s}^2$), high cliffs, and high drag.

2. **Real-Time Visualizer & Kinematic Graphs**
   - **High-DPI HTML Canvas**: Dynamic coordinate auto-scaling, launch platform/cliff, real-time velocity vector arrows, trajectory arc glow, and landing impact animations.
   - **Telemetry Dashboard**: Live time ($t$), instant position ($x(t), y(t)$), instant velocity ($v_x(t), v_y(t)$), and velocity magnitude ($|v(t)|$).
   - **Interactive Charts (Recharts)**: Trajectory curve ($y$ vs $x$), Position vs Time ($x(t), y(t)$), and Velocity vs Time ($v_x(t), v_y(t), |v(t)|$).

3. **Experiment Repository & Side-by-Side Comparison**
   - Save experiments with titles, notes, parameters, and calculated results.
   - Search, filter by motion model (Ideal Vacuum vs Quadratic Drag), and sort by date, range, or velocity.
   - Select multiple experiments for cross-examination with superimposed trajectory curves on a unified plot.
   - Full CRUD operations with deletion confirmation.

4. **AI Physics Laboratory Tutor (Google Gemini 2.5)**
   - Server-side route handlers (`/api/ai/tutor` and `/api/ai/summary`) using the official `@google/genai` SDK.
   - Features: Concept explanations, step-by-step mathematical derivations, calculated results interpretation, parameter sensitivities, practice exam questions, and problem-solving hints.
   - Validated server-side using Zod schemas with fallback guidance when credentials are unset.

5. **Publication-Grade Reports & RFC 4180 CSV Export**
   - Print-ready report layout (`@media print`) with governing equations, input tables, results, charts, student observations, and AI executive summaries.
   - CSV export for single or batch experiments with proper quotation escaping and timestamped filenames.

6. **Visible 5-Milestone Progress Checklist**
   - Visible project milestone component tracking the 5 phases: Architecture, Frontend UI, Supabase Persistence, AI Model Integration, and Vercel Deployment.

---

## 🛠️ Mandatory Technology Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Simulation**: HTML Canvas
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS)
- **AI Integration**: Google Gemini API via `@google/genai`
- **Validation**: Zod
- **Testing**: Vitest
- **Deployment Target**: Vercel

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: `v20+` or `v24+` (tested on Node 24.17.0)
- **npm**: `v10+` or `v12+`

### 2. Installation

Clone repository and install dependencies:

```bash
git clone <your-repository-url>
cd prj
npm install
```

### 3. Environment Configuration

Copy the example configuration file:

```bash
cp .env.example .env.local
```

Populate the required credentials in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

> **Note on Offline/Demo Mode**: If environment variables are not yet provided, the application runs in **Interactive Demo Mode** with full physics calculation, canvas animation, sample experiments, and CSV export operational.

---

## 🗄️ Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Copy and run the entire SQL script from [`supabase/schema.sql`](./supabase/schema.sql):
   - Creates `public.profiles` table linked to `auth.users`.
   - Creates `public.experiments` table with JSONB columns for parameters and results.
   - Configures database indexes for fast query filtering.
   - Enables Row-Level Security (RLS) policies so authenticated users access only their own experiments.
   - Adds auto-update timestamps and trigger for new user profile initialization.
4. Go to **Project Settings -> API** and copy the **Project URL** and **Anon public key** into your `.env.local` or Vercel Environment Variables.

---

## 🤖 Google Gemini API Setup

1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Assign the key to `GEMINI_API_KEY` in `.env.local`.
3. The API route `/api/ai/tutor` will automatically initialize `@google/genai` and provide instant physics tutoring.

---

## 🧪 Testing & Verification

Run the test suite powered by Vitest:

```bash
# Run unit tests
npm test

# Run ESLint code checks
npm run lint

# Run optimized production build
npm run build
```

### Unit Test Coverage
- **Ideal Projectile Motion**: Range, max height, flight time, and conservation of energy.
- **Elevated Cliff Launch**: Horizontal and angle launches with non-zero initial heights.
- **Pure Vertical Launch**: Zero range, 2x apex time, maximum vertical altitude.
- **Zero Velocity Edge Case**: Vertical fall and ground drop handling.
- **RK4 Air Resistance**: Mathematical validation that air resistance strictly reduces range and apex altitude compared to vacuum.
- **RFC 4180 CSV Export**: Comma, quotation, and multiline escaping.
- **Zod Schemas**: Strict validation of parameters and AI tutor request payloads.

---

## ☁️ Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub / GitLab / Bitbucket.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `GEMINI_API_KEY`: Your Google AI Studio API Key.
   - `GEMINI_MODEL`: `gemini-2.5-flash` (optional).
5. Click **"Deploy"**.

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Authenticate & deploy
vercel login
vercel

# Deploy to production
vercel --prod
```

---

## 📋 Build Milestones Checklist

- [x] **Milestone 1**: Understand requirements & architecture (Deterministic SI kinematics, RLS schema, official Gemini SDK).
- [x] **Milestone 2**: Set up Next.js and Tailwind frontend UI (App Router, Canvas visualizer, Recharts kinematic plots).
- [x] **Milestone 3**: Connect Supabase database persistence (`supabase/schema.sql`, client/server utilities, RLS security).
- [x] **Milestone 4**: Include AI model for automated generation (Gemini 2.5 server-side API routes, Zod validation, tutoring features).
- [ ] **Milestone 5**: Deploy application to Vercel (Production build verified, ready for user credential entry and Vercel import).

---

## 📄 License

MIT License. Designed for STEM education and physics motion research.
