/**
 * Probabilistic Prediction Engine
 * Generates honest, probabilistic market predictions based on technical analysis
 */

const TechnicalIndicators = require('../indicators/technicalIndicators');

class PredictionEngine {
  constructor(database) {
    this.database = database;

    // Historical weights for indicators (adjusted based on backtesting)
    this.indicatorWeights = {
      trend: 0.25,
      momentum: 0.20,
      volatility: 0.15,
      volume: 0.15,
      support_resistance: 0.15,
      patterns: 0.10
    };

    // Confidence thresholds
    this.confidenceThresholds = {
      veryHigh: 0.85,
      high: 0.70,
      medium: 0.50,
      low: 0.30
    };
  }

  /**
   * Generate complete analysis for a cryptocurrency
   */
  async getAnalysis(cryptoId) {
    try {
      const dataFetcher = require('../../api/dataFetcher');
      const priceHistory = await this.database.getPriceHistory(cryptoId, 90);
      const ohlcData = this.constructOHLC(priceHistory);

      if (!ohlcData || ohlcData.length < 50) {
        return null;
      }

      const prices = ohlcData.map(d => d.close);
      const volumes = ohlcData.map(d => d.volume);

      // Calculate all indicators
      const indicators = {
        // Trend indicators
        sma20: TechnicalIndicators.calculateSMA(prices, 20),
        sma50: TechnicalIndicators.calculateSMA(prices, 50),
        sma200: TechnicalIndicators.calculateSMA(prices, 200),
        ema12: TechnicalIndicators.calculateEMA(prices, 12),
        ema26: TechnicalIndicators.calculateEMA(prices, 26),

        // Momentum indicators
        rsi: TechnicalIndicators.calculateRSI(prices, 14),
        macd: TechnicalIndicators.calculateMACD(prices),
        stochastic: TechnicalIndicators.calculateStochastic(ohlcData),
        cci: TechnicalIndicators.calculateCCI(ohlcData),
        roc: TechnicalIndicators.calculateROC(prices),

        // Volatility indicators
        bollingerBands: TechnicalIndicators.calculateBollingerBands(prices),
        atr: TechnicalIndicators.calculateATR(ohlcData),
        volatility: TechnicalIndicators.calculateVolatility(prices),

        // Volume indicators
        volumeMA: TechnicalIndicators.calculateVolumeMA(volumes, 20),
        obv: TechnicalIndicators.calculateOBV(ohlcData),

        // Support/Resistance
        supportResistance: TechnicalIndicators.calculateSupportResistance(ohlcData),

        // Trend strength
        adx: TechnicalIndicators.calculateADX(ohlcData),
        ichimoku: TechnicalIndicators.calculateIchimoku(ohlcData)
      };

      // Save indicators to database
      const timestamp = Date.now();
      for (const [type, value] of Object.entries(indicators)) {
        if (value !== null) {
          this.database.saveIndicator(
            cryptoId,
            type,
            Array.isArray(value) ? value[value.length - 1] : JSON.stringify(value),
            { timestamp }
          );
        }
      }

      return {
        indicators,
        currentPrice: prices[prices.length - 1],
        timestamp
      };
    } catch (error) {
      console.error(`Error analyzing ${cryptoId}:`, error);
      return null;
    }
  }

