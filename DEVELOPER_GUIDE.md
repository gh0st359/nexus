# Developer Guide - Crypto Analysis Pro

## Architecture Overview

### Technology Stack

- **Frontend**: React 18.2
- **UI Framework**: Custom CSS (Dark theme)
- **Backend**: Node.js with Electron 28
- **Database**: SQLite (better-sqlite3)
- **Build Tool**: Webpack 5
- **APIs**: CoinGecko (primary), CoinCap (fallback)

### Application Architecture

```
┌─────────────────────────────────────┐
│         Electron Main Process        │
│  - Window Management                 │
│  - Background Tasks                  │
│  - IPC Communication                 │
└──────────┬─────────────────────┬────┘
           │                     │
    ┌──────▼──────┐       ┌─────▼──────┐
    │   Database  │       │ Data Fetcher│
    │   (SQLite)  │       │  (APIs)     │
    └─────────────┘       └─────────────┘
                               │
                        ┌──────▼──────────┐
                        │  Prediction     │
                        │  Engine         │
                        └──────┬──────────┘
                               │
                        ┌──────▼──────────┐
                        │  Technical      │
                        │  Indicators     │
                        └─────────────────┘
```

## Directory Structure

```
crypto-analysis-pro/
├── src/
│   ├── main/
│   │   └── index.js                 # Electron main process
│   │
│   ├── renderer/
│   │   ├── index.js                 # React entry point
│   │   ├── App.jsx                  # Main app component
│   │   ├── components/
│   │   │   ├── CryptoSidebar.jsx
│   │   │   ├── AnalysisPanel.jsx
│   │   │   ├── ProbabilisticPrediction.jsx
│   │   │   ├── SignalAggregator.jsx
│   │   │   ├── TechnicalIndicators.jsx
│   │   │   ├── RiskAssessment.jsx
│   │   │   ├── DisclaimerBanner.jsx
│   │   │   ├── AccuracyTracker.jsx
│   │   │   └── PriceChart.jsx
│   │   └── styles/
│   │       ├── app.css
│   │       ├── sidebar.css
│   │       ├── analysis-panel.css
│   │       ├── prediction.css
│   │       ├── signals.css
│   │       ├── indicators.css
│   │       ├── risk.css
│   │       ├── disclaimer.css
│   │       ├── accuracy.css
│   │       └── chart.css
│   │
│   ├── analysis/
│   │   ├── indicators/
│   │   │   └── technicalIndicators.js   # All TA indicators
│   │   └── predictions/
│   │       └── engine.js                 # Prediction engine
│   │
│   ├── api/
│   │   └── dataFetcher.js               # API client
│   │
│   ├── database/
│   │   └── database.js                  # SQLite operations
│   │
│   └── utils/
│       └── (helper functions)
│
├── package.json
├── webpack.renderer.config.js
├── install.sh
├── CRYPTO_ANALYSIS_APP.md
└── DEVELOPER_GUIDE.md
```

## Core Components

### 1. Main Process (src/main/index.js)

**Responsibilities:**
- Create and manage browser window
- Handle IPC communication
- Run background tasks
- Manage application lifecycle

**Key Functions:**
- `createWindow()`: Creates the main browser window
- `initializeServices()`: Initializes database, data fetcher, prediction engine
- `startBackgroundTasks()`: Starts periodic update tasks

**IPC Handlers:**
- `get-crypto-list`: Fetch cryptocurrency list
- `get-crypto-details`: Get detailed info for a crypto
- `get-analysis`: Get technical analysis
- `get-prediction`: Generate prediction
- `toggle-watchlist`: Add/remove from watchlist
- `get-historical-accuracy`: Fetch accuracy statistics
- `get-price-history`: Get historical price data

### 2. Database (src/database/database.js)

**Schema:**

**cryptocurrencies table:**
- Stores cryptocurrency metadata
- Current prices and market data
- Watchlist status

**price_history table:**
- Historical price points
- Volume and market cap
- Used for chart display and indicator calculation

**indicators table:**
- Cached technical indicator values
- Metadata about calculation

**predictions table:**
- All predictions made by the system
- Expected vs actual outcomes
- Used for accuracy tracking

**patterns table:**
- Detected chart patterns
- Expected vs actual outcomes

**Key Methods:**
- `upsertCryptocurrency()`: Insert or update crypto data
- `getCryptocurrencyList()`: Retrieve filtered list
- `savePrediction()`: Store prediction for tracking
- `evaluatePredictions()`: Check past predictions against actual outcomes
- `getHistoricalAccuracy()`: Calculate accuracy statistics

### 3. Data Fetcher (src/api/dataFetcher.js)

**Responsibilities:**
- Fetch data from CoinGecko/CoinCap APIs
- Implement rate limiting
- Handle API errors and fallbacks
- Cache data locally

