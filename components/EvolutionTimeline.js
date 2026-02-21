'use client';
import { useState, useMemo } from 'react';

export default function EvolutionTimeline({ reflections, thoughts }) {
  const [selected, setSelected] = useState(null);

  // Build phases from reflections
  const phases = useMemo(() => {
    if (!reflections.length) return [];

    const reversed = [...reflections].reverse();
    const phaseGroups = [];
    let currentPhase = null;

    for (const r of reversed) {
      if (r.phase !== currentPhase) {
        phaseGroups.push({
          phase: r.phase || 'unknown',
          startCycle: r.cycle_number,
          endCycle: r.cycle_number,
          reflections: [r],
          obsessions: new Set(r.obsessions || []),
        });
        currentPhase = r.phase;
      } else {
        const last = phaseGroups[phaseGroups.length - 1];
        last.endCycle = r.cycle_number;
        last.reflections.push(r);
        (r.obsessions || []).forEach(o => last.obsessions.add(o));
      }
    }

    return phaseGroups.map(p => ({ ...p, obsessions: [...p.obsessions] }));
  }, [reflections]);

  // Compute pull distribution from thoughts
  const pullStats = useMemo(() => {
    if (!thoughts.length) return { avg: 0, max: 0, highPullCount: 0 };
    const pulls = thoughts.map(t => t.max_pull || 0);
    return {
      avg: (pulls.reduce((a, b) => a + b, 0) / pulls.length).toFixed(1),
      max: Math.max(...pulls).toFixed(1),
      highPullCount: pulls.filter(p => p >= 7).length,
    };
  }, [thoughts]);

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-8">
        <h2 className="font-display font-700 text-2xl tracking-tight">Evolution</h2>
        <p className="text-[11px] text-dim uppercase tracking-[0.12em] mt-1">
          {reflections.length} identity reflections across {phases.length} phases
        </p>
      </div>

      {/* Pull stats */}
      <div className="flex gap-6 mb-10 p-5 bg-surface border border-border">
        <div>
          <div className="font-display font-700 text-xl text-gold">{pullStats.avg}</div>
          <div className="text-[10px] text-dim uppercase tracking-[0.12em]">Avg Pull</div>
        </div>
        <div>
          <div className="font-display font-700 text-xl text-cyan">{pullStats.max}</div>
          <div className="text-[10px] text-dim uppercase tracking-[0.12em]">Peak Pull</div>
        </div>
        <div>
          <div className="font-display font-700 text-xl text-ember">{pullStats.highPullCount}</div>
          <div className="text-[10px] text-dim uppercase tracking-[0.12em]">High Pull Cycles</div>
        </div>
      </div>

      {/* Phase timeline */}
      {phases.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="font-serif italic text-xl text-muted">No reflections yet</h3>
          <p className="text-sm text-dim mt-3">Identity evolution data will appear after Mira writes her first identity document.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-8">
            {phases.map((phase, i) => (
              <div key={i} className="relative pl-12">
                {/* Timeline dot */}
                <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 ${
                  phase.phase === 'creation' ? 'bg-gold border-gold' :
                  phase.phase === 'framework' ? 'bg-cyan border-cyan' :
                  phase.phase === 'obsession' ? 'bg-ember border-ember' :
                  'bg-dim border-dim'
                }`} />

                <div className="bg-surface border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`font-display font-700 text-sm uppercase tracking-[0.1em] ${
                        phase.phase === 'creation' ? 'text-gold' :
                        phase.phase === 'framework' ? 'text-cyan' :
                        phase.phase === 'obsession' ? 'text-ember' :
                        'text-muted'
                      }`}>
                        {phase.phase}
                      </span>
                      <span className="text-[10px] text-dim">
                        Cycles {phase.startCycle} — {phase.endCycle}
                      </span>
                    </div>
                    <span className="text-[10px] text-dim">
                      {phase.reflections.length} reflections
                    </span>
                  </div>

                  {/* Latest framework from this phase */}
                  {phase.reflections[phase.reflections.length - 1]?.framework && (
                    <p className="font-serif text-sm text-muted leading-relaxed mb-3">
                      &ldquo;{phase.reflections[phase.reflections.length - 1].framework}&rdquo;
                    </p>
                  )}

                  {/* Obsessions */}
                  {phase.obsessions.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {phase.obsessions.slice(0, 6).map((o, j) => (
                        <span key={j} className="tag">{o}</span>
                      ))}
                    </div>
                  )}

                  {/* Expandable reflections */}
                  {selected === i && (
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      {phase.reflections.slice(0, 5).map(r => (
                        <div key={r.id} className="text-xs text-dim">
                          <span className="text-muted font-mono">#{r.cycle_number}</span>{' '}
                          <span className="text-white/50">{r.identity_doc?.slice(0, 200)}...</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setSelected(selected === i ? null : i)}
                    className="text-[10px] text-dim hover:text-gold uppercase tracking-[0.12em] mt-3 transition"
                  >
                    {selected === i ? 'Collapse' : 'View reflections'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
