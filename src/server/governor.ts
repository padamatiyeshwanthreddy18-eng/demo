import { ProposedActionRequest, SecurityInspectionReport } from './types.js';
import { analyzeIntent } from './intent_analyzer.js';
import { verifyIdentityAndPermission } from './identity.js';
import { validateContext } from './context_validator.js';
import { classifySensitivity } from './sensitivity.js';
import { detectPromptInjection } from './injection_detector.js';
import { calculateRiskScore } from './risk_engine.js';
import { evaluatePolicies } from './policy_engine.js';
import { executeSafely } from './secure_executor.js';
import { createPendingApproval } from './approval_manager.js';
import { recordAuditLog } from './audit_logger.js';

export function runGovernorPipeline(request: ProposedActionRequest): SecurityInspectionReport {
  const startTime = performance.now();
  const requestId = `REQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  const timestamp = new Date().toISOString();
  const sessionId = `SES-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // Stage 1: Intent Analyzer
  const intentResult = analyzeIntent(request);

  // Stage 2: Agent Identity & Permission Checker
  const identityResult = verifyIdentityAndPermission(request);

  // Stage 3: Context Validator
  const contextResult = validateContext(request);

  // Stage 4: Data Sensitivity Classifier
  const sensitivityResult = classifySensitivity(request);

  // Stage 5: Prompt Injection Detector
  const injectionResult = detectPromptInjection(request);

  // Stage 6: Risk Scoring Engine
  const riskResult = calculateRiskScore(
    request,
    intentResult,
    identityResult,
    contextResult,
    sensitivityResult,
    injectionResult
  );

  // Stage 7: Policy Engine
  const policyResult = evaluatePolicies(
    request,
    identityResult,
    injectionResult,
    sensitivityResult,
    riskResult
  );

  // Stage 8: Decision Engine
  const decision = policyResult.policy_decision;

  // Stage 9: Approval Handling & Execution
  let approvalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'NONE';
  if (decision === 'REQUIRE_APPROVAL') {
    approvalStatus = 'PENDING';
  }

  const executionResult = executeSafely(request, decision, approvalStatus);

  const endTime = performance.now();
  const latencyMs = Math.max(12, Math.round(endTime - startTime));

  const inspectionReport: SecurityInspectionReport = {
    request_id: requestId,
    timestamp,
    session_id: sessionId,
    request,
    intent_analysis: intentResult,
    identity_result: identityResult,
    context_result: contextResult,
    data_sensitivity: sensitivityResult,
    prompt_injection: injectionResult,
    risk: riskResult,
    policy: policyResult,
    decision,
    approval_status: approvalStatus,
    execution: executionResult,
    latency_ms: latencyMs,
    governor_version: 'AEGIS-v2.6.4-ENTERPRISE'
  };

  // If requires approval, queue in pending approvals store
  if (decision === 'REQUIRE_APPROVAL') {
    createPendingApproval(inspectionReport);
  }

  // Stage 10: Audit Logging
  recordAuditLog(inspectionReport);

  return inspectionReport;
}
