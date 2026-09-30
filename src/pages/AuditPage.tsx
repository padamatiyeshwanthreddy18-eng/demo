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
  Layers
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
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#18212F] tracking-tight">
            Audit Trail
          </h1>
          <p className="text-xs text-[#596579] mt-0.5">
            Immutable compliance record of autonomous AI agent activity, permission evaluations, and authorization decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-[7px] bg-white border border-[#CDD3DB] hover:bg-[#F1F3F5] text-[#18212F] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={loadData}
            className="p-1.5 rounded-[7px] bg-white border border-[#CDD3DB] text-[#596579] hover:text-[#18212F] hover:bg-[#F1F3F5] transition-colors cursor-pointer shadow-xs"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Enterprise Filter Toolbar */}
      <div className="aegis-panel p-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#8A94A3] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search request ID, agent, action, resource, policy..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#D8DEE6] rounded-[6px] pl-8 pr-3 py-1 text-[#18212F] focus:outline-none focus:border-[#168C82] text-xs shadow-xs"
          />
        </div>

        {/* Decision Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8A94A3]">Decision:</span>
          <select
            value={decisionFilter}
            onChange={e => setDecisionFilter(e.target.value)}
            className="bg-white border border-[#D8DEE6] rounded-[6px] px-2.5 py-1 text-[#18212F] focus:outline-none focus:border-[#168C82] cursor-pointer shadow-xs"
          >
            <option value="ALL">All Decisions</option>
            <option value="ALLOW">Allow</option>
            <option value="REQUIRE_APPROVAL">Approval</option>
            <option value="DENY">Deny</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8A94A3]">Risk:</span>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-white border border-[#D8DEE6] rounded-[6px] px-2.5 py-1 text-[#18212F] focus:outline-none focus:border-[#168C82] cursor-pointer shadow-xs"
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
          <span className="text-[#8A94A3]">Agent:</span>
          <select
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            className="bg-white border border-[#D8DEE6] rounded-[6px] px-2.5 py-1 text-[#18212F] focus:outline-none focus:border-[#168C82] cursor-pointer shadow-xs"
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
      <div className="aegis-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E6EB] text-[#596579] text-[11px] bg-[#F6F7F9]">
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
            <tbody className="divide-y divide-[#E2E6EB]">
              {logs.map(row => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedEntry(row)}
                  className="hover:bg-[#F6F7F9] transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-3 text-[#596579] text-xs font-mono">
                    {new Date(row.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-[#168C82] font-semibold group-hover:underline">
                    {row.request_id}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-[#18212F] font-medium">
                    {row.agent_id}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-[#596579]">
                    {row.action}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-[#8A94A3] truncate max-w-[140px]">
                    {row.resource}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold ${
                        row.risk_score >= 71
                          ? 'bg-[#FDECEC] text-[#E65353]'
                          : row.risk_score >= 31
                          ? 'bg-[#FFF4DE] text-[#D99018]'
                          : 'bg-[#E7F7F1] text-[#21A67A]'
                      }`}
                    >
                      {row.risk_score}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#8B5CF6] font-mono text-xs font-semibold">
                    {row.matched_policy}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span
                      className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${
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
                  <td className="py-2.5 px-3 text-xs">
                    <span
                      className={
                        row.execution_status === 'EXECUTED'
                          ? 'text-[#21A67A] font-semibold'
                          : row.execution_status === 'PENDING_APPROVAL'
                          ? 'text-[#D99018] font-semibold'
                          : 'text-[#E65353] font-semibold'
                      }
                    >
                      {row.execution_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#8A94A3] text-xs font-mono">
                    {row.latency_ms} ms
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-[#8A94A3] text-xs">
                    No security events — No audit logs match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Inspection Drawer */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg h-full bg-white border-l border-[#CDD3DB] p-6 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#168C82]" />
                <h3 className="font-semibold text-sm text-[#18212F]">
                  Audit Record Forensics
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-[#8A94A3] hover:text-[#18212F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-[#F6F7F9] rounded-[7px] border border-[#E2E6EB]">
                <span className="text-[#8A94A3] font-medium">Request ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#168C82] font-mono font-bold">{selectedEntry.request_id}</span>
                  <button
                    onClick={() => handleCopyId(selectedEntry.request_id)}
                    className="p-1 rounded hover:bg-[#E2E6EB] text-[#596579] hover:text-[#18212F] cursor-pointer transition-colors"
                    title="Copy Request ID"
                  >
                    {copiedId === selectedEntry.request_id ? (
                      <Check className="w-3.5 h-3.5 text-[#21A67A]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#F6F7F9] rounded-[8px] border border-[#E2E6EB] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Timestamp:</span>
                  <span className="text-[#596579] font-mono">{selectedEntry.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Agent:</span>
                  <span className="text-[#18212F] font-mono font-medium">{selectedEntry.agent_id} ({selectedEntry.agent_role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Action & Tool:</span>
                  <span className="text-[#18212F] font-mono font-medium">{selectedEntry.action} ({selectedEntry.tool})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Target Resource:</span>
                  <span className="text-[#18212F] font-mono truncate max-w-[200px]">{selectedEntry.resource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Risk Score:</span>
                  <span className="text-[#E65353] font-mono font-bold">{selectedEntry.risk_score} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Policy Matched:</span>
                  <span className="text-[#8B5CF6] font-mono font-bold">{selectedEntry.matched_policy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Final Decision:</span>
                  <span className="font-bold text-[#18212F]">{selectedEntry.decision}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Execution Status:</span>
                  <span className="text-[#21A67A] font-bold">{selectedEntry.execution_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Pipeline Latency:</span>
                  <span className="text-[#596579] font-mono">{selectedEntry.latency_ms} ms</span>
                </div>
              </div>

              <div>
                <span className="text-[#18212F] font-medium block mb-1">Reason / Enforcement Finding:</span>
                <p className="p-3 bg-[#F6F7F9] rounded-[8px] border border-[#E2E6EB] text-[#596579] text-xs leading-relaxed">
                  {selectedEntry.reason}
                </p>
              </div>

              <div>
                <span className="text-[#18212F] font-medium block mb-1">Raw Forensic JSON Payload:</span>
                <pre className="p-3 rounded-[8px] bg-[#F1F3F5] border border-[#E2E6EB] text-[#18212F] font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedEntry, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E6EB] flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 rounded-[7px] bg-[#F1F3F5] hover:bg-[#E2E6EB] text-xs text-[#18212F] font-semibold cursor-pointer"
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
