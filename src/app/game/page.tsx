import { SoccerGame } from "@/components/SoccerGame";

export default function GamePage() {
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Soccer Game</h1>
        <p className="text-slate-300">
          This is a lightweight FIFA-style arcade prototype: dribble, shoot, and beat the keeper before the clock expires.
        </p>
      </header>
      <SoccerGame />
    </div>
  );
}
