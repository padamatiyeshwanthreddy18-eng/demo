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
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#18212F] tracking-tight flex items-center gap-2.5">
            <span>Human Approval Queue</span>
            {pendingCount > 0 && (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[5px] bg-[#FFF4DE] text-[#D99018] border border-[#D99018]/30">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-xs text-[#596579] mt-0.5">
            High-risk AI actions paused before execution. Review and sign off before tool release.
          </p>
        </div>

        {/* Tab & Refresh Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-[#F1F3F5] p-0.5 rounded-[7px] border border-[#E2E6EB] flex items-center">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-[5px] transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-white text-[#116F68] font-semibold shadow-xs'
                  : 'text-[#596579] hover:text-[#18212F]'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-[5px] transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-[#116F68] font-semibold shadow-xs'
                  : 'text-[#596579] hover:text-[#18212F]'
              }`}
            >
              Review History
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-[7px] bg-white border border-[#CDD3DB] text-[#596579] hover:text-[#18212F] hover:bg-[#F1F3F5] transition-colors cursor-pointer shadow-xs"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Approvals Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#8A94A3]">
          Loading approval queue...
        </div>
      ) : approvals.length === 0 ? (
        <div className="aegis-panel p-12 text-center flex flex-col items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#21A67A] mb-2.5" />
          <h3 className="font-bold text-sm text-[#18212F]">
            NO PENDING APPROVALS
          </h3>
          <p className="text-xs text-[#596579] mt-1 max-w-sm">
            All intercepted agent actions have been resolved.
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
                className={`aegis-panel p-4 flex flex-col justify-between transition-all ${
                  isPending ? 'border-[#D99018]/40 shadow-xs' : 'opacity-75'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <span className="text-[11px] text-[#8A94A3] font-medium">
                        {item.agent_role.replace('_', ' ')}
                      </span>
                      <h3 className="font-semibold text-sm text-[#18212F] truncate max-w-[200px]">
                        {item.agent_name}
                      </h3>
                      <div className="text-xs font-mono font-medium text-[#168C82]">
                        {item.agent_id}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-[4px] ${
                          item.risk_score >= 71
                            ? 'bg-[#FDECEC] text-[#E65353] border border-[#E65353]/30'
                            : item.risk_score >= 31
                            ? 'bg-[#FFF4DE] text-[#D99018] border border-[#D99018]/30'
                            : 'bg-[#E7F7F1] text-[#21A67A] border border-[#21A67A]/30'
                        }`}
                      >
                        Risk {item.risk_score}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Box */}
                  <div className="space-y-1.5 p-3 rounded-[7px] bg-[#F6F7F9] border border-[#E2E6EB] text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-[#8A94A3]">Action:</span>
                      <span className="font-mono text-[#D99018] font-bold">{item.action}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8A94A3]">Tool:</span>
                      <span className="font-mono text-[#18212F]">{item.tool}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8A94A3]">Resource:</span>
                      <span className="font-mono text-[#18212F] truncate max-w-[150px]">{item.resource}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#E2E6EB]">
                      <span className="text-[#8A94A3]">Policy:</span>
                      <span className="font-mono text-[#8B5CF6] font-semibold">{item.matched_policy}</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#596579] mb-3 leading-relaxed">
                    <span className="text-[#8A94A3] font-medium">Reason: </span>
                    {item.reason}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-[#E2E6EB]">
                  <div className="text-[11px] text-[#8A94A3] font-mono mb-2.5">
                    Requested: {new Date(item.timestamp).toLocaleTimeString()}
                  </div>

                  {isPending ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={isProcessing}
                        onClick={() => handleReject(item)}
                        className="py-1.5 rounded-[7px] border border-[#E65353]/30 hover:bg-[#FDECEC] text-[#E65353] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => setPendingConfirmItem(item)}
                        className="py-1.5 rounded-[7px] bg-[#21A67A] hover:bg-[#1A8F68] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        Approve & Execute
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs flex items-center justify-between text-[#596579]">
                      <span>Status:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-[4px] font-mono text-[11px] ${
                          item.status === 'APPROVED' ? 'text-[#21A67A] bg-[#E7F7F1]' : 'text-[#E65353] bg-[#FDECEC]'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="aegis-panel-elevated p-6 max-w-md w-full border border-[#CDD3DB] shadow-2xl">
            <div className="flex items-center gap-3 text-[#21A67A] mb-3">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-semibold text-sm text-[#18212F]">
                Authorize Agent Execution
              </h3>
            </div>
            <p className="text-xs text-[#596579] leading-relaxed mb-4">
              This action will be released to the Secure Tool Executor. The agent will gain clearance to execute <code className="text-[#168C82] font-mono font-semibold">{pendingConfirmItem.action}</code> on <code className="text-[#18212F] font-mono">{pendingConfirmItem.resource}</code>.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E6EB]">
              <button
                onClick={() => setPendingConfirmItem(null)}
                className="px-3.5 py-1.5 rounded-[7px] border border-[#CDD3DB] hover:bg-[#F1F3F5] text-[#596579] text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionInProgress === pendingConfirmItem.request_id}
                onClick={() => handleAuthorize(pendingConfirmItem)}
                className="px-4 py-1.5 rounded-[7px] bg-[#21A67A] hover:bg-[#1A8F68] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {actionInProgress === pendingConfirmItem.request_id ? 'Authorizing...' : 'Authorize'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
