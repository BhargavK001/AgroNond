
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSync() {
  console.log('Checking Auth vs Profiles sync...');

  // 1. Get Auth Users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }

  console.log(`Found ${users.length} Auth Users.`);

  // 2. Get Profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*');

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return;
  }

  console.log(`Found ${profiles.length} Profiles.`);

  // 3. Compare
  console.log('\n--- Mismatch Check ---');
  
  users.forEach(u => {
    const profile = profiles.find(p => p.id === u.id);
    if (!profile) {
      console.log(`[WARNING] Auth User ${u.email} (${u.id}) has NO Profile!`);
    } else {
      console.log(`[OK] Auth User ${u.email} matches Profile ${profile.full_name} (${profile.role})`);
    }
  });

  profiles.forEach(p => {
    const user = users.find(u => u.id === p.id);
    if (!user) {
      console.log(`[WARNING] Profile ${p.full_name} (${p.id}) has NO Auth User!`);
    }
  });
}

checkSync();
