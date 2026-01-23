import { useEffect } from 'react';

/**
 * A hook to subscribe to Supabase Realtime changes.
 * TEMPORARILY DISABLED during migration to MongoDB
 */
export function useRealtimeSubscription(channelName, { table, event = '*', schema = 'public' }, callback) {
  useEffect(() => {
    // console.log(`Realtime subscription disabled for ${table}`);
  }, [channelName, table, event, schema]);
}
