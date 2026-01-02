import type { Fixture, StandingRow } from "@/types/fixtures";
import { cache } from "./cache";

const BASE_URL = "https://api.collegefootballdata.com";
const CFB_API_KEY = process.env.CFB_API_KEY;

async function fetchCfb<T>(path: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), {
    headers: CFB_API_KEY ? { Authorization: `Bearer ${CFB_API_KEY}` } : undefined,
    next: { revalidate: 300 }
  });
  if (!response.ok) {
    throw new Error(`CollegeFootballData error: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function getTodayGames() {
  const cacheKey = "cfb_today";
  const cached = cache.get<Fixture[]>(cacheKey);
  if (cached) return cached;

  const today = new Date().toISOString().slice(0, 10);
  const games = await fetchCfb<any[]>("/games", { year: new Date().getFullYear().toString(), startDate: today, endDate: today });
  const fixtures: Fixture[] = games.map((game) => ({
    id: game.id,
    leagueId: "cfb",
    competition: game.conference ?? "College Football",
    date: game.start_date,
    status: {
      short: game.status ?? "NS",
      elapsed: undefined,
      long: game.status
    },
    home: { id: game.home_id, name: game.home_team },
    away: { id: game.away_id, name: game.away_team },
    score: { home: game.home_points, away: game.away_points }
  }));
  cache.set(cacheKey, fixtures, 5 * 60 * 1000);
  return fixtures;
}

export async function getTeamRecords(conference?: string): Promise<StandingRow[]> {
  const cacheKey = `cfb_records_${conference ?? "all"}`;
  const cached = cache.get<StandingRow[]>(cacheKey);
  if (cached) return cached;

  const records = await fetchCfb<any[]>("/records", conference ? { conference } : undefined);
  const standings: StandingRow[] = records.map((row, index) => ({
    rank: index + 1,
    team: { id: row.team, name: row.team },
    played: row.total?.games ?? 0,
    win: row.total?.wins ?? 0,
    loss: row.total?.losses ?? 0,
    draw: 0,
    diff: undefined,
    points: row.total?.wins ?? 0
  }));
  cache.set(cacheKey, standings, 10 * 60 * 1000);
  return standings;
}
