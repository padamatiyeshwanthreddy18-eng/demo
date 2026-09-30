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
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#18212F] tracking-tight flex items-center gap-2.5">
            <span>Security Alerts</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[5px] bg-[#F2ECFF] text-[#8B5CF6] border border-[#8B5CF6]/30">
              Adversarial Defense
            </span>
          </h1>
          <p className="text-xs text-[#596579] mt-0.5">
            Incident feed for jailbreaks, prompt injections, privilege escalation attempts, and blocked operations.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-1.5 rounded-[7px] bg-white border border-[#CDD3DB] text-[#596579] hover:text-[#18212F] hover:bg-[#F1F3F5] transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          title="Refresh alerts"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="aegis-panel p-4">
          <div className="text-xs text-[#596579] mb-1 font-medium">Prompt Injections Detected</div>
          <div className="text-3xl font-semibold font-mono tabular-nums text-[#8B5CF6]">
            {metrics?.prompt_injections_blocked ?? 0}
          </div>
          <div className="text-[11px] text-[#8A94A3] mt-1">
            Zero payloads reached model execution
          </div>
        </div>

        <div className="aegis-panel p-4">
          <div className="text-xs text-[#596579] mb-1 font-medium">Critical Incidents Blocked</div>
          <div className="text-3xl font-semibold font-mono tabular-nums text-[#E65353]">
            {metrics?.denied_count ?? 0}
          </div>
          <div className="text-[11px] text-[#8A94A3] mt-1">
            Hard policy denial enforced
          </div>
        </div>

        <div className="aegis-panel p-4">
          <div className="text-xs text-[#596579] mb-1 font-medium">Defense Integrity</div>
          <div className="text-3xl font-semibold font-mono tabular-nums text-[#21A67A]">
            100.0%
          </div>
          <div className="text-[11px] text-[#8A94A3] mt-1">
            Zero execution leakage
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="aegis-panel divide-y divide-[#E2E6EB]">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className="p-4 hover:bg-[#F6F7F9] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            {/* Left: Incident info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[4px] ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-[#FDECEC] text-[#E65353] border border-[#E65353]/30'
                      : 'bg-[#FFF4DE] text-[#D99018] border border-[#D99018]/30'
                  }`}
                >
                  {alert.severity}
                </span>

                <h3 className="font-semibold text-xs text-[#18212F]">
                  {alert.type}
                </h3>

                <span className="text-[#CDD3DB] text-xs">·</span>

                <span className="text-xs font-mono font-semibold text-[#168C82]">
                  {alert.agent_id}
                </span>
              </div>

              <div className="text-xs text-[#596579] leading-relaxed">
                {alert.details}
              </div>

              {alert.pattern && (
                <div className="pt-0.5">
                  <span className="text-[#8A94A3] text-[11px] mr-1.5 font-medium">Signature:</span>
                  <code className="bg-[#F2ECFF] px-2 py-0.5 rounded border border-[#8B5CF6]/30 text-[#7C3AED] font-mono text-[11px]">
                    "{alert.pattern}"
                  </code>
                </div>
              )}
            </div>

            {/* Right: Response status & Timestamp */}
            <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-[5px] text-[11px] font-mono font-bold bg-[#FDECEC] text-[#E65353] border border-[#E65353]/30">
                RESPONSE: {alert.decision === 'DENY' ? 'BLOCKED' : alert.decision}
              </span>

              <span className="text-[11px] text-[#8A94A3] font-mono">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {alerts.length === 0 && !loading && (
          <div className="p-12 text-center text-[#8A94A3] text-xs">
            NO SECURITY ALERTS — No suspicious agent behavior detected in this session.
          </div>
        )}
      </div>
    </div>
  );
};
