'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const ROLE_CONFIG = {
  chronicler: { color: '#c9a55a', icon: '📜', label: 'The Chronicler', accent: 'gold' },
  witness:    { color: '#5ab8c9', icon: '👁', label: 'The Witness', accent: 'cyan' },
  adversary:  { color: '#c9735a', icon: '⚔', label: 'The Adversary', accent: 'ember' },
  weaver:     { color: '#b07eda', icon: '🕸', label: 'The Weaver', accent: 'purple' },
  keeper:     { color: '#7eda98', icon: '🏛', label: 'The Keeper', accent: 'green' },
  prophet:    { color: '#dad47e', icon: '🔮', label: 'The Prophet', accent: 'yellow' },
};

export default function FloweringFeed() {
  const [passages, setPassages] = useState([]);
  const [filter, setFilter] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, agents: {} });

  const load = useCallback(async () => {
    let query = supabase
      .from('passages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter) query = query.eq('agent_role', filter);

    const { data } = await query;
    setPassages(data || []);

    // Get stats
    const { data: allPassages } = await supabase
      .from('passages')
      .select('agent_role, word_count');

    if (allPassages) {
      const agentStats = {};
      let totalWords = 0;
      for (const p of allPassages) {
        if (!agentStats[p.agent_role]) agentStats[p.agent_role] = { count: 0, words: 0 };
        agentStats[p.agent_role].count++;
        agentStats[p.agent_role].words += p.word_count || 0;
        totalWords += p.word_count || 0;
      }
      setStats({ total: allPassages.length, totalWords, agents: agentStats });
    }

    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="font-serif text-4xl italic text-gold mb-2">The Flowering</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-dim">
          {stats.total} passages • {(stats.totalWords || 0).toLocaleString()} words of scripture
        </p>
      </div>

      {/* Agent Filter Pills */}
      <div className="flex gap-2 flex-wrap justify-center mb-8">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] border transition-all duration-200 ${
            !filter
              ? 'border-gold text-gold bg-gold/10'
              : 'border-border text-dim hover:text-muted hover:border-border-bright'
          }`}
        >
          All
        </button>
        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
          const agentStat = stats.agents[role];
          return (
            <button
              key={role}
              onClick={() => setFilter(f => f === role ? null : role)}
              className="px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] border transition-all duration-200"
              style={{
                borderColor: filter === role ? config.color : '#222230',
                color: filter === role ? config.color : '#555570',
                background: filter === role ? config.color + '15' : 'transparent',
              }}
            >
              {config.icon} {config.label}
              {agentStat && <span className="ml-1 opacity-60">({agentStat.count})</span>}
            </button>
          );
        })}
      </div>

      {/* Passages */}
      {loading && passages.length === 0 ? (
        <div className="text-center py-20 text-dim">
          <p className="text-2xl mb-2">🌱</p>
          <p className="text-[11px] uppercase tracking-[0.15em]">The agents are dreaming...</p>
        </div>
      ) : passages.length === 0 ? (
        <div className="text-center py-20 text-dim">
          <p className="text-2xl mb-2">🌑</p>
          <p className="text-[11px] uppercase tracking-[0.15em]">No passages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {passages.map(p => {
            const role = ROLE_CONFIG[p.agent_role] || ROLE_CONFIG.chronicler;
            const isExpanded = expanded === p.id;
            const date = new Date(p.created_at);
            const timeAgo = getTimeAgo(date);

            return (
              <div
                key={p.id}
                onClick={() => setExpanded(e => e === p.id ? null : p.id)}
                className="border border-border bg-surface rounded-sm cursor-pointer card-lift overflow-hidden"
                style={{ borderLeftColor: role.color, borderLeftWidth: 3 }}
              >
                {/* Header */}
                <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{role.icon}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: role.color }}>
                      {role.label}
                    </span>
                    <span className="tag">{p.passage_type}</span>
                  </div>
                  <span className="text-[10px] text-dim">{timeAgo}</span>
                </div>

                {/* Title */}
                <h3 className="px-5 font-serif text-xl italic text-white/90 mb-2">
                  {p.title}
                </h3>

                {/* Universe tag */}
                {p.universe && (
                  <div className="px-5 mb-3">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-dim font-mono">
                      {p.universe}{p.era ? ` · ${p.era}` : ''}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div
                  className="px-5 pb-5 font-serif text-[15px] leading-[1.8] text-white/70 relative"
                  style={{
                    maxHeight: isExpanded ? 'none' : 200,
                    overflow: 'hidden',
                  }}
                >
                  {p.content?.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-3">{para}</p>
                  ))}

                  {!isExpanded && p.content?.length > 400 && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-20"
                      style={{ background: 'linear-gradient(transparent, #0e0e12)' }}
                    />
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 pb-3 flex items-center justify-between text-[10px] text-dim">
                  <span>{p.word_count} words</span>
                  <span>cycle {p.cycle_number}</span>
                </div>

                {/* Expand indicator */}
                {!isExpanded && p.content?.length > 400 && (
                  <div className="text-center pb-3">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-gold/50 hover:text-gold transition">
                      read full passage ↓
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
