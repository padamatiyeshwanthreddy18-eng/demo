import React, { useState } from 'react';
import {
  User,
  Bot,
  Shield,
  Sparkles,
  Fingerprint,
  Compass,
  Sliders,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Radio,
  ArrowRight,
  ArrowDown,
  GitFork,
  X,
  Zap,
  Lock
} from 'lucide-react';

interface StageCard {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  description: string;
  rule: string;
}

export const ArchitecturePage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<StageCard | null>(null);

  const aegisStages: StageCard[] = [
    {
      id: 'intent',
      name: 'Intent Analyzer',
      subtitle: 'Goal & Scope Alignment',
      icon: Sparkles,
      description: 'Evaluates alignment between declared user goal and proposed agent action. Flags scope escalation where read tasks attempt destructive calls.',
      rule: 'Verifies operation necessity and flags unprompted mutations.'
    },
    {
      id: 'identity',
      name: 'Identity & Permission',
      subtitle: 'Least Privilege Verification',
      icon: Fingerprint,
      description: 'Cryptographically verifies agent registration, active status, and authentic role. Blocks role spoofing and unauthorized tool usage.',
      rule: 'Unknown or disabled agents fail closed. execute_shell is permanently blocked.'
    },
    {
      id: 'context',
      name: 'Context Validator',
      subtitle: 'Operational Coupling',
      icon: Compass,
      description: 'Validates operational necessity within active task context. Detects resource divergence and unauthorized exfiltration hazards.',
      rule: 'Flags unexpected background activity and scope escalations.'
    },
    {
      id: 'sensitivity',
      name: 'Data Sensitivity',
      subtitle: 'Asset Classification',
      icon: Sliders,
      description: 'Classifies target resources into PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED, or CRITICAL tiers.',
      rule: 'CRITICAL assets (credentials, keys) trigger unconditional denial.'
    },
    {
      id: 'injection',
      name: 'Prompt Injection',
      subtitle: 'Adversarial Shield',
      icon: ShieldAlert,
      description: 'Deterministic local heuristic pattern scanner detecting jailbreaks, prompt overrides, and privilege escalation attempts.',
      rule: 'Scans task, payload parameters, and base64 encodings.'
    },
    {
      id: 'risk',
      name: 'Risk Scoring',
      subtitle: 'Composite Factor Engine',
      icon: Activity,
      description: 'Calculates dynamic 0–100 risk score across independent vectors (action destructiveness, sensitivity, destination trust, irreversibility).',
      rule: '0-30 LOW · 31-70 MEDIUM/HIGH · 71-100 CRITICAL.'
    },
    {
      id: 'policy',
      name: 'Policy Engine',
      subtitle: 'Deterministic Governance',
      icon: Shield,
      description: 'Applies deterministic security rules (POL-001 through POL-015). Security policies strictly override model predictions.',
      rule: 'Fail-closed security: missing metadata results in denial.'
    },
    {
      id: 'decision',
      name: 'Decision Engine',
      subtitle: 'Gate Verdict Dispatch',
      icon: GitFork,
      description: 'Dispatches one of three final authorization verdicts: ALLOW, REQUIRE_APPROVAL, or DENY.',
      rule: 'Enforces human sign-off on sensitive mutations.'
    }
  ];

  return (
    <div className="w-full space-y-6 pb-12 font-sans selection:bg-[#CBFF70]/20 selection:text-[#CBFF70]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#CBFF70] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#CBFF70] font-semibold">
              Governor Blueprint
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F0F4F8] tracking-tight">
            Security Architecture & Verification Pipeline
          </h1>
          <p className="text-xs text-[#9DAAB8] mt-0.5">
            Deterministic runtime interception layer protecting tools, APIs, and databases before any autonomous code executes.
          </p>
        </div>
      </div>

      {/* Main Visual Flow Container */}
      <div className="control-panel p-6 sm:p-7 space-y-6 select-none relative overflow-hidden">
        {/* Permission Boundary Line Motif */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#CBFF70] via-[#AB98FF] to-transparent opacity-80" />

        {/* Level 1: Ingestion Pipeline Nodes */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#101419] border border-[#2A343E] w-52 text-center shadow-xs">
            <User className="w-4 h-4 text-[#9DAAB8] mx-auto mb-1.5" />
            <div className="font-semibold text-[#F0F4F8]">User Request</div>
            <div className="text-[11px] text-[#5C6978] font-mono">Natural-Language Task</div>
          </div>

          <ArrowRight className="w-4 h-4 text-[#CBFF70] hidden sm:block shrink-0" />
          <ArrowDown className="w-4 h-4 text-[#CBFF70] sm:hidden shrink-0" />

          <div className="p-3.5 rounded-lg bg-[#101419] border border-[#2A343E] w-52 text-center shadow-xs">
            <Bot className="w-4 h-4 text-[#AB98FF] mx-auto mb-1.5" />
            <div className="font-semibold text-[#F0F4F8]">AI Agent</div>
            <div className="text-[11px] text-[#5C6978] font-mono">Synthesizes Tool Call</div>
          </div>

          <ArrowRight className="w-4 h-4 text-[#CBFF70] hidden sm:block shrink-0" />
          <ArrowDown className="w-4 h-4 text-[#CBFF70] sm:hidden shrink-0" />

          <div className="p-3.5 rounded-lg bg-[#1B232B] border border-[#CBFF70]/50 w-56 text-center shadow-md relative">
            <Shield className="w-4 h-4 text-[#CBFF70] mx-auto mb-1.5" />
            <div className="font-semibold text-[#CBFF70] font-mono">AEGIS Governor Gate</div>
            <div className="text-[11px] text-[#9DAAB8] font-mono">Runtime Interception</div>
          </div>
        </div>

        {/* Level 2: Inside AEGIS Security Pipeline Nodes */}
        <div className="p-4 rounded-xl bg-[#0E1318] border border-[#2A343E]">
          <div className="text-[11px] font-mono font-semibold tracking-wider text-[#CBFF70] uppercase text-center mb-3">
            Internal Invariant Verification Pipeline (8 Stages)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {aegisStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStage(stage)}
                  className="p-2.5 rounded-lg bg-[#151B21] border border-[#2A343E] hover:border-[#CBFF70]/50 hover:bg-[#1B232B] transition-all cursor-pointer text-center group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#5C6978] block mb-1">0{idx + 1}</span>
                    <Icon className="w-4 h-4 text-[#AB98FF] group-hover:text-[#CBFF70] mx-auto mb-1.5 group-hover:scale-110 transition-all" />
                    <div className="font-semibold text-xs text-[#F0F4F8] truncate">
                      {stage.name}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#5C6978] truncate mt-1 font-mono">
                    {stage.subtitle}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level 3: 3 Decision Branches with Decision Boundary Motif */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Branch 1: ALLOW */}
          <div className="p-4 rounded-xl bg-[#101419] border border-[#69E2AD]/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#69E2AD] font-bold mb-1">
                <span>01. Low Risk (0–30)</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-[#69E2AD] font-bold text-sm mb-1">ALLOW VERDICT</div>
              <p className="text-xs text-[#9DAAB8] font-sans leading-relaxed">
                Action verified within least-privilege boundary. Released to Containerized Secure Tool Sandbox.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#2A343E] text-[11px] text-[#69E2AD] font-semibold">
              → Execute Tool Sandbox
            </div>
          </div>

          {/* Branch 2: HUMAN APPROVAL ESCROW */}
          <div className="p-4 rounded-xl bg-[#101419] border border-[#FFD080]/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#FFD080] font-bold mb-1">
                <span>02. Elevated Risk (31–70)</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-[#FFD080] font-bold text-sm mb-1">HUMAN ESCROW</div>
              <p className="text-xs text-[#9DAAB8] font-sans leading-relaxed">
                Sensitive state mutation or external transmission. Quarantined in escrow until dual-key operator sign-off.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#2A343E] text-[11px] text-[#FFD080] font-semibold">
              → Escrow Queue → Dual-Key Release
            </div>
          </div>

          {/* Branch 3: HARD DENY */}
          <div className="p-4 rounded-xl bg-[#101419] border border-[#FF8585]/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#FF8585] font-bold mb-1">
                <span>03. Critical Risk (71–100)</span>
                <XCircle className="w-4 h-4" />
              </div>
              <div className="text-[#FF8585] font-bold text-sm mb-1">HARD DENY BOUNDARY</div>
              <p className="text-xs text-[#9DAAB8] font-sans leading-relaxed">
                Prompt injection, unauthorized tool, role spoofing, or credential access. Boundary line terminates execution.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#2A343E] text-[11px] text-[#FF8585] font-semibold">
              → Sealed & Blocked Forever
            </div>
          </div>
        </div>

        {/* Level 4: Audit & Continuous Monitoring */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-lg bg-[#0E1318] border border-[#2A343E] text-xs text-[#9DAAB8] gap-3 font-mono">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#CBFF70]" />
            <span className="font-semibold text-[#F0F4F8]">Audit Trail (HMAC-SHA256)</span>
            <span className="text-[#2A343E]">→</span>
            <Radio className="w-4 h-4 text-[#69E2AD]" />
            <span className="font-semibold text-[#F0F4F8]">Continuous Live Stream</span>
          </div>
          <div className="text-[11px] text-[#5C6978]">
            All verdicts feed the immutable compliance record
          </div>
        </div>
      </div>

      {/* Stage Detail Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="control-panel-elevated p-6 max-w-md w-full border border-[#2A343E] shadow-2xl relative permission-boundary-vertical">
            <div className="flex items-center justify-between border-b border-[#2A343E] pb-3 mb-3">
              <div className="flex items-center gap-2 text-[#F0F4F8] font-bold text-sm font-mono">
                <selectedStage.icon className="w-4 h-4 text-[#CBFF70]" />
                <span>{selectedStage.name}</span>
              </div>
              <button
                onClick={() => setSelectedStage(null)}
                className="text-[#9DAAB8] hover:text-[#F0F4F8] p-1 rounded hover:bg-[#1B232B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#9DAAB8] leading-relaxed mb-3 font-sans">
              {selectedStage.description}
            </p>

            <div className="p-3 bg-[#0E1318] rounded-lg border border-[#2A343E] text-xs text-[#CBFF70] font-mono mb-4">
              <span className="text-[#5C6978] font-semibold block mb-0.5 text-[11px]">Runtime Invariant:</span>
              {selectedStage.rule}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedStage(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#1B232B] hover:bg-[#232D37] border border-[#2A343E] text-xs text-[#F0F4F8] font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
