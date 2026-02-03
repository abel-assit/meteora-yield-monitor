'use client';

import React, { useState, useEffect } from 'react';
import { useWalletConnection, useBalance } from '@solana/react-hooks';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { saidClient, SAIDVerificationResult } from '../lib/said-client';

interface WalletInfo {
  address: string;
  verified: SAIDVerificationResult | null;
  loading: boolean;
}

export function WalletPanel() {
  const { wallet, connect, disconnect, connecting, disconnecting } = useWalletConnection();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);

  useEffect(() => {
    if (wallet) {
      verifyWallet(wallet.accounts[0].address);
    } else {
      setWalletInfo(null);
    }
  }, [wallet]);

  const verifyWallet = async (address: string) => {
    setWalletInfo({ address, verified: null, loading: true });
    
    // In production, this would call the actual SAID API
    // For now, simulate with mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockVerification: SAIDVerificationResult = {
      isVerified: true,
      trustScore: 750,
      riskLevel: 'low',
      identity: {
        agentId: 'mock-agent',
        name: 'Verified User',
        reputation: 85,
        verified: true,
        badges: ['early-adopter', 'defi-power-user'],
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
    
    setWalletInfo({ address, verified: mockVerification, loading: false });
  };

  const getRiskBadge = (level: string) => {
    const styles = {
      low: 'bg-green-500/20 text-green-400 border-green-500/50',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      high: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${styles[level as keyof typeof styles]}`}>
        {level.toUpperCase()} RISK
      </span>
    );
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">👛 Wallet</h2>
      
      {!wallet ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Connect your wallet to see personalized data</p>
          <button
            onClick={connect}
            disabled={connecting}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-bold transition disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Wallet Address */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Address</span>
            <code className="bg-black/30 px-2 py-1 rounded text-sm">
              {wallet.accounts[0].address.slice(0, 6)}...{wallet.accounts[0].address.slice(-4)}
            </code>
          </div>

          {/* SAID Verification */}
          {walletInfo?.loading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              Verifying identity...
            </div>
          ) : walletInfo?.verified ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Trust Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-emerald-400">
                    {walletInfo.verified.trustScore}
                  </span>
                  <span className="text-xs text-gray-500">/1000</span>
                </div>
              </div>

              {getRiskBadge(walletInfo.verified.riskLevel)}

              {walletInfo.verified.identity && (
                <div className="bg-black/30 rounded-lg p-3 space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-400">Reputation:</span>{' '}
                    <span className="font-medium">{walletInfo.verified.identity.reputation}%</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {walletInfo.verified.identity.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-yellow-400 text-sm">⚠️ Wallet not verified</p>
          )}

          {/* Disconnect */}
          <button
            onClick={disconnect}
            disabled={disconnecting}
            className="w-full py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
          >
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      )}
    </div>
  );
}
