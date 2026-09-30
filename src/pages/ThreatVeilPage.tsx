import React from 'react';
import { ForensicThreatVeil } from '../components/ForensicThreatVeil.js';
import BorderGlow from '../components/BorderGlow/BorderGlow.jsx';
import { Eye, Shield, Terminal, Fingerprint, Lock, Sparkles, Activity } from 'lucide-react';

export const ThreatVeilPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 min-h-screen text-slate-100">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#CBFF70] tracking-wider uppercase mb-1">
          <Eye className="w-3.5 h-3.5" />
          <span>Real-Time Dithered Forensics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#F0F4F8] tracking-tight">
          Threat Recon & Forensic Dither Veil
        </h1>
        <p className="text-xs sm:text-sm text-[#9DAAB8] font-sans mt-1 max-w-3xl leading-relaxed">
          Interactive WebGL Dither Veil powered by GPU shaders. Hover to decrypt and inspect quarantined memory buffers,
          adversarial payload fingerprints, and root security architectures. Click anywhere on the matrix to radiate a color burst shockwave.
        </p>
      </div>

      {/* Forensic Dither Veil Component */}
      <div className="mb-10">
        <ForensicThreatVeil />
      </div>

      {/* Cyber Explanatory Feature Cards with Interactive BorderGlow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BorderGlow
          edgeSensitivity={30}
          glowColor="199 89 48"
          backgroundColor="#0F172A"
          borderRadius={16}
          glowRadius={36}
          glowIntensity={1.2}
          coneSpread={26}
          animated={true}
          colors={['#38bdf8', '#0284c7', '#06b6d4']}
          className="w-full"
        >
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-2 text-cyan-400">
              <Fingerprint className="w-5 h-5" />
              <h4 className="font-cyber font-bold text-sm tracking-wider text-slate-200">
                DITHER CRYPTO MATRIX
              </h4>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Utilizes Floyd-Steinberg, Atkinson, Bayer, Blue Noise, and Engraving raster algorithms running directly in WebGL2 fragment shaders to disguise sensitive memory until authenticated cursor interaction.
            </p>
          </div>
        </BorderGlow>

        <BorderGlow
          edgeSensitivity={30}
          glowColor="280 84 60"
          backgroundColor="#0F172A"
          borderRadius={16}
          glowRadius={36}
          glowIntensity={1.2}
          coneSpread={26}
          animated={true}
          colors={['#c084fc', '#f472b6', '#a855f7']}
          className="w-full"
        >
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-2 text-purple-400">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-cyber font-bold text-sm tracking-wider text-slate-200">
                CLICK SHOCKWAVE RADIUS
              </h4>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Clicking the viewport dispatches an expanding shockwave pulse that temporarily sweeps away the dither barrier, revealing deep forensic layers across the perimeter.
            </p>
          </div>
        </BorderGlow>

        <BorderGlow
          edgeSensitivity={30}
          glowColor="160 84 45"
          backgroundColor="#0F172A"
          borderRadius={16}
          glowRadius={36}
          glowIntensity={1.2}
          coneSpread={26}
          animated={true}
          colors={['#34d399', '#10b981', '#059669']}
          className="w-full"
        >
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-2 text-emerald-400">
              <Shield className="w-5 h-5" />
              <h4 className="font-cyber font-bold text-sm tracking-wider text-slate-200">
                FAIL-CLOSED INTEGRITY
              </h4>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Tied to AEGIS Policy POL-006 (Critical Asset & Credential Quarantine). Unverified agents or suspicious prompts are blocked at the perimeter before payload decompression.
            </p>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
};
