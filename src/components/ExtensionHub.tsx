import React, { useState } from 'react';
import JSZip from 'jszip';
import { sound } from '../utils/sound';
import { APP_CONFIG } from '../config/appConfig';

export const ExtensionHub: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'manifest' | 'script'>('guide');

  // Load content script code
  const manifestJson = `{
  "manifest_version": 3,
  "name": "${APP_CONFIG.name} Premium",
  "description": "⚡ ${APP_CONFIG.name} · Smart Predict System v7.2 · Multi-Factor ALGO Engine",
  "version": "7.2.0",
  "permissions": ["storage"],
  "icons": {
    "16": "icon.png",
    "32": "icon.png",
    "48": "icon.png",
    "128": "icon.png"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>", "https://dkwin9.com/*"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ]
}`;

  const downloadExtensionZip = async () => {
    try {
      setDownloading(true);
      sound.playClick();
      const zip = new JSZip();

      // Add manifest.json
      zip.file('manifest.json', manifestJson);

      // Fetch the actual content_8e27be94.js or bundled content
      let contentJsCode = '';
      try {
        const resp = await fetch('/assets/aistudio/content_8e27be94.js');
        if (resp.ok) {
          contentJsCode = await resp.text();
        }
      } catch {
        // fallback
      }

      if (!contentJsCode) {
        // Provide standard fallback if file couldn't be loaded directly
        contentJsCode = `/* BD ALAMIN Premium · v7.2 */\nconsole.log("BD ALAMIN loaded");`;
      }

      zip.file('content.js', contentJsCode);

      // Fetch the icon image and add to zip as binary
      try {
        const iconResp = await fetch('/assets/aistudio/icon_732ea5e6.png');
        if (iconResp.ok) {
          const iconBlob = await iconResp.blob();
          zip.file('icon.png', iconBlob);
        }
      } catch (err) {
        console.error('Failed to bundle icon image', err);
      }

      // Generate zip and trigger download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'BD_ALAMIN_v7.2_Premium_Extension.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      sound.playWin();
    } catch (e) {
      console.error(e);
      alert('Could not generate extension zip. Please copy files directly from the tabs.');
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl font-['Nunito'] text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-500/25 shrink-0 bg-slate-800">
            <img
              src={APP_CONFIG.profileImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src = APP_CONFIG.fallbackImage;
              }}
              alt={APP_CONFIG.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              {APP_CONFIG.name} Extension Exporter
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                Ready for Kiwi &amp; Chrome
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-semibold">
              Official v7.2 Content Script · Multi-Factor Prediction Heuristics
            </p>
          </div>
        </div>

        {/* Download Zip Button */}
        <button
          onClick={downloadExtensionZip}
          disabled={downloading}
          className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
          </svg>
          {downloading ? 'Packing Extension Zip...' : 'Download Extension (.zip)'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'guide'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Installation Guide
        </button>
        <button
          onClick={() => setActiveTab('manifest')}
          className={`pb-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'manifest'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          manifest.json
        </button>
        <button
          onClick={() => setActiveTab('script')}
          className={`pb-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'script'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          content.js (Engine)
        </button>
      </div>

      {/* Tab 1: Installation Guide */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chrome / Desktop */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Chrome, Brave &amp; Edge (Desktop)
            </h3>
            <ol className="space-y-3 text-xs text-slate-300 font-medium list-decimal list-inside">
              <li>
                Click <strong className="text-white">Download Extension (.zip)</strong> above and unzip the folder to your computer.
              </li>
              <li>
                Open <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded">chrome://extensions</code> in your browser.
              </li>
              <li>
                Turn on <strong className="text-emerald-400">Developer mode</strong> (top right toggle switch).
              </li>
              <li>
                Click <strong className="text-white">Load unpacked</strong> and select the unzipped extension directory.
              </li>
              <li>
                Visit any WinGo lottery webpage: the glowing BD ALAMIN logo will float right on your screen!
              </li>
            </ol>
          </div>

          {/* Kiwi Browser (Android Mobile) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Kiwi Browser (Android Phone)
            </h3>
            <ol className="space-y-3 text-xs text-slate-300 font-medium list-decimal list-inside">
              <li>
                Download <strong className="text-white">Kiwi Browser</strong> from Google Play Store (supports Chrome extensions on Android).
              </li>
              <li>
                Download the <strong className="text-white">.zip</strong> file above onto your phone.
              </li>
              <li>
                In Kiwi Browser, tap the 3 dots menu <span className="text-slate-400">→</span> <strong className="text-emerald-400">Extensions</strong>.
              </li>
              <li>
                Enable <strong className="text-emerald-400">Developer Mode</strong>, then tap <strong className="text-white">+(from .zip/.crx/.user.js)</strong>.
              </li>
              <li>
                Select the downloaded zip file: BD ALAMIN will instantly activate on lottery websites!
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab 2: Manifest */}
      {activeTab === 'manifest' && (
        <div className="relative">
          <button
            onClick={() => copyToClipboard(manifestJson, 'manifest')}
            className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs px-3 py-1.5 rounded-xl transition-colors border border-slate-700"
          >
            {copiedCode === 'manifest' ? '✓ Copied!' : 'Copy manifest.json'}
          </button>
          <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-96">
            {manifestJson}
          </pre>
        </div>
      )}

      {/* Tab 3: content.js snippet */}
      {activeTab === 'script' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Core Multi-Factor Heuristics: Streak · Weighted Trend · Balance</span>
            <button
              onClick={() => {
                // Fetch full script and copy
                fetch('/assets/aistudio/content_8e27be94.js')
                  .then((r) => r.text())
                  .then((txt) => copyToClipboard(txt, 'script'));
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs px-3 py-1.5 rounded-xl transition-colors border border-slate-700"
            >
              {copiedCode === 'script' ? '✓ Copied Full Script!' : 'Copy Full content.js'}
            </button>
          </div>
          <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-96">
{`/* BD ALAMIN Premium · v7.2 · ALGO Only + Pred Toggle */
function algoPredict(h) {
  var EMPTY = { r:'W', n:-1, cf:0, _streak:'—', _trend:'—', _balance:'—' };
  if (!h || h.length < 3) return EMPTY;

  var rs = h.map(function(x){ return x.r; });
  var ns = h.map(function(x){ return x.n; });

  /* ── SIGNAL 1: STREAK ANALYSIS ── */
  var streak = 1;
  for (var i = 1; i < Math.min(rs.length, 14); i++) {
    if (rs[i] === rs[0]) streak++; else break;
  }
  var altC = 0;
  for (var a = 1; a < Math.min(rs.length, 9); a++) {
    if (rs[a] !== rs[a-1]) altC++;
  }
  var altR = altC / (Math.min(rs.length, 9) - 1);
  var streakSig = (altR > 0.68 || streak >= 3) ? (rs[0] === 'B' ? 'S' : 'B') : rs[0];

  /* ── SIGNAL 2: WEIGHTED RECENT TREND ── */
  var wts = [12, 9, 7, 5, 4, 3, 2, 2, 1, 1];
  var wB = 0, wS = 0;
  for (var w = 0; w < Math.min(rs.length, wts.length); w++) {
    if (rs[w] === 'B') wB += wts[w]; else wS += wts[w];
  }
  var trendSig = wB > wS ? 'B' : 'S';

  /* ── SIGNAL 3: BIG/SMALL BALANCE ── */
  var l20 = rs.slice(0, Math.min(rs.length, 20));
  var bCnt = l20.filter(function(x){ return x === 'B'; }).length;
  var diff = bCnt - (l20.length - bCnt);
  var balanceSig = diff >= 2 ? 'S' : diff <= -2 ? 'B' : (rs[0] === 'B' ? 'S' : 'B');

  /* ── POINT VOTING: Streak 32, Trend 42, Balance 26 ── */
  var votes = { B: 0, S: 0 };
  votes[streakSig] += 32;
  votes[trendSig] += 42;
  votes[balanceSig] += 26;
  var isBig = votes.B > votes.S;

  return { r: isBig ? 'B' : 'S', cf: Math.min(95, 50 + (Math.max(votes.B, votes.S) - 50) * 0.9) };
}`}
          </pre>
        </div>
      )}
    </div>
  );
};
