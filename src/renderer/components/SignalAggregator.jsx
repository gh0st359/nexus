/**
 * Signal Aggregator Component
 * Displays aggregated technical signals in an easy-to-understand format
 */

import React from 'react';
import '../styles/signals.css';

function SignalAggregator({ prediction }) {
  if (!prediction || !prediction.signals) {
    return null;
  }

  const { signals } = prediction;

  const getSignalStatus = (score) => {
    if (score > 0.3) return { status: 'bullish', label: 'Bullish' };
    if (score < -0.3) return { status: 'bearish', label: 'Bearish' };
    return { status: 'neutral', label: 'Neutral' };
  };

  const getStrengthBar = (score) => {
    const strength = Math.abs(score) * 100;
    const color = score > 0 ? 'green' : score < 0 ? 'red' : 'gray';
    return { strength, color };
  };

  const categories = [
    { key: 'trend', name: 'Trend Analysis', icon: '📈' },
    { key: 'momentum', name: 'Momentum', icon: '⚡' },
    { key: 'volatility', name: 'Volatility', icon: '📊' },
    { key: 'volume', name: 'Volume', icon: '🔊' },
    { key: 'supportResistance', name: 'Support/Resistance', icon: '🎯' }
  ];

  const totalSignals = prediction.bullishSignals + prediction.bearishSignals + prediction.neutralSignals;

  return (
    <div className="signal-aggregator">
      <h3>Technical Signal Overview</h3>

      <div className="signal-summary-cards">
        <div className="summary-card bullish">
          <div className="card-value">{prediction.bullishSignals}</div>
          <div className="card-label">Bullish Signals</div>
          <div className="card-percentage">
            {totalSignals > 0 ? ((prediction.bullishSignals / totalSignals) * 100).toFixed(0) : 0}%
          </div>
        </div>

        <div className="summary-card neutral">
          <div className="card-value">{prediction.neutralSignals}</div>
          <div className="card-label">Neutral Signals</div>
          <div className="card-percentage">
            {totalSignals > 0 ? ((prediction.neutralSignals / totalSignals) * 100).toFixed(0) : 0}%
          </div>
        </div>

        <div className="summary-card bearish">
          <div className="card-value">{prediction.bearishSignals}</div>
          <div className="card-label">Bearish Signals</div>
          <div className="card-percentage">
            {totalSignals > 0 ? ((prediction.bearishSignals / totalSignals) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      <div className="overall-lean">
        <h4>Overall Market Lean</h4>
        <p className="lean-description">
          <strong>{prediction.bullishSignals}/{totalSignals}</strong> indicators bullish,{' '}
          <strong>{prediction.bearishSignals}/{totalSignals}</strong> bearish,{' '}
          <strong>{prediction.neutralSignals}/{totalSignals}</strong> neutral
        </p>
        <div className="lean-interpretation">
          {prediction.bullishSignals > prediction.bearishSignals ? (
            <span className="lean-status bullish">
              Moderately bullish technical setup with{' '}
              {prediction.historicalAccuracy?.overall?.toFixed(0) || 'unknown'}% historical accuracy
              in similar conditions
            </span>
          ) : prediction.bearishSignals > prediction.bullishSignals ? (
            <span className="lean-status bearish">
              Moderately bearish technical setup with{' '}
              {prediction.historicalAccuracy?.overall?.toFixed(0) || 'unknown'}% historical accuracy
              in similar conditions
            </span>
          ) : (
            <span className="lean-status neutral">
              Mixed signals - no clear directional bias. Exercise caution.
            </span>
          )}
        </div>
      </div>

      <div className="signal-categories">
        {categories.map((category) => {
          const signal = signals[category.key];
          if (!signal) return null;

          const { status, label } = getSignalStatus(signal.score);
          const { strength, color } = getStrengthBar(signal.score);

          return (
            <div key={category.key} className="signal-category">
              <div className="category-header">
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className={`category-status ${status}`}>{label}</span>
              </div>

              <div className="signal-strength-bar">
                <div
                  className={`strength-fill ${color}`}
                  style={{ width: `${strength}%` }}
                ></div>
              </div>

              <div className="signal-details">
                {signal.signals && signal.signals.length > 0 && (
                  <ul className="signal-list">
                    {signal.signals.slice(0, 3).map((sig, idx) => (
                      <li key={idx} className="signal-item">{sig}</li>
                    ))}
                    {signal.signals.length > 3 && (
                      <li className="signal-item more">
                        +{signal.signals.length - 3} more signals
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SignalAggregator;
