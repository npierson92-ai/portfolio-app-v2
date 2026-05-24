import { useState, useEffect, useCallback } from 'react';
import { STOCKS, getTrimAlert } from '../data/stocks.js';

const STORAGE_KEY = 'portfolio_v2_positions';

const DEFAULT_POSITIONS = STOCKS.reduce((acc, s) => {
  acc[s.ticker] = {
    shares:       0,
    avgCost:      0,
    purchaseDate: null,
    currentPrice: 0,
    lastUpdated:  null,
    lots:         [], // { shares, cost, date }
  };
  return acc;
}, {});

export function usePortfolio() {
  const [positions, setPositions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_POSITIONS, ...JSON.parse(stored) } : DEFAULT_POSITIONS;
    } catch { return DEFAULT_POSITIONS; }
  });

  const save = useCallback((updated) => {
    setPositions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const updatePrice = useCallback((ticker, price) => {
    setPositions(prev => {
      const updated = { ...prev, [ticker]: { ...prev[ticker], currentPrice: price, lastUpdated: new Date().toISOString() } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addLot = useCallback((ticker, shares, cost, date = new Date().toISOString()) => {
    setPositions(prev => {
      const pos     = prev[ticker];
      const newLots = [...(pos.lots || []), { shares, cost, date }];
      const totalShares = newLots.reduce((a, l) => a + l.shares, 0);
      const avgCost = newLots.reduce((a, l) => a + l.cost * l.shares, 0) / totalShares;
      const updated = {
        ...prev,
        [ticker]: {
          ...pos,
          shares:       totalShares,
          avgCost:      Math.round(avgCost * 100) / 100,
          purchaseDate: pos.purchaseDate || date,
          lots:         newLots,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const recordTrim = useCallback((ticker, shares) => {
    setPositions(prev => {
      const pos        = prev[ticker];
      const newShares  = Math.max(0, (pos.shares || 0) - shares);
      const newLots    = [...(pos.lots || [])];
      let   remaining  = shares;
      // Remove from oldest lots first (FIFO for tax purposes)
      for (let i = 0; i < newLots.length && remaining > 0; i++) {
        if (newLots[i].shares <= remaining) {
          remaining -= newLots[i].shares;
          newLots[i].shares = 0;
        } else {
          newLots[i].shares -= remaining;
          remaining = 0;
        }
      }
      const filteredLots = newLots.filter(l => l.shares > 0);
      const updated = {
        ...prev,
        [ticker]: { ...pos, shares: newShares, lots: filteredLots },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Compute derived data
  const totalValue = Object.entries(positions).reduce((a, [ticker, pos]) => {
    return a + (pos.shares * pos.currentPrice);
  }, 0);

  const trimAlerts = STOCKS.map(stock => {
    const pos = positions[stock.ticker];
    if (!pos || pos.shares === 0) return null;
    return getTrimAlert(stock, { ...pos, totalPortfolioValue: totalValue || 1 });
  }).filter(Boolean);

  const positionsWithStats = STOCKS.map(stock => {
    const pos = positions[stock.ticker] || DEFAULT_POSITIONS[stock.ticker];
    const value    = pos.shares * pos.currentPrice;
    const cost     = pos.shares * pos.avgCost;
    const gain     = value - cost;
    const gainPct  = cost > 0 ? (gain / cost) * 100 : 0;
    const portfolioPct = totalValue > 0 ? (value / totalValue) * 100 : 0;
    const alert    = pos.shares > 0 ? getTrimAlert(stock, { ...pos, totalPortfolioValue: totalValue || 1 }) : null;
    return { ...stock, position: pos, value, cost, gain, gainPct, portfolioPct, alert };
  });

  return {
    positions,
    positionsWithStats,
    totalValue,
    trimAlerts,
    updatePrice,
    addLot,
    recordTrim,
    save,
  };
}
