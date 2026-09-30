import {
  ProposedActionRequest,
  SecurityInspectionReport,
  DashboardMetrics,
  RegisteredAgent,
  SecurityPolicy,
  PendingApprovalItem,
  AuditLogEntry
} from '../server/types.js';

export async function fetchHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function analyzeAction(request: ProposedActionRequest): Promise<SecurityInspectionReport> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Inspection failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchAgents(): Promise<RegisteredAgent[]> {
  const res = await fetch('/api/agents');
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
}

export async function fetchPolicies(): Promise<SecurityPolicy[]> {
  const res = await fetch('/api/policies');
  if (!res.ok) throw new Error('Failed to fetch policies');
  return res.json();
}

export async function fetchApprovals(all = false): Promise<PendingApprovalItem[]> {
  const res = await fetch(`/api/approvals?all=${all}`);
  if (!res.ok) throw new Error('Failed to fetch approvals');
  return res.json();
}

export async function approveRequest(requestId: string, supervisor?: string) {
  const res = await fetch(`/api/approvals/${requestId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supervisor })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to approve request`);
  }
  return res.json();
}

export async function rejectRequest(requestId: string, supervisor?: string) {
  const res = await fetch(`/api/approvals/${requestId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supervisor })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to reject request`);
  }
  return res.json();
}

export async function fetchAuditLogs(params?: {
  search?: string;
  decision?: string;
  risk?: string;
  agent?: string;
  limit?: number;
}): Promise<AuditLogEntry[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.decision) query.set('decision', params.decision);
  if (params?.risk) query.set('risk', params.risk);
  if (params?.agent) query.set('agent', params.agent);
  if (params?.limit) query.set('limit', params.limit.toString());

  const res = await fetch(`/api/audit?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchN8nIntegration(): Promise<{
  config: import('../server/types.js').N8nWebhookConfig;
  deliveries: import('../server/types.js').N8nWebhookDelivery[];
}> {
  const res = await fetch('/api/integrations/n8n');
  if (!res.ok) throw new Error('Failed to fetch n8n webhook status');
  return res.json();
}

export async function updateN8nConfig(
  patch: Partial<import('../server/types.js').N8nWebhookConfig>
): Promise<{ config: import('../server/types.js').N8nWebhookConfig }> {
  const res = await fetch('/api/integrations/n8n/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error('Failed to update n8n webhook configuration');
  return res.json();
}

export async function testN8nWebhook(payload?: any): Promise<{
  success: boolean;
  delivery: import('../server/types.js').N8nWebhookDelivery;
  config: import('../server/types.js').N8nWebhookConfig;
}> {
  const res = await fetch('/api/integrations/n8n/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload })
  });
  if (!res.ok) throw new Error('Failed to execute n8n webhook test');
  return res.json();
}

export async function dispatchToN8n(event: string, payload: any): Promise<{
  success: boolean;
  delivery: import('../server/types.js').N8nWebhookDelivery;
  config: import('../server/types.js').N8nWebhookConfig;
}> {
  const res = await fetch('/api/integrations/n8n/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, payload })
  });
  if (!res.ok) throw new Error('Failed to dispatch to n8n webhook');
  return res.json();
}

export async function clearN8nDeliveries(): Promise<{ success: boolean }> {
  const res = await fetch('/api/integrations/n8n/clear', {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to clear n8n delivery history');
  return res.json();
}
