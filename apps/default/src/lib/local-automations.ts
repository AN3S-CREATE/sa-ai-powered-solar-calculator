import automationsJson from '../data/automations.json';
import { createNode, type LocalNode } from './genesis-data/client';

type JsonRecord = Record<string, unknown>;

export interface LocalFlowResult {
  flowId: string;
  title: string;
  status: 'completed' | 'partial' | 'skipped' | 'failed';
  outputs: Array<{
    action: string;
    status: 'completed' | 'skipped' | 'failed';
    message: string;
    data?: unknown;
  }>;
}
interface LocalAutomation extends JsonRecord {
  id: string;
  flowTitle?: string;
  trigger?: JsonRecord;
  actions?: unknown[];
}

const automations = automationsJson as LocalAutomation[];
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateInput(value: unknown, path = 'input'): void {
  if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (BLOCKED_KEYS.has(key)) throw new TypeError(`${path} contains a blocked key.`);
      validateInput(child, `${path}.${key}`);
    }
  } else if (Array.isArray(value)) {
    value.forEach((child, index) => validateInput(child, `${path}[${index}]`));
  }
}

function resolveTemplate(value: unknown, input: JsonRecord): unknown {
  if (typeof value === 'string') {
    return value.replace(/\{\{\s*trigger\["([^"]+)"\]\s*\}\}/g, (_, key: string) =>
      String(input[key] ?? ''),
    );
  }
  if (Array.isArray(value)) return value.map((item) => resolveTemplate(item, input));
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, resolveTemplate(child, input)]),
    );
  }
  return value;
}

function actionName(action: JsonRecord): string {
  const settings = isRecord(action.settings) ? action.settings : {};
  return typeof settings.actionName === 'string' ? settings.actionName : 'unknown';
}

function actionInput(action: JsonRecord, input: JsonRecord): JsonRecord {
  const settings = isRecord(action.settings) ? action.settings : {};
  const rawInput = isRecord(settings.input) ? settings.input : {};
  const resolved = resolveTemplate(rawInput, input);
  return isRecord(resolved) ? resolved : {};
}

async function executeAction(action: JsonRecord, input: JsonRecord) {
  const name = actionName(action);
  const resolved = actionInput(action, input);

  if (name === 'task.create') {
    const projectInput = resolved.projectId;
    const projectId =
      isRecord(projectInput) && typeof projectInput.id === 'string'
        ? projectInput.id
        : typeof projectInput === 'string'
          ? projectInput
          : '';
    if (!projectId) throw new Error('task.create action has no projectId.');
    const content = typeof resolved.content === 'string' ? resolved.content : 'Local automation task';
    const node = await createNode(projectId, { Name: content, Title: content });
    return {
      action: name,
      status: 'completed' as const,
      message: `Created a local task in ${projectId}.`,
      data: node,
    };
  }

  if (name === 'ai.ask' || name === 'ai.generate') {
    const totalCost = Number(input.totalCost ?? 0);
    const systemSize = Number(input.systemSize ?? 0);
    const costPerKwp = systemSize > 0 ? Math.round(totalCost / systemSize) : 0;
    return {
      action: name,
      status: 'completed' as const,
      message: 'Completed with the deterministic offline calculator.',
      data: {
        summary:
          totalCost > 0 && systemSize > 0
            ? `System cost is R${totalCost.toLocaleString('en-ZA')} at approximately R${costPerKwp.toLocaleString('en-ZA')} per kWp.`
            : 'Offline action completed. Supply systemSize and totalCost for a pricing ratio.',
      },
    };
  }

  if (name === 'web.search' || name === 'agent.add_knowledge.v2') {
    return {
      action: name,
      status: 'skipped' as const,
      message: `${name} requires cloud egress and was safely skipped in offline mode.`,
    };
  }

  return {
    action: name,
    status: 'skipped' as const,
    message: `Unsupported local action ${name} was isolated and skipped.`,
  };
}

export function listLocalAutomations(): LocalAutomation[] {
  return structuredClone(automations);
}

export async function runLocalAutomation(
  flowId: string,
  input: JsonRecord = {},
): Promise<LocalFlowResult> {
  if (typeof flowId !== 'string' || !flowId.trim()) {
    throw new TypeError('flowId must be a non-empty string.');
  }
  validateInput(input);
  const flow = automations.find((candidate) => candidate.id === flowId);
  if (!flow) throw new Error(`Flow ${flowId} was not found.`);
  const outputs: LocalFlowResult['outputs'] = [];
  const actions = Array.isArray(flow.actions) ? flow.actions : [];

  for (const candidate of actions) {
    if (!isRecord(candidate)) continue;
    try {
      outputs.push(await executeAction(candidate, input));
    } catch (error) {
      outputs.push({
        action: actionName(candidate),
        status: 'failed',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const failed = outputs.some((output) => output.status === 'failed');
  const skipped = outputs.some((output) => output.status === 'skipped');
  const status: LocalFlowResult['status'] = failed
    ? 'failed'
    : actions.length === 0
      ? 'skipped'
      : skipped
        ? 'partial'
        : 'completed';
  const result = {
    flowId: flow.id,
    title: typeof flow.flowTitle === 'string' ? flow.flowTitle : flow.id,
    status,
    outputs,
  } satisfies LocalFlowResult;
  console.info('[RUNTIME:FLOW] Local flow completed.', {
    flowId: result.flowId,
    status: result.status,
  });
  return result;
}

export async function triggerLocalAutomations(
  event: 'submitForm' | 'task.custom_attribute_updated' | 'manual',
  payload: { projectId?: string; node?: LocalNode; flowId?: string; input?: JsonRecord },
): Promise<LocalFlowResult[]> {
  validateInput(payload);
  if (event === 'manual' && payload.flowId) {
    return [await runLocalAutomation(payload.flowId, payload.input ?? {})];
  }

  const matching = automations.filter((flow) => {
    const trigger = isRecord(flow.trigger) ? flow.trigger : {};
    const type = typeof trigger.type === 'string' ? trigger.type : '';
    const settings = isRecord(trigger.settings) ? trigger.settings : {};
    const triggerName = typeof settings.triggerName === 'string' ? settings.triggerName : '';
    return (
      (event === 'submitForm' && (type === 'FORM' || triggerName === 'submitForm')) ||
      (event === 'task.custom_attribute_updated' && triggerName === event)
    );
  });
  return Promise.all(matching.map((flow) => runLocalAutomation(flow.id, payload)));
}
