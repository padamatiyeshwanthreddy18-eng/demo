import React from 'react';
import { RiskResult, RiskLevel } from '../server/types.js';
import { AlertTriangle, ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';

interface RiskGaugeProps {
  risk: RiskResult;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ risk, size = 'md' }) => {
  const score = Math.min(100, Math.max(0, risk.risk_score));

  // Determine color and styling according to score
  let strokeColor = '#10B981'; // Green
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let textColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300';
  let StatusIcon = ShieldCheck;

  if (score >= 71) {
    strokeColor = '#EF4444'; // Red
    glowColor = 'rgba(239, 68, 68, 0.5)';
    textColor = 'text-red-400';
    badgeBg = 'bg-red-950/60 border-red-500/40 text-red-300';
    StatusIcon = AlertOctagon;
  } else if (score >= 45) {
    strokeColor = '#F97316'; // Orange / High
    glowColor = 'rgba(249, 115, 22, 0.4)';
    textColor = 'text-orange-400';
    badgeBg = 'bg-orange-950/60 border-orange-500/40 text-orange-300';
    StatusIcon = ShieldAlert;
  } else if (score >= 31) {
    strokeColor = '#F59E0B'; // Amber / Medium
    glowColor = 'rgba(245, 158, 11, 0.4)';
    textColor = 'text-amber-400';
    badgeBg = 'bg-amber-950/60 border-amber-500/40 text-amber-300';
    StatusIcon = AlertTriangle;
  }

  // Semicircular SVG gauge calculations
  // Arc angle from 180 deg to 0 deg (or math coordinates)
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const components = [
    { label: 'Action Type', value: risk.components?.action_risk ?? 15, max: 25 },
    { label: 'Task Relevance', value: risk.components?.task_relevance_risk ?? 5, max: 15 },
    { label: 'Data Sensitivity', value: risk.components?.sensitivity_risk ?? 12, max: 25 },
    { label: 'Destination Trust', value: risk.components?.destination_trust_risk ?? 4, max: 15 },
    { label: 'Agent Permission', value: risk.components?.agent_permission_risk ?? 2, max: 20 },
    { label: 'Prompt Injection', value: risk.components?.prompt_injection_risk ?? 0, max: 30 },
    { label: 'Policy Violations', value: risk.components?.policy_violations_risk ?? 0, max: 20 },
    { label: 'Data Provenance', value: risk.components?.provenance_risk ?? 3, max: 15 },
    { label: 'Irreversibility', value: risk.components?.irreversibility_risk ?? 2, max: 15 },
    { label: 'Identity Risk', value: risk.components?.identity_risk ?? 2, max: 30 },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Semi-circular gauge container */}
      <div className="relative flex flex-col items-center justify-center p-2">
        <svg className="w-56 h-32 overflow-visible" viewBox="0 0 200 115">
          <defs>
            <linearGradient id="gaugeBg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#065f46" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#854d0e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0.2" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={glowColor} />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={strokeColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Gauge needle indicator dot */}
          <circle
            cx="100"
            cy="100"
            r="5"
            fill="#38bdf8"
            className="shadow-[0_0_10px_#38bdf8]"
          />
        </svg>

        {/* Center Score Numbers */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Risk Score
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-cyber font-bold tracking-tight ${textColor}`}>
              {score}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 100</span>
          </div>

          <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-cyber font-semibold tracking-wider border flex items-center gap-1 ${badgeBg}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{risk.risk_level}</span>
          </div>
        </div>
      </div>

      {/* Dominant Risk Driver Pill */}
      {risk.dominant_factor && (
        <div className="mt-2 text-center text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1 rounded-md border border-slate-800">
          Primary Driver: <span className="text-cyan-300 font-semibold">{risk.dominant_factor}</span>
        </div>
      )}

      {/* Breakdown Components List */}
      <div className="w-full mt-5 space-y-2">
        <div className="text-xs font-cyber font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between border-b border-slate-800/80 pb-1">
          <span>Risk Factor Attribution</span>
          <span className="font-mono text-[10px] text-slate-500">Score / Max</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {components.map(item => {
            const pct = Math.min(100, Math.round((item.value / item.max) * 100));
            let barColor = 'bg-emerald-500';
            if (pct >= 70) barColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
            else if (pct >= 40) barColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';

            return (
              <div key={item.label} className="bg-slate-950/40 p-2 rounded border border-slate-800/60">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-mono text-slate-400">
                    {item.value} <span className="text-slate-600">/ {item.max}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
