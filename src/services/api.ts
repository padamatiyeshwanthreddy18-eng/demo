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
