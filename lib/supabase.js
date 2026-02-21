import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gkcohikbuginhzyilcya.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY29oaWtidWdpbmh6eWlsY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNjYxOTAsImV4cCI6MjA4NTc0MjE5MH0.Kvb4-nINJO41chvrzZa9CceX8hdnrgPWKsrzDa3FuxE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch agent stats
export async function getAgent() {
  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('name', 'Mira')
    .single();
  return data;
}

// Fetch creations with optional filters
export async function getCreations({ universe, mediaType, heroOnly, limit = 50 } = {}) {
  let query = supabase
    .from('creations')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (universe) query = query.eq('universe', universe);
  if (mediaType) query = query.eq('media_type', mediaType);
  if (heroOnly) query = query.eq('is_hero', true);

  const { data } = await query;
  return data || [];
}

// Fetch unique universes
export async function getUniverses() {
  const { data } = await supabase
    .from('creations')
    .select('universe')
    .eq('status', 'completed')
    .not('universe', 'is', null);

  const universes = {};
  (data || []).forEach(c => {
    if (c.universe) {
      universes[c.universe] = (universes[c.universe] || 0) + 1;
    }
  });
  return Object.entries(universes)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Fetch recent think cycles (live thought feed)
export async function getThoughts({ limit = 20 } = {}) {
  const { data } = await supabase
    .from('think_cycles')
    .select('id, cycle_number, inner_monologue, curiosity_signals, max_pull, search_query, post_draft, identity_reflection, cost_usd, duration_ms, created_at')
    .order('cycle_number', { ascending: false })
    .limit(limit);
  return data || [];
}

// Fetch reflections (identity evolution)
export async function getReflections({ limit = 50 } = {}) {
  const { data } = await supabase
    .from('reflections')
    .select('*')
    .order('cycle_number', { ascending: false })
    .limit(limit);
  return data || [];
}

// Fetch creation memories (lore)
export async function getLore({ limit = 50 } = {}) {
  const { data } = await supabase
    .from('memories')
    .select('*')
    .eq('category', 'creation')
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

// Fetch all memories for lore library
export async function getMemories({ category, limit = 100 } = {}) {
  let query = supabase
    .from('memories')
    .select('id, key, content, category, importance, created_at')
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) query = query.eq('category', category);

  const { data } = await query;
  return data || [];
}

// Aggregate stats
export async function getStats() {
  const [agent, { count: totalCreations }, { count: totalCycles }, { count: totalMemories }] = await Promise.all([
    getAgent(),
    supabase.from('creations').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('think_cycles').select('*', { count: 'exact', head: true }),
    supabase.from('memories').select('*', { count: 'exact', head: true }),
  ]);

  const { data: costData } = await supabase
    .from('think_cycles')
    .select('cost_usd')
    .not('cost_usd', 'is', null);

  const totalCost = (costData || []).reduce((sum, c) => sum + (parseFloat(c.cost_usd) || 0), 0);

  return {
    name: agent?.name || 'Mira',
    personality: agent?.personality,
    purpose: agent?.purpose,
    totalCycles: totalCycles || agent?.total_cycles || 0,
    totalCreations: totalCreations || 0,
    totalMemories: totalMemories || 0,
    totalCost: totalCost,
    lastActive: agent?.last_active,
  };
}
