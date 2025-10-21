/**
 * Technical Indicators Calculator
 * Implements all major technical indicators for cryptocurrency analysis
 */

class TechnicalIndicators {
  /**
   * Simple Moving Average (SMA)
   */
  static calculateSMA(prices, period) {
    if (prices.length < period) return null;

    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  /**
   * Exponential Moving Average (EMA)
   */
  static calculateEMA(prices, period) {
    if (prices.length < period) return null;

    const k = 2 / (period + 1);
    const ema = [prices[0]];

    for (let i = 1; i < prices.length; i++) {
      ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }

    return ema;
  }

  /**
   * Relative Strength Index (RSI)
   */
  static calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;

    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const rsi = [];
    let avgGain = 0;
    let avgLoss = 0;

    // Initial average gain/loss
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) avgGain += changes[i];
      else avgLoss += Math.abs(changes[i]);
    }
    avgGain /= period;
    avgLoss /= period;

    // Calculate RSI
    for (let i = period; i < changes.length; i++) {
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));

      // Update averages
      const change = changes[i];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    return rsi;
  }

  /**
   * Moving Average Convergence Divergence (MACD)
   */
  static calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);

    if (!fastEMA || !slowEMA) return null;

    const macdLine = [];
    for (let i = 0; i < fastEMA.length; i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }

    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const histogram = [];

    if (signalLine) {
      for (let i = 0; i < signalLine.length; i++) {
        const macdIndex = i + (macdLine.length - signalLine.length);
        histogram.push(macdLine[macdIndex] - signalLine[i]);
      }
    }

    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  }

  /**
   * Bollinger Bands
   */
  static calculateBollingerBands(prices, period = 20, stdDev = 2) {
    const sma = this.calculateSMA(prices, period);
    if (!sma) return null;

    const upper = [];
    const lower = [];

    for (let i = 0; i < sma.length; i++) {
      const priceSlice = prices.slice(i, i + period);
      const mean = sma[i];
      const variance = priceSlice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const sd = Math.sqrt(variance);

      upper.push(mean + (sd * stdDev));
      lower.push(mean - (sd * stdDev));
    }

    return {
      upper,
      middle: sma,
      lower,
      bandwidth: upper.map((u, i) => ((u - lower[i]) / sma[i]) * 100)
    };
  }

  /**
   * Average True Range (ATR)
   */
  static calculateATR(ohlcData, period = 14) {
    if (ohlcData.length < period + 1) return null;

    const trueRanges = [];

    for (let i = 1; i < ohlcData.length; i++) {
      const high = ohlcData[i].high;
      const low = ohlcData[i].low;
      const prevClose = ohlcData[i - 1].close;

      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );

      trueRanges.push(tr);
    }

    // Calculate ATR using EMA
    const atr = [];
    let currentATR = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    atr.push(currentATR);

    for (let i = period; i < trueRanges.length; i++) {
      currentATR = ((currentATR * (period - 1)) + trueRanges[i]) / period;
      atr.push(currentATR);
    }

    return atr;
  }

  /**
   * Stochastic Oscillator
   */
  static calculateStochastic(ohlcData, period = 14, smoothK = 3, smoothD = 3) {
    if (ohlcData.length < period) return null;

    const percentK = [];

    for (let i = period - 1; i < ohlcData.length; i++) {
      const slice = ohlcData.slice(i - period + 1, i + 1);
      const high = Math.max(...slice.map(d => d.high));
      const low = Math.min(...slice.map(d => d.low));
      const close = ohlcData[i].close;

      const k = ((close - low) / (high - low)) * 100;
      percentK.push(k);
    }

    const smoothedK = this.calculateSMA(percentK, smoothK);
    const percentD = smoothedK ? this.calculateSMA(smoothedK, smoothD) : null;

    return {
      k: smoothedK,
      d: percentD
    };
  }

  /**
   * On-Balance Volume (OBV)
   */
  static calculateOBV(ohlcData) {
    if (ohlcData.length < 2) return null;

    const obv = [ohlcData[0].volume || 0];

    for (let i = 1; i < ohlcData.length; i++) {
      const prevOBV = obv[i - 1];
      const volume = ohlcData[i].volume || 0;

      if (ohlcData[i].close > ohlcData[i - 1].close) {
        obv.push(prevOBV + volume);
      } else if (ohlcData[i].close < ohlcData[i - 1].close) {
        obv.push(prevOBV - volume);
      } else {
        obv.push(prevOBV);
      }
    }

    return obv;
  }

  /**
   * Average Directional Index (ADX) - Trend Strength
   */
  static calculateADX(ohlcData, period = 14) {
    if (ohlcData.length < period * 2) return null;

    const plusDM = [];
    const minusDM = [];
    const tr = [];

    // Calculate +DM, -DM, and TR
    for (let i = 1; i < ohlcData.length; i++) {
      const highDiff = ohlcData[i].high - ohlcData[i - 1].high;
      const lowDiff = ohlcData[i - 1].low - ohlcData[i].low;

      plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
      minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);

      const trValue = Math.max(
        ohlcData[i].high - ohlcData[i].low,
        Math.abs(ohlcData[i].high - ohlcData[i - 1].close),
        Math.abs(ohlcData[i].low - ohlcData[i - 1].close)
      );
      tr.push(trValue);
    }

    // Smooth the values
    const smoothPlusDM = this.calculateEMA(plusDM, period);
    const smoothMinusDM = this.calculateEMA(minusDM, period);
    const smoothTR = this.calculateEMA(tr, period);

    if (!smoothPlusDM || !smoothMinusDM || !smoothTR) return null;

    // Calculate directional indicators
    const plusDI = smoothPlusDM.map((dm, i) => (dm / smoothTR[i]) * 100);
    const minusDI = smoothMinusDM.map((dm, i) => (dm / smoothTR[i]) * 100);

    // Calculate DX and ADX
    const dx = plusDI.map((pdi, i) => {
      const sum = pdi + minusDI[i];
      return sum === 0 ? 0 : (Math.abs(pdi - minusDI[i]) / sum) * 100;
    });

    const adx = this.calculateEMA(dx, period);

    return {
      adx: adx,
      plusDI: plusDI,
      minusDI: minusDI
    };
  }

  /**
   * Commodity Channel Index (CCI)
   */
  static calculateCCI(ohlcData, period = 20) {
    if (ohlcData.length < period) return null;

    const typicalPrices = ohlcData.map(d => (d.high + d.low + d.close) / 3);
    const cci = [];

    for (let i = period - 1; i < typicalPrices.length; i++) {
      const slice = typicalPrices.slice(i - period + 1, i + 1);
      const sma = slice.reduce((a, b) => a + b, 0) / period;
      const meanDeviation = slice.reduce((sum, tp) => sum + Math.abs(tp - sma), 0) / period;

      const cciValue = (typicalPrices[i] - sma) / (0.015 * meanDeviation);
      cci.push(cciValue);
    }

    return cci;
  }

  /**
   * Rate of Change (ROC)
   */
  static calculateROC(prices, period = 12) {
    if (prices.length < period + 1) return null;

    const roc = [];
    for (let i = period; i < prices.length; i++) {
      const change = ((prices[i] - prices[i - period]) / prices[i - period]) * 100;
      roc.push(change);
    }

    return roc;
  }

  /**
   * Support and Resistance Levels
   */
  static calculateSupportResistance(ohlcData, lookback = 50) {
    if (ohlcData.length < lookback) return null;

    const recentData = ohlcData.slice(-lookback);
    const highs = recentData.map(d => d.high);
    const lows = recentData.map(d => d.low);

    // Find local maxima and minima
    const resistanceLevels = [];
    const supportLevels = [];

    for (let i = 2; i < recentData.length - 2; i++) {
      // Resistance (local maximum)
      if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] &&
          highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
        resistanceLevels.push(highs[i]);
      }

      // Support (local minimum)
      if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] &&
          lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
        supportLevels.push(lows[i]);
      }
    }

    // Cluster nearby levels
    const clusterLevels = (levels) => {
      if (levels.length === 0) return [];

      const sorted = levels.sort((a, b) => a - b);
      const clustered = [];
      let currentCluster = [sorted[0]];

      for (let i = 1; i < sorted.length; i++) {
        if ((sorted[i] - sorted[i - 1]) / sorted[i - 1] < 0.02) { // Within 2%
          currentCluster.push(sorted[i]);
        } else {
          clustered.push(currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length);
          currentCluster = [sorted[i]];
        }
      }

      clustered.push(currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length);
      return clustered;
    };

    return {
      resistance: clusterLevels(resistanceLevels).slice(-3), // Top 3 resistance
      support: clusterLevels(supportLevels).slice(0, 3)      // Top 3 support
    };
  }

  /**
   * Volatility calculation (Historical Volatility)
   */
  static calculateVolatility(prices, period = 30) {
    if (prices.length < period + 1) return null;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }

    const volatility = [];
    for (let i = period - 1; i < returns.length; i++) {
      const slice = returns.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / period;
      const vol = Math.sqrt(variance) * Math.sqrt(365) * 100; // Annualized %

      volatility.push(vol);
    }

    return volatility;
  }

  /**
   * Volume Moving Average
   */
  static calculateVolumeMA(volumes, period = 20) {
    return this.calculateSMA(volumes, period);
  }

  /**
   * Ichimoku Cloud
   */
  static calculateIchimoku(ohlcData) {
    if (ohlcData.length < 52) return null;

    const calculateDonchian = (data, period) => {
      const result = [];
      for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        result.push((high + low) / 2);
      }
      return result;
    };

    const tenkanSen = calculateDonchian(ohlcData, 9);   // Conversion Line
    const kijunSen = calculateDonchian(ohlcData, 26);   // Base Line

    const senkouSpanA = [];
    const senkouSpanB = calculateDonchian(ohlcData, 52); // Leading Span B

    // Senkou Span A (shifted forward 26 periods)
    for (let i = 0; i < Math.min(tenkanSen.length, kijunSen.length); i++) {
      senkouSpanA.push((tenkanSen[i] + kijunSen[i]) / 2);
    }

    // Chikou Span (closing price shifted back 26 periods)
    const chikouSpan = ohlcData.slice(0, -26).map(d => d.close);

    return {
      tenkanSen,
      kijunSen,
      senkouSpanA,
      senkouSpanB,
      chikouSpan
    };
  }
}

module.exports = TechnicalIndicators;
