import React, { useState } from 'react';
import DitherVeil from './DitherVeil/DitherVeil.jsx';
import {
  Eye,
  Sliders,
  Sparkles,
  ShieldAlert,
  Zap,
  RefreshCw,
  Layers,
  Terminal,
  MousePointer
} from 'lucide-react';

interface ThreatSample {
  id: string;
  name: string;
  category: string;
  src: string;
  inkColor: string;
  paperColor: string;
  rimColor: string;
  defaultPattern: 'floyd' | 'atkinson' | 'bayer' | 'noise' | 'lines';
  description: string;
}

const THREAT_SAMPLES: ThreatSample[] = [
  {
    id: 'cyber_shield',
    name: 'AEGIS Neural Guard Core',
    category: 'ACTIVE RECON',
    src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1400&auto=format&fit=crop',
    inkColor: '#050c1a',
    paperColor: '#38bdf8',
    rimColor: '#00BFFF',
    defaultPattern: 'floyd',
    description: 'Neural core gatekeeper intercepting autonomous agent vectors. Dither matrix simulates encrypted memory state.'
  },
  {
    id: 'injection_payload',
    name: 'Adversarial Jailbreak Buffer',
    category: 'QUARANTINED PAYLOAD',
    src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1400&auto=format&fit=crop',
    inkColor: '#17060b',
    paperColor: '#f43f5e',
    rimColor: '#fda4af',
    defaultPattern: 'atkinson',
    description: 'Intercepted instruction injection attempt quarantined at perimeter before model ingestion.'
  },
  {
    id: 'crypto_vault',
    name: 'Root Key Escrow Matrix',
    category: 'CRITICAL ASSET',
    src: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1400&auto=format&fit=crop',
    inkColor: '#041512',
    paperColor: '#10b981',
    rimColor: '#6ee7b7',
    defaultPattern: 'bayer',
    description: 'Hardware security module (HSM) seed registry safeguarded by fail-closed policy POL-006.'
  },
  {
    id: 'soc_command',
    name: 'SOC Neural Telemetry Mesh',
    category: 'PERIMETER RECON',
    src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop',
    inkColor: '#100720',
    paperColor: '#c084fc',
    rimColor: '#7C3AED',
    defaultPattern: 'lines',
    description: 'Sub-50ms distributed event stream monitoring continuous multi-agent execution channels.'
  }
];

export const ForensicThreatVeil: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<ThreatSample>(THREAT_SAMPLES[0]);
  const [pattern, setPattern] = useState<'floyd' | 'atkinson' | 'bayer' | 'noise' | 'lines'>('floyd');
  const [pixelSize, setPixelSize] = useState<number>(3);
  const [revealRadius, setRevealRadius] = useState<number>(200);
  const [softness, setSoftness] = useState<number>(0.6);
  const [linger, setLinger] = useState<number>(1.2);
  const [reverse, setReverse] = useState<boolean>(false);
  const [wander, setWander] = useState<boolean>(false);
  const [clickBurst, setClickBurst] = useState<boolean>(true);
  const [palette, setPalette] = useState<'duotone' | 'rgb'>('duotone');

  const handleSelectSample = (sample: ThreatSample) => {
    setSelectedSample(sample);
    setPattern(sample.defaultPattern);
  };

  return (
    <div className="w-full cyber-panel rounded-2xl border border-cyan-500/30 overflow-hidden shadow-[0_4px_35px_rgba(0,0,0,0.8)]">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>INTERACTIVE FORENSIC RECON</span>
          </div>
          <h3 className="text-xl font-cyber font-bold text-white tracking-wide">
            FORENSIC THREAT DECRYPTION VEIL
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Hover cursor or click to radiate a color shockwave across encrypted memory buffers and quarantined threat payloads.
          </p>
        </div>

        {/* Target Sample Switchers */}
        <div className="flex flex-wrap items-center gap-1.5">
          {THREAT_SAMPLES.map(sample => {
            const isSelected = selectedSample.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {sample.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Veil Viewer */}
      <div className="relative w-full h-[500px] sm:h-[580px] bg-slate-950 overflow-hidden">
        <DitherVeil
          src={selectedSample.src}
          pattern={pattern}
          pixelSize={pixelSize}
          inkColor={selectedSample.inkColor}
          paperColor={selectedSample.paperColor}
          rimColor={selectedSample.rimColor}
          rim={0.12}
          palette={palette}
          revealRadius={revealRadius}
          softness={softness}
          linger={linger}
          reverse={reverse}
          wander={wander}
          clickBurst={clickBurst}
          contrast={1.2}
          levels={3}
          fit="cover"
        />

        {/* HUD Overlay Top Right */}
        <div className="absolute top-4 right-4 z-10 bg-[#030712]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30 text-[11px] font-mono text-slate-300 shadow-[0_0_20px_rgba(0,0,0,0.8)] pointer-events-none flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-bold">{selectedSample.category}</span>
          </div>
          <div className="text-slate-400">{selectedSample.name}</div>
          <div className="text-[10px] text-slate-500">Pattern: {pattern.toUpperCase()} • {pixelSize}px Grid</div>
        </div>

        {/* Hover Hint Overlay Bottom Left */}
        <div className="absolute bottom-4 left-4 z-10 bg-[#030712]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2 pointer-events-none">
          <MousePointer className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span>Move cursor to decrypt • Click to send ripple shockwave</span>
        </div>
      </div>

      {/* Interactive Cyber Controls Bar */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        {/* Dither Pattern Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase tracking-wider text-[11px]">Algorithm:</span>
          {(['floyd', 'atkinson', 'bayer', 'noise', 'lines'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPattern(p)}
              className={`px-2.5 py-1 rounded text-xs tracking-wider transition-colors cursor-pointer capitalize ${
                pattern === p
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Palette Mode */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase tracking-wider text-[11px]">Palette:</span>
          <button
            onClick={() => setPalette(palette === 'duotone' ? 'rgb' : 'duotone')}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300 hover:border-cyan-500/40 cursor-pointer font-bold uppercase"
          >
            {palette}
          </button>
        </div>

        {/* Interactive Toggles */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={clickBurst}
              onChange={e => setClickBurst(e.target.checked)}
              className="accent-cyan-400"
            />
            <span>Click Burst</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={wander}
              onChange={e => setWander(e.target.checked)}
              className="accent-cyan-400"
            />
            <span>Auto-Drift</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={reverse}
              onChange={e => setReverse(e.target.checked)}
              className="accent-cyan-400"
            />
            <span>Invert Veil</span>
          </label>
        </div>

        {/* Sliders for Radius and Pixel Size */}
        <div className="flex items-center gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Radius:</span>
            <input
              type="range"
              min={80}
              max={350}
              value={revealRadius}
              onChange={e => setRevealRadius(Number(e.target.value))}
              className="accent-cyan-400 w-20 cursor-pointer"
            />
            <span className="text-cyan-300 font-bold w-7 text-right">{revealRadius}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Grid:</span>
            <input
              type="range"
              min={1}
              max={6}
              value={pixelSize}
              onChange={e => setPixelSize(Number(e.target.value))}
              className="accent-cyan-400 w-16 cursor-pointer"
            />
            <span className="text-cyan-300 font-bold w-4 text-right">{pixelSize}px</span>
          </div>
        </div>
      </div>
    </div>
  );
};
