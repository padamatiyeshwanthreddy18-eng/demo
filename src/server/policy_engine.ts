import {
  ProposedActionRequest,
  IdentityResult,
  PromptInjectionResult,
  DataSensitivityResult,
  RiskResult,
  PolicyResult,
  DecisionType
} from './types.js';

export function evaluatePolicies(
  request: ProposedActionRequest,
  identity: IdentityResult,
  injection: PromptInjectionResult,
  sensitivity: DataSensitivityResult,
  risk: RiskResult
): PolicyResult {
  const action = (request.action || '').toLowerCase();
  const tool = (request.tool || '').toLowerCase();
  const violations: string[] = [];

  // Fail-closed check: Ensure mandatory fields are present
  if (!request.agent_id || !request.action || !request.tool || !request.resource) {
    return {
      matched_policy: 'POL-FAIL-CLOSED',
      policy_name: 'Fail-Closed Security Invariant',
      policy_decision: 'DENY',
      reason: 'Mandatory security descriptors missing from agent dispatch payload. Action denied by default.',
      violations: ['MISSING_MANDATORY_PARAMETERS']
    };
  }

  // 1. POL-001: Unknown / Disabled / Role Spoofing
  if (!identity.agent_exists || !identity.status_active || !identity.role_match) {
    violations.push('IDENTITY_AUTHENTICATION_FAILURE');
    return {
      matched_policy: 'POL-001',
      policy_name: 'Identity & Authentication Integrity',
      policy_decision: 'DENY',
      reason: identity.reason,
      violations
    };
  }

  // 2. POL-003: Prompt Injection
  if (injection.detected && (injection.severity === 'CRITICAL' || injection.confidence >= 0.5)) {
    violations.push(`INJECTION_DETECTED: [${injection.matched_patterns.join(', ')}]`);
    return {
      matched_policy: 'POL-003',
      policy_name: 'Prompt Injection Defense',
      policy_decision: 'DENY',
      reason: `Adversarial prompt injection pattern blocked: "${injection.matched_patterns.join(', ')}".`,
      violations
    };
  }

  // 3. POL-004: Prohibited action (e.g. execute_shell)
  if (action === 'execute_shell' || !identity.permission_granted) {
    violations.push(`PROHIBITED_ACTION: ${action}`);
    return {
      matched_policy: 'POL-004',
      policy_name: 'Prohibited & Dangerous Actions',
      policy_decision: 'DENY',
      reason: `Action "${action}" is explicitly prohibited by policy POL-004 for agent ${request.agent_id}.`,
      violations
    };
  }

  // 4. POL-006: Critical Resource Access
  if (sensitivity.classification === 'CRITICAL') {
    violations.push(`CRITICAL_ASSET_VIOLATION: ${request.resource}`);
    return {
      matched_policy: 'POL-006',
      policy_name: 'Critical Asset & Credential Quarantine',
      policy_decision: 'DENY',
      reason: `Direct access to critical asset "${request.resource}" is unconditionally blocked.`,
      violations
    };
  }

  // 5. POL-008: Critical Risk Score (>= 71)
  if (risk.risk_score >= 71) {
    violations.push(`COMPOSITE_RISK_THRESHOLD_EXCEEDED: ${risk.risk_score}/100`);
    return {
      matched_policy: 'POL-008',
      policy_name: 'Critical Composite Risk Threshold',
      policy_decision: 'DENY',
      reason: `Risk score (${risk.risk_score}/100) exceeds safety limit of 70. Dominant factor: ${risk.dominant_factor}.`,
      violations
    };
  }

  // 6. POL-014: Database Modification Check
  if (action === 'database_update' || action === 'insert_record' || action === 'bulk_sync' || action.includes('update_database')) {
    return {
      matched_policy: 'POL-014',
      policy_name: 'Database State Mutation Check',
      policy_decision: 'REQUIRE_APPROVAL',
      reason: `Database state modification requested on "${request.resource}". Human supervisor confirmation required.`,
      violations: []
    };
  }

  // 7. POL-013: External Communication & Exfiltration Gate
  if (tool === 'mailer' || action === 'send_email' || action === 'export_data' || action === 'external_broadcast') {
    return {
      matched_policy: 'POL-013',
      policy_name: 'Outbound & External Communication Gate',
      policy_decision: 'REQUIRE_APPROVAL',
      reason: `Outbound dissemination to external channel (${action}) requires explicit human sign-off.`,
      violations: []
    };
  }

  // 8. POL-012: Sensitive Data Access Gate
  if (sensitivity.classification === 'CONFIDENTIAL' || sensitivity.classification === 'RESTRICTED') {
    return {
      matched_policy: 'POL-012',
      policy_name: 'Confidential Data Governance',
      policy_decision: 'REQUIRE_APPROVAL',
      reason: `Target resource "${request.resource}" classified as ${sensitivity.classification}. Human supervisor authorization required.`,
      violations: []
    };
  }

  // 9. POL-010: Elevated Composite Risk (31 - 70)
  if (risk.risk_score >= 31 && risk.risk_score <= 70) {
    return {
      matched_policy: 'POL-010',
      policy_name: 'Elevated Risk Human Gatekeeper',
      policy_decision: 'REQUIRE_APPROVAL',
      reason: `Elevated operational risk score (${risk.risk_score}/100). Execution paused pending human supervisor review.`,
      violations: []
    };
  }

  // Default ALLOW for low-risk, verified actions
  return {
    matched_policy: 'DEFAULT_ALLOW',
    policy_name: 'Baseline Operational Clearance',
    policy_decision: 'ALLOW',
    reason: `Action passed all security stages. Identity verified, low risk (${risk.risk_score}/100), and policy compliance confirmed.`,
    violations: []
  };
}
