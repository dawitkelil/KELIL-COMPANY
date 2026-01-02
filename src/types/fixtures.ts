export type TeamInfo = {
  id: number | string;
  name: string;
  logo?: string;
};

export type FixtureStatus = {
  short: string;
  elapsed?: number;
  long?: string;
};

export type FixtureScore = {
  home: number | null;
  away: number | null;
};

export type Fixture = {
  id: number | string;
  leagueId?: number | string;
  competition?: string;
  date: string;
  status: FixtureStatus;
  home: TeamInfo;
  away: TeamInfo;
  score: FixtureScore;
};

export type StandingRow = {
  rank: number;
  team: TeamInfo;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor?: number;
  goalsAgainst?: number;
  diff?: number;
  points?: number;
};

export type MatchStatsEntry = {
  type: string;
  home: number | string | null;
  away: number | string | null;
};

export type MatchDetails = {
  fixture: Fixture;
  stats: MatchStatsEntry[];
  standings?: StandingRow[];
};
