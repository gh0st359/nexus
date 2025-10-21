/**
 * Technical Indicators Component
 * Displays detailed technical indicator values and explanations
 */

import React, { useState } from 'react';
import '../styles/indicators.css';

function TechnicalIndicators({ signals }) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  if (!signals) {
    return <div className="no-indicators">No indicator data available</div>;
  }

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const categories = [
    {
      key: 'trend',
      name: 'Trend Indicators',
      description: 'Identify the overall direction of price movement',
      indicators: [
        { name: 'Moving Averages', description: 'Price relationship to 20/50/200-day averages' },
        { name: 'ADX', description: 'Measures trend strength (>25 = strong trend)' },
        { name: 'Ichimoku Cloud', description: 'Comprehensive trend and momentum system' }
      ]
    },
    {
      key: 'momentum',
      name: 'Momentum Indicators',
      description: 'Measure the speed and strength of price movements',
      indicators: [
        { name: 'RSI', description: 'Relative Strength Index (30 = oversold, 70 = overbought)' },
        { name: 'MACD', description: 'Moving Average Convergence Divergence' },
        { name: 'Stochastic', description: 'Compares closing price to price range' },
        { name: 'CCI', description: 'Commodity Channel Index' }
      ]
    },
    {
      key: 'volatility',
      name: 'Volatility Indicators',
      description: 'Measure price variation and market uncertainty',
      indicators: [
        { name: 'Bollinger Bands', description: 'Price volatility and potential breakouts' },
        { name: 'ATR', description: 'Average True Range - measures volatility' },
        { name: 'Historical Volatility', description: 'Standard deviation of price changes' }
      ]
    },
    {
      key: 'volume',
      name: 'Volume Indicators',
      description: 'Analyze trading volume to confirm price movements',
      indicators: [
        { name: 'Volume MA', description: 'Volume compared to moving average' },
        { name: 'OBV', description: 'On-Balance Volume - accumulation/distribution' }
      ]
    },
    {
      key: 'supportResistance',
      name: 'Support & Resistance',
      description: 'Key price levels where price tends to reverse',
      indicators: [
        { name: 'Support Levels', description: 'Price floors where buying pressure increases' },
        { name: 'Resistance Levels', description: 'Price ceilings where selling pressure increases' }
      ]
    }
  ];

  const getScoreColor = (score) => {
    if (score > 0.3) return 'bullish';
    if (score < -0.3) return 'bearish';
    return 'neutral';
  };

  return (
    <div className="technical-indicators">
      <div className="indicators-header">
        <h3>Technical Indicators Explained</h3>
        <p className="indicators-subtitle">
          Click on each category to learn more about the indicators used in the analysis
        </p>
      </div>

      <div className="indicators-categories">
        {categories.map((category) => {
          const signal = signals[category.key];
          const isExpanded = expandedCategory === category.key;

          return (
            <div key={category.key} className={`indicator-category ${isExpanded ? 'expanded' : ''}`}>
              <div
                className="category-header clickable"
                onClick={() => toggleCategory(category.key)}
              >
                <div className="category-info">
                  <h4>{category.name}</h4>
                  <p className="category-description">{category.description}</p>
                </div>

                <div className="category-score">
                  {signal && (
                    <div className={`score-badge ${getScoreColor(signal.score)}`}>
                      Score: {(signal.score * 100).toFixed(0)}
                      <span className="score-explanation">
                        {signal.score > 0.3 ? ' (Bullish)' : signal.score < -0.3 ? ' (Bearish)' : ' (Neutral)'}
                      </span>
                    </div>
                  )}
                  <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="category-details">
                  <div className="indicators-list">
                    {category.indicators.map((indicator, idx) => (
                      <div key={idx} className="indicator-item">
                        <div className="indicator-name">{indicator.name}</div>
                        <div className="indicator-description">{indicator.description}</div>
                      </div>
                    ))}
                  </div>

                  {signal && signal.signals && signal.signals.length > 0 && (
                    <div className="current-signals">
                      <h5>Current Signals:</h5>
                      <ul className="signals-list">
                        {signal.signals.map((sig, idx) => (
                          <li key={idx} className="signal-detail-item">
                            <span className="signal-bullet">•</span>
                            {sig}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="indicators-education">
        <h4>📚 Educational Note</h4>
        <div className="education-content">
          <p>
            <strong>What are technical indicators?</strong> They are mathematical calculations
            based on historical price and volume data. They help identify trends, momentum,
            and potential reversal points.
          </p>
          <p>
            <strong>How to use them:</strong> No single indicator is perfect. This app combines
            multiple indicators to provide a more balanced view. Even with all indicators aligned,
            predictions can be wrong due to unexpected events, market manipulation, or changing market conditions.
          </p>
          <p>
            <strong>Limitations:</strong> Technical indicators are based on past data and cannot
            predict unexpected news, regulatory changes, or major market events. They work better
            in liquid markets and established trends.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TechnicalIndicators;
