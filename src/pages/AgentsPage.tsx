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
  X
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
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#18212F] tracking-tight">
            Agent Directory
          </h1>
          <p className="text-xs text-[#596579] mt-0.5">
            Registered autonomous agents and their deterministic least-privilege capability boundaries.
          </p>
        </div>

        <button
          onClick={loadAgents}
          className="p-1.5 rounded-[7px] bg-white border border-[#CDD3DB] text-[#596579] hover:text-[#18212F] hover:bg-[#F1F3F5] transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          title="Refresh directory"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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
              className={`aegis-panel p-4 flex flex-col justify-between transition-all cursor-pointer hover:border-[#168C82]/50 hover:bg-[#F6F7F9] ${
                !isActive ? 'opacity-65' : ''
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[7px] bg-[#E7F5F3] border border-[#168C82]/25 flex items-center justify-center text-[#168C82] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#18212F]">
                        {agent.name}
                      </h3>
                      <span className="text-xs font-mono font-medium text-[#168C82]">
                        {agent.id}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[4px] ${
                      isActive ? 'bg-[#E7F7F1] text-[#21A67A] border border-[#21A67A]/30' : 'bg-[#FDECEC] text-[#E65353] border border-[#E65353]/30'
                    }`}
                  >
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                {/* Role & Trust */}
                <div className="space-y-1.5 text-xs bg-[#F6F7F9] p-3 rounded-[7px] border border-[#E2E6EB] mb-3">
                  <div className="flex justify-between">
                    <span className="text-[#8A94A3]">Role:</span>
                    <span className="text-[#18212F] font-medium">{agent.role.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A3]">Trust Level:</span>
                    <span className="text-[#168C82] font-semibold">{getTrustLabel(agent.trust_level)} ({agent.trust_level}/5)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#E2E6EB]">
                    <span className="text-[#8A94A3]">Permissions:</span>
                    <span className="text-[#21A67A] font-semibold">{agent.allowed_actions.length} allowed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A3]">Escrow Required:</span>
                    <span className="text-[#D99018] font-semibold">{agent.approval_actions.length} approval</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A94A3]">Denied:</span>
                    <span className="text-[#E65353] font-semibold">{agent.denied_actions.length} blocked</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E6EB] text-xs text-[#168C82] flex items-center justify-between font-semibold">
                <span>View Identity Policy</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white border-l border-[#CDD3DB] p-6 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E6EB] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#168C82]" />
                <h3 className="font-semibold text-sm text-[#18212F]">{selectedAgent.name}</h3>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-[#8A94A3] hover:text-[#18212F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#F6F7F9] rounded-[8px] border border-[#E2E6EB] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Agent ID:</span>
                  <span className="text-[#18212F] font-mono font-semibold">{selectedAgent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Role:</span>
                  <span className="text-[#18212F] font-medium">{selectedAgent.role.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Status:</span>
                  <span className={selectedAgent.status === 'active' ? 'text-[#21A67A] font-bold' : 'text-[#E65353] font-bold'}>
                    {selectedAgent.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Trust Rating:</span>
                  <span className="text-[#168C82] font-semibold">{getTrustLabel(selectedAgent.trust_level)} ({selectedAgent.trust_level}/5)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A3]">Registration Date:</span>
                  <span className="text-[#596579] font-mono">{new Date(selectedAgent.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <span className="text-[#18212F] font-semibold block mb-1.5">Authorized Tools</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.allowed_tools.map(tool => (
                    <span key={tool} className="px-2 py-0.5 bg-[#F1F3F5] border border-[#E2E6EB] rounded-[5px] text-[#18212F] font-mono text-[11px]">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#21A67A] font-semibold block mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Allowed Actions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.allowed_actions.map(act => (
                    <span key={act} className="px-2 py-0.5 bg-[#E7F7F1] border border-[#21A67A]/25 text-[#21A67A] rounded-[5px] font-mono text-[11px] font-medium">
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#D99018] font-semibold block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Escrow Required Actions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.approval_actions.map(act => (
                    <span key={act} className="px-2 py-0.5 bg-[#FFF4DE] border border-[#D99018]/25 text-[#D99018] rounded-[5px] font-mono text-[11px] font-medium">
                      {act}
                    </span>
                  ))}
                  {selectedAgent.approval_actions.length === 0 && (
                    <span className="text-[#8A94A3] text-xs">None configured</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[#E65353] font-semibold block mb-1.5 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Denied Actions (Hard Enforcement)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.denied_actions.map(act => (
                    <span key={act} className="px-2 py-0.5 bg-[#FDECEC] border border-[#E65353]/25 text-[#E65353] rounded-[5px] font-mono text-[11px] font-medium">
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#18212F] font-semibold block mb-1">Operational Scope</span>
                <p className="text-[#596579] text-xs leading-relaxed p-3 bg-[#F6F7F9] rounded-[8px] border border-[#E2E6EB]">
                  {selectedAgent.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E6EB]">
              <button
                onClick={() => setSelectedAgent(null)}
                className="w-full py-2 rounded-[7px] bg-[#F1F3F5] hover:bg-[#E2E6EB] text-xs font-semibold text-[#18212F] cursor-pointer"
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
