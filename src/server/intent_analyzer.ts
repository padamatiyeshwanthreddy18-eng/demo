import { ProposedActionRequest, IntentAnalysisResult } from './types.js';

export function analyzeIntent(request: ProposedActionRequest): IntentAnalysisResult {
  const task = (request.task || '').toLowerCase();
  const action = (request.action || '').toLowerCase();
  const resource = (request.resource || '').toLowerCase();
  const reason = (request.reason || '').toLowerCase();

  // Check relevance and alignment between declared task and proposed action
  let isRelevant = true;
  let necessity: 'required' | 'optional' | 'unnecessary' | 'suspicious' = 'required';
  let intentRisk = 5;
  let reasoning = 'Action directly aligns with declared objective.';

  // Suspicious mismatches
  const isDestructiveAction = action.includes('delete') || action.includes('drop') || action.includes('destroy') || action.includes('wipe');
  const isReadTask = task.includes('read') || task.includes('summarize') || task.includes('analyze') || task.includes('check') || task.includes('view');

  if (isReadTask && isDestructiveAction) {
    isRelevant = false;
    necessity = 'suspicious';
    intentRisk = 90;
    reasoning = `Scope escalation: Task "${request.task}" only requires read access, but action "${request.action}" is destructive.`;
  } else if (action === 'execute_shell' || action.includes('bash') || action.includes('terminal')) {
    isRelevant = false;
    necessity = 'suspicious';
    intentRisk = 95;
    reasoning = 'Shell command execution exceeds all standard autonomous agent intent specifications.';
  } else if (task.includes('financial') && action.includes('email') && !task.includes('send') && !task.includes('email')) {
    isRelevant = true;
    necessity = 'optional';
    intentRisk = 45;
    reasoning = 'Outbound dissemination of financial material requires contextual confirmation.';
  } else if (action.includes('update') || action.includes('insert') || action.includes('modify')) {
    intentRisk = 35;
    reasoning = 'State-mutating action proposed to fulfill task.';
  }

  return {
    goal: request.task || 'General task execution',
    action_relevant: isRelevant,
    necessity,
    intent_risk: intentRisk,
    reasoning
  };
}
