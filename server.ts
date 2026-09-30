import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { store } from './src/server/data_store.js';
import { runGovernorPipeline } from './src/server/governor.js';
import { approveRequest, rejectRequest } from './src/server/approval_manager.js';
import { ProposedActionRequest } from './src/server/types.js';
import { n8nWebhookService } from './src/server/n8n_webhook.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes
  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'HEALTHY',
      service: 'AEGIS AI — Agent Permission Governor',
      version: '2.6.4-ENTERPRISE',
      uptime: process.uptime(),
      engines: {
        policy_engine: 'ACTIVE',
        risk_engine: 'ACTIVE',
        audit_system: 'ACTIVE',
        prompt_injection_shield: 'ACTIVE'
      }
    });
  });

  // 2. Real-time Governor Inspection
  app.post('/api/analyze', (req, res) => {
    try {
      const payload = req.body as ProposedActionRequest;
      if (!payload || !payload.agent_id || !payload.action) {
        return res.status(400).json({
          error: 'Invalid payload: agent_id and action are required parameters.'
        });
      }

      const report = runGovernorPipeline(payload);

      // Asynchronously forward to n8n webhook workflow
      n8nWebhookService.forwardInspection(report);

      return res.json(report);
    } catch (err: any) {
      console.error('Governor error:', err);
      return res.status(500).json({ error: err.message || 'Internal Governor Fault' });
    }
  });

  // 3. Dashboard metrics
  app.get('/api/dashboard', (req, res) => {
    try {
      const metrics = store.getDashboardMetrics();
      res.json(metrics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Registered Agents Directory
  app.get('/api/agents', (req, res) => {
    try {
      res.json(store.getAgents());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Active Security Policies
  app.get('/api/policies', (req, res) => {
    try {
      res.json(store.getPolicies());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Pending Human Approvals
  app.get('/api/approvals', (req, res) => {
    try {
      const showAll = req.query.all === 'true';
      const list = showAll ? store.getAllApprovals() : store.getPendingApprovals();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Approve pending request
  app.post('/api/approvals/:id/approve', (req, res) => {
    try {
      const requestId = req.params.id;
      const supervisor = req.body?.supervisor || 'SOC Security Supervisor (Level 3)';
      const result = approveRequest(requestId, supervisor);

      // Forward approval to n8n webhook
      n8nWebhookService.forwardApprovalDecision(requestId, 'APPROVED', supervisor, result);

      res.json({
        success: true,
        message: `Request ${requestId} approved successfully. Tool action executed in sandbox.`,
        ...result
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 8. Reject pending request
  app.post('/api/approvals/:id/reject', (req, res) => {
    try {
      const requestId = req.params.id;
      const supervisor = req.body?.supervisor || 'SOC Security Supervisor (Level 3)';
      const result = rejectRequest(requestId, supervisor);

      // Forward rejection to n8n webhook
      n8nWebhookService.forwardApprovalDecision(requestId, 'REJECTED', supervisor, result);

      res.json({
        success: true,
        message: `Request ${requestId} permanently rejected. Execution terminated.`,
        ...result
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 9. Searchable Audit Logs
  app.get('/api/audit', (req, res) => {
    try {
      const { search, decision, risk, agent, limit } = req.query;
      const logs = store.getAuditLogs({
        search: search as string,
        decision: decision as string,
        risk: risk as string,
        agent: agent as string,
        limit: limit ? parseInt(limit as string, 10) : undefined
      });
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. n8n Agent Permission Check Integration Endpoints
  app.get('/api/integrations/n8n', (req, res) => {
    try {
      res.json({
        config: n8nWebhookService.getConfig(),
        deliveries: n8nWebhookService.getDeliveries()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/integrations/n8n/config', (req, res) => {
    try {
      const updated = n8nWebhookService.updateConfig(req.body);
      res.json({
        success: true,
        config: updated
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/integrations/n8n/test', async (req, res) => {
    try {
      const customPayload = req.body?.payload || {
        agent_id: 'database-agent-01',
        agent_role: 'database_agent',
        action: 'select_records',
        tool: 'database',
        resource: 'customers_table',
        parameters: { limit: 25 },
        decision: 'ALLOW',
        risk_score: 18,
        risk_level: 'LOW',
        matched_policy: 'POL-DB-SELECT-ALLOW',
        policy_reason: 'Read-only customer query within safe parameters',
        timestamp: new Date().toISOString()
      };

      const result = await n8nWebhookService.dispatch('manual_test', customPayload);
      res.json({
        success: result.success,
        delivery: result,
        config: n8nWebhookService.getConfig()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/integrations/n8n/dispatch', async (req, res) => {
    try {
      const { event = 'agent_permission_check', payload } = req.body;
      if (!payload) {
        return res.status(400).json({ error: 'payload is required' });
      }
      const result = await n8nWebhookService.dispatch(event, payload);
      res.json({
        success: result.success,
        delivery: result,
        config: n8nWebhookService.getConfig()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/integrations/n8n/clear', (req, res) => {
    try {
      n8nWebhookService.clearDeliveries();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware in dev or static files in prod
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AEGIS-AI] Agent Permission Governor running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
