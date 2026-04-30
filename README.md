# Cornerstone Dashboard

Marketing analytics dashboard for Cornerstone Storage — built with React, Vite, Tailwind CSS, Supabase, Recharts, and React Router.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in your Supabase credentials
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

Set these in `.env.local` for local dev, and in the Vercel dashboard for production.

## Project structure

```
src/
├── components/
│   ├── Layout.jsx          # Sidebar + outlet shell
│   └── ProtectedRoute.jsx  # Auth guard
├── contexts/
│   └── AuthContext.jsx     # Supabase auth state
├── lib/
│   └── supabase.js         # Supabase client
└── pages/
    ├── Login.jsx
    ├── PortfolioOverview.jsx
    ├── SeoRankings.jsx
    ├── KpiTracker.jsx
    ├── LocationDeepDive.jsx
    └── CompetitorAnalysis.jsx
```

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Project Settings → Environment Variables
4. Deploy
