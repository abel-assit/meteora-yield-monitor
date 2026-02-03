import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import axios from 'axios';

interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: null | any;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

const JUPITER_API = 'https://quote-api.jup.ag/v6';

export class JupiterClient {
  private connection: Connection;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl);
  }

  /**
   * Get a quote for swapping tokens
   */
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<JupiterQuote | null> {
    try {
      const response = await axios.get(`${JUPITER_API}/quote`, {
        params: {
          inputMint,
          outputMint,
          amount,
          slippageBps,
          onlyDirectRoutes: false,
          asLegacyTransaction: false,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('Jupiter quote error:', error);
      return null;
    }
  }

  /**
   * Build swap transaction
   */
  async buildSwapTransaction(
    quote: JupiterQuote,
    userPublicKey: string,
    wrapUnwrapSOL: boolean = true
  ): Promise<JupiterSwapResponse | null> {
    try {
      const response = await axios.post(`${JUPITER_API}/swap`, {
        quoteResponse: quote,
        userPublicKey,
        wrapUnwrapSOL,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }, {
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      console.error('Jupiter swap build error:', error);
      return null;
    }
  }

  /**
   * Execute swap (sign and send transaction)
   */
  async executeSwap(
    swapResponse: JupiterSwapResponse,
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
  ): Promise<string | null> {
    try {
      // Deserialize transaction
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(swapResponse.swapTransaction, 'base64')
      );

      // Sign transaction
      const signedTransaction = await signTransaction(transaction);

      // Send transaction
      const signature = await this.connection.sendTransaction(signedTransaction, {
        maxRetries: 3,
        skipPreflight: false,
      });

      // Confirm transaction
      const confirmation = await this.connection.confirmTransaction({
        signature,
        lastValidBlockHeight: swapResponse.lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      return signature;
    } catch (error) {
      console.error('Jupiter swap execution error:', error);
      return null;
    }
  }

  /**
   * Get token price from Jupiter
   */
  async getTokenPrice(mintAddress: string): Promise<number> {
    try {
      const response = await axios.get(`https://price.jup.ag/v4/price`, {
        params: { ids: mintAddress },
        timeout: 10000,
      });

      return response.data.data[mintAddress]?.price || 0;
    } catch (error) {
      console.error('Jupiter price error:', error);
      return 0;
    }
  }

  /**
   * Get route for multi-hop swaps
   */
  async getMultiHopRoute(
    inputMint: string,
    outputMint: string,
    amount: number,
    intermediateTokens: string[] = []
  ): Promise<JupiterQuote | null> {
    // Add intermediate tokens as route constraints if provided
    const params: any = {
      inputMint,
      outputMint,
      amount,
    };

    if (intermediateTokens.length > 0) {
      params.intermediateTokens = intermediateTokens.join(',');
    }

    try {
      const response = await axios.get(`${JUPITER_API}/quote`, {
        params,
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      console.error('Jupiter multi-hop error:', error);
      return null;
    }
  }
}

export const jupiterClient = new JupiterClient(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
);
