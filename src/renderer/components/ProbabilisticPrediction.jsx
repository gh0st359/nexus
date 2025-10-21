/**
 * Probabilistic Prediction Component
 * Displays honest, probability-based predictions instead of false certainties
 */

import React from 'react';
import '../styles/prediction.css';

function ProbabilisticPrediction({ prediction, crypto }) {
  if (!prediction) {
    return <div className="no-prediction">No prediction available</div>;
  }

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const getDirectionColor = (direction) => {
    if (!direction) return 'neutral';
    if (direction.includes('bullish')) return 'bullish';
    if (direction.includes('bearish')) return 'bearish';
    return 'neutral';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="probabilistic-prediction">
      <div className="prediction-header">
        <h3>Probabilistic Market Predictions</h3>
        <p className="prediction-subtitle">
          Based on technical analysis • Showing probabilities, not certainties
        </p>
      </div>

      {/* Short-term Prediction */}
      <div className="prediction-section">
        <div className="prediction-timeframe">
          <h4>Short-term (24 hours)</h4>
          <span className="timeframe-badge">Next Day</span>
        </div>

        <div className="prediction-content">
          <div className="prediction-main">
            <div className="direction-indicator">
              <div className={`direction-badge ${getDirectionColor(prediction.shortTerm?.direction)}`}>
                {prediction.shortTerm?.direction || 'Neutral'}
              </div>
              <div className="probability-display">
                <span className="probability-value">
                  {prediction.shortTerm?.probability?.toFixed(1) || '50.0'}%
                </span>
                <span className="probability-label">probability</span>
              </div>
            </div>

            <div className="confidence-indicator">
              <div className="confidence-label">Confidence Level</div>
              <div className={`confidence-bar ${getConfidenceColor(prediction.shortTerm?.confidence)}`}>
                <div
                  className="confidence-fill"
                  style={{ width: `${prediction.shortTerm?.confidence || 50}%` }}
                ></div>
              </div>
              <div className="confidence-value">
                {prediction.shortTerm?.confidence?.toFixed(1) || '50.0'}%
                <span className="confidence-label-text">
                  ({prediction.confidenceLevel || 'Medium'})
                </span>
              </div>
            </div>
          </div>

          <div className="price-range-prediction">
            <h5>Expected Price Range</h5>
            <div className="price-range-display">
              <div className="price-range-item">
                <span className="range-label">Low</span>
                <span className="range-value low">
                  {formatPrice(prediction.shortTerm?.expectedRange?.low)}
                </span>
              </div>
              <div className="price-range-item most-likely">
                <span className="range-label">Most Likely</span>
                <span className="range-value">
                  {formatPrice(prediction.shortTerm?.mostLikely)}
                </span>
              </div>
              <div className="price-range-item">
                <span className="range-label">High</span>
                <span className="range-value high">
                  {formatPrice(prediction.shortTerm?.expectedRange?.high)}
                </span>
              </div>
            </div>
            <div className="range-visualization">
              <div className="range-bar">
                <div className="range-center-marker"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medium-term Prediction */}
      <div className="prediction-section">
        <div className="prediction-timeframe">
          <h4>Medium-term (7 days)</h4>
          <span className="timeframe-badge">Next Week</span>
        </div>

        <div className="prediction-content">
          <div className="prediction-main">
            <div className="direction-indicator">
              <div className={`direction-badge ${getDirectionColor(prediction.mediumTerm?.direction)}`}>
                {prediction.mediumTerm?.direction || 'Neutral'}
              </div>
              <div className="probability-display">
                <span className="probability-value">
                  {prediction.mediumTerm?.probability?.toFixed(1) || '50.0'}%
                </span>
                <span className="probability-label">probability</span>
              </div>
            </div>

            <div className="confidence-indicator">
              <div className="confidence-label">Confidence Level</div>
              <div className={`confidence-bar ${getConfidenceColor(prediction.mediumTerm?.confidence)}`}>
                <div
                  className="confidence-fill"
                  style={{ width: `${prediction.mediumTerm?.confidence || 50}%` }}
                ></div>
              </div>
              <div className="confidence-value">
                {prediction.mediumTerm?.confidence?.toFixed(1) || '50.0'}%
                <span className="confidence-label-text">
                  (Lower confidence for longer timeframe)
                </span>
              </div>
            </div>
          </div>

          <div className="price-range-prediction">
            <h5>Expected Price Range</h5>
            <div className="price-range-display">
              <div className="price-range-item">
                <span className="range-label">Low</span>
                <span className="range-value low">
                  {formatPrice(prediction.mediumTerm?.expectedRange?.low)}
                </span>
              </div>
              <div className="price-range-item most-likely">
                <span className="range-label">Most Likely</span>
                <span className="range-value">
                  {formatPrice(prediction.mediumTerm?.mostLikely)}
                </span>
              </div>
              <div className="price-range-item">
                <span className="range-label">High</span>
                <span className="range-value high">
                  {formatPrice(prediction.mediumTerm?.expectedRange?.high)}
                </span>
              </div>
            </div>
            <div className="range-visualization">
              <div className="range-bar wider">
                <div className="range-center-marker"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Accuracy */}
      {prediction.historicalAccuracy && (
        <div className="historical-accuracy-section">
          <h4>Historical Accuracy Context</h4>
          <div className="accuracy-info">
            <div className="accuracy-stat">
              <span className="stat-label">Overall Model Accuracy:</span>
              <span className="stat-value">
                {prediction.historicalAccuracy.overall?.toFixed(1) || 'N/A'}%
              </span>
            </div>
            <div className="accuracy-note">
              <strong>Note:</strong> {prediction.historicalAccuracy.note ||
                'Predictions work better in trending markets than in choppy/sideways markets'}
            </div>
          </div>
        </div>
      )}

      {/* Interpretation Guide */}
      <div className="interpretation-guide">
        <h4>How to Interpret These Predictions</h4>
        <div className="guide-content">
          <div className="guide-item">
            <strong>Probability:</strong> The likelihood of the predicted direction occurring.
            Above 60% indicates moderate conviction, above 75% indicates strong conviction.
          </div>
          <div className="guide-item">
            <strong>Confidence Level:</strong> How reliable this prediction is based on
            market volatility and historical accuracy. Higher volatility = lower confidence.
          </div>
          <div className="guide-item">
            <strong>Expected Range:</strong> The price is expected to fall within this range
            with the stated probability. Wider ranges indicate higher uncertainty.
          </div>
          <div className="guide-item warning">
            <strong>⚠ Important:</strong> These are probabilistic estimates, not guarantees.
            Even high-probability predictions can be wrong. Use this information as ONE input
            in your decision-making process, not the only input.
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="prediction-reasoning">
        <h4>Analysis Summary</h4>
        <div className="reasoning-content">
          <div className="signal-summary">
            <div className="signal-count bullish">
              {prediction.bullishSignals || 0} Bullish Signals
            </div>
            <div className="signal-count neutral">
              {prediction.neutralSignals || 0} Neutral Signals
            </div>
            <div className="signal-count bearish">
              {prediction.bearishSignals || 0} Bearish Signals
            </div>
          </div>
          <p className="composite-score">
            Composite Score: {((prediction.compositeScore || 0) * 100).toFixed(1)}
            <span className="score-explanation">
              (-100 = very bearish, 0 = neutral, +100 = very bullish)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProbabilisticPrediction;
