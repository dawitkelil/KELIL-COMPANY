import type { StandingRow } from "@/types/fixtures";

export function StandingsTable({ rows, showDraw = true }: { rows: StandingRow[]; showDraw?: boolean }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm table-sm">
        <thead className="text-slate-400">
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            {showDraw && <th>D</th>}
            <th>L</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.team.id ?? row.team.name} className="border-t border-slate-800/60">
              <td>{row.rank}</td>
              <td className="whitespace-nowrap">{row.team.name}</td>
              <td>{row.played}</td>
              <td>{row.win}</td>
              {showDraw && <td>{row.draw}</td>}
              <td>{row.loss}</td>
              <td>{row.diff ?? (row.goalsFor ?? 0) - (row.goalsAgainst ?? 0)}</td>
              <td>{row.points ?? row.win * 3 + (showDraw ? row.draw : 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
