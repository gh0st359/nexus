# Crypto Analysis Pro

**Professional Cryptocurrency Market Analysis with Honest, Probabilistic Predictions**

## Overview

A desktop application for macOS that provides honest, probabilistic cryptocurrency market analysis based on quantitative data analysis. This application prioritizes transparency and realistic predictions over false confidence.

## Core Features

### 🎯 Honest, Probabilistic Predictions
- Probabilities instead of certainties (e.g., "60% probability of upward movement")
- Confidence intervals and error margins
- Historical accuracy tracking
- Transparent about limitations

### 📊 Comprehensive Technical Analysis
- **Trend Analysis**: Moving Averages (20/50/200 day), ADX, Ichimoku Cloud
- **Momentum**: RSI, MACD, Stochastic Oscillator, CCI, ROC
- **Volatility**: Bollinger Bands, ATR, Historical Volatility
- **Volume**: Volume MA, On-Balance Volume
- **Support/Resistance**: Automated level detection

### 📈 Real-time Market Data
- 500+ cryptocurrencies tracked
- Live price updates every 30 seconds
- Historical charts (7/30/90 day views)
- Market cap, volume, and supply metrics

### ⚠️ Risk Management Tools
- Volatility risk scoring (1-10)
- Liquidity risk analysis
- Maximum drawdown potential
- Position size calculator
- Stop-loss recommendations

### 📚 Educational Content
- Detailed explanations of all indicators
- How to interpret predictions
- Risk management best practices
- Market condition context

## Installation

### Prerequisites
- macOS 10.15+
- Node.js 16.x+
- npm 7.x+

### Quick Start
```bash
# Install dependencies
npm install

# Start the application
npm start
```

### Production Build
```bash
npm run build
npm run package
```

## Usage Guide

### Getting Started
1. Launch the application
2. Browse cryptocurrencies in the left sidebar
3. Click any cryptocurrency to view analysis
4. Add favorites using the star icon

### Understanding Predictions

**Short-term (24 hours)**
- Probability of price direction
- Expected price range
- Confidence level based on volatility

**Medium-term (7 days)**
- Weekly trend probability
- Wider range due to longer timeframe
- Lower confidence (as expected)

### Interpreting Historical Accuracy
- **70%+**: Excellent performance
- **60-70%**: Good, better than chance
- **50-60%**: Fair, use with caution
- **<50%**: Poor, do not rely on predictions

### Risk Management
1. Navigate to Risk Assessment tab
2. Enter portfolio value
3. Set risk percentage (1-2% recommended)
4. View calculated position size
5. Use recommended stop-loss levels

## How It Works

### Data Pipeline
1. Fetch from CoinGecko API (primary)
2. Fallback to CoinCap if needed
3. Cache in local SQLite database
4. Update prices every 30 seconds
5. Recalculate indicators every 2 minutes

### Prediction Algorithm
1. Calculate all technical indicators
2. Score each category (-1 to +1)
3. Apply historical performance weights
4. Generate probability distribution
5. Adjust confidence for volatility
6. Track prediction for accuracy evaluation

### Accuracy Tracking
- All predictions saved to database
- Evaluated after timeframe elapses
- Actual vs predicted outcome recorded
- Statistics updated automatically
- Displayed prominently to users

## Important Limitations

### What This Tool Cannot Do
- ✗ Predict the future with certainty
- ✗ Account for unexpected news/events
- ✗ Guarantee profits or prevent losses
- ✗ Replace professional financial advice

### When It Works Better
- ✓ Trending markets (clear direction)
- ✓ High liquidity (good volume)
- ✓ Stable market conditions

### When It Works Worse
- ✗ Choppy/sideways markets
- ✗ Low liquidity conditions
- ✗ Major news events
- ✗ Market manipulation

## Technology Stack
- **Frontend**: React, CSS
- **Backend**: Node.js, Electron
- **Database**: SQLite
- **APIs**: CoinGecko, CoinCap
- **Charts**: HTML5 Canvas

## File Structure
```
src/
├── main/               # Electron main process
├── renderer/           # React frontend
│   ├── components/     # UI components
│   └── styles/         # CSS styles
├── analysis/           # Prediction algorithms
│   ├── indicators/     # Technical indicators
│   └── predictions/    # Prediction engine
├── api/                # Data fetching
├── database/           # SQLite operations
└── utils/              # Helper functions
```

## Disclaimer

⚠️ **FOR EDUCATIONAL PURPOSES ONLY - NOT FINANCIAL ADVICE**

- Cryptocurrency markets are extremely volatile and risky
- Past performance does not guarantee future results
- You can lose all of your invested capital
- Only invest what you can afford to lose
- Consult a licensed financial advisor before significant investments

The creators accept no liability for trading losses.

## License

MIT License - See LICENSE file for details.
