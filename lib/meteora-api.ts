import axios, { AxiosInstance } from 'axios';
import { MeteoraPool, HistoricalDataPoint } from '../types';

const METEORA_API_BASE = 'https://dlmm-api.meteora.ag';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export class MeteoraApiClient {
  private client: AxiosInstance;
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  constructor() {
    this.client = axios.create({
      baseURL: METEORA_API_BASE,
      timeout: 30000,
    });
  }

  async getAllPools(): Promise<MeteoraPool[]> {
    try {
      const response = await this.client.get('/pair/all');
      const data = response.data;
      
      let pools: any[] = [];
      if (Array.isArray(data)) {
        pools = data;
      } else if (data.pairs) {
        pools = data.pairs;
      } else if (data.data) {
        pools = data.data;
      }

      return pools.map(this.normalizePoolData).filter(Boolean) as MeteoraPool[];
    } catch (error) {
      console.error('Error fetching pools:', error);
      throw new Error('Failed to fetch pools from Meteora');
    }
  }

  async getPoolByAddress(address: string): Promise<MeteoraPool | null> {
    try {
      const pools = await this.getAllPools();
      return pools.find(p => p.address === address) || null;
    } catch (error) {
      console.error('Error fetching pool:', error);
      return null;
    }
  }

  async getPoolsByToken(tokenSymbol: string): Promise<MeteoraPool[]> {
    const pools = await this.getAllPools();
    return pools.filter(
      p => 
        p.tokenX.symbol.toLowerCase() === tokenSymbol.toLowerCase() ||
        p.tokenY.symbol.toLowerCase() === tokenSymbol.toLowerCase()
    );
  }

  async getTokenPrice(tokenId: string): Promise<number> {
    // Check cache
    const cached = this.priceCache.get(tokenId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.price;
    }

    try {
      const response = await axios.get(`${COINGECKO_API}/simple/price`, {
        params: {
          ids: tokenId,
          vs_currencies: 'usd',
        },
        timeout: 10000,
      });
      
      const price = response.data[tokenId]?.usd || 0;
      this.priceCache.set(tokenId, { price, timestamp: Date.now() });
      return price;
    } catch (error) {
      console.error('Error fetching price:', error);
      return 0;
    }
  }

  async getHistoricalData(poolAddress: string, days: number = 7): Promise<HistoricalDataPoint[]> {
    // This would typically fetch from an indexer
    // For now, return mock data
    const data: HistoricalDataPoint[] = [];
    const now = Date.now();
    
    for (let i = days; i >= 0; i--) {
      data.push({
        timestamp: now - i * 24 * 60 * 60 * 1000,
        apr: 10 + Math.random() * 50,
        tvl: 100000 + Math.random() * 500000,
        volume24h: 10000 + Math.random() * 100000,
        price: 1 + Math.random() * 0.2,
      });
    }
    
    return data;
  }

  private normalizePoolData(raw: any): MeteoraPool | null {
    try {
      return {
        address: raw.address || raw.pair || raw.pubkey || '',
        name: raw.name || `${raw.tokenX?.symbol || 'Unknown'}-${raw.tokenY?.symbol || 'Unknown'}`,
        tokenX: {
          symbol: raw.tokenX?.symbol || 'Unknown',
          mint: raw.tokenX?.mint || raw.token_x || '',
          decimals: raw.tokenX?.decimals || 9,
        },
        tokenY: {
          symbol: raw.tokenY?.symbol || 'Unknown',
          mint: raw.tokenY?.mint || raw.token_y || '',
          decimals: raw.tokenY?.decimals || 9,
        },
        binStep: raw.binStep || raw.bin_step || 0,
        baseFee: raw.baseFee || raw.base_fee || 0,
        tvl: raw.tvl || raw.liquidity || 0,
        volume24h: raw.volume24h || raw.volume_24h || raw.volume || 0,
        volume7d: raw.volume7d || raw.volume_7d,
        fees24h: raw.fees24h || raw.fees_24h,
        apr: raw.apr || raw.farmApr || 0,
        apy: raw.apy,
        price: raw.price,
        liquidity: raw.liquidity,
        isVerified: raw.isVerified || false,
      };
    } catch (error) {
      console.error('Error normalizing pool data:', error);
      return null;
    }
  }
}

export const meteoraApi = new MeteoraApiClient();
