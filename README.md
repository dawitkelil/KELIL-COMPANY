# Match Center

A Next.js (App Router) dashboard for live fixtures, upcoming games, standings, and match stats across top soccer leagues and college football.

## Features
- **Live now** panel with auto-refresh for in-progress games only.
- **Today** fixtures across API-Football leagues and CollegeFootballData.
- **League pages** for fixtures and standings snapshots.
- **Match view** with live status, scoreline, stat table, and league standings.
- Server-side caching (Next.js `revalidate` plus in-memory TTL) to stay under free-tier limits.
- Tailwind CSS, mobile-first UI.

## Getting started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
The app runs at `http://localhost:3000`.

### Production build
```bash
npm run build
npm start
```

## Environment variables
Create a `.env.local` file in the project root:

```bash
API_FOOTBALL_KEY="your-api-football-key"
CFB_API_KEY="optional-collegefootballdata-key"
```

- `API_FOOTBALL_KEY` (required): API-Football key from API-Sports.
- `CFB_API_KEY` (optional): Bearer token for CollegeFootballData; requests may work without a key on the free tier but are rate-limited.

## Data sources & limits
- **API-Football**: Fixtures, live scores, standings, and match statistics for selected soccer leagues. Requests are cached for 5–10 minutes; live data is cached ~20–25 seconds to limit polling.
- **CollegeFootballData**: Schedules/games for today plus team records. Rate limits apply; a token is recommended.
- **Fallback (TheSportsDB)**: Used for other competitions where free data is available; otherwise a user-friendly notice is shown.

## Notes
- Live polling only runs for the live feed and uses a short TTL cache to avoid exceeding limits.
- Standings snapshots on match pages reuse cached league standings to minimize requests.
