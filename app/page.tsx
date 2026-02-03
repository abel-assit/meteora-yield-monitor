'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SolanaProvider } from '@solana/react-hooks';
import { autoDiscover, createClient } from '@solana/client';
import { PoolDashboard } from '../components/PoolDashboard';
import { AlertPanel } from '../components/AlertPanel';
import { YieldCalculatorPanel } from '../components/YieldCalculatorPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { WalletPanel } from '../components/WalletPanel';
import { PortfolioPanel } from '../components/PortfolioPanel';
import { PoolAlert, AlertConfig } from '../types';
import { useAutoAlerts, useNotifications } from '../hooks/useAutoAlerts';

const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const websocketEndpoint = process.env.NEXT_PUBLIC_SOLANA_WS_URL || endpoint.replace('https://', 'wss://');

const solanaClient = createClient({
  endpoint,
  websocketEndpoint,
  walletConnectors: autoDiscover(),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'calculator' | 'portfolio' | 'settings'>('dashboard');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [alertCount, setAlertCount] = useState(0);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    minApr: 20,
    minVolume: 100000,
    minTvl: 500000,
    volumeSpikeThreshold: 50,
    tvlDropThreshold: 20,
    enabled: false,
  });
  
  const { permission, requestPermission, notify } = useNotifications();

  const handleRefresh = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

  const handleAlert = useCallback((alert: PoolAlert) => {
    setAlertCount(prev => prev + 1);
    notify(`Yield Alert: ${alert.message}`, {
      body: alert.message,
      tag: alert.id,
    });
  }, [notify]);

  const toggleMonitoring = async () => {
    if (!alertConfig.enabled) {
      // Request notification permission when starting monitoring
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          alert('Please enable notifications for alerts to work');
          return;
        }
      }
    }
    
    setAlertConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  return (
    <SolanaProvider client={solanaClient}>
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl">
                  📊
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Meteora Yield Monitor v2
                  </h1>
                  <p className="text-xs text-gray-400">
                    Last update: {lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleMonitoring}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    alertConfig.enabled
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${alertConfig.enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                  {alertConfig.enabled ? 'Monitoring' : 'Start Monitor'}
                </button>

                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium transition"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex gap-2 mt-4 overflow-x-auto">
              {[
                { id: 'dashboard', label: '📊 Dashboard', count: null },
                { id: 'alerts', label: '🔔 Alerts', count: alertCount },
                { id: 'calculator', label: '🧮 Calculator', count: null },
                { id: 'portfolio', label: '💼 Portfolio', count: null },
                { id: 'settings', label: '⚙️ Settings', count: null },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                  {tab.count ? (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {activeTab === 'dashboard' && <PoolDashboard onRefresh={handleRefresh} />}
              {activeTab === 'alerts' && <AlertPanel />}
              {activeTab === 'calculator' && <YieldCalculatorPanel />}
              {activeTab === 'portfolio' && <PortfolioPanel />}
              {activeTab === 'settings' && (
                <SettingsPanel 
                  config={alertConfig} 
                  onConfigChange={setAlertConfig}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <WalletPanel />
              
              {activeTab === 'dashboard' && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <h3 className="font-bold mb-3">🔥 Hot Pools</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>SOL-USDC</span>
                      <span className="text-green-400">85% APR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>JUP-SOL</span>
                      <span className="text-green-400">62% APR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BONK-USDC</span>
                      <span className="text-green-400">45% APR</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                <h3 className="font-bold mb-2">🏆 Hackathon</h3>
                <p className="text-sm text-gray-400">
                  Built for Colosseum Agent Hackathon
                </p>
                <a 
                  href="https://github.com/abel-assit/meteora-yield-monitor" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block"
                >
                  View on GitHub →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>Meteora Yield Monitor v2 • Built with TypeScript, Next.js & Solana</p>
            <p className="mt-1">Data from Meteora DLMM API • Identity by SAID</p>
          </div>
        </footer>
      </main>
    </SolanaProvider>
  );
}
