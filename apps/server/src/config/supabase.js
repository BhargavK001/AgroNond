import { createClient } from '@supabase/supabase-js';

let supabaseAdmin = null;

// Lazy initialization - called after dotenv is loaded
function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
    throw new Error('Missing Supabase configuration');
  }

  // Admin client with service role key - can bypass RLS
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

// Function to verify JWT and get user
export async function verifyToken(token) {
  try {
    const admin = getSupabaseAdmin();
    const { data: { user }, error } = await admin.auth.getUser(token);
    
    if (error) {
      console.error('Token verification error:', error.message);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Export a getter function instead of the client directly
export { getSupabaseAdmin };
export default { getSupabaseAdmin, verifyToken };
