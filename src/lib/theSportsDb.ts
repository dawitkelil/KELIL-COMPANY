import type { Fixture, StandingRow } from "@/types/fixtures";

const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";

async function fetchDb<T>(path: string) {
  const response = await fetch(`${BASE_URL}${path}`, { next: { revalidate: 600 } });
  if (!response.ok) {
    throw new Error("TheSportsDB request failed");
  }
  return (await response.json()) as T;
}

export async function getFallbackEvents(leagueId: string): Promise<Fixture[]> {
  try {
    const data = await fetchDb<any>(`/eventsnextleague.php?id=${leagueId}`);
    const events = data?.events ?? [];
    return events.map((event: any) => ({
      id: event.idEvent,
      competition: event.strLeague,
      date: event.dateEvent,
      status: { short: "NS" },
      home: { id: event.idHomeTeam, name: event.strHomeTeam },
      away: { id: event.idAwayTeam, name: event.strAwayTeam },
      score: { home: null, away: null }
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getFallbackStandings(): Promise<StandingRow[]> {
  return [];
}
