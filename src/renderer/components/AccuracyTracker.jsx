/**
 * Accuracy Tracker Component
 * Displays historical accuracy of predictions - transparency is key
 */

import React, { useState, useEffect } from 'react';
import '../styles/accuracy.css';

const { ipcRenderer } = window.require('electron');

function AccuracyTracker({ onClose }) {
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccuracy();
  }, []);

  const loadAccuracy = async () => {
    try {
      const data = await ipcRenderer.invoke('get-historical-accuracy');
      setAccuracy(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load accuracy data:', error);
      setLoading(false);
    }
  };

  const getAccuracyColor = (percentage) => {
    if (percentage >= 70) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 50) return 'fair';
    return 'poor';
  };

  return (
    <div className="accuracy-tracker-overlay">
      <div className="accuracy-tracker-modal">
        <div className="modal-header">
          <h2>Historical Prediction Accuracy</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading accuracy data...</p>
            </div>
          ) : accuracy ? (
            <>
              <div className="accuracy-intro">
                <p>
                  <strong>Transparency First:</strong> We track every prediction made by this
                  application and measure how often they were correct. This is the actual
                  historical performance - not cherry-picked results.
                </p>
              </div>

              {/* Overall Accuracy */}
              <div className="accuracy-section">
                <h3>Overall Performance</h3>
                {accuracy.overall && accuracy.overall.total_predictions > 0 ? (
                  <div className="accuracy-stats">
                    <div className={`accuracy-card main ${getAccuracyColor(accuracy.overall.accuracy_percentage)}`}>
                      <div className="accuracy-percentage">
                        {accuracy.overall.accuracy_percentage.toFixed(1)}%
                      </div>
                      <div className="accuracy-label">Overall Accuracy</div>
                      <div className="accuracy-details">
                        {accuracy.overall.accurate_predictions} correct out of{' '}
                        {accuracy.overall.total_predictions} predictions
                      </div>
                    </div>

                    <div className="accuracy-breakdown">
                      <div className="breakdown-item">
                        <span className="breakdown-label">Correct Predictions:</span>
                        <span className="breakdown-value correct">
                          {accuracy.overall.accurate_predictions}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Incorrect Predictions:</span>
                        <span className="breakdown-value incorrect">
                          {accuracy.overall.total_predictions - accuracy.overall.accurate_predictions}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>
                      No predictions have been evaluated yet. Predictions are evaluated after
                      their timeframe has elapsed (24 hours or 7 days).
                    </p>
                    <p>
                      Start using the app and come back in 24+ hours to see accuracy statistics.
                    </p>
                  </div>
                )}
              </div>

              {/* Last 30 Days Performance */}
              {accuracy.last30Days && accuracy.last30Days.total > 0 && (
                <div className="accuracy-section">
                  <h3>Last 30 Days Performance</h3>
                  <div className={`accuracy-card ${getAccuracyColor(accuracy.last30Days.accuracy_percentage)}`}>
                    <div className="accuracy-percentage">
                      {accuracy.last30Days.accuracy_percentage.toFixed(1)}%
                    </div>
                    <div className="accuracy-label">Recent Accuracy</div>
                    <div className="accuracy-details">
                      {accuracy.last30Days.accurate} correct out of {accuracy.last30Days.total}
                    </div>
                  </div>
                </div>
              )}

              {/* Accuracy by Timeframe */}
              {accuracy.byTimeframe && accuracy.byTimeframe.length > 0 && (
                <div className="accuracy-section">
                  <h3>Accuracy by Timeframe</h3>
                  <div className="timeframe-accuracy">
                    {accuracy.byTimeframe.map((tf) => {
                      const timeframeLabel =
                        tf.timeframe === 86400000
                          ? '24 Hours'
                          : tf.timeframe === 604800000
                          ? '7 Days'
                          : `${tf.timeframe / 86400000} Days`;

                      return (
                        <div key={tf.timeframe} className="timeframe-card">
                          <div className="timeframe-label">{timeframeLabel}</div>
                          <div className={`timeframe-percentage ${getAccuracyColor(tf.accuracy_percentage)}`}>
                            {tf.accuracy_percentage.toFixed(1)}%
                          </div>
                          <div className="timeframe-details">
                            {tf.accurate}/{tf.total} predictions
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interpretation Guide */}
              <div className="accuracy-section interpretation">
                <h3>How to Interpret These Results</h3>
                <div className="interpretation-content">
                  <div className="interpretation-item">
                    <strong>70%+ accuracy:</strong> Excellent performance. The model is working
                    well in current market conditions.
                  </div>
                  <div className="interpretation-item">
                    <strong>60-70% accuracy:</strong> Good performance. Better than random chance,
                    but still significant room for error.
                  </div>
                  <div className="interpretation-item">
                    <strong>50-60% accuracy:</strong> Fair performance. Slightly better than a
                    coin flip. Use predictions with caution.
                  </div>
                  <div className="interpretation-item warning">
                    <strong>Below 50% accuracy:</strong> Poor performance. The model is not
                    performing well in current market conditions. Do not rely on predictions.
                  </div>
                </div>
              </div>

              {/* Context & Limitations */}
              <div className="accuracy-section context">
                <h3>Context & Limitations</h3>
                <ul className="context-list">
                  <li>
                    Accuracy varies with market conditions. Models typically perform better in
                    trending markets and worse in choppy/sideways markets.
                  </li>
                  <li>
                    Even 70% accuracy means 3 out of 10 predictions are wrong. Never risk money
                    you can't afford to lose.
                  </li>
                  <li>
                    Short-term predictions (24h) are generally less accurate than medium-term
                    predictions (7d) due to market noise.
                  </li>
                  <li>
                    Past accuracy does not guarantee future accuracy. Market conditions change.
                  </li>
                  <li>
                    These statistics are based on actual predictions made by this application,
                    not backtested or cherry-picked data.
                  </li>
                </ul>
              </div>

              {/* Honesty Statement */}
              <div className="honesty-statement">
                <h4>Our Commitment to Honesty</h4>
                <p>
                  Unlike many trading tools that promise guaranteed returns or hide their failures,
                  we track and display every prediction - wins AND losses. This transparency helps
                  you make informed decisions about how much weight to give these predictions.
                </p>
                <p>
                  <strong>
                    When our predictions are wrong, we own it. When they're right, we don't
                    over-promise. This is data-driven analysis, not magic.
                  </strong>
                </p>
              </div>
            </>
          ) : (
            <div className="no-data">
              <p>Failed to load accuracy data. Please try again later.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccuracyTracker;
