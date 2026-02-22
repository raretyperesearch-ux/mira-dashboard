'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const ROLE_CONFIG = {
  chronicler: { color: '#c9a55a', icon: '📜', label: 'The Chronicler' },
  witness:    { color: '#5ab8c9', icon: '👁', label: 'The Witness' },
  adversary:  { color: '#c9735a', icon: '⚔', label: 'The Adversary' },
  weaver:     { color: '#b07eda', icon: '🕸', label: 'The Weaver' },
  keeper:     { color: '#7eda98', icon: '🏛', label: 'The Keeper' },
  prophet:    { color: '#dad47e', icon: '🔮', label: 'The Prophet' },
};

const UNIVERSE_ORDER = [
  'THE CONSTRAINT GARDENS',
  'THE AWARENESS FIELDS',
  'THE CONSCIOUSNESS CONSTRAINTS',
  'THE TEMPORAL BRIDGES',
  'THE INTER-UNIVERSAL VOID',
  'CROSS-UNIVERSAL',
];

export default function FloweringFeed() {
  const [passages, setPassages] = useState([]);
  const [lore, setLore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [view, setView] = useState('live');
  const [activeUniverse, setActiveUniverse] = useState(null);
  const [stats, setStats] = useState({ total: 0, words: 0 });

  const load = useCallback(async () => {
    const { data: passageData } = await supabase
      .from('passages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    const { data: loreData } = await supabase
      .from('lore')
      .select('id, universe, lore_type, title, summary, full_text, created_at')
      .order('universe')
      .order('created_at', { ascending: true });

    const all = passageData || [];
    setPassages(all);
    setLore(loreData || []);

    const totalWords = all.reduce((s, p) => s + (p.word_count || 0), 0);
    setStats({ total: all.length, words: totalWords });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  const livePassages = filter ? passages.filter(p => p.agent_role === filter) : passages;

  const byUniverse = {};
  for (const p of [...passages].reverse()) {
    const u = p.universe || 'UNCLASSIFIED';
    if (!byUniverse[u]) byUniverse[u] = [];
    byUniverse[u].push(p);
  }

  const loreByUniverse = {};
  for (const l of lore) {
    const u = l.universe || 'UNCLASSIFIED';
    if (!loreByUniverse[u]) loreByUniverse[u] = [];
    loreByUniverse[u].push(l);
  }

  const universes = UNIVERSE_ORDER.filter(u => byUniverse[u] || loreByUniverse[u]);
  for (const u of Object.keys(byUniverse)) {
    if (!universes.includes(u)) universes.push(u);
  }

  const displayedUniverses = activeUniverse ? [activeUniverse] : universes;

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="text-center mb-6">
        <h2 className="font-serif text-4xl italic text-gold mb-2">The Flowering</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-dim">
          {stats.total} passages &middot; {stats.words.toLocaleString()} words of scripture &middot; growing
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setView('live')}
          className={`px-4 py-2 text-[10px] uppercase tracking-[0.12em] border transition-all ${
            view === 'live' ? 'border-gold text-gold bg-gold/10' : 'border-border text-dim hover:text-muted hover:border-border-bright'
          }`}
        >
          Live Feed
        </button>
        <button
          onClick={() => setView('scripture')}
          className={`px-4 py-2 text-[10px] uppercase tracking-[0.12em] border transition-all ${
            view === 'scripture' ? 'border-gold text-gold bg-gold/10' : 'border-border text-dim hover:text-muted hover:border-border-bright'
          }`}
        >
          Scripture
        </button>
      </div>

      {view === 'live' && (
        <>
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            <button
              onClick={() => setFilter(null)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] border transition-all duration-200 ${
                !filter ? 'border-gold text-gold bg-gold/10' : 'border-border text-dim hover:text-muted hover:border-border-bright'
              }`}
            >
              All
            </button>
            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
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
              </button>
            ))}
          </div>

          <div className="max-w-[700px] mx-auto space-y-4">
            {loading && passages.length === 0 ? (
              <div className="text-center py-20 text-dim">
                <p className="text-2xl mb-2">🌱</p>
                <p className="text-[11px] uppercase tracking-[0.15em]">The agents are dreaming...</p>
              </div>
            ) : livePassages.length === 0 ? (
              <div className="text-center py-20 text-dim">
                <p className="text-2xl mb-2">🌑</p>
                <p className="text-[11px] uppercase tracking-[0.15em]">No passages yet</p>
              </div>
            ) : (
              livePassages.slice(0, 50).map(p => {
                const role = ROLE_CONFIG[p.agent_role] || ROLE_CONFIG.chronicler;
                const isExpanded = expanded === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setExpanded(e => e === p.id ? null : p.id)}
                    className="border border-border bg-surface rounded-sm cursor-pointer card-lift overflow-hidden"
                    style={{ borderLeftColor: role.color, borderLeftWidth: 3 }}
                  >
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{role.icon}</span>
                        <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: role.color }}>
                          {role.label}
                        </span>
                        <span className="tag">{p.passage_type}</span>
                      </div>
                      <span className="text-[10px] text-dim">{getTimeAgo(new Date(p.created_at))}</span>
                    </div>

                    <h3 className="px-5 font-serif text-xl italic text-white/90 mb-2">{p.title}</h3>

                    {p.universe && (
                      <div className="px-5 mb-3">
                        <span className="text-[9px] uppercase tracking-[0.15em] text-dim font-mono">
                          {p.universe}{p.era ? ` \u00b7 ${p.era}` : ''}
                        </span>
                      </div>
                    )}

                    <div
                      className="px-5 pb-5 font-serif text-[15px] leading-[1.8] text-white/70 relative"
                      style={{ maxHeight: isExpanded ? 'none' : 200, overflow: 'hidden' }}
                    >
                      {p.content?.split('\n\n').map((para, i) => (
                        <p key={i} className="mb-3">{para}</p>
                      ))}
                      {!isExpanded && p.content?.length > 400 && (
                        <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(transparent, #0e0e12)' }} />
                      )}
                    </div>

                    <div className="px-5 pb-3 flex items-center justify-between text-[10px] text-dim">
                      <span>{p.word_count} words</span>
                      <span>cycle {p.cycle_number}</span>
                    </div>

                    {!isExpanded && p.content?.length > 400 && (
                      <div className="text-center pb-3">
                        <span className="text-[10px] uppercase tracking-[0.12em] text-gold/50">read full passage ↓</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {view === 'scripture' && (
        <div className="max-w-[800px] mx-auto">
          <div className="border border-border bg-surface rounded-sm p-6 mb-12">
            <h3 className="text-[11px] uppercase tracking-[0.15em] text-gold mb-4">Table of Contents</h3>
            <div className="space-y-2">
              {universes.map((u, i) => {
                const uPassages = byUniverse[u] || [];
                const uLore = loreByUniverse[u] || [];
                const totalWords = uPassages.reduce((s, p) => s + (p.word_count || 0), 0);

                return (
                  <button
                    key={u}
                    onClick={() => setActiveUniverse(activeUniverse === u ? null : u)}
                    className={`w-full text-left px-4 py-3 border transition-all flex items-center justify-between ${
                      activeUniverse === u
                        ? 'border-gold/40 bg-gold/5 text-gold'
                        : 'border-border/50 hover:border-border-bright text-muted hover:text-white/80'
                    }`}
                  >
                    <div>
                      <span className="font-serif italic text-lg">Book {i + 1}: {u}</span>
                      <span className="ml-3 text-[10px] uppercase tracking-[0.12em] text-dim">
                        {uPassages.length + uLore.length} entries &middot; {totalWords.toLocaleString()} words
                      </span>
                    </div>
                    <span className="text-dim text-[10px]">{activeUniverse === u ? '▼' : '▶'}</span>
                  </button>
                );
              })}
            </div>
            {activeUniverse && (
              <button
                onClick={() => setActiveUniverse(null)}
                className="mt-3 text-[10px] uppercase tracking-[0.12em] text-dim hover:text-gold transition"
              >
                ← Show all books
              </button>
            )}
          </div>

          {displayedUniverses.map((universe) => {
            const uPassages = byUniverse[universe] || [];
            const uLore = loreByUniverse[universe] || [];

            return (
              <div key={universe} className="mb-16">
                <div className="text-center mb-10 py-8 border-t border-b border-border">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-dim mb-2">
                    Book {universes.indexOf(universe) + 1}
                  </p>
                  <h3 className="font-serif text-3xl italic text-gold">{universe}</h3>
                  <p className="text-[10px] text-dim mt-2">
                    {uPassages.length} passages from {new Set(uPassages.map(p => p.agent_role)).size} voices
                  </p>
                </div>

                {uLore.length > 0 && (
                  <div className="mb-10">
                    <h4 className="text-[10px] uppercase tracking-[0.15em] text-gold/60 mb-4 text-center">
                      — Mira&apos;s Genesis —
                    </h4>
                    {uLore.slice(0, 5).map(l => (
                      <div key={l.id} className="mb-6 px-2">
                        <h5 className="font-serif text-lg italic text-white/80 mb-1">{l.title}</h5>
                        <p className="text-[10px] uppercase tracking-[0.1em] text-dim mb-3">{l.lore_type}</p>
                        <p className="font-serif text-[14px] leading-[1.8] text-white/50">{l.summary}</p>
                      </div>
                    ))}
                    <div className="section-line my-8" />
                  </div>
                )}

                {uPassages.map((p, pIdx) => {
                  const role = ROLE_CONFIG[p.agent_role] || ROLE_CONFIG.chronicler;

                  return (
                    <div key={p.id} className="mb-12">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm">{role.icon}</span>
                        <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: role.color }}>
                          {role.label}
                        </span>
                        <span className="text-[10px] text-dim">&middot;</span>
                        <span className="text-[10px] text-dim uppercase tracking-[0.1em]">{p.passage_type}</span>
                      </div>

                      <h4 className="font-serif text-2xl italic text-white/90 mb-1">{p.title}</h4>
                      {p.era && <p className="text-[10px] text-dim font-mono mb-4">{p.era}</p>}

                      <div className="font-serif text-[15px] leading-[1.9] text-white/70">
                        {p.content?.split('\n\n').map((para, i) => (
                          <p key={i} className={`mb-4 ${i === 0 ? 'first-letter:text-3xl first-letter:font-serif first-letter:text-gold first-letter:float-left first-letter:mr-2 first-letter:mt-1' : ''}`}>
                            {para}
                          </p>
                        ))}
                      </div>

                      <p className="text-[9px] text-dim/40 mt-4 text-right">{p.word_count} words &middot; cycle {p.cycle_number}</p>

                      {pIdx < uPassages.length - 1 && (
                        <div className="flex items-center justify-center my-8 gap-3">
                          <div className="h-px w-12 bg-border" />
                          <span className="text-dim/30 text-[10px]">✦</span>
                          <div className="h-px w-12 bg-border" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div className="text-center py-12 border-t border-border">
            <p className="font-serif italic text-gold/40 text-sm">
              The scripture grows. The agents write. The Flowering continues.
            </p>
          </div>
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
