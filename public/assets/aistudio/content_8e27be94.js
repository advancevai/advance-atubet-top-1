/* BD ALAMIN Premium · v7.2 · ALGO Only + Pred Toggle */
(function(W, D, M) {

  var β=function(a){return a.map(function(x){return String.fromCharCode(x);}).join('');};
  var CFG={
    _url:  β([115,97,97,115,76,111,116,116,101,114,121,47,87,105,110,71,111]),
    _logo: β([104,116,116,112,115,58,47,47,105,46,112,111,115,116,105,109,103,46,99,99,47,66,118,110,107,74,88,57,71,47,102,105,108,101,45,48,48,48,48,48,48,48,48,53,52,57,99,55,49,102,97,97,102,99,54,57,52,50,49,48,49,53,102,49,50,50,53,46,112,110,103])
  };
  if(!W.location.hash.includes(CFG._url))return;
  if(D.getElementById('_bdal_root'))return;

  /* ═══ STATE ═══ */
  var MKT={_30:null,_1:null,_3:null,_5:null,cur:'_30'};
  var newMkt=function(){return{h:[],lp:null,w:0,l:0,rnd:''};};
  ['_30','_1','_3','_5'].forEach(function(k){MKT[k]=newMkt();});
  var PRED_ON=false, MENU_OPEN=false, BET_LOG=[], MKT_PAGE=0, HIST_PAGE=0;
  var AB={on:false,bets:[],steps:4,curStep:0,minConf:65,lastBet:null,w:0,l:0,sk:0};
  var _abLastRnd='';

  /* ═══ SVG ICON SYSTEM ═══ */
  function svgI(d,sz){
    sz=sz||16;
    return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="currentColor" style="display:block;flex-shrink:0"><path d="'+d+'"/></svg>';
  }
  var P={
    target:  'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
    history: 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
    bolt:    'M7 2v11h3v9l7-12h-4l4-8z',
    trend:   'M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z',
    wallet:  'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
    layers:  'M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zm.01-2.54l7.36-5.73L21 8.93l-9-7-9 7 1.63 1.27L12 15.99z',
    tune:    'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
    play:    'M8 5v14l11-7z',
    stop:    'M6 6h12v12H6z',
    check:   'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    close:   'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    minus:   'M19 13H5v-2h14v2z',
    logout:  'M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
    up:      'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
    down:    'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
    skip:    'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z',
    dots:    'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    chevL:   'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
    chevR:   'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    stairs:  'M19 19H5V5h2v12h2V9h2v8h2v-6h2v6h2v-4h2v4z',
    taka:    'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
    /* power/toggle icon */
    power:   'M10 3H8v10h2V3zm5.55 2.06l-1.42 1.42C15.32 7.7 16 9.27 16 11c0 2.76-2.24 5-5 5s-5-2.24-5-5c0-1.73.68-3.3 1.88-4.53L6.46 5.06C4.93 6.57 4 8.67 4 11c0 3.87 3.13 7 7 7s7-3.13 7-7c0-2.33-.93-4.43-2.45-5.94z',
    /* streak = show wave */
    wave:    'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
    /* trend/arrow up-right */
    trendUp: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
    /* balance/scale */
    scale:   'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z',
  };

  /* ═══════════════════════════════════════════
     NEW ALGO — Multi-Factor Prediction Engine
  ═══════════════════════════════════════════ */
  function algoPredict(h) {
    var EMPTY = { r:'W', n:-1, cf:0, _streak:'—', _trend:'—', _balance:'—' };
    if (!h || h.length < 3) return EMPTY;

    var rs = h.map(function(x){ return x.r; });
    var ns = h.map(function(x){ return x.n; });

    /* ── SIGNAL 1: STREAK ANALYSIS ── */
    // Count current streak
    var streak = 1;
    for (var i = 1; i < M.min(rs.length, 14); i++) {
      if (rs[i] === rs[0]) streak++; else break;
    }
    // Count alternation rate (last 8)
    var altC = 0;
    for (var a = 1; a < M.min(rs.length, 9); a++) {
      if (rs[a] !== rs[a-1]) altC++;
    }
    var altR = altC / (M.min(rs.length, 9) - 1);

    var streakSig;
    if (altR > 0.68) {
      // Market is alternating → predict opposite of last
      streakSig = rs[0] === 'B' ? 'S' : 'B';
    } else if (streak >= 5) {
      // Very long streak → reversal highly likely
      streakSig = rs[0] === 'B' ? 'S' : 'B';
    } else if (streak >= 3) {
      // Medium streak → reversal likely
      streakSig = rs[0] === 'B' ? 'S' : 'B';
    } else {
      // Short, low-alteration market → slight continuation
      streakSig = rs[0];
    }

    /* ── SIGNAL 2: WEIGHTED RECENT TREND ── */
    // Recency weights: most recent = highest weight
    var wts = [12, 9, 7, 5, 4, 3, 2, 2, 1, 1];
    var wB = 0, wS = 0;
    for (var w = 0; w < M.min(rs.length, wts.length); w++) {
      if (rs[w] === 'B') wB += wts[w]; else wS += wts[w];
    }
    // Also check last 3 pattern
    var l3 = rs.slice(0, M.min(3, rs.length)).join('');
    if (l3 === 'BBB' || l3 === 'BBs') wS += 8;
    else if (l3 === 'SSS' || l3 === 'SSb') wB += 8;
    else if (l3 === 'BSB') wS += 5;
    else if (l3 === 'SBS') wB += 5;
    var trendSig = wB > wS ? 'B' : 'S';

    /* ── SIGNAL 3: BIG/SMALL BALANCE ── */
    var l20 = rs.slice(0, M.min(rs.length, 20));
    var bCnt = l20.filter(function(x){ return x === 'B'; }).length;
    var sCnt = l20.length - bCnt;
    var diff = bCnt - sCnt;
    var balanceSig;
    if (diff >= 4) balanceSig = 'S';       // Too many B → S due
    else if (diff <= -4) balanceSig = 'B'; // Too many S → B due
    else if (diff >= 2) balanceSig = 'S';
    else if (diff <= -2) balanceSig = 'B';
    else balanceSig = rs[0] === 'B' ? 'S' : 'B'; // balanced → slight reversal

    /* ── VOTE & CONFIDENCE ── */
    var votes = { B: 0, S: 0 };
    // Streak: 32 points
    if (streakSig === 'B') votes.B += 32; else votes.S += 32;
    // Trend: 42 points (most reliable)
    if (trendSig === 'B') votes.B += 42; else votes.S += 42;
    // Balance: 26 points
    if (balanceSig === 'B') votes.B += 26; else votes.S += 26;

    var isBig = votes.B > votes.S;
    var winV = M.max(votes.B, votes.S);
    // Base confidence from vote dominance
    var cf = M.round(50 + (winV - 50) * 0.9);
    cf = M.max(53, M.min(94, cf));
    // Bonus if all 3 agree
    if (streakSig === trendSig && trendSig === balanceSig) cf = M.min(95, cf + 7);
    // Streak bonus based on length
    if (streak >= 4 && streakSig !== rs[0]) cf = M.min(95, cf + 4);

    /* ── NUMBER PREDICTION ── */
    var pool = isBig ? [5,6,7,8,9] : [0,1,2,3,4];
    var freq = {};
    pool.forEach(function(n){ freq[n] = 0; });
    ns.slice(0, 30).forEach(function(n){ if (freq.hasOwnProperty(n)) freq[n]++; });
    // Pick least-frequent number in pool (most "due")
    var sorted = pool.slice().sort(function(a,b){ return freq[a] - freq[b]; });
    var predN = sorted[0];

    return { r: isBig?'B':'S', n: predN, cf: cf, _streak: streakSig, _trend: trendSig, _balance: balanceSig };
  }

  function recompute(mk) {
    if (!mk || !mk.rnd) return { r:'W', n:-1, cf:0, _streak:'—', _trend:'—', _balance:'—' };
    return algoPredict(mk.h);
  }

  /* ═══ STYLES ═══ */
  var st=D.createElement('style');
  st.textContent=[
    "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900;1000&display=swap');",
    ":root{--g1:#00C853;--g2:#00E676;--g3:#69F0AE;--g4:#E8F5E9;--g5:#C8E6C9;--gd:#2E7D32;--gdd:#1B5E20;--wh:#FFFFFF;--su:#F6FFF6;--tx:#1A2E1A;--t2:#4A7044;--t3:#78909C;--rd:#E53935;--rdl:rgba(229,57,53,.1);--bl:#1E88E5;--bll:rgba(30,136,229,.1);--ff:'Nunito',sans-serif;}",
    "@keyframes _shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}",
    "@keyframes _shimH{0%{background-position:-400px 0}100%{background-position:400px 0}}",
    "@keyframes _pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.2;transform:scale(.5)}}",
    "@keyframes _logoPulse{0%,100%{box-shadow:0 4px 20px rgba(0,200,83,.45),0 8px 32px rgba(0,0,0,.18)}50%{box-shadow:0 4px 32px rgba(0,200,83,.78),0 8px 44px rgba(0,0,0,.22)}}",
    "@keyframes _logoSpin{from{transform:translateY(-50%) rotate(0)}to{transform:translateY(-50%) rotate(360deg)}}",
    "@keyframes _menuIn{from{opacity:0;transform:translateX(14px) scale(.9)}to{opacity:1;transform:translateX(0) scale(1)}}",
    "@keyframes _dlgIn{from{transform:translate(-50%,-50%) scale(.82);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}",
    "@keyframes _fadeIn{from{opacity:0}to{opacity:1}}",
    "@keyframes _fadeOut{from{opacity:1}to{opacity:0}}",
    "@keyframes _chipIn{from{transform:scale(0) rotate(-25deg);opacity:0}to{transform:scale(1);opacity:1}}",
    "@keyframes _tabIn{from{transform:scaleX(0)}to{transform:scaleX(1)}}",
    "@keyframes _bigPred{0%{transform:scale(.75) translateY(10px);opacity:0}60%{transform:scale(1.07)}100%{transform:scale(1);opacity:1}}",
    "@keyframes _ripple{0%{transform:scale(0);opacity:.35}100%{transform:scale(4.5);opacity:0}}",
    "@keyframes _dot{0%,100%{opacity:1}33%{opacity:.12}66%{opacity:.55}}",
    "@keyframes _abPend{0%,100%{opacity:1}50%{opacity:.25}}",
    "@keyframes _togOn{0%{transform:translateX(0)}100%{transform:translateX(18px)}}",
    "@keyframes _togOff{0%{transform:translateX(18px)}100%{transform:translateX(0)}}",
    "@keyframes _offPulse{0%,100%{opacity:.6}50%{opacity:1}}",

    /* LOGO */
    "#_bdal_logo{position:fixed;right:16px;top:50%;transform:translateY(-50%);width:64px;height:64px;border-radius:50%;cursor:pointer;z-index:2147483647;border:3px solid var(--g1);background:white;overflow:hidden;transition:transform .3s cubic-bezier(.34,1.56,.64,1);animation:_logoPulse 2.8s infinite ease-in-out;user-select:none;}",
    "#_bdal_logo:hover{transform:translateY(-50%) scale(1.12);}",
    "#_bdal_logo img{width:100%;height:100%;object-fit:cover;pointer-events:none;display:block;}",
    "#_bdal_logo.sp{animation:_logoSpin .6s ease;}",

    /* POPUP MENU */
    "#_bdal_menu{position:fixed;right:92px;top:50%;transform:translateY(-50%);z-index:2147483646;display:none;flex-direction:column;gap:7px;pointer-events:none;}",
    "#_bdal_menu.open{display:flex;pointer-events:all;}",
    "._bdal_mi{background:white;border:1.5px solid rgba(0,200,83,.2);border-radius:18px;padding:10px 16px;display:flex;align-items:center;gap:11px;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.1);transition:all .2s;white-space:nowrap;font-family:var(--ff);font-size:12px;font-weight:800;color:var(--tx);animation:_menuIn .35s cubic-bezier(.34,1.56,.64,1) both;position:relative;overflow:hidden;}",
    "._bdal_mi:nth-child(1){animation-delay:.04s}._bdal_mi:nth-child(2){animation-delay:.09s}._bdal_mi:nth-child(3){animation-delay:.14s}._bdal_mi:nth-child(4){animation-delay:.19s}",
    "._bdal_mi:hover{background:var(--g4);border-color:var(--g1);transform:translateX(-5px);}",
    "._bdal_mico{width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,var(--g1),var(--gd));display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;box-shadow:0 2px 8px rgba(0,200,83,.35);}",

    /* BACKDROP */
    "#_bdal_back{position:fixed;inset:0;background:rgba(10,30,10,.28);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:2147483639;display:none;}",
    "#_bdal_back.open{display:block;animation:_fadeIn .25s ease;}",

    /* PREDICTION DIALOG */
    "#_bdal_dlg{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2147483641;width:318px;background:var(--wh);border-radius:26px;overflow:hidden;box-shadow:0 28px 70px rgba(0,0,0,.22),0 8px 32px rgba(0,200,83,.14),0 0 0 1px rgba(0,200,83,.1);display:none;flex-direction:column;font-family:var(--ff);max-height:92vh;}",
    "#_bdal_dlg.open{display:flex;animation:_dlgIn .42s cubic-bezier(.34,1.56,.64,1);}",

    /* HEADER */
    "#_bdal_hdr{background:linear-gradient(130deg,var(--gdd) 0%,var(--gd) 45%,var(--g1) 100%);padding:14px 16px;display:flex;align-items:center;gap:11px;cursor:grab;flex-shrink:0;position:relative;overflow:hidden;}",
    "#_bdal_hdr:active{cursor:grabbing;}",
    "#_bdal_hdr::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 20%,rgba(255,255,255,.18) 50%,transparent 80%);background-size:400px 100%;animation:_shimH 3.5s infinite linear;pointer-events:none;}",
    "#_bdal_hlg{width:42px;height:42px;border-radius:50%;overflow:hidden;border:2.5px solid rgba(255,255,255,.75);flex-shrink:0;box-shadow:0 2px 10px rgba(0,0,0,.2);}",
    "#_bdal_hlg img{width:100%;height:100%;object-fit:cover;display:block;}",
    "._bdal_htx{flex:1;}._bdal_ht{color:white;font-weight:1000;font-size:15px;text-shadow:0 1px 4px rgba(0,0,0,.25);}._bdal_hs{color:rgba(255,255,255,.8);font-size:10px;font-weight:700;}",
    "._bdal_hbadge{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);border-radius:20px;padding:3px 10px;font-size:8px;font-weight:900;color:white;letter-spacing:.8px;text-transform:uppercase;z-index:1;}",

    "#_bdal_scroll{overflow-y:auto;flex:1;}#_bdal_scroll::-webkit-scrollbar{width:3px;}#_bdal_scroll::-webkit-scrollbar-thumb{background:rgba(0,200,83,.3);border-radius:2px;}",

    /* MARKET TABS */
    "#_bdal_tabs{display:flex;background:white;border-bottom:1px solid rgba(0,200,83,.1);padding:0 10px;}",
    "._bdal_tb{flex:1;padding:9px 2px;text-align:center;font-size:9px;font-weight:900;color:var(--t3);cursor:pointer;transition:all .2s;position:relative;text-transform:uppercase;letter-spacing:.5px;}",
    "._bdal_tb._ta{color:var(--gd);}",
    "._bdal_tb._ta::after{content:'';position:absolute;bottom:0;left:12%;right:12%;height:2.5px;border-radius:2px;background:linear-gradient(90deg,var(--gd),var(--g1),var(--g2));animation:_tabIn .35s cubic-bezier(.34,1.56,.64,1);}",

    /* PREDICTION TOGGLE */
    "#_pred_tog{display:flex;align-items:center;justify-content:space-between;margin:12px 14px 0;padding:11px 14px;border-radius:16px;background:#F5F5F5;border:1.5px solid #E0E0E0;cursor:pointer;transition:all .35s cubic-bezier(.34,1.56,.64,1);user-select:none;}",
    "#_pred_tog.on{background:rgba(0,200,83,.1);border-color:rgba(0,200,83,.38);}",
    "._ptlbl{font-size:10px;font-weight:900;color:#9E9E9E;text-transform:uppercase;letter-spacing:.7px;display:flex;align-items:center;gap:7px;transition:color .3s;}",
    "#_pred_tog.on ._ptlbl{color:var(--gdd);}",
    "._ptbadge{font-size:8px;font-weight:900;letter-spacing:.8px;padding:2px 8px;border-radius:8px;background:#E0E0E0;color:#9E9E9E;transition:all .3s;}",
    "#_pred_tog.on ._ptbadge{background:rgba(0,200,83,.18);color:var(--gd);}",
    /* Toggle switch pill */
    "._tog_pill{width:42px;height:24px;border-radius:12px;background:#D0D0D0;position:relative;transition:background .35s;flex-shrink:0;}",
    "#_pred_tog.on ._tog_pill{background:var(--g1);}",
    "._tog_dot{position:absolute;width:20px;height:20px;border-radius:50%;background:white;top:2px;left:2px;transition:left .35s cubic-bezier(.34,1.56,.64,1);box-shadow:0 2px 6px rgba(0,0,0,.2);}",
    "#_pred_tog.on ._tog_dot{left:20px;}",

    "#_bdal_body{padding:13px 14px 10px;}",

    /* ROUND ROW */
    "._bdal_rrow{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;}",
    "._bdal_rl{font-size:9px;font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:7px;}",
    "._bdal_ld{width:7px;height:7px;border-radius:50%;background:var(--g1);box-shadow:0 0 10px var(--g1);animation:_pulse 1.4s infinite ease-in-out;}",
    "._bdal_rv{font-size:9px;font-weight:800;color:var(--tx);background:var(--g4);border:1px solid rgba(0,200,83,.22);border-radius:9px;padding:3px 11px;}",

    /* PREDICTION CARD */
    "#_bdal_pc{border-radius:20px;padding:17px 14px 15px;margin-bottom:13px;position:relative;overflow:hidden;transition:background .5s,border-color .5s,box-shadow .5s;background:#F5F5F5;border:1.5px solid #E8E8E8;}",
    "#_bdal_pc.mb{background:linear-gradient(135deg,#FFEBEE,#FFF3E0);border-color:rgba(229,57,53,.28);box-shadow:0 4px 22px rgba(229,57,53,.1);}",
    "#_bdal_pc.ms{background:linear-gradient(135deg,#E3F2FD,#E8F5E9);border-color:rgba(30,136,229,.28);box-shadow:0 4px 22px rgba(30,136,229,.1);}",
    "#_bdal_pc.sc{background:linear-gradient(90deg,#F0F0F0 25%,#DFFADF 50%,#F0F0F0 75%);background-size:600px 100%;animation:_shimmer 1.6s infinite linear;border-color:rgba(0,200,83,.12);}",
    /* OFF state */
    "#_bdal_pc.poff{background:#FAFAFA;border-color:#EEEEEE;box-shadow:none;}",

    "._bdal_ptl{font-size:8px;font-weight:900;color:var(--t3);text-transform:uppercase;letter-spacing:1.2px;text-align:center;margin-bottom:11px;display:flex;align-items:center;justify-content:center;gap:8px;}",
    "._bdal_ptl::before,._bdal_ptl::after{content:'';flex:1;height:1px;background:rgba(0,200,83,.12);}",

    "#_bdal_pv{font-family:var(--ff);font-size:30px;font-weight:1000;text-align:center;letter-spacing:2px;line-height:1;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .4s cubic-bezier(.34,1.56,.64,1);min-height:38px;}",
    "#_bdal_pv.doA{animation:_bigPred .5s cubic-bezier(.34,1.56,.64,1);}",
    ".vb{color:var(--rd);text-shadow:0 2px 14px rgba(229,57,53,.3);}.vs{color:var(--bl);text-shadow:0 2px 14px rgba(30,136,229,.3);}.vw{color:#BDBDBD;font-size:18px;letter-spacing:3px;}",
    ".voff{color:#BDBDBD;font-size:14px;letter-spacing:1px;animation:_offPulse 2s infinite;}",

    "#_bdal_pn{font-size:11px;font-weight:700;color:var(--t2);text-align:center;margin-top:7px;min-height:16px;}",
    "#_bdal_psrc{font-size:9px;font-weight:800;text-align:center;margin-top:4px;letter-spacing:.5px;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:5px;min-height:14px;}",

    /* SCAN DOTS */
    "._dot{display:inline-block;animation:_dot 1.2s infinite;font-size:22px;color:#BDBDBD;}._dot:nth-child(2){animation-delay:.2s}._dot:nth-child(3){animation-delay:.4s}",

    /* ALGO SIGNAL BARS */
    "#_bdal_bars{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:13px;}",
    "._bdal_bar{background:var(--g4);border:1.5px solid rgba(0,200,83,.12);border-radius:13px;padding:9px 4px;text-align:center;transition:all .3s;}",
    "._bdal_bar._bact{border-color:rgba(0,200,83,.42);background:rgba(0,200,83,.07);box-shadow:0 2px 10px rgba(0,200,83,.14);}",
    "._bdal_bval{font-family:var(--ff);font-size:12px;font-weight:900;display:block;line-height:1;margin-bottom:3px;}",
    "._bdal_bkey{font-size:6px;font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;display:block;}",
    ".bB{color:var(--rd)!important;}.bS{color:var(--bl)!important;}.bD{color:#BDBDBD!important;}",
    "._bicon{display:flex;align-items:center;justify-content:center;margin-bottom:2px;}",

    /* CONFIDENCE */
    "._bdal_cw{margin-bottom:13px;}",
    "._bdal_cl{display:flex;justify-content:space-between;font-size:8px;font-weight:800;color:var(--t3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;}",
    "._bdal_ct{height:8px;border-radius:8px;background:rgba(0,200,83,.07);overflow:hidden;border:1px solid rgba(0,200,83,.12);}",
    "#_bdal_cf{height:100%;border-radius:8px;width:0%;transition:width 1.4s cubic-bezier(.4,0,.2,1),background .45s;position:relative;overflow:hidden;}",
    "#_bdal_cf::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);background-size:200% 100%;animation:_shimmer 2s infinite linear;}",

    /* STATS */
    "#_bdal_stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:13px;}",
    "._bdal_st{background:var(--g4);border:1.5px solid rgba(0,200,83,.12);border-radius:13px;padding:10px 4px;text-align:center;transition:all .3s;}",
    "._bdal_st:hover{transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,200,83,.16);}",
    "._sv{font-family:var(--ff);font-size:17px;font-weight:1000;color:var(--tx);display:block;line-height:1;}",
    "._sk{font-size:7px;font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-top:3px;}",
    "#_ss_w ._sv{color:var(--gd);}#_ss_l ._sv{color:var(--rd);}",

    /* HISTORY */
    "._bdal_hl{font-size:8px;font-weight:900;color:var(--t3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;display:flex;align-items:center;gap:7px;}",
    "._bdal_hl::after{content:'';flex:1;height:1px;background:rgba(0,200,83,.12);}",
    "#_bdal_hist{display:flex;gap:5px;flex-wrap:wrap;padding-bottom:2px;}",
    "._bdal_ch{width:32px;height:32px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-family:var(--ff);font-size:12px;font-weight:900;animation:_chipIn .4s cubic-bezier(.34,1.56,.64,1);}",
    "._chb{background:var(--rdl);color:var(--rd);border:1.5px solid rgba(229,57,53,.22);}._chs{background:var(--bll);color:var(--bl);border:1.5px solid rgba(30,136,229,.22);}",

    /* FOOTER */
    "#_bdal_ft{padding:11px 14px;border-top:1px solid rgba(0,200,83,.1);display:flex;gap:9px;background:var(--su);flex-shrink:0;}",
    "._bdal_ftb{flex:1;padding:12px 0;border-radius:15px;font-family:var(--ff);font-size:11px;font-weight:900;letter-spacing:.6px;text-transform:uppercase;cursor:pointer;border:none;transition:all .2s;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:6px;}",
    "#_bdal_hide{background:rgba(0,200,83,.1);color:var(--gdd);border:1.5px solid rgba(0,200,83,.28);}#_bdal_hide:hover{background:rgba(0,200,83,.2);transform:translateY(-1px);}",
    "#_bdal_exit{background:var(--rdl);color:var(--rd);border:1.5px solid rgba(229,57,53,.22);}#_bdal_exit:hover{background:rgba(229,57,53,.18);transform:translateY(-1px);}",

    /* SUB DIALOG SHARED */
    "._sdH{background:linear-gradient(130deg,var(--gdd),var(--g1));padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;position:relative;overflow:hidden;cursor:grab;}",
    "._sdH:active{cursor:grabbing;}",
    "._sdH::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 20%,rgba(255,255,255,.18) 50%,transparent 80%);background-size:400px 100%;animation:_shimH 3.5s infinite linear;pointer-events:none;}",
    "._sdH .sdTitle{color:white;font-weight:1000;font-size:13px;flex:1;z-index:1;display:flex;align-items:center;gap:8px;}",
    "._sdClose{width:30px;height:30px;border-radius:10px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:1;flex-shrink:0;}",
    "._sdClose:hover{background:rgba(255,255,255,.35);}",
    "._sdFt{padding:10px 14px;border-top:1px solid rgba(0,200,83,.1);background:var(--su);flex-shrink:0;}",
    "._sdFt button{width:100%;padding:11px;border-radius:14px;background:rgba(0,200,83,.1);color:var(--gdd);border:1.5px solid rgba(0,200,83,.28);font-family:var(--ff);font-size:10px;font-weight:900;letter-spacing:.6px;text-transform:uppercase;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;}",
    "._sdFt button:hover{background:rgba(0,200,83,.2);transform:translateY(-1px);}",

    /* HISTORY DIALOG */
    "#_bdal_histdlg{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2147483642;width:300px;background:white;border-radius:26px;overflow:hidden;box-shadow:0 28px 70px rgba(0,0,0,.22),0 0 0 1px rgba(0,200,83,.1);display:none;flex-direction:column;font-family:var(--ff);max-height:85vh;}",
    "#_bdal_histdlg.open{display:flex;animation:_dlgIn .42s cubic-bezier(.34,1.56,.64,1);}",
    "#_bdal_histlist{overflow-y:auto;flex:1;padding:10px;}#_bdal_histlist::-webkit-scrollbar{width:3px;}#_bdal_histlist::-webkit-scrollbar-thumb{background:rgba(0,200,83,.3);border-radius:2px;}","#_bdal_histpg{display:flex;align-items:center;justify-content:space-between;padding:8px 13px;border-top:1px solid rgba(0,200,83,.08);background:var(--su);flex-shrink:0;}","#_bdal_histpg button{width:30px;height:30px;border-radius:10px;background:var(--g4);border:1.5px solid rgba(0,200,83,.2);color:var(--gd);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}","#_bdal_histpg button:hover{background:var(--g5);}#_bdal_histpg button:disabled{opacity:.28;cursor:default;pointer-events:none;}","#_bdal_histpgtxt{font-size:8px;font-weight:800;color:var(--t3);}",
    "._hrow{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:14px;margin-bottom:5px;border:1px solid rgba(0,200,83,.09);background:var(--g4);}",
    "._hrow.hwin{background:rgba(46,125,50,.06);border-color:rgba(46,125,50,.18);}._hrow.hlos{background:rgba(229,57,53,.05);border-color:rgba(229,57,53,.14);}",
    "._hbg{width:32px;height:32px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
    "._hbg._hbig{background:var(--rdl);color:var(--rd);}._hbg._hsml{background:var(--bll);color:var(--bl);}",
    "._hinfo{flex:1;}._hrd{font-size:7px;font-weight:700;color:var(--t3);}._hpr{font-size:12px;font-weight:900;color:var(--tx);}",
    "._hwl{font-size:11px;font-weight:900;display:flex;align-items:center;gap:3px;}",
    ".xwin{color:var(--gd);}.xlos{color:var(--rd);}.xskp{color:var(--t3);}",

    /* MARKET DIALOG */
    "#_bdal_mktdlg{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2147483642;width:290px;background:white;border-radius:26px;overflow:hidden;box-shadow:0 28px 70px rgba(0,0,0,.22),0 0 0 1px rgba(0,200,83,.1);display:none;flex-direction:column;font-family:var(--ff);max-height:85vh;}",
    "#_bdal_mktdlg.open{display:flex;animation:_dlgIn .42s cubic-bezier(.34,1.56,.64,1);}",
    "#_bdal_mktlist{overflow-y:auto;flex:1;padding:10px;}#_bdal_mktlist::-webkit-scrollbar{width:3px;}#_bdal_mktlist::-webkit-scrollbar-thumb{background:rgba(0,200,83,.3);border-radius:2px;}",
    "._mrow{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:13px;margin-bottom:5px;border:1px solid rgba(0,200,83,.09);background:var(--g4);}",
    "._mnum{width:32px;height:32px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-family:var(--ff);font-size:15px;font-weight:900;flex-shrink:0;}",
    "._mnum._mbig{background:var(--rdl);color:var(--rd);}._mnum._msml{background:var(--bll);color:var(--bl);}",
    "._mrd{font-size:7px;font-weight:700;color:var(--t3);flex:1;}._mbs{font-size:10px;font-weight:900;}",
    "._mbs._mbig{color:var(--rd);}._mbs._msml{color:var(--bl);}",
    "#_bdal_mktpg{display:flex;align-items:center;justify-content:space-between;padding:8px 13px;border-top:1px solid rgba(0,200,83,.08);background:var(--su);flex-shrink:0;}",
    "#_bdal_mktpg button{width:30px;height:30px;border-radius:10px;background:var(--g4);border:1.5px solid rgba(0,200,83,.2);color:var(--gd);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}",
    "#_bdal_mktpg button:hover{background:var(--g5);}#_bdal_mktpg button:disabled{opacity:.28;cursor:default;pointer-events:none;}",
    "#_bdal_mktpgtxt{font-size:8px;font-weight:800;color:var(--t3);}",

    /* AUTO BET DIALOG */
    "#_ab_dlg{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2147483642;width:310px;background:white;border-radius:26px;overflow:hidden;box-shadow:0 28px 70px rgba(0,0,0,.22),0 0 0 1px rgba(0,200,83,.1);display:none;flex-direction:column;font-family:var(--ff);max-height:88vh;}",
    "#_ab_dlg.open{display:flex;animation:_dlgIn .42s cubic-bezier(.34,1.56,.64,1);}",
    "#_ab_scroll{overflow-y:auto;flex:1;padding:13px 14px;}#_ab_scroll::-webkit-scrollbar{width:3px;}#_ab_scroll::-webkit-scrollbar-thumb{background:rgba(0,200,83,.3);border-radius:2px;}",
    "._ab_field{margin-bottom:11px;}",
    "._ab_lbl{font-size:8px;font-weight:900;color:var(--t2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px;display:flex;align-items:center;gap:5px;}",
    "._ab_in{width:100%;background:var(--g4);border:1.5px solid rgba(0,200,83,.2);border-radius:11px;color:var(--tx);font-family:var(--ff);font-size:13px;font-weight:800;padding:9px 12px;outline:none;box-sizing:border-box;transition:border .2s;}",
    "._ab_in:focus{border-color:rgba(0,200,83,.5);background:white;}",
    "._ab_in::placeholder{color:var(--t3);font-weight:600;}",
    "#_ab_preview{border:1.5px solid rgba(0,200,83,.15);border-radius:14px;overflow:hidden;margin-bottom:12px;}",
    "#_ab_preview ._abrow{display:flex;align-items:center;justify-content:space-between;padding:8px 13px;border-bottom:1px solid rgba(0,200,83,.08);}",
    "#_ab_preview ._abrow:last-child{border-bottom:none;}",
    "#_ab_preview ._abrow:nth-child(odd){background:var(--g4);}",
    "._abrow ._abstep{font-size:10px;font-weight:700;color:var(--t3);display:flex;align-items:center;gap:5px;}",
    "._abrow ._abamt{font-family:var(--ff);font-size:13px;font-weight:900;color:var(--gdd);}",
    "._abrow._abcur{background:rgba(0,200,83,.1)!important;border-left:3px solid var(--g1);}._abrow._abcur ._abstep{color:var(--gd);}._abrow._abcur ._abamt{color:var(--gdd);}",
    "._ab_cslrow{display:flex;align-items:center;gap:9px;}",
    "#_ab_csl{flex:1;accent-color:var(--g1);cursor:pointer;}",
    "#_ab_cval{font-family:var(--ff);font-size:13px;font-weight:900;color:var(--gd);min-width:34px;text-align:right;}",
    "#_ab_start{width:100%;padding:13px;border:none;border-radius:14px;font-family:var(--ff);font-size:11px;font-weight:900;letter-spacing:.8px;cursor:pointer;transition:all .3s;text-transform:uppercase;margin-top:3px;margin-bottom:11px;display:flex;align-items:center;justify-content:center;gap:7px;}",
    "#_ab_start.off{background:rgba(0,200,83,.1);color:var(--gdd);border:1.5px solid rgba(0,200,83,.28);}#_ab_start.off:hover{background:rgba(0,200,83,.18);}",
    "#_ab_start.on{background:linear-gradient(135deg,var(--gdd),var(--g1));color:white;box-shadow:0 4px 18px rgba(0,200,83,.4);}#_ab_start.on:hover{box-shadow:0 6px 24px rgba(0,200,83,.55);transform:translateY(-1px);}",
    "#_ab_status{font-size:10px;font-weight:800;text-align:center;padding:8px 12px;border-radius:11px;color:var(--t3);background:rgba(0,0,0,.03);margin-bottom:11px;min-height:36px;display:flex;align-items:center;justify-content:center;gap:6px;}",
    "#_ab_status.run{color:var(--gd);background:rgba(0,200,83,.07);}#_ab_status.bet{color:#E65100;background:rgba(245,127,23,.07);}#_ab_status.win{color:var(--gd);background:rgba(0,200,83,.1);}#_ab_status.los{color:var(--rd);background:var(--rdl);}#_ab_status.skp{color:var(--t3);background:rgba(0,0,0,.03);}",
    "._abpend{animation:_abPend 1s infinite;}",
    "._ab_stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}",
    "._ab_stat{background:var(--g4);border:1.5px solid rgba(0,200,83,.12);border-radius:13px;padding:9px 4px;text-align:center;}",
    "._ab_sv{font-family:var(--ff);font-size:17px;font-weight:1000;color:var(--tx);display:block;line-height:1;}",
    "._ab_sk{font-size:7px;font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-top:3px;}",
    "#_ab_sw ._ab_sv{color:var(--gd);}#_ab_sl ._ab_sv{color:var(--rd);}",

    /* RIPPLE */
    "._rpl{position:absolute;border-radius:50%;background:rgba(255,255,255,.38);animation:_ripple .65s ease-out;pointer-events:none;}",
  ].join('');
  D.head.appendChild(st);

  /* ═══ BUILD DOM ═══ */
  var root=D.createElement('div');root.id='_bdal_root';
  root.innerHTML=[
    '<div id="_bdal_logo"><img src="',CFG._logo,'" alt="BD ALAMIN"></div>',
    '<div id="_bdal_menu">',
      '<div class="_bdal_mi" id="_mi_pred"><div class="_bdal_mico">',svgI(P.target,18),'</div>Prediction Panel</div>',
      '<div class="_bdal_mi" id="_mi_ab"><div class="_bdal_mico">',svgI(P.bolt,18),'</div>Auto Bet</div>',
      '<div class="_bdal_mi" id="_mi_hist"><div class="_bdal_mico">',svgI(P.history,18),'</div>History</div>',
      '<div class="_bdal_mi" id="_mi_mkt"><div class="_bdal_mico">',svgI(P.trend,18),'</div>Market History</div>',
    '</div>',
    '<div id="_bdal_back"></div>',

    /* PREDICTION DIALOG */
    '<div id="_bdal_dlg">',
      '<div id="_bdal_hdr">',
        '<div id="_bdal_hlg"><img src="',CFG._logo,'" alt="BD ALAMIN"></div>',
        '<div class="_bdal_htx"><div class="_bdal_ht">BD ALAMIN</div><div class="_bdal_hs">Smart Predict · ALGO Engine</div></div>',
        '<div class="_bdal_hbadge">v7.2</div>',
      '</div>',
      '<div id="_bdal_scroll">',
        '<div id="_bdal_tabs">',
          '<div class="_bdal_tb _ta" data-m="_30">30S</div>',
          '<div class="_bdal_tb" data-m="_1">1M</div>',
          '<div class="_bdal_tb" data-m="_3">3M</div>',
          '<div class="_bdal_tb" data-m="_5">5M</div>',
        '</div>',
        /* PREDICTION ON/OFF TOGGLE */
        '<div id="_pred_tog">',
          '<div class="_ptlbl">',svgI(P.power,13),' Prediction<span class="_ptbadge" id="_ptbadgelbl">OFF</span></div>',
          '<div class="_tog_pill"><div class="_tog_dot"></div></div>',
        '</div>',
        '<div id="_bdal_body">',
          '<div class="_bdal_rrow">',
            '<span class="_bdal_rl"><span class="_bdal_ld"></span>Round</span>',
            '<span class="_bdal_rv" id="_bdal_rn">Scanning</span>',
          '</div>',
          '<div id="_bdal_pc" class="poff">',
            '<div class="_bdal_ptl">NEXT PREDICTION</div>',
            '<div id="_bdal_pv" class="voff">',svgI(P.power,18),' PREDICTION OFF</div>',
            '<div id="_bdal_pn"></div>',
            '<div id="_bdal_psrc"></div>',
          '</div>',
          /* ALGO Sub-Signals: STREAK · TREND · BALANCE */
          '<div id="_bdal_bars">',
            '<div class="_bdal_bar" id="_bar_str">',
              '<div class="_bicon" id="_bi_str">',svgI(P.wave,14),'</div>',
              '<span class="_bdal_bval bD" id="_bv_str">—</span>',
              '<span class="_bdal_bkey">Streak</span>',
            '</div>',
            '<div class="_bdal_bar" id="_bar_trd">',
              '<div class="_bicon" id="_bi_trd">',svgI(P.trendUp,14),'</div>',
              '<span class="_bdal_bval bD" id="_bv_trd">—</span>',
              '<span class="_bdal_bkey">Trend</span>',
            '</div>',
            '<div class="_bdal_bar" id="_bar_bal">',
              '<div class="_bicon" id="_bi_bal">',svgI(P.scale,14),'</div>',
              '<span class="_bdal_bval bD" id="_bv_bal">—</span>',
              '<span class="_bdal_bkey">Balance</span>',
            '</div>',
          '</div>',
          '<div class="_bdal_cw">',
            '<div class="_bdal_cl"><span>Confidence</span><span id="_bdal_cp">—</span></div>',
            '<div class="_bdal_ct"><div id="_bdal_cf"></div></div>',
          '</div>',
          '<div id="_bdal_stats">',
            '<div class="_bdal_st" id="_ss_w"><span class="_sv" id="_sv_w">0</span><span class="_sk">Win</span></div>',
            '<div class="_bdal_st" id="_ss_l"><span class="_sv" id="_sv_l">0</span><span class="_sk">Loss</span></div>',
            '<div class="_bdal_st"><span class="_sv" id="_sv_a">0%</span><span class="_sk">Acc%</span></div>',
          '</div>',
          '<div class="_bdal_hl">Signal History</div>',
          '<div id="_bdal_hist"></div>',
        '</div>',
      '</div>',
      '<div id="_bdal_ft">',
        '<button class="_bdal_ftb" id="_bdal_hide">',svgI(P.minus,14),' Hide</button>',
        '<button class="_bdal_ftb" id="_bdal_exit">',svgI(P.logout,14),' Exit</button>',
      '</div>',
    '</div>',

    /* AUTO BET DIALOG */
    '<div id="_ab_dlg">',
      '<div class="_sdH" id="_ab_hdr"><div class="sdTitle">',svgI(P.bolt,16),' Auto Bet</div><div class="_sdClose" id="_ab_close">',svgI(P.close,14),'</div></div>',
      '<div id="_ab_scroll">',
        '<div class="_ab_field"><div class="_ab_lbl">',svgI(P.wallet,12),' Balance</div><input class="_ab_in" id="_ab_bal" type="number" min="1" placeholder="e.g. 2000"></div>',
        '<div class="_ab_field"><div class="_ab_lbl">',svgI(P.stairs,12),' Steps</div><input class="_ab_in" id="_ab_stps" type="number" min="1" max="10" value="4"></div>',
        '<div class="_ab_lbl" style="margin-bottom:6px">',svgI(P.layers,12),' Bet Sequence</div>',
        '<div id="_ab_preview"><div style="padding:12px;text-align:center;font-size:10px;color:var(--t3);font-weight:700;">Enter balance and steps</div></div>',
        '<div style="margin-bottom:11px;margin-top:12px"><div class="_ab_lbl">',svgI(P.tune,12),' Min Confidence</div><div class="_ab_cslrow"><input type="range" id="_ab_csl" min="50" max="99" value="65"><span id="_ab_cval">65%</span></div></div>',
        '<button id="_ab_start" class="off"><span id="_ab_stic">',svgI(P.play,14),'</span><span id="_ab_stlbl">Start Auto Bet</span></button>',
        '<div id="_ab_status">',svgI(P.dots,14),' Waiting to start</div>',
        '<div class="_ab_stats"><div class="_ab_stat" id="_ab_sw"><span class="_ab_sv" id="_ab_vw">0</span><span class="_ab_sk">Win</span></div><div class="_ab_stat" id="_ab_sl"><span class="_ab_sv" id="_ab_vl">0</span><span class="_ab_sk">Loss</span></div><div class="_ab_stat"><span class="_ab_sv" id="_ab_vsk">0</span><span class="_ab_sk">Skip</span></div></div>',
      '</div>',
      '<div class="_sdFt"><button id="_ab_close2">',svgI(P.close,12),' Close</button></div>',
    '</div>',

    /* HISTORY DIALOG */
    '<div id="_bdal_histdlg">',
      '<div class="_sdH" id="_hist_hdr"><div class="sdTitle">',svgI(P.history,16),' History</div><div class="_sdClose" id="_histclose">',svgI(P.close,14),'</div></div>',
      '<div id="_bdal_histlist"><div style="text-align:center;padding:24px;font-size:12px;color:#B0BEC5;font-family:var(--ff);font-weight:700;">No history yet</div></div>',
      '<div id="_bdal_histpg"><button id="_histprev" disabled>',svgI(P.chevL,16),'</button><span id="_bdal_histpgtxt">Page 1 / 1</span><button id="_histnext">',svgI(P.chevR,16),'</button></div>',
      '<div class="_sdFt"><button id="_histclose2">',svgI(P.close,12),' Close</button></div>',
    '</div>',

    /* MARKET DIALOG */
    '<div id="_bdal_mktdlg">',
      '<div class="_sdH" id="_mkt_hdr"><div class="sdTitle">',svgI(P.trend,16),' Market History</div><div class="_sdClose" id="_mktclose">',svgI(P.close,14),'</div></div>',
      '<div id="_bdal_mktlist"></div>',
      '<div id="_bdal_mktpg"><button id="_mktprev" disabled>',svgI(P.chevL,16),'</button><span id="_bdal_mktpgtxt">Page 1 / 1</span><button id="_mktnext">',svgI(P.chevR,16),'</button></div>',
      '<div class="_sdFt"><button id="_mktclose2">',svgI(P.close,12),' Close</button></div>',
    '</div>',
  ].join('');
  D.body.appendChild(root);

  /* ═══ DOM REFS ═══ */
  var gi=function(id){return D.getElementById(id);};
  var logoBtn=gi('_bdal_logo'),menu=gi('_bdal_menu'),back=gi('_bdal_back');
  var dlg=gi('_bdal_dlg'),abDlg=gi('_ab_dlg'),histDlg=gi('_bdal_histdlg'),mktDlg=gi('_bdal_mktdlg');
  var pvEl=gi('_bdal_pv'),pnEl=gi('_bdal_pn'),psrcEl=gi('_bdal_psrc');
  var cfEl=gi('_bdal_cf'),cpEl=gi('_bdal_cp'),rnEl=gi('_bdal_rn'),histEl=gi('_bdal_hist');
  var swEl=gi('_sv_w'),slEl=gi('_sv_l'),saEl=gi('_sv_a'),pcEl=gi('_bdal_pc');
  var tabs=D.querySelectorAll('._bdal_tb');
  var bvStr=gi('_bv_str'),bvTrd=gi('_bv_trd'),bvBal=gi('_bv_bal');
  var barStr=gi('_bar_str'),barTrd=gi('_bar_trd'),barBal=gi('_bar_bal');
  var predTog=gi('_pred_tog'),ptBadge=gi('_ptbadgelbl');

  /* ═══ RIPPLE ═══ */
  function addRipple(el){
    el.addEventListener('click',function(e){
      var r=D.createElement('span'),rect=el.getBoundingClientRect(),size=M.max(rect.width,rect.height);
      r.className='_rpl';r.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px;';
      el.appendChild(r);setTimeout(function(){if(r.parentNode)r.remove();},700);
    });
  }

  /* ═══ DIALOG HELPERS ═══ */
  function openDlg(dlgEl){MENU_OPEN=false;menu.classList.remove('open');back.classList.add('open');dlgEl.classList.add('open');dlgEl.style.left='';dlgEl.style.top='';dlgEl.style.transform='translate(-50%,-50%)';}
  function closeDlg(dlgEl){dlgEl.classList.remove('open');if(!dlg.classList.contains('open')&&!abDlg.classList.contains('open')&&!histDlg.classList.contains('open')&&!mktDlg.classList.contains('open'))back.classList.remove('open');}

  logoBtn.addEventListener('click',function(e){e.stopPropagation();MENU_OPEN=!MENU_OPEN;menu.classList.toggle('open',MENU_OPEN);logoBtn.classList.add('sp');setTimeout(function(){logoBtn.classList.remove('sp');},620);});
  D.addEventListener('click',function(e){if(MENU_OPEN&&!menu.contains(e.target)&&e.target!==logoBtn){MENU_OPEN=false;menu.classList.remove('open');}});

  gi('_mi_pred').addEventListener('click',function(){openDlg(dlg);renderAll();});
  gi('_mi_ab').addEventListener('click',function(){openDlg(abDlg);});
  gi('_mi_hist').addEventListener('click',function(){openDlg(histDlg);HIST_PAGE=0;renderHist();});
  gi('_mi_mkt').addEventListener('click',function(){openDlg(mktDlg);renderMkt();});

  gi('_bdal_hide').addEventListener('click',function(){closeDlg(dlg);});
  gi('_bdal_exit').addEventListener('click',function(){[dlg,abDlg,histDlg,mktDlg,back].forEach(function(el){el.classList.remove('open');});root.style.animation='_fadeOut .25s ease forwards';setTimeout(function(){if(root.parentNode)root.remove();},260);});

  gi('_ab_close').addEventListener('click',function(){closeDlg(abDlg);});gi('_ab_close2').addEventListener('click',function(){closeDlg(abDlg);});
  gi('_histclose').addEventListener('click',function(){closeDlg(histDlg);});gi('_histclose2').addEventListener('click',function(){closeDlg(histDlg);});
  gi('_mktclose').addEventListener('click',function(){closeDlg(mktDlg);});gi('_mktclose2').addEventListener('click',function(){closeDlg(mktDlg);});
  back.addEventListener('click',function(){if(mktDlg.classList.contains('open'))closeDlg(mktDlg);else if(histDlg.classList.contains('open'))closeDlg(histDlg);else if(abDlg.classList.contains('open'))closeDlg(abDlg);else if(dlg.classList.contains('open'))closeDlg(dlg);});

  [gi('_bdal_hide'),gi('_bdal_exit'),gi('_mi_pred'),gi('_mi_ab'),gi('_mi_hist'),gi('_mi_mkt'),gi('_ab_close2'),gi('_histclose2'),gi('_mktclose2')].forEach(addRipple);

  /* ═══ DRAGGABLE ═══ */
  function makeDrag(dlgEl,hdrEl){
    var ox=0,oy=0,dn=false;
    hdrEl.addEventListener('mousedown',function(e){if(e.target.classList.contains('_sdClose'))return;dn=true;var rect=dlgEl.getBoundingClientRect();ox=e.clientX-rect.left-rect.width/2;oy=e.clientY-rect.top-rect.height/2;hdrEl.style.cursor='grabbing';e.preventDefault();});
    D.addEventListener('mousemove',function(e){if(!dn)return;var nx=M.max(dlgEl.offsetWidth/2,M.min(W.innerWidth-dlgEl.offsetWidth/2,e.clientX-ox));var ny=M.max(dlgEl.offsetHeight/2,M.min(W.innerHeight-dlgEl.offsetHeight/2,e.clientY-oy));dlgEl.style.left=nx+'px';dlgEl.style.top=ny+'px';dlgEl.style.transform='translate(-50%,-50%)';});
    D.addEventListener('mouseup',function(){dn=false;hdrEl.style.cursor='grab';});
    hdrEl.addEventListener('touchstart',function(e){if(e.target.classList.contains('_sdClose'))return;dn=true;var t=e.touches[0],rect=dlgEl.getBoundingClientRect();ox=t.clientX-rect.left-rect.width/2;oy=t.clientY-rect.top-rect.height/2;},{passive:true});
    D.addEventListener('touchmove',function(e){if(!dn)return;var t=e.touches[0];var nx=M.max(dlgEl.offsetWidth/2,M.min(W.innerWidth-dlgEl.offsetWidth/2,t.clientX-ox));var ny=M.max(dlgEl.offsetHeight/2,M.min(W.innerHeight-dlgEl.offsetHeight/2,t.clientY-oy));dlgEl.style.left=nx+'px';dlgEl.style.top=ny+'px';dlgEl.style.transform='translate(-50%,-50%)';},{passive:true});
    D.addEventListener('touchend',function(){dn=false;});
  }
  makeDrag(dlg,gi('_bdal_hdr'));makeDrag(abDlg,gi('_ab_hdr'));makeDrag(histDlg,gi('_hist_hdr'));makeDrag(mktDlg,gi('_mkt_hdr'));

  /* ═══ PREDICTION TOGGLE ═══ */
  predTog.addEventListener('click',function(){
    PRED_ON=!PRED_ON;
    predTog.classList.toggle('on',PRED_ON);
    ptBadge.textContent=PRED_ON?'ON':'OFF';
    addRipple(predTog);
    renderAll();
  });

  /* ═══ MARKET TABS ═══ */
  tabs.forEach(function(t){t.addEventListener('click',function(){tabs.forEach(function(x){x.classList.remove('_ta');});t.classList.add('_ta');MKT.cur=t.dataset.m;renderAll();});});

  /* ═══ AUTO BET ═══ */
  function calcBets(bal,stps){var base=M.floor(bal/M.pow(2,stps));if(base<1)base=1;var arr=[];for(var i=0;i<stps;i++)arr.push(M.floor(base*M.pow(2,i)));return arr;}
  function updateABPreview(){
    var bal=parseInt(gi('_ab_bal').value)||0,stps=M.max(1,M.min(10,parseInt(gi('_ab_stps').value)||4));
    var prev=gi('_ab_preview');
    if(!bal){prev.innerHTML='<div style="padding:12px;text-align:center;font-size:10px;color:var(--t3);font-weight:700;">Enter balance and steps</div>';return;}
    var bets=calcBets(bal,stps);var html='';
    bets.forEach(function(b,i){var isCur=AB.on&&AB.curStep===i;html+='<div class="_abrow'+(isCur?' _abcur':'')+'"><span class="_abstep">'+svgI(P.stairs,10)+' Step '+(i+1)+'</span><span class="_abamt">&#2547;'+b+'</span></div>';});
    prev.innerHTML=html;
  }
  function setABStatus(msg,cls){var el=gi('_ab_status');if(!el)return;var icons={run:P.dots,bet:P.bolt,win:P.check,los:P.close,skp:P.skip};el.className=cls;el.innerHTML=(icons[cls]?'<span class="'+(cls==='bet'?'_abpend':'')+'">'+svgI(icons[cls],14)+'</span>':'')+' '+msg;}
  function updateABStats(){gi('_ab_vw').textContent=AB.w;gi('_ab_vl').textContent=AB.l;gi('_ab_vsk').textContent=AB.sk;}
  function placeBet(type,amount){try{var sel=type==='Big'?'.Betting__C-foot-b':'.Betting__C-foot-s';var btn=D.querySelector(sel),ok=false;if(btn&&btn.offsetParent){btn.click();ok=true;}else{var els=D.querySelectorAll('div,span');for(var j=0;j<els.length;j++){if((els[j].innerText||'').trim()===type&&els[j].offsetParent&&!els[j].children.length){els[j].click();ok=true;break;}}}setTimeout(function(){var inp=D.querySelector('input[type="number"]');if(inp&&inp.offsetParent){var ns=Object.getOwnPropertyDescriptor(W.HTMLInputElement.prototype,'value').set;ns.call(inp,String(amount));inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}));}setTimeout(function(){var cb=D.querySelector('button.bet-amount,button[class*="bet-amount"]');if(cb&&cb.offsetParent)cb.click();else D.querySelectorAll('button').forEach(function(b){if((b.innerText||'').includes('Total amount')&&b.offsetParent)b.click();});},600);},550);return ok;}catch(e){return false;}}

  gi('_ab_bal').addEventListener('input',updateABPreview);
  gi('_ab_stps').addEventListener('input',updateABPreview);
  gi('_ab_csl').addEventListener('input',function(){gi('_ab_cval').textContent=this.value+'%';AB.minConf=parseInt(this.value);});
  gi('_ab_start').addEventListener('click',function(){
    AB.on=!AB.on;
    if(AB.on){var bal=M.floor(parseFloat(gi('_ab_bal').value)||0);var stps=M.max(1,M.min(10,parseInt(gi('_ab_stps').value)||4));AB.bets=calcBets(bal,stps);AB.steps=stps;AB.curStep=0;AB.minConf=parseInt(gi('_ab_csl').value)||65;AB.w=0;AB.l=0;AB.sk=0;AB.lastBet=null;_abLastRnd='';updateABStats();gi('_ab_stic').innerHTML=svgI(P.stop,14);gi('_ab_stlbl').textContent='Stop Auto Bet';this.className='on';setABStatus('Waiting for signal...','run');}
    else{gi('_ab_stic').innerHTML=svgI(P.play,14);gi('_ab_stlbl').textContent='Start Auto Bet';this.className='off';setABStatus('Stopped','');}
    updateABPreview();
  });

  /* ═══ MARKET DETECT ═══ */
  function detectMkt(){var el=D.querySelector('.timer-card.active .card-title');if(!el)return;var txt=el.innerText.trim(),nk=MKT.cur;if(txt.includes('30'))nk='_30';else if(txt.includes('1 '))nk='_1';else if(txt.includes('3 '))nk='_3';else if(txt.includes('5 '))nk='_5';if(nk!==MKT.cur){MKT.cur=nk;tabs.forEach(function(t){t.classList.toggle('_ta',t.dataset.m===nk);});renderAll();}}

  /* ═══ RENDER ═══ */
  function setBar(bEl,vEl,v,col){vEl.textContent=v==='W'||v==='—'?'—':(v==='B'?'BIG':'SML');vEl.classList.remove('bB','bS','bD');if(v==='B')vEl.classList.add('bB');else if(v==='S')vEl.classList.add('bS');else vEl.classList.add('bD');bEl.classList.toggle('_bact',PRED_ON&&v!=='—'&&v!=='W');}

  function renderP(res){
    if(!PRED_ON){pcEl.className='poff';pvEl.className='voff';pvEl.innerHTML=svgI(P.power,18)+' PREDICTION OFF';pnEl.textContent='';psrcEl.innerHTML='';cfEl.style.width='0%';cpEl.textContent='—';setBar(barStr,bvStr,'—');setBar(barTrd,bvTrd,'—');setBar(barBal,bvBal,'—');return;}
    if(!res||res.r==='W'){pcEl.classList.add('sc');pvEl.className='vw';pvEl.innerHTML='<span class="_dot">.</span><span class="_dot">.</span><span class="_dot">.</span>';pnEl.textContent='';psrcEl.innerHTML='';cfEl.style.width='0%';cpEl.textContent='—';setBar(barStr,bvStr,'—');setBar(barTrd,bvTrd,'—');setBar(barBal,bvBal,'—');return;}
    var isBig=res.r==='B';
    pcEl.classList.remove('sc','poff');
    pvEl.className=isBig?'vb doA':'vs doA';
    pvEl.innerHTML=svgI(isBig?P.up:P.down,28)+'<span>'+(isBig?'BIG':'SMALL')+'</span>';
    pnEl.textContent='Num: '+(res.n>=0?res.n:'?')+'   Conf: '+res.cf+'%';
    cfEl.style.width=res.cf+'%';
    cfEl.style.background=isBig?'linear-gradient(90deg,#B71C1C,#E53935,#FF7043)':'linear-gradient(90deg,#0D47A1,#1E88E5,#64B5F6)';
    cpEl.textContent=res.cf+'%';
    pcEl.className=isBig?'mb':'ms';
    psrcEl.style.color=isBig?'var(--rd)':'var(--bl)';
    psrcEl.innerHTML=svgI(P.wave,11)+' Streak &nbsp;'+svgI(P.trendUp,11)+' Trend &nbsp;'+svgI(P.scale,11)+' Balance';
    setBar(barStr,bvStr,res._streak);
    setBar(barTrd,bvTrd,res._trend);
    setBar(barBal,bvBal,res._balance);
  }

  function renderH(){var mk=MKT[MKT.cur];histEl.innerHTML='';mk.h.slice(0,14).reverse().forEach(function(x){var d=D.createElement('div');d.className='_bdal_ch '+(x.r==='B'?'_chb':'_chs');d.textContent=x.n;histEl.appendChild(d);});}
  function renderS(){var mk=MKT[MKT.cur],t=mk.w+mk.l;swEl.textContent=mk.w;slEl.textContent=mk.l;saEl.textContent=t?M.round(mk.w/t*100)+'%':'0%';}
  function renderAll(){var mk=MKT[MKT.cur];rnEl.textContent=mk.rnd?'#'+mk.rnd.slice(-6):'Scanning';if(!mk.rnd){if(PRED_ON){pcEl.classList.add('sc');pvEl.className='vw';pvEl.innerHTML='<span class="_dot">.</span><span class="_dot">.</span><span class="_dot">.</span>';pnEl.textContent='';psrcEl.innerHTML='';setBar(barStr,bvStr,'—');setBar(barTrd,bvTrd,'—');setBar(barBal,bvBal,'—');}else renderP(null);renderH();renderS();return;}var res=recompute(mk);renderP(res);renderH();renderS();}

  function renderHist(){
    var list=gi('_bdal_histlist');if(!list)return;
    var mk=MKT[MKT.cur];
    /* Build item list: live pending at top + resolved BET_LOG entries */
    var items=[];
    if(PRED_ON&&mk.lp&&mk.lp.r!=='W'&&mk.rnd){
      items.push({round:mk.rnd,pred:mk.lp.r,won:null,_live:true});
    }
    BET_LOG.forEach(function(h){if(!h.skip&&h.amt===undefined)items.push(h);});
    var start=HIST_PAGE*5,page=items.slice(start,start+5);
    list.innerHTML='';
    if(!items.length){list.innerHTML='<div style="text-align:center;padding:24px;font-size:12px;color:#B0BEC5;font-family:var(--ff);font-weight:700;">No history yet</div>';}
    else if(!page.length){list.innerHTML='<div style="text-align:center;padding:16px;font-size:11px;color:#B0BEC5;font-family:var(--ff);font-weight:700;">No more history</div>';}
    else{page.forEach(function(h){var isBig=h.pred==='B';var wl=h.won===null?'xskp':(h.won?'xwin':'xlos');var wlC=h.won===null?(svgI(P.dots,12)+' Pending'):(h.won?(svgI(P.check,12)+' WIN'):(svgI(P.close,12)+' LOSS'));var row=D.createElement('div');row.className='_hrow '+(h.won===null?'':(h.won?'hwin':'hlos'));row.innerHTML='<div class="_hbg '+(isBig?'_hbig':'_hsml')+'">'+svgI(isBig?P.up:P.down,16)+'</div><div class="_hinfo"><div class="_hrd"># '+String(h.round).slice(-6)+'</div><div class="_hpr">'+(isBig?'BIG':'SMALL')+'</div></div><div class="_hwl '+wl+'">'+wlC+'</div>';list.appendChild(row);});}
    var tp=M.max(1,M.ceil(items.length/5));
    gi('_bdal_histpgtxt').textContent='Page '+(HIST_PAGE+1)+' / '+tp;
    gi('_histprev').disabled=HIST_PAGE===0;
    gi('_histnext').disabled=HIST_PAGE>=tp-1;
  }

  function renderMkt(){var mk=MKT[MKT.cur],list=gi('_bdal_mktlist');if(!mk||!list)return;var mh=mk.h||[],start=MKT_PAGE*5,page=mh.slice(start,start+5);list.innerHTML='';if(!page.length){list.innerHTML='<div style="text-align:center;padding:20px;font-size:12px;color:#B0BEC5;font-family:var(--ff);font-weight:700;">No data yet</div>';}else{page.forEach(function(h){var isBig=h.r==='B'||h.n>=5,bc=isBig?'_mbig':'_msml',row=D.createElement('div');row.className='_mrow';row.innerHTML='<div class="_mnum '+bc+'">'+h.n+'</div><div class="_mrd"># '+String(h.rnd).slice(-6)+'</div><div class="_mbs '+bc+'">'+svgI(isBig?P.up:P.down,12)+(isBig?' BIG':' SML')+'</div>';list.appendChild(row);});}var tp=M.max(1,M.ceil(mh.length/5));gi('_bdal_mktpgtxt').textContent='Page '+(MKT_PAGE+1)+' / '+tp;gi('_mktprev').disabled=MKT_PAGE===0;gi('_mktnext').disabled=MKT_PAGE>=tp-1;}

  gi('_mktprev').addEventListener('click',function(){if(MKT_PAGE>0){MKT_PAGE--;renderMkt();}});
  gi('_mktnext').addEventListener('click',function(){MKT_PAGE++;renderMkt();});
  gi('_histprev').addEventListener('click',function(){if(HIST_PAGE>0){HIST_PAGE--;renderHist();}});
  gi('_histnext').addEventListener('click',function(){HIST_PAGE++;renderHist();});

  /* ═══ MAIN LOOP ═══ */
  setInterval(function(){
    detectMkt();
    var el=null,sels=['.TimeLeft__C-id','.game-id','.period-id','[class*="period"]'];
    for(var i=0;i<sels.length;i++){var e=D.querySelector(sels[i]);if(e&&e.innerText&&e.innerText.length>5&&e.innerText.length<30){el=e;break;}}
    if(!el){var all=D.querySelectorAll('*');for(var j=0;j<all.length;j++){if(!all[j].children.length&&all[j].innerText&&/^\d{12,22}$/.test(all[j].innerText.trim())){el=all[j];break;}}}
    if(!el)return;
    var cur=el.innerText.trim(),mk=MKT[MKT.cur];
    if(!cur||cur===mk.rnd)return;
    var latN=-1,rows=D.querySelectorAll('[class*="history"] [class*="number"],[class*="record"] [class*="num"],[class*="result"] span,[class*="list"] td');
    for(var k=0;k<rows.length;k++){if(/^[0-9]$/.test(rows[k].innerText.trim())){latN=+rows[k].innerText.trim();break;}}
    if(mk.rnd&&mk.lp&&latN>=0){
      var aR=latN>=5?'B':'S';
      mk.h.unshift({n:latN,r:aR,rnd:mk.rnd});if(mk.h.length>60)mk.h.pop();
      if(mk.lp.r!=='W'&&PRED_ON){
        var won=mk.lp.r===aR;
        if(won)mk.w++;else mk.l++;
        /* Add RESOLVED entry — no pending in BET_LOG, no duplicates */
        BET_LOG.unshift({round:mk.rnd,pred:mk.lp.r,won:won});
        if(BET_LOG.length>60)BET_LOG.pop();
        if(histDlg.classList.contains('open'))renderHist();
      }
    }
    if(AB.lastBet&&!AB.lastBet.done&&mk.h.length>0){var lh=mk.h[0];if(String(lh.rnd)===String(AB.lastBet.round)){AB.lastBet.done=true;var abWon=(lh.r===AB.lastBet.type);for(var li=0;li<BET_LOG.length;li++){if(String(BET_LOG[li].round)===String(AB.lastBet.round)){BET_LOG[li].won=abWon;break;}}if(abWon){AB.w++;AB.curStep=0;setABStatus('WIN — Back to Step 1 (&#2547;'+AB.bets[0]+')','win');}else{AB.l++;if(AB.curStep<AB.steps-1){AB.curStep++;setABStatus('LOSS — Step '+(AB.curStep+1)+' (&#2547;'+AB.bets[AB.curStep]+')','los');}else{AB.curStep=0;setABStatus('All steps used — Reset to Step 1','los');}}updateABStats();updateABPreview();if(histDlg.classList.contains('open'))renderHist();}}
    mk.rnd=cur;var res=recompute(mk);mk.lp=res;
    /* pending shown live via renderHist from mk.lp */
    if(AB.on&&cur!==_abLastRnd){_abLastRnd=cur;if(res.r!=='W'){var conf=res.cf||0;if(conf<AB.minConf){AB.sk++;updateABStats();BET_LOG.unshift({round:cur,pred:res.r,conf:conf,amt:0,skip:true,won:null});setABStatus('SKIP — Conf '+conf+'% < '+AB.minConf+'%','skp');if(histDlg.classList.contains('open'))renderHist();}else{var bType=res.r==='B'?'Big':'Small';var bAmt=M.floor(AB.bets[AB.curStep]||AB.bets[0]||1);setABStatus('Placing '+bType+' &#2547;'+bAmt+' ('+conf+'%)','bet');BET_LOG.unshift({round:cur,pred:res.r,conf:conf,amt:bAmt,skip:false,won:null});if(histDlg.classList.contains('open'))renderHist();setTimeout(function(){if(!AB.on)return;var ok=placeBet(bType,bAmt);AB.lastBet={type:res.r,amt:bAmt,round:cur,done:false};setABStatus(ok?'Placed: '+bType+' &#2547;'+bAmt:'Bet click failed','run');},1000);}}}
    if(dlg.classList.contains('open'))renderAll();
    if(mktDlg.classList.contains('open'))renderMkt();
  },850);

  renderAll();

})(window,document,Math);
