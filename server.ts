import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { store } from './src/server/data_store.js';
import { runGovernorPipeline } from './src/server/governor.js';
import { approveRequest, rejectRequest } from './src/server/approval_manager.js';
import { ProposedActionRequest } from './src/server/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

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

  app.listen(PORT, () => {
    console.log(`[AEGIS-AI] Agent Permission Governor running on http://localhost:${PORT}`);
  });
}

startServer();
