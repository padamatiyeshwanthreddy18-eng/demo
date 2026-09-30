import { N8nWebhookConfig, N8nWebhookDelivery, SecurityInspectionReport } from './types.js';

class N8nWebhookService {
  private config: N8nWebhookConfig = {
    url: 'https://hindujareddy.app.n8n.cloud/webhook/agent-permission-check',
    test_url: 'https://hindujareddy.app.n8n.cloud/webhook-test/agent-permission-check',
    active_url_type: 'production',
    enabled: true,
    forward_evaluations: true,
    forward_approvals: true,
    forward_alerts: true,
    last_status: 'IDLE',
    deliveries_count: 0,
    successful_deliveries: 0
  };

  private deliveries: N8nWebhookDelivery[] = [];
  private maxDeliveries = 50;

  public getConfig(): N8nWebhookConfig {
    return { ...this.config };
  }

  public updateConfig(patch: Partial<N8nWebhookConfig>): N8nWebhookConfig {
    this.config = {
      ...this.config,
      ...patch
    };
    return this.getConfig();
  }

  public getDeliveries(): N8nWebhookDelivery[] {
    return [...this.deliveries];
  }

  public clearDeliveries(): void {
    this.deliveries = [];
    this.config.deliveries_count = 0;
    this.config.successful_deliveries = 0;
  }

  public getEffectiveUrl(): string {
    return this.config.active_url_type === 'test' ? this.config.test_url : this.config.url;
  }

  public async dispatch(
    event: 'agent_permission_check' | 'governor_decision' | 'approval_decision' | 'manual_test',
    payload: any,
    targetUrlOverride?: string
  ): Promise<N8nWebhookDelivery> {
    const targetUrl = targetUrlOverride || this.getEffectiveUrl();
    const deliveryId = `DLV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
    const timestamp = new Date().toISOString();
    const startTime = performance.now();

    // Standardized payload format for the n8n Agent Permission Check workflow
    const bodyToSend = {
      event,
      timestamp,
      delivery_id: deliveryId,
      source: 'AEGIS_AGENT_PERMISSION_GOVERNOR',
      governor_version: 'AEGIS-v2.6.4-ENTERPRISE',
      ...payload
    };

    let statusCode = 0;
    let responseBody: any = null;
    let isSuccess = false;
    let errorMessage: string | undefined;
    let hintMessage: string | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AEGIS-Agent-Permission-Governor/2.6.4',
          'X-Aegis-Event': event,
          'X-Aegis-Delivery-Id': deliveryId
        },
        body: JSON.stringify(bodyToSend),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      statusCode = res.status;

      const rawText = await res.text();
      try {
        responseBody = JSON.parse(rawText);
      } catch {
        responseBody = rawText;
      }

      if (res.ok) {
        isSuccess = true;
        this.config.last_status = 'SUCCESS';
        this.config.successful_deliveries++;
      } else {
        if (statusCode === 404) {
          this.config.last_status = 'INACTIVE_WORKFLOW';
          hintMessage = responseBody?.hint || (
            this.config.active_url_type === 'production'
              ? 'The n8n workflow must be activated using the toggle in the top-right of your n8n canvas.'
              : 'Click "Execute workflow" in the n8n canvas before testing.'
          );
        } else {
          this.config.last_status = 'ERROR';
        }
        errorMessage = responseBody?.message || `HTTP ${statusCode} ${res.statusText}`;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        errorMessage = 'Webhook dispatch timed out after 7000ms';
        statusCode = 408;
      } else {
        errorMessage = err.message || 'Network connection failed';
        statusCode = 503;
      }
      this.config.last_status = 'ERROR';
    }

    const durationMs = Math.round(performance.now() - startTime);

    this.config.deliveries_count++;
    this.config.last_status_code = statusCode;
    this.config.last_tested_at = timestamp;
    this.config.last_error_hint = hintMessage || errorMessage;

    const deliveryRecord: N8nWebhookDelivery = {
      id: deliveryId,
      timestamp,
      event,
      target_url: targetUrl,
      status_code: statusCode,
      duration_ms: durationMs,
      success: isSuccess,
      request_payload: bodyToSend,
      response_body: responseBody,
      error: errorMessage,
      hint: hintMessage
    };

    this.deliveries.unshift(deliveryRecord);
    if (this.deliveries.length > this.maxDeliveries) {
      this.deliveries.pop();
    }

    return deliveryRecord;
  }

  public async forwardInspection(report: SecurityInspectionReport): Promise<void> {
    if (!this.config.enabled || !this.config.forward_evaluations) return;

    // Asynchronously dispatch without blocking governor response
    this.dispatch('agent_permission_check', {
      request_id: report.request_id,
      session_id: report.session_id,
      agent_id: report.request.agent_id,
      agent_role: report.request.agent_role,
      action: report.request.action,
      tool: report.request.tool,
      resource: report.request.resource,
      task: report.request.task,
      parameters: report.request.parameters,
      decision: report.decision,
      approval_status: report.approval_status,
      execution_status: report.execution?.execution_status,
      risk_score: report.risk.risk_score,
      risk_level: report.risk.risk_level,
      dominant_factor: report.risk.dominant_factor,
      matched_policy: report.policy.matched_policy,
      policy_reason: report.policy.reason,
      prompt_injection_detected: report.prompt_injection?.detected || false,
      data_sensitivity: report.data_sensitivity?.classification,
      latency_ms: report.latency_ms
    }).catch(err => {
      console.warn('[n8n Webhook] Forwarding failed:', err.message);
    });
  }

  public async forwardApprovalDecision(
    requestId: string,
    action: 'APPROVED' | 'REJECTED',
    supervisor: string,
    details?: any
  ): Promise<void> {
    if (!this.config.enabled || !this.config.forward_approvals) return;

    this.dispatch('approval_decision', {
      request_id: requestId,
      approval_action: action,
      decided_by: supervisor,
      timestamp: new Date().toISOString(),
      details
    }).catch(err => {
      console.warn('[n8n Webhook] Approval forwarding failed:', err.message);
    });
  }
}

export const n8nWebhookService = new N8nWebhookService();
