import React from 'react';
import {
  Shield,
  Activity,
  Cpu,
  Radio,
  CheckCircle2,
  ShieldAlert,
  Users,
  FileCode,
  FileText,
  GitFork,
  Eye,
  Command,
  ChevronRight,
  Webhook
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
  onOpenCommandPalette?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  onOpenCommandPalette
}) => {
  const navSections = [
    {
      title: 'Control Center',
      items: [
        { id: 'overview', label: 'Overview', icon: Activity }
      ]
    },
    {
      title: 'Governance & Security',
      items: [
        { id: 'analyzer', label: 'Playground & Analyzer', icon: Cpu },
        { id: 'monitor', label: 'Live Monitor', icon: Radio },
        { id: 'approvals', label: 'Approvals Escrow', icon: CheckCircle2, badge: pendingApprovalsCount },
        { id: 'alerts', label: 'Security Alerts', icon: ShieldAlert }
      ]
    },
    {
      title: 'Fleet Management',
      items: [
        { id: 'agents', label: 'Agent Directory', icon: Users },
        { id: 'policies', label: 'Policy Matrix', icon: FileCode }
      ]
    },
    {
      title: 'Observability & Audit',
      items: [
        { id: 'audit', label: 'Audit Trail', icon: FileText },
        { id: 'architecture', label: 'System Architecture', icon: GitFork },
        { id: 'threat_veil', label: 'Threat Recon & Veil', icon: Eye }
      ]
    },
    {
      title: 'Integrations & Automations',
      items: [
        { id: 'n8n', label: 'n8n Webhook', icon: Webhook, badgeText: 'SYNC' }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#101419] border-r border-[#2A343E] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30 font-sans">
      <div>
        {/* Brand Header with Permission Boundary Motif */}
        <div
          onClick={() => setActiveTab('overview')}
          className="p-4 border-b border-[#2A343E] flex items-center justify-between cursor-pointer group hover:bg-[#151B21]/60 transition-colors relative"
        >
          {/* Subtle Permission Boundary Hairline Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#CBFF70] via-[#AB98FF] to-transparent" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#151B21] border border-[#2A343E] flex items-center justify-center text-[#CBFF70] group-hover:border-[#CBFF70]/50 transition-colors shrink-0 shadow-inner">
              <Shield className="w-4 h-4 text-[#CBFF70]" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-[#F0F4F8] tracking-tight leading-none flex items-center gap-1.5">
                <span>AEGIS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#CBFF70]/10 text-[#CBFF70] border border-[#CBFF70]/20 font-medium">
                  v2.4
                </span>
              </div>
              <div className="text-[11px] text-[#9DAAB8] mt-1 leading-none font-normal">
                Permission Governor
              </div>
            </div>
          </div>
        </div>

        {/* Command Palette Trigger Strip */}
        <div className="p-3 pb-1">
          <button
            onClick={onOpenCommandPalette}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#151B21] hover:bg-[#1B232B] border border-[#2A343E] hover:border-[#384654] text-[#9DAAB8] hover:text-[#F0F4F8] text-xs flex items-center justify-between transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5 text-[#5C6978] group-hover:text-[#CBFF70] transition-colors" />
              <span className="text-[11px]">Command menu</span>
            </span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#0B0E11] text-[#9DAAB8] border border-[#2A343E]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-175px)]">
          {navSections.map(section => (
            <div key={section.title} className="space-y-1">
              <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#5C6978]">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer relative ${
                        isActive
                          ? 'bg-[#151B21] text-[#F0F4F8] font-semibold border border-[#2A343E] shadow-sm'
                          : 'text-[#9DAAB8] hover:text-[#F0F4F8] hover:bg-[#151B21]/60 border border-transparent'
                      }`}
                    >
                      {/* Permission boundary bar for active state */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#CBFF70] rounded-r" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#CBFF70]' : 'text-[#5C6978]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[#FFD080]/15 text-[#FFD080] border border-[#FFD080]/30 shrink-0">
                          {item.badge}
                        </span>
                      )}

                      {'badgeText' in item && item.badgeText && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold rounded bg-[#CBFF70]/10 text-[#CBFF70] border border-[#CBFF70]/30 shrink-0">
                          {item.badgeText}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3.5 border-t border-[#2A343E] bg-[#0E1318] text-xs text-[#9DAAB8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#69E2AD] animate-pulse" />
            <span className="text-[11px] font-mono text-[#F0F4F8] font-medium">Fail-Closed Mode</span>
          </div>
          <span className="text-[10px] font-mono text-[#5C6978]">Production</span>
        </div>
        <div className="text-[10px] text-[#5C6978] mt-1 font-mono truncate">
          Active Cluster: US-East-Primary
        </div>
      </div>
    </aside>
  );
};
