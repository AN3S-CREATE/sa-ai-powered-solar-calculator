import { createNode } from '../genesis-data/client';
import {
  runLocalAutomation,
  triggerLocalAutomations,
  type LocalFlowResult,
} from '../local-automations';

type JsonRecord = Record<string, unknown>;

function assertRecord(value: unknown, label: string): asserts value is JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  for (const [key, child] of Object.entries(value)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      throw new TypeError(`${label} contains a blocked key.`);
    }
    if (typeof child === 'object' && child !== null) assertRecordOrArray(child, `${label}.${key}`);
  }
}

function assertRecordOrArray(value: object, label: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) assertRecordOrArray(item, `${label}[${index}]`);
    });
    return;
  }
  assertRecord(value, label);
}

export async function runFlow(
  flowId: string,
  input: JsonRecord = {},
): Promise<LocalFlowResult> {
  assertRecord(input, 'flow input');
  return runLocalAutomation(flowId, input);
}

export async function submitForm(
  projectId: string,
  fields: JsonRecord,
): Promise<{ nodeId: string; flows: LocalFlowResult[] }> {
  assertRecord(fields, 'form fields');
  const node = await createNode(projectId, fields);
  const flows = await triggerLocalAutomations('submitForm', { projectId, node });
  return { nodeId: node.id, flows };
}

export async function notifyCustomAttributeUpdated(
  projectId: string,
  input: JsonRecord,
): Promise<LocalFlowResult[]> {
  assertRecord(input, 'attribute update');
  return triggerLocalAutomations('task.custom_attribute_updated', {
    projectId,
    input,
  });
}

export const genesisFlows = { runFlow, submitForm, notifyCustomAttributeUpdated };
