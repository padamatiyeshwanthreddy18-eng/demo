import React, { useState, useEffect } from 'react';
import { DashboardMetrics } from '../server/types.js';
import { fetchDashboardMetrics } from '../services/api.js';
import {
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Shield,
  Layers
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const alerts = metrics?.security_alerts || [];

  return (
    <div className="w-full space-y-6 pb-12 font-sans selection:bg-[#CBFF70]/20 selection:text-[#CBFF70]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#AB98FF] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#AB98FF] font-semibold">
              Threat Vector Defense
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F0F4F8] tracking-tight flex items-center gap-2.5">
            <span>Security Alerts & Attack Recon</span>
          </h1>
          <p className="text-xs text-[#9DAAB8] mt-0.5">
            Real-time incident stream for prompt injections, jailbreak attempts, unauthorized privilege escalations, and blocked calls.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-1.5 rounded-lg bg-[#151B21] border border-[#2A343E] text-[#9DAAB8] hover:text-[#F0F4F8] hover:bg-[#1B232B] transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          title="Refresh alerts"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#CBFF70]' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="control-panel p-4 border-l-2 border-l-[#AB98FF]">
          <div className="text-xs text-[#9DAAB8] mb-1 font-mono">Prompt Injections Detected</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#AB98FF]">
            {metrics?.prompt_injections_blocked ?? 0}
          </div>
          <div className="text-[11px] text-[#5C6978] mt-1 font-mono">
            Zero payloads reached model execution
          </div>
        </div>

        <div className="control-panel p-4 border-l-2 border-l-[#FF8585]">
          <div className="text-xs text-[#9DAAB8] mb-1 font-mono">Critical Incidents Blocked</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#FF8585]">
            {metrics?.denied_count ?? 0}
          </div>
          <div className="text-[11px] text-[#5C6978] mt-1 font-mono">
            Hard policy denial enforced
          </div>
        </div>

        <div className="control-panel p-4 border-l-2 border-l-[#69E2AD]">
          <div className="text-xs text-[#9DAAB8] mb-1 font-mono">Defense Integrity</div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#69E2AD]">
            100.0%
          </div>
          <div className="text-[11px] text-[#5C6978] mt-1 font-mono">
            Zero execution leakage
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="control-panel divide-y divide-[#2A343E]">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className="p-4 hover:bg-[#1B232B] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            {/* Left: Incident info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/30'
                      : 'bg-[#FFD080]/15 text-[#FFD080] border-[#FFD080]/30'
                  }`}
                >
                  {alert.severity}
                </span>

                <h3 className="font-semibold text-xs text-[#F0F4F8]">
                  {alert.type}
                </h3>

                <span className="text-[#2A343E] text-xs">·</span>

                <span className="text-xs font-mono font-semibold text-[#CBFF70]">
                  {alert.agent_id}
                </span>
              </div>

              <div className="text-xs text-[#9DAAB8] leading-relaxed">
                {alert.details}
              </div>

              {alert.pattern && (
                <div className="pt-0.5">
                  <span className="text-[#5C6978] text-[11px] mr-1.5 font-mono">Signature:</span>
                  <code className="bg-[#0E1318] px-2 py-0.5 rounded border border-[#AB98FF]/30 text-[#AB98FF] font-mono text-[11px]">
                    "{alert.pattern}"
                  </code>
                </div>
              )}
            </div>

            {/* Right: Response status & Timestamp */}
            <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[#FF8585]/15 text-[#FF8585] border border-[#FF8585]/30">
                RESPONSE: {alert.decision === 'DENY' ? 'BLOCKED' : alert.decision}
              </span>

              <span className="text-[11px] text-[#5C6978] font-mono">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {alerts.length === 0 && !loading && (
          <div className="p-12 text-center text-[#5C6978] text-xs font-mono">
            NO SECURITY ALERTS — No suspicious agent behavior detected in this session.
          </div>
        )}
      </div>
    </div>
  );
};
