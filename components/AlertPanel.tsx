'use client';

import React, { useState } from 'react';
import { PoolAlert } from '../types';

// Mock alerts for demo
const mockAlerts: PoolAlert[] = [
  {
    id: '1',
    poolAddress: 'abc123',
    type: 'high_apr',
    message: 'SOL-USDC APR jumped to 85%!',
    severity: 'critical',
    timestamp: Date.now() - 1000 * 60 * 5,
    data: { apr: 85 },
  },
  {
    id: '2',
    poolAddress: 'def456',
    type: 'volume_spike',
    message: 'BONK-SOL volume increased 150%',
    severity: 'warning',
    timestamp: Date.now() - 1000 * 60 * 30,
    data: { change: 150 },
  },
  {
    id: '3',
    poolAddress: 'ghi789',
    type: 'new_pool',
    message: 'New JUP-USDC pool created with 45% APR',
    severity: 'info',
    timestamp: Date.now() - 1000 * 60 * 60,
    data: {},
  },
];

export function AlertPanel() {
  const [alerts, setAlerts] = useState<PoolAlert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filteredAlerts = alerts.filter(
    (a) => filter === 'all' || a.severity === filter
  );

  const clearAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return '🔴';
    if (severity === 'warning') return '🟡';
    return '🔵';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      high_apr: 'High APR',
      volume_spike: 'Volume Spike',
      tvl_drop: 'TVL Drop',
      new_pool: 'New Pool',
    };
    return labels[type] || type;
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Alerts</h2>
        <div className="flex gap-2">
          {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {['critical', 'warning', 'info'].map((severity) => (
          <div key={severity} className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-2xl font-bold">
              {alerts.filter((a) => a.severity === severity).length}
            </p>
            <p className="text-sm text-gray-400 capitalize">{severity}</p>
          </div>
        ))}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-2xl font-bold">{alerts.length}</p>
          <p className="text-sm text-gray-400">Total</p>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-4">🔔</p>
            <p>No alerts</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-gray-800/50 border rounded-xl p-4 flex items-start justify-between ${
                alert.severity === 'critical'
                  ? 'border-red-500/50'
                  : alert.severity === 'warning'
                  ? 'border-yellow-500/50'
                  : 'border-blue-500/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                      {getTypeLabel(alert.type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="font-medium">{alert.message}</p>
                </div>
              </div>
              <button
                onClick={() => clearAlert(alert.id)}
                className="text-gray-500 hover:text-white transition"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
