import { API_FOOTBALL_HOST, PLACEHOLDER_LOGO } from "./constants";
import { cache } from "./cache";
import type { Fixture, MatchDetails, MatchStatsEntry, StandingRow } from "@/types/fixtures";

const API_KEY = process.env.API_FOOTBALL_KEY;

async function fetchApiFootball<T>(path: string, searchParams?: Record<string, string>, revalidateSeconds = 300) {
  if (!API_KEY) {
    throw new Error("API_FOOTBALL_KEY is not set");
  }
  const url = new URL(`${API_FOOTBALL_HOST}${path}`);
  Object.entries(searchParams ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": API_KEY
    },
    next: { revalidate: revalidateSeconds }
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status}`);
  }
  const json = await response.json();
  return json.response as T;
}

function normalizeFixture(data: any): Fixture {
  return {
    id: data.fixture?.id ?? data.id,
    leagueId: data.league?.id,
    competition: data.league?.name,
    date: data.fixture?.date ?? data.date,
    status: {
      short: data.fixture?.status?.short ?? data.status?.short ?? "NS",
      elapsed: data.fixture?.status?.elapsed ?? data.status?.elapsed,
      long: data.fixture?.status?.long ?? data.status?.long
    },
    home: {
      id: data.teams?.home?.id,
      name: data.teams?.home?.name ?? data.home?.name ?? "Home",
      logo: data.teams?.home?.logo ?? data.home?.logo ?? PLACEHOLDER_LOGO
    },
    away: {
      id: data.teams?.away?.id,
      name: data.teams?.away?.name ?? data.away?.name ?? "Away",
      logo: data.teams?.away?.logo ?? data.away?.logo ?? PLACEHOLDER_LOGO
    },
    score: {
      home: data.goals?.home ?? data.score?.home ?? null,
      away: data.goals?.away ?? data.score?.away ?? null
    }
  };
}

export async function getFixturesByDate(date: string) {
  const cacheKey = `fixtures_${date}`;
  const cached = cache.get<Fixture[]>(cacheKey);
  if (cached) return cached;

  const fixtures = await fetchApiFootball<any[]>("/fixtures", { date });
  const normalized = fixtures.map(normalizeFixture);
  cache.set(cacheKey, normalized, 5 * 60 * 1000);
  return normalized;
}

export async function getLiveFixtures() {
  const cacheKey = "live_fixtures";
  const cached = cache.get<Fixture[]>(cacheKey);
  if (cached) return cached;

  const fixtures = await fetchApiFootball<any[]>("/fixtures", { live: "all" }, 30);
  const normalized = fixtures.map(normalizeFixture);
  cache.set(cacheKey, normalized, 20 * 1000);
  return normalized;
}

export async function getStandings(league: number, season: number): Promise<StandingRow[]> {
  const cacheKey = `standings_${league}_${season}`;
  const cached = cache.get<StandingRow[]>(cacheKey);
  if (cached) return cached;

  const response = await fetchApiFootball<any[]>("/standings", {
    league: league.toString(),
    season: season.toString()
  });

  const table = response?.[0]?.league?.standings?.[0] ?? [];
  const standings: StandingRow[] = table.map((row: any) => ({
    rank: row.rank,
    team: {
      id: row.team?.id,
      name: row.team?.name,
      logo: row.team?.logo ?? PLACEHOLDER_LOGO
    },
    played: row.all?.played ?? 0,
    win: row.all?.win ?? 0,
    draw: row.all?.draw ?? 0,
    loss: row.all?.lose ?? 0,
    goalsFor: row.all?.goals?.for ?? 0,
    goalsAgainst: row.all?.goals?.against ?? 0,
    diff: row.goalsDiff,
    points: row.points
  }));

  cache.set(cacheKey, standings, 10 * 60 * 1000);
  return standings;
}

export async function getMatchDetails(fixtureId: string | number): Promise<MatchDetails> {
  const cacheKey = `match_${fixtureId}`;
  const cached = cache.get<MatchDetails>(cacheKey);
  if (cached) return cached;

  const [fixtureResp, statsResp] = await Promise.all([
    fetchApiFootball<any[]>("/fixtures", { id: String(fixtureId) }, 30),
    fetchApiFootball<any[]>("/fixtures/statistics", { fixture: String(fixtureId) }, 30)
  ]);

  const fixture = normalizeFixture(fixtureResp?.[0]);
  const stats: MatchStatsEntry[] = (statsResp?.[0]?.statistics ?? []).map((stat: any) => ({
    type: stat.type,
    home: stat.value?.home ?? stat.value?.[0] ?? stat.value,
    away: stat.value?.away ?? stat.value?.[1] ?? null
  }));

  const details: MatchDetails = {
    fixture,
    stats
  };

  cache.set(cacheKey, details, 20 * 1000);
  return details;
}
