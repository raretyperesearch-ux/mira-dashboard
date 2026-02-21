'use client';
import { useState, useMemo } from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'creation', label: 'Creation' },
  { id: 'identity', label: 'Identity' },
  { id: 'curiosity', label: 'Curiosity' },
  { id: 'research', label: 'Research' },
  { id: 'forge', label: 'Forge' },
  { id: 'journal', label: 'Journal' },
];

export default function LoreLibrary({ memories }) {
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = memories;
    if (cat !== 'all') result = result.filter(m => m.category === cat);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        (m.content || '').toLowerCase().includes(q) ||
        (m.key || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [memories, cat, search]);

  const catCounts = useMemo(() => {
    const counts = {};
    memories.forEach(m => { counts[m.category] = (counts[m.category] || 0) + 1; });
    return counts;
  }, [memories]);

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-700 text-2xl tracking-tight">Lore Library</h2>
          <p className="text-[11px] text-dim uppercase tracking-[0.12em] mt-1">
            {memories.length} memories archived
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search memories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md bg-surface border border-border px-4 py-2.5 text-sm text-white placeholder:text-dim focus:outline-none focus:border-gold transition font-mono"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] border transition-all ${
              cat === c.id
                ? 'bg-gold/10 border-gold text-gold'
                : 'bg-surface border-border text-dim hover:text-muted'
            }`}
          >
            {c.label} {c.id !== 'all' && catCounts[c.id] ? `(${catCounts[c.id]})` : ''}
          </button>
        ))}
      </div>

      {/* Memories */}
      <div className="space-y-2">
        {filtered.map(m => (
          <MemoryCard key={m.id} memory={m} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="font-serif italic text-lg text-muted">
            {search ? 'No memories match your search.' : 'No memories in this category yet.'}
          </p>
        </div>
      )}
    </section>
  );
}

function MemoryCard({ memory: m }) {
  const [open, setOpen] = useState(false);
  const content = m.content || m.key || '';
  const preview = content.slice(0, 200);
  const hasMore = content.length > 200;
  const date = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const catColors = {
    creation: 'text-gold',
    identity: 'text-cyan',
    curiosity: 'text-emerald-400',
    research: 'text-blue-400',
    forge: 'text-ember',
    journal: 'text-purple-400',
    relationship: 'text-pink-400',
  };

  return (
    <div
      className="bg-surface border border-border p-4 cursor-pointer hover:border-border-bright transition"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`text-[10px] uppercase tracking-[0.15em] ${catColors[m.category] || 'text-dim'}`}>
              {m.category}
            </span>
            <span className="text-[10px] text-dim">{date}</span>
            <ImportanceDots importance={m.importance} />
          </div>
          <p className="font-serif text-sm text-white/70 leading-relaxed">
            {open ? content : preview}
            {hasMore && !open && <span className="text-dim">...</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

function ImportanceDots({ importance }) {
  const n = Math.min(importance || 5, 10);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={`w-1 h-1 rounded-full ${i < n ? 'bg-gold' : 'bg-surface-3'}`} />
      ))}
    </div>
  );
}
