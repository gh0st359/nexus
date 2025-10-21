/**
 * Analysis Panel Component
 * Displays comprehensive technical analysis and probabilistic predictions
 */

import React, { useState, useEffect } from 'react';
import PriceChart from './PriceChart';
import TechnicalIndicators from './TechnicalIndicators';
import ProbabilisticPrediction from './ProbabilisticPrediction';
import RiskAssessment from './RiskAssessment';
import SignalAggregator from './SignalAggregator';
import '../styles/analysis-panel.css';

const { ipcRenderer } = window.require('electron');

function AnalysisPanel({ crypto }) {
  const [cryptoDetails, setCryptoDetails] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState(30); // days

  useEffect(() => {
    if (crypto) {
      loadAnalysis();

      // Listen for analysis updates
      const handleUpdate = () => loadAnalysis();
      ipcRenderer.on('analysis-updated', handleUpdate);
      ipcRenderer.on('prices-updated', handleUpdate);

      return () => {
        ipcRenderer.removeListener('analysis-updated', handleUpdate);
        ipcRenderer.removeListener('prices-updated', handleUpdate);
      };
    }
  }, [crypto?.id, timeframe]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      // Load crypto details
      const details = await ipcRenderer.invoke('get-crypto-details', crypto.id);
      setCryptoDetails(details);

      // Load prediction
      const pred = await ipcRenderer.invoke('get-prediction', crypto.id);
      setPrediction(pred);

      // Load price history
      const history = await ipcRenderer.invoke('get-price-history', crypto.id, timeframe);
      setPriceHistory(history);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load analysis:', error);
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume) => {
    if (!volume) return 'N/A';
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="analysis-panel loading">
        <div className="loading-spinner large"></div>
        <p>Analyzing {crypto.name}...</p>
      </div>
    );
  }

  return (
    <div className="analysis-panel">
      {/* Header with current market status */}
      <div className="analysis-header">
        <div className="crypto-title">
          {cryptoDetails?.image && (
            <img src={cryptoDetails.image} alt={crypto.name} className="crypto-logo" />
          )}
          <div className="title-info">
            <h2>{crypto.name} ({crypto.symbol?.toUpperCase()})</h2>
            <span className="market-rank">Rank #{cryptoDetails?.market_cap_rank || 'N/A'}</span>
          </div>
        </div>

        <div className="current-price-display">
          <div className="price-label">Current Price</div>
          <div className="price-value">{formatPrice(cryptoDetails?.current_price)}</div>
          <div className={`price-change ${cryptoDetails?.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
            {cryptoDetails?.price_change_percentage_24h >= 0 ? '+' : ''}
            {cryptoDetails?.price_change_percentage_24h?.toFixed(2)}% (24h)
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="market-stats">
        <div className="stat-card">
          <div className="stat-label">Market Cap</div>
          <div className="stat-value">{formatMarketCap(cryptoDetails?.market_cap)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">24h Volume</div>
          <div className="stat-value">{formatVolume(cryptoDetails?.total_volume)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Circulating Supply</div>
          <div className="stat-value">
            {cryptoDetails?.circulating_supply?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">All-Time High</div>
          <div className="stat-value">{formatPrice(cryptoDetails?.ath)}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'prediction' ? 'active' : ''}`}
          onClick={() => setActiveTab('prediction')}
        >
          Predictions
        </button>
        <button
          className={`tab-btn ${activeTab === 'indicators' ? 'active' : ''}`}
          onClick={() => setActiveTab('indicators')}
        >
          Technical Indicators
        </button>
        <button
          className={`tab-btn ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          Risk Assessment
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="chart-section">
              <div className="chart-controls">
                <button
                  className={timeframe === 7 ? 'active' : ''}
                  onClick={() => setTimeframe(7)}
                >
                  7D
                </button>
                <button
                  className={timeframe === 30 ? 'active' : ''}
                  onClick={() => setTimeframe(30)}
                >
                  30D
                </button>
                <button
                  className={timeframe === 90 ? 'active' : ''}
                  onClick={() => setTimeframe(90)}
                >
                  90D
                </button>
              </div>
              <PriceChart
                data={priceHistory}
                crypto={crypto}
                timeframe={timeframe}
              />
            </div>

            {prediction && (
              <>
                <SignalAggregator prediction={prediction} />
                <div className="quick-prediction">
                  <h3>Quick Analysis Summary</h3>
                  <div className="summary-content">
                    <div className="summary-item">
                      <span className="summary-label">Overall Sentiment:</span>
                      <span className={`summary-value ${prediction.shortTerm?.direction?.includes('bullish') ? 'bullish' : prediction.shortTerm?.direction?.includes('bearish') ? 'bearish' : 'neutral'}`}>
                        {prediction.shortTerm?.direction || 'Neutral'}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Confidence Level:</span>
                      <span className="summary-value">{prediction.confidenceLevel || 'Medium'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">24h Expected Range:</span>
                      <span className="summary-value">
                        {formatPrice(prediction.shortTerm?.expectedRange?.low)} - {formatPrice(prediction.shortTerm?.expectedRange?.high)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'prediction' && prediction && (
          <div className="prediction-tab">
            <ProbabilisticPrediction prediction={prediction} crypto={crypto} />
          </div>
        )}

        {activeTab === 'indicators' && prediction && (
          <div className="indicators-tab">
            <TechnicalIndicators signals={prediction.signals} />
          </div>
        )}

        {activeTab === 'risk' && prediction && (
          <div className="risk-tab">
            <RiskAssessment risk={prediction.risk} crypto={crypto} />
          </div>
        )}
      </div>

      {/* Educational Disclaimer */}
      <div className="analysis-disclaimer">
        <strong>Important:</strong> This analysis is for educational purposes only.
        Historical accuracy: {prediction?.historicalAccuracy?.overall?.toFixed(1) || 'N/A'}%.
        Cryptocurrency markets are highly volatile and unpredictable.
        Only invest what you can afford to lose.
      </div>
    </div>
  );
}

export default AnalysisPanel;
