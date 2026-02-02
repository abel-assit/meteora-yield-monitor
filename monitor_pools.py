#!/usr/bin/env python3
"""
Meteora Pool Yield & Volume Monitor
Monitors DLMM pools for best yields and alerts on high volume pools.
Usage: python3 monitor_pools.py [--min-apr 10] [--min-volume 100000] [--alert]
"""

import argparse
import requests
import json
import sys
import time
from datetime import datetime
from typing import List, Dict, Optional

# Meteora API endpoints
METEORA_API = "https://api.meteora.ag"
DLMM_POOLS_ENDPOINT = "https://dlmm-api.meteora.ag/pair/all"

# Common token mints
COMMON_TOKENS = {
    "SOL": "So11111111111111111111111111111111111111112",
    "USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "USDT": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "BONK": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    "JUP": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    "RAY": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    "ORCA": "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMUFPkezf",
    "MSOL": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    "JITOSOL": "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
}

class MeteoraMonitor:
    def __init__(self, min_apr: float = 0, min_volume: float = 0, min_tvl: float = 0):
        self.min_apr = min_apr
        self.min_volume = min_volume
        self.min_tvl = min_tvl
        self.previous_pools = {}
        
    def fetch_all_pools(self) -> List[Dict]:
        """Fetch all DLMM pools from Meteora."""
        try:
            response = requests.get(DLMM_POOLS_ENDPOINT, timeout=60)
            response.raise_for_status()
            data = response.json()
            
            # Handle different response formats
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                if 'data' in data:
                    return data['data']
                elif 'pairs' in data:
                    return data['pairs']
                else:
                    # Might be a dict of pools keyed by address
                    return list(data.values())
            else:
                return []
        except Exception as e:
            print(f"❌ Error fetching pools: {e}", file=sys.stderr)
            return []
    
    def calculate_yield_score(self, pool: Dict) -> float:
        """
        Calculate a yield score based on APR, volume, and TVL.
        Higher score = better opportunity.
        """
        apr = pool.get('apr', 0) or 0
        volume_24h = pool.get('volume24h', 0) or 0
        tvl = pool.get('tvl', 0) or 0
        
        if tvl == 0:
            return 0
        
        # Volume/TVL ratio indicates activity/efficiency
        volume_ratio = volume_24h / tvl if tvl > 0 else 0
        
        # Score formula: APR * volume_ratio * log(TVL)
        # Rewards high APR with good volume and reasonable TVL
        import math
        tvl_factor = math.log10(max(tvl, 1000)) / 10  # Normalize TVL
        
        score = apr * (1 + volume_ratio) * tvl_factor
        return score
    
    def filter_pools(self, pools: List[Dict]) -> List[Dict]:
        """Filter pools based on criteria and add scores."""
        filtered = []
        
        for pool in pools:
            apr = pool.get('apr', 0) or 0
            volume = pool.get('volume24h', 0) or 0
            tvl = pool.get('tvl', 0) or 0
            
            # Apply filters
            if apr < self.min_apr:
                continue
            if volume < self.min_volume:
                continue
            if tvl < self.min_tvl:
                continue
            
            # Calculate yield score
            pool['yield_score'] = self.calculate_yield_score(pool)
            filtered.append(pool)
        
        # Sort by yield score (highest first)
        filtered.sort(key=lambda x: x['yield_score'], reverse=True)
        return filtered
    
    def detect_volume_spike(self, pool: Dict) -> Optional[Dict]:
        """Detect if a pool has unusual volume activity."""
        pool_address = pool.get('address')
        current_volume = pool.get('volume24h', 0) or 0
        
        if pool_address in self.previous_pools:
            prev_volume = self.previous_pools[pool_address].get('volume24h', 0) or 0
            if prev_volume > 0:
                volume_change = ((current_volume - prev_volume) / prev_volume) * 100
                
                if volume_change > 50:  # 50% volume increase
                    return {
                        'pool': pool,
                        'previous_volume': prev_volume,
                        'current_volume': current_volume,
                        'change_percent': volume_change
                    }
        
        return None
    
    def format_pool_display(self, pool: Dict, rank: int = 0) -> str:
        """Format pool information for display."""
        token_x = pool.get('tokenX', {}).get('symbol', 'Unknown')
        token_y = pool.get('tokenY', {}).get('symbol', 'Unknown')
        apr = pool.get('apr', 0) or 0
        volume = pool.get('volume24h', 0) or 0
        tvl = pool.get('tvl', 0) or 0
        score = pool.get('yield_score', 0)
        
        lines = [
            f"\n{'='*60}",
            f"{'🥇' if rank == 1 else '🥈' if rank == 2 else '🥉' if rank == 3 else '🔹'} Rank #{rank} | {token_x}-{token_y}",
            f"   📍 Pool: {pool.get('address', 'Unknown')[:20]}...",
            f"   💰 TVL: ${tvl:,.2f}",
            f"   📈 APR: {apr:.2f}%",
            f"   🔄 Volume 24h: ${volume:,.2f}",
            f"   ⭐ Yield Score: {score:.2f}",
        ]
        
        if tvl > 0:
            volume_ratio = (volume / tvl) * 100
            lines.append(f"   📊 Volume/TVL: {volume_ratio:.2f}%")
        
        lines.append(f"{'='*60}")
        return "\n".join(lines)
    
    def display_alerts(self, alerts: List[Dict]):
        """Display volume spike alerts."""
        if not alerts:
            return
        
        print("\n" + "🚨" * 30)
        print("🚨 VOLUME SPIKE ALERTS")
        print("🚨" * 30)
        
        for alert in alerts:
            pool = alert['pool']
            token_x = pool.get('tokenX', {}).get('symbol', 'Unknown')
            token_y = pool.get('tokenY', {}).get('symbol', 'Unknown')
            
            print(f"\n🔥 {token_x}-{token_y}")
            print(f"   Volume Change: +{alert['change_percent']:.1f}%")
            print(f"   Previous: ${alert['previous_volume']:,.2f}")
            print(f"   Current: ${alert['current_volume']:,.2f}")
            print(f"   Pool: {pool.get('address', 'Unknown')}")
    
    def run_monitor(self, top_n: int = 10, alert_mode: bool = False):
        """Run the pool monitoring."""
        print(f"\n🔍 Meteora Pool Monitor")
        print(f"   Min APR: {self.min_apr}%")
        print(f"   Min Volume: ${self.min_volume:,.2f}")
        print(f"   Min TVL: ${self.min_tvl:,.2f}")
        print(f"   Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"\n{'='*60}")
        
        # Fetch pools
        print("\n📡 Fetching pools from Meteora...")
        pools = self.fetch_all_pools()
        
        if not pools:
            print("❌ No pools fetched")
            return
        
        print(f"✅ Fetched {len(pools)} pools")
        
        # Filter and score
        print("\n🔍 Filtering and scoring pools...")
        filtered = self.filter_pools(pools)
        
        if not filtered:
            print("❌ No pools match criteria")
            return
        
        print(f"✅ {len(filtered)} pools match criteria")
        
        # Check for volume spikes
        alerts = []
        if alert_mode:
            print("\n📊 Checking for volume spikes...")
            for pool in pools[:100]:  # Check top 100 by TVL for spikes
                alert = self.detect_volume_spike(pool)
                if alert:
                    alerts.append(alert)
            
            self.display_alerts(alerts)
        
        # Display top pools
        print(f"\n🏆 TOP {top_n} POOLS BY YIELD SCORE")
        print("="*60)
        
        for i, pool in enumerate(filtered[:top_n], 1):
            print(self.format_pool_display(pool, i))
        
        # Save current state for comparison
        self.previous_pools = {p.get('address'): p for p in pools if p.get('address')}
        
        return filtered[:top_n]

def main():
    parser = argparse.ArgumentParser(
        description="Monitor Meteora DLMM pools for yield opportunities"
    )
    parser.add_argument(
        "--min-apr", 
        type=float, 
        default=10,
        help="Minimum APR percentage (default: 10)"
    )
    parser.add_argument(
        "--min-volume", 
        type=float, 
        default=50000,
        help="Minimum 24h volume in USD (default: 50000)"
    )
    parser.add_argument(
        "--min-tvl", 
        type=float, 
        default=100000,
        help="Minimum TVL in USD (default: 100000)"
    )
    parser.add_argument(
        "--top", 
        type=int, 
        default=10,
        help="Show top N pools (default: 10)"
    )
    parser.add_argument(
        "--alert", 
        action="store_true",
        help="Enable volume spike alerts"
    )
    parser.add_argument(
        "--watch", 
        action="store_true",
        help="Continuous monitoring mode"
    )
    parser.add_argument(
        "--interval", 
        type=int, 
        default=300,
        help="Update interval in seconds for watch mode (default: 300)"
    )
    
    args = parser.parse_args()
    
    monitor = MeteoraMonitor(
        min_apr=args.min_apr,
        min_volume=args.min_volume,
        min_tvl=args.min_tvl
    )
    
    if args.watch:
        print(f"\n👁️  WATCH MODE ENABLED")
        print(f"   Update interval: {args.interval} seconds")
        print(f"   Press Ctrl+C to stop\n")
        
        try:
            while True:
                monitor.run_monitor(top_n=args.top, alert_mode=args.alert)
                print(f"\n⏳ Next update in {args.interval} seconds...")
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n\n👋 Monitor stopped")
    else:
        monitor.run_monitor(top_n=args.top, alert_mode=args.alert)

if __name__ == "__main__":
    main()
