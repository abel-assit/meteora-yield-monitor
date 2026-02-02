#!/usr/bin/env python3
"""
Meteora Pool Alert System
Sends alerts when pools meet certain criteria.
Usage: python3 pool_alerts.py --min-apr 20 --min-volume 100000
"""

import argparse
import requests
import json
import sys
from datetime import datetime

METEORA_API = "https://api.meteora.ag"

def fetch_pools():
    """Fetch pool data from Meteora."""
    try:
        response = requests.get(f"{METEORA_API}/pools", timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return []

def check_alerts(pools, min_apr, min_volume):
    """Check for pools meeting alert criteria."""
    alerts = []
    
    for pool in pools:
        apr = pool.get('apr', 0) or pool.get('farmApr', 0) or 0
        volume = pool.get('volume24h', 0) or pool.get('volume', 0) or 0
        tvl = pool.get('tvl', 0) or 0
        
        if apr >= min_apr and volume >= min_volume:
            alerts.append({
                'pool': pool,
                'apr': apr,
                'volume': volume,
                'tvl': tvl
            })
    
    return alerts

def main():
    parser = argparse.ArgumentParser(description="Meteora Pool Alert System")
    parser.add_argument("--min-apr", type=float, default=20, help="Minimum APR %")
    parser.add_argument("--min-volume", type=float, default=100000, help="Minimum 24h volume")
    
    args = parser.parse_args()
    
    print(f"🔍 Checking for pools with APR >= {args.min_apr}% and Volume >= ${args.min_volume:,.0f}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    pools = fetch_pools()
    if not pools:
        print("❌ Could not fetch pools")
        return
    
    alerts = check_alerts(pools, args.min_apr, args.min_volume)
    
    if alerts:
        print(f"🚨 FOUND {len(alerts)} ALERTS:\n")
        for alert in alerts:
            pool = alert['pool']
            print(f"⚡ {pool.get('name', 'Unknown Pool')}")
            print(f"   APR: {alert['apr']:.2f}%")
            print(f"   Volume 24h: ${alert['volume']:,.2f}")
            print(f"   TVL: ${alert['tvl']:,.2f}")
            print(f"   Address: {pool.get('address', pool.get('pool', 'N/A'))}")
            print()
    else:
        print("✅ No pools meet alert criteria")

if __name__ == "__main__":
    main()