  /**
   * Generate probabilistic prediction
   */
  async generatePrediction(cryptoId) {
    const analysis = await this.getAnalysis(cryptoId);

    if (!analysis) {
      return null;
    }

    const { indicators, currentPrice } = analysis;

    // Score each category
    const trendScore = this.analyzeTrend(indicators, currentPrice);
    const momentumScore = this.analyzeMomentum(indicators);
    const volatilityScore = this.analyzeVolatility(indicators);
    const volumeScore = this.analyzeVolume(indicators);
    const supportResistanceScore = this.analyzeSupportResistance(indicators, currentPrice);

    // Calculate composite score (-1 to +1)
    const compositeScore = (
      trendScore.score * this.indicatorWeights.trend +
      momentumScore.score * this.indicatorWeights.momentum +
      volatilityScore.score * this.indicatorWeights.volatility +
      volumeScore.score * this.indicatorWeights.volume +
      supportResistanceScore.score * this.indicatorWeights.support_resistance
    );

    // Generate probability distribution
    const prediction = this.generateProbabilityDistribution(
      compositeScore,
      volatilityScore,
      currentPrice
    );

    // Add reasoning and signals
    prediction.signals = {
      trend: trendScore,
      momentum: momentumScore,
      volatility: volatilityScore,
      volume: volumeScore,
      supportResistance: supportResistanceScore
    };

    prediction.bullishSignals = this.countBullishSignals(prediction.signals);
    prediction.bearishSignals = this.countBearishSignals(prediction.signals);
    prediction.neutralSignals = this.countNeutralSignals(prediction.signals);

    // Get historical accuracy for similar conditions
    prediction.historicalAccuracy = await this.getHistoricalAccuracyForConditions(
      compositeScore,
      volatilityScore.volatilityLevel
    );

    // Risk assessment
    prediction.risk = this.assessRisk(indicators, currentPrice, volatilityScore);

    // Save prediction to database for later accuracy tracking
    this.savePredictionForTracking(cryptoId, prediction, currentPrice);

    return prediction;
  }

  /**
   * Analyze trend indicators
   */
  analyzeTrend(indicators, currentPrice) {
    const signals = [];
    let score = 0;

    // Moving average analysis
    const sma20 = indicators.sma20?.[indicators.sma20.length - 1];
    const sma50 = indicators.sma50?.[indicators.sma50.length - 1];
    const sma200 = indicators.sma200?.[indicators.sma200.length - 1];

    if (sma20 && sma50 && sma200) {
      // Price vs MAs
      if (currentPrice > sma20) {
        score += 0.2;
        signals.push('Price above 20-day MA (bullish)');
      } else {
        score -= 0.2;
        signals.push('Price below 20-day MA (bearish)');
      }

      if (currentPrice > sma50) {
        score += 0.15;
        signals.push('Price above 50-day MA (bullish)');
      } else {
        score -= 0.15;
        signals.push('Price below 50-day MA (bearish)');
      }

      // Golden cross / Death cross
      if (sma50 > sma200) {
        score += 0.25;
        signals.push('Golden cross present (bullish)');
      } else if (sma50 < sma200) {
        score -= 0.25;
        signals.push('Death cross present (bearish)');
      }

      // MA alignment
      if (sma20 > sma50 && sma50 > sma200) {
        score += 0.2;
        signals.push('MAs in bullish alignment');
      } else if (sma20 < sma50 && sma50 < sma200) {
        score -= 0.2;
        signals.push('MAs in bearish alignment');
      }
    }

    // ADX trend strength
    if (indicators.adx?.adx) {
      const adx = indicators.adx.adx[indicators.adx.adx.length - 1];
      const plusDI = indicators.adx.plusDI[indicators.adx.plusDI.length - 1];
      const minusDI = indicators.adx.minusDI[indicators.adx.minusDI.length - 1];

      if (adx > 25) {
        if (plusDI > minusDI) {
          score += 0.2;
          signals.push(`Strong uptrend detected (ADX: ${adx.toFixed(1)})`);
        } else {
          score -= 0.2;
          signals.push(`Strong downtrend detected (ADX: ${adx.toFixed(1)})`);
        }
      } else {
        signals.push(`Weak trend (ADX: ${adx.toFixed(1)})`);
      }
    }

    // Normalize score to -1 to +1
    score = Math.max(-1, Math.min(1, score));

    return {
      score,
      signals,
      strength: Math.abs(score)
    };
  }

