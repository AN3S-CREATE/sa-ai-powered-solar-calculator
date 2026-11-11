import seedJson from '../../data/seed.json';

export interface FieldSchema {
  type: string;
  displayName?: string;
  title?: string;
  rank?: number;
  options?: Record<string, { id: string; name: string; color?: string }>;
}

export interface LocalNode {
  id: string;
  parentId: null;
  content: string;
  fieldValues: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceState {
  spaceId: string;
  generatedAt: string;
  schemas: Record<string, Record<string, FieldSchema>>;
  projects: Record<string, LocalNode[]>;
}

type FieldInput = Record<string, unknown>;

const factorySeed = seedJson as WorkspaceState;
const DATABASE_NAME = `genesis:idb:${factorySeed.spaceId}`;
const LOCAL_STORAGE_KEY = `genesis:local:db:${factorySeed.spaceId}`;
const DATABASE_VERSION = 1;
const STORE_NAME = 'workspace';
const STATE_KEY = 'state';
const LOCAL_STORAGE_LIMIT = 4_000_000;
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

let cache: WorkspaceState = structuredClone(factorySeed);
let persistenceQueue = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertSafeRecord(value: unknown, label: string): asserts value is FieldInput {
  if (!isRecord(value)) throw new TypeError(`${label} must be an object.`);
  for (const [key, child] of Object.entries(value)) {
    if (BLOCKED_KEYS.has(key)) throw new TypeError(`${label} contains a blocked key.`);
    if (isRecord(child)) assertSafeRecord(child, `${label}.${key}`);
    if (Array.isArray(child)) {
      child.forEach((item, index) => {
        if (isRecord(item)) assertSafeRecord(item, `${label}.${key}[${index}]`);
      });
    }
  }
}

function assertProjectId(projectId: unknown): asserts projectId is string {
  if (typeof projectId !== 'string' || !projectId.trim()) {
    throw new TypeError('projectId must be a non-empty string.');
  }
}

function serializeFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(serializeFieldValue).join(', ');
  assertSafeRecord(value, 'field value');
  return JSON.stringify(value);
}

function resolveFieldId(
  projectId: string,
  inputKey: string,
): { fieldId?: string; displayKey?: string } {
  const schema = cache.schemas[projectId] ?? {};
  const candidate = inputKey.startsWith('/attributes/')
    ? inputKey.slice('/attributes/'.length)
    : inputKey;
  if (schema[candidate]) {
    const field = schema[candidate];
    return { fieldId: candidate, displayKey: field.displayName || field.title };
  }
  const matching = Object.entries(schema)
    .map(([fieldId, field], index) => ({ fieldId, field, index }))
    .filter(({ field }) => field.displayName === inputKey || field.title === inputKey)
    .sort(
      (left, right) =>
        (left.field.rank ?? Number.MAX_SAFE_INTEGER - 10_000 + left.index) -
          (right.field.rank ?? Number.MAX_SAFE_INTEGER - 10_000 + right.index) ||
        left.fieldId.localeCompare(right.fieldId),
    )[0];
  if (matching) {
    return {
      fieldId: matching.fieldId,
      displayKey: matching.field.displayName || matching.field.title,
    };
  }
  return candidate.startsWith('@') ? { fieldId: candidate } : {};
}

function ownsDisplayKey(projectId: string, fieldId: string, displayKey: string): boolean {
  return resolveFieldId(projectId, displayKey).fieldId === fieldId;
}

function mirrorFields(projectId: string, input: FieldInput): Record<string, string> {
  assertSafeRecord(input, 'fields');
  const output: Record<string, string> = {};
  for (const [key, rawValue] of Object.entries(input)) {
    if (BLOCKED_KEYS.has(key)) throw new TypeError(`Blocked field key: ${key}`);
    const value = serializeFieldValue(rawValue);
    const { fieldId, displayKey } = resolveFieldId(projectId, key);
    if (fieldId) {
      output[fieldId] = value;
      output[`/attributes/${fieldId}`] = value;
      if (displayKey && ownsDisplayKey(projectId, fieldId, displayKey)) {
        output[displayKey] = value;
      }
    } else {
      output[key] = value;
    }
  }
  return output;
}

function isWorkspaceState(value: unknown): value is WorkspaceState {
  try {
    if (!isRecord(value) || value.spaceId !== factorySeed.spaceId) return false;
    if (typeof value.generatedAt !== 'string') return false;
    if (!isRecord(value.projects) || !isRecord(value.schemas)) return false;
    assertSafeRecord(value, 'workspace import');
    return Object.values(value.projects).every(
      (rows) =>
        Array.isArray(rows) &&
        rows.every(
          (row) =>
            isRecord(row) &&
            typeof row.id === 'string' &&
            row.parentId === null &&
            typeof row.content === 'string' &&
            isRecord(row.fieldValues) &&
            Object.values(row.fieldValues).every((field) => typeof field === 'string'),
        ),
    );
  } catch {
    return false;
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable.'));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed.'));
  });
}

