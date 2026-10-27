import { AlgoPrediction, GameRound } from '../types';

/**
 * BD ALAMIN v7.2 - Multi-Factor Prediction Engine
 * Faithfully mirrors the exact statistical heuristics from the content script.
 */
export function algoPredict(
  history: Array<{ n?: number; number?: number; r?: 'B' | 'S'; result?: 'B' | 'S' }>
): AlgoPrediction {
  const EMPTY: AlgoPrediction = {
    r: 'W',
    n: -1,
    cf: 0,
    _streak: '—',
    _trend: '—',
    _balance: '—',
  };

  if (!history || history.length < 3) return EMPTY;

  const rs = history.map((x) => (x.r ?? x.result ?? 'B') as 'B' | 'S');
  const ns = history.map((x) => (x.n ?? x.number ?? 0));

  /* ── SIGNAL 1: STREAK ANALYSIS ── */
  // Count current streak length
  let streak = 1;
  for (let i = 1; i < Math.min(rs.length, 14); i++) {
    if (rs[i] === rs[0]) streak++;
    else break;
  }

  // Count alternation rate (last 8)
  let altC = 0;
  const sampleLimit = Math.min(rs.length, 9);
  for (let a = 1; a < sampleLimit; a++) {
    if (rs[a] !== rs[a - 1]) altC++;
  }
  const altR = sampleLimit > 1 ? altC / (sampleLimit - 1) : 0;

  let streakSig: 'B' | 'S';
  if (altR > 0.68) {
    // Market is actively alternating -> predict opposite of last
    streakSig = rs[0] === 'B' ? 'S' : 'B';
  } else if (streak >= 5) {
    // Very long streak -> reversal highly likely
    streakSig = rs[0] === 'B' ? 'S' : 'B';
  } else if (streak >= 3) {
    // Medium streak -> reversal likely
    streakSig = rs[0] === 'B' ? 'S' : 'B';
  } else {
    // Short, low-alteration market -> slight continuation
    streakSig = rs[0];
  }

  /* ── SIGNAL 2: WEIGHTED RECENT TREND ── */
  // Recency weights: most recent = highest weight
  const wts = [12, 9, 7, 5, 4, 3, 2, 2, 1, 1];
  let wB = 0;
  let wS = 0;
  for (let w = 0; w < Math.min(rs.length, wts.length); w++) {
    if (rs[w] === 'B') wB += wts[w];
    else wS += wts[w];
  }

  // Check last 3 specific pattern sequences
  const l3 = rs.slice(0, Math.min(3, rs.length)).join('');
  if (l3 === 'BBB' || l3 === 'BBS') wS += 8;
  else if (l3 === 'SSS' || l3 === 'SSB') wB += 8;
  else if (l3 === 'BSB') wS += 5;
  else if (l3 === 'SBS') wB += 5;

  const trendSig: 'B' | 'S' = wB > wS ? 'B' : 'S';

  /* ── SIGNAL 3: BIG/SMALL BALANCE ── */
  const l20 = rs.slice(0, Math.min(rs.length, 20));
  const bCnt = l20.filter((x) => x === 'B').length;
  const sCnt = l20.length - bCnt;
  const diff = bCnt - sCnt;

  let balanceSig: 'B' | 'S';
  if (diff >= 4) balanceSig = 'S'; // Too many Big -> Small is due
  else if (diff <= -4) balanceSig = 'B'; // Too many Small -> Big is due
  else if (diff >= 2) balanceSig = 'S';
  else if (diff <= -2) balanceSig = 'B';
  else balanceSig = rs[0] === 'B' ? 'S' : 'B'; // Balanced -> slight reversal bias

  /* ── VOTE & CONFIDENCE ── */
  const votes = { B: 0, S: 0 };
  // Streak: 32 points
  if (streakSig === 'B') votes.B += 32;
  else votes.S += 32;
  // Trend: 42 points (most reliable)
  if (trendSig === 'B') votes.B += 42;
  else votes.S += 42;
  // Balance: 26 points
  if (balanceSig === 'B') votes.B += 26;
  else votes.S += 26;

  const isBig = votes.B > votes.S;
  const winV = Math.max(votes.B, votes.S);

  // Base confidence from vote dominance
  let cf = Math.round(50 + (winV - 50) * 0.9);
  cf = Math.max(53, Math.min(94, cf));

  // Bonus if all 3 algorithms agree unanimously
  if (streakSig === trendSig && trendSig === balanceSig) {
    cf = Math.min(95, cf + 7);
  }

  // Streak bonus based on length
  if (streak >= 4 && streakSig !== rs[0]) {
    cf = Math.min(95, cf + 4);
  }

  /* ── NUMBER PREDICTION ── */
  const pool = isBig ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4];
  const freq: Record<number, number> = {};
  pool.forEach((n) => {
    freq[n] = 0;
  });
  ns.slice(0, 30).forEach((n) => {
    if (Object.prototype.hasOwnProperty.call(freq, n)) {
      freq[n]++;
    }
  });

  // Pick least-frequent number in pool (the most "due" number)
  const sorted = pool.slice().sort((a, b) => freq[a] - freq[b]);
  const predN = sorted[0];

  return {
    r: isBig ? 'B' : 'S',
    n: predN,
    cf,
    _streak: streakSig,
    _trend: trendSig,
    _balance: balanceSig,
  };
}

/**
 * Martingale step sequence calculator
 */
export function calcBets(balance: number, steps: number): number[] {
  const safeSteps = Math.max(1, Math.min(10, steps));
  let base = Math.floor(balance / Math.pow(2, safeSteps));
  if (base < 1) base = 1;
  const arr: number[] = [];
  for (let i = 0; i < safeSteps; i++) {
    arr.push(Math.floor(base * Math.pow(2, i)));
  }
  return arr;
}

/**
 * Determine WinGo color by number
 */
export function getNumberColor(num: number): 'green' | 'red' | 'violet' | 'green-violet' | 'red-violet' {
  if (num === 0) return 'red-violet';
  if (num === 5) return 'green-violet';
  if ([1, 3, 7, 9].includes(num)) return 'green';
  return 'red';
}
