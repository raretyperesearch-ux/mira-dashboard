'use client';
import { useState } from 'react';

export default function ThoughtFeed({ thoughts }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display font-700 text-2xl tracking-tight">Mind</h2>
          <p className="text-[11px] text-dim uppercase tracking-[0.12em] mt-1">
            Live thought feed — watch Mira think
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
          <span className="text-[10px] text-dim uppercase tracking-[0.12em]">
            {thoughts.length > 0 ? `Cycle ${thoughts[0].cycle_number}` : 'Waiting...'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {thoughts.map(t => (
          <ThoughtCard
            key={t.id}
            thought={t}
            isExpanded={expanded === t.id}
            onToggle={() => setExpanded(expanded === t.id ? null : t.id)}
          />
        ))}
      </div>

      {thoughts.length === 0 && (
        <div className="text-center py-20">
          <h3 className="font-serif italic text-xl text-muted">No thoughts yet</h3>
          <p className="text-sm text-dim mt-3">When Mira starts thinking, her inner monologue will stream here.</p>
        </div>
      )}
    </section>
  );
}

function ThoughtCard({ thought: t, isExpanded, onToggle }) {
  const pull = t.max_pull || 0;
  const pullWidth = `${Math.min(pull * 10, 100)}%`;
  const signals = t.curiosity_signals || [];
  const monologue = t.inner_monologue || '';
  const preview = monologue.slice(0, 200);
  const hasMore = monologue.length > 200;
  const time = new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      className={`bg-surface border transition-all duration-200 cursor-pointer ${
        pull >= 7 ? 'border-gold/40 glow-gold' : 'border-border hover:border-border-bright'
      }`}
      onClick={onToggle}
    >
      {/* Pull bar */}
      <div className="h-[3px] bg-surface-2">
        <div className="pull-bar" style={{ width: pullWidth }} />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-dim">#{t.cycle_number}</span>
            <span className="text-[10px] text-dim">{date} {time}</span>
            {pull >= 7 && (
              <span className="text-[10px] text-gold uppercase tracking-[0.12em]">⚡ high pull</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-dim">
            <span>pull: {pull.toFixed(1)}</span>
            {t.cost_usd && <span>${Number(t.cost_usd).toFixed(4)}</span>}
            {t.duration_ms && <span>{(t.duration_ms / 1000).toFixed(1)}s</span>}
          </div>
        </div>

        {/* Monologue */}
        <p className="font-serif text-sm text-white/70 leading-relaxed">
          {isExpanded ? monologue : preview}
          {hasMore && !isExpanded && <span className="text-dim">...</span>}
        </p>

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {t.search_query && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.12em] text-cyan">🔍 Search:</span>
                <span className="text-xs text-muted">{t.search_query}</span>
              </div>
            )}

            {t.identity_reflection && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.12em] text-gold block mb-1">🪞 Reflection:</span>
                <p className="text-xs text-muted leading-relaxed">{t.identity_reflection.slice(0, 300)}</p>
              </div>
            )}

            {signals.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.12em] text-dim block mb-2">Curiosity Signals:</span>
                <div className="space-y-1">
                  {signals.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-gold font-mono w-6 text-right">{s.pull || '?'}</span>
                      <span className="text-muted">{s.topic || s.note || JSON.stringify(s).slice(0, 80)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {t.post_draft && (
              <div className="bg-surface-2 border border-border p-3 mt-3">
                <span className="text-[10px] uppercase tracking-[0.12em] text-dim block mb-1">📝 Post Draft:</span>
                <p className="font-serif text-xs text-muted italic">{t.post_draft}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
