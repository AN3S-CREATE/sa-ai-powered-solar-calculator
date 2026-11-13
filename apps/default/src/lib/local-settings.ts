export interface LocalOperatorProfile {
  id: string;
  name: string;
  email: string;
}
export interface LocalSettings {
  llmBaseUrl: string;
  llmModel: string;
  allowExternalEgress: boolean;
  multiProfileEnabled: boolean;
  operator: LocalOperatorProfile;
  secrets: Record<string, string>;
}

const SETTINGS_KEY = 'genesis:local:settings';

export const DEFAULT_LOCAL_SETTINGS: LocalSettings = {
  llmBaseUrl: 'http://localhost:11434/v1',
  llmModel: 'llama3.2',
  allowExternalEgress: false,
  multiProfileEnabled: false,
  operator: {
    id: 'local-operator',
    name: 'Local Operator',
    email: 'operator@localhost',
  },
  secrets: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasBlockedKey(value: Record<string, unknown>): boolean {
  return Object.keys(value).some((key) =>
    ['__proto__', 'constructor', 'prototype'].includes(key),
  );
}

function sanitizeSecrets(value: unknown): Record<string, string> {
  if (!isRecord(value) || hasBlockedKey(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key, secret]) =>
          /^[A-Za-z][A-Za-z0-9_]*$/.test(key) && typeof secret === 'string',
      )
      .map(([key, secret]) => [key.toUpperCase(), secret as string]),
  );
}

function sanitizeSettings(value: unknown): LocalSettings {
  if (!isRecord(value) || hasBlockedKey(value)) return structuredClone(DEFAULT_LOCAL_SETTINGS);
  const operator = isRecord(value.operator) && !hasBlockedKey(value.operator)
    ? value.operator
    : {};
  return {
    llmBaseUrl:
      typeof value.llmBaseUrl === 'string' && value.llmBaseUrl.trim()
        ? value.llmBaseUrl.trim().replace(/\/$/, '')
        : DEFAULT_LOCAL_SETTINGS.llmBaseUrl,
    llmModel:
      typeof value.llmModel === 'string' && value.llmModel.trim()
        ? value.llmModel.trim()
        : DEFAULT_LOCAL_SETTINGS.llmModel,
    allowExternalEgress: value.allowExternalEgress === true,
    multiProfileEnabled: value.multiProfileEnabled === true,
    operator: {
      id:
        typeof operator.id === 'string' && operator.id.trim()
          ? operator.id.trim()
          : DEFAULT_LOCAL_SETTINGS.operator.id,
      name:
        typeof operator.name === 'string' && operator.name.trim()
          ? operator.name.trim()
          : DEFAULT_LOCAL_SETTINGS.operator.name,
      email:
        typeof operator.email === 'string' && operator.email.trim()
          ? operator.email.trim()
          : DEFAULT_LOCAL_SETTINGS.operator.email,
    },
    secrets: sanitizeSecrets(value.secrets),
  };
}

export function getLocalSettings(): LocalSettings {
  if (typeof window === 'undefined') return structuredClone(DEFAULT_LOCAL_SETTINGS);
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    return stored ? sanitizeSettings(JSON.parse(stored)) : structuredClone(DEFAULT_LOCAL_SETTINGS);
  } catch {
    return structuredClone(DEFAULT_LOCAL_SETTINGS);
  }
}

export function saveLocalSettings(next: LocalSettings): LocalSettings {
  const sanitized = sanitizeSettings(next);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(
      new CustomEvent('genesis-settings-updated', { detail: sanitized }),
    );
  }
  return sanitized;
}

export function updateLocalSettings(
  update: Partial<LocalSettings>,
): LocalSettings {
  const current = getLocalSettings();
  return saveLocalSettings({
    ...current,
    ...update,
    operator: update.operator ?? current.operator,
    secrets: update.secrets ?? current.secrets,
  });
}

export function getLocalSecret(alias: string): string | undefined {
  const normalized = alias.replace(/^VITE_SECRET_/i, '').toUpperCase();
  const environmentValue = import.meta.env[`VITE_SECRET_${normalized}`];
  if (typeof environmentValue === 'string' && environmentValue) return environmentValue;
  return getLocalSettings().secrets[normalized];
}
