/**
 * Electron Main Process
 * Handles window creation, system integration, and background tasks
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('../database/database');
const DataFetcher = require('../api/dataFetcher');
const PredictionEngine = require('../analysis/predictions/engine');

// Keep a global reference of the window object
let mainWindow;
let database;
let dataFetcher;
let predictionEngine;

// Disable hardware acceleration for better compatibility
app.disableHardwareAcceleration();

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#1a1a2e',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize application services
async function initializeServices() {
  try {
    // Initialize database
    database = new Database();
    await database.initialize();

    // Initialize data fetcher
    dataFetcher = new DataFetcher(database);
    await dataFetcher.initialize();

    // Initialize prediction engine
    predictionEngine = new PredictionEngine(database);

    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}

// App lifecycle events
app.on('ready', async () => {
  await initializeServices();
  createWindow();

  // Start background tasks
  startBackgroundTasks();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // Cleanup
  if (database) {
    database.close();
  }
});

// Background tasks for data updates
function startBackgroundTasks() {
  // Update top cryptocurrencies list every 5 minutes
  setInterval(async () => {
    try {
      await dataFetcher.updateCryptocurrencyList();
      if (mainWindow) {
        mainWindow.webContents.send('crypto-list-updated');
      }
    } catch (error) {
      console.error('Error updating cryptocurrency list:', error);
    }
  }, 5 * 60 * 1000);

  // Update price data every 30 seconds
  setInterval(async () => {
    try {
      const watchlist = await database.getWatchlist();
      await dataFetcher.updatePrices(watchlist);
      if (mainWindow) {
        mainWindow.webContents.send('prices-updated');
      }
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }, 30 * 1000);

  // Recalculate indicators every 2 minutes
  setInterval(async () => {
    try {
      const watchlist = await database.getWatchlist();
      for (const crypto of watchlist) {
        await predictionEngine.updateAnalysis(crypto.id);
      }
      if (mainWindow) {
        mainWindow.webContents.send('analysis-updated');
      }
    } catch (error) {
      console.error('Error updating analysis:', error);
    }
  }, 2 * 60 * 1000);
}

// IPC Event Handlers
ipcMain.handle('get-crypto-list', async (event, filters) => {
  try {
    return await database.getCryptocurrencyList(filters);
  } catch (error) {
    console.error('Error getting crypto list:', error);
    return [];
  }
});

ipcMain.handle('get-crypto-details', async (event, cryptoId) => {
  try {
    return await dataFetcher.getCryptoDetails(cryptoId);
  } catch (error) {
    console.error('Error getting crypto details:', error);
    return null;
  }
});

ipcMain.handle('get-analysis', async (event, cryptoId) => {
  try {
    return await predictionEngine.getAnalysis(cryptoId);
  } catch (error) {
    console.error('Error getting analysis:', error);
    return null;
  }
});

ipcMain.handle('get-prediction', async (event, cryptoId) => {
  try {
    return await predictionEngine.generatePrediction(cryptoId);
  } catch (error) {
    console.error('Error generating prediction:', error);
    return null;
  }
});

ipcMain.handle('toggle-watchlist', async (event, cryptoId) => {
  try {
    return await database.toggleWatchlist(cryptoId);
  } catch (error) {
    console.error('Error toggling watchlist:', error);
    return false;
  }
});

ipcMain.handle('get-historical-accuracy', async (event) => {
  try {
    return await database.getHistoricalAccuracy();
  } catch (error) {
    console.error('Error getting historical accuracy:', error);
    return null;
  }
});

ipcMain.handle('get-price-history', async (event, cryptoId, days) => {
  try {
    return await dataFetcher.getPriceHistory(cryptoId, days);
  } catch (error) {
    console.error('Error getting price history:', error);
    return [];
  }
});

// Export for testing
module.exports = { app, createWindow };
