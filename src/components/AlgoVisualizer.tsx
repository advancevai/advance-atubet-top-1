import React, { useState } from 'react';
import { GameRound, AlgoPrediction } from '../types';
import { algoPredict, calcBets } from '../utils/algo';
import { sound } from '../utils/sound';

interface AlgoVisualizerProps {
  prediction: AlgoPrediction;
  history: GameRound[];
}

export const AlgoVisualizer: React.FC<AlgoVisualizerProps> = ({
  prediction,
  history,
}) => {
  const [backtestRunning, setBacktestRunning] = useState(false);
  const [backtestResults, setBacktestResults] = useState<{
    rounds: number;
    wins: number;
    losses: number;
    winRate: number;
    maxStreak: number;
    martingaleBusts: number;
  } | null>(null);

  // Analyze current history for visualizations
  const rs = history.map((h) => h.result);

  // 1. Streak details
  let currentStreak = 0;
  if (rs.length > 0) {
    currentStreak = 1;
    for (let i = 1; i < Math.min(rs.length, 14); i++) {
      if (rs[i] === rs[0]) currentStreak++;
      else break;
    }
  }

  // Alternation count
  let altCount = 0;
  const sampleLen = Math.min(rs.length, 9);
  for (let a = 1; a < sampleLen; a++) {
    if (rs[a] !== rs[a - 1]) altCount++;
  }
  const altRate = sampleLen > 1 ? Math.round((altCount / (sampleLen - 1)) * 100) : 0;

  // 2. Weighted Trend details
  const weights = [12, 9, 7, 5, 4, 3, 2, 2, 1, 1];
  let wB = 0;
  let wS = 0;
  for (let w = 0; w < Math.min(rs.length, weights.length); w++) {
    if (rs[w] === 'B') wB += weights[w];
    else wS += weights[w];
  }

  // 3. Balance details
  const l20 = rs.slice(0, Math.min(rs.length, 20));
  const bCount = l20.filter((x) => x === 'B').length;
  const sCount = l20.length - bCount;
  const balanceDiff = bCount - sCount;

  // Run backtester simulation
  const runBacktest = (numRounds: number) => {
    sound.playClick();
    setBacktestRunning(true);

    setTimeout(() => {
      // Simulate historical seed sequence
      const simHistory: Array<{ n: number; r: 'B' | 'S' }> = [];
      // Generate 20 initial rounds
      for (let i = 0; i < 20; i++) {
        const n = Math.floor(Math.random() * 10);
        simHistory.unshift({ n, r: n >= 5 ? 'B' : 'S' });
      }

      let wins = 0;
      let losses = 0;
      let maxWinStreak = 0;
      let curStreak = 0;
      let curLossStep = 0;
      let busts = 0;
      const testSteps = 4;

      for (let r = 0; r < numRounds; r++) {
        const pred = algoPredict(simHistory);
        // Draw actual next outcome
        const actualNum = Math.floor(Math.random() * 10);
        const actualRes: 'B' | 'S' = actualNum >= 5 ? 'B' : 'S';

        if (pred.r !== 'W') {
          if (pred.r === actualRes) {
            wins++;
            curStreak++;
            maxWinStreak = Math.max(maxWinStreak, curStreak);
            curLossStep = 0;
          } else {
            losses++;
            curStreak = 0;
            curLossStep++;
            if (curLossStep >= testSteps) {
              busts++;
              curLossStep = 0;
            }
          }
        }

        // Add to history
        simHistory.unshift({ n: actualNum, r: actualRes });
        if (simHistory.length > 50) simHistory.pop();
      }

      setBacktestResults({
        rounds: numRounds,
        wins,
        losses,
        winRate: Math.round((wins / (wins + losses || 1)) * 100),
        maxStreak: maxWinStreak,
        martingaleBusts: busts,
      });

      setBacktestRunning(false);
      sound.playWin();
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl font-['Nunito'] text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 mb-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          Algorithm Neural Breakdown
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
            Real-Time Engine Diagnostics
          </span>
        </h2>
        <p className="text-xs text-slate-400 font-semibold">
          How BD ALAMIN v7.2 calculates probability, weighting, and confidence
        </p>
      </div>

      {/* 3 Pillar Signals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Signal 1: Streak */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current text-emerald-400" viewBox="0 0 24 24">
                  <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                </svg>
                Streak (32 Pts)
              </span>
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-md ${
                  prediction._streak === 'B'
                    ? 'bg-red-500/20 text-red-400'
                    : prediction._streak === 'S'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {prediction._streak === 'B'
                  ? 'VOTES BIG'
                  : prediction._streak === 'S'
                  ? 'VOTES SMALL'
                  : 'NEUTRAL'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-3">
              Monitors run length and alternation frequency to predict momentum vs mean-reversion.
            </p>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Streak:</span>
              <span className="font-black text-white">{currentStreak}x ({rs[0] === 'B' ? 'Big' : 'Small'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Alternation Rate:</span>
              <span className="font-black text-emerald-400">{altRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reversal Trigger:</span>
              <span className="font-bold text-slate-300">
                {altRate > 68 || currentStreak >= 3 ? 'Triggered (Opposite)' : 'Continuation'}
              </span>
            </div>
          </div>
        </div>

        {/* Signal 2: Weighted Trend */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current text-emerald-400" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                </svg>
                Weighted Trend (42 Pts)
              </span>
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-md ${
                  prediction._trend === 'B'
                    ? 'bg-red-500/20 text-red-400'
                    : prediction._trend === 'S'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {prediction._trend === 'B'
                  ? 'VOTES BIG'
                  : prediction._trend === 'S'
                  ? 'VOTES SMALL'
                  : 'NEUTRAL'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-3">
              Assigns exponential weights (12 down to 1) to the 10 most recent results.
            </p>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Weight for Big:</span>
              <span className="font-black text-red-400">{wB} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Weight for Small:</span>
              <span className="font-black text-blue-400">{wS} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pattern Boost:</span>
              <span className="font-bold text-slate-300">Triple sequence check active</span>
            </div>
          </div>
        </div>

        {/* Signal 3: Balance */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current text-emerald-400" viewBox="0 0 24 24">
                  <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
                </svg>
                Balance (26 Pts)
              </span>
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-md ${
                  prediction._balance === 'B'
                    ? 'bg-red-500/20 text-red-400'
                    : prediction._balance === 'S'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {prediction._balance === 'B'
                  ? 'VOTES BIG'
                  : prediction._balance === 'S'
                  ? 'VOTES SMALL'
                  : 'NEUTRAL'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-3">
              Tracks 20-round macro equilibrium between Big and Small numbers.
            </p>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Last 20 Ratio:</span>
              <span className="font-black text-white">{bCount}B : {sCount}S</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deviation Delta:</span>
              <span className="font-black text-emerald-400">
                {balanceDiff > 0 ? `+${balanceDiff} (Big Heavy)` : balanceDiff < 0 ? `${balanceDiff} (Small Heavy)` : '0 (Balanced)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Bias:</span>
              <span className="font-bold text-slate-300">
                {Math.abs(balanceDiff) >= 2 ? (balanceDiff > 0 ? 'Small Due' : 'Big Due') : 'Equilibrium'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monte Carlo Simulator & Stress Tester */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              Algorithm Stress Tester &amp; Backtester
            </h3>
            <p className="text-xs text-slate-400">
              Simulate hundreds of rounds through BD ALAMIN v7.2 to verify accuracy and Martingale resilience
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[50, 100, 250].map((rounds) => (
              <button
                key={rounds}
                disabled={backtestRunning}
                onClick={() => runBacktest(rounds)}
                className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-black px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
              >
                Test {rounds} Rounds
              </button>
            ))}
          </div>
        </div>

        {/* Backtest output card */}
        {backtestResults && (
          <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Rounds
              </span>
              <span className="text-lg font-black text-white font-mono">
                {backtestResults.rounds}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Win Rate
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {backtestResults.winRate}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Wins / Losses
              </span>
              <span className="text-base font-black text-slate-200 font-mono">
                {backtestResults.wins}W / {backtestResults.losses}L
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Max Win Streak
              </span>
              <span className="text-lg font-black text-amber-400 font-mono">
                {backtestResults.maxStreak} in a row
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                4-Step Busts
              </span>
              <span
                className={`text-lg font-black font-mono ${
                  backtestResults.martingaleBusts === 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {backtestResults.martingaleBusts}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
