import type { Fixture } from "@/types/fixtures";
import Link from "next/link";

function formatStatus(fixture: Fixture) {
  const { status } = fixture;
  if (status.short === "FT") return "FT";
  if (status.short === "NS") return "Upcoming";
  if (status.short === "HT") return "HT";
  if (status.elapsed) return `${status.elapsed}'`;
  return status.short;
}

export function MatchCard({ fixture }: { fixture: Fixture }) {
  return (
    <Link href={`/match/${fixture.id}`} className="card flex w-full flex-col gap-2 transition hover:-translate-y-0.5 hover:border-slate-600">
      <div className="flex items-center justify-between text-xs uppercase text-slate-400">
        <span>{fixture.competition ?? `League ${fixture.leagueId ?? ""}`}</span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px]">{formatStatus(fixture)}</span>
      </div>
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{fixture.home.name}</span>
        <span className="text-lg">{fixture.score.home ?? "-"}</span>
      </div>
      <div className="flex items-center justify-between text-sm font-medium text-slate-300">
        <span>{fixture.away.name}</span>
        <span className="text-lg">{fixture.score.away ?? "-"}</span>
      </div>
      <div className="text-xs text-slate-400">{new Date(fixture.date).toLocaleString()}</div>
    </Link>
  );
}
