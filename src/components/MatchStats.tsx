import type { MatchStatsEntry } from "@/types/fixtures";

export function MatchStats({ stats }: { stats: MatchStatsEntry[] }) {
  if (!stats.length) {
    return <div className="card text-sm text-slate-300">No live stats available on the free tier.</div>;
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm table-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="text-right">Home</th>
            <th>Metric</th>
            <th className="text-left">Away</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((row) => (
            <tr key={row.type} className="border-t border-slate-800/60">
              <td className="text-right font-semibold">{row.home ?? "-"}</td>
              <td className="text-slate-200">{row.type}</td>
              <td className="font-semibold">{row.away ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
