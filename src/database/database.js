/**
 * SQLite Database Manager
 * Handles all database operations for caching, historical data, and accuracy tracking
 */

const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    const userDataPath = app ? app.getPath('userData') : './data';
    this.dbPath = path.join(userDataPath, 'crypto-analysis.db');
    this.db = null;
  }

  async initialize() {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.createTables();
      console.log('Database initialized at:', this.dbPath);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  createTables() {
    // Cryptocurrencies table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cryptocurrencies (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        image TEXT,
        current_price REAL,
        market_cap REAL,
        market_cap_rank INTEGER,
        total_volume REAL,
        price_change_24h REAL,
        price_change_percentage_24h REAL,
        circulating_supply REAL,
        total_supply REAL,
        ath REAL,
        ath_date TEXT,
        atl REAL,
        atl_date TEXT,
        last_updated TEXT,
        is_watchlist INTEGER DEFAULT 0
      )
    `);

    // Price history table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crypto_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        price REAL NOT NULL,
        volume REAL,
        market_cap REAL,
        FOREIGN KEY (crypto_id) REFERENCES cryptocurrencies(id),
        UNIQUE(crypto_id, timestamp)
      )
    `);

    // Technical indicators cache
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS indicators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crypto_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        indicator_type TEXT NOT NULL,
        value REAL,
        metadata TEXT,
        FOREIGN KEY (crypto_id) REFERENCES cryptocurrencies(id)
      )
    `);

    // Predictions table (for tracking accuracy)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crypto_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        prediction_type TEXT NOT NULL,
        timeframe INTEGER NOT NULL,
        predicted_direction TEXT,
        predicted_probability REAL,
        predicted_price_range_low REAL,
        predicted_price_range_high REAL,
        confidence_level REAL,
        indicators_used TEXT,
        actual_direction TEXT,
        actual_price REAL,
        was_accurate INTEGER,
        evaluated_at INTEGER,
        FOREIGN KEY (crypto_id) REFERENCES cryptocurrencies(id)
      )
    `);

    // Pattern recognition results
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crypto_id TEXT NOT NULL,
        detected_at INTEGER NOT NULL,
        pattern_type TEXT NOT NULL,
        confidence REAL,
        expected_outcome TEXT,
        actual_outcome TEXT,
        outcome_evaluated INTEGER DEFAULT 0,
        FOREIGN KEY (crypto_id) REFERENCES cryptocurrencies(id)
      )
    `);

    // Create indexes for performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_price_history_crypto
      ON price_history(crypto_id, timestamp DESC);

      CREATE INDEX IF NOT EXISTS idx_indicators_crypto
      ON indicators(crypto_id, timestamp DESC);

      CREATE INDEX IF NOT EXISTS idx_predictions_crypto
      ON predictions(crypto_id, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_watchlist
      ON cryptocurrencies(is_watchlist) WHERE is_watchlist = 1;
    `);
  }

  // Cryptocurrency operations
  upsertCryptocurrency(crypto) {
    const stmt = this.db.prepare(`
      INSERT INTO cryptocurrencies (
        id, symbol, name, image, current_price, market_cap,
        market_cap_rank, total_volume, price_change_24h,
        price_change_percentage_24h, circulating_supply, total_supply,
        ath, ath_date, atl, atl_date, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        symbol = excluded.symbol,
        name = excluded.name,
        image = excluded.image,
        current_price = excluded.current_price,
        market_cap = excluded.market_cap,
        market_cap_rank = excluded.market_cap_rank,
        total_volume = excluded.total_volume,
        price_change_24h = excluded.price_change_24h,
        price_change_percentage_24h = excluded.price_change_percentage_24h,
        circulating_supply = excluded.circulating_supply,
        total_supply = excluded.total_supply,
        ath = excluded.ath,
        ath_date = excluded.ath_date,
        atl = excluded.atl,
        atl_date = excluded.atl_date,
        last_updated = excluded.last_updated
    `);

    return stmt.run(
      crypto.id,
      crypto.symbol,
      crypto.name,
      crypto.image,
      crypto.current_price,
      crypto.market_cap,
      crypto.market_cap_rank,
      crypto.total_volume,
      crypto.price_change_24h,
      crypto.price_change_percentage_24h,
      crypto.circulating_supply,
      crypto.total_supply,
      crypto.ath,
      crypto.ath_date,
      crypto.atl,
      crypto.atl_date,
      crypto.last_updated
    );
  }

  getCryptocurrencyList(filters = {}) {
    let query = 'SELECT * FROM cryptocurrencies WHERE 1=1';
    const params = [];

    if (filters.watchlistOnly) {
      query += ' AND is_watchlist = 1';
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR symbol LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Sorting
    const sortBy = filters.sortBy || 'market_cap_rank';
    const sortOrder = filters.sortOrder || 'ASC';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Limit
    const limit = filters.limit || 500;
    query += ` LIMIT ?`;
    params.push(limit);

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  getCryptocurrency(id) {
    const stmt = this.db.prepare('SELECT * FROM cryptocurrencies WHERE id = ?');
    return stmt.get(id);
  }

  // Watchlist operations
  toggleWatchlist(cryptoId) {
    const stmt = this.db.prepare(`
      UPDATE cryptocurrencies
      SET is_watchlist = CASE WHEN is_watchlist = 1 THEN 0 ELSE 1 END
      WHERE id = ?
    `);
    stmt.run(cryptoId);

    const result = this.db.prepare('SELECT is_watchlist FROM cryptocurrencies WHERE id = ?');
    return result.get(cryptoId)?.is_watchlist === 1;
  }

  getWatchlist() {
    const stmt = this.db.prepare('SELECT * FROM cryptocurrencies WHERE is_watchlist = 1');
    return stmt.all();
  }

  // Price history operations
  insertPriceHistory(cryptoId, timestamp, price, volume, marketCap) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO price_history
      (crypto_id, timestamp, price, volume, market_cap)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(cryptoId, timestamp, price, volume, marketCap);
  }

  getPriceHistory(cryptoId, days = 30) {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const stmt = this.db.prepare(`
      SELECT * FROM price_history
      WHERE crypto_id = ? AND timestamp >= ?
      ORDER BY timestamp ASC
    `);
    return stmt.all(cryptoId, cutoffTime);
  }

  // Indicator operations
  saveIndicator(cryptoId, indicatorType, value, metadata = null) {
    const stmt = this.db.prepare(`
      INSERT INTO indicators (crypto_id, timestamp, indicator_type, value, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(cryptoId, Date.now(), indicatorType, value, JSON.stringify(metadata));
  }

  getLatestIndicators(cryptoId) {
    const stmt = this.db.prepare(`
      SELECT indicator_type, value, metadata, timestamp
      FROM indicators
      WHERE crypto_id = ? AND timestamp = (
        SELECT MAX(timestamp) FROM indicators WHERE crypto_id = ?
      )
    `);
    return stmt.all(cryptoId, cryptoId);
  }

  // Prediction operations
  savePrediction(prediction) {
    const stmt = this.db.prepare(`
      INSERT INTO predictions (
        crypto_id, created_at, prediction_type, timeframe,
        predicted_direction, predicted_probability,
        predicted_price_range_low, predicted_price_range_high,
        confidence_level, indicators_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      prediction.cryptoId,
      prediction.createdAt,
      prediction.type,
      prediction.timeframe,
      prediction.direction,
      prediction.probability,
      prediction.priceRangeLow,
      prediction.priceRangeHigh,
      prediction.confidence,
      JSON.stringify(prediction.indicators)
    );
  }

  evaluatePredictions() {
    // Get unevaluated predictions that have passed their timeframe
    const stmt = this.db.prepare(`
      SELECT p.*, c.current_price
      FROM predictions p
      JOIN cryptocurrencies c ON p.crypto_id = c.id
      WHERE p.evaluated_at IS NULL
        AND p.created_at + (p.timeframe * 1000) <= ?
    `);

    const currentTime = Date.now();
    const predictions = stmt.all(currentTime);

    const updateStmt = this.db.prepare(`
      UPDATE predictions
      SET actual_direction = ?,
          actual_price = ?,
          was_accurate = ?,
          evaluated_at = ?
      WHERE id = ?
    `);

    for (const pred of predictions) {
      // Get price at the time the prediction was made
      const originalPrice = this.db.prepare(`
        SELECT price FROM price_history
        WHERE crypto_id = ? AND timestamp <= ?
        ORDER BY timestamp DESC LIMIT 1
      `).get(pred.crypto_id, pred.created_at);

      if (originalPrice) {
        const actualDirection = pred.actual_price > originalPrice.price ? 'up' :
                               pred.actual_price < originalPrice.price ? 'down' : 'neutral';

        const wasAccurate = actualDirection === pred.predicted_direction &&
                           pred.actual_price >= pred.predicted_price_range_low &&
                           pred.actual_price <= pred.predicted_price_range_high;

        updateStmt.run(
          actualDirection,
          pred.current_price,
          wasAccurate ? 1 : 0,
          currentTime,
          pred.id
        );
      }
    }

    return predictions.length;
  }

  getHistoricalAccuracy() {
    const overall = this.db.prepare(`
      SELECT
        COUNT(*) as total_predictions,
        SUM(was_accurate) as accurate_predictions,
        ROUND(SUM(was_accurate) * 100.0 / COUNT(*), 2) as accuracy_percentage
      FROM predictions
      WHERE evaluated_at IS NOT NULL
    `).get();

    const byTimeframe = this.db.prepare(`
      SELECT
        timeframe,
        COUNT(*) as total,
        SUM(was_accurate) as accurate,
        ROUND(SUM(was_accurate) * 100.0 / COUNT(*), 2) as accuracy_percentage
      FROM predictions
      WHERE evaluated_at IS NOT NULL
      GROUP BY timeframe
    `).all();

    const last30Days = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(was_accurate) as accurate,
        ROUND(SUM(was_accurate) * 100.0 / COUNT(*), 2) as accuracy_percentage
      FROM predictions
      WHERE evaluated_at IS NOT NULL
        AND created_at >= ?
    `).get(Date.now() - (30 * 24 * 60 * 60 * 1000));

    return {
      overall,
      byTimeframe,
      last30Days
    };
  }

  // Pattern operations
  savePattern(cryptoId, patternType, confidence, expectedOutcome) {
    const stmt = this.db.prepare(`
      INSERT INTO patterns (crypto_id, detected_at, pattern_type, confidence, expected_outcome)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(cryptoId, Date.now(), patternType, confidence, expectedOutcome);
  }

  getPatternHistory(patternType) {
    const stmt = this.db.prepare(`
      SELECT
        expected_outcome,
        actual_outcome,
        COUNT(*) as occurrences
      FROM patterns
      WHERE pattern_type = ? AND outcome_evaluated = 1
      GROUP BY expected_outcome, actual_outcome
    `);
    return stmt.all(patternType);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = DatabaseManager;
