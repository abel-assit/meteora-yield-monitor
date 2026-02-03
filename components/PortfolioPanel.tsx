'use client';

import React, { useState, useEffect } from 'react';
import { useWalletConnection } from '@solana/react-hooks';
import { MeteoraPool, UserPosition } from '../types';
import { YieldCalculator } from '../lib/yield-calculator';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface PortfolioPool extends MeteoraPool {
  userPosition?: UserPosition;
}

export function PortfolioPanel() {
  const { wallet } = useWalletConnection();
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock positions for demo
  useEffect(() => {
    if (wallet) {
      // In production, fetch from blockchain
      setTimeout(() => {
        setPositions([
          {
            poolAddress: 'pool1',
            tokenXAmount: 10,
            tokenYAmount: 1000,
            entryPrice: 100,
            currentValue: 1150,
            pnl: 150,
            pnlPercentage: 15,
          },
          {
            poolAddress: 'pool2',
            tokenXAmount: 5,
            tokenYAmount: 500,
            entryPrice: 200,
            currentValue: 480,
            pnl: -20,
            pnlPercentage: -4,
          },
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [wallet]);

  const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalPnlPercentage = positions.length > 0 
    ? (totalPnl / positions.reduce((sum, p) => sum + p.currentValue - p.pnl, 0)) * 100 
    : 0;

  if (!wallet) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
        <p className="text-gray-400 mb-4">Connect wallet to view portfolio</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 mt-4">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Value</p>
          <p className="text-2xl font-bold">{YieldCalculator.formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total P&L</p>
          <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{YieldCalculator.formatCurrency(totalPnl)}
          </p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Return</p>
          <p className={`text-2xl font-bold ${totalPnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnlPercentage >= 0 ? '+' : ''}{totalPnlPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Positions List */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="font-bold mb-4">Your Positions ({positions.length})</h3>
        
        {positions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No positions found</p>
        ) : (
          <div className="space-y-4">
            {positions.map((position, index) => (
              <div key={position.poolAddress} className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Position #{index + 1}</p>
                    <p className="text-sm text-gray-400">
                      {position.tokenXAmount} / {position.tokenYAmount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{YieldCalculator.formatCurrency(position.currentValue)}</p>
                    <p className={`text-sm ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnl >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Position Button */}
      <button className="w-full py-3 border border-dashed border-gray-600 text-gray-400 hover:border-purple-500 hover:text-purple-400 rounded-lg transition">
        + Add Position (Coming Soon)
      </button>
    </div>
  );
}
