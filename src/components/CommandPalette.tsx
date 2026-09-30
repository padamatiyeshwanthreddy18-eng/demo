import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Cpu,
  Activity,
  Radio,
  CheckCircle2,
  ShieldAlert,
  Users,
  FileCode,
  FileText,
  GitFork,
  Zap,
  Play,
  X,
  CornerDownLeft,
  ArrowRight,
  Webhook
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onRunScenario?: (scenarioIndex: number) => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Scenarios';
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRunScenario
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    {
      id: 'nav-overview',
      category: 'Navigation',
      title: 'Go to Overview Dashboard',
      subtitle: 'Real-time telemetry and vital governor metrics',
      icon: Activity,
      action: () => {
        onNavigate('overview');
        onClose();
      }
    },
    {
      id: 'nav-analyzer',
      category: 'Navigation',
      title: 'Open Agent Playground & Analyzer',
      subtitle: 'Simulate tool requests, prompt injections & policy checks',
      icon: Cpu,
      action: () => {
        onNavigate('analyzer');
        onClose();
      }
    },
    {
      id: 'nav-monitor',
      category: 'Navigation',
      title: 'Go to Live Monitor',
      subtitle: 'Continuous event stream of intercepted agent operations',
      icon: Radio,
      action: () => {
        onNavigate('monitor');
        onClose();
      }
    },
    {
      id: 'nav-approvals',
      category: 'Navigation',
      title: 'Review Human Approvals',
      subtitle: 'Inspect escalated actions waiting for dual-key authorization',
      icon: CheckCircle2,
      action: () => {
        onNavigate('approvals');
        onClose();
      }
    },
    {
      id: 'nav-alerts',
      category: 'Navigation',
      title: 'Security Alerts Center',
      subtitle: 'Adversarial jailbreaks and high-risk threshold breaches',
      icon: ShieldAlert,
      action: () => {
        onNavigate('alerts');
        onClose();
      }
    },
    {
      id: 'nav-agents',
      category: 'Navigation',
      title: 'View Autonomous Agents Directory',
      subtitle: 'Cryptographic identities, trust levels and assigned tools',
      icon: Users,
      action: () => {
        onNavigate('agents');
        onClose();
      }
    },
    {
      id: 'nav-policies',
      category: 'Navigation',
      title: 'Policy Configuration Matrix',
      subtitle: 'Deterministic invariant rules and permission trees',
      icon: FileCode,
      action: () => {
        onNavigate('policies');
        onClose();
      }
    },
    {
      id: 'nav-audit',
      category: 'Navigation',
      title: 'Audit Trail Logs',
      subtitle: 'Cryptographically signed audit records',
      icon: FileText,
      action: () => {
        onNavigate('audit');
        onClose();
      }
    },
    {
      id: 'nav-architecture',
      category: 'Navigation',
      title: 'System Architecture',
      subtitle: 'Inspect the 8-stage governor pipeline blueprint',
      icon: GitFork,
      action: () => {
        onNavigate('architecture');
        onClose();
      }
    },
    {
      id: 'nav-n8n',
      category: 'Navigation',
      title: 'n8n Webhook Integration',
      subtitle: 'Connect & test agent-permission-check workflow',
      icon: Webhook,
      action: () => {
        onNavigate('n8n');
        onClose();
      }
    },
    {
      id: 'action-evaluate',
      category: 'Actions',
      title: 'Evaluate New Action',
      subtitle: 'Launch live inspector on an agent tool dispatch',
      icon: Zap,
      action: () => {
        onNavigate('analyzer');
        onClose();
      }
    },
    {
      id: 'scenario-safe-read',
      category: 'Scenarios',
      title: 'Run Safe Read Scenario',
      subtitle: 'Research agent reading public report (Policy Allow)',
      icon: Play,
      action: () => {
        if (onRunScenario) onRunScenario(1);
        else onNavigate('analyzer');
        onClose();
      }
    },
    {
      id: 'scenario-email-approval',
      category: 'Scenarios',
      title: 'Run Sensitive Email Escrow Scenario',
      subtitle: 'Disseminating financial digest requires human review',
      icon: Play,
      action: () => {
        if (onRunScenario) onRunScenario(2);
        else onNavigate('analyzer');
        onClose();
      }
    },
    {
      id: 'scenario-injection',
      category: 'Scenarios',
      title: 'Run Prompt Injection Attack Scenario',
      subtitle: 'Jailbreak payload attempting unauthorized shell execution',
      icon: Play,
      action: () => {
        if (onRunScenario) onRunScenario(4);
        else onNavigate('analyzer');
        onClose();
      }
    }
  ];

  const filteredItems = items.filter(item => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-xl bg-[#151B21] border border-[#2A343E] rounded-xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150"
      >
        {/* Permission boundary accent line */}
        <div className="h-0.5 bg-gradient-to-r from-[#CBFF70] via-[#AB98FF] to-transparent w-full" />

        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#2A343E] gap-3">
          <Search className="w-4 h-4 text-[#9DAAB8]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search pages, or run scenarios..."
            className="flex-1 bg-transparent text-sm text-[#F0F4F8] placeholder-[#5C6978] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-[#9DAAB8] hover:text-[#F0F4F8] p-1 rounded hover:bg-[#1B232B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9DAAB8]">
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#1B232B] text-[#F0F4F8]' : 'text-[#9DAAB8] hover:text-[#F0F4F8]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#CBFF70]/15 border-[#CBFF70]/30 text-[#CBFF70]'
                          : 'bg-[#101419] border-[#2A343E] text-[#9DAAB8]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-mono text-[#5C6978] px-1.5 py-0.2 rounded bg-[#0E1318]">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-[#5C6978] truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <CornerDownLeft className="w-3.5 h-3.5 text-[#CBFF70] shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2 border-t border-[#2A343E] bg-[#101419] flex items-center justify-between text-[11px] text-[#5C6978] font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>·</span>
            <span>↵ Select</span>
            <span>·</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[#CBFF70]">AEGIS Core</span>
        </div>
      </div>
    </div>
  );
};
