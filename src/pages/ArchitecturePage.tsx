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
  X
} from 'lucide-react';
import DitherVeil from '../components/DitherVeil/DitherVeil.jsx';

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
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#18212F] tracking-tight">
            Security Architecture
          </h1>
          <p className="text-xs text-[#596579] mt-0.5">
            Reveal the runtime controls protecting every agent action before tool execution.
          </p>
        </div>
      </div>

      {/* Main Visual Flow Container */}
      <div className="relative rounded-[12px] border border-[#E2E6EB] bg-white overflow-hidden p-6 space-y-6 select-none shadow-xs">
        {/* Subtle daylight texture in background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <DitherVeil
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1400&auto=format&fit=crop"
            pattern="floyd"
            pixelSize={3}
            palette="duotone"
            inkColor="#E2E6EB"
            paperColor="#FFFFFF"
            rimColor="#168C82"
            rim={0.1}
            revealRadius={140}
            softness={0.8}
            linger={1.0}
            fit="cover"
          />
        </div>

        {/* Level 1: Ingestion Pipeline Nodes */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
          <div className="p-3.5 rounded-[8px] bg-[#F6F7F9] border border-[#E2E6EB] w-52 text-center shadow-xs">
            <User className="w-4 h-4 text-[#596579] mx-auto mb-1.5" />
            <div className="font-semibold text-[#18212F]">User Request</div>
            <div className="text-[11px] text-[#8A94A3]">Natural-Language Task</div>
          </div>

          <ArrowRight className="w-4 h-4 text-[#168C82] hidden sm:block shrink-0" />
          <ArrowDown className="w-4 h-4 text-[#168C82] sm:hidden shrink-0" />

          <div className="p-3.5 rounded-[8px] bg-[#F6F7F9] border border-[#E2E6EB] w-52 text-center shadow-xs">
            <Bot className="w-4 h-4 text-[#168C82] mx-auto mb-1.5" />
            <div className="font-semibold text-[#18212F]">AI Agent</div>
            <div className="text-[11px] text-[#8A94A3]">Synthesizes Tool Action</div>
          </div>

          <ArrowRight className="w-4 h-4 text-[#168C82] hidden sm:block shrink-0" />
          <ArrowDown className="w-4 h-4 text-[#168C82] sm:hidden shrink-0" />

          <div className="p-3.5 rounded-[8px] bg-[#E7F5F3] border border-[#168C82]/40 w-56 text-center shadow-xs">
            <Shield className="w-4 h-4 text-[#168C82] mx-auto mb-1.5" />
            <div className="font-semibold text-[#116F68]">AEGIS Gateway</div>
            <div className="text-[11px] text-[#168C82] font-medium">Runtime Interception</div>
          </div>
        </div>

        {/* Level 2: Inside AEGIS Security Pipeline Nodes */}
        <div className="relative z-10 p-4 rounded-[10px] bg-[#F6F7F9] border border-[#E2E6EB]">
          <div className="text-[11px] font-semibold tracking-wide text-[#596579] uppercase text-center mb-3">
            Internal AEGIS Verification Pipeline
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {aegisStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStage(stage)}
                  className="p-2.5 rounded-[7px] bg-white border border-[#E2E6EB] hover:border-[#168C82]/50 hover:bg-[#F6F7F9] transition-all cursor-pointer text-center group flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#8A94A3] block mb-1">0{idx + 1}</span>
                    <Icon className="w-4 h-4 text-[#168C82] mx-auto mb-1.5 group-hover:scale-105 transition-transform" />
                    <div className="font-semibold text-xs text-[#18212F] truncate">
                      {stage.name}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#8A94A3] truncate mt-1">
                    {stage.subtitle}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level 3: 3 Decision Branches */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Branch 1: ALLOW */}
          <div className="p-4 rounded-[8px] bg-[#E7F7F1] border border-[#21A67A]/30 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-[#21A67A] font-bold mb-1">
                <span>01. Low Risk (0–30)</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-[#18212F] font-bold text-sm mb-1">ALLOW</div>
              <p className="text-xs text-[#596579] leading-relaxed">
                Action verified within least-privilege boundary. Released immediately to Secure Tool Execution.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#21A67A]/20 text-[11px] text-[#21A67A] font-semibold">
              → Execute Tool Sandbox
            </div>
          </div>

          {/* Branch 2: HUMAN APPROVAL */}
          <div className="p-4 rounded-[8px] bg-[#FFF4DE] border border-[#D99018]/30 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-[#D99018] font-bold mb-1">
                <span>02. Elevated Risk (31–70)</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-[#18212F] font-bold text-sm mb-1">HUMAN APPROVAL</div>
              <p className="text-xs text-[#596579] leading-relaxed">
                Sensitive state mutation or external transmission. Quarantined in escrow until authorized.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#D99018]/20 text-[11px] text-[#D99018] font-semibold">
              → Review Queue → Execute
            </div>
          </div>

          {/* Branch 3: DENY */}
          <div className="p-4 rounded-[8px] bg-[#FDECEC] border border-[#E65353]/30 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-[#E65353] font-bold mb-1">
                <span>03. Critical Risk (71–100)</span>
                <XCircle className="w-4 h-4" />
              </div>
              <div className="text-[#18212F] font-bold text-sm mb-1">DENY</div>
              <p className="text-xs text-[#596579] leading-relaxed">
                Prompt injection, unauthorized tool, role spoofing, or critical asset violation. Action blocked.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#E65353]/20 text-[11px] text-[#E65353] font-semibold">
              → Block & Terminate
            </div>
          </div>
        </div>

        {/* Level 4: Audit & Continuous Monitoring */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-[8px] bg-[#F6F7F9] border border-[#E2E6EB] text-xs text-[#596579] gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#168C82]" />
            <span className="font-semibold text-[#18212F]">Audit Trail</span>
            <span className="text-[#CDD3DB]">→</span>
            <Radio className="w-4 h-4 text-[#21A67A]" />
            <span className="font-semibold text-[#18212F]">Continuous Monitoring</span>
          </div>
          <div className="text-[11px] text-[#8A94A3]">
            All verdicts feed the immutable compliance trail
          </div>
        </div>
      </div>

      {/* Stage Detail Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="aegis-panel-elevated p-6 max-w-md w-full border border-[#CDD3DB] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3 mb-3">
              <div className="flex items-center gap-2 text-[#18212F] font-bold text-sm">
                <selectedStage.icon className="w-4 h-4 text-[#168C82]" />
                <span>{selectedStage.name}</span>
              </div>
              <button
                onClick={() => setSelectedStage(null)}
                className="text-[#8A94A3] hover:text-[#18212F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#596579] leading-relaxed mb-3">
              {selectedStage.description}
            </p>

            <div className="p-3 bg-[#E7F5F3] rounded-[7px] border border-[#168C82]/20 text-xs text-[#116F68] mb-4">
              <span className="text-[#168C82] font-semibold block mb-0.5 text-[11px]">Runtime Invariant:</span>
              {selectedStage.rule}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedStage(null)}
                className="px-3.5 py-1.5 rounded-[7px] bg-[#F1F3F5] hover:bg-[#E2E6EB] text-xs text-[#18212F] font-semibold transition-colors cursor-pointer"
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
