import React, { useState } from 'react';
import { MarketPeriod, GameRound, UserManualBet } from '../types';
import { getNumberColor } from '../utils/algo';
import { sound } from '../utils/sound';

interface WinGoArenaProps {
  currentMarket: MarketPeriod;
  onMarketChange: (m: MarketPeriod) => void;
  currentRound: GameRound;
  timeLeft: number;
  marketDuration: number;
  history: GameRound[];
  balance: number;
  onDeposit: (amt: number) => void;
  onResetBalance: () => void;
  onPlaceManualBet: (type: 'color' | 'number' | 'big_small', selection: string | number, amount: number) => boolean;
  userBets: UserManualBet[];
  simSpeed: number;
  onSetSimSpeed: (speed: number) => void;
  onInstantDraw: () => void;
  autoBetHighlight?: { type: 'B' | 'S'; amt: number } | null;
}

export const WinGoArena: React.FC<WinGoArenaProps> = ({
  currentMarket,
  onMarketChange,
  currentRound,
  timeLeft,
  marketDuration,
  history,
  balance,
  onDeposit,
  onResetBalance,
  onPlaceManualBet,
  userBets,
  simSpeed,
  onSetSimSpeed,
  onInstantDraw,
  autoBetHighlight,
}) => {
  // Manual bet modal state
  const [selectedBet, setSelectedBet] = useState<{
    category: 'color' | 'number' | 'big_small';
    value: string | number;
    label: string;
    rate: string;
  } | null>(null);

  const [baseAmount, setBaseAmount] = useState<number>(10);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'record' | 'mybets' | 'chart'>('record');

  const totalBetAmount = baseAmount * multiplier;
  const isLocked = timeLeft <= 5;

  const handleOpenBet = (
    category: 'color' | 'number' | 'big_small',
    value: string | number,
    label: string,
    rate: string
  ) => {
    if (isLocked) return;
    sound.playClick();
    setSelectedBet({ category, value, label, rate });
  };

  const handleConfirmBet = () => {
    if (!selectedBet) return;
    if (totalBetAmount > balance) {
      sound.playLoss();
      alert('Insufficient balance! Please deposit to continue.');
      return;
    }

    const success = onPlaceManualBet(
      selectedBet.category,
      selectedBet.value,
      totalBetAmount
    );

    if (success) {
      sound.playBet();
      setSelectedBet(null);
    }
  };

  // Recent 5 numbers for the header ball sequence
  const recentRounds = history
    .filter((h) => h.period === currentMarket)
    .slice(0, 5);

  const formatSeconds = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-['Nunito'] text-slate-100 flex flex-col">
      {/* Top Banner & Wallet Row */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900/80 p-4 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Market Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-emerald-400 text-lg">
              W
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white flex items-center gap-2">
              Win Go Arena
              <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-semibold">
              Official 30s · 1m · 3m · 5m Lottery
            </p>
          </div>
        </div>

        {/* Wallet Balance & Deposit */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-2 px-3.5">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Player Wallet
            </span>
            <span className="text-base font-black text-emerald-400 font-mono">
              ৳{balance.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => {
                sound.playClick();
                onDeposit(1000);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] px-2.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              +৳1,000
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onResetBalance();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] px-2 py-1.5 rounded-xl transition-colors"
              title="Reset balance"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Market Tabs */}
      <div className="grid grid-cols-4 bg-slate-950 border-b border-slate-800 p-1.5 gap-1.5">
        {(['30s', '1m', '3m', '5m'] as MarketPeriod[]).map((m) => {
          const active = currentMarket === m;
          const labels: Record<MarketPeriod, string> = {
            '30s': 'Win Go 30S',
            '1m': 'Win Go 1Min',
            '3m': 'Win Go 3Min',
            '5m': 'Win Go 5Min',
          };
          return (
            <button
              key={m}
              onClick={() => {
                sound.playClick();
                onMarketChange(m);
              }}
              className={`py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex flex-col items-center justify-center ${
                active
                  ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>{labels[m]}</span>
            </button>
          );
        })}
      </div>

      {/* Simulation Speed & Controls Bar */}
      <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px]">
          <span>Test Speed:</span>
          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                sound.playClick();
                onSetSimSpeed(spd);
              }}
              className={`px-2 py-0.5 rounded-lg font-black transition-colors ${
                simSpeed === spd
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
          <button
            onClick={() => {
              sound.playClick();
              onInstantDraw();
            }}
            className="ml-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-lg font-bold text-[10px] transition-colors"
          >
            Instant Draw ⚡
          </button>
        </div>

        {/* Audio Mute / Unmute */}
        <button
          onClick={() => {
            sound.enabled = !sound.enabled;
            sound.playClick();
          }}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] font-bold"
        >
          {sound.enabled ? '🔊 Sound On' : '🔇 Muted'}
        </button>
      </div>

      {/* Game Stage: Period Card & Countdown Clock */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Subtle glow aura */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            {/* Period Info */}
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/80 block mb-1">
                Active Period ID
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white">
                {currentRound.round}
              </div>

              {/* Recent 5 balls sequence */}
              <div className="flex items-center gap-1.5 mt-3 justify-center sm:justify-start">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                  Last 5:
                </span>
                {recentRounds.map((r, i) => {
                  const color = getNumberColor(r.number);
                  return (
                    <div
                      key={`${r.round}-${i}`}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md ${
                        color === 'red-violet'
                          ? 'bg-gradient-to-br from-red-600 via-purple-600 to-violet-700'
                          : color === 'green-violet'
                          ? 'bg-gradient-to-br from-emerald-600 via-purple-600 to-violet-700'
                          : color === 'green'
                          ? 'bg-emerald-600'
                          : 'bg-red-600'
                      }`}
                    >
                      {r.number}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Countdown Clock Display */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                Time Remaining
              </span>
              <div
                className={`flex items-center gap-2 font-mono text-4xl sm:text-5xl font-black px-6 py-2.5 rounded-3xl border-2 transition-all ${
                  isLocked
                    ? 'bg-red-500/15 border-red-500/50 text-red-400 shadow-xl shadow-red-500/20 animate-pulse'
                    : 'bg-slate-950/80 border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-500/10'
                }`}
              >
                <span>{formatSeconds(timeLeft)}</span>
              </div>
              {isLocked ? (
                <span className="text-[10px] font-black text-red-400 tracking-wider uppercase mt-1.5 animate-pulse">
                  🔒 Locked · Drawing Soon
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1.5">
                  Bids Open
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            BETTING CONTROLS
        ══════════════════════════════════════════════════ */}
        <div className="mt-6 space-y-4">
          {/* 1. Color Bets */}
          <div className="grid grid-cols-3 gap-3">
            <button
              disabled={isLocked}
              onClick={() => handleOpenBet('color', 'Green', 'Green', '2.0X')}
              className={`p-3.5 rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all active:scale-98 flex items-center justify-between ${
                isLocked
                  ? 'opacity-40 cursor-not-allowed bg-emerald-800 text-white/50'
                  : 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-emerald-600/30'
              }`}
            >
              <span>Green</span>
              <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-lg font-mono">
                2X
              </span>
            </button>

            <button
              disabled={isLocked}
              onClick={() => handleOpenBet('color', 'Violet', 'Violet', '4.5X')}
              className={`p-3.5 rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all active:scale-98 flex items-center justify-between ${
                isLocked
                  ? 'opacity-40 cursor-not-allowed bg-purple-800 text-white/50'
                  : 'bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 text-white shadow-purple-600/30'
              }`}
            >
              <span>Violet</span>
              <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-lg font-mono">
                4.5X
              </span>
            </button>

            <button
              disabled={isLocked}
              onClick={() => handleOpenBet('color', 'Red', 'Red', '2.0X')}
              className={`p-3.5 rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all active:scale-98 flex items-center justify-between ${
                isLocked
                  ? 'opacity-40 cursor-not-allowed bg-red-800 text-white/50'
                  : 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white shadow-red-600/30'
              }`}
            >
              <span>Red</span>
              <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-lg font-mono">
                2X
              </span>
            </button>
          </div>

          {/* 2. Number Grid (0 - 9) */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const color = getNumberColor(num);
              return (
                <button
                  key={num}
                  disabled={isLocked}
                  onClick={() => handleOpenBet('number', num, `Number ${num}`, '9.0X')}
                  className={`h-14 sm:h-16 rounded-2xl font-black text-xl flex flex-col items-center justify-center transition-all shadow-md active:scale-95 ${
                    isLocked
                      ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                      : color === 'red-violet'
                      ? 'bg-gradient-to-br from-red-600 via-purple-600 to-violet-700 hover:opacity-90 text-white shadow-red-500/20'
                      : color === 'green-violet'
                      ? 'bg-gradient-to-br from-emerald-600 via-purple-600 to-violet-700 hover:opacity-90 text-white shadow-emerald-500/20'
                      : color === 'green'
                      ? 'bg-gradient-to-br from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-emerald-500/20'
                      : 'bg-gradient-to-br from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white shadow-red-500/20'
                  }`}
                >
                  <span>{num}</span>
                  <span className="text-[9px] font-mono opacity-80 leading-none">9X</span>
                </button>
              );
            })}
          </div>

          {/* 3. Big & Small Buttons */}
          <div className="grid grid-cols-2 gap-3 relative">
            {/* BIG button */}
            <button
              disabled={isLocked}
              onClick={() => handleOpenBet('big_small', 'Big', 'BIG (5 - 9)', '1.98X')}
              className={`p-4 rounded-2xl font-black text-lg tracking-wider transition-all shadow-xl active:scale-98 flex items-center justify-between relative overflow-hidden ${
                autoBetHighlight?.type === 'B'
                  ? 'ring-4 ring-yellow-400 scale-[1.02] shadow-yellow-400/50'
                  : ''
              } ${
                isLocked
                  ? 'opacity-40 cursor-not-allowed bg-red-950 text-white/50 border border-red-800/30'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-400 text-white shadow-red-600/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                </svg>
                <span>BIG</span>
              </div>
              <span className="text-xs font-mono bg-black/30 px-2.5 py-1 rounded-xl">
                1.98X
              </span>
              {autoBetHighlight?.type === 'B' && (
                <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center font-black text-xs text-yellow-300">
                  ⚡ AUTO BET: ৳{autoBetHighlight.amt}
                </div>
              )}
            </button>

            {/* SMALL button */}
            <button
              disabled={isLocked}
              onClick={() => handleOpenBet('big_small', 'Small', 'SMALL (0 - 4)', '1.98X')}
              className={`p-4 rounded-2xl font-black text-lg tracking-wider transition-all shadow-xl active:scale-98 flex items-center justify-between relative overflow-hidden ${
                autoBetHighlight?.type === 'S'
                  ? 'ring-4 ring-yellow-400 scale-[1.02] shadow-yellow-400/50'
                  : ''
              } ${
                isLocked
                  ? 'opacity-40 cursor-not-allowed bg-blue-950 text-white/50 border border-blue-800/30'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-600/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                </svg>
                <span>SMALL</span>
              </div>
              <span className="text-xs font-mono bg-black/30 px-2.5 py-1 rounded-xl">
                1.98X
              </span>
              {autoBetHighlight?.type === 'S' && (
                <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center font-black text-xs text-yellow-300">
                  ⚡ AUTO BET: ৳{autoBetHighlight.amt}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MANUAL BET MODAL DRAWER
      ══════════════════════════════════════════════════ */}
      {selectedBet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl text-slate-100 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Place Bet on {selectedBet.label}
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    {selectedBet.rate}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">
                  Period #{currentRound.round}
                </p>
              </div>
              <button
                onClick={() => setSelectedBet(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Base Amount Selector */}
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                Select Base Amount (৳)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[1, 10, 100, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      sound.playClick();
                      setBaseAmount(amt);
                    }}
                    className={`py-2 rounded-xl font-black text-xs transition-colors ${
                      baseAmount === amt
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier Selector */}
            <div className="mb-5">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                Select Multiplier
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 5, 10, 20, 50, 100].map((mul) => (
                  <button
                    key={mul}
                    onClick={() => {
                      sound.playClick();
                      setMultiplier(mul);
                    }}
                    className={`py-1.5 rounded-xl font-black text-xs font-mono transition-colors ${
                      multiplier === mul
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    X{mul}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Bet Amount
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  ৳{totalBetAmount.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Estimated Payout
                </span>
                <span className="text-sm font-black text-slate-200 font-mono">
                  ৳{(totalBetAmount * parseFloat(selectedBet.rate)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedBet(null)}
                className="flex-1 py-3 rounded-xl font-black text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBet}
                className="flex-1 py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 shadow-lg shadow-emerald-500/25 uppercase tracking-wider"
              >
                Confirm Bet ৳{totalBetAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TABLE TABS: GAME RECORD & MY BETS
      ══════════════════════════════════════════════════ */}
      <div className="border-t border-slate-800 bg-slate-950 p-4">
        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-3">
          <button
            onClick={() => setActiveTab('record')}
            className={`pb-2 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'record'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Game Record ({currentMarket.toUpperCase()})
          </button>
          <button
            onClick={() => setActiveTab('mybets')}
            className={`pb-2 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'mybets'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            My Bets
            {userBets.length > 0 && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                {userBets.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Game Record */}
        {activeTab === 'record' && (
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-900 sticky top-0">
                <tr>
                  <th className="py-2 px-3">Period</th>
                  <th className="py-2 px-3">Number</th>
                  <th className="py-2 px-3">Big/Small</th>
                  <th className="py-2 px-3">Color</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {history
                  .filter((h) => h.period === currentMarket)
                  .map((row) => {
                    const color = getNumberColor(row.number);
                    const isRowBig = row.result === 'B';
                    return (
                      <tr key={row.round} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-300">
                          {row.round}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                              isRowBig
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {row.number}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-black text-xs ${
                              isRowBig ? 'text-red-400' : 'text-blue-400'
                            }`}
                          >
                            {isRowBig ? 'BIG' : 'SMALL'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-3 h-3 rounded-full ${
                                color === 'red-violet'
                                  ? 'bg-gradient-to-r from-red-500 to-purple-600'
                                  : color === 'green-violet'
                                  ? 'bg-gradient-to-r from-emerald-500 to-purple-600'
                                  : color === 'green'
                                  ? 'bg-emerald-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            <span className="capitalize text-slate-300 text-[11px]">
                              {color.replace('-', ' & ')}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: My Bets */}
        {activeTab === 'mybets' && (
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            {userBets.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-bold">
                No bets placed yet this session
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-900 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Round</th>
                    <th className="py-2 px-3">Selection</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {userBets.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-300">
                        #{b.round.slice(-6)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white capitalize">
                        {String(b.selection)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                        ৳{b.amount}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            b.status === 'won'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : b.status === 'lost'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black">
                        {b.status === 'won' ? (
                          <span className="text-emerald-400">+৳{b.payout}</span>
                        ) : b.status === 'lost' ? (
                          <span className="text-red-400">-৳{b.amount}</span>
                        ) : (
                          <span className="text-slate-500">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
