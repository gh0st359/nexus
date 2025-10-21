/**
 * Data Fetcher
 * Manages API calls to CoinGecko and CoinCap with rate limiting and fallback
 */

const axios = require('axios');

class DataFetcher {
  constructor(database) {
    this.database = database;
    this.coinGeckoBaseUrl = 'https://api.coingecko.com/api/v3';
    this.coinCapBaseUrl = 'https://api.coincap.io/v2';

    // Rate limiting
    this.lastCoinGeckoCall = 0;
    this.coinGeckoMinInterval = 1200; // ~50 calls per minute
    this.requestQueue = [];
    this.processing = false;
  }

  async initialize() {
    console.log('Data fetcher initialized');
    // Initial data fetch
    await this.updateCryptocurrencyList();
  }

  /**
   * Rate-limited request to CoinGecko
   */
  async coinGeckoRequest(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ endpoint, params, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCoinGeckoCall;

      if (timeSinceLastCall < this.coinGeckoMinInterval) {
        await this.sleep(this.coinGeckoMinInterval - timeSinceLastCall);
      }

      const request = this.requestQueue.shift();

      try {
        const response = await axios.get(
          `${this.coinGeckoBaseUrl}${request.endpoint}`,
          {
            params: request.params,
            timeout: 10000
          }
        );

        this.lastCoinGeckoCall = Date.now();
        request.resolve(response.data);
      } catch (error) {
        console.error(`CoinGecko API error for ${request.endpoint}:`, error.message);
        request.reject(error);
      }

      // Small delay between requests
      await this.sleep(100);
    }

