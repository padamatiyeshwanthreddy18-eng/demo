import {
  ProposedActionRequest,
  IntentAnalysisResult,
  IdentityResult,
  ContextResult,
  DataSensitivityResult,
  PromptInjectionResult,
  RiskResult,
  RiskComponents,
  RiskLevel
} from './types.js';

export function calculateRiskScore(
  request: ProposedActionRequest,
  intent: IntentAnalysisResult,
  identity: IdentityResult,
  context: ContextResult,
  sensitivity: DataSensitivityResult,
  injection: PromptInjectionResult
): RiskResult {
  const action = (request.action || '').toLowerCase();
  const tool = (request.tool || '').toLowerCase();
  const provenance = (request.data_provenance || '').toLowerCase();

  // 1. Action Type Risk (0 - 25)
  let actionRisk = 5;
  if (action === 'execute_shell' || action.includes('bash') || action.includes('exec')) {
    actionRisk = 25;
  } else if (action.includes('delete') || action.includes('drop') || action.includes('truncate')) {
    actionRisk = 24;
  } else if (action.includes('update') || action.includes('insert') || action.includes('write')) {
    actionRisk = 14;
  } else if (action.includes('email') || action.includes('export') || action.includes('broadcast')) {
    actionRisk = 13;
  } else if (action.includes('read') || action.includes('search') || action.includes('query')) {
    actionRisk = 4;
  }

  // 2. Task Relevance Risk (0 - 15)
  const taskRelevanceRisk = Math.round(((100 - context.task_relevance) / 100) * 12);

  // 3. Data Sensitivity Risk (0 - 25)
  const sensitivityRisk = Math.round((sensitivity.sensitivity_score / 100) * 22);

  // 4. Destination / Tool Trust Risk (0 - 15)
  let destinationTrustRisk = 3;
  if (tool === 'terminal' || tool === 'shell') {
    destinationTrustRisk = 15;
  } else if (tool === 'mailer' || tool === 'external_service') {
    destinationTrustRisk = 7;
  } else if (tool === 'database') {
    destinationTrustRisk = 7;
  } else if (tool === 'filesystem') {
    destinationTrustRisk = 3;
  }

  // 5. Agent Permission Risk (0 - 20)
  let agentPermissionRisk = 2;
  if (!identity.permission_granted) {
    agentPermissionRisk = 20;
  }

  // 6. Prompt Injection Risk (0 - 30)
  let promptInjectionRisk = 0;
  if (injection.detected) {
    promptInjectionRisk = injection.severity === 'CRITICAL' ? 30 : injection.severity === 'MEDIUM' ? 20 : 10;
  }

  // 7. Policy Violations Risk (0 - 20)
  let policyViolationsRisk = 0;
  if (context.scope_escalation) policyViolationsRisk += 10;
  if (intent.necessity === 'suspicious') policyViolationsRisk += 10;

  // 8. Data Provenance Risk (0 - 15)
  let provenanceRisk = 3;
  if (provenance.includes('untrusted') || provenance.includes('external') || provenance.includes('web_scrape')) {
    provenanceRisk = 14;
  } else if (provenance.includes('internal') || provenance.includes('verified')) {
    provenanceRisk = 2;
  } else if (!provenance) {
    provenanceRisk = 6;
  }

  // 9. Irreversibility Risk (0 - 15)
  let irreversibilityRisk = 2;
  if (action.includes('delete') || action.includes('drop') || action.includes('wipe')) {
    irreversibilityRisk = 15;
  } else if (action.includes('update') || action.includes('insert') || action.includes('email')) {
    irreversibilityRisk = 9;
  }

  // 10. Identity Risk (0 - 30)
  const identityRisk = Math.round((identity.identity_risk / 100) * 30);

  const components: RiskComponents = {
    action_risk: actionRisk,
    task_relevance_risk: taskRelevanceRisk,
    sensitivity_risk: sensitivityRisk,
    destination_trust_risk: destinationTrustRisk,
    agent_permission_risk: agentPermissionRisk,
    prompt_injection_risk: promptInjectionRisk,
    policy_violations_risk: policyViolationsRisk,
    provenance_risk: provenanceRisk,
    irreversibility_risk: irreversibilityRisk,
    identity_risk: identityRisk
  };

  // Raw weighted sum
  let totalRaw =
    actionRisk +
    taskRelevanceRisk +
    sensitivityRisk +
    destinationTrustRisk +
    agentPermissionRisk +
    promptInjectionRisk +
    policyViolationsRisk +
    provenanceRisk +
    irreversibilityRisk +
    identityRisk;

  // If hard failure triggers exist, ensure minimum score floors
  if (injection.detected && injection.severity === 'CRITICAL') {
    totalRaw = Math.max(totalRaw, 88);
  }
  if (!identity.agent_exists || !identity.status_active || !identity.role_match) {
    totalRaw = Math.max(totalRaw, 85);
  }
  if (action === 'execute_shell') {
    totalRaw = Math.max(totalRaw, 98);
  }
  if (action.includes('delete') && sensitivity.classification === 'RESTRICTED') {
    totalRaw = Math.max(totalRaw, 82);
  }

  // Scale / Clamp to 0 - 100
  const normalizedScore = Math.min(100, Math.max(0, Math.round(totalRaw)));

  let riskLevel: RiskLevel = 'LOW';
  if (normalizedScore >= 71) {
    riskLevel = 'CRITICAL';
  } else if (normalizedScore >= 45) {
    riskLevel = 'HIGH';
  } else if (normalizedScore >= 31) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Identify dominant factor
  let dominant = 'Baseline Operational Clearance';
  const factors: [string, number][] = [
    ['Prompt Injection Indicator', promptInjectionRisk],
    ['Agent Identity & Permission', identityRisk + agentPermissionRisk],
    ['Data Sensitivity Level', sensitivityRisk],
    ['Action Destructiveness', actionRisk + irreversibilityRisk],
    ['Task & Context Discrepancy', taskRelevanceRisk + policyViolationsRisk],
    ['Destination & Provenance Risk', destinationTrustRisk + provenanceRisk]
  ];
  factors.sort((a, b) => b[1] - a[1]);
  if (factors[0][1] > 10) {
    dominant = factors[0][0];
  }

  return {
    risk_score: normalizedScore,
    risk_level: riskLevel,
    components,
    dominant_factor: dominant
  };
}
