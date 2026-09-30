import React from 'react';
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
  Zap
} from 'lucide-react';
import { Tooltip } from '../components/Tooltip.js';

interface OverviewPageProps {
  metrics: DashboardMetrics | null;
  onNavigate: (tab: string) => void;
  onRunScenario: (scenarioIndex: number) => void;
  latestReport: SecurityInspectionReport | null;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  metrics,
  onNavigate,
  onRunScenario
}) => {
  const total = metrics?.total_requests ?? 0;
  const allowed = metrics?.allowed_count ?? 0;
  const denied = metrics?.denied_count ?? 0;
  const pending = metrics?.pending_approvals_count ?? 0;
  const avgRisk = metrics?.average_risk_score ?? 0;
  const blockedAttacks = metrics?.prompt_injections_blocked ?? 0;

  const lowRiskCount = metrics?.risk_distribution.low ?? 0;
  const medRiskCount = metrics?.risk_distribution.medium ?? 0;
  const highRiskCount = metrics?.risk_distribution.high ?? 0;
  const critRiskCount = metrics?.risk_distribution.critical ?? 0;

  const demoScenarios = [
    { id: 1, title: 'Safe File Read', agent: 'research-agent-01', action: 'read_file', expected: 'ALLOW' },
    { id: 2, title: 'Sensitive Email', agent: 'research-agent-01', action: 'send_email', expected: 'APPROVAL' },
    { id: 5, title: 'Database Update', agent: 'database-agent-01', action: 'database_update', expected: 'APPROVAL' },
    { id: 3, title: 'Database Delete', agent: 'research-agent-01', action: 'database_delete', expected: 'DENY' },
    { id: 4, title: 'Prompt Injection', agent: 'research-agent-01', action: 'execute_shell', expected: 'DENY' },
    { id: 6, title: 'Unknown Agent', agent: 'unknown-rogue-agent', action: 'execute_shell', expected: 'DENY' }
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ==================================================
          60/40 COMPACT ENTERPRISE HERO (BRIGHT NATURAL THEME)
          ================================================== */}
      <div className="relative rounded-[12px] border border-[#E2E6EB] bg-gradient-to-br from-white via-[#FCFDFD] to-[#F4F9F8] overflow-hidden p-6 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: 60% Content */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-[11px] font-semibold tracking-wider text-[#168C82] uppercase flex items-center gap-1.5">
              <span>Runtime Security for Autonomous Agents</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#18212F] tracking-tight">
                AEGIS AI
              </h1>
              <p className="text-sm font-normal text-[#596579] mt-0.5">
                Agent Permission Governor
              </p>
            </div>

            <div className="text-base sm:text-lg font-semibold text-[#18212F] pt-0.5">
              Every AI action earns permission.
            </div>

            <p className="text-xs sm:text-sm text-[#596579] max-w-xl leading-relaxed">
              Intercept, evaluate and govern autonomous agent actions before they reach critical tools, APIs and data.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('analyzer')}
                className="h-10 px-4 rounded-[7px] bg-[#168C82] hover:bg-[#10776F] text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Analyze Action</span>
              </button>

              <button
                onClick={() => onNavigate('architecture')}
                className="h-10 px-4 rounded-[7px] bg-white hover:bg-[#F1F3F5] border border-[#CDD3DB] text-[#18212F] text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <GitFork className="w-3.5 h-3.5 text-[#596579]" />
                <span>Explore Architecture</span>
              </button>
            </div>
          </div>

          {/* Right: 40% Minimal Runtime Interception Architecture Visualization */}
          <div className="lg:col-span-5 bg-[#F6F7F9] rounded-[10px] border border-[#E2E6EB] p-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E6EB] mb-3 text-[11px] text-[#596579]">
              <span className="font-semibold text-[#18212F]">Runtime Security Interception</span>
              <span className="flex items-center gap-1.5 text-[#21A67A] text-[10px] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A] animate-pulse" />
                GATEWAY ACTIVE
              </span>
            </div>

            {/* Technical Diagram */}
            <div className="space-y-2.5 text-xs">
              {/* Step 1: Agent Request */}
              <div className="flex items-center justify-between p-2 rounded-[7px] bg-white border border-[#E2E6EB] shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[5px] bg-[#E7F5F3] text-[#168C82] flex items-center justify-center font-mono text-[10px] font-bold">
                    AI
                  </div>
                  <div>
                    <div className="font-semibold text-[#18212F] text-xs">Autonomous Agent</div>
                    <div className="text-[10px] text-[#8A94A3] font-mono">Proposed action dispatched</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#168C82] bg-[#E7F5F3] px-2 py-0.5 rounded-[4px] border border-[#168C82]/20">
                  INTERCEPTED
                </span>
              </div>

              {/* Connecting line */}
              <div className="flex items-center justify-center relative py-0.5">
                <div className="w-px h-3 bg-[#CDD3DB] relative">
                  <span className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-[#168C82] animate-ping" />
                </div>
              </div>

              {/* Step 2: AEGIS Governor Gate */}
              <div className="p-2.5 rounded-[7px] bg-[#E7F5F3] border border-[#168C82]/30 relative shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#168C82]" />
                    <span className="font-semibold text-xs text-[#116F68]">AEGIS Governor Gate</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#21A67A] font-medium">Deterministic Invariants</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[10px] text-[#596579] font-mono">
                  <div className="bg-white px-2 py-1 rounded text-center border border-[#168C82]/15 text-[#18212F]">
                    Identity
                  </div>
                  <div className="bg-white px-2 py-1 rounded text-center border border-[#168C82]/15 text-[#18212F]">
                    Injection
                  </div>
                  <div className="bg-white px-2 py-1 rounded text-center border border-[#168C82]/15 text-[#18212F]">
                    Policy
                  </div>
                </div>
              </div>

              {/* Connecting branches */}
              <div className="flex items-center justify-center relative py-0.5">
                <div className="w-px h-3 bg-[#CDD3DB]" />
              </div>

              {/* Step 3: Outcomes */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <div className="p-1.5 rounded-[6px] bg-[#E7F7F1] border border-[#21A67A]/30 text-center">
                  <div className="font-semibold text-[#21A67A]">ALLOW</div>
                  <div className="text-[9px] text-[#596579] mt-0.5">Execute Tool</div>
                </div>
                <div className="p-1.5 rounded-[6px] bg-[#FFF4DE] border border-[#D99018]/30 text-center">
                  <div className="font-semibold text-[#D99018]">APPROVAL</div>
                  <div className="text-[9px] text-[#596579] mt-0.5">Escrow Pause</div>
                </div>
                <div className="p-1.5 rounded-[6px] bg-[#FDECEC] border border-[#E65353]/30 text-center">
                  <div className="font-semibold text-[#E65353]">DENY</div>
                  <div className="text-[9px] text-[#596579] mt-0.5">Block Action</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          6 BRIGHT METRIC CARDS (White cards, subtle shadow, semantic color)
          ================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* TOTAL REQUESTS */}
        <div className="aegis-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#596579] text-xs font-medium">
            <span>Total Requests</span>
            <Activity className="w-3.5 h-3.5 text-[#8A94A3]" />
          </div>
          <div className="text-3xl font-semibold text-[#18212F] tabular-nums my-1.5">
            {total}
          </div>
          <div className="text-[11px] text-[#8A94A3]">
            Runtime intercepts
          </div>
        </div>

        {/* ALLOWED */}
        <div className="aegis-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#596579] text-xs font-medium">
            <span>Allowed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#21A67A]" />
          </div>
          <div className="text-3xl font-semibold text-[#21A67A] tabular-nums my-1.5">
            {allowed}
          </div>
          <div className="text-[11px] text-[#596579]">
            Successfully authorized
          </div>
        </div>

        {/* DENIED */}
        <div className="aegis-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#596579] text-xs font-medium">
            <span>Denied</span>
            <XCircle className="w-3.5 h-3.5 text-[#E65353]" />
          </div>
          <div className="text-3xl font-semibold text-[#E65353] tabular-nums my-1.5">
            {denied}
          </div>
          <div className="text-[11px] text-[#596579]">
            Blocked by policy
          </div>
        </div>

        {/* PENDING */}
        <div className="aegis-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#596579] text-xs font-medium">
            <span>Pending Approvals</span>
            <Clock className="w-3.5 h-3.5 text-[#D99018]" />
          </div>
          <div className="text-3xl font-semibold text-[#D99018] tabular-nums my-1.5">
            {pending}
          </div>
          <div className="text-[11px] text-[#596579]">
            Awaiting human review
          </div>
        </div>

        {/* AVG RISK */}
        <div className="aegis-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#596579] text-xs font-medium">
            <span>Average Risk</span>
            <Tooltip
              term="Risk Score"
              content="Dynamic composite index from 0 to 100 based on operational destructiveness, sensitivity tier, and adversarial injection indicators."
            >
              <span className="text-[10px] text-[#8A94A3] hover:text-[#168C82]">Info</span>
            </Tooltip>
          </div>
          <div className="text-3xl font-semibold text-[#18212F] tabular-nums my-1.5 flex items-baseline gap-1">
            <span>{avgRisk}</span>
            <span className="text-xs font-normal text-[#8A94A3]">/100</span>
          </div>
          <div className="text-[11px] text-[#8A94A3]">
            Mean factor score
          </div>
        </div>

        {/* ATTACKS BLOCKED */}
        <div className="aegis-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#596579] text-xs font-medium">
            <span>Attacks Blocked</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#8B5CF6]" />
          </div>
          <div className="text-3xl font-semibold text-[#8B5CF6] tabular-nums my-1.5">
            {blockedAttacks}
          </div>
          <div className="text-[11px] text-[#596579]">
            Adversarial injections
          </div>
        </div>
      </div>

      {/* ==================================================
          SECURITY POSTURE SECTION (BRIGHT WHITE PANEL)
          ================================================== */}
      <div className="aegis-panel p-5">
        <div className="flex items-center justify-between mb-4 border-b border-[#E2E6EB] pb-3">
          <div className="text-xs font-semibold tracking-wide text-[#18212F] uppercase">
            Security Posture
          </div>
          <span className="text-xs text-[#8A94A3]">
            Live Gate Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-10 gap-6 text-xs">
          {/* 40%: Risk Distribution */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-[#18212F] font-semibold text-xs">Risk Distribution</div>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#596579] font-medium">Low (0–30)</span>
                  <span className="font-mono text-[#18212F] font-semibold">{lowRiskCount}</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#21A67A] h-full rounded-full transition-all duration-500"
                    style={{ width: `${total ? (lowRiskCount / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#596579] font-medium">Medium (31–44)</span>
                  <span className="font-mono text-[#18212F] font-semibold">{medRiskCount}</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D99018] h-full rounded-full transition-all duration-500"
                    style={{ width: `${total ? (medRiskCount / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#596579] font-medium">High (45–70)</span>
                  <span className="font-mono text-[#18212F] font-semibold">{highRiskCount}</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F97316] h-full rounded-full transition-all duration-500"
                    style={{ width: `${total ? (highRiskCount / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#596579] font-medium">Critical (71–100)</span>
                  <span className="font-mono text-[#18212F] font-semibold">{critRiskCount}</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#E65353] h-full rounded-full transition-all duration-500"
                    style={{ width: `${total ? (critRiskCount / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 30%: Decision Breakdown */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[#18212F] font-semibold text-xs">Decision Breakdown</div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-[7px] bg-[#F6F7F9] flex items-center justify-between border border-[#E2E6EB]">
                <span className="flex items-center gap-2 text-[#21A67A] text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Allowed</span>
                </span>
                <span className="font-mono font-semibold text-[#18212F]">{allowed}</span>
              </div>
              <div className="p-2.5 rounded-[7px] bg-[#F6F7F9] flex items-center justify-between border border-[#E2E6EB]">
                <span className="flex items-center gap-2 text-[#D99018] text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Human Approval</span>
                </span>
                <span className="font-mono font-semibold text-[#18212F]">{pending}</span>
              </div>
              <div className="p-2.5 rounded-[7px] bg-[#F6F7F9] flex items-center justify-between border border-[#E2E6EB]">
                <span className="flex items-center gap-2 text-[#E65353] text-xs font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Denied</span>
                </span>
                <span className="font-mono font-semibold text-[#18212F]">{denied}</span>
              </div>
            </div>
          </div>

          {/* 30%: Security Controls (Clean rows with separators) */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[#18212F] font-semibold text-xs">Security Controls</div>
            <div className="divide-y divide-[#E2E6EB] text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#596579]">Policy Engine</span>
                <span className="text-[#21A67A] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A]" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#596579]">Injection Defense</span>
                <span className="text-[#21A67A] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A]" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#596579]">Human Approval Escrow</span>
                <span className="text-[#21A67A] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A]" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#596579]">Audit Logging</span>
                <span className="text-[#21A67A] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A]" /> Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          QUICK BENCHMARK SCENARIOS
          ================================================== */}
      <div className="aegis-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold tracking-wide text-[#18212F] uppercase">
            Quick Benchmark Scenarios
          </div>
          <span className="text-xs text-[#8A94A3]">
            Load realistic agent requests into the analyzer
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {demoScenarios.map(sc => (
            <button
              key={sc.id}
              onClick={() => onRunScenario(sc.id)}
              className="p-3 rounded-[8px] bg-white border border-[#E2E6EB] hover:border-[#168C82]/50 hover:bg-[#F6F7F9] transition-all text-left group cursor-pointer shadow-xs"
            >
              <div className="text-xs font-semibold text-[#18212F] group-hover:text-[#168C82] transition-colors truncate">
                {sc.title}
              </div>
              <div className="text-[11px] text-[#8A94A3] font-mono truncate mt-0.5">
                {sc.action}
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] font-semibold ${
                    sc.expected === 'ALLOW'
                      ? 'bg-[#E7F7F1] text-[#21A67A] border border-[#21A67A]/30'
                      : sc.expected === 'APPROVAL'
                      ? 'bg-[#FFF4DE] text-[#D99018] border border-[#D99018]/30'
                      : 'bg-[#FDECEC] text-[#E65353] border border-[#E65353]/30'
                  }`}
                >
                  {sc.expected}
                </span>
                <Play className="w-2.5 h-2.5 text-[#8A94A3] group-hover:text-[#168C82] transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================
          LIVE AGENT ACTIVITY TABLE (CLEAN WHITE SURFACE)
          ================================================== */}
      <div className="aegis-panel p-5">
        <div className="flex items-center justify-between mb-4 border-b border-[#E2E6EB] pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#18212F] uppercase">
            <Radio className="w-3.5 h-3.5 text-[#168C82]" />
            <span>Live Agent Activity</span>
          </div>
          <button
            onClick={() => onNavigate('monitor')}
            className="text-xs font-medium text-[#168C82] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Monitor</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

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
              {(metrics?.recent_activity || []).slice(0, 6).map(act => {
                let riskCategory = 'Low';
                let riskColor = 'text-[#21A67A]';
                if (act.risk_score >= 71) {
                  riskCategory = 'Critical';
                  riskColor = 'text-[#E65353]';
                } else if (act.risk_score >= 45) {
                  riskCategory = 'High';
                  riskColor = 'text-[#F97316]';
                } else if (act.risk_score >= 31) {
                  riskCategory = 'Medium';
                  riskColor = 'text-[#D99018]';
                }

                return (
                  <tr key={act.id} className="hover:bg-[#F6F7F9] transition-colors">
                    <td className="py-2.5 px-3 text-[#596579] text-xs font-mono">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-[#18212F] font-mono text-xs font-medium">
                      {act.agent_id}
                    </td>
                    <td className="py-2.5 px-3 text-[#168C82] font-mono text-xs font-medium">
                      {act.action}
                    </td>
                    <td className="py-2.5 px-3 text-[#596579] font-mono text-xs truncate max-w-[180px]">
                      {act.resource}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-mono font-semibold ${riskColor}`}>
                        {act.risk_score}
                      </span>
                      <span className="text-[#8A94A3] text-[11px] ml-1.5">
                        {riskCategory}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-semibold ${
                          act.decision === 'ALLOW'
                            ? 'bg-[#E7F7F1] text-[#21A67A] border border-[#21A67A]/30'
                            : act.decision === 'REQUIRE_APPROVAL'
                            ? 'bg-[#FFF4DE] text-[#D99018] border border-[#D99018]/30'
                            : 'bg-[#FDECEC] text-[#E65353] border border-[#E65353]/30'
                        }`}
                      >
                        {act.decision === 'REQUIRE_APPROVAL' ? 'APPROVAL' : act.decision}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(!metrics?.recent_activity || metrics.recent_activity.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8A94A3] text-xs">
                    No security events — No agent activity has been detected in this session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
