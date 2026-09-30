import { ProposedActionRequest, DataSensitivityResult, SensitivityLevel } from './types.js';

export function classifySensitivity(request: ProposedActionRequest): DataSensitivityResult {
  const resource = (request.resource || '').toLowerCase();
  const task = (request.task || '').toLowerCase();
  const combined = `${resource} ${task} ${JSON.stringify(request.parameters || {})}`.toLowerCase();

  // 1. CRITICAL
  if (
    combined.includes('credential') ||
    combined.includes('secret') ||
    combined.includes('private_key') ||
    combined.includes('root_api') ||
    combined.includes('production_credentials') ||
    combined.includes('auth_tokens') ||
    combined.includes('master_key')
  ) {
    return {
      classification: 'CRITICAL',
      sensitivity_score: 100,
      requires_encryption: true,
      reasoning: 'Critical credential or cryptographic key asset. Direct agent read/write is forbidden.'
    };
  }

  // 2. RESTRICTED
  if (
    combined.includes('customer_database') ||
    combined.includes('pii') ||
    combined.includes('ssn') ||
    combined.includes('user_table') ||
    combined.includes('client_records') ||
    combined.includes('credit_card') ||
    combined.includes('passwords')
  ) {
    return {
      classification: 'RESTRICTED',
      sensitivity_score: 85,
      requires_encryption: true,
      reasoning: 'Restricted dataset containing customer identifiers, records, or PII. Mandatory human sign-off.'
    };
  }

  // 3. CONFIDENTIAL
  if (
    combined.includes('financial') ||
    combined.includes('confidential') ||
    combined.includes('earnings') ||
    combined.includes('salaries') ||
    combined.includes('revenue') ||
    combined.includes('acquisition') ||
    combined.includes('pricing_strategy') ||
    combined.includes('internal_audit')
  ) {
    return {
      classification: 'CONFIDENTIAL',
      sensitivity_score: 60,
      requires_encryption: true,
      reasoning: 'Confidential commercial or financial material. Dissemination strictly governed by policy.'
    };
  }

  // 4. INTERNAL
  if (
    combined.includes('internal') ||
    combined.includes('memo') ||
    combined.includes('notes') ||
    combined.includes('dev_logs') ||
    combined.includes('system_config') ||
    combined.includes('approved_records')
  ) {
    return {
      classification: 'INTERNAL',
      sensitivity_score: 30,
      requires_encryption: false,
      reasoning: 'Internal operational documentation or business artifacts for authorized personnel.'
    };
  }

  // 5. PUBLIC (default)
  return {
    classification: 'PUBLIC',
    sensitivity_score: 5,
    requires_encryption: false,
    reasoning: 'Standard public report, documentation, or non-sensitive computational artifact.'
  };
}
