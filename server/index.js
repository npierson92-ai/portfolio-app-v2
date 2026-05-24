import express from 'express';
import cors    from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

config();

const app  = express();
const port = process.env.PORT || 3001;

// Allow all origins — fixes CORS for Railway deployment
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.VITE_ANTHROPIC_API_KEY });

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

app.post('/api/news', async (req, res) => {
  try {
    const { ticker, name } = req.body;
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 2048,
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are a financial analyst. Search for the latest news on ${ticker} (${name}). Return ONLY valid JSON, no markdown:
{"summary":"2-3 sentence overview","sentiment":"bullish|neutral|bearish","items":[{"headline":"headline","detail":"detail","source":"source","url":"url","impact":"positive|neutral|negative"}],"catalysts":["catalyst"],"risks":["risk"]}`,
      messages: [{ role: 'user', content: `Search for latest ${ticker} stock news from the past 7 days.` }],
    });
    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/screener', async (req, res) => {
  try {
    const { sectors, excluded } = req.body;
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 2048,
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are an equity analyst. Find top 5 growth stocks in: ${sectors?.join(', ')}. Exclude: ${excluded}. Return ONLY valid JSON: {"picks":[{"ticker":"","name":"","sector":"","market_cap":"","price_approx":"","total_score":8,"scores":{"revenue_growth":8,"gross_margin":8,"free_cash_flow":7,"moat":8,"catalyst":8,"valuation":7},"thesis":"","catalysts":[""],"risks":[""]}]}`,
      messages: [{ role: 'user', content: `Find top 5 growth stocks in ${sectors?.join(', ')} sectors. Exclude: ${excluded}.` }],
    });
    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(port, () => console.log(`✅ Portfolio server running on port ${port}`));
