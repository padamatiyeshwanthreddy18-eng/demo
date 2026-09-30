import React from 'react';
import { ChevronRight } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
}

export const TopBar: React.FC<TopBarProps> = ({ activeTab }) => {
  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Overview';
      case 'analyzer':
        return 'Security / Analyze Action';
      case 'monitor':
        return 'Security / Live Monitor';
      case 'approvals':
        return 'Security / Approvals';
      case 'alerts':
        return 'Security / Security Alerts';
      case 'agents':
        return 'Management / Agents';
      case 'policies':
        return 'Management / Policies';
      case 'audit':
        return 'Observability / Audit Logs';
      case 'architecture':
        return 'Observability / Architecture';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#E2E6EB] px-6 flex items-center justify-between sticky top-0 z-20 select-none shadow-xs">
      {/* Breadcrumb Left */}
      <div className="flex items-center gap-2 text-xs text-[#596579]">
        <span className="font-semibold text-[#18212F]">AEGIS</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#8A94A3]" />
        <span className="text-[#168C82] font-medium">{getBreadcrumbTitle(activeTab)}</span>
      </div>

      {/* Engine Status & System Online Right */}
      <div className="flex items-center gap-6 text-xs text-[#596579]">
        <div className="hidden lg:flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-xs text-[#596579]">
            <span>Policy Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#596579]">
            <span>Risk Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#596579]">
            <span>Audit Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A]" />
          </div>
        </div>

        <div className="h-3.5 w-px bg-[#E2E6EB] hidden lg:block" />

        {/* SYSTEM ONLINE: Soft green pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-[#E7F7F1] border border-[#21A67A]/30 text-[#21A67A] text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A] animate-pulse" />
          <span className="tracking-wide text-[11px] font-semibold">SYSTEM ONLINE</span>
        </div>
      </div>
    </header>
  );
};
