import * as React from 'react';
import {
  Database,
  Download,
  KeyRound,
  Loader2,
  Play,
  RotateCcw,
  Settings,
  Upload,
  X,
} from 'lucide-react';

import {
  getWorkspaceSnapshot,
  importWorkspace,
  resetToFactorySeed,
} from '../lib/genesis-data/client';
import { listLocalAutomations, runLocalAutomation } from '../lib/local-automations';
import {
  getLocalSettings,
  saveLocalSettings,
  type LocalSettings,
} from '../lib/local-settings';

export default function StandaloneControlPanel() {
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<LocalSettings>(() => getLocalSettings());
  const [status, setStatus] = React.useState('');
  const [busyFlow, setBusyFlow] = React.useState('');
  const [resetArmed, setResetArmed] = React.useState(false);
  const [secretAlias, setSecretAlias] = React.useState('');
  const [secretValue, setSecretValue] = React.useState('');
  const importInput = React.useRef<HTMLInputElement>(null);
  const flows = React.useMemo(() => listLocalAutomations(), []);

  const save = () => {
    try {
      const parsed = new URL(settings.llmBaseUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Use an HTTP(S) URL.');
      const next = saveLocalSettings(settings);
      setSettings(next);
      setStatus('Local settings saved.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  };

  const exportWorkspace = () => {
    const blob = new Blob([JSON.stringify(getWorkspaceSnapshot(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `solar-calculator-local-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('Workspace JSON exported locally.');
  };

  const handleImport = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      await importWorkspace(parsed);
      setStatus('Workspace JSON imported and persisted locally.');
    } catch (error) {
      setStatus(`Import rejected: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (importInput.current) importInput.current.value = '';
    }
  };

  const handleReset = async () => {
    if (!resetArmed) {
      setResetArmed(true);
      setStatus('Click Reset again to confirm factory seed restoration.');
      return;
    }
    await resetToFactorySeed();
    setResetArmed(false);
    setStatus('Factory seed restored. Local changes were replaced.');
  };

  const storeSecret = () => {
    const alias = secretAlias.trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9_]*$/.test(alias) || !secretValue) {
      setStatus('Enter a valid secret alias and value.');
      return;
    }
    const next = saveLocalSettings({
      ...settings,
      secrets: { ...settings.secrets, [alias]: secretValue },
    });
    setSettings(next);
    setSecretAlias('');
    setSecretValue('');
    setStatus(`Secret alias ${alias} stored locally.`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-cyan/60 bg-deep-space text-cyan-glow shadow-glow-cyan transition duration-fast hover:bg-nebula"
        aria-label="Open local standalone settings"
        title="Local Standalone Settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/60" role="dialog" aria-modal="true" aria-label="Local Standalone Control Panel">
          <button
            type="button"
            className="flex-1 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close settings"
          />
          <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-cyan/40 bg-deep-space p-6 shadow-glow-blue">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="an3s-eyebrow mb-3">Standalone mode</div>
                <h2 className="text-2xl font-extrabold text-ink">Local control panel</h2>
                <p className="mt-1 text-sm text-ink-muted">Offline storage, local AI, flows, and data lifecycle.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-ink-muted hover:bg-cyan/10 hover:text-cyan-glow"
                aria-label="Close control panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <section className="space-y-4 border-b border-line pb-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-glow">Local AI</h3>
              <label className="block text-sm text-ink-muted">
                Local OpenAI-compatible URL
                <input
                  value={settings.llmBaseUrl}
                  onChange={(event) => setSettings((current) => ({ ...current, llmBaseUrl: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-line-strong bg-panel px-3 py-2 text-ink outline-none focus:border-cyan"
                />
              </label>
              <label className="block text-sm text-ink-muted">
                Model ID
                <input
                  value={settings.llmModel}
                  onChange={(event) => setSettings((current) => ({ ...current, llmModel: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-line-strong bg-panel px-3 py-2 text-ink outline-none focus:border-cyan"
                />
              </label>
              <label className="flex items-start gap-3 text-sm text-ink-muted">
                <input
                  type="checkbox"
                  checked={settings.allowExternalEgress}
                  onChange={(event) => setSettings((current) => ({ ...current, allowExternalEgress: event.target.checked }))}
                  className="mt-1"
                />
                <span>
                  Allow external egress. Disabled by default; localhost and 127.0.0.1 remain available for Ollama or LM Studio.
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-ink-muted">
                <input
                  type="checkbox"
                  checked={settings.multiProfileEnabled}
                  onChange={(event) => setSettings((current) => ({ ...current, multiProfileEnabled: event.target.checked }))}
                  className="mt-1"
                />
                <span>Enable local multi-profile switching. Single-operator mode is the default.</span>
              </label>
              <button type="button" onClick={save} className="an3s-action-primary px-4 py-2">
                Save local settings
              </button>
            </section>

            <section className="space-y-4 border-b border-line py-6">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-pink-glow" />
                <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-pink-glow">Local secret vault</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={secretAlias}
                  onChange={(event) => setSecretAlias(event.target.value)}
                  placeholder="Alias, e.g. LOCAL_API"
                  className="rounded-md border border-line-strong bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-cyan"
                />
                <input
                  type="password"
                  value={secretValue}
                  onChange={(event) => setSecretValue(event.target.value)}
                  placeholder="Secret value"
                  className="rounded-md border border-line-strong bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-cyan"
                />
              </div>
              <button type="button" onClick={storeSecret} className="an3s-action-secondary px-4 py-2">
                Store alias locally
              </button>
              <p className="text-xs text-ink-muted">Secret values stay in this browser profile and are never written to logs or exported seed files.</p>
            </section>

            <section className="space-y-4 border-b border-line py-6">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-glow" />
                <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-glow">Workspace data</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <button type="button" onClick={exportWorkspace} className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/5">
                  <Download className="h-4 w-4" /> Export JSON
                </button>
                <button type="button" onClick={() => importInput.current?.click()} className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/5">
                  <Upload className="h-4 w-4" /> Import JSON
                </button>
                <button type="button" onClick={() => void handleReset()} className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${resetArmed ? 'border-danger bg-danger/10 text-danger' : 'border-line-strong text-ink hover:border-cyan hover:text-cyan-glow'}`}>
                  <RotateCcw className="h-4 w-4" /> {resetArmed ? 'Confirm reset' : 'Reset seed'}
                </button>
              </div>
              <input
                ref={importInput}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleImport(file);
                }}
              />
              <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-5 text-amber-100">
                POPIA notice: exported customer and energy records remain on this workstation. Apply data-minimisation, controlled access, and an appropriate local retention period when handling South African personal information.
              </p>
            </section>

            <section className="space-y-3 py-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-glow">Manual local flows</h3>
              {flows.map((flow) => {
                const title = typeof flow.flowTitle === 'string' ? flow.flowTitle : flow.id;
                return (
                  <button
                    type="button"
                    key={flow.id}
                    disabled={busyFlow === flow.id}
                    onClick={async () => {
                      setBusyFlow(flow.id);
                      try {
                        const result = await runLocalAutomation(flow.id, {});
                        setStatus(`${title}: ${result.status}.`);
                      } catch (error) {
                        setStatus(`${title}: ${error instanceof Error ? error.message : String(error)}`);
                      } finally {
                        setBusyFlow('');
                      }
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-line bg-panel px-4 py-3 text-left text-sm text-ink transition duration-fast hover:border-cyan/60 disabled:opacity-50"
                  >
                    <span>{title}</span>
                    {busyFlow === flow.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 text-cyan-glow" />}
                  </button>
                );
              })}
            </section>

            {status && <div className="sticky bottom-0 rounded-md border border-cyan/30 bg-panel p-3 text-sm text-ink-muted">{status}</div>}
          </aside>
        </div>
      )}
    </>
  );
}
