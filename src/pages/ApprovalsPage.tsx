import React, { useState, useEffect } from 'react';
import { PendingApprovalItem } from '../server/types.js';
import { fetchApprovals, approveRequest, rejectRequest } from '../services/api.js';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Tooltip } from '../components/Tooltip.js';
import LatticeLoader from '../components/LatticeLoader/LatticeLoader.js';
import ClickSpark from '../components/ClickSpark/ClickSpark.js';

interface ApprovalsPageProps {
  onRefreshMetrics?: () => void;
  onTriggerToast?: (toast: { type: 'success' | 'warning' | 'error' | 'injection'; title: string; message?: string }) => void;
}

export const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ onRefreshMetrics, onTriggerToast }) => {
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [loading, setLoading] = useState(true);
  const [pendingConfirmItem, setPendingConfirmItem] = useState<PendingApprovalItem | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchApprovals(activeTab === 'history');
      setApprovals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleAuthorize = async (item: PendingApprovalItem) => {
    setActionInProgress(item.request_id);
    try {
      await approveRequest(item.request_id, 'Security Operator');
      setPendingConfirmItem(null);
      await loadData();
      if (onRefreshMetrics) onRefreshMetrics();
      if (onTriggerToast) {
        onTriggerToast({
          type: 'success',
          title: 'Action Authorized',
          message: `Request ${item.request_id} released to Secure Executor.`
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (item: PendingApprovalItem) => {
    setActionInProgress(item.request_id);
    try {
      await rejectRequest(item.request_id, 'Security Operator');
      await loadData();
      if (onRefreshMetrics) onRefreshMetrics();
      if (onTriggerToast) {
        onTriggerToast({
          type: 'error',
          title: 'Action Rejected',
          message: `Request ${item.request_id} blocked.`
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;

  return (
    <ClickSpark sparkColor="#CBFF70" sparkRadius={18} sparkSize={8} sparkCount={7}>
      <div className="w-full space-y-6 pb-12 font-sans selection:bg-[#CBFF70]/20 selection:text-[#CBFF70]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FFD080] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFD080] font-semibold">
              Escrow Governance
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F0F4F8] tracking-tight flex items-center gap-2.5">
            <span>Human Approval Escrow Queue</span>
            {pendingCount > 0 && (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#FFD080]/15 text-[#FFD080] border border-[#FFD080]/30">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-xs text-[#9DAAB8] mt-0.5">
            High-risk autonomous AI actions paused before execution. Dual-key review and cryptographically logged sign-off.
          </p>
        </div>

        {/* Tab & Refresh Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-[#101419] p-0.5 rounded-lg border border-[#2A343E] flex items-center font-mono">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-[#1B232B] text-[#CBFF70] font-semibold border border-[#2A343E]'
                  : 'text-[#9DAAB8] hover:text-[#F0F4F8]'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#1B232B] text-[#CBFF70] font-semibold border border-[#2A343E]'
                  : 'text-[#9DAAB8] hover:text-[#F0F4F8]'
              }`}
            >
              Review History
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-[#151B21] border border-[#2A343E] text-[#9DAAB8] hover:text-[#F0F4F8] hover:bg-[#1B232B] transition-colors cursor-pointer shadow-xs"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#CBFF70]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Approvals Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <LatticeLoader
            status="working"
            label="Syncing Escrow Queue"
            pattern="ripple"
            grid={3}
            shape="round"
            cellSize={5}
            gap={2}
            fontSize={13}
            color="#CBFF70"
            showTimer={true}
          />
        </div>
      ) : approvals.length === 0 ? (
        <div className="control-panel p-12 text-center flex flex-col items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#69E2AD] mb-2.5" />
          <h3 className="font-bold text-sm text-[#F0F4F8] font-mono">
            NO PENDING ESCROW APPROVALS
          </h3>
          <p className="text-xs text-[#9DAAB8] mt-1 max-w-sm">
            All intercepted agent actions have been resolved under fail-closed security invariants.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvals.map(item => {
            const isPending = item.status === 'PENDING';
            const isProcessing = actionInProgress === item.request_id;

            return (
              <div
                key={item.id}
                className={`control-panel p-4 flex flex-col justify-between transition-all ${
                  isPending ? 'border-[#FFD080]/50 shadow-md' : 'opacity-70'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <span className="text-[11px] text-[#5C6978] font-mono uppercase tracking-wider">
                        {item.agent_role.replace('_', ' ')}
                      </span>
                      <h3 className="font-semibold text-sm text-[#F0F4F8] truncate max-w-[200px]">
                        {item.agent_name}
                      </h3>
                      <div className="text-xs font-mono font-medium text-[#CBFF70]">
                        {item.agent_id}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                          item.risk_score >= 71
                            ? 'bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/30'
                            : item.risk_score >= 31
                            ? 'bg-[#FFD080]/15 text-[#FFD080] border-[#FFD080]/30'
                            : 'bg-[#69E2AD]/15 text-[#69E2AD] border-[#69E2AD]/30'
                        }`}
                      >
                        Risk {item.risk_score}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Box */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-[#0E1318] border border-[#2A343E] text-xs mb-3 font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#5C6978]">Action:</span>
                      <span className="text-[#FFD080] font-bold">{item.action}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C6978]">Tool:</span>
                      <span className="text-[#AB98FF]">{item.tool}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C6978]">Resource:</span>
                      <span className="text-[#F0F4F8] truncate max-w-[150px]">{item.resource}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#2A343E]">
                      <span className="text-[#5C6978]">Policy:</span>
                      <span className="text-[#CBFF70] font-semibold">{item.matched_policy}</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#9DAAB8] mb-3 leading-relaxed">
                    <span className="text-[#5C6978] font-medium">Reason: </span>
                    {item.reason}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-[#2A343E]">
                  <div className="text-[11px] text-[#5C6978] font-mono mb-2.5">
                    Requested: {new Date(item.timestamp).toLocaleTimeString()}
                  </div>

                  {isPending ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={isProcessing}
                        onClick={() => handleReject(item)}
                        className="py-1.5 rounded-lg border border-[#FF8585]/30 hover:bg-[#FF8585]/10 text-[#FF8585] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => setPendingConfirmItem(item)}
                        className="py-1.5 rounded-lg bg-[#69E2AD] hover:bg-[#7ff2bd] text-[#0B0E11] text-xs font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        Approve & Execute
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs flex items-center justify-between text-[#9DAAB8] font-mono">
                      <span>Status:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] border ${
                          item.status === 'APPROVED' ? 'text-[#69E2AD] bg-[#69E2AD]/15 border-[#69E2AD]/30' : 'text-[#FF8585] bg-[#FF8585]/15 border-[#FF8585]/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="control-panel-elevated p-6 max-w-md w-full border border-[#2A343E] shadow-2xl">
            <div className="flex items-center gap-3 text-[#69E2AD] mb-3">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-semibold text-sm text-[#F0F4F8]">
                Authorize Agent Execution
              </h3>
            </div>
            <p className="text-xs text-[#9DAAB8] leading-relaxed mb-4">
              This action will be released to the Secure Tool Executor. The agent will gain clearance to execute <code className="text-[#CBFF70] font-mono font-semibold">{pendingConfirmItem.action}</code> on <code className="text-[#F0F4F8] font-mono">{pendingConfirmItem.resource}</code>.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2A343E]">
              <button
                onClick={() => setPendingConfirmItem(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#2A343E] hover:bg-[#1B232B] text-[#9DAAB8] text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionInProgress === pendingConfirmItem.request_id}
                onClick={() => handleAuthorize(pendingConfirmItem)}
                className="btn-chartreuse px-4 py-1.5 text-xs font-semibold cursor-pointer shadow-sm min-w-[90px] flex items-center justify-center"
              >
                {actionInProgress === pendingConfirmItem.request_id ? (
                  <LatticeLoader
                    status="working"
                    label="Releasing"
                    pattern="orbit"
                    grid={3}
                    shape="round"
                    cellSize={3}
                    gap={1.5}
                    fontSize={11}
                    color="#0B0E11"
                    showTimer={false}
                  />
                ) : (
                  'Authorize'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ClickSpark>
  );
};
