'use client';

const SECTIONS = [
  { id: 'gallery', label: 'Creations' },
  { id: 'flowering', label: 'Flowering' },
  { id: 'universes', label: 'Universes' },
  { id: 'thoughts', label: 'Mind' },
  { id: 'lore', label: 'Lore' },
  { id: 'evolution', label: 'Evolution' },
];

export default function Nav({ activeSection, setActiveSection }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-void/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <span className="font-display font-800 text-lg tracking-tight bg-gradient-to-r from-white to-gold bg-clip-text text-transparent">
            MIRA
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-dim hidden sm:inline">
            multiverse architect
          </span>
        </div>

        <div className="flex gap-1">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-all duration-200 ${
                activeSection === s.id
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-dim hover:text-muted'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
