import { boundedFetch } from './network-policy';
import { getLocalSecret } from './local-settings';

type JsonRecord = Record<string, unknown>;
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export interface ProxyRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

function resolveSecretsInString(value: string): string {
  return value.replace(/\{\{\s*secret(?:\.([A-Za-z][A-Za-z0-9_]*))?\s*\}\}/g, (_, alias?: string) => {
    if (!alias) throw new Error('Secret placeholder must include an alias.');
    const resolved = getLocalSecret(alias);
    if (!resolved) throw new Error(`Local secret alias ${alias} is not configured.`);
    return resolved;
  });
}

function assertSafeValue(value: unknown, label: string): void {
  if (Array.isArray(value)) {
    value.forEach((child, index) => assertSafeValue(child, `${label}[${index}]`));
    return;
  }
  if (typeof value !== 'object' || value === null) return;
  for (const [key, child] of Object.entries(value as JsonRecord)) {
    if (BLOCKED_KEYS.has(key)) throw new TypeError(`${label} contains a blocked key.`);
    assertSafeValue(child, `${label}.${key}`);
  }
}

function resolveSecrets(value: unknown): unknown {
  if (typeof value === 'string') return resolveSecretsInString(value);
  if (Array.isArray(value)) return value.map(resolveSecrets);
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value as JsonRecord).map(([key, child]) => [key, resolveSecrets(child)]),
    );
  }
  return value;
}

export class GenesisClient {
  static async proxy<T = unknown>(request: ProxyRequest): Promise<T> {
    if (!request || typeof request.url !== 'string' || !request.url.trim()) {
      throw new TypeError('GenesisClient.proxy requires a URL.');
    }
    assertSafeValue(request, 'proxy request');
    const headers = resolveSecrets(request.headers ?? {}) as Record<string, string>;
    const body = resolveSecrets(request.body);
    const response = await boundedFetch(resolveSecretsInString(request.url), {
      method: request.method ?? (body === undefined ? 'GET' : 'POST'),
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      ...(body === undefined
        ? {}
        : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Local proxy request failed with status ${response.status}.`);
    const contentType = response.headers.get('content-type') ?? '';
    return (contentType.includes('application/json')
      ? await response.json()
      : await response.text()) as T;
  }
}

export const genesisClient = new GenesisClient();
export default GenesisClient;
