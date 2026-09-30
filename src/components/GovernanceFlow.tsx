import React, { useState } from 'react';
import {
  Bot,
  ShieldCheck,
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ChevronRight,
  Info,
  Lock,
  ArrowRight,
  FileCode,
  AlertTriangle
} from 'lucide-react';
import { SecurityInspectionReport, ProposedActionRequest } from '../server/types.js';

export interface GovernanceFlowItem {
  id: string;
  agent_id: string;
  action: string;
  resource: string;
  decision: 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY';
  approval_status?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  execution_status?: 'EXECUTED' | 'BLOCKED' | 'PENDING_APPROVAL' | 'NOT_EXECUTED';
  risk_score: number;
  policy_name?: string;
  policy_reason?: string;
  provenance?: string;
  latency_ms?: number;
  timestamp?: string;
}

interface GovernanceFlowProps {
  activeItem?: GovernanceFlowItem | SecurityInspectionReport | null;
  className?: string;
  onSelectStage?: (stageKey: string) => void;
}

export const GovernanceFlow: React.FC<GovernanceFlowProps> = ({
  activeItem,
  className = '',
  onSelectStage
}) => {
  const [selectedStage, setSelectedStage] = useState<'proposal' | 'policy' | 'decision' | 'execution' | null>(null);

  // Normalize data whether it's GovernanceFlowItem or SecurityInspectionReport
  const data = React.useMemo(() => {
    if (!activeItem) return null;

    if ('request_id' in activeItem) {
      const rep = activeItem as SecurityInspectionReport;
      return {
        id: rep.request_id,
        agent_id: rep.request.agent_id,
        action: rep.request.action,
        resource: rep.request.resource,
        decision: rep.decision,
        approval_status: rep.approval_status,
        execution_status: rep.execution?.execution_status || (rep.decision === 'ALLOW' ? 'EXECUTED' : rep.decision === 'DENY' ? 'BLOCKED' : 'PENDING_APPROVAL'),
        risk_score: rep.risk.risk_score,
        policy_name: rep.policy.policy_name || rep.policy.matched_policy,
        policy_reason: rep.policy.reason,
        provenance: rep.request.data_provenance || 'agent_internal',
        latency_ms: rep.latency_ms || 12.4
      };
    }

    return activeItem as GovernanceFlowItem;
  }, [activeItem]);

  const handleStageClick = (stage: 'proposal' | 'policy' | 'decision' | 'execution') => {
    setSelectedStage(selectedStage === stage ? null : stage);
    if (onSelectStage) onSelectStage(stage);
  };

  const isDenied = data?.decision === 'DENY';
  const isPending = data?.decision === 'REQUIRE_APPROVAL' && (data?.approval_status === 'PENDING' || data?.approval_status === 'NONE');
  const isApproved = data?.decision === 'ALLOW' || data?.approval_status === 'APPROVED';
  const isExecuted = data?.execution_status === 'EXECUTED';

  return (
    <div className={`control-panel p-5 ${className}`}>
      {/* Header with Title and Permission Boundary Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#2A343E]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CBFF70]" />
            <h3 className="font-display text-sm font-semibold text-[#F0F4F8] tracking-tight">
              Governance Lifecycle Flow
            </h3>
            <span className="text-[11px] font-mono text-[#9DAAB8]">
              {data ? `REQ: ${data.id.slice(0, 14)}` : 'Select a request to trace state'}
            </span>
          </div>
          <p className="text-xs text-[#9DAAB8] mt-0.5">
            Deterministic state path: Agent proposal → Invariant checks → Decision boundary → Authorized execution
          </p>
        </div>

        {data && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#9DAAB8]">Risk Score:</span>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                data.risk_score >= 70
                  ? 'bg-[#FF8585]/15 text-[#FF8585] border border-[#FF8585]/30'
                  : data.risk_score >= 35
                  ? 'bg-[#FFD080]/15 text-[#FFD080] border border-[#FFD080]/30'
                  : 'bg-[#69E2AD]/15 text-[#69E2AD] border border-[#69E2AD]/30'
              }`}
            >
              {data.risk_score}/100
            </span>
          </div>
        )}
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {/* Stage 1: Agent Proposal */}
        <div
          onClick={() => handleStageClick('proposal')}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none ${
            selectedStage === 'proposal'
              ? 'bg-[#1B232B] border-[#CBFF70] shadow-[0_0_12px_rgba(203,255,112,0.12)]'
              : 'bg-[#101419] border-[#2A343E] hover:border-[#3B4856]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#9DAAB8]">
              <Bot className="w-3.5 h-3.5 text-[#AB98FF]" />
              <span>1. Proposal</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#AB98FF]/10 text-[#AB98FF] border border-[#AB98FF]/20">
              DISPATCHED
            </span>
          </div>
          <div className="font-mono text-xs text-[#F0F4F8] font-semibold truncate">
            {data ? data.action : 'read_file / tool_call'}
          </div>
          <div className="text-[11px] text-[#9DAAB8] truncate mt-0.5">
            {data ? `Agent: ${data.agent_id}` : 'Autonomous invocation payload'}
          </div>
        </div>

        {/* Stage 2: Policy Invariant Checks */}
        <div
          onClick={() => handleStageClick('policy')}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none ${
            selectedStage === 'policy'
              ? 'bg-[#1B232B] border-[#CBFF70] shadow-[0_0_12px_rgba(203,255,112,0.12)]'
              : 'bg-[#101419] border-[#2A343E] hover:border-[#3B4856]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#9DAAB8]">
              <Scale className="w-3.5 h-3.5 text-[#CBFF70]" />
              <span>2. Policy Engine</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#CBFF70]/10 text-[#CBFF70] border border-[#CBFF70]/20">
              EVALUATED
            </span>
          </div>
          <div className="font-mono text-xs text-[#F0F4F8] font-semibold truncate">
            {data ? data.policy_name || 'POL-DEFAULT-RULE' : 'Invariants checked'}
          </div>
          <div className="text-[11px] text-[#9DAAB8] truncate mt-0.5">
            {data ? `Latency: ${data.latency_ms}ms` : 'Identity, context & injection tests'}
          </div>
        </div>

        {/* Stage 3: Decision Boundary (Motif Anchor) */}
        <div
          onClick={() => handleStageClick('decision')}
          className={`p-3.5 rounded-lg border relative transition-all cursor-pointer select-none ${
            selectedStage === 'decision'
              ? 'bg-[#1B232B] border-[#CBFF70] shadow-[0_0_12px_rgba(203,255,112,0.12)]'
              : isDenied
              ? 'bg-[#1B232B] border-[#FF8585]/60'
              : isPending
              ? 'bg-[#1B232B] border-[#FFD080]/60'
              : 'bg-[#101419] border-[#2A343E] hover:border-[#3B4856]'
          }`}
        >
          {/* Permission Boundary Indicator */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#CBFF70] via-[#AB98FF] to-transparent rounded-t-lg" />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#9DAAB8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#CBFF70]" />
              <span>3. Decision</span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                isDenied
                  ? 'bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/30'
                  : isPending
                  ? 'bg-[#FFD080]/15 text-[#FFD080] border-[#FFD080]/30'
                  : 'bg-[#69E2AD]/15 text-[#69E2AD] border-[#69E2AD]/30'
              }`}
            >
              {data ? (data.decision === 'REQUIRE_APPROVAL' ? 'PENDING' : data.decision) : 'PENDING'}
            </span>
          </div>
          <div className="font-mono text-xs text-[#F0F4F8] font-semibold truncate">
            {isDenied ? 'Execution Terminated' : isPending ? 'Escrow Paused' : 'Action Authorized'}
          </div>
          <div className="text-[11px] text-[#9DAAB8] truncate mt-0.5">
            {isDenied ? 'Violates strict boundary' : isPending ? 'Human sign-off mandatory' : 'Verified fail-safe'}
          </div>
        </div>

        {/* Stage 4: Authorized Execution */}
        <div
          onClick={() => handleStageClick('execution')}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none ${
            selectedStage === 'execution'
              ? 'bg-[#1B232B] border-[#CBFF70] shadow-[0_0_12px_rgba(203,255,112,0.12)]'
              : isDenied
              ? 'bg-[#101419] border-[#2A343E] opacity-50'
              : isExecuted
              ? 'bg-[#101419] border-[#69E2AD]/40'
              : 'bg-[#101419] border-[#2A343E] hover:border-[#3B4856]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#9DAAB8]">
              <Zap className="w-3.5 h-3.5 text-[#69E2AD]" />
              <span>4. Execution</span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isExecuted
                  ? 'bg-[#69E2AD]/15 text-[#69E2AD] border-[#69E2AD]/30'
                  : isDenied
                  ? 'bg-[#FF8585]/10 text-[#FF8585] border-[#FF8585]/20'
                  : 'bg-[#FFD080]/10 text-[#FFD080] border-[#FFD080]/20'
              }`}
            >
              {isExecuted ? 'RELEASED' : isDenied ? 'BLOCKED' : 'QUEUED'}
            </span>
          </div>
          <div className="font-mono text-xs text-[#F0F4F8] font-semibold truncate">
            {isExecuted ? 'Executed in Sandbox' : isDenied ? 'No Execution' : 'Awaiting Release'}
          </div>
          <div className="text-[11px] text-[#9DAAB8] truncate mt-0.5">
            {isExecuted ? 'Dispatched to target tool' : isDenied ? 'Tool invocation halted' : 'Separated clearance queue'}
          </div>
        </div>
      </div>

      {/* Clickable Stage Details Tray */}
      {selectedStage && data && (
        <div className="mt-4 p-3.5 rounded-lg bg-[#0E1318] border border-[#2A343E] text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[#9DAAB8]">
            <span className="font-semibold text-[#CBFF70] uppercase font-mono text-[11px]">
              Stage Detail: {selectedStage.toUpperCase()}
            </span>
            <span className="text-[10px] text-[#5C6978] font-mono">Click stage tile again to collapse</span>
          </div>

          {selectedStage === 'proposal' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[#F0F4F8]">
              <div>
                <span className="text-[#9DAAB8] block text-[11px]">Request Action:</span>
                <span className="font-mono font-medium">{data.action}</span>
              </div>
              <div>
                <span className="text-[#9DAAB8] block text-[11px]">Target Resource:</span>
                <span className="font-mono font-medium truncate block">{data.resource}</span>
              </div>
              <div>
                <span className="text-[#9DAAB8] block text-[11px]">Provenance Origin:</span>
                <span className="font-mono text-[#AB98FF]">{data.provenance}</span>
              </div>
            </div>
          )}

          {selectedStage === 'policy' && (
            <div className="space-y-1.5 pt-1 text-[#F0F4F8]">
              <div className="flex justify-between items-baseline">
                <span className="text-[#9DAAB8]">Enforced Policy Rule:</span>
                <span className="font-mono text-[#CBFF70] font-semibold">{data.policy_name}</span>
              </div>
              <p className="text-[#9DAAB8] leading-relaxed">
                {data.policy_reason || 'Evaluated across AST syntax checks, parameter validation, role invariants, and prompt injection signatures.'}
              </p>
            </div>
          )}

          {selectedStage === 'decision' && (
            <div className="space-y-1 pt-1 text-[#F0F4F8]">
              <div className="flex justify-between items-center">
                <span className="text-[#9DAAB8]">Governor Verdict:</span>
                <span className="font-mono font-bold text-sm text-[#CBFF70]">
                  {data.decision}
                </span>
              </div>
              <p className="text-[#9DAAB8]">
                {isDenied
                  ? 'Action hard-denied by Governor invariants. Execution token permanently refused.'
                  : isPending
                  ? 'High-risk boundary triggered. Action escalated to human review queue.'
                  : 'All permission invariant checks passed. Ready for containerized execution.'}
              </p>
            </div>
          )}

          {selectedStage === 'execution' && (
            <div className="space-y-1 pt-1 text-[#F0F4F8]">
              <div className="flex justify-between items-center">
                <span className="text-[#9DAAB8]">Execution Status:</span>
                <span className="font-mono font-bold text-[#69E2AD]">
                  {data.execution_status}
                </span>
              </div>
              <p className="text-[#9DAAB8]">
                {isExecuted
                  ? 'Action dispatched and completed within hardened sandboxed environment.'
                  : isDenied
                  ? 'Tool invocation was halted before any external socket or file handle was accessed.'
                  : 'Held in escrow until explicit operator signature is received.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
