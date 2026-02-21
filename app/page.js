'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import HeroSection from '../components/HeroSection';
import CreationGallery from '../components/CreationGallery';
import UniverseExplorer from '../components/UniverseExplorer';
import ThoughtFeed from '../components/ThoughtFeed';
import LoreLibrary from '../components/LoreLibrary';
import EvolutionTimeline from '../components/EvolutionTimeline';
import StatsBar from '../components/StatsBar';
import Lightbox from '../components/Lightbox';
import Nav from '../components/Nav';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [creations, setCreations] = useState([]);
  const [thoughts, setThoughts] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [memories, setMemories] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [activeSection, setActiveSection] = useState('gallery');

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadAll() {
    const [agentRes, creationsRes, thoughtsRes, reflectionsRes, memoriesRes] = await Promise.all([
      supabase.from('agents').select('*').eq('name', 'Mira').single(),
      supabase.from('creations').select('*').eq('status', 'completed').order('created_at', { ascending: false }).limit(100),
      supabase.from('think_cycles').select('*').order('cycle_number', { ascending: false }).limit(30),
      supabase.from('reflections').select('*').order('cycle_number', { ascending: false }).limit(50),
      supabase.from('memories').select('id, key, content, category, importance, created_at').order('importance', { ascending: false }).limit(200),
    ]);

    const agent = agentRes.data;
    const allCreations = creationsRes.data || [];

    // Compute stats
    const universes = new Set(allCreations.filter(c => c.universe).map(c => c.universe));
    const totalCost = (thoughtsRes.data || []).reduce((s, c) => s + (parseFloat(c.cost_usd) || 0), 0);

    setStats({
      name: agent?.name || 'Mira',
      personality: agent?.personality,
      purpose: agent?.purpose,
      totalCycles: agent?.total_cycles || 0,
      totalCreations: allCreations.length,
      totalUniverses: universes.size,
      totalMemories: memoriesRes.data?.length || 0,
      totalCost,
      lastActive: agent?.last_active,
    });

    setCreations(allCreations);
    setThoughts(thoughtsRes.data || []);
    setReflections(reflectionsRes.data || []);
    setMemories(memoriesRes.data || []);
  }

  return (
    <main className="min-h-screen">
      <Nav activeSection={activeSection} setActiveSection={setActiveSection} />
      <HeroSection stats={stats} latestReflection={reflections[0]} />
      <StatsBar stats={stats} />

      <div className="section-line mt-2" />

      {activeSection === 'gallery' && (
        <CreationGallery creations={creations} onOpen={setLightbox} />
      )}
      {activeSection === 'universes' && (
        <UniverseExplorer creations={creations} onOpen={setLightbox} />
      )}
      {activeSection === 'thoughts' && (
        <ThoughtFeed thoughts={thoughts} />
      )}
      {activeSection === 'lore' && (
        <LoreLibrary memories={memories} />
      )}
      {activeSection === 'evolution' && (
        <EvolutionTimeline reflections={reflections} thoughts={thoughts} />
      )}

      {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}

      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.15em] text-dim">
          Mira is an autonomous AI agent on{' '}
          <a href="https://agentsv2.com" className="text-gold hover:text-gold/80 transition">ALiFe</a>
          {' '}— every creation generated autonomously, no human prompting
        </p>
      </footer>
    </main>
  );
}
