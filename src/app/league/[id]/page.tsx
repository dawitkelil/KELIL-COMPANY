import { MatchCard } from "@/components/MatchCard";
import { StandingsTable } from "@/components/StandingsTable";
import { getFixturesByDate, getStandings } from "@/lib/apiFootball";
import { getTeamRecords, getTodayGames } from "@/lib/collegeFootball";
import { getFallbackEvents, getFallbackStandings } from "@/lib/theSportsDb";
import type { Fixture, StandingRow } from "@/types/fixtures";
import { notFound } from "next/navigation";

const KNOWN_LEAGUES: Record<string, { name: string; season?: number; type: "soccer" | "college" }> = {
  "39": { name: "Premier League", season: 2024, type: "soccer" },
  "140": { name: "La Liga", season: 2024, type: "soccer" },
  "61": { name: "Ligue 1", season: 2024, type: "soccer" },
  "78": { name: "Bundesliga", season: 2024, type: "soccer" },
  "135": { name: "Serie A", season: 2024, type: "soccer" },
  "2": { name: "Champions League", season: 2024, type: "soccer" },
  "cfb": { name: "College Football", type: "college" }
};

type LeagueData = {
  title: string;
  fixtures: Fixture[];
  standings: StandingRow[];
  notice?: string;
};

async function loadLeagueData(id: string): Promise<LeagueData | null> {
  const meta = KNOWN_LEAGUES[id];
  if (!meta) return null;

  if (meta.type === "college") {
    try {
      const [fixtures, standings] = await Promise.all([getTodayGames(), getTeamRecords()]);
      return {
        title: meta.name,
        fixtures,
        standings,
        notice: "College Football data depends on the CollegeFootballData free tier; some games may not appear."
      };
    } catch (error) {
      console.error(error);
      return {
        title: meta.name,
        fixtures: [],
        standings: [],
        notice: "College Football data is not available right now on the free tier."
      };
    }
  }

  try {
    const [fixtures, standings] = await Promise.all([
      getFixturesByDate(new Date().toISOString().slice(0, 10)),
      meta.season ? getStandings(Number(id), meta.season) : Promise.resolve<StandingRow[]>([])
    ]);

    const filteredFixtures = fixtures.filter((fixture) => String(fixture.leagueId ?? "") === id);
    return { title: meta.name, fixtures: filteredFixtures, standings };
  } catch (error) {
    console.error(error);
    return {
      title: meta.name,
      fixtures: [],
      standings: [],
      notice: "Data not available on the free tier or API keys are missing."
    };
  }
}

export default async function LeaguePage({ params }: { params: { id: string } }) {
  const fallbackLeagueTitle = `League ${params.id}`;
  const knownData = await loadLeagueData(params.id);

  const data =
    knownData ??
    (await (async () => {
      const [fixtures, standings] = await Promise.all([getFallbackEvents(params.id), getFallbackStandings()]);
      const hasData = fixtures.length || standings.length;
      return {
        title: fallbackLeagueTitle,
        fixtures,
        standings,
        notice: hasData
          ? "Using TheSportsDB fallback where possible; data may be limited on the free tier."
          : "Data not available on the free tier for this competition."
      };
    })());

  if (!data.fixtures.length && !data.standings.length && !data.notice) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{data.title}</h1>
        <p className="text-slate-300">Upcoming fixtures and standings</p>
        {data.notice && <p className="text-sm text-slate-400">{data.notice}</p>}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Upcoming</h2>
        {data.fixtures.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {data.fixtures.map((fixture: Fixture) => (
              <MatchCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        ) : (
          <div className="card text-sm text-slate-300">No fixtures scheduled today.</div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Standings</h2>
        {data.standings.length ? (
          <StandingsTable rows={data.standings} showDraw={params.id !== "cfb"} />
        ) : (
          <div className="card text-sm text-slate-300">Standings not available on the free tier for this competition.</div>
        )}
      </section>
    </div>
  );
}
