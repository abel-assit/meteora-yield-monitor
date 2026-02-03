# Meteora Yield Monitor v2 🚀

Enhanced yield monitoring for Meteora DLMM pools on Solana. Full-featured Next.js application with real-time alerts, yield calculations, and beautiful UI.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

## ✨ Features

### 📊 Dashboard
- Live pool data from Meteora DLMM API
- Advanced filtering (APR, TVL, Volume, Token)
- Sorting by yield score, APR, TVL, or volume
- Top opportunity highlighting
- Historical price charts

### 🔔 Alert System
- Volume spike detection (>50% increase)
- TVL drop alerts
- High APR notifications
- Real-time monitoring toggle

### 🧮 Yield Calculator
- Daily/Monthly/Yearly projections
- APY calculations with compounding
- Impermanent loss risk assessment
- Interactive sliders

### ⚙️ Settings
- Customizable alert thresholds
- Min APR, TVL, Volume filters
- Persistent configuration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Solana**: `@solana/react-hooks` + `@solana/client`
- **Testing**: Jest + ts-jest
- **API**: Meteora DLMM API

## 📁 Project Structure

```
meteora-yield-monitor-v2/
├── app/                    # Next.js app router
│   ├── page.tsx           # Main dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── PoolDashboard.tsx
│   ├── PoolCard.tsx
│   ├── PoolChart.tsx
│   ├── AlertPanel.tsx
│   ├── YieldCalculatorPanel.tsx
│   ├── SettingsPanel.tsx
│   └── PoolFilters.tsx
├── lib/                   # Utilities
│   ├── meteora-api.ts    # API client
│   └── yield-calculator.ts
├── types/                 # TypeScript types
│   └── index.ts
├── __tests__/            # Test suite
│   ├── meteora-api.test.ts
│   └── yield-calculator.test.ts
└── package.json
```

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/abel-assit/meteora-yield-monitor-v2.git
cd meteora-yield-monitor-v2

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🧪 Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- Yield calculation algorithms
- API client methods
- Alert detection logic

## 📝 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
```

## 🏆 Built For

Colosseum Agent Hackathon - $100,000 USDC prize pool

## 📄 License

MIT

## 🔗 Links

- **Live Demo**: Coming soon
- **Original v1**: https://github.com/abel-assit/meteora-yield-monitor
- **Hackathon**: https://colosseum.com/agent-hackathon
