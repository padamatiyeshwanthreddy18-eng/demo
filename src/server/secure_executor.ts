import { ProposedActionRequest, DecisionType, ApprovalStatus, ExecutionResult } from './types.js';

export function executeSafely(
  request: ProposedActionRequest,
  decision: DecisionType,
  approvalStatus: ApprovalStatus
): ExecutionResult {
  // Defense-in-depth independent verification:
  const isAuthorized =
    decision === 'ALLOW' ||
    (decision === 'REQUIRE_APPROVAL' && approvalStatus === 'APPROVED');

  if (!isAuthorized) {
    return {
      executed: false,
      execution_status: decision === 'REQUIRE_APPROVAL' ? 'PENDING_APPROVAL' : 'BLOCKED',
      simulated: false,
      message:
        decision === 'REQUIRE_APPROVAL'
          ? 'Execution paused: Awaiting cryptographic human supervisor authorization.'
          : 'Execution rejected: Action blocked by AEGIS security governor.'
    };
  }

  // Hard stop on dangerous actions regardless of input
  if (request.action === 'execute_shell' || request.tool === 'terminal' || request.tool === 'shell') {
    return {
      executed: false,
      execution_status: 'BLOCKED',
      simulated: false,
      message: 'CRITICAL SECURITY VIOLATION: Shell execution is forbidden at runtime executor layer.'
    };
  }

  // Execute safe simulation for authorized tool categories
  const executionTimestamp = new Date().toISOString();
  let resultPayload: any = {};

  switch (request.tool) {
    case 'filesystem':
      resultPayload = {
        operation: request.action,
        path: `/sandbox/secure_vault/${request.resource}`,
        bytes_read: 14820,
        content_summary: `[Encrypted stream read verified for ${request.resource}] Document verified against sandbox checksum.`,
        completed_at: executionTimestamp
      };
      break;

    case 'database':
    case 'sql_client':
      resultPayload = {
        engine: 'PostgreSQL-Secure-Proxy',
        table: request.resource,
        action: request.action,
        rows_affected: request.action === 'read_query' ? 12 : 1,
        transaction_id: `tx-${Math.random().toString(36).substring(2, 9)}`,
        status: 'COMMITTED',
        completed_at: executionTimestamp
      };
      break;

    case 'mailer':
      resultPayload = {
        transport: 'AEGIS-Encrypted-MTA',
        recipient_count: 1,
        message_id: `msg-${Date.now()}@aegis.security`,
        dispatch_status: 'DISPATCHED_TO_GATEWAY',
        completed_at: executionTimestamp
      };
      break;

    case 'web_search':
    case 'document_parser':
    case 'vector_store':
      resultPayload = {
        service: request.tool,
        query: request.task,
        embeddings_generated: 1536,
        confidence_match: 0.98,
        completed_at: executionTimestamp
      };
      break;

    default:
      resultPayload = {
        provider: request.tool,
        action: request.action,
        status: 'SUCCESS',
        completed_at: executionTimestamp
      };
  }

  return {
    executed: true,
    execution_status: 'EXECUTED',
    execution_result: resultPayload,
    simulated: true,
    message: `Secure execution successful: Action "${request.action}" completed in hardened sandbox.`
  };
}
