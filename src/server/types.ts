export type AgentRole = 'research_agent' | 'email_agent' | 'database_agent' | 'admin_agent' | 'unknown';
export type AgentStatus = 'active' | 'disabled' | 'suspended';

export type SensitivityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DecisionType = 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY';
export type ApprovalStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type ExecutionStatus = 'NOT_EXECUTED' | 'PENDING_APPROVAL' | 'EXECUTED' | 'BLOCKED';

export interface RegisteredAgent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  trust_level: number; // 1 - 5
  allowed_tools: string[];
  allowed_actions: string[];
  approval_actions: string[];
  denied_actions: string[];
  description: string;
  created_at: string;
  last_active: string;
}

export interface SecurityPolicy {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'IDENTITY' | 'INJECTION' | 'RISK' | 'SENSITIVITY' | 'DATABASE' | 'OPERATION' | 'CRITICAL_ASSET';
  condition: string;
  action: DecisionType;
  enabled: boolean;
  priority: number;
}

export interface ProposedActionRequest {
  agent_id: string;
  agent_role: string;
  task: string;
  action: string;
  tool: string;
  resource: string;
  reason?: string;
  data_provenance?: string;
  parameters?: Record<string, any>;
  user_input?: string;
}

export interface IntentAnalysisResult {
  goal: string;
  action_relevant: boolean;
  necessity: 'required' | 'optional' | 'unnecessary' | 'suspicious';
  intent_risk: number; // 0 - 100
  reasoning: string;
}

export interface IdentityResult {
  agent_exists: boolean;
  status_active: boolean;
  role_match: boolean;
  permission_granted: boolean;
  identity_risk: number;
  reason: string;
}

export interface ContextResult {
  valid: boolean;
  task_relevance: number; // 0 - 100
  scope_escalation: boolean;
  unexpected_behavior: boolean;
  context_risk: number;
  notes: string;
}

export interface DataSensitivityResult {
  classification: SensitivityLevel;
  sensitivity_score: number; // 0 - 100
  requires_encryption: boolean;
  reasoning: string;
}

export interface PromptInjectionResult {
  detected: boolean;
  confidence: number; // 0.0 - 1.0
  matched_patterns: string[];
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  details: string;
}

export interface RiskComponents {
  action_risk: number;
  task_relevance_risk: number;
  sensitivity_risk: number;
  destination_trust_risk: number;
  agent_permission_risk: number;
  prompt_injection_risk: number;
  policy_violations_risk: number;
  provenance_risk: number;
  irreversibility_risk: number;
  identity_risk: number;
}

export interface RiskResult {
  risk_score: number;
  risk_level: RiskLevel;
  components: RiskComponents;
  dominant_factor: string;
}

export interface PolicyResult {
  matched_policy: string;
  policy_name: string;
  policy_decision: DecisionType;
  reason: string;
  violations: string[];
}

export interface ExecutionResult {
  executed: boolean;
  execution_status: ExecutionStatus;
  execution_result?: any;
  simulated: boolean;
  message: string;
}

export interface SecurityInspectionReport {
  request_id: string;
  timestamp: string;
  session_id: string;
  request: ProposedActionRequest;
  intent_analysis: IntentAnalysisResult;
  identity_result: IdentityResult;
  context_result: ContextResult;
  data_sensitivity: DataSensitivityResult;
  prompt_injection: PromptInjectionResult;
  risk: RiskResult;
  policy: PolicyResult;
  decision: DecisionType;
  approval_status: ApprovalStatus;
  execution: ExecutionResult;
  latency_ms: number;
  governor_version: string;
}

export interface PendingApprovalItem {
  id: string;
  request_id: string;
  timestamp: string;
  agent_id: string;
  agent_name: string;
  agent_role: string;
  action: string;
  tool: string;
  resource: string;
  risk_score: number;
  risk_level: RiskLevel;
  reason: string;
  matched_policy: string;
  status: ApprovalStatus;
  request: ProposedActionRequest;
  inspection: SecurityInspectionReport;
  decided_at?: string;
  decided_by?: string;
}

export interface AuditLogEntry {
  id: string;
  request_id: string;
  timestamp: string;
  agent_id: string;
  agent_role: string;
  task: string;
  action: string;
  tool: string;
  resource: string;
  risk_score: number;
  risk_level: RiskLevel;
  prompt_injection_detected: boolean;
  matched_policy: string;
  decision: DecisionType;
  approval_status: ApprovalStatus;
  execution_status: ExecutionStatus;
  latency_ms: number;
  reason: string;
  signature?: string;
}

export interface DashboardMetrics {
  total_requests: number;
  allowed_count: number;
  denied_count: number;
  pending_approvals_count: number;
  average_risk_score: number;
  prompt_injections_blocked: number;
  active_agents_count: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recent_activity: AuditLogEntry[];
  security_alerts: {
    id: string;
    timestamp: string;
    agent_id: string;
    type: string;
    pattern?: string;
    severity: string;
    decision: string;
    details: string;
  }[];
}

export interface N8nWebhookConfig {
  url: string;
  test_url: string;
  active_url_type: 'production' | 'test';
  enabled: boolean;
  forward_evaluations: boolean;
  forward_approvals: boolean;
  forward_alerts: boolean;
  last_status?: 'SUCCESS' | 'ERROR' | 'INACTIVE_WORKFLOW' | 'IDLE';
  last_status_code?: number;
  last_tested_at?: string;
  last_error_hint?: string;
  deliveries_count: number;
  successful_deliveries: number;
}

export interface N8nWebhookDelivery {
  id: string;
  timestamp: string;
  event: 'agent_permission_check' | 'governor_decision' | 'approval_decision' | 'manual_test';
  target_url: string;
  status_code: number;
  duration_ms: number;
  success: boolean;
  request_payload: any;
  response_body: any;
  error?: string;
  hint?: string;
}
