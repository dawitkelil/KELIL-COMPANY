"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Vec2 = { x: number; y: number };

type GameState = {
  player: Vec2;
  keeper: Vec2;
  ball: Vec2;
  ballVelocity: Vec2;
  score: number;
  shots: number;
  remainingTime: number;
};

const FIELD = {
  width: 860,
  height: 520,
  goalWidth: 220,
  goalHeight: 16,
  playerRadius: 18,
  ballRadius: 9,
  keeperWidth: 130,
  keeperHeight: 16
};

const initialState = (): GameState => ({
  player: { x: FIELD.width / 2, y: FIELD.height - 70 },
  keeper: { x: FIELD.width / 2 - FIELD.keeperWidth / 2, y: 26 },
  ball: { x: FIELD.width / 2, y: FIELD.height - 110 },
  ballVelocity: { x: 0, y: 0 },
  score: 0,
  shots: 0,
  remainingTime: 60
});

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function resetPositions(state: GameState): GameState {
  return {
    ...state,
    player: { x: FIELD.width / 2, y: FIELD.height - 70 },
    ball: { x: FIELD.width / 2, y: FIELD.height - 110 },
    ballVelocity: { x: 0, y: 0 }
  };
}

export function SoccerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const stateRef = useRef<GameState>(initialState());
  const [viewState, setViewState] = useState<GameState>(stateRef.current);
  const [running, setRunning] = useState(false);

  const accuracy = useMemo(() => {
    if (!viewState.shots) return 0;
    return Math.round((viewState.score / viewState.shots) * 100);
  }, [viewState.score, viewState.shots]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  useEffect(() => {
    if (!running) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      const s = stateRef.current;
      const keys = keysRef.current;

      const speed = 230;
      let vx = 0;
      let vy = 0;
      if (keys.has("arrowleft") || keys.has("a")) vx -= 1;
      if (keys.has("arrowright") || keys.has("d")) vx += 1;
      if (keys.has("arrowup") || keys.has("w")) vy -= 1;
      if (keys.has("arrowdown") || keys.has("s")) vy += 1;
      const len = Math.hypot(vx, vy) || 1;
      vx = (vx / len) * speed;
      vy = (vy / len) * speed;

      s.player.x = clamp(s.player.x + vx * dt, FIELD.playerRadius, FIELD.width - FIELD.playerRadius);
      s.player.y = clamp(s.player.y + vy * dt, FIELD.height * 0.35, FIELD.height - FIELD.playerRadius);

      const dx = s.ball.x - s.player.x;
      const dy = s.ball.y - s.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < FIELD.playerRadius + FIELD.ballRadius + 4) {
        if (keys.has(" ") || keys.has("enter")) {
          const targetX = clamp(s.player.x + vx * 0.4 + (Math.random() - 0.5) * 120, 80, FIELD.width - 80);
          const dirX = targetX - s.ball.x;
          const dirY = 8 - s.ball.y;
          const norm = Math.hypot(dirX, dirY) || 1;
          s.ballVelocity.x = (dirX / norm) * 410;
          s.ballVelocity.y = (dirY / norm) * 410;
          s.shots += 1;
          keysRef.current.delete(" ");
          keysRef.current.delete("enter");
        } else {
          s.ball.x = s.player.x + (dx / (dist || 1)) * (FIELD.playerRadius + FIELD.ballRadius + 1);
          s.ball.y = s.player.y + (dy / (dist || 1)) * (FIELD.playerRadius + FIELD.ballRadius + 1);
        }
      }

      const keeperSpeed = 220;
      const keeperCenter = s.keeper.x + FIELD.keeperWidth / 2;
      const keeperDelta = s.ball.x - keeperCenter;
      s.keeper.x = clamp(
        s.keeper.x + clamp(keeperDelta, -keeperSpeed * dt, keeperSpeed * dt),
        120,
        FIELD.width - FIELD.keeperWidth - 120
      );

      s.ball.x += s.ballVelocity.x * dt;
      s.ball.y += s.ballVelocity.y * dt;
      s.ballVelocity.x *= 0.994;
      s.ballVelocity.y *= 0.994;

      if (s.ball.x < FIELD.ballRadius || s.ball.x > FIELD.width - FIELD.ballRadius) {
        s.ballVelocity.x *= -0.75;
        s.ball.x = clamp(s.ball.x, FIELD.ballRadius, FIELD.width - FIELD.ballRadius);
      }
      if (s.ball.y > FIELD.height - FIELD.ballRadius) {
        s.ballVelocity.y *= -0.65;
        s.ball.y = FIELD.height - FIELD.ballRadius;
      }

      const inGoalX = s.ball.x > (FIELD.width - FIELD.goalWidth) / 2 && s.ball.x < (FIELD.width + FIELD.goalWidth) / 2;
      const hitKeeper =
        s.ball.y - FIELD.ballRadius < s.keeper.y + FIELD.keeperHeight &&
        s.ball.y + FIELD.ballRadius > s.keeper.y &&
        s.ball.x > s.keeper.x &&
        s.ball.x < s.keeper.x + FIELD.keeperWidth;

      if (hitKeeper) {
        s.ballVelocity.y = Math.abs(s.ballVelocity.y) * 0.8;
        s.ballVelocity.x += (Math.random() - 0.5) * 140;
      }

      if (s.ball.y < FIELD.goalHeight) {
        if (inGoalX && !hitKeeper) {
          s.score += 1;
        }
        Object.assign(s, resetPositions(s));
      }

      s.remainingTime = Math.max(0, s.remainingTime - dt);
      if (s.remainingTime === 0) {
        setRunning(false);
      }

      frame += 1;
      if (frame % 2 === 0) {
        setViewState({ ...s, player: { ...s.player }, ball: { ...s.ball }, keeper: { ...s.keeper }, ballVelocity: { ...s.ballVelocity } });
      }

      render(canvasRef.current, s);
      if (s.remainingTime > 0) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const startMatch = () => {
    stateRef.current = initialState();
    setViewState(stateRef.current);
    setRunning(true);
  };

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Arcade Mode: Penalty Rush</h2>
          <p className="text-sm text-slate-300">Move with WASD/arrow keys. Press Space or Enter to shoot.</p>
        </div>
        <button
          type="button"
          onClick={startMatch}
          className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-300"
        >
          {running ? "Restart Match" : "Start Match"}
        </button>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-lg border border-slate-700 p-3">Goals: {viewState.score}</div>
        <div className="rounded-lg border border-slate-700 p-3">Shots: {viewState.shots}</div>
        <div className="rounded-lg border border-slate-700 p-3">Accuracy: {accuracy}%</div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-950 p-2">
        <canvas ref={canvasRef} width={FIELD.width} height={FIELD.height} className="h-auto w-full rounded-lg" />
      </div>
      <p className="text-sm text-slate-300">Time left: {Math.ceil(viewState.remainingTime)}s {viewState.remainingTime <= 0 ? "• Full time!" : ""}</p>
    </section>
  );
}

function render(canvas: HTMLCanvasElement | null, state: GameState) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, FIELD.width, FIELD.height);

  ctx.fillStyle = "#14532d";
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);

  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, FIELD.width - 20, FIELD.height - 20);

  ctx.beginPath();
  ctx.moveTo(0, FIELD.height * 0.35);
  ctx.lineTo(FIELD.width, FIELD.height * 0.35);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(FIELD.width / 2, FIELD.height * 0.35, 60, 0, Math.PI * 2);
  ctx.stroke();

  const goalX = (FIELD.width - FIELD.goalWidth) / 2;
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(goalX, 0, FIELD.goalWidth, FIELD.goalHeight);

  ctx.fillStyle = "#0ea5e9";
  ctx.fillRect(state.keeper.x, state.keeper.y, FIELD.keeperWidth, FIELD.keeperHeight);

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, FIELD.playerRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, FIELD.ballRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "16px sans-serif";
  ctx.fillText("Opposition Goal", FIELD.width / 2 - 58, 34);
}