  /**
   * Analyze momentum indicators
   */
  analyzeMomentum(indicators) {
    const signals = [];
    let score = 0;

    // RSI
    if (indicators.rsi) {
      const rsi = indicators.rsi[indicators.rsi.length - 1];

      if (rsi < 30) {
        score += 0.3;
        signals.push(`RSI oversold (${rsi.toFixed(1)}) - potential bounce`);
      } else if (rsi > 70) {
        score -= 0.3;
        signals.push(`RSI overbought (${rsi.toFixed(1)}) - potential pullback`);
      } else if (rsi > 50 && rsi < 70) {
        score += 0.1;
        signals.push(`RSI bullish (${rsi.toFixed(1)})`);
      } else if (rsi < 50 && rsi > 30) {
        score -= 0.1;
        signals.push(`RSI bearish (${rsi.toFixed(1)})`);
      }
    }

    // MACD
    if (indicators.macd?.histogram) {
      const histogram = indicators.macd.histogram;
      const current = histogram[histogram.length - 1];
      const previous = histogram[histogram.length - 2];

      if (current > 0) {
        score += 0.2;
        signals.push('MACD bullish (above signal)');

        if (current > previous) {
          score += 0.1;
          signals.push('MACD momentum increasing');
        }
      } else {
        score -= 0.2;
        signals.push('MACD bearish (below signal)');

        if (current < previous) {
          score -= 0.1;
          signals.push('MACD momentum decreasing');
        }
      }
    }

    // Stochastic
    if (indicators.stochastic?.k) {
      const k = indicators.stochastic.k[indicators.stochastic.k.length - 1];

      if (k < 20) {
        score += 0.2;
        signals.push(`Stochastic oversold (${k.toFixed(1)})`);
      } else if (k > 80) {
        score -= 0.2;
        signals.push(`Stochastic overbought (${k.toFixed(1)})`);
      }
    }

    // CCI
    if (indicators.cci) {
      const cci = indicators.cci[indicators.cci.length - 1];

      if (cci < -100) {
        score += 0.15;
        signals.push('CCI oversold');
      } else if (cci > 100) {
        score -= 0.15;
        signals.push('CCI overbought');
      }
    }

    score = Math.max(-1, Math.min(1, score));

    return {
      score,
      signals,
      strength: Math.abs(score)
    };
  }

  /**
   * Analyze volatility
   */
  analyzeVolatility(indicators) {
    const signals = [];
    let volatilityLevel = 'medium';
    let score = 0;

    if (indicators.volatility) {
      const vol = indicators.volatility[indicators.volatility.length - 1];

      if (vol > 100) {
        volatilityLevel = 'very high';
        signals.push(`Extreme volatility (${vol.toFixed(1)}%)`);
      } else if (vol > 70) {
        volatilityLevel = 'high';
        signals.push(`High volatility (${vol.toFixed(1)}%)`);
      } else if (vol > 40) {
        volatilityLevel = 'medium';
        signals.push(`Moderate volatility (${vol.toFixed(1)}%)`);
      } else {
        volatilityLevel = 'low';
        signals.push(`Low volatility (${vol.toFixed(1)}%)`);
      }
    }

    // Bollinger Bands
    if (indicators.bollingerBands) {
      const bb = indicators.bollingerBands;
      const bandwidth = bb.bandwidth[bb.bandwidth.length - 1];

      if (bandwidth < 5) {
        signals.push('Bollinger Bands squeeze - potential breakout ahead');
      } else if (bandwidth > 20) {
        signals.push('Bollinger Bands wide - high volatility period');
      }
    }

    return {
      score,
      signals,
      volatilityLevel,
      strength: 0
    };
  }

  /**
   * Analyze volume
   */
  analyzeVolume(indicators) {
    const signals = [];
    let score = 0;

    if (indicators.volumeMA && indicators.obv) {
      const volumes = indicators.volumeMA;
      const currentVol = volumes[volumes.length - 1];
      const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

      // Volume spike detection
      if (currentVol > avgVol * 2) {
        score += 0.3;
        signals.push('Significant volume spike detected');
      } else if (currentVol > avgVol * 1.5) {
        score += 0.15;
        signals.push('Above-average volume');
      } else if (currentVol < avgVol * 0.5) {
        score -= 0.1;
        signals.push('Low volume - weak momentum');
      }

      // OBV trend
      const obv = indicators.obv;
      const obvTrend = obv.slice(-10);
      const obvIncreasing = obvTrend[obvTrend.length - 1] > obvTrend[0];

      if (obvIncreasing) {
        score += 0.2;
        signals.push('OBV trending up - accumulation');
      } else {
        score -= 0.2;
        signals.push('OBV trending down - distribution');
      }
    }

    score = Math.max(-1, Math.min(1, score));

    return {
      score,
      signals,
      strength: Math.abs(score)
    };
  }