**Rate Limiting:**
- CoinGecko: 50 calls/minute (1200ms between calls)
- Queue-based request management
- Automatic retry with exponential backoff

**Key Methods:**
- `updateCryptocurrencyList()`: Fetch top 500 cryptos
- `updatePrices()`: Update prices for watchlist
- `getCryptoDetails()`: Get detailed info
- `getPriceHistory()`: Fetch historical data
- `getOHLCVData()`: Get OHLC candlestick data

### 4. Technical Indicators (src/analysis/indicators/technicalIndicators.js)

All indicators implemented as static methods:

**Trend Indicators:**
- `calculateSMA()`: Simple Moving Average
- `calculateEMA()`: Exponential Moving Average
- `calculateADX()`: Average Directional Index
- `calculateIchimoku()`: Ichimoku Cloud

**Momentum Indicators:**
- `calculateRSI()`: Relative Strength Index
- `calculateMACD()`: Moving Average Convergence Divergence
- `calculateStochastic()`: Stochastic Oscillator
- `calculateCCI()`: Commodity Channel Index
- `calculateROC()`: Rate of Change

**Volatility Indicators:**
- `calculateBollingerBands()`: Bollinger Bands
- `calculateATR()`: Average True Range
- `calculateVolatility()`: Historical Volatility

**Volume Indicators:**
- `calculateOBV()`: On-Balance Volume
- `calculateVolumeMA()`: Volume Moving Average

**Support/Resistance:**
- `calculateSupportResistance()`: Detect key levels

### 5. Prediction Engine (src/analysis/predictions/engine.js)

**Prediction Pipeline:**

1. **Data Collection**
   ```javascript
   const priceHistory = await database.getPriceHistory(cryptoId, 90);
   const ohlcData = constructOHLC(priceHistory);
   ```

2. **Indicator Calculation**
   ```javascript
   const indicators = {
     sma20, sma50, sma200,
     rsi, macd, stochastic,
     bollingerBands, atr,
     obv, supportResistance,
     // ... etc
   };
   ```

3. **Scoring Each Category**
   ```javascript
   const trendScore = analyzeTrend(indicators);       // -1 to +1
   const momentumScore = analyzeMomentum(indicators); // -1 to +1
   const volatilityScore = analyzeVolatility(indicators);
   const volumeScore = analyzeVolume(indicators);
   const srScore = analyzeSupportResistance(indicators);
   ```

4. **Composite Score Calculation**
   ```javascript
   const compositeScore =
     trendScore * 0.25 +
     momentumScore * 0.20 +
     volatilityScore * 0.15 +
     volumeScore * 0.15 +
     srScore * 0.15;
   ```

5. **Probability Distribution**
   ```javascript
   const probability = generateProbabilityDistribution(
     compositeScore,
     volatilityScore,
     currentPrice
   );
   ```

6. **Confidence Adjustment**
   - High volatility = lower confidence
   - Low volatility = higher confidence
   - Historical accuracy incorporated

**Indicator Weights:**
- Trend: 25%
- Momentum: 20%
- Volatility: 15%
- Volume: 15%
- Support/Resistance: 15%
- Patterns: 10% (future)

### 6. React Components

**Component Hierarchy:**
```
App
├── DisclaimerBanner
├── CryptoSidebar
│   └── CryptoItem (repeated)
└── AnalysisPanel
    ├── PriceChart
    ├── SignalAggregator
    ├── ProbabilisticPrediction
    ├── TechnicalIndicators
    └── RiskAssessment
```

**State Management:**
- Uses React hooks (useState, useEffect)
- IPC communication with main process
- No external state management library (Redux, etc.)

**Data Flow:**
1. User selects cryptocurrency in sidebar
2. AnalysisPanel requests data via IPC
3. Main process queries database/APIs
4. Prediction engine generates analysis
5. Results sent back to renderer
6. Components update with new data

## Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run dev

# Production mode
npm start
```

### Building for Production

```bash
# Build renderer and main
npm run build

# Package for macOS
npm run package
```

### Adding a New Technical Indicator

1. **Add calculation method** in `src/analysis/indicators/technicalIndicators.js`:

```javascript
static calculateMyIndicator(prices, period = 14) {
  // Implementation
  return result;
}
```

2. **Use in prediction engine** in `src/analysis/predictions/engine.js`:

```javascript
const indicators = {
  // ... existing indicators
  myIndicator: TechnicalIndicators.calculateMyIndicator(prices)
};
```

3. **Score the indicator**:

```javascript
analyzeMyCategory(indicators) {
  const signals = [];
  let score = 0;

  const value = indicators.myIndicator[indicators.myIndicator.length - 1];

  if (value > threshold) {
    score += 0.3;
    signals.push('Bullish signal from my indicator');
  }

  return { score, signals };
}
```

4. **Update composite score**:

```javascript
const myScore = this.analyzeMyCategory(indicators);
const compositeScore =
  trendScore * 0.25 +
  myScore * 0.10 +  // Add new category
  // ... adjust other weights
