import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://erhumtzfyarckjowgvcd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaHVtdHpmeWFyY2tqb3dndmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjE2NjksImV4cCI6MjA4ODk5NzY2OX0.ydqd0vNsDNgnzNjFqkqUrya8oIz-fV2KOlISKmt4O00'
)

/** Recupera tenant e moduli attivi dallo slug URL */
export async function getTenantBySlug(slug: string) {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, business_name, primary_color, welcome_message, logo_url, status')
    .eq('slug', slug)
    .single()
  if (!tenant) return null

  const { data: modules } = await supabase
    .from('tenant_modules')
    .select('module')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)

  return { ...tenant, modules: modules?.map(m => m.module) || [] }
}
