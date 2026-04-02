import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://snexbgsiuunogdemlela.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_4kFEBYEWSE0P9RVCdx40rA_6nixWTmM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const TIMEOUT = 12000

function withTimeout(promise, label = 'query') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timeout`)), TIMEOUT)),
  ])
}

/** Load a single client hub by slug */
export async function loadHub(slug) {
  const { data, error } = await withTimeout(
    supabase.from('hubs').select('*').eq('client_slug', slug).single(),
    'loadHub'
  )
  if (error) throw error
  return data
}

/** Save hub_data (read-merge-write) */
export async function saveHubData(hubId, newData) {
  const { data: current, error: readErr } = await withTimeout(
    supabase.from('hubs').select('hub_data').eq('id', hubId).single(),
    'saveHubData read'
  )
  if (readErr) throw readErr

  const existing = current?.hub_data || {}
  const merged = { ...existing, ...newData }
  // Deep merge allData so components don't wipe each other's keys
  if (newData.allData) {
    merged.allData = { ...(existing.allData || {}), ...(newData.allData) }
    // Deep merge individual allData sub-keys when they're objects (not arrays)
    for (const key of Object.keys(newData.allData)) {
      if (newData.allData[key] && typeof newData.allData[key] === 'object' && !Array.isArray(newData.allData[key]) && existing.allData?.[key]) {
        merged.allData[key] = { ...(existing.allData[key] || {}), ...(newData.allData[key]) }
      }
    }
  }
  // Deep merge _meta
  merged._meta = { ...(existing._meta || {}), ...(newData._meta || {}) }
  // Deep merge _meta.snapshot so saving one field doesn't wipe others
  if (newData._meta?.snapshot) {
    merged._meta.snapshot = { ...(existing._meta?.snapshot || {}), ...(newData._meta.snapshot) }
  }
  // Deep merge _meta.finances
  if (newData._meta?.finances) {
    merged._meta.finances = { ...(existing._meta?.finances || {}), ...(newData._meta.finances) }
  }
  // Deep merge _meta.coreFoundation
  if (newData._meta?.coreFoundation) {
    merged._meta.coreFoundation = { ...(existing._meta?.coreFoundation || {}), ...(newData._meta.coreFoundation) }
  }
  // Pipeline is an array - replace entirely when provided
  if (newData._meta?.pipeline !== undefined) {
    merged._meta.pipeline = newData._meta.pipeline
  }
  // Audiences is an array - replace entirely when provided
  if (newData._meta?.audiences !== undefined) {
    merged._meta.audiences = newData._meta.audiences
  }
  // Deep merge _meta.brandVoice
  if (newData._meta?.brandVoice) {
    merged._meta.brandVoice = { ...(existing._meta?.brandVoice || {}), ...(newData._meta.brandVoice) }
  }
  // Deep merge _meta.brandGuidelines
  if (newData._meta?.brandGuidelines) {
    merged._meta.brandGuidelines = { ...(existing._meta?.brandGuidelines || {}), ...(newData._meta.brandGuidelines) }
  }
  // Deep merge _meta.leadSources
  if (newData._meta?.leadSources) {
    merged._meta.leadSources = { ...(existing._meta?.leadSources || {}), ...(newData._meta.leadSources) }
  }
  // Lead magnets is an array - replace entirely
  if (newData._meta?.leadMagnets !== undefined) {
    merged._meta.leadMagnets = newData._meta.leadMagnets
  }
  // Deep merge _meta.clientForLife
  if (newData._meta?.clientForLife) {
    merged._meta.clientForLife = { ...(existing._meta?.clientForLife || {}), ...(newData._meta.clientForLife) }
  }
  // Deep merge _meta.agentReferrals
  if (newData._meta?.agentReferrals) {
    merged._meta.agentReferrals = { ...(existing._meta?.agentReferrals || {}), ...(newData._meta.agentReferrals) }
  }
  // Vendor partners is an array - replace entirely
  if (newData._meta?.vendorPartners !== undefined) {
    merged._meta.vendorPartners = newData._meta.vendorPartners
  }

  const { error: writeErr } = await withTimeout(
    supabase.from('hubs').update({ hub_data: merged }).eq('id', hubId),
    'saveHubData write'
  )
  if (writeErr) throw writeErr
  return merged
}

/** Load default hub (tries 'coreops-default' first, then any hub marked as default, then first non-config hub) */
export async function loadDefaultHub() {
  // Try known default slugs first
  const defaultSlugs = ['coreops-default', 'default', 'coreops', 'demo']
  for (const s of defaultSlugs) {
    try {
      const { data } = await withTimeout(
        supabase.from('hubs').select('*').eq('client_slug', s).single(),
        'loadDefaultHub'
      )
      if (data) return data
    } catch { /* try next */ }
  }

  // Fall back: load all hubs and let the user pick, or return first non-config
  const { data, error } = await withTimeout(
    supabase.from('hubs').select('*').neq('client_slug', '__mainframe_config__').order('created_at', { ascending: true }).limit(10),
    'loadDefaultHub'
  )
  if (error) throw error
  return data?.[0] || null
}

/** Load all client hubs (for hub picker) */
export async function loadAllHubs() {
  const { data, error } = await withTimeout(
    supabase.from('hubs').select('id, client_slug, client_name, hub_data').neq('client_slug', '__mainframe_config__').order('created_at', { ascending: true }),
    'loadAllHubs'
  )
  if (error) throw error
  return data || []
}

/** Load mainframe config (for team members, settings) */
export async function loadConfig() {
  try {
    const { data, error } = await withTimeout(
      supabase.from('hubs').select('hub_data').eq('client_slug', '__mainframe_config__').single(),
      'loadConfig'
    )
    if (error) return {}
    return data?.hub_data || {}
  } catch {
    return {}
  }
}
