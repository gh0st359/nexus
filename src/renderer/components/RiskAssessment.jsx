/**
 * Risk Assessment Component
 * Displays risk analysis and position sizing recommendations
 */

import React, { useState } from 'react';
import '../styles/risk.css';

function RiskAssessment({ risk, crypto }) {
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [riskPercentage, setRiskPercentage] = useState(2);

  if (!risk) {
    return <div className="no-risk">No risk data available</div>;
  }

  const getRiskColor = (score) => {
    if (score >= 8) return 'very-high';
    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  };

  const getLiquidityColor = (level) => {
    if (level === 'High') return 'high';
    if (level === 'Medium') return 'medium';
    return 'low';
  };

  // Calculate position sizing
  const maxRiskAmount = (portfolioValue * riskPercentage) / 100;
  const maxDrawdownPercent = parseFloat(risk.maxDrawdownPotential) || 5;
  const suggestedPosition = maxRiskAmount / (maxDrawdownPercent / 100);

  return (
    <div className="risk-assessment">
      <div className="risk-header">
        <h3>Risk Assessment</h3>
        <p className="risk-subtitle">
          Understanding and managing risk is crucial for successful trading
        </p>
      </div>

      {/* Risk Scores */}
      <div className="risk-scores">
        <div className="risk-score-card">
          <div className="score-label">Volatility Risk</div>
          <div className={`score-value ${getRiskColor(risk.volatilityScore)}`}>
            {risk.volatilityScore}/10
          </div>
          <div className="score-bar">
            <div
              className={`score-fill ${getRiskColor(risk.volatilityScore)}`}
              style={{ width: `${(risk.volatilityScore / 10) * 100}%` }}
            ></div>
          </div>
          <div className="score-description">
            {risk.volatilityScore >= 8
              ? 'Extreme price swings expected'
              : risk.volatilityScore >= 6
              ? 'High volatility - significant price movements likely'
              : risk.volatilityScore >= 4
              ? 'Moderate volatility - normal for crypto markets'
              : 'Relatively stable price action'}
          </div>
        </div>

        <div className="risk-score-card">
          <div className="score-label">Liquidity Risk</div>
          <div className={`liquidity-badge ${getLiquidityColor(risk.liquidityRisk)}`}>
            {risk.liquidityRisk}
          </div>
          <div className="score-description">
            {risk.liquidityRisk === 'High'
              ? 'Low trading volume - may be difficult to exit positions'
              : risk.liquidityRisk === 'Medium'
              ? 'Moderate liquidity - some slippage possible on large orders'
              : 'Good liquidity - easy to enter and exit positions'}
          </div>
        </div>

        <div className="risk-score-card">
          <div className="score-label">Maximum Drawdown Potential</div>
          <div className="drawdown-value">{risk.maxDrawdownPotential}</div>
          <div className="score-description">
            Estimated maximum potential loss based on recent volatility
          </div>
        </div>
      </div>

      {/* Risk Recommendation */}
      <div className="risk-recommendation">
        <h4>⚠️ Risk Recommendation</h4>
        <p className="recommendation-text">{risk.recommendation}</p>
      </div>

      {/* Position Size Calculator */}
      <div className="position-calculator">
        <h4>📊 Position Size Calculator</h4>
        <p className="calculator-description">
          Calculate appropriate position size based on your risk tolerance
        </p>

        <div className="calculator-inputs">
          <div className="input-group">
            <label htmlFor="portfolio-value">Portfolio Value ($)</label>
            <input
              id="portfolio-value"
              type="number"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(parseFloat(e.target.value) || 0)}
              min="0"
              step="1000"
            />
          </div>

          <div className="input-group">
            <label htmlFor="risk-percentage">Risk Per Trade (%)</label>
            <input
              id="risk-percentage"
              type="number"
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(parseFloat(e.target.value) || 0)}
              min="0.5"
              max="5"
              step="0.5"
            />
            <small>Recommended: 1-2% for conservative, 2-5% for aggressive</small>
          </div>
        </div>

        <div className="calculator-results">
          <div className="result-row">
            <span className="result-label">Maximum Risk Amount:</span>
            <span className="result-value">${maxRiskAmount.toFixed(2)}</span>
          </div>
          <div className="result-row highlight">
            <span className="result-label">Suggested Position Size:</span>
            <span className="result-value">${suggestedPosition.toFixed(2)}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Recommended Stop Loss:</span>
            <span className="result-value">{maxDrawdownPercent.toFixed(2)}% below entry</span>
          </div>
        </div>

        <div className="calculator-note">
          <strong>Note:</strong> This calculation assumes you set a stop-loss at the maximum
          drawdown level. Always use stop-losses to limit potential losses.
        </div>
      </div>

      {/* Risk Management Guidelines */}
      <div className="risk-guidelines">
        <h4>Risk Management Best Practices</h4>
        <div className="guidelines-list">
          <div className="guideline-item">
            <span className="guideline-icon">✓</span>
            <div className="guideline-content">
              <strong>Never risk more than you can afford to lose</strong>
              <p>Cryptocurrency markets are highly volatile. Only invest disposable income.</p>
            </div>
          </div>

          <div className="guideline-item">
            <span className="guideline-icon">✓</span>
            <div className="guideline-content">
              <strong>Use stop-loss orders</strong>
              <p>
                Protect your capital by automatically exiting positions if price moves against you.
              </p>
            </div>
          </div>

          <div className="guideline-item">
            <span className="guideline-icon">✓</span>
            <div className="guideline-content">
              <strong>Diversify your portfolio</strong>
              <p>Don't put all your capital into a single cryptocurrency.</p>
            </div>
          </div>

          <div className="guideline-item">
            <span className="guideline-icon">✓</span>
            <div className="guideline-content">
              <strong>Consider the risk/reward ratio</strong>
              <p>
                Only take trades where potential reward is at least 2-3x the potential risk.
              </p>
            </div>
          </div>

          <div className="guideline-item">
            <span className="guideline-icon">✓</span>
            <div className="guideline-content">
              <strong>Be aware of liquidity</strong>
              <p>
                In low-liquidity markets, you may not be able to exit at your desired price.
              </p>
            </div>
          </div>

          <div className="guideline-item warning">
            <span className="guideline-icon">⚠</span>
            <div className="guideline-content">
              <strong>Beware of leverage</strong>
              <p>
                Leverage amplifies both gains AND losses. It can wipe out your account quickly.
                Only use leverage if you fully understand the risks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Conditions Warning */}
      {risk.volatilityScore >= 8 && (
        <div className="extreme-risk-warning">
          <h4>⚠️ EXTREME VOLATILITY WARNING</h4>
          <p>
            This cryptocurrency is experiencing extreme volatility. Price swings of 10-20%+ per day
            are possible. Consider reducing position size or waiting for more stable conditions.
          </p>
        </div>
      )}
    </div>
  );
}

export default RiskAssessment;
