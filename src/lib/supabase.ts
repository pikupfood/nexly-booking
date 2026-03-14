import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://erhumtzfyarckjowgvcd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaHVtdHpmeWFyY2tqb3dndmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE2NjksImV4cCI6MjA4ODk5NzY2OX0.ydqd0vNsDNgnzNjFqkqUrya8oIz-fV2KOlISKmt4O00'
)

/**
 * Usa RPC SECURITY DEFINER che bypassa il RLS.
 * Necessario perché il portale booking non ha sessione utente.
 */
export async function getTenantBySlug(slug: string) {
  const { data, error } = await supabase.rpc('get_booking_portal_data', { p_slug: slug })
  if (error || !data) return null
  // La RPC restituisce i moduli come array JSON
  return {
    ...data,
    modules: Array.isArray(data.modules) ? data.modules : []
  }
}
