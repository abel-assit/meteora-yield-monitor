'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SolanaProvider } from '@solana/react-hooks';
import { autoDiscover, createClient } from '@solana/client';
import { PoolDashboard } from '../components/PoolDashboard';
import { AlertPanel } from '../components/AlertPanel';
import { YieldCalculatorPanel } from '../components/YieldCalculatorPanel';
import { SettingsPanel } from '../components/SettingsPanel';

const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const websocketEndpoint = process.env.NEXT_PUBLIC_SOLANA_WS_URL || endpoint.replace('https://', 'wss://');

const solanaClient = createClient({
  endpoint,
  websocketEndpoint,
  walletConnectors: autoDiscover(),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'calculator' | 'settings'>('dashboard');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isMonitoring, setIsMonitoring] = useState(false);

  const handleRefresh = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

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
                    Meteora Yield Monitor
                  </h1>
                  <p className="text-xs text-gray-400">
                    Last update: {lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    isMonitoring
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                  {isMonitoring ? 'Monitoring' : 'Start Monitor'}
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
            <nav className="flex gap-2 mt-4">
              {[
                { id: 'dashboard', label: '📊 Dashboard', count: null },
                { id: 'alerts', label: '🔔 Alerts', count: 3 },
                { id: 'calculator', label: '🧮 Calculator', count: null },
                { id: 'settings', label: '⚙️ Settings', count: null },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                  {tab.count && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {activeTab === 'dashboard' && <PoolDashboard onRefresh={handleRefresh} />}
          {activeTab === 'alerts' && <AlertPanel />}
          {activeTab === 'calculator' && <YieldCalculatorPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>Meteora Yield Monitor • Built with TypeScript & Next.js</p>
            <p className="mt-1">Data from Meteora DLMM API</p>
          </div>
        </footer>
      </main>
    </SolanaProvider>
  );
}
