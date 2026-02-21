'use client';
import { useState, useMemo } from 'react';

export default function UniverseExplorer({ creations, onOpen }) {
  const [selected, setSelected] = useState(null);

  const universes = useMemo(() => {
    const map = {};
    creations.forEach(c => {
      if (!c.universe) return;
      if (!map[c.universe]) map[c.universe] = { name: c.universe, creations: [], scenes: new Set(), tags: new Set() };
      map[c.universe].creations.push(c);
      if (c.scene) map[c.universe].scenes.add(c.scene);
      (c.style_tags || []).forEach(t => map[c.universe].tags.add(t));
    });
    return Object.values(map).sort((a, b) => b.creations.length - a.creations.length);
  }, [creations]);

  const untagged = creations.filter(c => !c.universe);

  if (selected) {
    const u = universes.find(u => u.name === selected);
    if (!u) return null;
    return (
      <section className="max-w-[1400px] mx-auto px-6 py-10">
        <button
          onClick={() => setSelected(null)}
          className="text-[11px] uppercase tracking-[0.12em] text-dim hover:text-gold transition mb-6 flex items-center gap-2"
        >
          ← All Universes
        </button>

        <div className="mb-8">
          <h2 className="font-display font-800 text-4xl tracking-tight text-gold">{u.name}</h2>
          <div className="flex gap-4 mt-3 text-[11px] text-dim uppercase tracking-[0.1em]">
            <span>{u.creations.length} creations</span>
            <span>{u.scenes.size} scenes</span>
            <span>{u.tags.size} style tags</span>
          </div>
          {u.scenes.size > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {[...u.scenes].map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {u.creations.map(c => (
            <UniverseCard key={c.id} creation={c} onOpen={onOpen} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-10">
      <h2 className="font-display font-700 text-2xl tracking-tight mb-8">Universes</h2>

      {universes.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="font-serif italic text-2xl text-muted">No universes yet</h3>
          <p className="text-sm text-dim mt-3 max-w-md mx-auto">
            When Mira begins world-building, each universe she creates will appear here as an explorable space
            with its own species, architecture, lore, and visual identity.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {universes.map(u => (
            <div
              key={u.name}
              onClick={() => setSelected(u.name)}
              className="bg-surface border border-border p-6 card-lift cursor-pointer relative overflow-hidden"
            >
              {/* Preview thumbnails */}
              <div className="flex gap-2 mb-4 h-32 overflow-hidden rounded-sm">
                {u.creations.slice(0, 3).map(c => (
                  c.public_url ? (
                    <img key={c.id} src={c.public_url} className="h-full w-1/3 object-cover" alt="" />
                  ) : (
                    <div key={c.id} className="h-full w-1/3 bg-surface-2" />
                  )
                ))}
              </div>

              <h3 className="font-display font-700 text-xl text-gold">{u.name}</h3>
              <div className="flex gap-4 mt-2 text-[11px] text-dim uppercase tracking-[0.1em]">
                <span>{u.creations.length} creations</span>
                <span>{u.scenes.size} scenes</span>
              </div>
              {[...u.tags].length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {[...u.tags].slice(0, 5).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              )}
            </div>
          ))}

          {untagged.length > 0 && (
            <div className="bg-surface border border-border p-6 opacity-60">
              <h3 className="font-display font-600 text-lg text-muted">Untagged</h3>
              <p className="text-[11px] text-dim mt-2">{untagged.length} creations not yet assigned to a universe</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function UniverseCard({ creation: c, onOpen }) {
  const isVideo = c.media_type === 'video';
  return (
    <div className="bg-surface-2 border border-border card-lift cursor-pointer" onClick={() => onOpen(c)}>
      <div className="relative aspect-video overflow-hidden">
        {isVideo && c.public_url ? (
          <video src={c.public_url} className="w-full h-full object-cover" muted loop playsInline
            onMouseEnter={e => e.target.play()} onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }} />
        ) : c.public_url ? (
          <img src={c.public_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-dim">{isVideo ? '🎬' : '🎨'}</div>
        )}
      </div>
      <div className="p-3">
        <p className="font-serif text-xs text-muted line-clamp-2">{c.prompt?.slice(0, 120)}</p>
        <div className="text-[10px] text-dim mt-2 uppercase tracking-[0.1em]">
          {c.scene || 'no scene'} · cycle {c.cycle_number || '?'}
        </div>
      </div>
    </div>
  );
}
