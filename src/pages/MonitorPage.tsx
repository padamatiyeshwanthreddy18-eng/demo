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
  X,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export const MonitorPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ALLOWED' | 'APPROVAL' | 'DENIED' | 'ATTACKS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [copiedId, setCopiedId] = useState(false);

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans selection:bg-[#CBFF70]/20 selection:text-[#CBFF70]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#69E2AD] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#69E2AD] font-semibold">
              Telemetry Stream
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F0F4F8] tracking-tight flex items-center gap-2.5">
            <span>Live Security Monitor</span>
          </h1>
          <p className="text-xs text-[#9DAAB8] mt-0.5">
            Real-time event stream of autonomous AI agent dispatches and security interception outcomes.
          </p>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5C6978] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agent, tool, asset..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#151B21] border border-[#2A343E] rounded-lg pl-8 pr-3 py-1.5 text-[#F0F4F8] text-xs font-mono focus:outline-none focus:border-[#CBFF70] w-48 sm:w-60 shadow-xs"
            />
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-[#151B21] border border-[#2A343E] text-[#9DAAB8] hover:text-[#F0F4F8] hover:bg-[#1B232B] transition-colors cursor-pointer shadow-xs"
            title="Refresh stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#CBFF70]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs font-mono">
        {(['ALL', 'ALLOWED', 'APPROVAL', 'DENIED', 'ATTACKS'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-[#1B232B] text-[#CBFF70] font-semibold border border-[#2A343E]'
                : 'text-[#9DAAB8] hover:text-[#F0F4F8] hover:bg-[#151B21]'
            }`}
          >
            {tab === 'ALL' ? 'All Events' : tab === 'ALLOWED' ? 'Allowed' : tab === 'APPROVAL' ? 'Approval Escrow' : tab === 'DENIED' ? 'Blocked' : 'Attacks & Critical'}
          </button>
        ))}
      </div>

      {/* Stream Table */}
      <div className="control-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2A343E] text-[#5C6978] text-[11px] font-mono bg-[#101419]">
                <th className="py-2.5 px-3 font-semibold">Time</th>
                <th className="py-2.5 px-3 font-semibold">Agent</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Resource</th>
                <th className="py-2.5 px-3 font-semibold">Risk Score</th>
                <th className="py-2.5 px-3 text-right font-semibold">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A343E]">
              {logs.map(row => {
                let riskCategory = 'Low';
                let riskColor = 'text-[#69E2AD]';
                if (row.risk_score >= 71) {
                  riskCategory = 'Critical';
                  riskColor = 'text-[#FF8585]';
                } else if (row.risk_score >= 45) {
                  riskCategory = 'High';
                  riskColor = 'text-[#FFD080]';
                } else if (row.risk_score >= 31) {
                  riskCategory = 'Medium';
                  riskColor = 'text-[#FFD080]';
                }

                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedLog(row)}
                    className="hover:bg-[#1B232B] transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 text-[#5C6978] text-xs font-mono">
                      {new Date(row.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-[#F0F4F8] font-mono text-xs font-semibold group-hover:text-[#CBFF70] transition-colors">
                      {row.agent_id}
                    </td>
                    <td className="py-2.5 px-3 text-[#CBFF70] font-mono text-xs font-semibold">
                      {row.action}
                    </td>
                    <td className="py-2.5 px-3 text-[#9DAAB8] font-mono text-xs truncate max-w-[180px]">
                      {row.resource}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-mono font-semibold ${riskColor}`}>
                        {row.risk_score}
                      </span>
                      <span className="text-[#5C6978] text-[11px] ml-1.5 font-mono">
                        {riskCategory}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          row.decision === 'ALLOW'
                            ? 'bg-[#69E2AD]/15 text-[#69E2AD] border-[#69E2AD]/30'
                            : row.decision === 'REQUIRE_APPROVAL'
                            ? 'bg-[#FFD080]/15 text-[#FFD080] border-[#FFD080]/30'
                            : 'bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/30'
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
                  <td colSpan={6} className="py-10 text-center text-[#5C6978] text-xs font-mono">
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
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[#151B21] border-l border-[#2A343E] p-6 overflow-y-auto space-y-4 shadow-2xl relative permission-boundary-vertical">
            <div className="flex items-center justify-between border-b border-[#2A343E] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F0F4F8] font-mono">
                <Terminal className="w-4 h-4 text-[#CBFF70]" />
                <span>Forensic Telemetry Inspector</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#9DAAB8] hover:text-[#F0F4F8] p-1 rounded hover:bg-[#1B232B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-[#0E1318] rounded-lg border border-[#2A343E] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#5C6978]">Request ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#CBFF70] font-bold">{selectedLog.request_id}</span>
                    <button
                      onClick={() => handleCopy(selectedLog.request_id)}
                      className="text-[#5C6978] hover:text-[#CBFF70]"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-[#69E2AD]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Timestamp:</span>
                  <span className="text-[#9DAAB8]">{selectedLog.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Agent:</span>
                  <span className="text-[#F0F4F8] font-medium">{selectedLog.agent_id} ({selectedLog.agent_role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Action:</span>
                  <span className="text-[#CBFF70] font-semibold">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Tool:</span>
                  <span className="text-[#AB98FF]">{selectedLog.tool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Resource:</span>
                  <span className="text-[#F0F4F8] truncate max-w-[200px]">{selectedLog.resource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Risk Score:</span>
                  <span className="text-[#FF8585] font-bold">{selectedLog.risk_score} / 100</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#2A343E]">
                  <span className="text-[#5C6978]">Verdict:</span>
                  <span className="text-[#69E2AD] font-bold">{selectedLog.decision}</span>
                </div>
              </div>

              <div className="p-3 bg-[#0E1318] rounded-lg border border-[#2A343E] space-y-1">
                <span className="text-[#5C6978] block text-[11px]">Enforced Policy:</span>
                <div className="text-[#CBFF70] font-semibold">{selectedLog.matched_policy || 'POL-DEFAULT-INVARIANT'}</div>
                <div className="text-[#9DAAB8] text-[11px] font-sans leading-relaxed pt-1">
                  {selectedLog.reason}
                </div>
              </div>

              <div className="p-3 bg-[#0E1318] rounded-lg border border-[#2A343E] space-y-1">
                <span className="text-[#5C6978] block text-[11px]">Audit Hash & Signature:</span>
                <code className="text-[#AB98FF] text-[10px] break-all block">
                  {selectedLog.signature || 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
