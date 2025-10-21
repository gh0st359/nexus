/**
 * Price Chart Component
 * Displays price history with candlestick or line chart
 */

import React, { useEffect, useRef } from 'react';
import '../styles/chart.css';

function PriceChart({ data, crypto, timeframe }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0 && canvasRef.current) {
      drawChart();
    }
  }, [data, timeframe]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Set canvas size for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 80, bottom: 40, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get price range
    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Add 5% padding to price range
    const paddedMin = minPrice - (priceRange * 0.05);
    const paddedMax = maxPrice + (priceRange * 0.05);
    const paddedRange = paddedMax - paddedMin;

    // Helper functions
    const getX = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
    const getY = (price) => padding.top + ((paddedMax - price) / paddedRange) * chartHeight;

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;

    // Horizontal grid lines (price levels)
    const numHLines = 5;
    for (let i = 0; i <= numHLines; i++) {
      const y = padding.top + (i / numHLines) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Price labels
      const price = paddedMax - (i / numHLines) * paddedRange;
      ctx.fillStyle = '#8b8b9a';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        price < 1 ? price.toFixed(4) : price.toFixed(2),
        padding.left + chartWidth + 5,
        y + 4
      );
    }

    // Vertical grid lines (time)
    const numVLines = Math.min(6, data.length);
    for (let i = 0; i <= numVLines; i++) {
      const x = padding.left + (i / numVLines) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();

      // Time labels
      if (i < data.length) {
        const dataIndex = Math.floor((i / numVLines) * (data.length - 1));
        const date = new Date(data[dataIndex].timestamp);
        const label =
          timeframe <= 7
            ? `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`
            : `${date.getMonth() + 1}/${date.getDate()}`;

        ctx.fillStyle = '#8b8b9a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, padding.top + chartHeight + 15);
      }
    }

    // Draw price line
    ctx.beginPath();
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;

    data.forEach((point, index) => {
      const x = getX(index);
      const y = getY(point.price);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw area under line
    ctx.lineTo(getX(data.length - 1), padding.top + chartHeight);
    ctx.lineTo(getX(0), padding.top + chartHeight);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(74, 158, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(74, 158, 255, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw current price indicator
    const currentPrice = prices[prices.length - 1];
    const currentY = getY(currentPrice);

    // Current price line
    ctx.beginPath();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(padding.left, currentY);
    ctx.lineTo(padding.left + chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current price label
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(padding.left + chartWidth + 2, currentY - 10, 75, 20);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toFixed(2),
      padding.left + chartWidth + 5,
      currentY + 4
    );

    // Chart title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${crypto.symbol?.toUpperCase()} Price Chart`, padding.left, 15);
  };

  if (!data || data.length === 0) {
    return (
      <div className="price-chart">
        <div className="no-chart-data">
          <p>No price history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="price-chart">
      <canvas ref={canvasRef} className="chart-canvas"></canvas>
    </div>
  );
}

export default PriceChart;
