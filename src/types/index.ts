export type MarketPeriod = '30s' | '1m' | '3m' | '5m';

export interface GameRound {
  round: string;
  period: MarketPeriod;
  number: number;
  result: 'B' | 'S'; // 'B' = Big (5-9), 'S' = Small (0-4)
  color: 'green' | 'red' | 'violet' | 'green-violet' | 'red-violet';
  timestamp: number;
}

export interface AlgoPrediction {
  r: 'B' | 'S' | 'W'; // W = waiting/scanning
  n: number; // predicted number
  cf: number; // confidence (53 - 95%)
  _streak: 'B' | 'S' | '—';
  _trend: 'B' | 'S' | '—';
  _balance: 'B' | 'S' | '—';
}

export interface BetLogItem {
  round: string;
  pred: 'B' | 'S';
  conf?: number;
  amt?: number;
  skip?: boolean;
  won: boolean | null; // null = pending
  timestamp?: number;
}

export interface AutoBetState {
  on: boolean;
  balance: number;
  steps: number;
  curStep: number;
  minConf: number;
  bets: number[];
  lastBet: {
    type: 'B' | 'S';
    amt: number;
    round: string;
    done: boolean;
  } | null;
  w: number;
  l: number;
  sk: number;
}

export interface UserManualBet {
  id: string;
  round: string;
  type: 'color' | 'number' | 'big_small';
  selection: string | number;
  amount: number;
  status: 'pending' | 'won' | 'lost';
  payout?: number;
  createdAt: number;
}
