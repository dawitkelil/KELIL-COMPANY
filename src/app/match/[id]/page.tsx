import { MatchStats } from "@/components/MatchStats";
import { StandingsTable } from "@/components/StandingsTable";
import { getMatchDetails, getStandings } from "@/lib/apiFootball";
import { API_FOOTBALL_LEAGUES } from "@/lib/constants";
import type { StandingRow } from "@/types/fixtures";
import Image from "next/image";
import { notFound } from "next/navigation";

async function loadStandingsSnapshot(leagueId?: number) {
  const league = API_FOOTBALL_LEAGUES.find((item) => item.id === leagueId);
  if (!league) return [] as StandingRow[];
  return getStandings(league.id, league.season);
}

export default async function MatchPage({ params }: { params: { id: string } }) {
  try {
    const details = await getMatchDetails(params.id);
    const standings = await loadStandingsSnapshot(details.fixture.leagueId);

    return (
      <div className="space-y-6">
        <div className="card space-y-4">
          <div className="flex items-center justify-between text-xs uppercase text-slate-400">
            <span>{details.fixture.competition ?? "Match"}</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px]">{details.fixture.status.long ?? details.fixture.status.short}</span>
          </div>
          <div className="flex flex-col gap-4 text-center">
            <div className="flex items-center justify-center gap-6 text-lg font-semibold">
              <div className="flex flex-col items-center gap-2">
                {details.fixture.home.logo && (
                  <Image src={details.fixture.home.logo} alt={details.fixture.home.name} width={48} height={48} />
                )}
                <span>{details.fixture.home.name}</span>
              </div>
              <div className="text-4xl font-bold">
                {details.fixture.score.home ?? "-"} : {details.fixture.score.away ?? "-"}
              </div>
              <div className="flex flex-col items-center gap-2">
                {details.fixture.away.logo && (
                  <Image src={details.fixture.away.logo} alt={details.fixture.away.name} width={48} height={48} />
                )}
                <span>{details.fixture.away.name}</span>
              </div>
            </div>
            <div className="text-sm text-slate-300">{new Date(details.fixture.date).toLocaleString()}</div>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Match stats</h2>
          <MatchStats stats={details.stats} />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Standings snapshot</h2>
          {standings.length ? (
            <StandingsTable rows={standings} />
          ) : (
            <div className="card text-sm text-slate-300">Standings not available for this match.</div>
          )}
        </section>
      </div>
    );
  } catch (error) {
    console.error(error);
    return notFound();
  }
}
