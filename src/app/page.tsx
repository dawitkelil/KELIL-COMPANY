import { LeagueFilter } from "@/components/LeagueFilter";
import { LiveUpdater } from "@/components/LiveUpdater";
import { MatchCard } from "@/components/MatchCard";
import { getFixturesByDate, getLiveFixtures } from "@/lib/apiFootball";
import { getTodayGames } from "@/lib/collegeFootball";
import type { Fixture } from "@/types/fixtures";
import { Suspense } from "react";

async function loadFixtures(): Promise<{ live: Fixture[]; today: Fixture[] }> {
  const today = new Date().toISOString().slice(0, 10);
  const results = await Promise.allSettled([getLiveFixtures(), getFixturesByDate(today), getTodayGames()]);

  const live = results[0].status === "fulfilled" ? results[0].value : [];
  const soccerToday = results[1].status === "fulfilled" ? results[1].value : [];
  const college = results[2].status === "fulfilled" ? results[2].value : [];

  return { live: [...live], today: [...soccerToday, ...college] };
}

export default async function Home({ searchParams }: { searchParams: { league?: string } }) {
  const { live, today } = await loadFixtures();
  const filter = searchParams.league;
  const filteredToday =
    filter && filter !== "all"
      ? today.filter((fixture) => {
          if (filter === "cfb") {
            return String(fixture.leagueId ?? "").toLowerCase() === "cfb" || fixture.competition?.toLowerCase().includes("college");
          }
          return String(fixture.leagueId ?? fixture.competition) === filter;
        })
      : today;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Live now</h1>
          <p className="text-sm text-slate-300">Auto-refreshes every 25 seconds while matches are live.</p>
        </div>
        <LeagueFilter />
      </div>

      <Suspense fallback={<div className="card">Loading live matches...</div>}>
        <LiveUpdater initial={live} />
      </Suspense>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Today</h2>
          <span className="text-sm text-slate-400">{new Date().toLocaleDateString()}</span>
        </div>
        {filteredToday.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredToday.map((fixture) => (
              <MatchCard key={`${fixture.id}-${fixture.date}`} fixture={fixture} />
            ))}
          </div>
        ) : (
          <div className="card text-sm text-slate-300">No fixtures found for this filter.</div>
        )}
      </section>
    </div>
  );
}