```

### Adding a New Component

1. **Create component file** in `src/renderer/components/`:

```javascript
import React from 'react';
import '../styles/my-component.css';

function MyComponent({ data }) {
  return (
    <div className="my-component">
      {/* Component JSX */}
    </div>
  );
}

export default MyComponent;
```

2. **Create stylesheet** in `src/renderer/styles/my-component.css`

3. **Import in parent component**:

```javascript
import MyComponent from './components/MyComponent';
```

## API Integration

### CoinGecko API Endpoints Used

```javascript
// Market data
GET /coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1

// Coin details
GET /coins/{id}?localization=false&tickers=false

// Price data
GET /simple/price?ids={ids}&vs_currencies=usd&include_24hr_change=true

// Historical data
GET /coins/{id}/market_chart?vs_currency=usd&days=30

// OHLC data
GET /coins/{id}/ohlc?vs_currency=usd&days=30
```

### Rate Limiting Strategy

```javascript
class DataFetcher {
  constructor() {
    this.requestQueue = [];
    this.lastCall = 0;
    this.minInterval = 1200; // ms
  }

  async coinGeckoRequest(endpoint, params) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ endpoint, params, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    while (this.requestQueue.length > 0) {
      const timeSinceLastCall = Date.now() - this.lastCall;
      if (timeSinceLastCall < this.minInterval) {
        await this.sleep(this.minInterval - timeSinceLastCall);
      }

      const request = this.requestQueue.shift();
      // Make API call
      this.lastCall = Date.now();
    }
  }
}
```

## Testing

### Running Tests

```bash
npm test
```

### Test Structure

```javascript
describe('TechnicalIndicators', () => {
  describe('calculateSMA', () => {
    it('should calculate simple moving average correctly', () => {
      const prices = [10, 12, 14, 16, 18];
      const period = 3;
      const result = TechnicalIndicators.calculateSMA(prices, period);

      expect(result).toEqual([12, 14, 16]); // (10+12+14)/3, (12+14+16)/3, (14+16+18)/3
    });
  });
});
```

### Manual Testing Checklist

- [ ] Cryptocurrency list loads
- [ ] Search and filters work
- [ ] Clicking a crypto loads analysis
- [ ] Chart displays correctly
- [ ] All indicators calculate
- [ ] Prediction displays with probabilities
- [ ] Historical accuracy shows
- [ ] Risk assessment calculates
- [ ] Position size calculator works
- [ ] Watchlist toggle works
- [ ] Real-time updates occur

## Performance Optimization

### Database Indexes

```sql
CREATE INDEX idx_price_history_crypto ON price_history(crypto_id, timestamp DESC);
CREATE INDEX idx_indicators_crypto ON indicators(crypto_id, timestamp DESC);
CREATE INDEX idx_predictions_crypto ON predictions(crypto_id, created_at DESC);
```

### Caching Strategy

- Cache cryptocurrency list for 5 minutes
- Cache individual crypto details for 1 minute
- Cache indicator values for 2 minutes
- Store price history locally

### Background Tasks

- Update crypto list: Every 5 minutes
- Update prices: Every 30 seconds (watchlist only)
- Recalculate indicators: Every 2 minutes
- Evaluate predictions: Every 1 hour

## Troubleshooting

### Common Issues

**Issue**: Application won't start

- Check Node.js version (16.x+)
- Delete `node_modules` and run `npm install`
- Check for port conflicts (8080)

**Issue**: No data loading

- Check internet connection
- Verify API keys (if using paid tier)
- Check console for API errors
- Try fallback API (CoinCap)

**Issue**: Indicators not calculating

- Verify price history has enough data points
- Check console for calculation errors
- Ensure OHLC data is properly formatted

**Issue**: Database errors

- Delete database file and restart (will rebuild)
- Check file permissions
- Verify SQLite is properly installed

## Code Style Guide

### JavaScript/JSX

- Use const/let, never var
- Prefer arrow functions
- Use async/await over promises
- PropTypes for all components
- Meaningful variable names

### CSS

- BEM naming convention
- Mobile-first approach
- CSS variables for colors/spacing
- No !important unless absolutely necessary

### Comments

```javascript
/**
 * Calculate Simple Moving Average
 * @param {number[]} prices - Array of prices
 * @param {number} period - Number of periods
 * @returns {number[]} Array of SMA values
 */
static calculateSMA(prices, period) {
  // Implementation
}
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/my-feature`)
3. Make changes
4. Add tests
5. Run tests (`npm test`)
6. Commit (`git commit -m 'Add my feature'`)
7. Push (`git push origin feature/my-feature`)
8. Create Pull Request

## License

MIT License - See LICENSE file for details.

## Contact

For questions or issues:
- GitHub Issues: [link]
- Email: [contact]
