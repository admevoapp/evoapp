import { createClient } from '@supabase/supabase-js'

// Try to get environment variables first
const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Hardcoded fallbacks (User-approved for resilience)
const fallbackUrl = 'https://rsedxpjfrfwozptuwxvr.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZWR4cGpmcmZ3b3pwdHV3eHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDE5MjEsImV4cCI6MjA4MDgxNzkyMX0.JTZna6qkIinxwWqWLpkTQKjgZ67TEozwaw5yGBcAsko'

const supabaseUrl = envUrl || fallbackUrl
const supabaseAnonKey = envKey || fallbackKey

if (!envUrl) {
    console.warn('⚠️ Supabase env vars missing. Using fallback credentials.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
