import React from 'react';
import { RiskResult } from '../server/types.js';
import { AlertTriangle, ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';

interface RiskGaugeProps {
  risk: RiskResult;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ risk, size = 'md' }) => {
  const score = Math.min(100, Math.max(0, risk.risk_score));

  // Determine color and styling according to score matching Midnight tokens
  let strokeColor = '#69E2AD'; // Mint Emerald
  let glowColor = 'rgba(105, 226, 173, 0.4)';
  let textColor = 'text-[#69E2AD]';
  let badgeBg = 'bg-[#69E2AD]/10 border-[#69E2AD]/30 text-[#69E2AD]';
  let StatusIcon = ShieldCheck;

  if (score >= 71) {
    strokeColor = '#FF8585'; // Coral Red
    glowColor = 'rgba(255, 133, 133, 0.4)';
    textColor = 'text-[#FF8585]';
    badgeBg = 'bg-[#FF8585]/10 border-[#FF8585]/30 text-[#FF8585]';
    StatusIcon = AlertOctagon;
  } else if (score >= 45) {
    strokeColor = '#FFD080'; // Warm Gold
    glowColor = 'rgba(255, 208, 128, 0.35)';
    textColor = 'text-[#FFD080]';
    badgeBg = 'bg-[#FFD080]/10 border-[#FFD080]/30 text-[#FFD080]';
    StatusIcon = ShieldAlert;
  } else if (score >= 31) {
    strokeColor = '#FFD080';
    glowColor = 'rgba(255, 208, 128, 0.3)';
    textColor = 'text-[#FFD080]';
    badgeBg = 'bg-[#FFD080]/10 border-[#FFD080]/30 text-[#FFD080]';
    StatusIcon = AlertTriangle;
  }

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
            <filter id="gaugeGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={glowColor} />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1F2730"
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
            r="4"
            fill="#CBFF70"
            className="shadow-[0_0_8px_#CBFF70]"
          />
        </svg>

        {/* Center Score Numbers */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#9DAAB8]">
            Risk Score
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-mono font-bold tracking-tight ${textColor}`}>
              {score}
            </span>
            <span className="text-xs font-mono text-[#5C6978]">/ 100</span>
          </div>

          <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider border flex items-center gap-1 ${badgeBg}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{risk.risk_level}</span>
          </div>
        </div>
      </div>

      {/* Dominant Risk Driver Pill */}
      {risk.dominant_factor && (
        <div className="mt-2 text-center text-xs font-mono text-[#9DAAB8] bg-[#101419] px-3 py-1 rounded-md border border-[#2A343E]">
          Primary Driver: <span className="text-[#CBFF70] font-semibold">{risk.dominant_factor}</span>
        </div>
      )}

      {/* Breakdown Components List */}
      <div className="w-full mt-5 space-y-2">
        <div className="text-xs font-mono font-semibold tracking-wider text-[#9DAAB8] uppercase flex items-center justify-between border-b border-[#2A343E] pb-1.5">
          <span>Risk Factor Attribution</span>
          <span className="font-mono text-[10px] text-[#5C6978]">Score / Max</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {components.map(item => {
            const pct = Math.min(100, Math.round((item.value / item.max) * 100));
            let barColor = 'bg-[#69E2AD]';
            if (pct >= 70) barColor = 'bg-[#FF8585] shadow-[0_0_8px_rgba(255,133,133,0.5)]';
            else if (pct >= 40) barColor = 'bg-[#FFD080] shadow-[0_0_8px_rgba(255,208,128,0.5)]';

            return (
              <div key={item.label} className="bg-[#101419] p-2 rounded-lg border border-[#2A343E]/70">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-[#D0D9E2]">{item.label}</span>
                  <span className="font-mono text-[#9DAAB8]">
                    {item.value} <span className="text-[#5C6978]">/ {item.max}</span>
                  </span>
                </div>
                <div className="w-full bg-[#1B232B] h-1.5 rounded-full overflow-hidden">
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
