
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rsedxpjfrfwozptuwxvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZWR4cGpmcmZ3b3pwdHV3eHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDE5MjEsImV4cCI6MjA4MDgxNzkyMX0.JTZna6qkIinxwWqWLpkTQKjgZ67TEozwaw5yGBcAsko';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    console.log('Checking tables...');

    // Try to select from a probable 'profiles' table
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .limit(1);

    if (profilesError) {
        console.log('Error accessing profiles:', profilesError.message);
    } else {
        console.log('Profiles table exists. Sample:', profiles);
    }

    // Try to select from 'connections' table
    const { data: connections, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .limit(1);

    if (connectionsError) {
        console.log('Error accessing connections:', connectionsError.message);
    } else {
        console.log('Connections table exists. Sample:', connections);
    }
}

checkTables();
