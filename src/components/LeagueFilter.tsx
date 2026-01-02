"use client";

import { useRouter, useSearchParams } from "next/navigation";

const leagueOptions = [
  { id: "all", name: "All" },
  { id: "39", name: "Premier League" },
  { id: "140", name: "La Liga" },
  { id: "61", name: "Ligue 1" },
  { id: "78", name: "Bundesliga" },
  { id: "135", name: "Serie A" },
  { id: "2", name: "Champions League" },
  { id: "cfb", name: "College Football" }
];

export function LeagueFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("league") ?? "all";

  return (
    <div className="flex flex-wrap gap-2">
      <select
        className="rounded-lg border border-slate-700 bg-card px-3 py-2 text-sm text-white"
        value={current}
        onChange={(e) => {
          const val = e.target.value;
          const query = val === "all" ? "" : `?league=${val}`;
          router.push(`/${query}`);
        }}
      >
        {leagueOptions.map((league) => (
          <option key={league.id} value={league.id}>
            {league.name}
          </option>
        ))}
      </select>
    </div>
  );
}
