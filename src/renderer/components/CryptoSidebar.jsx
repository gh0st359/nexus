/**
 * Cryptocurrency Sidebar Component
 * Displays list of cryptocurrencies with search and filter functionality
 */

import React, { useState } from 'react';
import '../styles/sidebar.css';

function CryptoSidebar({
  cryptoList,
  selectedCrypto,
  onSelect,
  onToggleWatchlist,
  filters,
  onFilterChange,
  loading
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange({ search: value });
  };

  const handleSortChange = (sortBy) => {
    const newOrder = filters.sortBy === sortBy && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    onFilterChange({ sortBy, sortOrder: newOrder });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString()}`;
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeClass = (change) => {
    if (change === null || change === undefined) return 'neutral';
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="crypto-sidebar">
      <div className="sidebar-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <button
            className={`filter-btn ${filters.watchlistOnly ? 'active' : ''}`}
            onClick={() => onFilterChange({ watchlistOnly: !filters.watchlistOnly })}
          >
            ★ Watchlist Only
          </button>
        </div>

        <div className="sort-controls">
          <button
            className={`sort-btn ${filters.sortBy === 'market_cap_rank' ? 'active' : ''}`}
            onClick={() => handleSortChange('market_cap_rank')}
          >
            Rank {filters.sortBy === 'market_cap_rank' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-btn ${filters.sortBy === 'price_change_percentage_24h' ? 'active' : ''}`}
            onClick={() => handleSortChange('price_change_percentage_24h')}
          >
            24h % {filters.sortBy === 'price_change_percentage_24h' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-btn ${filters.sortBy === 'total_volume' ? 'active' : ''}`}
            onClick={() => handleSortChange('total_volume')}
          >
            Volume {filters.sortBy === 'total_volume' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <div className="crypto-list">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading cryptocurrencies...</p>
          </div>
        ) : cryptoList.length === 0 ? (
          <div className="no-results">
            <p>No cryptocurrencies found</p>
          </div>
        ) : (
          cryptoList.map((crypto) => (
            <div
              key={crypto.id}
              className={`crypto-item ${selectedCrypto?.id === crypto.id ? 'selected' : ''}`}
              onClick={() => onSelect(crypto)}
            >
              <div className="crypto-item-header">
                <div className="crypto-icon">
                  {crypto.image ? (
                    <img src={crypto.image} alt={crypto.name} />
                  ) : (
                    <div className="crypto-icon-placeholder">
                      {crypto.symbol?.toUpperCase().substring(0, 2)}
                    </div>
                  )}
                </div>

                <div className="crypto-info">
                  <div className="crypto-name">
                    <span className="crypto-symbol">{crypto.symbol?.toUpperCase()}</span>
                    <span className="crypto-full-name">{crypto.name}</span>
                  </div>
                  <div className="crypto-rank">#{crypto.market_cap_rank}</div>
                </div>

                <button
                  className={`watchlist-star ${crypto.is_watchlist ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatchlist(crypto.id);
                  }}
                  title={crypto.is_watchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  {crypto.is_watchlist ? '★' : '☆'}
                </button>
              </div>

              <div className="crypto-item-details">
                <div className="crypto-price">
                  {formatPrice(crypto.current_price)}
                </div>
                <div className={`crypto-change ${getChangeClass(crypto.price_change_percentage_24h)}`}>
                  {formatChange(crypto.price_change_percentage_24h)}
                </div>
              </div>

              <div className="crypto-item-footer">
                <div className="crypto-stat">
                  <span className="stat-label">MCap:</span>
                  <span className="stat-value">
                    ${(crypto.market_cap / 1000000000).toFixed(2)}B
                  </span>
                </div>
                <div className="crypto-stat">
                  <span className="stat-label">Vol:</span>
                  <span className="stat-value">
                    ${(crypto.total_volume / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CryptoSidebar;
