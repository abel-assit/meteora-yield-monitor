'use client';

import React, { useState } from 'react';
import { MeteoraPool, YieldCalculation } from '../types';
import { YieldCalculator } from '../lib/yield-calculator';

// Mock pool for demo
const mockPool: MeteoraPool = {
  address: 'demo',
  tokenX: { symbol: 'SOL', mint: '', decimals: 9 },
  tokenY: { symbol: 'USDC', mint: '', decimals: 6 },
  binStep: 10,
  baseFee: 0.25,
  tvl: 5000000,
  volume24h: 1000000,
  apr: 45,
};

export function YieldCalculatorPanel() {
  const [investment, setInvestment] = useState(1000);
  const [apr, setApr] = useState(45);
  const [calculation, setCalculation] = useState<YieldCalculation | null>(null);

  const calculate = () => {
    const pool = { ...mockPool, apr };
    const result = YieldCalculator.calculateYields(pool, investment);
    setCalculation(result);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center">Yield Calculator</h2>

      {/* Input Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Investment Amount: {YieldCalculator.formatCurrency(investment)}
          </label>
          <input
            type="range"
            min="100"
            max="100000"
            step="100"
            value={investment}
            onChange={(e) => setInvestment(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$100</span>
            <span>$100K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Expected APR: {apr}%
          </label>
          <input
            type="range"
            min="1"
            max="200"
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1%</span>
            <span>200%</span>
          </div>
        </div>

        <button
          onClick={calculate}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-bold transition"
        >
          Calculate Yields
        </button>
      </div>

      {/* Results */}
      {calculation && (
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            📊 Projected Returns
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-black/30 rounded-lg">
              <p className="text-3xl font-bold text-green-400">
                {YieldCalculator.formatCurrency(calculation.dailyYield)}
              </p>
              <p className="text-sm text-gray-400">Daily</p>
            </div>
            <div className="text-center p-4 bg-black/30 rounded-lg">
              <p className="text-3xl font-bold text-green-400">
                {YieldCalculator.formatCurrency(calculation.monthlyYield)}
              </p>
              <p className="text-sm text-gray-400">Monthly</p>
            </div>
            <div className="text-center p-4 bg-black/30 rounded-lg">
              <p className="text-3xl font-bold text-green-400">
                {YieldCalculator.formatCurrency(calculation.yearlyYield)}
              </p>
              <p className="text-sm text-gray-400">Yearly</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">APY (compounded):</span>
              <span className="font-mono">
                {YieldCalculator.formatPercentage(YieldCalculator.calculateAPY(apr))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Impermanent Loss Risk:</span>
              <span className={`capitalize ${
                calculation.impermanentLossRisk === 'low' ? 'text-green-400' :
                calculation.impermanentLossRisk === 'medium' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {calculation.impermanentLossRisk}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ROI:</span>
              <span className="font-mono">{apr}%</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ These are estimates based on current APR. Actual yields may vary due to 
              market conditions, impermanent loss, and fee changes.
            </p>
          </div>
        </div>
      )}

      {/* Quick Reference */}
      <div className="bg-gray-800/30 rounded-xl p-6">
        <h3 className="font-bold mb-4">Quick Reference</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">APR vs APY</p>
            <p className="text-xs text-gray-500 mt-1">
              APR is simple yearly rate. APY includes compounding effects.
            </p>
          </div>
          <div>
            <p className="text-gray-400">Impermanent Loss</p>
            <p className="text-xs text-gray-500 mt-1">
              Loss vs holding tokens separately due to price divergence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