async function readIndexedState(): Promise<WorkspaceState | null> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(STATE_KEY);
      request.onsuccess = () => resolve(isWorkspaceState(request.result) ? request.result : null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

async function writeIndexedState(state: WorkspaceState): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(state, STATE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

function readLocalState(): WorkspaceState | null {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    return isWorkspaceState(parsed) ? parsed : null;
  } catch (error) {
    console.warn('[RUNTIME:DATA] localStorage hydration failed.', error);
    return null;
  }
}

async function persistState(): Promise<void> {
  const snapshot = structuredClone(cache);
  try {
    await writeIndexedState(snapshot);
  } catch (error) {
    console.warn('[RUNTIME:DATA] IndexedDB persistence failed; using localStorage fallback.', error);
  }

  const serialized = JSON.stringify(snapshot);
  if (serialized.length > LOCAL_STORAGE_LIMIT) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    console.info('[RUNTIME:DATA] State exceeds localStorage limit; retained in IndexedDB only.');
    return;
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('[RUNTIME:DATA] localStorage quota unavailable; retained in IndexedDB only.', error);
  }
}

function queuePersistence(): Promise<void> {
  persistenceQueue = persistenceQueue.then(persistState, persistState);
  return persistenceQueue;
}

function announce(projectId: string) {
  window.dispatchEvent(
    new CustomEvent('genesis-data-updated', { detail: { projectId } }),
  );
}

async function dispatchAutomation(
  event: 'task.custom_attribute_updated',
  projectId: string,
  node: LocalNode,
) {
  try {
    const { triggerLocalAutomations } = await import('../local-automations');
    await triggerLocalAutomations(event, { projectId, node });
  } catch (error) {
    console.warn('[RUNTIME:FLOW] Automation dispatch was isolated from the data write.', error);
  }
}

export const dataReady = (async () => {
  let stored: WorkspaceState | null = null;
  try {
    stored = await readIndexedState();
  } catch (error) {
    console.warn('[RUNTIME:DATA] IndexedDB hydration failed.', error);
  }
  stored ??= readLocalState();
  if (stored) cache = stored;
  else await queuePersistence();
  console.info('[RUNTIME:DATA] Local workspace hydrated.', {
    projects: Object.keys(cache.projects).length,
  });
})();

export function getWorkspaceSnapshot(): WorkspaceState {
  return structuredClone(cache);
}

export function getProjectRows(projectId: string): LocalNode[] {
  assertProjectId(projectId);
  return structuredClone(cache.projects[projectId] ?? []);
}

export async function createNode(
  projectId: string,
  fields: FieldInput,
): Promise<LocalNode> {
  await dataReady;
  assertProjectId(projectId);
  assertSafeRecord(fields, 'fields');
  const mirrored = mirrorFields(projectId, fields);
  const now = new Date().toISOString();
  const content = mirrored.Name || mirrored.Title || 'Untitled';
  const node: LocalNode = {
    id: crypto.randomUUID(),
    parentId: null,
    content,
    fieldValues: {
      ...mirrored,
      Name: mirrored.Name || content,
      Title: mirrored.Title || content,
    },
    createdAt: now,
    updatedAt: now,
  };
  cache.projects[projectId] ??= [];
  cache.projects[projectId].push(node);
  await queuePersistence();
  announce(projectId);
  await dispatchAutomation('task.custom_attribute_updated', projectId, node);
  return structuredClone(node);
}

export async function updateNode(
  projectId: string,
  nodeId: string,
  fields: FieldInput,
): Promise<LocalNode> {
  await dataReady;
  assertProjectId(projectId);
  if (typeof nodeId !== 'string' || !nodeId.trim()) {
    throw new TypeError('nodeId must be a non-empty string.');
  }
  assertSafeRecord(fields, 'fields');
  const rows = cache.projects[projectId] ?? [];
  const node = rows.find((candidate) => candidate.id === nodeId);
  if (!node) throw new Error(`Node ${nodeId} was not found in project ${projectId}.`);
  const mirrored = mirrorFields(projectId, fields);
  node.fieldValues = { ...node.fieldValues, ...mirrored };
  node.content = mirrored.Name || mirrored.Title || node.content;
  node.updatedAt = new Date().toISOString();
  await queuePersistence();
  announce(projectId);
  await dispatchAutomation('task.custom_attribute_updated', projectId, node);
  return structuredClone(node);
}

export async function deleteNode(projectId: string, nodeId: string): Promise<boolean> {
  await dataReady;
  assertProjectId(projectId);
  if (typeof nodeId !== 'string' || !nodeId.trim()) {
    throw new TypeError('nodeId must be a non-empty string.');
  }
  const rows = cache.projects[projectId] ?? [];
  const index = rows.findIndex((candidate) => candidate.id === nodeId);
  if (index < 0) return false;
  rows.splice(index, 1);
  await queuePersistence();
  announce(projectId);
  return true;
}

export async function importWorkspace(value: unknown): Promise<void> {
  if (!isWorkspaceState(value)) throw new TypeError('Invalid workspace JSON.');
  cache = structuredClone(value);
  await queuePersistence();
  window.dispatchEvent(new CustomEvent('genesis-data-updated', { detail: { projectId: '*' } }));
}

export async function resetToFactorySeed(): Promise<void> {
  cache = structuredClone(factorySeed);
  await queuePersistence();
  window.dispatchEvent(new CustomEvent('genesis-data-updated', { detail: { projectId: '*' } }));
}
