import { getLocalSettings } from './local-settings';

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function normalizedHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[/, '').replace(/\]$/, '');
}

export function isLoopbackUrl(value: string | URL): boolean {
  try {
    const url = value instanceof URL ? value : new URL(value, window.location.href);
    return LOOPBACK_HOSTS.has(normalizedHost(url.hostname));
  } catch {
    return false;
  }
}

export function assertEgressAllowed(value: string | URL): URL {
  const url = value instanceof URL ? value : new URL(value, window.location.href);
  if (isLoopbackUrl(url)) return url;
  if (getLocalSettings().allowExternalEgress) return url;
  throw new Error(
    `External network access is blocked in standalone mode (${url.hostname}). Enable egress explicitly in Local Settings to continue.`,
  );
}

export async function boundedFetch(
  input: string | URL,
  init: RequestInit = {},
): Promise<Response> {
  const url = assertEgressAllowed(input);
  const signal = init.signal ?? AbortSignal.timeout(15_000);
  return fetch(url, { ...init, signal });
}
