import { NextResponse } from "next/server";
import { getLiveFixtures } from "@/lib/apiFootball";
import { getTodayGames } from "@/lib/collegeFootball";

export const revalidate = 0;

export async function GET() {
  try {
    const [football, college] = await Promise.all([
      getLiveFixtures(),
      getTodayGames()
    ]);
    const liveCollege = college.filter((game) => (game.status.short ?? "").toLowerCase().includes("q") || (game.status.short ?? "").includes("LIVE"));
    return NextResponse.json([...football, ...liveCollege]);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 200 });
  }
}
