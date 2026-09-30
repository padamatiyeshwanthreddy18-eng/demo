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
  GitFork
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount
}) => {
  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'overview', label: 'Overview', icon: Activity }
      ]
    },
    {
      title: 'Security',
      items: [
        { id: 'analyzer', label: 'Analyze Action', icon: Cpu },
        { id: 'monitor', label: 'Live Monitor', icon: Radio },
        { id: 'approvals', label: 'Approvals', icon: CheckCircle2, badge: pendingApprovalsCount },
        { id: 'alerts', label: 'Security Alerts', icon: ShieldAlert }
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'agents', label: 'Agents', icon: Users },
        { id: 'policies', label: 'Policies', icon: FileCode }
      ]
    },
    {
      title: 'Observability',
      items: [
        { id: 'audit', label: 'Audit Logs', icon: FileText },
        { id: 'architecture', label: 'Architecture', icon: GitFork }
      ]
    }
  ];

  return (
    <aside className="w-60 bg-white border-r border-[#E2E6EB] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Top Header */}
        <div
          onClick={() => setActiveTab('overview')}
          className="p-4 border-b border-[#E2E6EB] flex items-center gap-3 cursor-pointer group transition-colors hover:bg-[#F6F7F9]"
        >
          <div className="w-8 h-8 rounded-[7px] bg-[#E7F5F3] border border-[#168C82]/30 flex items-center justify-center text-[#168C82] group-hover:border-[#168C82] transition-colors shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#18212F] tracking-tight leading-none">
              AEGIS AI
            </div>
            <div className="text-xs text-[#596579] font-normal tracking-normal mt-1 leading-none">
              Agent Permission Governor
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map(section => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-medium tracking-wide text-[#8A94A3]">
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-[7px] text-xs font-medium transition-all text-left cursor-pointer relative ${
                        isActive
                          ? 'bg-[#EAF6F4] text-[#116F68] font-semibold'
                          : 'text-[#596579] hover:text-[#18212F] hover:bg-[#F1F3F5]'
                      }`}
                    >
                      {/* Thin teal indicator on left */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#168C82] rounded-r" />
                      )}

                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#168C82]' : 'text-[#8A94A3]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-[5px] bg-[#FFF4DE] text-[#D99018] border border-[#D99018]/30">
                          {item.badge}
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
      <div className="p-4 border-t border-[#E2E6EB] bg-[#F6F7F9]/80 text-xs text-[#596579]">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A] animate-pulse shrink-0" />
          <span className="text-xs font-normal text-[#596579]">All systems operational</span>
        </div>
        <div className="text-[11px] text-[#8A94A3] pl-3.5 font-mono">
          AEGIS v1.0
        </div>
      </div>
    </aside>
  );
};
