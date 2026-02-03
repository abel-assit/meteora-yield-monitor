'use client';

import { useState, useEffect, useCallback } from 'react';
import { PoolAlert, AlertConfig, MeteoraPool } from '../types';

interface UseAutoAlertsProps {
  config: AlertConfig;
  pools: MeteoraPool[];
  onAlert: (alert: PoolAlert) => void;
}

export function useAutoAlerts({ config, pools, onAlert }: UseAutoAlertsProps) {
  const [previousPools, setPreviousPools] = useState<Map<string, MeteoraPool>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkAlerts = useCallback(() => {
    if (!config.enabled || pools.length === 0) return;

    const newAlerts: PoolAlert[] = [];

    for (const pool of pools) {
      const prevPool = previousPools.get(pool.address);

      // Check volume spike
      if (prevPool && prevPool.volume24h > 0) {
        const volumeChange = ((pool.volume24h - prevPool.volume24h) / prevPool.volume24h) * 100;
        if (volumeChange >= config.volumeSpikeThreshold) {
          newAlerts.push({
            id: `vol-${Date.now()}-${pool.address.slice(0, 8)}`,
            poolAddress: pool.address,
            type: 'volume_spike',
            message: `${pool.tokenX.symbol}-${pool.tokenY.symbol} volume +${volumeChange.toFixed(1)}%`,
            severity: volumeChange > 100 ? 'critical' : 'warning',
            timestamp: Date.now(),
            data: { change: volumeChange, previous: prevPool.volume24h, current: pool.volume24h },
          });
        }
      }

      // Check TVL drop
      if (prevPool && prevPool.tvl > 0) {
        const tvlChange = ((prevPool.tvl - pool.tvl) / prevPool.tvl) * 100;
        if (tvlChange >= config.tvlDropThreshold) {
          newAlerts.push({
            id: `tvl-${Date.now()}-${pool.address.slice(0, 8)}`,
            poolAddress: pool.address,
            type: 'tvl_drop',
            message: `${pool.tokenX.symbol}-${pool.tokenY.symbol} TVL dropped ${tvlChange.toFixed(1)}%`,
            severity: tvlChange > 50 ? 'critical' : 'warning',
            timestamp: Date.now(),
            data: { change: tvlChange, previous: prevPool.tvl, current: pool.tvl },
          });
        }
      }

      // Check high APR
      if (pool.apr >= config.minApr && !previousPools.has(pool.address)) {
        newAlerts.push({
          id: `apr-${Date.now()}-${pool.address.slice(0, 8)}`,
          poolAddress: pool.address,
          type: 'high_apr',
          message: `New high APR: ${pool.tokenX.symbol}-${pool.tokenY.symbol} at ${pool.apr.toFixed(1)}%`,
          severity: pool.apr > 100 ? 'critical' : pool.apr > 50 ? 'warning' : 'info',
          timestamp: Date.now(),
          data: { apr: pool.apr, tvl: pool.tvl },
        });
      }

      // Update previous state
      previousPools.set(pool.address, pool);
    }

    // Trigger alerts
    newAlerts.forEach(onAlert);
    
    setPreviousPools(new Map(previousPools));
    setLastCheck(new Date());
  }, [config, pools, previousPools, onAlert]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Run checks at interval when enabled
  useEffect(() => {
    if (!isRunning) return;

    // Initial check
    checkAlerts();

    // Set up interval (every 30 seconds)
    const interval = setInterval(checkAlerts, 30000);

    return () => clearInterval(interval);
  }, [isRunning, checkAlerts]);

  return {
    isRunning,
    start,
    stop,
    lastCheck,
    checkAlerts,
  };
}

// Hook for browser notifications
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const notify = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  };

  return { permission, requestPermission, notify };
}
