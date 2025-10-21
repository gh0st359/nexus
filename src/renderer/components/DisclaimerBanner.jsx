/**
 * Disclaimer Banner Component
 * Prominent disclaimer displayed at all times
 */

import React, { useState } from 'react';
import '../styles/disclaimer.css';

function DisclaimerBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <div className="disclaimer-collapsed" onClick={() => setIsDismissed(false)}>
        <span className="disclaimer-icon">⚠️</span>
        <span className="disclaimer-text">Click to view important disclaimer</span>
      </div>
    );
  }

  return (
    <div className={`disclaimer-banner ${isExpanded ? 'expanded' : ''}`}>
      <div className="disclaimer-header">
        <div className="disclaimer-title">
          <span className="disclaimer-icon">⚠️</span>
          <strong>IMPORTANT DISCLAIMER</strong>
        </div>
        <div className="disclaimer-actions">
          <button
            className="disclaimer-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Read Full Disclaimer'}
          </button>
          <button
            className="disclaimer-dismiss"
            onClick={() => setIsDismissed(true)}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="disclaimer-content">
        <p className="disclaimer-main">
          <strong>FOR EDUCATIONAL PURPOSES ONLY - NOT FINANCIAL ADVICE</strong>
        </p>

        {isExpanded && (
          <div className="disclaimer-details">
            <div className="disclaimer-section">
              <h4>What This Tool Does:</h4>
              <ul>
                <li>
                  Analyzes historical price data using technical indicators
                </li>
                <li>
                  Provides probabilistic predictions based on statistical patterns
                </li>
                <li>
                  Tracks historical accuracy of predictions to demonstrate reliability
                </li>
                <li>
                  Offers educational content about technical analysis and risk management
                </li>
              </ul>
            </div>

            <div className="disclaimer-section warning">
              <h4>What This Tool Cannot Do:</h4>
              <ul>
                <li>
                  ✗ Predict the future with certainty
                </li>
                <li>
                  ✗ Account for unexpected news, regulatory changes, or black swan events
                </li>
                <li>
                  ✗ Guarantee profits or prevent losses
                </li>
                <li>
                  ✗ Replace professional financial advice
                </li>
              </ul>
            </div>

            <div className="disclaimer-section critical">
              <h4>Critical Warnings:</h4>
              <ul>
                <li>
                  <strong>Past performance does not guarantee future results.</strong>{' '}
                  Even predictions with high historical accuracy can be wrong.
                </li>
                <li>
                  <strong>Cryptocurrency markets are extremely volatile and risky.</strong>{' '}
                  You can lose all of your invested capital.
                </li>
                <li>
                  <strong>Only invest what you can afford to lose completely.</strong>{' '}
                  Never invest money needed for essential expenses.
                </li>
                <li>
                  <strong>Do your own research.</strong> Use this tool as ONE input in your
                  decision-making, not the only input.
                </li>
                <li>
                  <strong>Consult a licensed financial advisor</strong> before making
                  significant investment decisions.
                </li>
              </ul>
            </div>

            <div className="disclaimer-section">
              <h4>Limitations & Transparency:</h4>
              <p>
                This application uses free public APIs and technical analysis algorithms.
                Historical accuracy is tracked and displayed prominently. When predictions
                are wrong, that is recorded and reflected in the accuracy statistics.
              </p>
              <p>
                Technical analysis works better in:
              </p>
              <ul>
                <li>Trending markets (clear up or down movements)</li>
                <li>Liquid markets (high trading volume)</li>
                <li>Stable market conditions (no major unexpected events)</li>
              </ul>
              <p>
                Technical analysis often fails in:
              </p>
              <ul>
                <li>Choppy/sideways markets (no clear trend)</li>
                <li>Low-liquidity markets</li>
                <li>During major news events or market crashes</li>
                <li>When market manipulation occurs</li>
              </ul>
            </div>

            <div className="disclaimer-section legal">
              <h4>Legal Notice:</h4>
              <p>
                The creators of this software accept no liability for trading losses.
                This tool is provided "as is" without warranties of any kind.
                By using this software, you acknowledge that you understand and accept
                all risks associated with cryptocurrency trading.
              </p>
            </div>

            <div className="disclaimer-acknowledgment">
              <p>
                <strong>By using this application, you acknowledge that you have read,
                understood, and agree to these disclaimers.</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DisclaimerBanner;
