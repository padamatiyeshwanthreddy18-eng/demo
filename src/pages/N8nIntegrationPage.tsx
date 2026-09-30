import React, { useState, useEffect } from 'react';
import { N8nWebhookConfig, N8nWebhookDelivery } from '../server/types.js';
import {
  fetchN8nIntegration,
  updateN8nConfig,
  testN8nWebhook,
  clearN8nDeliveries
} from '../services/api.js';
import {
  Webhook,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Sliders,
  Send,
  Trash2,
  ShieldCheck,
  Zap,
  Activity,
  Code2,
  Info
} from 'lucide-react';

interface N8nIntegrationPageProps {
  onShowToast?: (toast: {
    type: 'success' | 'warning' | 'error' | 'injection';
    title: string;
    message?: string;
  }) => void;
}

export const N8nIntegrationPage: React.FC<N8nIntegrationPageProps> = ({ onShowToast }) => {
  const [config, setConfig] = useState<N8nWebhookConfig | null>(null);
  const [deliveries, setDeliveries] = useState<N8nWebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<N8nWebhookDelivery | null>(null);

  // Custom Test Payload State
  const [testAgent, setTestAgent] = useState('database-agent-01');
  const [testAction, setTestAction] = useState('select_records');
  const [testResource, setTestResource] = useState('customers_table');
  const [testDecision, setTestDecision] = useState<'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY'>('ALLOW');
  const [testRiskScore, setTestRiskScore] = useState(24);

  const loadData = async () => {
    try {
      const data = await fetchN8nIntegration();
      setConfig(data.config);
      setDeliveries(data.deliveries);
      if (data.deliveries.length > 0 && !selectedDelivery) {
        setSelectedDelivery(data.deliveries[0]);
      }
    } catch (err: any) {
      console.error('Failed to load n8n integration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Webhook URL Copied',
        message: 'Endpoint copied to clipboard'
      });
    }
  };

  const handleToggleMode = async (mode: 'production' | 'test') => {
    if (!config) return;
    try {
      const res = await updateN8nConfig({ active_url_type: mode });
      setConfig(res.config);
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: `Switched to ${mode.toUpperCase()} Mode`,
          message: `Active target: ${mode === 'production' ? config.url : config.test_url}`
        });
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Update Failed',
          message: err.message
        });
      }
    }
  };

  const handleToggleOption = async (key: keyof N8nWebhookConfig, value: boolean) => {
    if (!config) return;
    try {
      const res = await updateN8nConfig({ [key]: value });
      setConfig(res.config);
    } catch (err: any) {
      console.error('Failed to update config:', err);
    }
  };

  const handleRunTest = async () => {
    setTesting(true);
    try {
      const payload = {
        agent_id: testAgent,
        agent_role: testAgent.split('-')[0] + '_agent',
        action: testAction,
        tool: testAgent.includes('database') ? 'database' : testAgent.includes('email') ? 'mailer' : 'filesystem',
        resource: testResource,
        decision: testDecision,
        risk_score: testRiskScore,
        risk_level: testRiskScore >= 70 ? 'CRITICAL' : testRiskScore >= 45 ? 'HIGH' : testRiskScore >= 30 ? 'MEDIUM' : 'LOW',
        parameters: { limit: 20, mode: 'governed' },
        matched_policy: testDecision === 'ALLOW' ? 'POL-DB-SELECT-ALLOW' : testDecision === 'REQUIRE_APPROVAL' ? 'POL-DB-UPDATE-APPROVAL' : 'POL-DB-INJECTION-BLOCK',
        policy_reason: testDecision === 'ALLOW' ? 'Routine verified operation' : 'Elevated risk requiring human escrow sign-off',
        prompt_injection_detected: false,
        timestamp: new Date().toISOString()
      };

      const res = await testN8nWebhook(payload);
      setSelectedDelivery(res.delivery);
      await loadData();

      if (res.success) {
        if (onShowToast) {
          onShowToast({
            type: 'success',
            title: 'Webhook Delivered (HTTP 200)',
            message: `Response received in ${res.delivery.duration_ms}ms`
          });
        }
      } else {
        if (onShowToast) {
          onShowToast({
            type: res.delivery.status_code === 404 ? 'warning' : 'error',
            title: res.delivery.status_code === 404 ? 'n8n Workflow Inactive (404)' : `Dispatch Failed (${res.delivery.status_code})`,
            message: res.delivery.hint || res.delivery.error || 'Check n8n cloud canvas status'
          });
        }
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Dispatch Error',
          message: err.message
        });
      }
    } finally {
      setTesting(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearN8nDeliveries();
      setDeliveries([]);
      setSelectedDelivery(null);
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'History Cleared',
          message: 'Webhook delivery logs reset'
        });
      }
    } catch (err: any) {
      console.error('Failed to clear:', err);
    }
  };

  const effectiveUrl = config
    ? config.active_url_type === 'test'
      ? config.test_url
      : config.url
    : 'https://hindujareddy.app.n8n.cloud/webhook/agent-permission-check';

  return (
    <div className="w-full space-y-6 pb-12 font-sans selection:bg-[#CBFF70]/20 selection:text-[#CBFF70]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#CBFF70] tracking-wider uppercase mb-1">
            <Webhook className="w-3.5 h-3.5" />
            <span>EXTERNAL AUTOMATION INTEGRATION</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F0F4F8] tracking-tight">
            n8n Agent Permission Check Webhook
          </h1>
          <p className="text-xs text-[#9DAAB8] mt-1">
            Seamlessly synchronize AEGIS governor events, permission checks, and human escrow decisions with your n8n workflow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-[#151B21] hover:bg-[#1B232B] border border-[#2A343E] text-xs font-mono text-[#9DAAB8] hover:text-[#F0F4F8] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <a
            href="https://hindujareddy.app.n8n.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#151B21] hover:bg-[#1B232B] border border-[#2A343E] text-xs font-mono text-[#AB98FF] hover:text-[#C5B8FF] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open n8n Canvas</span>
          </a>
        </div>
      </div>

      {/* Main Webhook Endpoint Banner with Permission Boundary Motif */}
      <div className="control-panel p-5 relative overflow-hidden">
        {/* Permission boundary bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#CBFF70] via-[#AB98FF] to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#CBFF70]/10 border border-[#CBFF70]/30 text-[#CBFF70] font-mono text-[11px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CBFF70] animate-pulse" />
                POST ENDPOINT
              </span>

              {config?.last_status === 'SUCCESS' && (
                <span className="px-2 py-0.5 rounded bg-[#69E2AD]/10 border border-[#69E2AD]/30 text-[#69E2AD] font-mono text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  STATUS: 200 OK (CONNECTED)
                </span>
              )}

              {config?.last_status === 'INACTIVE_WORKFLOW' && (
                <span className="px-2 py-0.5 rounded bg-[#FFD080]/10 border border-[#FFD080]/30 text-[#FFD080] font-mono text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  n8n WORKFLOW INACTIVE / STANDBY
                </span>
              )}

              {config?.last_status === 'ERROR' && (
                <span className="px-2 py-0.5 rounded bg-[#FF8585]/10 border border-[#FF8585]/30 text-[#FF8585] font-mono text-[11px] flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  DISPATCH FAULT
                </span>
              )}

              <span className="text-xs font-mono text-[#5C6978]">
                Mode: {config?.active_url_type === 'production' ? 'Production (/webhook/)' : 'Test Canvas (/webhook-test/)'}
              </span>
            </div>

            {/* URL Display Bar */}
            <div className="flex items-center gap-2 bg-[#0E1318] p-2.5 rounded-lg border border-[#2A343E]">
              <span className="font-mono text-xs text-[#CBFF70] font-semibold shrink-0">POST</span>
              <span className="font-mono text-xs text-[#F0F4F8] select-all truncate flex-1">
                {effectiveUrl}
              </span>
              <button
                onClick={() => handleCopyUrl(effectiveUrl)}
                className="px-2.5 py-1 rounded bg-[#1B232B] hover:bg-[#25303B] text-[#9DAAB8] hover:text-[#F0F4F8] text-[11px] font-mono flex items-center gap-1 border border-[#2A343E] transition-colors shrink-0 cursor-pointer"
                title="Copy Webhook URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#69E2AD]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Actions & Mode Switcher */}
          <div className="flex flex-wrap lg:flex-col items-start sm:items-center lg:items-end gap-2.5 shrink-0">
            {/* Mode Selector Tabs */}
            <div className="flex items-center bg-[#0E1318] p-1 rounded-lg border border-[#2A343E] text-xs font-mono">
              <button
                onClick={() => handleToggleMode('production')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  config?.active_url_type === 'production'
                    ? 'bg-[#151B21] text-[#CBFF70] font-semibold shadow-xs'
                    : 'text-[#9DAAB8] hover:text-[#F0F4F8]'
                }`}
              >
                Production
              </button>
              <button
                onClick={() => handleToggleMode('test')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  config?.active_url_type === 'test'
                    ? 'bg-[#151B21] text-[#CBFF70] font-semibold shadow-xs'
                    : 'text-[#9DAAB8] hover:text-[#F0F4F8]'
                }`}
              >
                Test Canvas
              </button>
            </div>

            {/* Test Button */}
            <button
              onClick={handleRunTest}
              disabled={testing}
              className="btn-chartreuse px-4 py-2 text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${testing ? 'animate-pulse' : ''}`} />
              <span>{testing ? 'Testing Dispatch...' : 'Ping & Test Webhook'}</span>
            </button>
          </div>
        </div>

        {/* Helpful notice regarding n8n cloud status */}
        <div className="mt-4 pt-3.5 border-t border-[#2A343E]/70 flex items-start gap-2.5 text-xs text-[#9DAAB8]">
          <Info className="w-4 h-4 text-[#CBFF70] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="text-[#F0F4F8] font-medium">n8n Activation Guide: </span>
            In your n8n cloud canvas (<code className="text-[#AB98FF] font-mono text-[11px]">hindujareddy.app.n8n.cloud</code>), toggle the workflow switch to <strong className="text-[#69E2AD]">Active</strong> in the upper right corner to accept production calls. If you are live-editing and testing the workflow canvas, switch to <strong className="text-[#FFD080]">Test Canvas</strong> mode above and click <code className="text-[#F0F4F8] font-mono">Execute workflow</code> in n8n.
          </div>
        </div>
      </div>

      {/* 2-Column Layout: Left = Configuration & Interactive Test Dispatcher, Right = Deliveries & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Automated Event Subscriptions Card */}
          <div className="control-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A343E]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#CBFF70]" />
                <h2 className="font-display text-sm font-semibold text-[#F0F4F8]">
                  Automated Event Dispatch
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#9DAAB8]">Trigger Rules</span>
            </div>

            <div className="space-y-3">
              {/* Option 1: Master Enable */}
              <label className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#101419] border border-[#2A343E] cursor-pointer hover:border-[#384654] transition-colors">
                <div>
                  <div className="text-xs font-semibold text-[#F0F4F8]">Webhook Forwarding Active</div>
                  <div className="text-[11px] text-[#9DAAB8] mt-0.5">
                    Globally enable or pause dispatching governor events to n8n.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config?.enabled ?? true}
                  onChange={e => handleToggleOption('enabled', e.target.checked)}
                  className="mt-1 accent-[#CBFF70] rounded cursor-pointer w-4 h-4"
                />
              </label>

              {/* Option 2: Forward Evaluations */}
              <label className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#101419] border border-[#2A343E] cursor-pointer hover:border-[#384654] transition-colors">
                <div>
                  <div className="text-xs font-semibold text-[#F0F4F8]">Forward All Agent Invocations</div>
                  <div className="text-[11px] text-[#9DAAB8] mt-0.5">
                    Dispatches each proposed agent tool call, policy verification result, and risk score.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config?.forward_evaluations ?? true}
                  onChange={e => handleToggleOption('forward_evaluations', e.target.checked)}
                  className="mt-1 accent-[#CBFF70] rounded cursor-pointer w-4 h-4"
                />
              </label>

              {/* Option 3: Forward Escrow Approvals */}
              <label className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#101419] border border-[#2A343E] cursor-pointer hover:border-[#384654] transition-colors">
                <div>
                  <div className="text-xs font-semibold text-[#F0F4F8]">Forward Human Escrow Decisions</div>
                  <div className="text-[11px] text-[#9DAAB8] mt-0.5">
                    Notifies your n8n workflow whenever a security supervisor approves or rejects a request.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config?.forward_approvals ?? true}
                  onChange={e => handleToggleOption('forward_approvals', e.target.checked)}
                  className="mt-1 accent-[#CBFF70] rounded cursor-pointer w-4 h-4"
                />
              </label>

              {/* Option 4: Forward Prompt Injection Alerts */}
              <label className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#101419] border border-[#2A343E] cursor-pointer hover:border-[#384654] transition-colors">
                <div>
                  <div className="text-xs font-semibold text-[#F0F4F8]">Forward High-Risk Security Alerts</div>
                  <div className="text-[11px] text-[#9DAAB8] mt-0.5">
                    Triggers external incident response, paging, or Slack alerts for detected adversarial injections.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config?.forward_alerts ?? true}
                  onChange={e => handleToggleOption('forward_alerts', e.target.checked)}
                  className="mt-1 accent-[#CBFF70] rounded cursor-pointer w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Interactive Test Event Dispatcher */}
          <div className="control-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A343E]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#AB98FF]" />
                <h2 className="font-display text-sm font-semibold text-[#F0F4F8]">
                  Interactive Action Dispatcher
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#AB98FF]">Custom Test Event</span>
            </div>

            <p className="text-xs text-[#9DAAB8]">
              Assemble an agent request payload and dispatch it directly to <code className="text-[#CBFF70] font-mono text-[11px]">agent-permission-check</code>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-[#9DAAB8] mb-1">Agent Identity</label>
                <select
                  value={testAgent}
                  onChange={e => setTestAgent(e.target.value)}
                  className="w-full bg-[#101419] border border-[#2A343E] rounded-lg px-3 py-1.5 text-[#F0F4F8] font-mono focus:outline-none focus:border-[#CBFF70]"
                >
                  <option value="database-agent-01">database-agent-01 (Core Data Engine)</option>
                  <option value="email-agent-01">email-agent-01 (Executive Communications)</option>
                  <option value="research-agent-01">research-agent-01 (Research Intelligence)</option>
                  <option value="admin-agent-01">admin-agent-01 (Cluster Administration)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-[#9DAAB8] mb-1">Action Call</label>
                  <input
                    type="text"
                    value={testAction}
                    onChange={e => setTestAction(e.target.value)}
                    className="w-full bg-[#101419] border border-[#2A343E] rounded-lg px-2.5 py-1.5 text-[#F0F4F8] font-mono text-xs focus:outline-none focus:border-[#CBFF70]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#9DAAB8] mb-1">Target Resource</label>
                  <input
                    type="text"
                    value={testResource}
                    onChange={e => setTestResource(e.target.value)}
                    className="w-full bg-[#101419] border border-[#2A343E] rounded-lg px-2.5 py-1.5 text-[#F0F4F8] font-mono text-xs focus:outline-none focus:border-[#CBFF70]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-[#9DAAB8] mb-1">Decision State</label>
                  <select
                    value={testDecision}
                    onChange={e => setTestDecision(e.target.value as any)}
                    className="w-full bg-[#101419] border border-[#2A343E] rounded-lg px-2.5 py-1.5 text-[#F0F4F8] font-mono text-xs focus:outline-none focus:border-[#CBFF70]"
                  >
                    <option value="ALLOW">ALLOW (Authorized)</option>
                    <option value="REQUIRE_APPROVAL">REQUIRE_APPROVAL (Escrow)</option>
                    <option value="DENY">DENY (Blocked)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#9DAAB8] mb-1">
                    Risk Score: <span className="text-[#CBFF70] font-bold">{testRiskScore}/100</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={testRiskScore}
                    onChange={e => setTestRiskScore(parseInt(e.target.value, 10))}
                    className="w-full accent-[#CBFF70] mt-1.5 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={handleRunTest}
                disabled={testing}
                className="w-full mt-2 btn-chartreuse py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 fill-[#0B0E11]" />
                <span>{testing ? 'Dispatching to n8n...' : 'Dispatch Action Event to n8n'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Deliveries Table */}
          <div className="control-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A343E]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#CBFF70]" />
                <h2 className="font-display text-sm font-semibold text-[#F0F4F8]">
                  Recent Webhook Deliveries
                </h2>
                <span className="text-xs font-mono text-[#9DAAB8]">({deliveries.length})</span>
              </div>

              {deliveries.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[11px] font-mono text-[#9DAAB8] hover:text-[#FF8585] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Clear delivery history"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>

            {deliveries.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#5C6978] font-mono">
                No webhook deliveries recorded yet.
                <div className="mt-2 text-[#9DAAB8]">
                  Click <strong>Ping & Test Webhook</strong> above or evaluate actions in the Governor.
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {deliveries.map(del => {
                  const isSelected = selectedDelivery?.id === del.id;
                  const isSuccess = del.success;
                  const isInactive = del.status_code === 404;

                  return (
                    <div
                      key={del.id}
                      onClick={() => setSelectedDelivery(del)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                        isSelected
                          ? 'bg-[#1B232B] border-[#CBFF70] shadow-[0_0_10px_rgba(203,255,112,0.1)]'
                          : 'bg-[#101419] border-[#2A343E] hover:border-[#3B4856]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-[#69E2AD] shrink-0" />
                        ) : isInactive ? (
                          <AlertTriangle className="w-4 h-4 text-[#FFD080] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#FF8585] shrink-0" />
                        )}

                        <div className="min-w-0">
                          <div className="font-mono text-[11px] font-semibold text-[#F0F4F8] truncate flex items-center gap-1.5">
                            <span>{del.event}</span>
                            <span className="text-[10px] text-[#5C6978]">({del.id})</span>
                          </div>
                          <div className="text-[10px] text-[#9DAAB8] truncate mt-0.5">
                            {new Date(del.timestamp).toLocaleTimeString()} • {del.target_url.includes('webhook-test') ? 'Test Canvas' : 'Production'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[10px] text-[#5C6978]">{del.duration_ms}ms</span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                            isSuccess
                              ? 'bg-[#69E2AD]/10 text-[#69E2AD] border-[#69E2AD]/30'
                              : isInactive
                              ? 'bg-[#FFD080]/10 text-[#FFD080] border-[#FFD080]/30'
                              : 'bg-[#FF8585]/10 text-[#FF8585] border-[#FF8585]/30'
                          }`}
                        >
                          {del.status_code || 'ERR'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Delivery Inspector */}
          {selectedDelivery && (
            <div className="control-panel p-5 space-y-3 relative overflow-hidden">
              {/* Permission boundary bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#CBFF70] via-[#AB98FF] to-transparent" />

              <div className="flex items-center justify-between pb-2 border-b border-[#2A343E]">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#CBFF70]" />
                  <h3 className="font-display text-sm font-semibold text-[#F0F4F8]">
                    Delivery Inspector: {selectedDelivery.id}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#5C6978]">
                  {selectedDelivery.duration_ms}ms latency
                </span>
              </div>

              {selectedDelivery.hint && (
                <div className="p-2.5 rounded bg-[#FFD080]/10 border border-[#FFD080]/30 text-xs text-[#FFD080] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{selectedDelivery.hint}</span>
                </div>
              )}

              {/* JSON tabs/payload viewer */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-[#9DAAB8] flex items-center justify-between">
                  <span>Outgoing Dispatched Payload (JSON)</span>
                  <span className="text-[10px] text-[#5C6978]">POST application/json</span>
                </div>
                <pre className="p-3 rounded-lg bg-[#0E1318] border border-[#2A343E] text-[11px] font-mono text-[#CBFF70] max-h-48 overflow-y-auto leading-relaxed">
                  {JSON.stringify(selectedDelivery.request_payload, null, 2)}
                </pre>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-mono text-[#9DAAB8] flex items-center justify-between">
                  <span>n8n Webhook Response</span>
                  <span className="text-[10px] text-[#5C6978]">HTTP {selectedDelivery.status_code}</span>
                </div>
                <pre className="p-3 rounded-lg bg-[#0E1318] border border-[#2A343E] text-[11px] font-mono text-[#F0F4F8] max-h-40 overflow-y-auto leading-relaxed">
                  {typeof selectedDelivery.response_body === 'string'
                    ? selectedDelivery.response_body
                    : JSON.stringify(selectedDelivery.response_body, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