  /**
   * Analyze support and resistance
   */
  analyzeSupportResistance(indicators, currentPrice) {
    const signals = [];
    let score = 0;

    if (indicators.supportResistance) {
      const { support, resistance } = indicators.supportResistance;

      // Find nearest support and resistance
      const nearestSupport = support.reduce((prev, curr) =>
        Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev
      , support[0]);

      const nearestResistance = resistance.reduce((prev, curr) =>
        Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev
      , resistance[0]);

      // Distance to support/resistance
      const distanceToSupport = ((currentPrice - nearestSupport) / currentPrice) * 100;
      const distanceToResistance = ((nearestResistance - currentPrice) / currentPrice) * 100;

      if (distanceToSupport < 2) {
        score += 0.3;
        signals.push(`Near support level ($${nearestSupport.toFixed(2)})`);
      }

      if (distanceToResistance < 2) {
        score -= 0.3;
        signals.push(`Near resistance level ($${nearestResistance.toFixed(2)})`);
      }

      signals.push(`Support: $${nearestSupport.toFixed(2)}, Resistance: $${nearestResistance.toFixed(2)}`);
    }

    score = Math.max(-1, Math.min(1, score));

    return {
      score,
      signals,
      strength: Math.abs(score)
    };
  }

  /**
   * Generate probability distribution from composite score
   */
  generateProbabilityDistribution(compositeScore, volatilityScore, currentPrice) {
    // Adjust confidence based on volatility
    const volatilityMultiplier = {
      'very high': 0.5,
      'high': 0.7,
      'medium': 0.85,
      'low': 0.95
    }[volatilityScore.volatilityLevel] || 0.85;

    const baseConfidence = volatilityMultiplier;

    // Convert score to probabilities
    const normalizedScore = compositeScore; // Already -1 to +1

    // Probability of upward movement
    const upwardProb = (normalizedScore + 1) / 2; // Convert -1,1 to 0,1
    const downwardProb = 1 - upwardProb;

    // Determine direction and confidence
    let direction = 'neutral';
    let probability = 0.5;

    if (Math.abs(normalizedScore) > 0.5) {
      direction = normalizedScore > 0 ? 'bullish' : 'bearish';
      probability = Math.abs(normalizedScore);
    } else if (Math.abs(normalizedScore) > 0.25) {
      direction = normalizedScore > 0 ? 'slightly bullish' : 'slightly bearish';
      probability = 0.5 + (Math.abs(normalizedScore) / 2);
    }

    // Price range prediction based on volatility
    const volatilityValues = {
      'very high': 0.15,
      'high': 0.10,
      'medium': 0.07,
      'low': 0.04
    };

    const expectedMove = volatilityValues[volatilityScore.volatilityLevel] || 0.07;

    // Short-term prediction (24 hours)
    const shortTerm = {
      timeframe: '24 hours',
      direction: direction,
      probability: probability * 100,
      confidence: baseConfidence * 100,
      expectedRange: {
        low: currentPrice * (1 - expectedMove * 0.5),
        high: currentPrice * (1 + expectedMove * 0.5)
      },
      mostLikely: currentPrice * (1 + (normalizedScore * expectedMove * 0.3))
    };

    // Medium-term prediction (7 days)
    const mediumTerm = {
      timeframe: '7 days',
      direction: direction,
      probability: (probability * 0.85) * 100, // Lower confidence for longer timeframe
      confidence: (baseConfidence * 0.8) * 100,
      expectedRange: {
        low: currentPrice * (1 - expectedMove * 1.5),
        high: currentPrice * (1 + expectedMove * 1.5)
      },
      mostLikely: currentPrice * (1 + (normalizedScore * expectedMove * 0.7))
    };

    return {
      shortTerm,
      mediumTerm,
      compositeScore: normalizedScore,
      confidenceLevel: this.getConfidenceLabel(baseConfidence)
    };
  }

  /**
   * Get confidence level label
   */
  getConfidenceLabel(confidence) {
    if (confidence >= this.confidenceThresholds.veryHigh) return 'Very High';
    if (confidence >= this.confidenceThresholds.high) return 'High';
    if (confidence >= this.confidenceThresholds.medium) return 'Medium';
    if (confidence >= this.confidenceThresholds.low) return 'Low';
    return 'Very Low';
  }

  /**
   * Count bullish/bearish/neutral signals
   */
  countBullishSignals(signals) {
    let count = 0;
    for (const category in signals) {
      if (signals[category].score > 0.2) count++;
    }
    return count;
  }

