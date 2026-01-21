import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('--- Supabase Diagnostic ---');
console.log(`URL: ${supabaseUrl ? 'Found' : 'MISSING'}`);
console.log(`Key: ${supabaseKey ? 'Found' : 'MISSING'}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Attempting to query "profiles"...');
  try {
     const { data, error, status, statusText } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
     
     console.log('Response Status:', status, statusText);
     if (error) {
       console.log('--- ERROR OBJECT ---');
       console.log('Message:', error.message);
       console.log('Code:', error.code);
       console.log('Hint:', error.hint);
       console.log('Details:', error.details);
     } else {
       console.log('SUCCESS! Database is reachable.');
     }
  } catch (err) {
     console.log('--- EXCEPTION CAUGHT ---');
     console.error(err);
  }
}

check();
