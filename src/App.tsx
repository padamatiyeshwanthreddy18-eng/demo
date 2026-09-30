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
import { fetchDashboardMetrics } from './services/api.js';
import { DashboardMetrics, SecurityInspectionReport } from './server/types.js';
import { ToastContainer, ToastItem } from './components/Toast.js';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [latestReport, setLatestReport] = useState<SecurityInspectionReport | null>(null);
  const [presetScenario, setPresetScenario] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#F6F7F9] text-[#18212F] flex font-sans selection:bg-[#168C82]/20 selection:text-[#10776F]">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Desktop Persistent Left Sidebar (240px) */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={tab => {
            setActiveTab(tab);
          }}
          pendingApprovalsCount={metrics?.pending_approvals_count ?? 0}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex">
          <div className="w-60 h-full bg-white border-r border-[#E2E6EB] shadow-xl">
            <div className="p-4 flex justify-between items-center border-b border-[#E2E6EB]">
              <span className="font-semibold text-sm text-[#18212F]">AEGIS AI</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#596579] p-1 hover:text-[#18212F] rounded hover:bg-[#F1F3F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={tab => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              pendingApprovalsCount={metrics?.pending_approvals_count ?? 0}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="md:hidden h-14 bg-white border-b border-[#E2E6EB] px-4 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-[#18212F] rounded hover:bg-[#F1F3F5] cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm tracking-tight text-[#18212F]">AEGIS AI</span>
          <span className="w-2 h-2 rounded-full bg-[#21A67A] animate-pulse" />
        </div>

        {/* Compact Top Bar */}
        <div className="hidden md:block">
          <TopBar activeTab={activeTab} />
        </div>

        {/* Workspace Canvas */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto enterprise-grid">
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
        </main>
      </div>
    </div>
  );
}
