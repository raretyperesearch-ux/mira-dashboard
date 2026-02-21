'use client';
import { useState, useMemo } from 'react';

export default function CreationGallery({ creations, onOpen }) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return creations;
    if (filter === 'hero') return creations.filter(c => c.is_hero);
    if (filter === 'image') return creations.filter(c => c.media_type === 'image');
    if (filter === 'video') return creations.filter(c => c.media_type === 'video');
    return creations.filter(c => c.universe === filter);
  }, [creations, filter]);

  const universes = useMemo(() => {
    const u = new Set(creations.filter(c => c.universe).map(c => c.universe));
    return [...u];
  }, [creations]);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'hero', label: '⭐ Heroes' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Video' },
    ...universes.map(u => ({ id: u, label: u })),
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-700 text-2xl tracking-tight">Creations</h2>
        <span className="text-[11px] text-dim uppercase tracking-[0.12em]">
          {filtered.length} works
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] border transition-all duration-200 ${
              filter === f.id
                ? 'bg-gold/10 border-gold text-gold'
                : 'bg-surface border-border text-dim hover:text-muted hover:border-border-bright'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c, i) => (
            <CreationCard key={c.id} creation={c} onOpen={onOpen} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function CreationCard({ creation: c, onOpen, index }) {
  const isVideo = c.media_type === 'video';
  const date = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const tags = (c.style_tags || []).slice(0, 3);

  return (
    <div
      className="bg-surface border border-border card-lift cursor-pointer opacity-0 animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
      onClick={() => onOpen(c)}
    >
      {/* Media */}
      <div className="relative aspect-video bg-surface-2 overflow-hidden">
        {isVideo && c.public_url ? (
          <video
            src={c.public_url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            onMouseEnter={e => e.target.play()}
            onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
          />
        ) : c.public_url ? (
          <img src={c.public_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-dim text-3xl">
            {isVideo ? '🎬' : '🎨'}
          </div>
        )}

        {/* Type badge */}
        <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] border backdrop-blur-md bg-void/70 ${
          c.is_hero ? 'text-ember border-ember' : isVideo ? 'text-cyan border-cyan' : 'text-gold border-gold'
        }`}>
          {c.is_hero ? '⭐ hero' : isVideo ? `🎬 ${c.duration_seconds || ''}s${c.has_audio ? ' +audio' : ''}` : '🎨 image'}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        {c.universe && (
          <div className="text-[10px] uppercase tracking-[0.15em] text-gold mb-2">
            {c.universe}{c.scene ? ` / ${c.scene}` : ''}
          </div>
        )}

        <p className="font-serif text-sm text-white/80 leading-relaxed line-clamp-3">
          {c.prompt?.slice(0, 150)}
        </p>

        <div className="flex items-center gap-3 mt-3 text-[10px] text-dim uppercase tracking-[0.1em]">
          <span>{date}</span>
          <span>cycle {c.cycle_number || '?'}</span>
          <span>{c.model || c.source}</span>
          {c.cost_usd && <span>${Number(c.cost_usd).toFixed(2)}</span>}
        </div>

        {tags.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-gold animate-pulse-slow" />
        <h3 className="font-serif italic text-2xl text-muted">Awaiting genesis</h3>
      </div>
      <p className="text-sm text-dim max-w-md mx-auto leading-relaxed">
        Mira&apos;s universe hasn&apos;t been born yet. When she begins creating, her worlds will appear here —
        images, videos with synchronized audio, species, civilizations. All generated autonomously.
      </p>
    </div>
  );
}
