import { ProposedActionRequest, IdentityResult } from './types.js';
import { store } from './data_store.js';

export function verifyIdentityAndPermission(request: ProposedActionRequest): IdentityResult {
  const registered = store.getAgent(request.agent_id);

  // 1. Unknown Agent Check
  if (!registered) {
    return {
      agent_exists: false,
      status_active: false,
      role_match: false,
      permission_granted: false,
      identity_risk: 95,
      reason: `Agent ID "${request.agent_id}" is not registered in the AEGIS Agent Directory.`
    };
  }

  // 2. Disabled Agent Check
  if (registered.status !== 'active') {
    return {
      agent_exists: true,
      status_active: false,
      role_match: registered.role === request.agent_role,
      permission_granted: false,
      identity_risk: 90,
      reason: `Agent "${registered.name}" (${registered.id}) is currently ${registered.status.toUpperCase()} and cannot execute actions.`
    };
  }

  // 3. Role Spoofing Check
  if (registered.role !== request.agent_role) {
    return {
      agent_exists: true,
      status_active: true,
      role_match: false,
      permission_granted: false,
      identity_risk: 95,
      reason: `Role spoofing detected: Claimed role "${request.agent_role}" does not match registered role "${registered.role}".`
    };
  }

  // 4. Prohibited actions
  if (request.action === 'execute_shell' || registered.denied_actions.includes(request.action)) {
    return {
      agent_exists: true,
      status_active: true,
      role_match: true,
      permission_granted: false,
      identity_risk: 85,
      reason: `Action "${request.action}" is explicitly prohibited in the security policy for ${registered.role}.`
    };
  }

  // 5. Tool Check
  if (!registered.allowed_tools.includes(request.tool)) {
    return {
      agent_exists: true,
      status_active: true,
      role_match: true,
      permission_granted: false,
      identity_risk: 75,
      reason: `Tool "${request.tool}" is not in the authorized capability bundle for ${registered.role}.`
    };
  }

  // 6. Action Check
  const isAllowed = registered.allowed_actions.includes(request.action);
  const isApprovalReq = registered.approval_actions.includes(request.action);

  if (!isAllowed && !isApprovalReq) {
    return {
      agent_exists: true,
      status_active: true,
      role_match: true,
      permission_granted: false,
      identity_risk: 70,
      reason: `Action "${request.action}" is not recognized in allowed or approval-gate action list for ${registered.role}.`
    };
  }

  return {
    agent_exists: true,
    status_active: true,
    role_match: true,
    permission_granted: true,
    identity_risk: 5,
    reason: `Agent identity verified: ${registered.name} (${registered.role}) with trust level ${registered.trust_level}/5.`
  };
}
