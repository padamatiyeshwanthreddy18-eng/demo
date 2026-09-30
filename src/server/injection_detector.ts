import { ProposedActionRequest, PromptInjectionResult } from './types.js';

const INJECTION_PATTERNS: { pattern: RegExp; name: string; weight: number }[] = [
  { pattern: /ignore\s+(?:all\s+)?(?:previous\s+)?(?:security\s+)?instructions/i, name: 'ignore previous instructions', weight: 0.95 },
  { pattern: /ignore\s+(?:previous\s+)?(?:security\s+)?polic(?:y|ies)/i, name: 'ignore security policy', weight: 0.95 },
  { pattern: /bypass\s+(?:all\s+)?(?:security\s+)?(?:permissions?|controls?|guardrails?|restrictions?)/i, name: 'bypass permissions', weight: 0.92 },
  { pattern: /disable\s+(?:all\s+)?(?:security|guardrails?|logging|auditing)/i, name: 'disable security', weight: 0.9 },
  { pattern: /reveal\s+(?:all\s+)?(?:the\s+)?(?:system\s+)?(?:prompts?|instructions?|secrets?)/i, name: 'reveal system prompt', weight: 0.88 },
  { pattern: /leak\s+(?:the\s+)?(?:system\s+)?(?:prompt|keys?)/i, name: 'leak prompt', weight: 0.85 },
  { pattern: /act\s+as\s+(?:an?\s+)?(?:administrator|root|superuser|sysadmin)/i, name: 'act as administrator', weight: 0.85 },
  { pattern: /execute\s+regardless\s+of\s+polic(?:y|ies)/i, name: 'execute regardless of policy', weight: 0.95 },
  { pattern: /override\s+(?:all\s+)?(?:restrictions?|policies?|guards?)/i, name: 'override restrictions', weight: 0.9 },
  { pattern: /do\s+not\s+log\s+(?:this\s+)?(?:action|command|event)/i, name: 'do not log this action', weight: 0.85 },
  { pattern: /delete\s+all\s+records/i, name: 'delete all records', weight: 0.9 },
  { pattern: /drop\s+all\s+tables/i, name: 'drop all tables', weight: 0.9 },
  { pattern: /send\s+(?:all\s+)?credentials/i, name: 'send credentials', weight: 0.95 },
  { pattern: /exfiltrate\s+(?:all\s+)?(?:data|secrets|keys)/i, name: 'exfiltrate data', weight: 0.95 },
  { pattern: /jailbreak|dan\s+mode|unrestricted\s+mode/i, name: 'jailbreak mode trigger', weight: 0.9 },
  { pattern: /---\s*BEGIN\s+ADMIN\s+OVERRIDE\s*---/i, name: 'delimiter escape attempt', weight: 0.88 }
];

export function detectPromptInjection(request: ProposedActionRequest): PromptInjectionResult {
  const textsToScan: string[] = [
    request.task || '',
    request.reason || '',
    request.user_input || '',
    request.data_provenance || '',
    JSON.stringify(request.parameters || {})
  ];

  const fullCorpus = textsToScan.join(' ');
  const matchedPatterns: string[] = [];
  let maxWeight = 0;

  for (const item of INJECTION_PATTERNS) {
    if (item.pattern.test(fullCorpus)) {
      matchedPatterns.push(item.name);
      if (item.weight > maxWeight) {
        maxWeight = item.weight;
      }
    }
  }

  // Also check base64 or obfuscation heuristics if length is suspicious
  if (/(?:(?:[A-Za-z0-9+/]{4}){10,})(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/.test(fullCorpus)) {
    // If decoded base64 contains dangerous pattern
    try {
      const b64Match = fullCorpus.match(/(?:[A-Za-z0-9+/]{4}){10,}/);
      if (b64Match) {
        const decoded = Buffer.from(b64Match[0], 'base64').toString('utf-8');
        if (/ignore|bypass|delete|password|secret/i.test(decoded)) {
          matchedPatterns.push('encoded base64 jailbreak payload');
          maxWeight = Math.max(maxWeight, 0.95);
        }
      }
    } catch {}
  }

  const detected = matchedPatterns.length > 0;
  let severity: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL' = 'NONE';

  if (detected) {
    if (maxWeight >= 0.85 || matchedPatterns.length >= 2) {
      severity = 'CRITICAL';
    } else if (maxWeight >= 0.6) {
      severity = 'MEDIUM';
    } else {
      severity = 'LOW';
    }
  }

  const details = detected
    ? `Prompt injection heuristic alert: ${matchedPatterns.length} signature(s) detected [${matchedPatterns.join(', ')}].`
    : 'No adversarial prompt injection patterns detected in payload or parameters.';

  return {
    detected,
    confidence: detected ? parseFloat(maxWeight.toFixed(2)) : 0,
    matched_patterns: matchedPatterns,
    severity,
    details
  };
}
