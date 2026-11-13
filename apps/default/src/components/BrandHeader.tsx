import { Activity, Settings } from 'lucide-react';

import { APP_BRANDING } from '../config/branding';

interface BrandHeaderProps {
  onStatus?: () => void;
  onAdmin?: () => void;
}
export default function BrandHeader({ onStatus, onAdmin }: BrandHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-[60] h-16 border-b border-line bg-deep-space/88 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <img
            src={APP_BRANDING.compactWordmark}
            alt={APP_BRANDING.creator}
            className="h-auto w-24 shrink-0 sm:hidden"
          />
          <img
            src={APP_BRANDING.wordmark}
            alt={APP_BRANDING.creator}
            className="hidden h-auto w-36 shrink-0 sm:block"
          />
          <span className="hidden h-7 w-px bg-line sm:block" aria-hidden="true" />
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted sm:text-xs">
            {APP_BRANDING.productName}
          </span>
        </div>

        {(onStatus || onAdmin) && (
          <nav className="flex items-center gap-2" aria-label="Application tools">
            {onStatus && (
              <button
                type="button"
                onClick={onStatus}
                className="flex h-11 w-11 items-center justify-center rounded-md border border-line-strong bg-panel text-cyan-glow transition duration-fast hover:border-cyan hover:shadow-glow-cyan"
                title="System status"
                aria-label="Open system status"
              >
                <Activity className="h-5 w-5" />
              </button>
            )}
            {onAdmin && (
              <button
                type="button"
                onClick={onAdmin}
                className="flex h-11 w-11 items-center justify-center rounded-md border border-line-strong bg-panel text-pink-glow transition duration-fast hover:border-pink hover:shadow-glow-pink"
                title="Local settings and records"
                aria-label="Open local settings and records"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
