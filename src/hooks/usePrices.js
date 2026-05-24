import { useState, useEffect, useCallback } from 'react';
import { STOCKS } from '../data/stocks.js';

const PROXY = 'https://portfolio-app-production-ee72.up.railway.app';
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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${PROXY}/api/prices?tickers=${TICKERS.join(',')}`, { signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.prices) {
        setPrices(data.prices);
        setLastFetch(new Date().toISOString());
        Object.entries(data.prices).forEach(([ticker, price]) => {
          updatePrice(ticker, price);
        });
      }
    } catch (e) {
      setError('Price fetch failed');
    } finally {
      setLoading(false);
    }
  }, [updatePrice]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPrices(), 1000);
    return () => clearTimeout(timer);
  }, [fetchPrices]);

  return { prices, loading, lastFetch, error, fetchPrices };
}
