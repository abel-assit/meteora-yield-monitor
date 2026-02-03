import { MeteoraApiClient } from '../lib/meteora-api';
import { MeteoraPool } from '../types';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MeteoraApiClient', () => {
  let client: MeteoraApiClient;

  beforeEach(() => {
    client = new MeteoraApiClient();
    jest.clearAllMocks();
  });

  describe('getAllPools', () => {
    it('should fetch and normalize pool data', async () => {
      const mockResponse = {
        data: [
          {
            address: 'pool1',
            tokenX: { symbol: 'SOL', mint: 'sol111', decimals: 9 },
            tokenY: { symbol: 'USDC', mint: 'usdc111', decimals: 6 },
            tvl: 1000000,
            volume24h: 500000,
            apr: 45,
            binStep: 10,
            baseFee: 0.25,
          },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const pools = await client.getAllPools();

      expect(pools).toHaveLength(1);
      expect(pools[0].address).toBe('pool1');
      expect(pools[0].tokenX.symbol).toBe('SOL');
      expect(pools[0].tokenY.symbol).toBe('USDC');
    });

    it('should handle array response format', async () => {
      const mockResponse = {
        data: [
          { address: 'pool1', tokenX: { symbol: 'SOL' }, tokenY: { symbol: 'USDC' } },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const pools = await client.getAllPools();
      expect(pools).toHaveLength(1);
    });

    it('should handle object response with pairs field', async () => {
      const mockResponse = {
        data: {
          pairs: [
            { address: 'pool1', tokenX: { symbol: 'SOL' }, tokenY: { symbol: 'USDC' } },
          ],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const pools = await client.getAllPools();
      expect(pools).toHaveLength(1);
    });

    it('should throw error on API failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.getAllPools()).rejects.toThrow('Failed to fetch pools from Meteora');
    });
  });

  describe('getPoolByAddress', () => {
    it('should return pool by address', async () => {
      const mockResponse = {
        data: [
          { address: 'pool1', tokenX: { symbol: 'SOL' }, tokenY: { symbol: 'USDC' } },
          { address: 'pool2', tokenX: { symbol: 'ETH' }, tokenY: { symbol: 'USDC' } },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const pool = await client.getPoolByAddress('pool1');

      expect(pool).toBeDefined();
      expect(pool?.address).toBe('pool1');
    });

    it('should return null if pool not found', async () => {
      const mockResponse = {
        data: [{ address: 'pool1', tokenX: { symbol: 'SOL' }, tokenY: { symbol: 'USDC' } }],
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const pool = await client.getPoolByAddress('nonexistent');

      expect(pool).toBeNull();
    });
  });

  describe('getPoolsByToken', () => {
    it('should filter pools by token symbol', async () => {
      const mockResponse = {
        data: [
          { address: 'pool1', tokenX: { symbol: 'SOL' }, tokenY: { symbol: 'USDC' } },
          { address: 'pool2', tokenX: { symbol: 'ETH' }, tokenY: { symbol: 'USDC' } },
          { address: 'pool3', tokenX: { symbol: 'SOL' }, tokenY: { symbol: 'ETH' } },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const pools = await client.getPoolsByToken('SOL');

      expect(pools).toHaveLength(2);
      expect(pools.every(p => p.tokenX.symbol === 'SOL' || p.tokenY.symbol === 'SOL')).toBe(true);
    });

    it('should be case insensitive', async () => {
      const mockResponse = {
        data: [
          { address: 'pool1', tokenX: { symbol: 'SOL' }, tokenY: { symbol: 'USDC' } },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const pools = await client.getPoolsByToken('sol');

      expect(pools).toHaveLength(1);
    });
  });

  describe('getHistoricalData', () => {
    it('should return mock historical data', async () => {
      const data = await client.getHistoricalData('pool1', 7);

      expect(data).toHaveLength(8); // 7 days + today
      expect(data[0]).toHaveProperty('timestamp');
      expect(data[0]).toHaveProperty('apr');
      expect(data[0]).toHaveProperty('tvl');
      expect(data[0]).toHaveProperty('volume24h');
    });
  });
});
