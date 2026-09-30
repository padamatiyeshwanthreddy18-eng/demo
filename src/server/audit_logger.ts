import { store } from './data_store.js';
import { SecurityInspectionReport, AuditLogEntry } from './types.js';

export function recordAuditLog(inspection: SecurityInspectionReport): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `AUD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
    request_id: inspection.request_id,
    timestamp: inspection.timestamp,
    agent_id: inspection.request.agent_id,
    agent_role: inspection.request.agent_role,
    task: inspection.request.task,
    action: inspection.request.action,
    tool: inspection.request.tool,
    resource: inspection.request.resource,
    risk_score: inspection.risk.risk_score,
    risk_level: inspection.risk.risk_level,
    prompt_injection_detected: inspection.prompt_injection.detected,
    matched_policy: inspection.policy.matched_policy,
    decision: inspection.decision,
    approval_status: inspection.approval_status,
    execution_status: inspection.execution.execution_status,
    latency_ms: inspection.latency_ms,
    reason: inspection.policy.reason
  };

  store.addAuditLog(entry);
  return entry;
}
