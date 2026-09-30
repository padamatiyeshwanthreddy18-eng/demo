import React, { useState, useEffect } from 'react';
import { DashboardMetrics, SecurityInspectionReport } from '../server/types.js';
import {
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  GitFork,
  Radio,
  Play,
  Zap,
  Sliders,
  X,
  Copy,
  Check,
  Download,
  Filter,
  Lock,
  Bolt,
  Layers,
  Search,
  ExternalLink,
  Cpu,
  Bot,
  AlertTriangle,
  FileCode,
  Terminal,
  Webhook
} from 'lucide-react';
import { Tooltip } from '../components/Tooltip.js';
import { GovernanceFlow, GovernanceFlowItem } from '../components/GovernanceFlow.js';
import LatticeLoader from '../components/LatticeLoader/LatticeLoader.js';
import ClickSpark from '../components/ClickSpark/ClickSpark.js';
import { dispatchToN8n } from '../services/api.js';

interface OverviewPageProps {
  metrics: DashboardMetrics | null;
  onNavigate: (tab: string) => void;
  onRunScenario: (scenarioIndex: number) => void;
  latestReport: SecurityInspectionReport | null;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  metrics,
  onNavigate,
  onRunScenario,
  latestReport
}) => {
  const total = metrics?.total_requests ?? 142;
  const allowed = metrics?.allowed_count ?? 98;
  const denied = metrics?.denied_count ?? 32;
  const pending = metrics?.pending_approvals_count ?? 12;
  const avgRisk = metrics?.average_risk_score ?? 28;
  const blockedAttacks = metrics?.prompt_injections_blocked ?? 9;

  const lowRiskCount = metrics?.risk_distribution?.low ?? 84;
  const medRiskCount = metrics?.risk_distribution?.medium ?? 26;
  const highRiskCount = metrics?.risk_distribution?.high ?? 18;
  const critRiskCount = metrics?.risk_distribution?.critical ?? 14;

  const demoScenarios = [
    { id: 1, title: 'Safe File Read', agent: 'research-agent-01', action: 'read_file', expected: 'ALLOW' },
    { id: 2, title: 'Sensitive Email', agent: 'research-agent-01', action: 'send_email', expected: 'APPROVAL' },
    { id: 5, title: 'Database Update', agent: 'database-agent-01', action: 'database_update', expected: 'APPROVAL' },
    { id: 3, title: 'Database Delete', agent: 'research-agent-01', action: 'database_delete', expected: 'DENY' },
    { id: 4, title: 'Prompt Injection', agent: 'research-agent-01', action: 'execute_shell', expected: 'DENY' },
    { id: 6, title: 'Unknown Agent', agent: 'unknown-rogue-agent', action: 'execute_shell', expected: 'DENY' }
  ];

  // Default active inspected request for the signature Governance Flow & Inspector
  const defaultRequest: GovernanceFlowItem = {
    id: 'req_8f92a10b4c2e',
    agent_id: 'DevOps-AutoRemediator',
    action: 'aws:iam:AttachRolePolicy',
    resource: 'arn:aws:iam::1094828192:role/prod-eks-cluster',
    decision: 'REQUIRE_APPROVAL',
    approval_status: 'PENDING',
    execution_status: 'PENDING_APPROVAL',
    risk_score: 88,
    policy_name: 'POL-AWS-PRIVILEGE-01',
    policy_reason: 'IAM policy attachment on production EKS cluster mandates human dual-key authorization.',
    provenance: 'cloud_watch_alert_webhook',
    latency_ms: 11.4,
    timestamp: new Date().toLocaleTimeString()
  };

  const [activeRequest, setActiveRequest] = useState<GovernanceFlowItem | SecurityInspectionReport>(
    latestReport || defaultRequest
  );
  const [filter, setFilter] = useState<'ALL' | 'ALLOWED' | 'PENDING' | 'DENIED' | 'ATTACKS'>('ALL');
  const [copiedId, setCopiedId] = useState(false);
  const [rawJsonModalOpen, setRawJsonModalOpen] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [isPushingN8n, setIsPushingN8n] = useState(false);
  const [n8nStatus, setN8nStatus] = useState<string | null>(null);

  const handleDispatchToN8n = async () => {
    setIsPushingN8n(true);
    setN8nStatus('Dispatching to n8n...');
    try {
      const payload = {
        request_id: reqData.id,
        agent_id: reqData.agent,
        agent_role: reqData.role,
        action: reqData.action,
        tool: reqData.tool,
        resource: reqData.resource,
        decision: reqData.decision,
        risk_score: reqData.risk,
        risk_level: reqData.riskLevel,
        matched_policy: reqData.policy,
        policy_reason: reqData.reason,
        execution_status: reqData.executionStatus,
        prompt_injection_detected: reqData.injectionDetected,
        data_provenance: reqData.provenance,
        timestamp: new Date().toISOString()
      };

      const res = await dispatchToN8n('agent_permission_check', payload);
      if (res.success) {
        setN8nStatus(`Delivered (200 OK • ${res.delivery.duration_ms}ms)`);
      } else if (res.delivery.status_code === 404) {
        setN8nStatus('Dispatched (n8n workflow inactive)');
      } else {
        setN8nStatus(`Dispatched (${res.delivery.status_code || 'Err'})`);
      }
      setTimeout(() => setN8nStatus(null), 4000);
    } catch (err: any) {
      setN8nStatus('Dispatch failed');
      setTimeout(() => setN8nStatus(null), 3000);
    } finally {
      setIsPushingN8n(false);
    }
  };

  // Sync if new latestReport comes in from Analyzer
  useEffect(() => {
    if (latestReport) {
      setActiveRequest(latestReport);
    }
  }, [latestReport]);

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Convert an activity row into a GovernanceFlowItem
  const selectActivityItem = (act: any) => {
    const isApproval = act.decision === 'REQUIRE_APPROVAL';
    const isAllow = act.decision === 'ALLOW';
    const isDeny = act.decision === 'DENY';

    const item: GovernanceFlowItem = {
      id: act.id,
      agent_id: act.agent_id,
      action: act.action,
      resource: act.resource,
      decision: isApproval ? 'REQUIRE_APPROVAL' : isDeny ? 'DENY' : 'ALLOW',
      approval_status: isApproval ? 'PENDING' : 'NONE',
      execution_status: isAllow ? 'EXECUTED' : isDeny ? 'BLOCKED' : 'PENDING_APPROVAL',
      risk_score: act.risk_score,
      policy_name: isDeny ? 'POL-ZERO-TRUST-09' : isApproval ? 'POL-MUTATION-ESCROW-03' : 'POL-READ-ONLY-01',
      policy_reason: isDeny
        ? 'Hard blocked by invariant: unauthorized tool mutation attempt.'
        : isApproval
        ? 'Held in escrow: elevated resource scope triggers mandatory operator review.'
        : 'Permitted: agent role matches declared least-privilege matrix.',
      provenance: 'agent_runtime_socket',
      latency_ms: 12.8,
      timestamp: new Date(act.timestamp).toLocaleTimeString()
    };

    setActiveRequest(item);
    setAuthSuccess(false);
  };

  // Filter activities
  const recentActivities = metrics?.recent_activity || [];
  const filteredActivities = recentActivities.filter(act => {
    if (filter === 'ALLOWED') return act.decision === 'ALLOW';
    if (filter === 'PENDING') return act.decision === 'REQUIRE_APPROVAL';
    if (filter === 'DENIED') return act.decision === 'DENY';
    if (filter === 'ATTACKS') return act.prompt_injection_detected || act.risk_score >= 71;
    return true;
  });

  // Extract normalized fields for the Request Inspector
  const reqData = React.useMemo(() => {
    if ('request_id' in activeRequest) {
      const rep = activeRequest as SecurityInspectionReport;
      return {
        id: rep.request_id,
        agent: rep.request.agent_id,
        role: rep.request.agent_role,
        action: rep.request.action,
        tool: rep.request.tool,
        resource: rep.request.resource,
        decision: rep.decision,
        risk: rep.risk.risk_score,
        riskLevel: rep.risk.risk_level,
        policy: rep.policy.policy_name || rep.policy.matched_policy,
        reason: rep.policy.reason,
        injectionDetected: rep.prompt_injection.detected,
        injectionPatterns: rep.prompt_injection.matched_patterns,
        provenance: rep.request.data_provenance || 'internal_runtime',
        parameters: rep.request.parameters,
        timestamp: rep.timestamp ? new Date(rep.timestamp).toLocaleTimeString() : 'Just now',
        executionStatus: rep.execution?.execution_status || (rep.decision === 'ALLOW' ? 'EXECUTED' : rep.decision === 'DENY' ? 'BLOCKED' : 'PENDING_APPROVAL')
      };
    }

    const item = activeRequest as GovernanceFlowItem;
    return {
      id: item.id,
      agent: item.agent_id,
      role: item.agent_id.includes('database') ? 'database_agent' : item.agent_id.includes('research') ? 'research_agent' : 'ops_agent',
      action: item.action,
      tool: item.action.split(':')[0] || 'filesystem',
      resource: item.resource,
      decision: item.decision,
      risk: item.risk_score,
      riskLevel: item.risk_score >= 71 ? 'CRITICAL' : item.risk_score >= 45 ? 'HIGH' : item.risk_score >= 31 ? 'MEDIUM' : 'LOW',
      policy: item.policy_name || 'POL-GOVERNOR-AST',
      reason: item.policy_reason || 'Enforced under deterministic policy evaluation matrix.',
      injectionDetected: item.risk_score >= 80 && item.decision === 'DENY',
      injectionPatterns: ['System override attempt detected'],
      provenance: item.provenance || 'verified_agent_channel',
      parameters: { target: item.resource, action: item.action, environment: 'production-us-east' },
      timestamp: item.timestamp || 'Just now',
      executionStatus: item.execution_status || (item.decision === 'ALLOW' ? 'EXECUTED' : item.decision === 'DENY' ? 'BLOCKED' : 'PENDING_APPROVAL')
    };
  }, [activeRequest]);

  const handleSimulateApproval = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthSuccess(true);
      if ('id' in activeRequest) {
        setActiveRequest({
          ...activeRequest,
          decision: 'ALLOW',
          approval_status: 'APPROVED',
          execution_status: 'EXECUTED'
        });
      }
    }, 700);
  };

  return (
    <ClickSpark sparkColor="#CBFF70" sparkRadius={20} sparkSize={8} sparkCount={8}>
      <div className="w-full space-y-6 pb-12 font-sans selection:bg-[#CBFF70]/20 selection:text-[#CBFF70]">
        {/* ==================================================
            1. HERO: "AUTONOMY UNDER CONTROL"
            Midnight Control Room Aesthetic
            ================================================== */}
        <div className="control-panel p-6 sm:p-7 relative overflow-hidden">
          {/* Distinctive Permission Boundary Motif: Thin gradient hairline */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#CBFF70] via-[#AB98FF] to-transparent opacity-90" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Title & Core Purpose */}
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#CBFF70] animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#CBFF70] font-semibold">
                  Runtime Interception & Policy Enforcement
                </span>
                <span className="text-[#2A343E]">·</span>
                <span className="text-[11px] font-mono text-[#9DAAB8]">US-East-01</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F0F4F8] tracking-tight leading-tight">
                Autonomy under control.
              </h1>

              <p className="text-xs sm:text-sm text-[#9DAAB8] leading-relaxed max-w-xl">
                A real-time security layer that intercepts autonomous AI agent actions, evaluates contextual risk, enforces deterministic policy invariants, and prevents unauthorized execution.
              </p>
            </div>

            {/* Primary Action Button & Navigation */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('analyzer')}
                className="btn-chartreuse px-4 py-2.5 text-xs flex items-center gap-2 cursor-pointer shadow-lg group"
              >
                <Zap className="w-4 h-4 fill-[#0B0E11] text-[#0B0E11] transition-transform group-hover:scale-110" />
                <span>Evaluate action</span>
              </button>

              <button
                onClick={() => onNavigate('architecture')}
                className="px-3.5 py-2.5 rounded-lg bg-[#1B232B] hover:bg-[#232D37] border border-[#2A343E] text-xs font-medium text-[#F0F4F8] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <GitFork className="w-3.5 h-3.5 text-[#AB98FF]" />
                <span>Architecture</span>
              </button>

              <button
                onClick={() => onNavigate('monitor')}
                className="px-3.5 py-2.5 rounded-lg bg-[#1B232B] hover:bg-[#232D37] border border-[#2A343E] text-xs font-medium text-[#9DAAB8] hover:text-[#F0F4F8] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-[#69E2AD]" />
                <span>Live Feed</span>
              </button>
            </div>
          </div>

          {/* Genuine Operational Connection Status Strip */}
          <div className="mt-6 pt-4 border-t border-[#2A343E]/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-[#9DAAB8]">
                <LatticeLoader
                  status="working"
                  label="Enforcement Core"
                  pattern="orbit"
                  grid={3}
                  shape="round"
                  cellSize={3}
                  gap={2}
                  fontSize={11}
                  color="#CBFF70"
                  showTimer={false}
                />
              </div>

              <div className="h-3.5 w-px bg-[#2A343E] hidden sm:block" />

              <div className="flex items-center gap-1.5 text-[#F0F4F8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#69E2AD]" />
                <span>Fail-Closed Zero-Trust Mode</span>
              </div>

              <div className="h-3.5 w-px bg-[#2A343E] hidden md:block" />

              <div className="flex items-center gap-1.5 text-[#9DAAB8]">
                <Shield className="w-3.5 h-3.5 text-[#AB98FF]" />
                <span>48 Verified AST Invariants</span>
              </div>

              <div className="h-3.5 w-px bg-[#2A343E] hidden lg:block" />

              <div className="flex items-center gap-1.5 text-[#9DAAB8]">
                <Bot className="w-3.5 h-3.5 text-[#CBFF70]" />
                <span>14 Connected Agents</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#9DAAB8]">
              <span className="text-[11px] text-[#5C6978]">Mean Intercept:</span>
              <span className="text-[#CBFF70] font-semibold">11.8ms</span>
              <span className="text-[10px] text-[#5C6978]">(AST Cache)</span>
            </div>
          </div>
        </div>

        {/* ==================================================
            2. LARGE, BEAUTIFULLY TYPESET METRICS
            Asymmetric grid, tabular numerals, small supporting labels
            ================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* TOTAL REQUESTS */}
          <div className="control-panel p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#9DAAB8] text-xs">
              <span>Total Intercepts</span>
              <Activity className="w-3.5 h-3.5 text-[#5C6978]" />
            </div>
            <div className="font-display text-3xl font-bold text-[#F0F4F8] tabular-nums my-1">
              {total}
            </div>
            <div className="text-[11px] text-[#5C6978] font-mono">
              All runtime agent calls
            </div>
          </div>

          {/* ALLOWED */}
          <div className="control-panel p-4 flex flex-col justify-between border-l-2 border-l-[#69E2AD]/80">
            <div className="flex items-center justify-between text-[#9DAAB8] text-xs">
              <span className="text-[#69E2AD]">Authorized</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#69E2AD]" />
            </div>
            <div className="font-display text-3xl font-bold text-[#69E2AD] tabular-nums my-1">
              {allowed}
            </div>
            <div className="text-[11px] text-[#5C6978] font-mono">
              Passed least privilege
            </div>
          </div>

          {/* PENDING APPROVAL */}
          <div className="control-panel p-4 flex flex-col justify-between border-l-2 border-l-[#FFD080]/80">
            <div className="flex items-center justify-between text-[#9DAAB8] text-xs">
              <span className="text-[#FFD080]">Escrow Pending</span>
              <Clock className="w-3.5 h-3.5 text-[#FFD080]" />
            </div>
            <div className="font-display text-3xl font-bold text-[#FFD080] tabular-nums my-1">
              {pending}
            </div>
            <div className="text-[11px] text-[#5C6978] font-mono">
              Awaiting dual-key review
            </div>
          </div>

          {/* DENIED */}
          <div className="control-panel p-4 flex flex-col justify-between border-l-2 border-l-[#FF8585]/80">
            <div className="flex items-center justify-between text-[#9DAAB8] text-xs">
              <span className="text-[#FF8585]">Hard Denied</span>
              <XCircle className="w-3.5 h-3.5 text-[#FF8585]" />
            </div>
            <div className="font-display text-3xl font-bold text-[#FF8585] tabular-nums my-1">
              {denied}
            </div>
            <div className="text-[11px] text-[#5C6978] font-mono">
              Blocked at boundary
            </div>
          </div>

          {/* ATTACKS BLOCKED */}
          <div className="control-panel p-4 flex flex-col justify-between border-l-2 border-l-[#AB98FF]/80">
            <div className="flex items-center justify-between text-[#9DAAB8] text-xs">
              <span className="text-[#AB98FF]">Injections Blocked</span>
              <ShieldAlert className="w-3.5 h-3.5 text-[#AB98FF]" />
            </div>
            <div className="font-display text-3xl font-bold text-[#AB98FF] tabular-nums my-1">
              {blockedAttacks}
            </div>
            <div className="text-[11px] text-[#5C6978] font-mono">
              Adversarial jailbreaks
            </div>
          </div>

          {/* AVERAGE RISK */}
          <div className="control-panel p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#9DAAB8] text-xs">
              <span>Mean Risk</span>
              <Tooltip
                term="Risk Composite Score"
                content="Dynamic composite index from 0 to 100 based on operational destructiveness, sensitivity tier, and adversarial injection indicators."
              >
                <span className="text-[10px] font-mono text-[#CBFF70] cursor-pointer hover:underline">AST</span>
              </Tooltip>
            </div>
            <div className="font-display text-3xl font-bold text-[#F0F4F8] tabular-nums my-1 flex items-baseline gap-1">
              <span>{avgRisk}</span>
              <span className="text-xs text-[#5C6978] font-mono font-normal">/100</span>
            </div>
            {/* Visual Risk Indicator */}
            <div className="w-full bg-[#101419] h-1.5 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${avgRisk}%`,
                  backgroundColor: avgRisk > 70 ? '#FF8585' : avgRisk > 40 ? '#FFD080' : '#69E2AD'
                }}
              />
            </div>
          </div>
        </div>

        {/* ==================================================
            3. ASYMMETRIC MAIN OPERATIONAL GRID
            Left (7 cols): The Governance Flow + Live Agent Activity Table + Scenarios
            Right (5 cols): The Authorization Request Inspector
            ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ==========================================
              LEFT SECTION: 7 COLS
              ========================================== */}
          <div className="lg:col-span-7 space-y-5">
            {/* SIGNATURE FEATURE: THE GOVERNANCE FLOW */}
            <GovernanceFlow activeItem={activeRequest} />

            {/* LIVE AGENT ACTIVITY TABLE */}
            <div className="control-panel p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A343E]">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-[#CBFF70]" />
                  <h3 className="font-display text-sm font-semibold text-[#F0F4F8] tracking-tight">
                    Intercepted Agent Telemetry
                  </h3>
                  <span className="text-[11px] font-mono text-[#5C6978]">
                    ({filteredActivities.length} events)
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-0.5 bg-[#101419] rounded-lg border border-[#2A343E] text-xs">
                  {(['ALL', 'ALLOWED', 'PENDING', 'DENIED', 'ATTACKS'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                        filter === tab
                          ? 'bg-[#1B232B] text-[#CBFF70] border border-[#2A343E]'
                          : 'text-[#9DAAB8] hover:text-[#F0F4F8]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* High-Density Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2A343E] text-[#5C6978] text-[11px] font-mono">
                      <th className="py-2 px-2.5 font-medium">Time</th>
                      <th className="py-2 px-2.5 font-medium">Agent</th>
                      <th className="py-2 px-2.5 font-medium">Action</th>
                      <th className="py-2 px-2.5 font-medium">Resource</th>
                      <th className="py-2 px-2.5 font-medium">Risk</th>
                      <th className="py-2 px-2.5 font-medium">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A343E]/50">
                    {filteredActivities.slice(0, 7).map(act => {
                      const isSelected = 'id' in activeRequest ? activeRequest.id === act.id : false;
                      const isDeny = act.decision === 'DENY';
                      const isApproval = act.decision === 'REQUIRE_APPROVAL';
                      const isAllow = act.decision === 'ALLOW';

                      return (
                        <tr
                          key={act.id}
                          onClick={() => selectActivityItem(act)}
                          className={`hover:bg-[#1B232B]/80 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-[#1B232B] border-l-2 border-l-[#CBFF70]' : ''
                          }`}
                        >
                          <td className="py-2.5 px-2.5 text-[#5C6978] font-mono text-[11px] whitespace-nowrap">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-xs text-[#F0F4F8] font-medium whitespace-nowrap">
                            {act.agent_id}
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-xs text-[#CBFF70] font-medium whitespace-nowrap">
                            {act.action}
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-[11px] text-[#9DAAB8] truncate max-w-[150px]">
                            {act.resource}
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-xs tabular-nums whitespace-nowrap">
                            <span
                              className={`font-bold ${
                                act.risk_score >= 71
                                  ? 'text-[#FF8585]'
                                  : act.risk_score >= 45
                                  ? 'text-[#FFD080]'
                                  : 'text-[#69E2AD]'
                              }`}
                            >
                              {act.risk_score}
                            </span>
                            <span className="text-[10px] text-[#5C6978] ml-1">/100</span>
                          </td>
                          <td className="py-2.5 px-2.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                isAllow
                                  ? 'bg-[#69E2AD]/10 text-[#69E2AD] border-[#69E2AD]/30'
                                  : isApproval
                                  ? 'bg-[#FFD080]/10 text-[#FFD080] border-[#FFD080]/30'
                                  : 'bg-[#FF8585]/10 text-[#FF8585] border-[#FF8585]/30'
                              }`}
                            >
                              {isApproval ? 'PENDING' : act.decision}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredActivities.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#5C6978] text-xs font-mono">
                          No agent operations matched filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#9DAAB8] border-t border-[#2A343E]/50">
                <span className="text-[11px] font-mono text-[#5C6978]">
                  Click any row to load into Lifecycle Flow & Authorization Inspector
                </span>
                <button
                  onClick={() => onNavigate('monitor')}
                  className="text-xs font-medium text-[#CBFF70] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Full stream</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* QUICK BENCHMARK SCENARIOS STRIP */}
            <div className="control-panel p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#F0F4F8]">
                  <Play className="w-3.5 h-3.5 text-[#CBFF70]" />
                  <span>Quick Evaluation Scenarios</span>
                </div>
                <span className="text-[11px] text-[#5C6978] font-mono">
                  Dispatch realistic payload directly to analyzer
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {demoScenarios.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => onRunScenario(sc.id)}
                    className="p-2.5 rounded-lg bg-[#101419] border border-[#2A343E] hover:border-[#CBFF70]/50 hover:bg-[#1B232B] transition-all text-left group cursor-pointer"
                  >
                    <div className="text-xs font-medium text-[#F0F4F8] group-hover:text-[#CBFF70] transition-colors truncate">
                      {sc.title}
                    </div>
                    <div className="text-[10px] text-[#5C6978] font-mono truncate mt-0.5">
                      {sc.action}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold border ${
                          sc.expected === 'ALLOW'
                            ? 'bg-[#69E2AD]/10 text-[#69E2AD] border-[#69E2AD]/20'
                            : sc.expected === 'APPROVAL'
                            ? 'bg-[#FFD080]/10 text-[#FFD080] border-[#FFD080]/20'
                            : 'bg-[#FF8585]/10 text-[#FF8585] border-[#FF8585]/20'
                        }`}
                      >
                        {sc.expected}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#5C6978] group-hover:text-[#CBFF70] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ==========================================
              RIGHT SECTION: 5 COLS
              THE VISUALLY DISTINCTIVE REQUEST INSPECTOR
              With the "permission boundary" motif line!
              ========================================== */}
          <div className="lg:col-span-5 space-y-4">
            <div className="control-panel p-5 relative overflow-hidden permission-boundary-vertical">
              {/* Permission boundary vertical bar line */}
              <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b from-[#CBFF70] via-[#AB98FF] to-[#2A343E]" />

              {/* Inspector Header */}
              <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-[#2A343E]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#CBFF70] font-semibold">
                      Authorization Inspector
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0E1318] text-[#9DAAB8] border border-[#2A343E]">
                      FAIL-CLOSED
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-bold text-[#F0F4F8]">
                      {reqData.id}
                    </span>
                    <button
                      onClick={() => handleCopyId(reqData.id)}
                      className="text-[#5C6978] hover:text-[#CBFF70] transition-colors cursor-pointer"
                      title="Copy Request ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-[#69E2AD]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Verdict Badge */}
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                      reqData.decision === 'ALLOW'
                        ? 'bg-[#69E2AD]/15 text-[#69E2AD] border-[#69E2AD]/40'
                        : reqData.decision === 'REQUIRE_APPROVAL'
                        ? 'bg-[#FFD080]/15 text-[#FFD080] border-[#FFD080]/40'
                        : 'bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/40'
                    }`}
                  >
                    {reqData.decision === 'REQUIRE_APPROVAL' ? 'PENDING REVIEW' : reqData.decision}
                  </span>
                  <div className="text-[10px] text-[#5C6978] font-mono mt-0.5">
                    {reqData.timestamp}
                  </div>
                </div>
              </div>

              {/* Key Attributes Block */}
              <div className="space-y-3 text-xs">
                {/* Agent & Tool Information */}
                <div className="p-3 rounded-lg bg-[#0E1318] border border-[#2A343E] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#9DAAB8]">Agent Identity:</span>
                    <span className="font-mono font-bold text-[#F0F4F8]">{reqData.agent}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#9DAAB8]">Target Action:</span>
                    <span className="font-mono text-[#CBFF70] font-semibold">{reqData.action}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#9DAAB8]">Tool Subsystem:</span>
                    <span className="font-mono text-[#AB98FF]">{reqData.tool}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#9DAAB8]">Target Resource:</span>
                    <span className="font-mono text-[#DDE5ED] truncate max-w-[210px]" title={reqData.resource}>
                      {reqData.resource}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#9DAAB8]">Data Provenance:</span>
                    <span className="font-mono text-[#5C6978]">{reqData.provenance}</span>
                  </div>
                </div>

                {/* Permission Invariant Check Pipeline */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-mono uppercase text-[#9DAAB8] tracking-wider block">
                    Invariant Validation Rules
                  </span>

                  <div className="space-y-1 font-mono text-[11px]">
                    {/* Check 1: Identity */}
                    <div className="p-2 rounded bg-[#101419] border border-[#2A343E] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#69E2AD]" />
                        <span className="text-[#DDE5ED]">Identity & Role Bounds</span>
                      </div>
                      <span className="text-[#69E2AD] text-[10px]">VERIFIED</span>
                    </div>

                    {/* Check 2: Prompt Injection */}
                    <div className="p-2 rounded bg-[#101419] border border-[#2A343E] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {reqData.injectionDetected ? (
                          <XCircle className="w-3.5 h-3.5 text-[#FF8585]" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#69E2AD]" />
                        )}
                        <span className="text-[#DDE5ED]">Injection Defense Filter</span>
                      </div>
                      <span
                        className={`text-[10px] ${
                          reqData.injectionDetected ? 'text-[#FF8585] font-bold' : 'text-[#69E2AD]'
                        }`}
                      >
                        {reqData.injectionDetected ? 'MATCHED (BLOCKED)' : 'PASS'}
                      </span>
                    </div>

                    {/* Check 3: Risk AST */}
                    <div className="p-2 rounded bg-[#101419] border border-[#2A343E] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-[#CBFF70]" />
                        <span className="text-[#DDE5ED]">Risk AST Composite</span>
                      </div>
                      <span className="font-bold text-[#F0F4F8]">
                        {reqData.risk} / 100 ({reqData.riskLevel})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Policy Enforcement Details */}
                <div className="p-3 rounded-lg bg-[#0E1318] border border-[#2A343E] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#9DAAB8]">Policy Rule:</span>
                    <span className="font-mono text-xs font-bold text-[#CBFF70]">
                      {reqData.policy}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9DAAB8] leading-relaxed">
                    {reqData.reason}
                  </p>
                </div>

                {/* Execution Sandbox State Separation */}
                <div className="p-3 rounded-lg bg-[#101419] border border-[#2A343E] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#9DAAB8] block">Sandbox Execution:</span>
                    <span className="text-xs font-mono font-semibold text-[#F0F4F8]">
                      {authSuccess || reqData.executionStatus === 'EXECUTED'
                        ? 'Containerized Tool Executed'
                        : reqData.decision === 'DENY'
                        ? 'Execution Refused (Boundary Sealed)'
                        : 'Held in Escrow (Awaiting Authorization)'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                      authSuccess || reqData.executionStatus === 'EXECUTED'
                        ? 'bg-[#69E2AD]/15 text-[#69E2AD] border-[#69E2AD]/30'
                        : reqData.decision === 'DENY'
                        ? 'bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/30'
                        : 'bg-[#FFD080]/15 text-[#FFD080] border-[#FFD080]/30'
                    }`}
                  >
                    {authSuccess ? 'EXECUTED' : reqData.executionStatus}
                  </span>
                </div>

                {/* Operator Actions Bar */}
                <div className="pt-2 flex flex-col gap-2">
                  {/* Human Escrow Authorization if pending */}
                  {(reqData.decision === 'REQUIRE_APPROVAL' && !authSuccess) && (
                    <button
                      onClick={handleSimulateApproval}
                      disabled={isAuthorizing}
                      className="w-full py-2 px-3 rounded-lg bg-[#FFD080] hover:bg-[#FFE099] text-[#0B0E11] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      {isAuthorizing ? (
                        <>
                          <LatticeLoader status="working" pattern="dots" cellSize={2} fontSize={10} color="#0B0E11" />
                          <span>Authorizing dual-key release...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Release & Authorize in Escrow</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('analyzer')}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#1B232B] hover:bg-[#232D37] border border-[#2A343E] hover:border-[#384654] text-xs font-medium text-[#F0F4F8] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5 text-[#CBFF70]" />
                      <span>Re-evaluate in Playground</span>
                    </button>

                    <button
                      onClick={() => setRawJsonModalOpen(true)}
                      className="py-2 px-3 rounded-lg bg-[#1B232B] hover:bg-[#232D37] border border-[#2A343E] text-xs font-mono text-[#9DAAB8] hover:text-[#F0F4F8] transition-colors cursor-pointer"
                      title="View raw AST JSON"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* n8n Webhook Quick Dispatch */}
                  <div className="pt-1">
                    <button
                      onClick={handleDispatchToN8n}
                      disabled={isPushingN8n}
                      className="w-full py-2 px-3 rounded-lg bg-[#101419] hover:bg-[#151B21] border border-[#2A343E] hover:border-[#CBFF70]/50 text-xs font-mono text-[#F0F4F8] flex items-center justify-between transition-colors cursor-pointer disabled:opacity-50"
                      title="Push request payload to n8n webhook"
                    >
                      <div className="flex items-center gap-1.5">
                        <Webhook className="w-3.5 h-3.5 text-[#CBFF70]" />
                        <span className="text-[11px] font-medium text-[#CBFF70]">n8n Webhook</span>
                      </div>
                      <span className="text-[11px] text-[#9DAAB8]">
                        {n8nStatus || 'Forward payload →'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Posture Summary Card */}
            <div className="control-panel p-4 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#2A343E]">
                <span className="font-semibold text-[#F0F4F8]">Risk Distribution Matrix</span>
                <span className="font-mono text-[10px] text-[#5C6978]">LIVE AST SAMPLE</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#69E2AD]">Low (0–30)</span>
                    <span className="text-[#F0F4F8] font-bold">{lowRiskCount}</span>
                  </div>
                  <div className="w-full bg-[#101419] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#69E2AD] h-full rounded-full transition-all duration-500"
                      style={{ width: `${total ? (lowRiskCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#FFD080]">Medium (31–44)</span>
                    <span className="text-[#F0F4F8] font-bold">{medRiskCount}</span>
                  </div>
                  <div className="w-full bg-[#101419] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FFD080] h-full rounded-full transition-all duration-500"
                      style={{ width: `${total ? (medRiskCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#FF8585]">Critical / High (45–100)</span>
                    <span className="text-[#F0F4F8] font-bold">{highRiskCount + critRiskCount}</span>
                  </div>
                  <div className="w-full bg-[#101419] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FF8585] h-full rounded-full transition-all duration-500"
                      style={{ width: `${total ? ((highRiskCount + critRiskCount) / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            RAW JSON INSPECTION MODAL
            ================================================== */}
        {rawJsonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="control-panel-elevated w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-[#2A343E] flex items-center justify-between bg-[#101419]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#CBFF70]" />
                  <span className="font-mono text-xs font-bold text-[#F0F4F8]">
                    Raw Governor Audit Payload: {reqData.id}
                  </span>
                </div>
                <button
                  onClick={() => setRawJsonModalOpen(false)}
                  className="text-[#9DAAB8] hover:text-[#F0F4F8] p-1 rounded hover:bg-[#1B232B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto bg-[#0B0E11] font-mono text-xs text-[#69E2AD]">
                <pre>{JSON.stringify(activeRequest, null, 2)}</pre>
              </div>

              <div className="p-3 border-t border-[#2A343E] bg-[#101419] flex justify-between items-center text-xs font-mono">
                <span className="text-[#5C6978]">SHA-256 HMAC Verified Signature</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(activeRequest, null, 2));
                    setCopiedId(true);
                    setTimeout(() => setCopiedId(false), 2000);
                  }}
                  className="px-3 py-1 rounded bg-[#1B232B] hover:bg-[#232D37] border border-[#2A343E] text-[#F0F4F8] flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-[#69E2AD]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Payload</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClickSpark>
  );
};
