import express from 'express';
import cors    from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

config();

const app  = express();
const port = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.VITE_ANTHROPIC_API_KEY });

// ── Prices endpoint (Yahoo Finance via public API) ────────────────
app.get('/api/prices', async (req, res) => {
  try {
    const tickers = (req.query.tickers || '').split(',').filter(Boolean);
    if (!tickers.length) return res.json({ prices: {} });

    const prices = {};
    await Promise.all(tickers.map(async (ticker) => {
      try {
        const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
        const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const data = await resp.json();
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price) prices[ticker] = Math.round(price * 100) / 100;
      } catch {}
    }));

    res.json({ prices, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── News endpoint ─────────────────────────────────────────────────
app.post('/api/news', async (req, res) => {
  try {
    const { ticker, name } = req.body;
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 2048,
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are a financial analyst. Search for the latest news on ${ticker} (${name}). Return ONLY valid JSON, no markdown:
{
  "summary": "2-3 sentence overview of current company health",
  "sentiment": "bullish|neutral|bearish",
  "items": [
    { "headline": "short headline", "detail": "1-2 sentence detail", "source": "publication", "url": "url or empty", "impact": "positive|neutral|negative" }
  ],
  "catalysts": ["catalyst 1", "catalyst 2"],
  "risks": ["risk 1", "risk 2"]
}
Max 4 news items.`,
      messages: [{ role: 'user', content: `Search for latest ${ticker} stock news, earnings, analyst updates from the past 7 days.` }],
    });

    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    res.json({ text });
  } catch (err) {
    console.error('News error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Screener endpoint ─────────────────────────────────────────────
app.post('/api/screener', async (req, res) => {
  try {
    const { sectors, excluded } = req.body;
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 2048,
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are a professional equity analyst running a 6-layer stock screening pipeline. 
Search for the top 5 growth stocks across these sectors: ${sectors.join(', ')}.
Exclude: ${excluded}.

Score each stock 1-10 on: revenue_growth, gross_margin, free_cash_flow, moat, catalyst, valuation.

Return ONLY valid JSON, no markdown:
{
  "picks": [
    {
      "ticker": "TICKER",
      "name": "Company Name",
      "sector": "sector",
      "market_cap": "$XXb",
      "price_approx": "$XXX",
      "total_score": 8.5,
      "scores": {
        "revenue_growth": 9,
        "gross_margin": 8,
        "free_cash_flow": 7,
        "moat": 9,
        "catalyst": 8,
        "valuation": 7
      },
      "thesis": "2-3 sentence why now",
      "catalysts": ["catalyst 1", "catalyst 2"],
      "risks": ["risk 1", "risk 2"]
    }
  ]
}
Return exactly 5 picks ordered by total_score descending.`,
      messages: [{ role: 'user', content: `Screen for top 5 growth stocks in ${sectors.join(', ')} sectors. Search for recent earnings, analyst upgrades, momentum. Exclude: ${excluded}.` }],
    });

    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    res.json({ text });
  } catch (err) {
    console.error('Screener error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(port, () => console.log(`✅ Portfolio server running on port ${port}`));
