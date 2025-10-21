/**
 * Main Application Component
 * Professional cryptocurrency market analysis with probabilistic predictions
 */

import React, { useState, useEffect } from 'react';
import CryptoSidebar from './components/CryptoSidebar';
import AnalysisPanel from './components/AnalysisPanel';
import DisclaimerBanner from './components/DisclaimerBanner';
import AccuracyTracker from './components/AccuracyTracker';
import './styles/app.css';

const { ipcRenderer } = window.require('electron');

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [cryptoList, setCryptoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAccuracy, setShowAccuracy] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'market_cap_rank',
    sortOrder: 'ASC',
    watchlistOnly: false
  });

  // Load cryptocurrency list on mount
  useEffect(() => {
    loadCryptoList();

    // Listen for updates
    ipcRenderer.on('crypto-list-updated', loadCryptoList);
    ipcRenderer.on('prices-updated', loadCryptoList);

    return () => {
      ipcRenderer.removeAllListeners('crypto-list-updated');
      ipcRenderer.removeAllListeners('prices-updated');
    };
  }, [filters]);

  const loadCryptoList = async () => {
    try {
      const list = await ipcRenderer.invoke('get-crypto-list', filters);
      setCryptoList(list);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load crypto list:', error);
      setLoading(false);
    }
  };

  const handleCryptoSelect = async (crypto) => {
    setSelectedCrypto(crypto);
  };

  const handleToggleWatchlist = async (cryptoId) => {
    try {
      await ipcRenderer.invoke('toggle-watchlist', cryptoId);
      loadCryptoList();
    } catch (error) {
      console.error('Failed to toggle watchlist:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="app">
      <DisclaimerBanner />

      <div className="app-header">
        <h1>Crypto Analysis Pro</h1>
        <div className="header-subtitle">
          Probabilistic Market Analysis • Educational Purposes Only
        </div>
        <button
          className="accuracy-button"
          onClick={() => setShowAccuracy(!showAccuracy)}
        >
          View Historical Accuracy
        </button>
      </div>

      <div className="app-container">
        <CryptoSidebar
          cryptoList={cryptoList}
          selectedCrypto={selectedCrypto}
          onSelect={handleCryptoSelect}
          onToggleWatchlist={handleToggleWatchlist}
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        <div className="main-content">
          {selectedCrypto ? (
            <AnalysisPanel crypto={selectedCrypto} />
          ) : (
            <div className="no-selection">
              <h2>Select a cryptocurrency to begin analysis</h2>
              <p>
                Choose from 500+ cryptocurrencies in the sidebar to view
                detailed technical analysis and probabilistic predictions.
              </p>
              <div className="feature-list">
                <h3>Features:</h3>
                <ul>
                  <li>✓ Real-time price tracking</li>
                  <li>✓ Multiple technical indicators</li>
                  <li>✓ Probabilistic predictions with confidence intervals</li>
                  <li>✓ Historical accuracy tracking</li>
                  <li>✓ Risk assessment tools</li>
                  <li>✓ Support/resistance level identification</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAccuracy && (
        <AccuracyTracker onClose={() => setShowAccuracy(false)} />
      )}
    </div>
  );
}

export default App;
