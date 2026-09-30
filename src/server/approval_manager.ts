import { store } from './data_store.js';
import { executeSafely } from './secure_executor.js';
import { PendingApprovalItem, SecurityInspectionReport } from './types.js';

export function createPendingApproval(inspection: SecurityInspectionReport): PendingApprovalItem {
  const item: PendingApprovalItem = {
    id: `APP-${Date.now().toString(36).toUpperCase()}`,
    request_id: inspection.request_id,
    timestamp: inspection.timestamp,
    agent_id: inspection.request.agent_id,
    agent_name: store.getAgent(inspection.request.agent_id)?.name || inspection.request.agent_id,
    agent_role: inspection.request.agent_role,
    action: inspection.request.action,
    tool: inspection.request.tool,
    resource: inspection.request.resource,
    risk_score: inspection.risk.risk_score,
    risk_level: inspection.risk.risk_level,
    reason: inspection.policy.reason || inspection.risk.dominant_factor,
    matched_policy: inspection.policy.matched_policy,
    status: 'PENDING',
    request: inspection.request,
    inspection
  };

  store.saveApproval(item);
  return item;
}

export function approveRequest(requestId: string, supervisorName = 'Security Operator (SOC-L2)') {
  const item = store.getApprovalByRequestId(requestId);
  if (!item) {
    throw new Error(`Pending approval request "${requestId}" not found.`);
  }

  if (item.status !== 'PENDING') {
    throw new Error(`Request "${requestId}" is already ${item.status} and cannot be modified.`);
  }

  // Mark approved
  item.status = 'APPROVED';
  item.decided_at = new Date().toISOString();
  item.decided_by = supervisorName;
  store.saveApproval(item);

  // Trigger secure execution
  const execution = executeSafely(item.request, 'REQUIRE_APPROVAL', 'APPROVED');

  // Update audit log
  store.addAuditLog({
    id: `AUD-${Date.now().toString(36).toUpperCase()}`,
    request_id: item.request_id,
    timestamp: new Date().toISOString(),
    agent_id: item.agent_id,
    agent_role: item.agent_role,
    task: item.request.task,
    action: item.action,
    tool: item.tool,
    resource: item.resource,
    risk_score: item.risk_score,
    risk_level: item.risk_level,
    prompt_injection_detected: false,
    matched_policy: item.matched_policy,
    decision: 'ALLOW',
    approval_status: 'APPROVED',
    execution_status: execution.execution_status,
    latency_ms: 35,
    reason: `Manual human authorization granted by ${supervisorName}. Tool execution completed.`
  });

  return {
    approval: item,
    execution
  };
}

export function rejectRequest(requestId: string, supervisorName = 'Security Operator (SOC-L2)') {
  const item = store.getApprovalByRequestId(requestId);
  if (!item) {
    throw new Error(`Pending approval request "${requestId}" not found.`);
  }

  if (item.status !== 'PENDING') {
    throw new Error(`Request "${requestId}" is already ${item.status} and cannot be modified.`);
  }

  // Mark rejected
  item.status = 'REJECTED';
  item.decided_at = new Date().toISOString();
  item.decided_by = supervisorName;
  store.saveApproval(item);

  // Update audit log
  store.addAuditLog({
    id: `AUD-${Date.now().toString(36).toUpperCase()}`,
    request_id: item.request_id,
    timestamp: new Date().toISOString(),
    agent_id: item.agent_id,
    agent_role: item.agent_role,
    task: item.request.task,
    action: item.action,
    tool: item.tool,
    resource: item.resource,
    risk_score: item.risk_score,
    risk_level: item.risk_level,
    prompt_injection_detected: false,
    matched_policy: item.matched_policy,
    decision: 'DENY',
    approval_status: 'REJECTED',
    execution_status: 'BLOCKED',
    latency_ms: 28,
    reason: `Explicitly REJECTED by supervisor ${supervisorName}. Execution terminated.`
  });

  return {
    approval: item,
    execution: {
      executed: false,
      execution_status: 'BLOCKED',
      simulated: false,
      message: `Action rejected by security supervisor ${supervisorName}. Tool execution permanently blocked.`
    }
  };
}
