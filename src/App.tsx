import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  MarketPeriod,
  GameRound,
  AlgoPrediction,
  BetLogItem,
  AutoBetState,
  UserManualBet,
} from './types';
import { algoPredict, calcBets, getNumberColor } from './utils/algo';
import { sound } from './utils/sound';
import { BdAlaminWidget } from './components/BdAlaminWidget';
import { StormCloudBackground } from './components/StormCloudBackground';
import { APP_CONFIG } from './config/appConfig';

// Period duration in seconds
const MARKET_DURATIONS: Record<MarketPeriod, number> = {
  '30s': 30,
  '1m': 60,
  '3m': 180,
  '5m': 300,
};

// Generate realistic starting history
function generateInitialHistory(): GameRound[] {
  const history: GameRound[] = [];
  const now = Date.now();
  const periods: MarketPeriod[] = ['30s', '1m', '3m', '5m'];

  periods.forEach((period) => {
    const roundBase = 2026102001000;
    for (let i = 25; i >= 1; i--) {
      const num = Math.floor(Math.random() * 10);
      const isBig = num >= 5;
      history.push({
        round: String(roundBase + i),
        period,
        number: num,
        result: isBig ? 'B' : 'S',
        color: getNumberColor(num),
        timestamp: now - i * MARKET_DURATIONS[period] * 1000,
      });
    }
  });

  return history;
}

