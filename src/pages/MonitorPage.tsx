import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../server/types.js';
import { fetchAuditLogs } from '../services/api.js';
import {
  Radio,
  Search,
  RefreshCw,
  Terminal,
  ShieldAlert,
  ChevronRight,
  X
} from 'lucide-react';

export const MonitorPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ALLOWED' | 'APPROVAL' | 'DENIED' | 'ATTACKS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      let decisionParam: string | undefined = undefined;
      if (filter === 'ALLOWED') decisionParam = 'ALLOW';
      else if (filter === 'APPROVAL') decisionParam = 'REQUIRE_APPROVAL';
      else if (filter === 'DENIED') decisionParam = 'DENY';

      const data = await fetchAuditLogs({
        search: searchQuery,
        decision: decisionParam
      });

      let filtered = data;
      if (filter === 'ATTACKS') {
        filtered = data.filter(d => d.prompt_injection_detected || d.risk_score >= 71);
      }

      setLogs(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter, searchQuery]);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#18212F] tracking-tight flex items-center gap-2.5">
            <span>Live Security Monitor</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-[#E7F7F1] border border-[#21A67A]/30 text-[#21A67A] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A] animate-pulse" />
              Streaming
            </span>
          </h1>
          <p className="text-xs text-[#596579] mt-0.5">
            Real-time event stream of autonomous AI agent dispatches and security interception outcomes.
          </p>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A94A3] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agent, tool, asset..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white border border-[#D8DEE6] rounded-[7px] pl-8 pr-3 py-1.5 text-[#18212F] focus:outline-none focus:border-[#168C82] w-48 sm:w-60 text-xs shadow-xs"
            />
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-[7px] bg-white border border-[#CDD3DB] text-[#596579] hover:text-[#18212F] hover:bg-[#F1F3F5] transition-colors cursor-pointer shadow-xs"
            title="Refresh stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs border-b border-[#E2E6EB] pb-2">
        {(['ALL', 'ALLOWED', 'APPROVAL', 'DENIED', 'ATTACKS'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-[6px] text-xs transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-[#E7F5F3] text-[#116F68] font-semibold border border-[#168C82]/30'
                : 'text-[#596579] hover:text-[#18212F] hover:bg-white'
            }`}
          >
            {tab === 'ALL' ? 'All Events' : tab === 'ALLOWED' ? 'Allowed' : tab === 'APPROVAL' ? 'Approval Escrow' : tab === 'DENIED' ? 'Blocked' : 'Attacks & Critical'}
          </button>
        ))}
      </div>

      {/* Stream Table */}
      <div className="aegis-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E6EB] text-[#596579] text-[11px] bg-[#F6F7F9]">
                <th className="py-2.5 px-3 font-semibold">Time</th>
                <th className="py-2.5 px-3 font-semibold">Agent</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Resource</th>
                <th className="py-2.5 px-3 font-semibold">Risk Score</th>
                <th className="py-2.5 px-3 text-right font-semibold">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EB]">
              {logs.map(row => {
                let riskCategory = 'Low';
                let riskColor = 'text-[#21A67A]';
                if (row.risk_score >= 71) {
                  riskCategory = 'Critical';
                  riskColor = 'text-[#E65353]';
                } else if (row.risk_score >= 45) {
                  riskCategory = 'High';
                  riskColor = 'text-[#F97316]';
                } else if (row.risk_score >= 31) {
                  riskCategory = 'Medium';
                  riskColor = 'text-[#D99018]';
                }

                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedLog(row)}
                    className="hover:bg-[#F6F7F9] transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 text-[#596579] text-xs font-mono">
                      {new Date(row.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-[#18212F] font-mono text-xs font-semibold group-hover:text-[#168C82] transition-colors">
                      {row.agent_id}
                    </td>
                    <td className="py-2.5 px-3 text-[#168C82] font-mono text-xs font-semibold">
                      {row.action}
                    </td>
                    <td className="py-2.5 px-3 text-[#596579] font-mono text-xs truncate max-w-[180px]">
                      {row.resource}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-mono font-semibold ${riskColor}`}>
                        {row.risk_score}
                      </span>
                      <span className="text-[#8A94A3] text-[11px] ml-1.5">
                        {riskCategory}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-semibold ${
                          row.decision === 'ALLOW'
                            ? 'bg-[#E7F7F1] text-[#21A67A] border border-[#21A67A]/30'
                            : row.decision === 'REQUIRE_APPROVAL'
                            ? 'bg-[#FFF4DE] text-[#D99018] border border-[#D99018]/30'
                            : 'bg-[#FDECEC] text-[#E65353] border border-[#E65353]/30'
                        }`}
                      >
                        {row.decision === 'REQUIRE_APPROVAL' ? 'APPROVAL' : row.decision}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#8A94A3] text-xs">
                    No security events — No agent activity matches the current query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Forensic Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white border-l border-[#CDD3DB] p-6 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#18212F]">
                <Terminal className="w-4 h-4 text-[#168C82]" />
                <span>Forensic Telemetry</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#8A94A3] hover:text-[#18212F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F6F7F9] rounded-[8px] border border-[#E2E6EB] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Request ID:</span>
                  <span className="text-[#168C82] font-mono font-semibold">{selectedLog.request_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Timestamp:</span>
                  <span className="text-[#596579] font-mono">{selectedLog.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Agent:</span>
                  <span className="text-[#18212F] font-mono font-medium">{selectedLog.agent_id} ({selectedLog.agent_role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Action & Tool:</span>
                  <span className="text-[#18212F] font-mono font-medium">{selectedLog.action} via {selectedLog.tool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Resource:</span>
                  <span className="text-[#18212F] font-mono truncate max-w-[200px]">{selectedLog.resource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Risk Score:</span>
                  <span className="text-[#E65353] font-mono font-bold">{selectedLog.risk_score} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Matched Policy:</span>
                  <span className="text-[#8B5CF6] font-mono font-semibold">{selectedLog.matched_policy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Decision:</span>
                  <span className="font-bold text-[#18212F]">{selectedLog.decision}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Execution Status:</span>
                  <span className="text-[#21A67A] font-bold">{selectedLog.execution_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Latency:</span>
                  <span className="text-[#596579] font-mono">{selectedLog.latency_ms} ms</span>
                </div>
              </div>

              <div>
                <span className="text-[#18212F] font-medium block mb-1 text-xs">Reason / Finding:</span>
                <div className="p-3 bg-[#F6F7F9] rounded-[8px] border border-[#E2E6EB] text-[#596579] text-xs leading-relaxed">
                  {selectedLog.reason}
                </div>
              </div>

              {selectedLog.prompt_injection_detected && (
                <div className="p-3 bg-[#F2ECFF] border border-[#8B5CF6]/30 rounded-[8px] text-[#7C3AED] text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                  <span>Prompt Injection detected on this request. Malicious instruction override neutralized.</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E2E6EB]">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2 rounded-[7px] bg-[#F1F3F5] hover:bg-[#E2E6EB] text-xs text-[#18212F] transition-colors cursor-pointer font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
