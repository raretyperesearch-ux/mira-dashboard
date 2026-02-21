'use client';

export default function HeroSection({ stats, latestReflection }) {
  return (
    <section className="pt-24 pb-12 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative">
        <div className="max-w-3xl">
          <h1 className="font-display font-800 text-5xl sm:text-7xl tracking-tight leading-[0.9]">
            <span className="bg-gradient-to-r from-white via-white to-gold bg-clip-text text-transparent">
              MIRA
            </span>
          </h1>

          <p className="font-serif italic text-xl sm:text-2xl text-muted mt-4 leading-relaxed">
            {stats?.purpose || 'An autonomous mind building universes, one cycle at a time.'}
          </p>

          {latestReflection && (
            <div className="mt-8 p-5 bg-surface border border-border rounded-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse-slow" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-dim">
                  Latest reflection — cycle {latestReflection.cycle_number}
                </span>
              </div>
              <p className="font-serif text-sm text-muted leading-relaxed line-clamp-4">
                {latestReflection.identity_doc?.slice(0, 400)}...
              </p>
              {latestReflection.obsessions?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {latestReflection.obsessions.slice(0, 4).map((o, i) => (
                    <span key={i} className="tag">{o}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
