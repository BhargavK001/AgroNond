
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

async function checkUsers() {
  console.log('Checking users...');
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role')
    .ilike('role', '%admin%') // loosely check for admin
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log('Found Admins:', profiles);
  
  if (profiles.length === 0) {
    console.log('No admins found! Listing first 5 users:');
    const { data: allUsers } = await supabase.from('profiles').select('*').limit(5);
    console.log(allUsers);
  }
}

checkUsers();
