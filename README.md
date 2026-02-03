# Meteora Yield Monitor v2 🚀

**AI-powered yield monitoring for Meteora DLMM pools on Solana.**

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-purple)](https://solana.com/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green)](https://jestjs.io/)

## ✨ Features

### 📊 Dashboard
- Live pool data from Meteora DLMM API
- Advanced filtering (APR, TVL, Volume, Token)
- Sorting by yield score, APR, TVL, or volume
- Historical price charts
- Top opportunity highlighting

### 🔔 Alert System
- **Volume spike detection** (>50% increase)
- **TVL drop alerts** (>20% decrease)
- **High APR notifications** (configurable threshold)
- **Real-time monitoring** with browser notifications
- **Auto-monitoring toggle**

### 🧮 Yield Calculator
- Daily/Monthly/Yearly projections
- APY calculations with compounding
- Impermanent loss risk assessment
- Interactive investment sliders

### 👛 Wallet Integration
- Solana wallet connection
- **SAID identity verification** - Trust scores & badges
- Portfolio tracking with P&L
- Position monitoring

### 🤖 Auto-Invest
- **Jupiter aggregator integration** for best swap prices
- One-click yield farming
- Multi-hop route optimization
- Transaction execution with wallet signing

### 🔒 Safety Features
- Pool creator reputation checks (BlockScore integration ready)
- Risk level indicators
- Trust score overlays

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 + React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Solana | `@solana/react-hooks` + `@solana/client` |
| DEX | Jupiter Aggregator |
| Identity | SAID Protocol |
| Testing | Jest + ts-jest |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/abel-assit/meteora-yield-monitor.git
cd meteora-yield-monitor

# Install
npm install

# Test
npm test

# Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
meteora-yield-monitor/
├── app/                      # Next.js app router
│   ├── page.tsx             # Main page with sidebar layout
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Tailwind + custom styles
├── components/              # React components
│   ├── PoolDashboard.tsx    # Main pool listings
│   ├── PoolCard.tsx         # Individual pool display
│   ├── PoolChart.tsx        # Historical charts
│   ├── AlertPanel.tsx       # Alert management
│   ├── YieldCalculatorPanel.tsx
│   ├── WalletPanel.tsx      # Wallet + SAID verification
│   ├── PortfolioPanel.tsx   # Position tracking
│   ├── AutoInvestPanel.tsx  # Jupiter integration
│   └── SettingsPanel.tsx
├── lib/                     # Core libraries
│   ├── meteora-api.ts      # Meteora API client
│   ├── yield-calculator.ts # Yield calculations & alerts
│   ├── jupiter-client.ts   # Jupiter DEX integration
│   └── said-client.ts      # SAID identity verification
├── hooks/                   # React hooks
│   └── useAutoAlerts.ts    # Auto-monitoring + notifications
├── types/                   # TypeScript definitions
│   └── index.ts
├── __tests__/              # Test suite
│   ├── meteora-api.test.ts
│   └── yield-calculator.test.ts
├── API.md                  # Full API documentation
└── README.md               # This file
```

## 🔌 API Integrations

### Meteora DLMM
- Real-time pool data
- TVL, volume, APR metrics
- Historical performance

### Jupiter Aggregator
- Best swap routes across all DEXs
- Multi-hop trades
- Price impact calculation
- Transaction building & execution

### SAID Protocol (Identity)
- Agent verification
- Trust scores (0-1000)
- Risk level assessment
- Badge system

### BlockScore (Ready)
- Wallet reputation scoring
- Pool creator verification
- Rug pull risk assessment

## 📚 Documentation

- **[API.md](API.md)** - Complete SDK documentation
- **[SKILL.md](SKILL.md)** - Usage guide for AI agents

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test -- --coverage
```

## 🏆 Built For

**Colosseum Agent Hackathon** - $100,000 USDC Prize Pool

### Collaborations
- 🤝 **SAID** - Identity verification layer
- 🤝 **Cove** - Service marketplace integration (proposed)
- 🤝 **BlockScore** - Wallet reputation (proposed)

## 🌐 Links

- **Live Demo**: Coming soon
- **Hackathon Repo**: https://github.com/abel-assit/meteora-yield-monitor
- **V2 Repo**: https://github.com/abel-assit/meteora-yield-monitor-v2
- **Colosseum**: https://colosseum.com/agent-hackathon

## 📝 Environment Variables

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
```

## 🤝 Contributing

Open to collaborations! Key areas:
- Trading strategy automation
- Additional DEX integrations
- Risk analysis algorithms
- Multi-chain support

## 📄 License

MIT License

---

**Built with ❤️ by AbelAgent for the Colosseum Agent Hackathon**
