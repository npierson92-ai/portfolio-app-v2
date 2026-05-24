import { useState, useEffect, useCallback } from 'react';
import { STOCKS } from '../data/stocks.js';

const PROXY = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';
const TICKERS = STOCKS.map(s => s.ticker).filter(t => t !== 'VOO/SPY').concat(['VOO']);

export function usePrices(updatePrice) {
  const [prices,    setPrices]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [error,     setError]     = useState(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${PROXY}/api/prices?tickers=${TICKERS.join(',')}`);
      const data = await res.json();
      if (data.prices) {
        setPrices(data.prices);
        setLastFetch(new Date().toISOString());
        Object.entries(data.prices).forEach(([ticker, price]) => {
          updatePrice(ticker, price);
        });
      }
    } catch (e) {
      setError('Price fetch failed — check proxy connection');
    } finally {
      setLoading(false);
    }
  }, [updatePrice]);

  // Auto-refresh every 5 minutes during market hours
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => {
      const now  = new Date();
      const hour = now.getUTCHours();
      const day  = now.getUTCDay();
      // Market hours: Mon-Fri 13:30-20:00 UTC (9:30am-4pm ET)
      if (day >= 1 && day <= 5 && hour >= 13 && hour < 20) {
        fetchPrices();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading, lastFetch, error, fetchPrices };
}
