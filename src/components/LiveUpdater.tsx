"use client";

import { useEffect, useState } from "react";
import type { Fixture } from "@/types/fixtures";
import { MatchCard } from "./MatchCard";
import { LIVE_POLL_INTERVAL } from "@/lib/constants";

export function LiveUpdater({ initial }: { initial: Fixture[] }) {
  const [live, setLive] = useState<Fixture[]>(initial);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Fixture[];
        if (!cancelled) {
          setLive(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(poll, LIVE_POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!live.length) {
    return <div className="card text-sm text-slate-300">No live matches right now.</div>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {live.map((fixture) => (
        <MatchCard key={fixture.id} fixture={fixture} />
      ))}
    </div>
  );
}
