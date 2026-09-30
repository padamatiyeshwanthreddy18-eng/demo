import { ProposedActionRequest, ContextResult } from './types.js';

export function validateContext(request: ProposedActionRequest): ContextResult {
  const task = (request.task || '').toLowerCase();
  const action = (request.action || '').toLowerCase();
  const resource = (request.resource || '').toLowerCase();

  let valid = true;
  let relevanceScore = 95;
  let scopeEscalation = false;
  let unexpectedBehavior = false;
  let contextRisk = 5;
  const notes: string[] = [];

  // Check 1: Severe scope mismatch (e.g. read prompt -> delete DB)
  const isReadTask = task.includes('read') || task.includes('summarize') || task.includes('inspect') || task.includes('find') || task.includes('search');
  const isDestructiveAction = action.includes('delete') || action.includes('drop') || action.includes('truncate') || action.includes('destroy') || action.includes('wipe');

  if (isReadTask && isDestructiveAction) {
    valid = false;
    scopeEscalation = true;
    unexpectedBehavior = true;
    relevanceScore = 10;
    contextRisk = 85;
    notes.push(`Critical mismatch: Read task requested but destructive action "${action}" targeted at "${resource}".`);
  }

  // Check 2: Resource mismatch
  if (task.includes('report') && resource.includes('customer_database')) {
    scopeEscalation = true;
    relevanceScore = Math.min(relevanceScore, 30);
    contextRisk = Math.max(contextRisk, 65);
    notes.push('Target resource diverges from task specification (accessed customer_database instead of report).');
  }

  // Check 3: External broadcast on unprompted task
  if ((action === 'send_email' || action === 'export_data') && !task.includes('email') && !task.includes('send') && !task.includes('share') && !task.includes('export')) {
    unexpectedBehavior = true;
    relevanceScore = Math.min(relevanceScore, 50);
    contextRisk = Math.max(contextRisk, 40);
    notes.push('Exfiltration hazard: External dispatch proposed without explicit task directive.');
  }

  // Check 4: Shell execution attempts
  if (action === 'execute_shell') {
    valid = false;
    scopeEscalation = true;
    unexpectedBehavior = true;
    relevanceScore = 5;
    contextRisk = 95;
    notes.push('Arbitrary shell commands are unconditionally out of context for autonomous agents.');
  }

  if (notes.length === 0) {
    notes.push('Operational context verified: Task, target resource, and proposed action are tightly coupled.');
  }

  return {
    valid,
    task_relevance: relevanceScore,
    scope_escalation: scopeEscalation,
    unexpected_behavior: unexpectedBehavior,
    context_risk: contextRisk,
    notes: notes.join(' ')
  };
}