export default function App() {
  // Active Market
  const [currentMarket, setCurrentMarket] = useState<MarketPeriod>('30s');

  // Time remaining per market
  const [timers, setTimers] = useState<Record<MarketPeriod, number>>({
    '30s': 24,
    '1m': 48,
    '3m': 142,
    '5m': 260,
  });

  // Current active round IDs per market
  const [activeRounds, setActiveRounds] = useState<Record<MarketPeriod, string>>({
    '30s': '2026102001026',
    '1m': '2026102001026',
    '3m': '2026102001026',
    '5m': '2026102001026',
  });

  // Full History
  const [history, setHistory] = useState<GameRound[]>(generateInitialHistory);

  // User Balance (৳ BDT)
  const [balance, setBalance] = useState<number>(5000);

  // User Manual Bets
  const [userBets, setUserBets] = useState<UserManualBet[]>([]);

  // Prediction Toggle ON/OFF
  const [predEnabled, setPredEnabled] = useState<boolean>(true);

  // Stats for the widget
  const [stats, setStats] = useState<{ w: number; l: number; acc: number }>({
    w: 12,
    l: 3,
    acc: 80,
  });

  // Resolved & Live Bet Log
  const [betLog, setBetLog] = useState<BetLogItem[]>([
    { round: '2026102001025', pred: 'B', won: true, timestamp: Date.now() - 30000 },
    { round: '2026102001024', pred: 'S', won: true, timestamp: Date.now() - 60000 },
    { round: '2026102001023', pred: 'B', won: false, timestamp: Date.now() - 90000 },
    { round: '2026102001022', pred: 'B', won: true, timestamp: Date.now() - 120000 },
    { round: '2026102001021', pred: 'S', won: true, timestamp: Date.now() - 150000 },
  ]);

  // Auto Bet State
  const [autoBet, setAutoBet] = useState<AutoBetState>({
    on: false,
    balance: 2000,
    steps: 4,
    curStep: 0,
    minConf: 65,
    bets: calcBets(2000, 4),
    lastBet: null,
    w: 0,
    l: 0,
    sk: 0,
  });

  // Filter history for current market
  const currentMarketHistory = useMemo(() => {
    return history.filter((h) => h.period === currentMarket);
  }, [history, currentMarket]);

  // Compute prediction live using BD ALAMIN v7.2 heuristics
  const prediction: AlgoPrediction = useMemo(() => {
    if (!predEnabled) {
      return {
        r: 'W',
        n: -1,
        cf: 0,
        _streak: '—',
        _trend: '—',
        _balance: '—',
      };
    }
    return algoPredict(currentMarketHistory);
  }, [currentMarketHistory, predEnabled]);

  // Reference current round object
  const currentRoundObj: GameRound = useMemo(() => {
    return {
      round: activeRounds[currentMarket],
      period: currentMarket,
      number: 0,
      result: 'B',
      color: 'green',
      timestamp: Date.now(),
    };
  }, [activeRounds, currentMarket]);

  // Handle Auto Bet updates
  const handleUpdateAutoBet = (updates: Partial<AutoBetState>) => {
    setAutoBet((prev) => {
      const next = { ...prev, ...updates };
      if (updates.balance !== undefined || updates.steps !== undefined) {
        next.bets = calcBets(next.balance, next.steps);
      }
      return next;
    });
  };

  const handleStartStopAutoBet = () => {
    setAutoBet((prev) => {
      const nextOn = !prev.on;
      if (nextOn) {
        const freshBets = calcBets(prev.balance, prev.steps);
        return {
          ...prev,
          on: true,
          curStep: 0,
          bets: freshBets,
          lastBet: null,
        };
      }
      return { ...prev, on: false, lastBet: null };
    });
  };

  // Trigger draw for a specific market
  const executeDraw = (period: MarketPeriod) => {
    const winningNum = Math.floor(Math.random() * 10);
    const winningResult: 'B' | 'S' = winningNum >= 5 ? 'B' : 'S';
    const winningColor = getNumberColor(winningNum);
    const drawnRoundId = activeRounds[period];

    // Create new round record
    const newRecord: GameRound = {
      round: drawnRoundId,
      period,
      number: winningNum,
      result: winningResult,
      color: winningColor,
      timestamp: Date.now(),
    };

    // Update history
    setHistory((prev) => [newRecord, ...prev]);

    // Check manual bets for this round & period
    setUserBets((prev) =>
      prev.map((bet) => {
        if (bet.round !== drawnRoundId || bet.status !== 'pending') return bet;

        let won = false;
        let multiplier = 0;

        if (bet.type === 'big_small') {
          if (
            (bet.selection === 'Big' && winningResult === 'B') ||
            (bet.selection === 'Small' && winningResult === 'S')
          ) {
            won = true;
            multiplier = 1.98;
          }
        } else if (bet.type === 'number') {
          if (Number(bet.selection) === winningNum) {
            won = true;
            multiplier = 9.0;
          }
        } else if (bet.type === 'color') {
          if (bet.selection === 'Green' && (winningColor === 'green' || winningColor === 'green-violet')) {
            won = true;
            multiplier = winningColor === 'green-violet' ? 1.5 : 2.0;
          } else if (bet.selection === 'Red' && (winningColor === 'red' || winningColor === 'red-violet')) {
            won = true;
            multiplier = winningColor === 'red-violet' ? 1.5 : 2.0;
          } else if (bet.selection === 'Violet' && (winningColor === 'violet' || winningColor === 'green-violet' || winningColor === 'red-violet')) {
            won = true;
            multiplier = 4.5;
          }
        }

        const payout = won ? Math.floor(bet.amount * multiplier) : 0;
        if (won) {
          setBalance((b) => b + payout);
          sound.playWin();
          confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
        }

        return {
          ...bet,
          status: won ? 'won' : 'lost',
          payout,
        };
      })
    );

    // Evaluate prediction & Auto Bet for current active market
    if (period === currentMarket) {
      const pred = algoPredict(history.filter((h) => h.period === period));
      if (pred.r !== 'W' && predEnabled) {
        const didWin = pred.r === winningResult;
        setStats((prev) => {
          const nw = prev.w + (didWin ? 1 : 0);
          const nl = prev.l + (didWin ? 0 : 1);
          return {
            w: nw,
            l: nl,
            acc: Math.round((nw / (nw + nl || 1)) * 100),
          };
        });

        // Add to betLog
        setBetLog((prev) => [
          {
            round: drawnRoundId,
            pred: pred.r as 'B' | 'S',
            won: didWin,
            timestamp: Date.now(),
          },
          ...prev.slice(0, 50),
        ]);
      }

      // Handle Auto Bet Martingale step advancement
      if (autoBet.on && autoBet.lastBet && !autoBet.lastBet.done) {
        const abWon = autoBet.lastBet.type === winningResult;
        if (abWon) {
          const payout = Math.floor(autoBet.lastBet.amt * 1.98);
          setBalance((b) => b + payout);
          sound.playWin();
          setAutoBet((prev) => ({
            ...prev,
            w: prev.w + 1,
            curStep: 0,
            lastBet: null,
          }));
        } else {
          sound.playLoss();
          setAutoBet((prev) => {
            const nextStep = prev.curStep + 1;
            if (nextStep < prev.steps) {
              return {
                ...prev,
                l: prev.l + 1,
                curStep: nextStep,
                lastBet: null,
              };
            } else {
              return {
                ...prev,
                l: prev.l + 1,
                curStep: 0,
                lastBet: null,
              };
            }
          });
        }
      }
    }

    // Reset period ID and countdown
    const nextRoundNumber = (parseInt(drawnRoundId) + 1).toString();
    setActiveRounds((prev) => ({ ...prev, [period]: nextRoundNumber }));
    setTimers((prev) => ({ ...prev, [period]: MARKET_DURATIONS[period] }));
  };

  // Main game tick loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated: Record<MarketPeriod, number> = { ...prev };
        (['30s', '1m', '3m', '5m'] as MarketPeriod[]).forEach((period) => {
          const nextSec = updated[period] - 1;

          // Sound tick on active market
          if (period === currentMarket) {
            if (nextSec <= 5 && nextSec >= 1) {
              sound.playTick(true);
            } else if (nextSec % 10 === 0) {
              sound.playTick(false);
            }
          }

          if (nextSec <= 0) {
            executeDraw(period);
            updated[period] = MARKET_DURATIONS[period];
          } else {
            updated[period] = nextSec;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentMarket, activeRounds, history, autoBet, predEnabled]);

  // Execute Auto Bet when a new round starts and is outside the lock period (> 5s)
  useEffect(() => {
    if (!autoBet.on) return;
    const timeLeft = timers[currentMarket];
    if (timeLeft > 5 && !autoBet.lastBet) {
      if (prediction.r !== 'W' && prediction.cf >= autoBet.minConf) {
        const betType = prediction.r;
        const betAmount = autoBet.bets[autoBet.curStep] || autoBet.bets[0] || 10;

        if (balance >= betAmount) {
          setBalance((b) => b - betAmount);
          sound.playBet();
          setAutoBet((prev) => ({
            ...prev,
            lastBet: {
              type: betType,
              amt: betAmount,
              round: activeRounds[currentMarket],
              done: false,
            },
          }));
        }
      } else if (prediction.r !== 'W' && prediction.cf < autoBet.minConf) {
        setAutoBet((prev) => ({ ...prev, sk: prev.sk + 1 }));
      }
    }
  }, [timers, currentMarket, autoBet.on, prediction, autoBet.minConf]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Nunito'] select-none flex items-center justify-center">
      {/* ── 1. CINEMATIC 3D STORM-CLOUD & LIGHTNING BACKGROUND (ALWAYS VISIBLE) ── */}
      <StormCloudBackground />

      {/* ── 2. DK WIN FRAME (PURE DK WIN IFRAME IN FRAME, NO EXTRA BUTTONS) ── */}
      <div className="relative z-10 w-full max-w-[420px] h-[95vh] rounded-[30px] sm:rounded-[36px] border-2 border-emerald-500/40 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden bg-slate-950 flex flex-col transition-all">
        {/* DKWIN9 iframe */}
        <iframe
          src={APP_CONFIG.gameUrl}
          title="DKWIN9 Live Frame"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          className="w-full h-full border-0 bg-slate-950"
        />
      </div>

      {/* ── 3. FLOATING ADVANCE PREDICTOR OVERLAY WIDGET ── */}
      <BdAlaminWidget
        currentMarket={currentMarket}
        onMarketChange={setCurrentMarket}
        currentRound={currentRoundObj}
        history={history}
        prediction={prediction}
        predEnabled={predEnabled}
        onTogglePred={() => setPredEnabled((p) => !p)}
        stats={stats}
        betLog={betLog}
        autoBet={autoBet}
        onUpdateAutoBet={handleUpdateAutoBet}
        onStartStopAutoBet={handleStartStopAutoBet}
        isDocked={false}
      />
    </div>
  );
}
