import React from 'react';
import { Bot, Database, GitBranch, WifiOff } from 'lucide-react';

const stats = [
  { icon: Database, value: '88', label: 'Local workspace records', tone: 'text-pink-glow' },
  { icon: GitBranch, value: '5', label: 'Offline automation flows', tone: 'text-violet-glow' },
  { icon: Bot, value: '2', label: 'Agent response modes', tone: 'text-cyan-glow' },
  { icon: WifiOff, value: '100%', label: 'Core workflow offline', tone: 'text-cyan-glow' },
];

const StatsBar: React.FC = () => (
  <section className="border-y border-line bg-deep-space/68" aria-label="Application capability summary">
    <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`flex min-h-36 flex-col justify-center py-6 text-center ${
            index % 2 === 1 ? 'border-l border-line' : ''
          } ${index >= 2 ? 'border-t border-line md:border-t-0' : ''} ${index > 0 ? 'md:border-l md:border-line' : ''}`}
        >
          <stat.icon className={`mx-auto mb-3 h-5 w-5 ${stat.tone}`} strokeWidth={1.6} />
          <strong className="text-2xl font-extrabold tabular-nums text-ink sm:text-3xl">{stat.value}</strong>
          <span className="mt-1 px-2 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">{stat.label}</span>
        </div>
      ))}
    </div>
  </section>
);

export default StatsBar;
