# Meteora Yield Monitor

Monitor Meteora DLMM pools for best yields and volume alerts. Built with TypeScript.

## Features

- **Yield Monitoring**: Find pools with highest APR + volume efficiency
- **Volume Alerts**: Detect pools with unusual volume spikes
- **Yield Score**: Custom scoring algorithm combining APR, TVL, and volume
- **Watch Mode**: Continuous monitoring with configurable intervals

## Tools

### monitor_pools.ts
Main monitoring tool with multiple modes:

```bash
# Single check - top 10 pools
npx ts-node monitor_pools.ts --min-apr 10 --top 10

# Watch mode - continuous monitoring
npx ts-node monitor_pools.ts --watch --interval 300

# With volume spike alerts
npx ts-node monitor_pools.ts --alert --min-volume 50000
```

### pool_alerts.ts
Simple alert system for high-yield pools:

```bash
npx ts-node pool_alerts.ts --min-apr 20 --min-volume 100000
```

## Installation

```bash
npm install
```

## Usage Examples

```bash
# Monitor top 5 pools with minimum 10% APR
npx ts-node monitor_pools.ts --min-apr 10 --top 5

# Alert on pools with >20% APR and >$100k volume
npx ts-node pool_alerts.ts --min-apr 20 --min-volume 100000

# Watch mode - check every 5 minutes
npx ts-node monitor_pools.ts --watch --interval 300 --alert
```

## API

Uses Meteora's DLMM API: `https://dlmm-api.meteora.ag/pair/all`

## Tech Stack

- TypeScript
- Node.js
- Axios for HTTP requests
