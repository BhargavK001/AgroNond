import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * A hook to subscribe to Supabase Realtime changes.
 * 
 * @param {string} channelName - Unique name for the channel
 * @param {Object} options - Configuration object
 * @param {string} options.table - Table name to listen to
 * @param {string} [options.event='*'] - Event to listen to (INSERT, UPDATE, DELETE, or *)
 * @param {string} [options.schema='public'] - Schema name
 * @param {Function} callback - Function to be called when event occurs
 */
export function useRealtimeSubscription(channelName, { table, event = '*', schema = 'public' }, callback) {
  const callbackRef = useRef(callback);

  // Keep callback fresh without triggering re-subscription
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
        },
        (payload) => {
          if (callbackRef.current) {
            callbackRef.current(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Realtime: Subscribed to ${table} (${event})`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, table, event, schema]);
}
