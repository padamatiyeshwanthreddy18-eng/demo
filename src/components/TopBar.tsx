import React from 'react';
import {
  ChevronRight,
  Shield,
  Zap,
  Command,
  Radio,
  Sparkles,
  Server
} from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  onOpenCommandPalette?: () => void;
  onQuickEvaluate?: () => void;
  onNavigate?: (tab: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenCommandPalette,
  onQuickEvaluate,
  onNavigate
}) => {
  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Overview';
      case 'analyzer':
        return 'Governance / Playground & Analyzer';
      case 'monitor':
        return 'Governance / Live Monitor';
      case 'approvals':
        return 'Governance / Approvals Escrow';
      case 'alerts':
        return 'Governance / Security Alerts';
      case 'agents':
        return 'Fleet / Agent Directory';
      case 'policies':
        return 'Fleet / Policy Configuration';
      case 'audit':
        return 'Observability / Audit Trail';
      case 'architecture':
        return 'Observability / System Architecture';
      case 'threat_veil':
        return 'Observability / Threat Recon & Veil';
      case 'n8n':
        return 'Integrations / n8n Webhook Workflow';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="h-13 bg-[#101419] border-b border-[#2A343E] px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Breadcrumb Left */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-mono text-[#5C6978]">Production-US-East</span>
        <span className="text-[#3B4856]">/</span>
        <span className="font-semibold text-[#F0F4F8]">{getBreadcrumbTitle(activeTab)}</span>
      </div>

      {/* Center/Right Status & Action */}
      <div className="flex items-center gap-4 text-xs">
        {/* Engine Status Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-[#9DAAB8] font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#69E2AD]" />
            <span>Policy Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#69E2AD]" />
            <span>Risk AST</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('n8n')}
            title="https://hindujareddy.app.n8n.cloud/webhook/agent-permission-check"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#151B21] hover:bg-[#1B232B] border border-[#CBFF70]/30 text-[#CBFF70] transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#CBFF70] animate-pulse" />
            <span>n8n: agent-permission-check</span>
          </button>
        </div>

        <div className="h-3.5 w-px bg-[#2A343E] hidden lg:block" />

        {/* Live Enforcement Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#151B21] border border-[#2A343E] text-[#69E2AD] text-[11px] font-mono font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#69E2AD] animate-pulse" />
          <span>LIVE ENFORCEMENT</span>
        </div>

        {/* Command Menu Button */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#151B21] hover:bg-[#1B232B] border border-[#2A343E] text-[#9DAAB8] hover:text-[#F0F4F8] text-[11px] font-mono transition-colors cursor-pointer"
            title="Open command palette (⌘K)"
          >
            <Command className="w-3 h-3 text-[#CBFF70]" />
            <span>⌘K</span>
          </button>
        )}

        {/* Quick Evaluate CTA */}
        {onQuickEvaluate && (
          <button
            onClick={onQuickEvaluate}
            className="btn-chartreuse px-3 py-1 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-[#0B0E11]" />
            <span>Evaluate action</span>
          </button>
        )}
      </div>
    </header>
  );
};
