import { createClient } from '@supabase/supabase-js'

// Hardcoded for debugging - environment variables are failing
const supabaseUrl = 'https://rsedxpjfrfwozptuwxvr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZWR4cGpmcmZ3b3pwdHV3eHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDE5MjEsImV4cCI6MjA4MDgxNzkyMX0.JTZna6qkIinxwWqWLpkTQKjgZ67TEozwaw5yGBcAsko'

console.log('Supabase Client Initializing with Hardcoded Keys');

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
