import { useState, useEffect, useCallback } from 'react';
import { STOCKS, getTrimAlert } from '../data/stocks.js';
import { supabase } from '../lib/supabase.js';

const DEFAULT_POSITIONS = STOCKS.reduce((acc, s) => {
  acc[s.ticker] = { shares: 0, avgCost: 0, purchaseDate: null, currentPrice: 0, lastUpdated: null, lots: [] };
  return acc;
}, {});

export function usePortfolio() {
  const [positions, setPositions] = useState(DEFAULT_POSITIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLots(); }, []);

  const loadLots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('lots').select('*').order('purchase_date', { ascending: true });
      if (error) throw error;
      const built = JSON.parse(JSON.stringify(DEFAULT_POSITIONS));
      (data || []).forEach(lot => {
        const t = lot.ticker;
        if (!built[t]) built[t] = { shares: 0, avgCost: 0, purchaseDate: null, currentPrice: 0, lastUpdated: null, lots: [] };
        built[t].lots.push({ id: lot.id, shares: +lot.shares, cost: +lot.cost_per_share, date: lot.purchase_date });
      });
      Object.keys(built).forEach(t => {
        const lots = built[t].lots;
        if (lots.length > 0) {
          const totalShares = lots.reduce((a, l) => a + l.shares, 0);
          const avgCost = lots.reduce((a, l) => a + l.cost * l.shares, 0) / totalShares;
          built[t].shares = totalShares;
          built[t].avgCost = Math.round(avgCost * 100) / 100;
          built[t].purchaseDate = lots[0].date;
        }
      });
      setPositions(built);
    } catch (e) {
      console.error('Failed to load lots:', e);
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = useCallback((ticker, price) => {
    setPositions(prev => ({ ...prev, [ticker]: { ...prev[ticker], currentPrice: price, lastUpdated: new Date().toISOString() } }));
  }, []);

  const addLot = useCallback(async (ticker, shares, costPerShare, dateStr) => {
    try {
      const { error } = await supabase.from('lots').insert({
        ticker, shares, cost_per_share: costPerShare,
        amount_invested: Math.round(shares * costPerShare * 100) / 100,
        purchase_date: dateStr.slice(0, 10),
      });
      if (error) throw error;
      await loadLots();
    } catch (e) {
      console.error('Failed to add lot:', e);
      alert('Failed to save. Check connection.');
    }
  }, []);

  const deleteLot = useCallback(async (lotId) => {
    try {
      const { error } = await supabase.from('lots').delete().eq('id', lotId);
      if (error) throw error;
      await loadLots();
    } catch (e) {
      console.error('Failed to delete lot:', e);
    }
  }, []);

  const recordTrim = useCallback(async () => { await loadLots(); }, []);

  const totalValue = Object.values(positions).reduce((a, p) => a + (p.shares * p.currentPrice), 0);

  const trimAlerts = STOCKS.map(stock => {
    const pos = positions[stock.ticker];
    if (!pos || pos.shares === 0) return null;
    return getTrimAlert(stock, { ...pos, totalPortfolioValue: totalValue || 1 });
  }).filter(Boolean);

  const positionsWithStats = STOCKS.map(stock => {
    const pos = positions[stock.ticker] || DEFAULT_POSITIONS[stock.ticker];
    const value = pos.shares * pos.currentPrice;
    const cost  = pos.shares * pos.avgCost;
    const gain  = value - cost;
    const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
    const portfolioPct = totalValue > 0 ? (value / totalValue) * 100 : 0;
    const alert = pos.shares > 0 ? getTrimAlert(stock, { ...pos, totalPortfolioValue: totalValue || 1 }) : null;
    return { ...stock, position: pos, value, cost, gain, gainPct, portfolioPct, alert };
  });

  return { positions, positionsWithStats, totalValue, trimAlerts, updatePrice, addLot, deleteLot, recordTrim, loading, reload: loadLots };
}
