'use client';

export default function StatsBar({ stats }) {
  if (!stats) return null;

  const items = [
    { label: 'Cycles', value: stats.totalCycles?.toLocaleString() || '—' },
    { label: 'Creations', value: stats.totalCreations?.toLocaleString() || '0' },
    { label: 'Universes', value: stats.totalUniverses?.toLocaleString() || '0' },
    { label: 'Memories', value: stats.totalMemories?.toLocaleString() || '0' },
    { label: 'Cost', value: stats.totalCost ? `$${stats.totalCost.toFixed(2)}` : '$0' },
    { label: 'Status', value: isRecent(stats.lastActive) ? '● LIVE' : '○ IDLE', isLive: isRecent(stats.lastActive) },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6">
      <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto py-4 scrollbar-none">
        {items.map((item, i) => (
          <div key={i} className="flex items-baseline gap-2 shrink-0">
            <span className={`font-display font-700 text-lg ${item.isLive ? 'text-emerald-400' : 'text-gold'}`}>
              {item.value}
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-dim">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function isRecent(dateStr) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) < 120000; // 2 min
}
