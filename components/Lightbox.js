'use client';
import { useEffect } from 'react';

export default function Lightbox({ item, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!item) return null;

  const isVideo = item.media_type === 'video';
  const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const tags = item.style_tags || [];

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div
        className="max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="self-end mb-3 text-dim hover:text-white text-2xl transition"
        >
          ×
        </button>

        {/* Media */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          {isVideo && item.public_url ? (
            <video
              src={item.public_url}
              className="max-w-full max-h-[65vh] object-contain"
              controls
              autoPlay
              loop
            />
          ) : item.public_url ? (
            <img
              src={item.public_url}
              alt=""
              className="max-w-full max-h-[65vh] object-contain"
            />
          ) : (
            <div className="w-full h-64 bg-surface-2 flex items-center justify-center text-dim text-4xl">
              {isVideo ? '🎬' : '🎨'}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="mt-4 bg-surface border border-border p-5">
          {item.universe && (
            <div className="text-[10px] uppercase tracking-[0.15em] text-gold mb-2">
              {item.universe}{item.scene ? ` / ${item.scene}` : ''}
            </div>
          )}

          <p className="font-serif text-sm text-white/80 leading-relaxed">
            {item.prompt}
          </p>

          {item.audio_prompt && (
            <p className="text-xs text-cyan mt-2">
              🔊 Audio: {item.audio_prompt}
            </p>
          )}

          <div className="flex items-center gap-4 mt-4 text-[10px] text-dim uppercase tracking-[0.1em] flex-wrap">
            <span>{date}</span>
            <span>Cycle {item.cycle_number || '?'}</span>
            <span>{item.model || item.source}</span>
            {item.resolution && <span>{item.resolution}</span>}
            {item.duration_seconds && <span>{item.duration_seconds}s</span>}
            {item.has_audio && <span>🔊 Synced Audio</span>}
            {item.cost_usd && <span>${Number(item.cost_usd).toFixed(3)}</span>}
            {item.is_draft && <span className="text-ember">Draft</span>}
            {item.is_hero && <span className="text-gold">⭐ Hero</span>}
          </div>

          {tags.length > 0 && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
