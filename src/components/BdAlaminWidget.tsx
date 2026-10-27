import React, { useState, useRef, useEffect } from 'react';
import {
  MarketPeriod,
  GameRound,
  AlgoPrediction,
  BetLogItem,
  AutoBetState,
} from '../types';
import { sound } from '../utils/sound';
import { APP_CONFIG } from '../config/appConfig';

interface BdAlaminWidgetProps {
  currentMarket: MarketPeriod;
  onMarketChange: (m: MarketPeriod) => void;
  currentRound: GameRound | null;
  history: GameRound[];
  prediction: AlgoPrediction;
  predEnabled: boolean;
  onTogglePred: () => void;
  stats: { w: number; l: number; acc: number };
  betLog: BetLogItem[];
  autoBet: AutoBetState;
  onUpdateAutoBet: (updates: Partial<AutoBetState>) => void;
  onStartStopAutoBet: () => void;
  isDocked?: boolean;
}

export const BdAlaminWidget: React.FC<BdAlaminWidgetProps> = ({
  currentMarket,
  onMarketChange,
  currentRound,
  history,
  prediction,
  predEnabled,
  onTogglePred,
  stats,
  betLog,
  autoBet,
  onUpdateAutoBet,
  onStartStopAutoBet,
  isDocked = false,
}) => {
  // Dialog visibility states
  const [menuOpen, setMenuOpen] = useState(false);
  const [dlgOpen, setDlgOpen] = useState(true);
  const [abOpen, setAbOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [mktOpen, setMktOpen] = useState(false);

  // Pagination states
  const [histPage, setHistPage] = useState(0);
  const [mktPage, setMktPage] = useState(0);

  // Logo spinning trigger on click
  const [isSpinning, setIsSpinning] = useState(false);

  // Floating positions for draggable windows
  const [logoPos, setLogoPos] = useState({ x: window.innerWidth > 768 ? window.innerWidth - 90 : window.innerWidth - 75, y: 160 });
  const [dlgPos, setDlgPos] = useState({ x: window.innerWidth > 1024 ? window.innerWidth - 360 : Math.max(20, window.innerWidth / 2 - 165), y: 70 });
  const [abPos, setAbPos] = useState({ x: window.innerWidth > 1024 ? window.innerWidth - 380 : Math.max(20, window.innerWidth / 2 - 160), y: 100 });
  const [histPos, setHistPos] = useState({ x: window.innerWidth > 1024 ? window.innerWidth - 370 : Math.max(20, window.innerWidth / 2 - 155), y: 120 });
  const [mktPos, setMktPos] = useState({ x: window.innerWidth > 1024 ? window.innerWidth - 370 : Math.max(20, window.innerWidth / 2 - 150), y: 140 });

  // Dragging logic helper
  const handleDrag = (
    e: React.MouseEvent | React.TouchEvent,
    setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
    currentPos: { x: number; y: number }
  ) => {
    // If clicked on close button or inputs, don't drag
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const startX = clientX - currentPos.x;
    const startY = clientY - currentPos.y;

    const onMove = (moveEvt: MouseEvent | TouchEvent) => {
      const isTouchMove = 'touches' in moveEvt;
      const curX = isTouchMove ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const curY = isTouchMove ? moveEvt.touches[0].clientY : moveEvt.clientY;
      const nextX = Math.max(10, Math.min(window.innerWidth - 100, curX - startX));
      const nextY = Math.max(10, Math.min(window.innerHeight - 80, curY - startY));
      setPos({ x: nextX, y: nextY });
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  const onLogoClick = () => {
    sound.playClick();
    setIsSpinning(true);
    setMenuOpen((prev) => !prev);
    setTimeout(() => setIsSpinning(false), 600);
  };

  const isBig = prediction.r === 'B';
  const isSmall = prediction.r === 'S';
  const isScanning = predEnabled && prediction.r === 'W';

  // Filtered market history
  const filteredHistory = history.filter((h) => h.period === currentMarket);

  // Auto bet calculated sequence
  const abSteps = Math.max(1, Math.min(10, autoBet.steps));
  const abBets = autoBet.bets && autoBet.bets.length === abSteps ? autoBet.bets : [100, 200, 400, 800];

  // History pagination (5 per page)
  const histItems = [...betLog];
  const histTotalPages = Math.max(1, Math.ceil(histItems.length / 5));
  const currentHistPageItems = histItems.slice(histPage * 5, (histPage + 1) * 5);

  // Market pagination (5 per page)
  const mktTotalPages = Math.max(1, Math.ceil(filteredHistory.length / 5));
  const currentMktPageItems = filteredHistory.slice(mktPage * 5, (mktPage + 1) * 5);

  return (
    <>
      {/* Floating BD ALAMIN Logo Button (Always accessible or when not docked) */}
      {!isDocked && (
        <div
          style={{ left: `${logoPos.x}px`, top: `${logoPos.y}px` }}
          className="fixed z-50 select-none cursor-pointer group"
          onMouseDown={(e) => handleDrag(e, setLogoPos, logoPos)}
          onTouchStart={(e) => handleDrag(e, setLogoPos, logoPos)}
        >
          <div
            onClick={onLogoClick}
            className={`w-16 h-16 rounded-full border-[3px] border-[#00C853] bg-slate-900 overflow-hidden shadow-2xl transition-transform hover:scale-110 active:scale-95 anim-logo-pulse ${
              isSpinning ? 'anim-logo-spin' : ''
            }`}
            title={`${APP_CONFIG.name} Premium v7.2 - Click to open menu`}
          >
            <img
              src={APP_CONFIG.profileImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src = APP_CONFIG.fallbackImage;
              }}
              alt={APP_CONFIG.name}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>

          {/* Online badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00C853] border-2 border-white"></span>
          </span>

          {/* Quick Floating Menu */}
          {menuOpen && (
            <div
              className="absolute right-18 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50 pointer-events-auto min-w-[210px] animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Telegram VIP channel link */}
              <a
                href={APP_CONFIG.telegram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  sound.playClick();
                  setMenuOpen(false);
                }}
                className="bg-sky-50 hover:bg-sky-100 text-sky-950 border-1.5 border-sky-400/40 rounded-2xl p-2.5 px-4 flex items-center gap-3 font-extrabold text-xs shadow-xl transition-all hover:-translate-x-1"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </div>
                <span>Join VIP Telegram</span>
              </a>
              <button
                onClick={() => {
                  sound.playClick();
                  setDlgOpen(true);
                  setMenuOpen(false);
                }}
                className="bg-white hover:bg-[#E8F5E9] text-[#1A2E1A] border-1.5 border-[#00C853]/25 rounded-2xl p-2.5 px-4 flex items-center gap-3 font-extrabold text-xs shadow-xl transition-all hover:-translate-x-1"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00C853] to-[#2E7D32] text-white flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                  </svg>
                </div>
                Prediction Panel
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setAbOpen(true);
                  setMenuOpen(false);
                }}
                className="bg-white hover:bg-[#E8F5E9] text-[#1A2E1A] border-1.5 border-[#00C853]/25 rounded-2xl p-2.5 px-4 flex items-center gap-3 font-extrabold text-xs shadow-xl transition-all hover:-translate-x-1"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00C853] to-[#2E7D32] text-white flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                  </svg>
                </div>
                Auto Bet Martingale
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setHistOpen(true);
                  setHistPage(0);
                  setMenuOpen(false);
                }}
                className="bg-white hover:bg-[#E8F5E9] text-[#1A2E1A] border-1.5 border-[#00C853]/25 rounded-2xl p-2.5 px-4 flex items-center gap-3 font-extrabold text-xs shadow-xl transition-all hover:-translate-x-1"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00C853] to-[#2E7D32] text-white flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                  </svg>
                </div>
                Prediction History
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setMktOpen(true);
                  setMktPage(0);
                  setMenuOpen(false);
                }}
                className="bg-white hover:bg-[#E8F5E9] text-[#1A2E1A] border-1.5 border-[#00C853]/25 rounded-2xl p-2.5 px-4 flex items-center gap-3 font-extrabold text-xs shadow-xl transition-all hover:-translate-x-1"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00C853] to-[#2E7D32] text-white flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
                  </svg>
                </div>
                Market History
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          1. MAIN PREDICTION DIALOG (v7.2 GREEN MATERIAL)
      ══════════════════════════════════════════════════ */}
      {dlgOpen && (
        <div
          style={
            isDocked
              ? {}
              : {
                  left: `${dlgPos.x}px`,
                  top: `${dlgPos.y}px`,
                }
          }
          className={`${
            isDocked
              ? 'relative w-full max-w-[340px] my-auto'
              : 'fixed z-40 w-[326px]'
          } bg-white rounded-[26px] overflow-hidden shadow-2xl border border-[#00C853]/20 flex flex-col font-['Nunito'] max-h-[92vh] select-none text-[#1A2E1A] transition-all`}
        >
          {/* Header */}
          <div
            className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#00C853] p-3.5 px-4 flex items-center gap-3 cursor-grab active:cursor-grabbing shrink-0 relative overflow-hidden"
            onMouseDown={(e) => !isDocked && handleDrag(e, setDlgPos, dlgPos)}
            onTouchStart={(e) => !isDocked && handleDrag(e, setDlgPos, dlgPos)}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 shrink-0 shadow-md bg-slate-800">
              <img
                src={APP_CONFIG.profileImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = APP_CONFIG.fallbackImage;
                }}
                alt={APP_CONFIG.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="text-white font-black text-sm drop-shadow-sm flex items-center gap-1.5">
                {APP_CONFIG.name}
                <span className="text-[10px] bg-white/20 border border-white/40 rounded-full px-2 py-0.5 font-black uppercase tracking-wider text-white">
                  v7.2
                </span>
              </div>
              <div className="text-white/80 text-[10px] font-bold">
                Smart Predict · ALGO Engine
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDlgOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors text-xs"
                title="Minimize"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 13H5v-2h14v2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Container */}
          <div className="overflow-y-auto flex-1 p-0">
            {/* Market Tabs */}
            <div className="flex bg-white border-b border-[#00C853]/15 px-2">
              {(['30s', '1m', '3m', '5m'] as MarketPeriod[]).map((m) => {
                const active = currentMarket === m;
                const labels: Record<MarketPeriod, string> = {
                  '30s': '30S',
                  '1m': '1M',
                  '3m': '3M',
                  '5m': '5M',
                };
                return (
                  <button
                    key={m}
                    onClick={() => {
                      sound.playClick();
                      onMarketChange(m);
                    }}
                    className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider relative transition-colors ${
                      active ? 'text-[#2E7D32]' : 'text-[#78909C] hover:text-[#1A2E1A]'
                    }`}
                  >
                    {labels[m]}
                    {active && (
                      <span className="absolute bottom-0 left-[15%] right-[15%] h-[2.5px] rounded-full bg-gradient-to-r from-[#2E7D32] via-[#00C853] to-[#00E676]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Prediction ON/OFF Toggle */}
            <div
              onClick={() => {
                sound.playClick();
                onTogglePred();
              }}
              className={`flex items-center justify-between mx-3.5 mt-3 p-2.5 px-3.5 rounded-2xl cursor-pointer transition-all ${
                predEnabled
                  ? 'bg-[#00C853]/12 border-[1.5px] border-[#00C853]/40'
                  : 'bg-gray-100 border-[1.5px] border-gray-200'
              }`}
            >
              <div
                className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-colors ${
                  predEnabled ? 'text-[#1B5E20]' : 'text-gray-400'
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M10 3H8v10h2V3zm5.55 2.06l-1.42 1.42C15.32 7.7 16 9.27 16 11c0 2.76-2.24 5-5 5s-5-2.24-5-5c0-1.73.68-3.3 1.88-4.53L6.46 5.06C4.93 6.57 4 8.67 4 11c0 3.87 3.13 7 7 7s7-3.13 7-7c0-2.33-.93-4.43-2.45-5.94z" />
                </svg>
                Prediction
                <span
                  className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-md ${
                    predEnabled
                      ? 'bg-[#00C853]/20 text-[#2E7D32]'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {predEnabled ? 'ON' : 'OFF'}
                </span>
              </div>

              {/* Toggle switch pill */}
              <div
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  predEnabled ? 'bg-[#00C853]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                    predEnabled ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </div>
            </div>

            {/* Body */}
            <div className="p-3.5 pt-2.5">
              {/* Round Row */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-extrabold text-[#78909C] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C853] shadow-[0_0_8px_#00C853] anim-pulse-slow" />
                  Round
                </span>
                <span className="text-[10px] font-black text-[#1A2E1A] bg-[#E8F5E9] border border-[#00C853]/25 rounded-lg px-2.5 py-0.5 font-mono">
                  {currentRound ? `#${currentRound.round.slice(-6)}` : 'Scanning...'}
                </span>
              </div>

              {/* Prediction Card */}
              <div
                className={`rounded-[20px] p-3.5 mb-3 text-center transition-all duration-300 relative overflow-hidden ${
                  !predEnabled
                    ? 'bg-gray-50 border-[1.5px] border-gray-200'
                    : isScanning
                    ? 'anim-shimmer border-[1.5px] border-[#00C853]/20'
                    : isBig
                    ? 'bg-gradient-to-br from-[#FFEBEE] to-[#FFF3E0] border-[1.5px] border-[#E53935]/35 shadow-lg shadow-red-500/10'
                    : 'bg-gradient-to-br from-[#E3F2FD] to-[#E8F5E9] border-[1.5px] border-[#1E88E5]/35 shadow-lg shadow-blue-500/10'
                }`}
              >
                <div className="text-[8px] font-black text-[#78909C] uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                  <span className="h-px w-6 bg-[#00C853]/20" />
                  NEXT PREDICTION
                  <span className="h-px w-6 bg-[#00C853]/20" />
                </div>

                {/* Big outcome display */}
                <div className="min-h-[44px] flex items-center justify-center">
                  {!predEnabled ? (
                    <div className="text-gray-400 text-xs font-black tracking-wide flex items-center justify-center gap-1.5 anim-off-pulse">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M10 3H8v10h2V3zm5.55 2.06l-1.42 1.42C15.32 7.7 16 9.27 16 11c0 2.76-2.24 5-5 5s-5-2.24-5-5c0-1.73.68-3.3 1.88-4.53L6.46 5.06C4.93 6.57 4 8.67 4 11c0 3.87 3.13 7 7 7s7-3.13 7-7c0-2.33-.93-4.43-2.45-5.94z" />
                      </svg>
                      PREDICTION OFF
                    </div>
                  ) : isScanning ? (
                    <div className="text-gray-400 text-2xl font-black tracking-widest flex items-center justify-center gap-1">
                      <span className="anim-dot-1">.</span>
                      <span className="anim-dot-2">.</span>
                      <span className="anim-dot-3">.</span>
                    </div>
                  ) : (
                    <div
                      className={`text-3xl font-black tracking-wider flex items-center justify-center gap-2 anim-big-pred ${
                        isBig
                          ? 'text-[#E53935] drop-shadow-[0_2px_12px_rgba(229,57,53,0.3)]'
                          : 'text-[#1E88E5] drop-shadow-[0_2px_12px_rgba(30,136,229,0.3)]'
                      }`}
                    >
                      <svg
                        className="w-7 h-7 fill-current"
                        viewBox="0 0 24 24"
                      >
                        {isBig ? (
                          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                        ) : (
                          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                        )}
                      </svg>
                      <span>{isBig ? 'BIG' : 'SMALL'}</span>
                    </div>
                  )}
                </div>

                {/* Sub details: Number & Confidence */}
                <div className="text-[11px] font-extrabold text-[#4A7044] mt-1 min-h-[16px]">
                  {predEnabled && !isScanning && (
                    <span>
                      Num: {prediction.n >= 0 ? prediction.n : '?'}&nbsp;&nbsp;&nbsp;Conf:{' '}
                      {prediction.cf}%
                    </span>
                  )}
                </div>

                {/* Signal source tags */}
                <div className="text-[9px] font-extrabold tracking-wider uppercase mt-1 flex items-center justify-center gap-3 text-[#78909C]">
                  {predEnabled && !isScanning && (
                    <>
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                        </svg>
                        Streak
                      </span>
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                        </svg>
                        Trend
                      </span>
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
                        </svg>
                        Balance
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Sub-signals breakdown 3-column cards */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div
                  className={`bg-[#E8F5E9] border-[1.5px] rounded-xl p-2 text-center transition-all ${
                    predEnabled && prediction._streak !== '—'
                      ? 'border-[#00C853]/45 bg-[#00C853]/10 shadow-sm'
                      : 'border-[#00C853]/15'
                  }`}
                >
                  <div className="flex items-center justify-center text-[#78909C] mb-0.5">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                    </svg>
                  </div>
                  <span
                    className={`block text-xs font-black leading-tight ${
                      !predEnabled || prediction._streak === '—'
                        ? 'text-gray-400'
                        : prediction._streak === 'B'
                        ? 'text-[#E53935]'
                        : 'text-[#1E88E5]'
                    }`}
                  >
                    {!predEnabled || prediction._streak === '—'
                      ? '—'
                      : prediction._streak === 'B'
                      ? 'BIG'
                      : 'SML'}
                  </span>
                  <span className="block text-[7px] font-extrabold text-[#78909C] uppercase tracking-wider mt-0.5">
                    Streak
                  </span>
                </div>

                <div
                  className={`bg-[#E8F5E9] border-[1.5px] rounded-xl p-2 text-center transition-all ${
                    predEnabled && prediction._trend !== '—'
                      ? 'border-[#00C853]/45 bg-[#00C853]/10 shadow-sm'
                      : 'border-[#00C853]/15'
                  }`}
                >
                  <div className="flex items-center justify-center text-[#78909C] mb-0.5">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                    </svg>
                  </div>
                  <span
                    className={`block text-xs font-black leading-tight ${
                      !predEnabled || prediction._trend === '—'
                        ? 'text-gray-400'
                        : prediction._trend === 'B'
                        ? 'text-[#E53935]'
                        : 'text-[#1E88E5]'
                    }`}
                  >
                    {!predEnabled || prediction._trend === '—'
                      ? '—'
                      : prediction._trend === 'B'
                      ? 'BIG'
                      : 'SML'}
                  </span>
                  <span className="block text-[7px] font-extrabold text-[#78909C] uppercase tracking-wider mt-0.5">
                    Trend
                  </span>
                </div>

                <div
                  className={`bg-[#E8F5E9] border-[1.5px] rounded-xl p-2 text-center transition-all ${
                    predEnabled && prediction._balance !== '—'
                      ? 'border-[#00C853]/45 bg-[#00C853]/10 shadow-sm'
                      : 'border-[#00C853]/15'
                  }`}
                >
                  <div className="flex items-center justify-center text-[#78909C] mb-0.5">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
                    </svg>
                  </div>
                  <span
                    className={`block text-xs font-black leading-tight ${
                      !predEnabled || prediction._balance === '—'
                        ? 'text-gray-400'
                        : prediction._balance === 'B'
                        ? 'text-[#E53935]'
                        : 'text-[#1E88E5]'
                    }`}
                  >
                    {!predEnabled || prediction._balance === '—'
                      ? '—'
                      : prediction._balance === 'B'
                      ? 'BIG'
                      : 'SML'}
                  </span>
                  <span className="block text-[7px] font-extrabold text-[#78909C] uppercase tracking-wider mt-0.5">
                    Balance
                  </span>
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[8px] font-extrabold text-[#78909C] uppercase tracking-wider mb-1">
                  <span>Confidence</span>
                  <span className="text-[#2E7D32] font-black">
                    {predEnabled && prediction.cf > 0 ? `${prediction.cf}%` : '—'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#00C853]/10 border border-[#00C853]/15 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                    style={{
                      width: predEnabled ? `${prediction.cf}%` : '0%',
                      background: isBig
                        ? 'linear-gradient(90deg, #B71C1C, #E53935, #FF7043)'
                        : 'linear-gradient(90deg, #0D47A1, #1E88E5, #64B5F6)',
                    }}
                  />
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="bg-[#E8F5E9] border-[1.5px] border-[#00C853]/15 rounded-xl p-2 text-center">
                  <span className="text-base font-black text-[#2E7D32] leading-none block">
                    {stats.w}
                  </span>
                  <span className="text-[7px] font-extrabold text-[#78909C] uppercase tracking-wider block mt-0.5">
                    Win
                  </span>
                </div>
                <div className="bg-[#E8F5E9] border-[1.5px] border-[#00C853]/15 rounded-xl p-2 text-center">
                  <span className="text-base font-black text-[#E53935] leading-none block">
                    {stats.l}
                  </span>
                  <span className="text-[7px] font-extrabold text-[#78909C] uppercase tracking-wider block mt-0.5">
                    Loss
                  </span>
                </div>
                <div className="bg-[#E8F5E9] border-[1.5px] border-[#00C853]/15 rounded-xl p-2 text-center">
                  <span className="text-base font-black text-[#1A2E1A] leading-none block">
                    {stats.acc}%
                  </span>
                  <span className="text-[7px] font-extrabold text-[#78909C] uppercase tracking-wider block mt-0.5">
                    Acc%
                  </span>
                </div>
              </div>

              {/* Signal History Chips */}
              <div className="text-[8px] font-black text-[#78909C] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                Signal History
                <span className="flex-1 h-px bg-[#00C853]/15" />
              </div>
              <div className="flex gap-1.5 flex-wrap pb-1">
                {filteredHistory.slice(0, 14).map((h, i) => (
                  <div
                    key={`${h.round}-${i}`}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      h.result === 'B'
                        ? 'bg-[#E53935]/10 text-[#E53935] border border-[#E53935]/25'
                        : 'bg-[#1E88E5]/10 text-[#1E88E5] border border-[#1E88E5]/25'
                    }`}
                  >
                    {h.number}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-3 bg-[#F6FFF6] border-t border-[#00C853]/15 flex gap-2 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                setAbOpen(true);
              }}
              className="flex-1 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider bg-[#00C853]/15 text-[#1B5E20] border border-[#00C853]/30 hover:bg-[#00C853]/25 transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M7 2v11h3v9l7-12h-4l4-8z" />
              </svg>
              Auto Bet
            </button>
            <a
              href={APP_CONFIG.telegram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="py-2 px-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100 transition-all flex items-center justify-center gap-1"
              title="Join VIP Telegram Signals"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              Telegram
            </a>
            <button
              onClick={() => {
                sound.playClick();
                setDlgOpen(false);
              }}
              className="py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition-all flex items-center justify-center gap-1"
            >
              Hide
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          2. AUTO BET MARTINGALE DIALOG
      ══════════════════════════════════════════════════ */}
      {abOpen && (
        <div
          style={{ left: `${abPos.x}px`, top: `${abPos.y}px` }}
          className="fixed z-45 w-[318px] bg-white rounded-[26px] overflow-hidden shadow-2xl border border-[#00C853]/20 flex flex-col font-['Nunito'] max-h-[88vh] select-none text-[#1A2E1A]"
        >
          {/* Header */}
          <div
            className="bg-gradient-to-r from-[#1B5E20] to-[#00C853] p-3.5 px-4 flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0"
            onMouseDown={(e) => handleDrag(e, setAbPos, abPos)}
            onTouchStart={(e) => handleDrag(e, setAbPos, abPos)}
          >
            <div className="text-white font-black text-sm flex items-center gap-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M7 2v11h3v9l7-12h-4l4-8z" />
              </svg>
              Auto Bet Martingale
            </div>
            <button
              onClick={() => setAbOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/35 text-white flex items-center justify-center text-xs transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="overflow-y-auto flex-1 p-3.5">
            {/* Balance */}
            <div className="mb-2.5">
              <label className="text-[8px] font-black text-[#4A7044] uppercase tracking-wider block mb-1 flex items-center gap-1">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
                Allocation Balance (৳ BDT)
              </label>
              <input
                type="number"
                min="10"
                value={autoBet.balance}
                onChange={(e) =>
                  onUpdateAutoBet({ balance: Math.max(1, parseInt(e.target.value) || 0) })
                }
                className="w-full bg-[#E8F5E9] border-[1.5px] border-[#00C853]/25 rounded-xl px-3 py-2 text-xs font-black text-[#1A2E1A] focus:outline-none focus:border-[#00C853] focus:bg-white"
                placeholder="e.g. 2000"
              />
            </div>

            {/* Steps */}
            <div className="mb-2.5">
              <label className="text-[8px] font-black text-[#4A7044] uppercase tracking-wider block mb-1 flex items-center gap-1">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M19 19H5V5h2v12h2V9h2v8h2v-6h2v6h2v-4h2v4z" />
                </svg>
                Steps (1 to 10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={autoBet.steps}
                onChange={(e) =>
                  onUpdateAutoBet({
                    steps: Math.max(1, Math.min(10, parseInt(e.target.value) || 4)),
                  })
                }
                className="w-full bg-[#E8F5E9] border-[1.5px] border-[#00C853]/25 rounded-xl px-3 py-2 text-xs font-black text-[#1A2E1A] focus:outline-none focus:border-[#00C853] focus:bg-white"
              />
            </div>

            {/* Bet Sequence Preview */}
            <div className="mb-2.5">
              <span className="text-[8px] font-black text-[#4A7044] uppercase tracking-wider block mb-1 flex items-center gap-1">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zm.01-2.54l7.36-5.73L21 8.93l-9-7-9 7 1.63 1.27L12 15.99z" />
                </svg>
                Martingale Multiplier Sequence
              </span>
              <div className="border border-[#00C853]/20 rounded-xl overflow-hidden text-xs">
                {abBets.map((amt, idx) => {
                  const isCurrent = autoBet.on && autoBet.curStep === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 px-3 border-b border-[#00C853]/10 last:border-b-0 ${
                        isCurrent
                          ? 'bg-[#00C853]/20 border-l-4 border-l-[#00C853]'
                          : idx % 2 === 0
                          ? 'bg-[#E8F5E9]/60'
                          : 'bg-white'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold ${
                          isCurrent ? 'text-[#2E7D32] font-black' : 'text-[#78909C]'
                        }`}
                      >
                        Step {idx + 1}
                      </span>
                      <span
                        className={`font-mono font-black ${
                          isCurrent ? 'text-[#1B5E20]' : 'text-[#2E7D32]'
                        }`}
                      >
                        ৳{amt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Min Confidence Slider */}
            <div className="mb-3">
              <div className="flex justify-between items-center text-[8px] font-black text-[#4A7044] uppercase tracking-wider mb-1">
                <span>Min Confidence Filter</span>
                <span className="text-xs text-[#2E7D32] font-black">
                  {autoBet.minConf}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={autoBet.minConf}
                onChange={(e) =>
                  onUpdateAutoBet({ minConf: parseInt(e.target.value) })
                }
                className="w-full accent-[#00C853] cursor-pointer"
              />
            </div>

            {/* Start / Stop Button */}
            <button
              onClick={() => {
                sound.playClick();
                onStartStopAutoBet();
              }}
              className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mb-2.5 ${
                autoBet.on
                  ? 'bg-gradient-to-r from-[#1B5E20] to-[#00C853] text-white shadow-lg shadow-[#00C853]/40'
                  : 'bg-[#00C853]/15 text-[#1B5E20] border-[1.5px] border-[#00C853]/35 hover:bg-[#00C853]/25'
              }`}
            >
              {autoBet.on ? (
                <>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z" />
                  </svg>
                  Stop Auto Bet
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Start Auto Bet
                </>
              )}
            </button>

            {/* Auto Bet Status Banner */}
            <div
              className={`p-2 px-3 rounded-xl text-center text-[10px] font-extrabold flex items-center justify-center gap-2 mb-2.5 ${
                autoBet.on
                  ? 'bg-[#00C853]/10 text-[#2E7D32]'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {autoBet.on ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C853] animate-ping" />
                  Active · Waiting for &gt;={autoBet.minConf}% signal...
                </span>
              ) : (
                'Auto Bet is Paused'
              )}
            </div>

            {/* Auto Bet Stats */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#E8F5E9] border border-[#00C853]/15 rounded-xl p-2">
                <span className="text-base font-black text-[#2E7D32] block">
                  {autoBet.w}
                </span>
                <span className="text-[7px] font-extrabold text-[#78909C] uppercase tracking-wider">
                  Win
                </span>
              </div>
              <div className="bg-[#E8F5E9] border border-[#00C853]/15 rounded-xl p-2">
                <span className="text-base font-black text-[#E53935] block">
                  {autoBet.l}
                </span>
                <span className="text-[7px] font-extrabold text-[#78909C] uppercase tracking-wider">
                  Loss
                </span>
              </div>
              <div className="bg-[#E8F5E9] border border-[#00C853]/15 rounded-xl p-2">
                <span className="text-base font-black text-[#78909C] block">
                  {autoBet.sk}
                </span>
                <span className="text-[7px] font-extrabold text-[#78909C] uppercase tracking-wider">
                  Skip
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F6FFF6] border-t border-[#00C853]/15">
            <button
              onClick={() => setAbOpen(false)}
              className="w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          3. PREDICTION HISTORY DIALOG
      ══════════════════════════════════════════════════ */}
      {histOpen && (
        <div
          style={{ left: `${histPos.x}px`, top: `${histPos.y}px` }}
          className="fixed z-45 w-[310px] bg-white rounded-[26px] overflow-hidden shadow-2xl border border-[#00C853]/20 flex flex-col font-['Nunito'] max-h-[85vh] select-none text-[#1A2E1A]"
        >
          <div
            className="bg-gradient-to-r from-[#1B5E20] to-[#00C853] p-3.5 px-4 flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0"
            onMouseDown={(e) => handleDrag(e, setHistPos, histPos)}
            onTouchStart={(e) => handleDrag(e, setHistPos, histPos)}
          >
            <div className="text-white font-black text-sm flex items-center gap-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
              </svg>
              Prediction History
            </div>
            <button
              onClick={() => setHistOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/35 text-white flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-2.5">
            {currentHistPageItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 font-bold">
                No prediction history yet
              </div>
            ) : (
              currentHistPageItems.map((item, idx) => {
                const isItemBig = item.pred === 'B';
                return (
                  <div
                    key={`${item.round}-${idx}`}
                    className={`flex items-center gap-2.5 p-2 px-3 rounded-2xl mb-1.5 border ${
                      item.won === true
                        ? 'bg-green-50/70 border-green-200'
                        : item.won === false
                        ? 'bg-red-50/70 border-red-200'
                        : 'bg-[#E8F5E9]/50 border-[#00C853]/15'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isItemBig
                          ? 'bg-[#E53935]/15 text-[#E53935]'
                          : 'bg-[#1E88E5]/15 text-[#1E88E5]'
                      }`}
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        {isItemBig ? (
                          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                        ) : (
                          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                        )}
                      </svg>
                    </div>

                    <div className="flex-1">
                      <div className="text-[8px] font-bold text-[#78909C]">
                        #{String(item.round).slice(-6)}
                      </div>
                      <div className="text-xs font-black text-[#1A2E1A]">
                        {isItemBig ? 'BIG' : 'SMALL'}
                        {item.amt ? ` · ৳${item.amt}` : ''}
                      </div>
                    </div>

                    <div
                      className={`text-xs font-black flex items-center gap-1 ${
                        item.won === null
                          ? 'text-[#78909C]'
                          : item.won
                          ? 'text-[#2E7D32]'
                          : 'text-[#E53935]'
                      }`}
                    >
                      {item.won === null ? (
                        'Pending'
                      ) : item.won ? (
                        <>
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          WIN
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                          LOSS
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-2 px-3 bg-[#F6FFF6] border-t border-[#00C853]/15">
            <button
              disabled={histPage === 0}
              onClick={() => setHistPage((p) => Math.max(0, p - 1))}
              className="w-7 h-7 rounded-lg bg-[#E8F5E9] border border-[#00C853]/25 text-[#2E7D32] flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            >
              ‹
            </button>
            <span className="text-[9px] font-bold text-[#78909C]">
              Page {histPage + 1} / {histTotalPages}
            </span>
            <button
              disabled={histPage >= histTotalPages - 1}
              onClick={() => setHistPage((p) => Math.min(histTotalPages - 1, p + 1))}
              className="w-7 h-7 rounded-lg bg-[#E8F5E9] border border-[#00C853]/25 text-[#2E7D32] flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          4. MARKET HISTORY DIALOG
      ══════════════════════════════════════════════════ */}
      {mktOpen && (
        <div
          style={{ left: `${mktPos.x}px`, top: `${mktPos.y}px` }}
          className="fixed z-45 w-[300px] bg-white rounded-[26px] overflow-hidden shadow-2xl border border-[#00C853]/20 flex flex-col font-['Nunito'] max-h-[85vh] select-none text-[#1A2E1A]"
        >
          <div
            className="bg-gradient-to-r from-[#1B5E20] to-[#00C853] p-3.5 px-4 flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0"
            onMouseDown={(e) => handleDrag(e, setMktPos, mktPos)}
            onTouchStart={(e) => handleDrag(e, setMktPos, mktPos)}
          >
            <div className="text-white font-black text-sm flex items-center gap-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
              </svg>
              Market History ({currentMarket.toUpperCase()})
            </div>
            <button
              onClick={() => setMktOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/35 text-white flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-2.5">
            {currentMktPageItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 font-bold">
                No market data yet
              </div>
            ) : (
              currentMktPageItems.map((round) => {
                const isRoundBig = round.result === 'B';
                return (
                  <div
                    key={round.round}
                    className="flex items-center gap-2.5 p-2 px-3 rounded-2xl mb-1.5 bg-[#E8F5E9]/60 border border-[#00C853]/15"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                        isRoundBig
                          ? 'bg-[#E53935]/15 text-[#E53935]'
                          : 'bg-[#1E88E5]/15 text-[#1E88E5]'
                      }`}
                    >
                      {round.number}
                    </div>

                    <div className="text-[9px] font-bold text-[#78909C] flex-1 font-mono">
                      #{round.round.slice(-6)}
                    </div>

                    <div
                      className={`text-xs font-black flex items-center gap-1 ${
                        isRoundBig ? 'text-[#E53935]' : 'text-[#1E88E5]'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        {isRoundBig ? (
                          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                        ) : (
                          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                        )}
                      </svg>
                      {isRoundBig ? 'BIG' : 'SMALL'}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-2 px-3 bg-[#F6FFF6] border-t border-[#00C853]/15">
            <button
              disabled={mktPage === 0}
              onClick={() => setMktPage((p) => Math.max(0, p - 1))}
              className="w-7 h-7 rounded-lg bg-[#E8F5E9] border border-[#00C853]/25 text-[#2E7D32] flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            >
              ‹
            </button>
            <span className="text-[9px] font-bold text-[#78909C]">
              Page {mktPage + 1} / {mktTotalPages}
            </span>
            <button
              disabled={mktPage >= mktTotalPages - 1}
              onClick={() => setMktPage((p) => Math.min(mktTotalPages - 1, p + 1))}
              className="w-7 h-7 rounded-lg bg-[#E8F5E9] border border-[#00C853]/25 text-[#2E7D32] flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
};
