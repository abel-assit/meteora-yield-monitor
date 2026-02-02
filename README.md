# Meteora Yield Monitor

Monitor Meteora DLMM pools for best yields and volume alerts.

## Tools

- **monitor_pools.py** - Main monitoring with yield scoring
- **pool_alerts.py** - Simple alert system

## Usage

```bash
python3 monitor_pools.py --min-apr 10 --top 10
python3 pool_alerts.py --min-apr 20 --min-volume 100000
```

