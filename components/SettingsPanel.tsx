'use client';

import React, { useState, useEffect } from 'react';
import { AlertConfig } from '../types';

interface Props {
  config?: AlertConfig;
  onConfigChange?: (config: AlertConfig) => void;
}

const defaultConfig: AlertConfig = {
  minApr: 20,
  minVolume: 100000,
  minTvl: 500000,
  volumeSpikeThreshold: 50,
  tvlDropThreshold: 20,
  enabled: true,
};

export function SettingsPanel({ config: externalConfig, onConfigChange }: Props) {
  const [config, setConfig] = useState<AlertConfig>(externalConfig || defaultConfig);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (externalConfig) {
      setConfig(externalConfig);
    }
  }, [externalConfig]);

  const updateConfig = (updates: Partial<AlertConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
    setSaved(false);
  };

  const saveSettings = () => {
    // In a real app, save to localStorage or backend
    localStorage.setItem('yieldMonitorConfig', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Alert Settings */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">Enable Alerts</h3>
            <p className="text-sm text-gray-400">Get notified about yield opportunities</p>
          </div>
          <button
            onClick={() => updateConfig({ enabled: !config.enabled })}
            className={`w-14 h-7 rounded-full transition relative ${
              config.enabled ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition ${
                config.enabled ? 'left-8' : 'left-1'
              }`}
            />
          </button>
        </div>

        <hr className="border-gray-700" />

        {/* Min APR */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">Minimum APR Alert</label>
            <span className="font-mono">{config.minApr}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            value={config.minApr}
            onChange={(e) => updateConfig({ minApr: Number(e.target.value) })}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Min Volume */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">Minimum 24h Volume</label>
            <span className="font-mono">${config.minVolume.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={config.minVolume}
            onChange={(e) => updateConfig({ minVolume: Number(e.target.value) })}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Min TVL */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">Minimum TVL</label>
            <span className="font-mono">${config.minTvl.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="50000"
            max="5000000"
            step="50000"
            value={config.minTvl}
            onChange={(e) => updateConfig({ minTvl: Number(e.target.value) })}
            className="w-full accent-purple-500"
          />
        </div>

        <hr className="border-gray-700" />

        {/* Volume Spike Threshold */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">Volume Spike Threshold</label>
            <span className="font-mono">{config.volumeSpikeThreshold}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            value={config.volumeSpikeThreshold}
            onChange={(e) => updateConfig({ volumeSpikeThreshold: Number(e.target.value) })}
            className="w-full accent-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Alert when volume increases by this percentage
          </p>
        </div>

        {/* TVL Drop Threshold */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">TVL Drop Threshold</label>
            <span className="font-mono">{config.tvlDropThreshold}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={config.tvlDropThreshold}
            onChange={(e) => updateConfig({ tvlDropThreshold: Number(e.target.value) })}
            className="w-full accent-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Alert when TVL drops by this percentage
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-bold transition flex items-center justify-center gap-2"
      >
        {saved ? '✓ Saved!' : '💾 Save Settings'}
      </button>

      {/* About */}
      <div className="bg-gray-800/30 rounded-xl p-6">
        <h3 className="font-bold mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>Meteora Yield Monitor v2.0</p>
          <p>Built with TypeScript, Next.js & React</p>
          <p>Data provided by Meteora DLMM API</p>
          <p className="mt-4 text-xs">
            This tool is for informational purposes only. Always DYOR before investing.
          </p>
        </div>
      </div>
    </div>
  );
}
