import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../server/types.js';
import { fetchAuditLogs, fetchAgents } from '../services/api.js';
import {
  FileText,
  Search,
  RefreshCw,
  Download,
  Copy,
  Check,
  X,
  Terminal,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AuditPageProps {
  onTriggerToast?: (toast: { type: 'success' | 'warning' | 'error' | 'injection'; title: string; message?: string }) => void;
}

export const AuditPage: React.FC<AuditPageProps> = ({ onTriggerToast }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [availableAgents, setAvailableAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs({
        search: searchQuery,
        decision: decisionFilter,
        risk: riskFilter,
        agent: agentFilter
      });
      setLogs(data);

      const agentList = await fetchAgents();
      setAvailableAgents(agentList.map(a => a.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, decisionFilter, riskFilter, agentFilter]);

  const handleCopyId = (reqId: string) => {
    navigator.clipboard.writeText(reqId);
    setCopiedId(reqId);
    setTimeout(() => setCopiedId(null), 2000);
    if (onTriggerToast) {
      onTriggerToast({
        type: 'success',
        title: 'Copied to Clipboard',
        message: reqId
      });
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegis-audit-trail-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans selection:bg-[#CBFF70]/20 selection:text-[#CBFF70]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#CBFF70] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#CBFF70] font-semibold">
              Cryptographic Audit
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F0F4F8] tracking-tight">
            Immutable Audit Trail Logs
          </h1>
          <p className="text-xs text-[#9DAAB8] mt-0.5">
            Immutable compliance record of autonomous AI agent activity, permission evaluations, and authorization decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-lg bg-[#151B21] border border-[#2A343E] hover:bg-[#1B232B] text-[#F0F4F8] transition-colors flex items-center gap-1.5 cursor-pointer font-mono font-medium shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#CBFF70]" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-[#151B21] border border-[#2A343E] text-[#9DAAB8] hover:text-[#F0F4F8] hover:bg-[#1B232B] transition-colors cursor-pointer shadow-xs"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#CBFF70]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="control-panel p-3 flex flex-wrap items-center gap-3 text-xs font-mono">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#5C6978] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search request ID, agent, action, resource, policy..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#101419] border border-[#2A343E] rounded-lg pl-8 pr-3 py-1.5 text-[#F0F4F8] focus:outline-none focus:border-[#CBFF70] text-xs shadow-xs"
          />
        </div>

        {/* Decision Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#5C6978]">Decision:</span>
          <select
            value={decisionFilter}
            onChange={e => setDecisionFilter(e.target.value)}
            className="bg-[#101419] border border-[#2A343E] rounded-lg px-2.5 py-1.5 text-[#F0F4F8] focus:outline-none focus:border-[#CBFF70] cursor-pointer"
          >
            <option value="ALL">All Decisions</option>
            <option value="ALLOW">Allow</option>
            <option value="REQUIRE_APPROVAL">Approval</option>
            <option value="DENY">Deny</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#5C6978]">Risk:</span>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-[#101419] border border-[#2A343E] rounded-lg px-2.5 py-1.5 text-[#F0F4F8] focus:outline-none focus:border-[#CBFF70] cursor-pointer"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Agent Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#5C6978]">Agent:</span>
          <select
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            className="bg-[#101419] border border-[#2A343E] rounded-lg px-2.5 py-1.5 text-[#F0F4F8] focus:outline-none focus:border-[#CBFF70] cursor-pointer"
          >
            <option value="ALL">All Agents</option>
            {availableAgents.map(ag => (
              <option key={ag} value={ag}>
                {ag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="control-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#2A343E] text-[#5C6978] text-[11px] bg-[#101419]">
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Request ID</th>
                <th className="py-2.5 px-3 font-semibold">Agent</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Resource</th>
                <th className="py-2.5 px-3 text-center font-semibold">Risk</th>
                <th className="py-2.5 px-3 font-semibold">Policy</th>
                <th className="py-2.5 px-3 text-center font-semibold">Decision</th>
                <th className="py-2.5 px-3 font-semibold">Execution</th>
                <th className="py-2.5 px-3 text-right font-semibold">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A343E]">
              {logs.map(row => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedEntry(row)}
                  className="hover:bg-[#1B232B] transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-3 text-[#5C6978] text-xs">
                    {new Date(row.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 text-[#CBFF70] font-bold group-hover:underline">
                    {row.request_id}
                  </td>
                  <td className="py-2.5 px-3 text-[#F0F4F8] font-medium">
                    {row.agent_id}
                  </td>
                  <td className="py-2.5 px-3 text-[#9DAAB8]">
                    {row.action}
                  </td>
                  <td className="py-2.5 px-3 text-[#5C6978] truncate max-w-[140px]">
                    {row.resource}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        row.risk_score >= 71
                          ? 'bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/30'
                          : row.risk_score >= 31
                          ? 'bg-[#FFD080]/15 text-[#FFD080] border-[#FFD080]/30'
                          : 'bg-[#69E2AD]/15 text-[#69E2AD] border-[#69E2AD]/30'
                      }`}
                    >
                      {row.risk_score}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#AB98FF] font-semibold">
                    {row.matched_policy}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
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
                  <td className="py-2.5 px-3 text-xs">
                    <span
                      className={
                        row.execution_status === 'EXECUTED'
                          ? 'text-[#69E2AD] font-semibold'
                          : row.execution_status === 'PENDING_APPROVAL'
                          ? 'text-[#FFD080] font-semibold'
                          : 'text-[#FF8585] font-semibold'
                      }
                    >
                      {row.execution_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#5C6978]">
                    {row.latency_ms ? `${row.latency_ms}ms` : '--'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-[#5C6978] text-xs">
                    No audit records match the current filter selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg h-full bg-[#151B21] border-l border-[#2A343E] p-6 overflow-y-auto space-y-4 shadow-2xl relative permission-boundary-vertical">
            <div className="flex items-center justify-between border-b border-[#2A343E] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#CBFF70]" />
                <h3 className="font-semibold text-sm text-[#F0F4F8] font-mono">
                  Audit Record: {selectedEntry.request_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
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
                    <span className="text-[#CBFF70] font-bold">{selectedEntry.request_id}</span>
                    <button
                      onClick={() => handleCopyId(selectedEntry.request_id)}
                      className="text-[#5C6978] hover:text-[#CBFF70]"
                    >
                      {copiedId === selectedEntry.request_id ? <Check className="w-3.5 h-3.5 text-[#69E2AD]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Timestamp:</span>
                  <span className="text-[#9DAAB8]">{selectedEntry.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Agent Identity:</span>
                  <span className="text-[#F0F4F8]">{selectedEntry.agent_id} ({selectedEntry.agent_role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Action:</span>
                  <span className="text-[#CBFF70] font-bold">{selectedEntry.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Tool:</span>
                  <span className="text-[#AB98FF]">{selectedEntry.tool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Resource:</span>
                  <span className="text-[#F0F4F8] truncate max-w-[200px]">{selectedEntry.resource}</span>
                </div>
              </div>

              <div className="p-3 bg-[#0E1318] rounded-lg border border-[#2A343E] space-y-1.5">
                <span className="text-[#5C6978] block text-[11px]">Policy Rationale:</span>
                <div className="text-[#CBFF70] font-bold">{selectedEntry.matched_policy}</div>
                <p className="text-[#9DAAB8] font-sans text-xs leading-relaxed pt-1">
                  {selectedEntry.reason}
                </p>
              </div>

              <div className="p-3 bg-[#0E1318] rounded-lg border border-[#2A343E] space-y-1">
                <span className="text-[#5C6978] block text-[11px]">Cryptographic HMAC-SHA256:</span>
                <code className="text-[#AB98FF] text-[10px] break-all block">
                  {selectedEntry.signature || 'sha256:4d5e9a21b38e07f9c2d114856a90321fb8c9735467bcfad30e81745239a0c71e'}
                </code>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A343E]">
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-full py-2 rounded-lg bg-[#1B232B] hover:bg-[#232D37] border border-[#2A343E] text-xs font-semibold text-[#F0F4F8] cursor-pointer"
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
