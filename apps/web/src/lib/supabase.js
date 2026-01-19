import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please create a .env.local file with:');
  console.error('  VITE_SUPABASE_URL=your-project-url');
  console.error('  VITE_SUPABASE_ANON_KEY=your-anon-key');
}

// Create a singleton Supabase client to avoid re-initialization issues
// with React 19 Strict Mode and hot module reloading
let supabaseInstance = null;

function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Disable lock to avoid AbortError in development
      lock: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? undefined 
        : undefined,
    },
    global: {
      // Disable fetch abort signals in development to prevent AbortError
      fetch: (url, options = {}) => {
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        if (isLocal && options && options.signal) {
          // Remove the signal to prevent abortion
          const { signal, ...rest } = options;
          return fetch(url, rest);
        }
        return fetch(url, options);
      },
    },
  });
  
  return supabaseInstance;
}

export const supabase = getSupabaseClient();

export default supabase;