  countBearishSignals(signals) {
    let count = 0;
    for (const category in signals) {
      if (signals[category].score < -0.2) count++;
    }
    return count;
  }

  countNeutralSignals(signals) {
    let count = 0;
    for (const category in signals) {
      if (Math.abs(signals[category].score) <= 0.2) count++;
    }
    return count;
  }

  /**
   * Assess risk
   */
  assessRisk(indicators, currentPrice, volatilityScore) {
    const volatilityRisk = {
      'very high': 9,
      'high': 7,
      'medium': 5,
      'low': 3
    }[volatilityScore.volatilityLevel] || 5;

    // Calculate maximum drawdown potential
    const atr = indicators.atr?.[indicators.atr.length - 1] || currentPrice * 0.05;
    const maxDrawdown = (atr / currentPrice) * 100;

    // Liquidity risk based on volume
    const avgVolume = indicators.volumeMA?.[indicators.volumeMA.length - 1] || 0;
    const liquidityRisk = avgVolume < 1000000 ? 'High' : avgVolume < 10000000 ? 'Medium' : 'Low';

    return {
      volatilityScore: volatilityRisk,
      maxDrawdownPotential: maxDrawdown.toFixed(2) + '%',
      liquidityRisk,
      recommendation: `Risk level ${volatilityRisk}/10. Only invest what you can afford to lose.`
    };
  }

  /**
   * Get historical accuracy for similar market conditions
   */
  async getHistoricalAccuracyForConditions(compositeScore, volatilityLevel) {
    // This would query the database for similar predictions
    // For now, return overall accuracy
    const accuracy = this.database.getHistoricalAccuracy();

    return {
      overall: accuracy.overall?.accuracy_percentage || 0,
      similarConditions: accuracy.overall?.accuracy_percentage || 0,
      note: 'Predictions work better in trending markets than choppy/sideways markets'
    };
  }

  /**
   * Save prediction for accuracy tracking
   */
  savePredictionForTracking(cryptoId, prediction, currentPrice) {
    try {
      // Save short-term prediction
      this.database.savePrediction({
        cryptoId,
        createdAt: Date.now(),
        type: 'short_term',
        timeframe: 24 * 60 * 60 * 1000, // 24 hours in ms
        direction: prediction.shortTerm.direction,
        probability: prediction.shortTerm.probability,
        priceRangeLow: prediction.shortTerm.expectedRange.low,
        priceRangeHigh: prediction.shortTerm.expectedRange.high,
        confidence: prediction.shortTerm.confidence,
        indicators: prediction.signals
      });

      // Save medium-term prediction
      this.database.savePrediction({
        cryptoId,
        createdAt: Date.now(),
        type: 'medium_term',
        timeframe: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        direction: prediction.mediumTerm.direction,
        probability: prediction.mediumTerm.probability,
        priceRangeLow: prediction.mediumTerm.expectedRange.low,
        priceRangeHigh: prediction.mediumTerm.expectedRange.high,
        confidence: prediction.mediumTerm.confidence,
        indicators: prediction.signals
      });
    } catch (error) {
      console.error('Error saving prediction for tracking:', error);
    }
  }

  /**
   * Update analysis (called periodically)
   */
  async updateAnalysis(cryptoId) {
    await this.getAnalysis(cryptoId);
  }

  /**
   * Construct OHLC data from price history
   */
  constructOHLC(priceHistory) {
    const hourlyBuckets = {};

    for (const point of priceHistory) {
      const hourKey = Math.floor(point.timestamp / 3600000) * 3600000;

      if (!hourlyBuckets[hourKey]) {
        hourlyBuckets[hourKey] = {
          timestamp: hourKey,
          open: point.price,
          high: point.price,
          low: point.price,
          close: point.price,
          volume: point.volume || 0
        };
      } else {
        const bucket = hourlyBuckets[hourKey];
        bucket.high = Math.max(bucket.high, point.price);
        bucket.low = Math.min(bucket.low, point.price);
        bucket.close = point.price;
        bucket.volume += point.volume || 0;
      }
    }

    return Object.values(hourlyBuckets).sort((a, b) => a.timestamp - b.timestamp);
  }
}

module.exports = PredictionEngine;
