import express from 'express';
import cors    from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

config();

const app  = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.VITE_ANTHROPIC_API_KEY });

// Extract JSON from response even if there's surrounding text
function extractJSON(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  // Find first { and last } to extract JSON object
  const start = clean.indexOf('{');
  const end   = clean.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in response');
  return clean.slice(start, end + 1);
}

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
      system: `You are a financial analyst. Search for the latest news on ${ticker} (${name}).
Your response must be ONLY a valid JSON object. No text before or after. No markdown. Start with { and end with }.
Format:
{"summary":"2-3 sentence overview","sentiment":"bullish|neutral|bearish","items":[{"headline":"headline","detail":"detail","source":"source","url":"url","impact":"positive|neutral|negative"}],"catalysts":["catalyst"],"risks":["risk"]}`,
      messages: [{ role: 'user', content: `Search for latest ${ticker} stock news from the past 7 days. Return only JSON.` }],
    });
    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const json = extractJSON(text);
    res.json({ text: json });
  } catch (err) {
    console.error('News error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/screener', async (req, res) => {
  try {
    const { sectors, excluded } = req.body;
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 3000,
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are a professional equity analyst. Search for top 5 growth stocks in: ${sectors?.join(', ')}.
Exclude these tickers: ${excluded}.
Score each 1-10 on: revenue_growth, gross_margin, free_cash_flow, moat, catalyst, valuation.
Your response must be ONLY a valid JSON object. No text before or after. No markdown. Start with { and end with }.
Format exactly:
{"picks":[{"ticker":"TICKER","name":"Company Name","sector":"sector","market_cap":"$XXb","price_approx":"$XXX","total_score":8.5,"scores":{"revenue_growth":9,"gross_margin":8,"free_cash_flow":7,"moat":9,"catalyst":8,"valuation":7},"thesis":"2-3 sentence why now","catalysts":["catalyst 1","catalyst 2"],"risks":["risk 1","risk 2"]}]}
Return exactly 5 picks ordered by total_score descending.`,
      messages: [{ role: 'user', content: `Search and find top 5 growth stocks in ${sectors?.join(', ')} sectors. Exclude: ${excluded}. Return only the JSON object, nothing else.` }],
    });
    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const json = extractJSON(text);
    res.json({ text: json });
  } catch (err) {
    console.error('Screener error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(port, () => console.log(`✅ Portfolio server running on port ${port}`));
