import React, { useState, useEffect } from 'react';
import { RegisteredAgent } from '../server/types.js';
import { fetchAgents } from '../services/api.js';
import {
  Users,
  Bot,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  Mail,
  RefreshCw,
  X,
  ArrowRight
} from 'lucide-react';
import { Tooltip } from '../components/Tooltip.js';

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<RegisteredAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<RegisteredAgent | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await fetchAgents();
      setAgents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const getAgentIcon = (role: string) => {
    switch (role) {
      case 'database_agent':
        return Database;
      case 'email_agent':
        return Mail;
      case 'admin_agent':
        return Shield;
      case 'research_agent':
      default:
        return Bot;
    }
  };

  const getTrustLabel = (level: number) => {
    if (level >= 5) return 'Very High';
    if (level >= 4) return 'High';
    if (level >= 3) return 'Medium';
    return 'Low';
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans selection:bg-[#CBFF70]/20 selection:text-[#CBFF70]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#CBFF70] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#CBFF70] font-semibold">
              Fleet Governance
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F0F4F8] tracking-tight">
            Autonomous Agent Fleet Directory
          </h1>
          <p className="text-xs text-[#9DAAB8] mt-0.5">
            Registered autonomous agents, cryptographic identities, and deterministic least-privilege capability boundaries.
          </p>
        </div>

        <button
          onClick={loadAgents}
          className="p-1.5 rounded-lg bg-[#151B21] border border-[#2A343E] text-[#9DAAB8] hover:text-[#F0F4F8] hover:bg-[#1B232B] transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          title="Refresh directory"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#CBFF70]' : ''}`} />
        </button>
      </div>

      {/* Agents Identity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => {
          const Icon = getAgentIcon(agent.role);
          const isActive = agent.status === 'active';

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`control-panel p-4 flex flex-col justify-between transition-all cursor-pointer hover:border-[#CBFF70]/50 hover:bg-[#1B232B] ${
                !isActive ? 'opacity-60' : ''
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#101419] border border-[#2A343E] flex items-center justify-center text-[#CBFF70] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#F0F4F8]">
                        {agent.name}
                      </h3>
                      <span className="text-xs font-mono font-medium text-[#CBFF70]">
                        {agent.id}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      isActive
                        ? 'bg-[#69E2AD]/15 text-[#69E2AD] border-[#69E2AD]/30'
                        : 'bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/30'
                    }`}
                  >
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                {/* Role & Trust */}
                <div className="space-y-1.5 text-xs bg-[#0E1318] p-3 rounded-lg border border-[#2A343E] mb-3 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#5C6978]">Role:</span>
                    <span className="text-[#F0F4F8] font-medium">{agent.role.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6978]">Trust Level:</span>
                    <span className="text-[#CBFF70] font-semibold">{getTrustLabel(agent.trust_level)} ({agent.trust_level}/5)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#2A343E]">
                    <span className="text-[#5C6978]">Permissions:</span>
                    <span className="text-[#69E2AD] font-semibold">{agent.allowed_actions.length} allowed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6978]">Escrow Required:</span>
                    <span className="text-[#FFD080] font-semibold">{agent.approval_actions.length} approval</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6978]">Denied:</span>
                    <span className="text-[#FF8585] font-semibold">{agent.denied_actions.length} blocked</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A343E] text-xs text-[#CBFF70] flex items-center justify-between font-semibold font-mono">
                <span>View Identity Policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[#151B21] border-l border-[#2A343E] p-6 overflow-y-auto space-y-4 shadow-2xl relative permission-boundary-vertical">
            <div className="flex items-center justify-between border-b border-[#2A343E] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#CBFF70]" />
                <h3 className="font-semibold text-sm text-[#F0F4F8] font-mono">{selectedAgent.name}</h3>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-[#9DAAB8] hover:text-[#F0F4F8] p-1 rounded hover:bg-[#1B232B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-[#0E1318] rounded-lg border border-[#2A343E] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Agent ID:</span>
                  <span className="text-[#CBFF70] font-bold">{selectedAgent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Role:</span>
                  <span className="text-[#F0F4F8]">{selectedAgent.role.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Status:</span>
                  <span className={selectedAgent.status === 'active' ? 'text-[#69E2AD] font-bold' : 'text-[#FF8585] font-bold'}>
                    {selectedAgent.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Trust Rating:</span>
                  <span className="text-[#CBFF70] font-semibold">{getTrustLabel(selectedAgent.trust_level)} ({selectedAgent.trust_level}/5)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6978]">Registration:</span>
                  <span className="text-[#9DAAB8]">{new Date(selectedAgent.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <span className="text-[#F0F4F8] font-semibold block mb-1.5 font-sans">Authorized Tools</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.allowed_tools.map(tool => (
                    <span key={tool} className="px-2 py-0.5 bg-[#101419] border border-[#2A343E] rounded text-[#AB98FF] text-[11px]">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#69E2AD] font-semibold block mb-1.5 flex items-center gap-1.5 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Allowed Actions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.allowed_actions.map(act => (
                    <span key={act} className="px-2 py-0.5 bg-[#69E2AD]/15 border border-[#69E2AD]/30 text-[#69E2AD] rounded text-[11px]">
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#FFD080] font-semibold block mb-1.5 flex items-center gap-1.5 font-sans">
                  <Clock className="w-3.5 h-3.5" /> Escrow Required Actions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.approval_actions.map(act => (
                    <span key={act} className="px-2 py-0.5 bg-[#FFD080]/15 border border-[#FFD080]/30 text-[#FFD080] rounded text-[11px]">
                      {act}
                    </span>
                  ))}
                  {selectedAgent.approval_actions.length === 0 && (
                    <span className="text-[#5C6978] text-xs">None configured</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[#FF8585] font-semibold block mb-1.5 flex items-center gap-1.5 font-sans">
                  <XCircle className="w-3.5 h-3.5" /> Denied Actions (Hard Block)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.denied_actions.map(act => (
                    <span key={act} className="px-2 py-0.5 bg-[#FF8585]/15 border border-[#FF8585]/30 text-[#FF8585] rounded text-[11px]">
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#F0F4F8] font-semibold block mb-1 font-sans">Operational Scope</span>
                <p className="text-[#9DAAB8] text-xs leading-relaxed p-3 bg-[#0E1318] rounded-lg border border-[#2A343E] font-sans">
                  {selectedAgent.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A343E]">
              <button
                onClick={() => setSelectedAgent(null)}
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