    this.processing = false;
  }

  /**
   * Fallback to CoinCap API
   */
  async coinCapRequest(endpoint) {
    try {
      const response = await axios.get(
        `${this.coinCapBaseUrl}${endpoint}`,
        { timeout: 10000 }
      );
      return response.data.data;
    } catch (error) {
      console.error('CoinCap API error:', error.message);
      throw error;
    }
  }

  /**
   * Update cryptocurrency list (top 500)
   */
  async updateCryptocurrencyList() {
    try {
      console.log('Updating cryptocurrency list...');

      // Fetch in batches of 250 (CoinGecko limit)
      const batch1 = await this.coinGeckoRequest('/coins/markets', {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        sparkline: false
      });

      const batch2 = await this.coinGeckoRequest('/coins/markets', {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 2,
        sparkline: false
      });

      const allCoins = [...batch1, ...batch2];

      // Store in database
      for (const coin of allCoins) {
        this.database.upsertCryptocurrency(coin);
      }

      console.log(`Updated ${allCoins.length} cryptocurrencies`);
      return allCoins;
    } catch (error) {
      console.error('Failed to update cryptocurrency list:', error);

      // Try CoinCap as fallback
      try {
        const assets = await this.coinCapRequest('/assets?limit=500');
        // Convert CoinCap format to our format
        const converted = assets.map(asset => ({
          id: asset.id,
          symbol: asset.symbol.toLowerCase(),
          name: asset.name,
          image: null,
          current_price: parseFloat(asset.priceUsd),
          market_cap: parseFloat(asset.marketCapUsd),
          market_cap_rank: parseInt(asset.rank),
          total_volume: parseFloat(asset.volumeUsd24Hr),
          price_change_percentage_24h: parseFloat(asset.changePercent24Hr),
          circulating_supply: parseFloat(asset.supply),
          total_supply: parseFloat(asset.maxSupply),
          last_updated: new Date().toISOString()
        }));

        for (const coin of converted) {
          this.database.upsertCryptocurrency(coin);
        }

        console.log(`Updated ${converted.length} cryptocurrencies from CoinCap`);
        return converted;
      } catch (fallbackError) {
        console.error('CoinCap fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Update prices for specific cryptocurrencies
   */
  async updatePrices(cryptoList) {
    if (!cryptoList || cryptoList.length === 0) {
      return;
    }

    try {
      const ids = cryptoList.map(c => c.id).join(',');

      const data = await this.coinGeckoRequest('/simple/price', {
        ids: ids,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
        include_market_cap: true
      });

      const timestamp = Date.now();

      for (const cryptoId in data) {
        const priceData = data[cryptoId];

        // Update current price in cryptocurrencies table
        const crypto = this.database.getCryptocurrency(cryptoId);
        if (crypto) {
          crypto.current_price = priceData.usd;
          crypto.price_change_percentage_24h = priceData.usd_24h_change;
          crypto.total_volume = priceData.usd_24h_vol;
          crypto.market_cap = priceData.usd_market_cap;
          crypto.last_updated = new Date().toISOString();
          this.database.upsertCryptocurrency(crypto);
        }

        // Store in price history
        this.database.insertPriceHistory(
          cryptoId,
          timestamp,
          priceData.usd,
          priceData.usd_24h_vol,
          priceData.usd_market_cap
        );
      }
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  }

  /**
   * Get detailed information for a cryptocurrency
   */
  async getCryptoDetails(cryptoId) {
    try {
      // Check cache first
      const cached = this.database.getCryptocurrency(cryptoId);
      if (cached && this.isCacheFresh(cached.last_updated, 60)) {
        return cached;
      }

      // Fetch fresh data
      const data = await this.coinGeckoRequest(`/coins/${cryptoId}`, {
        localization: false,
        tickers: false,
        community_data: false,
        developer_data: false
      });

      const formatted = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        image: data.image?.large,
        current_price: data.market_data?.current_price?.usd,
        market_cap: data.market_data?.market_cap?.usd,
        market_cap_rank: data.market_cap_rank,
        total_volume: data.market_data?.total_volume?.usd,
        price_change_24h: data.market_data?.price_change_24h,
        price_change_percentage_24h: data.market_data?.price_change_percentage_24h,
        circulating_supply: data.market_data?.circulating_supply,
        total_supply: data.market_data?.total_supply,
        ath: data.market_data?.ath?.usd,
        ath_date: data.market_data?.ath_date?.usd,
        atl: data.market_data?.atl?.usd,
        atl_date: data.market_data?.atl_date?.usd,
        last_updated: data.last_updated
      };

      this.database.upsertCryptocurrency(formatted);
      return formatted;
    } catch (error) {
      console.error(`Failed to get details for ${cryptoId}:`, error);
      return this.database.getCryptocurrency(cryptoId);
    }
  }

  /**
   * Get historical price data
   */
  async getPriceHistory(cryptoId, days = 30) {
    try {
      // Check if we have recent data in database
      const cached = this.database.getPriceHistory(cryptoId, days);
      if (cached && cached.length > days * 20) { // At least 20 data points per day
        return cached;
      }

      // Fetch from API
      const data = await this.coinGeckoRequest(`/coins/${cryptoId}/market_chart`, {
        vs_currency: 'usd',
        days: days,
        interval: days > 90 ? 'daily' : 'hourly'
      });

      if (data.prices) {
        // Store in database
        for (const [timestamp, price] of data.prices) {
          const volume = data.total_volumes.find(v => v[0] === timestamp)?.[1];
          const marketCap = data.market_caps.find(m => m[0] === timestamp)?.[1];

          this.database.insertPriceHistory(
            cryptoId,
            timestamp,
            price,
            volume,
            marketCap
          );
        }

        return this.database.getPriceHistory(cryptoId, days);
      }

      return cached || [];
    } catch (error) {
      console.error(`Failed to get price history for ${cryptoId}:`, error);
      return this.database.getPriceHistory(cryptoId, days);
    }
  }

  /**
   * Get OHLCV data for technical analysis
   */
  async getOHLCVData(cryptoId, days = 30) {
    try {
      const data = await this.coinGeckoRequest(`/coins/${cryptoId}/ohlc`, {
        vs_currency: 'usd',
        days: days
      });

      return data.map(candle => ({
        timestamp: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4]
      }));
    } catch (error) {
      console.error(`Failed to get OHLCV data for ${cryptoId}:`, error);

      // Fallback: construct from price history
      const history = await this.getPriceHistory(cryptoId, days);
      return this.constructOHLCFromHistory(history);
    }
  }

  /**
   * Construct OHLC data from price history
   */
  constructOHLCFromHistory(priceHistory) {
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

  /**
   * Check if cached data is fresh
   */
  isCacheFresh(lastUpdated, maxAgeMinutes) {
    if (!lastUpdated) return false;

    const age = Date.now() - new Date(lastUpdated).getTime();
    return age < maxAgeMinutes * 60 * 1000;
  }

  /**
   * Utility sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DataFetcher;
