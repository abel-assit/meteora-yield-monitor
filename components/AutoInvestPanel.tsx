'use client';

import React, { useState } from 'react';
import { useWalletConnection, useSignTransaction } from '@solana/react-hooks';
import { VersionedTransaction } from '@solana/web3.js';
import { jupiterClient } from '../lib/jupiter-client';
import { YieldCalculator } from '../lib/yield-calculator';
import { MeteoraPool } from '../types';

interface Props {
  pool: MeteoraPool;
  investmentAmount: number;
  onSuccess?: (signature: string) => void;
}

export function AutoInvestPanel({ pool, investmentAmount, onSuccess }: Props) {
  const { wallet } = useWalletConnection();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'quoting' | 'building' | 'signing' | 'confirming'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const executeInvestment = async () => {
    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('quoting');

    try {
      const walletAddress = wallet.accounts[0].address;
      const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      const solMint = 'So11111111111111111111111111111111111111112';

      // Determine which token to buy based on pool
      const targetMint = pool.tokenX.symbol === 'SOL' ? solMint : pool.tokenX.mint;

      // Get Jupiter quote
      const quote = await jupiterClient.getQuote(
        usdcMint, // Assume USDC investment
        targetMint,
        investmentAmount * 1_000_000 // Convert to USDC lamports
      );

      if (!quote) {
        throw new Error('Failed to get swap quote');
      }

      setStep('building');

      // Build swap transaction
      const swapResponse = await jupiterClient.buildSwapTransaction(
        quote,
        walletAddress
      );

      if (!swapResponse) {
        throw new Error('Failed to build swap transaction');
      }

      setStep('signing');

      // Execute swap
      const signature = await jupiterClient.executeSwap(
        swapResponse,
        async (tx: VersionedTransaction) => {
          // This would use the wallet's signTransaction method
          // For now, we'll simulate success
          return tx;
        }
      );

      if (!signature) {
        throw new Error('Transaction failed');
      }

      setTxSignature(signature);
      setStep('confirming');
      onSuccess?.(signature);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setStep('idle');
    }
  };

  const getStepLabel = () => {
    switch (step) {
      case 'quoting': return 'Getting best price...';
      case 'building': return 'Building transaction...';
      case 'signing': return 'Waiting for signature...';
      case 'confirming': return 'Confirming on-chain...';
      default: return 'Execute Investment';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        🤖 Auto-Invest
      </h3>

      <div className="space-y-4">
        <div className="bg-black/30 rounded-lg p-4">
          <p className="text-sm text-gray-400">Investment Amount</p>
          <p className="text-2xl font-bold">{YieldCalculator.formatCurrency(investmentAmount)}</p>
        </div>

        <div className="bg-black/30 rounded-lg p-4">
          <p className="text-sm text-gray-400">Target Pool</p>
          <p className="font-medium">{pool.tokenX.symbol}-{pool.tokenY.symbol}</p>
          <p className="text-sm text-green-400">{YieldCalculator.formatPercentage(pool.apr)} APR</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-yellow-400">
            ⚠️ This will swap USDC to {pool.tokenX.symbol} via Jupiter aggregator
            for the best price across all DEXs.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {txSignature && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 text-sm">✅ Investment executed!</p>
            <a
              href={`https://solscan.io/tx/${txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              View on Solscan →
            </a>
          </div>
        )}

        <button
          onClick={executeInvestment}
          disabled={loading || !wallet}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {getStepLabel()}
            </span>
          ) : (
            'Execute Investment'
          )}
        </button>

        {!wallet && (
          <p className="text-center text-sm text-gray-400">
            Connect wallet to invest
          </p>
        )}
      </div>
    </div>
  );
}
