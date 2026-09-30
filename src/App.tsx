import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { TopBar } from './components/TopBar.js';
import { OverviewPage } from './pages/OverviewPage.js';
import { AnalyzerPage } from './pages/AnalyzerPage.js';
import { MonitorPage } from './pages/MonitorPage.js';
import { AgentsPage } from './pages/AgentsPage.js';
import { PoliciesPage } from './pages/PoliciesPage.js';
import { ApprovalsPage } from './pages/ApprovalsPage.js';
import { AlertsPage } from './pages/AlertsPage.js';
import { AuditPage } from './pages/AuditPage.js';
import { ArchitecturePage } from './pages/ArchitecturePage.js';
import { ThreatVeilPage } from './pages/ThreatVeilPage.js';
import { N8nIntegrationPage } from './pages/N8nIntegrationPage.js';
import { CommandPalette } from './components/CommandPalette.js';
import { fetchDashboardMetrics } from './services/api.js';
import { DashboardMetrics, SecurityInspectionReport } from './server/types.js';
import { ToastContainer, ToastItem } from './components/Toast.js';
import { Menu, X, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [latestReport, setLatestReport] = useState<SecurityInspectionReport | null>(null);
  const [presetScenario, setPresetScenario] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Poll metrics periodically
  const loadMetrics = async () => {
    try {
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 6000);
    return () => clearInterval(interval);
  }, []);

  // Global Command+K Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (toast: { type: 'success' | 'warning' | 'error' | 'injection'; title: string; message?: string }) => {
    const id = Date.now().toString();
    const newToast: ToastItem = { id, ...toast };
    setToasts(prev => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleRunScenario = (scenarioIndex: number) => {
    setPresetScenario(scenarioIndex);
    setActiveTab('analyzer');
  };

  const handleInspectionComplete = (report: SecurityInspectionReport) => {
    setLatestReport(report);
    loadMetrics();
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#F0F4F8] flex font-sans selection:bg-[#CBFF70]/20 selection:text-[#CBFF70]">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={tab => {
          setActiveTab(tab);
          setCommandPaletteOpen(false);
        }}
        onRunScenario={handleRunScenario}
      />

      {/* Desktop Persistent Left Sidebar (256px) */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={tab => {
            setActiveTab(tab);
          }}
          pendingApprovalsCount={metrics?.pending_approvals_count ?? 0}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/70 backdrop-blur-xs flex">
          <div className="w-64 h-full bg-[#101419] border-r border-[#2A343E] shadow-2xl flex flex-col">
            <div className="p-4 flex justify-between items-center border-b border-[#2A343E]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#CBFF70]" />
                <span className="font-display font-bold text-sm text-[#F0F4F8]">AEGIS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#CBFF70]/10 text-[#CBFF70] border border-[#CBFF70]/20 font-medium">
                  v2.4
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#9DAAB8] p-1 hover:text-[#F0F4F8] rounded hover:bg-[#151B21]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={tab => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                pendingApprovalsCount={metrics?.pending_approvals_count ?? 0}
                onOpenCommandPalette={() => {
                  setMobileMenuOpen(false);
                  setCommandPaletteOpen(true);
                }}
              />
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="md:hidden h-14 bg-[#101419] border-b border-[#2A343E] px-4 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-[#9DAAB8] hover:text-[#F0F4F8] rounded hover:bg-[#151B21] cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#CBFF70]" />
            <span className="font-display font-bold text-sm tracking-tight text-[#F0F4F8]">AEGIS</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#69E2AD] animate-pulse" />
        </div>

        {/* Compact Top Bar */}
        <div className="hidden md:block">
          <TopBar
            activeTab={activeTab}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onQuickEvaluate={() => setActiveTab('analyzer')}
            onNavigate={setActiveTab}
          />
        </div>

        {/* Workspace Canvas */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewPage
              metrics={metrics}
              onNavigate={setActiveTab}
              onRunScenario={handleRunScenario}
              latestReport={latestReport}
            />
          )}

          {activeTab === 'analyzer' && (
            <AnalyzerPage
              onInspectionComplete={handleInspectionComplete}
              presetScenario={presetScenario}
              onClearPreset={() => setPresetScenario(null)}
              onTriggerToast={addToast}
            />
          )}

          {activeTab === 'monitor' && <MonitorPage />}

          {activeTab === 'agents' && <AgentsPage />}

          {activeTab === 'policies' && <PoliciesPage />}

          {activeTab === 'approvals' && (
            <ApprovalsPage
              onRefreshMetrics={loadMetrics}
              onTriggerToast={addToast}
            />
          )}

          {activeTab === 'alerts' && <AlertsPage />}

          {activeTab === 'audit' && (
            <AuditPage onTriggerToast={addToast} />
          )}

          {activeTab === 'architecture' && <ArchitecturePage />}

          {activeTab === 'threat_veil' && <ThreatVeilPage />}

          {activeTab === 'n8n' && <N8nIntegrationPage onShowToast={addToast} />}
        </main>
      </div>
    </div>
  );
}
