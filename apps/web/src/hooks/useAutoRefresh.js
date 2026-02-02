import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for auto-refreshing data at specified intervals
 * Also handles window focus-based refresh
 * 
 * @param {Function} fetchFn - The function to call for fetching data
 * @param {Object} options - Configuration options
 * @param {number} options.interval - Polling interval in milliseconds (default: 30000ms / 30s)
 * @param {boolean} options.enabled - Whether auto-refresh is enabled (default: true)
 * @param {boolean} options.refreshOnFocus - Whether to refresh when window gains focus (default: true)
 * @param {boolean} options.immediate - Whether to call fetchFn immediately on mount (default: false)
 */
export function useAutoRefresh(fetchFn, options = {}) {
    const {
        interval = 30000, // 30 seconds default
        enabled = true,
        refreshOnFocus = true,
        immediate = false,
    } = options;

    const intervalRef = useRef(null);
    const lastFetchRef = useRef(0);

    // Memoized fetch function to avoid unnecessary re-renders
    const stableFetchFn = useCallback(() => {
        if (typeof fetchFn === 'function') {
            lastFetchRef.current = Date.now();
            fetchFn();
        }
    }, [fetchFn]);

    // Start polling
    useEffect(() => {
        if (!enabled) return;

        // Immediate fetch on mount if requested
        if (immediate) {
            stableFetchFn();
        }

        // Set up polling interval
        intervalRef.current = setInterval(() => {
            stableFetchFn();
        }, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, interval, stableFetchFn, immediate]);

    // Handle window focus
    useEffect(() => {
        if (!enabled || !refreshOnFocus) return;

        const handleFocus = () => {
            // Only refresh if it's been at least 5 seconds since last fetch
            // This prevents rapid consecutive fetches
            const timeSinceLastFetch = Date.now() - lastFetchRef.current;
            if (timeSinceLastFetch > 5000) {
                stableFetchFn();
            }
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [enabled, refreshOnFocus, stableFetchFn]);

    // Return control functions
    return {
        refresh: stableFetchFn,
        stop: () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        },
        start: () => {
            if (!intervalRef.current && enabled) {
                intervalRef.current = setInterval(stableFetchFn, interval);
            }
        }
    };
}

export default useAutoRefresh;
