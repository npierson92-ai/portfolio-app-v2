import { useState, useEffect } from 'react';

const PROXY = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';
const STORAGE_KEY = 'portfolio_v2_screener';

const SECTORS = [
  'Technology', 'Healthcare', 'Financial Services', 'Consumer Discretionary',
  'Industrials', 'Energy', 'Real Estate', 'Communication Services',
  'Defense & Aerospace', 'Biotech', 'Clean Energy', 'Consumer Staples',
];

const EXCLUDED = 'VOO, NVDA, MSFT, META, CRWD, AXON, NVO, APLD, TSLA, WMT';

const SCORE_LABELS = {
  revenue_growth:  'Revenue Growth',
  gross_margin:    'Gross Margin',
  free_cash_flow:  'Free Cash Flow',
  moat:            'Competitive Moat',
  catalyst:        'Near-term Catalyst',
  valuation:       'Valuation',
};

async function runScreener(sectors) {
  const res = await fetch(`${PROXY}/api/screener`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectors, excluded: EXCLUDED }),
  });
  const data  = await res.json();
  if (data.error) throw new Error(data.error);
  const clean = data.text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

function getWeekId() {
  const now   = new Date();
  const year  = now.getFullYear();
  const start = new Date(year, 0, 1);
  const week  = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${year}-W${week}`;
}

export default function Screener() {
  const [picks,     setPicks]     = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [sectors,   setSectors]   = useState(['Technology', 'Healthcare', 'Consumer Discretionary']);
  const [selected,  setSelected]  = useState(null);
  const [lastRun,   setLastRun]   = useState(null);
  const [weekId,    setWeekId]    = useState(getWeekId());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (stored.picks)     setPicks(stored.picks);
      if (stored.watchlist) setWatchlist(stored.watchlist);
      if (stored.lastRun)   setLastRun(stored.lastRun);
      if (stored.weekId)    setWeekId(stored.weekId);
    } catch {}
  }, []);

  const save = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const runScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const result  = await runScreener(sectors);
      const newPicks = result.picks || [];
      const data    = { picks: newPicks, watchlist, lastRun: new Date().toISOString(), weekId: getWeekId() };
      setPicks(newPicks);
      setLastRun(data.lastRun);
      setWeekId(data.weekId);
      save(data);
    } catch (e) {
      setError(`Scan failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = (pick) => {
    const updated = watchlist.find(w => w.ticker === pick.ticker)
      ? watchlist.filter(w => w.ticker !== pick.ticker)
      : [...watchlist, { ...pick, addedAt: new Date().toISOString() }];
    setWatchlist(updated);
    save({ picks, watchlist: updated, lastRun, weekId });
  };

  const scoreColor = (score) => score >= 8 ? '#69ff47' : score >= 6 ? '#ffcc00' : '#ff9100';

  const detail = selected ? picks.find(p => p.ticker === selected) : null;

  if (detail) {
    return (
      <div style={{ padding: '16px 16px calc(100px + var(--safe-bottom))', overflowY: 'auto', height: '100%' }}>
        <button onClick={() => setSelected(null)} style={backBtn}>← SCREENER</button>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: '#00e5ff', letterSpacing: '0.15em', marginBottom: 2 }}>{detail.sector} · {detail.name}</div>
          <div style={{ fontSize: 44, fontFamily: 'var(--display)', color: '#fff', lineHeight: 1 }}>{detail.ticker}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: 'var(--gold)' }}>{detail.market_cap}</span>
            <span style={{ fontSize: 10, color: 'var(--cyan)' }}>{detail.price_approx}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>Score: {detail.total_score}/10</span>
          </div>
        </div>

        {/* Score breakdown */}
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 12 }}>SCREENING SCORECARD</div>
          {Object.entries(detail.scores || {}).map(([key, score]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 120, fontSize: 9, color: 'var(--text3)', flexShrink: 0 }}>{SCORE_LABELS[key] || key}</div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${score * 10}%`, background: scoreColor(score), borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: scoreColor(score), width: 24, textAlign: 'right', fontFamily: 'var(--display)' }}>{score}</div>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--bg3)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: 'var(--text3)' }}>TOTAL SCORE</span>
            <span style={{ fontSize: 18, color: scoreColor(detail.total_score), fontFamily: 'var(--display)' }}>{detail.total_score}/10</span>
          </div>
        </div>

        {/* Thesis */}
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 10 }}>WHY NOW</div>
          <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>{detail.thesis}</p>
        </div>

        {/* Catalysts + risks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div style={card}>
            <div style={{ fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em', marginBottom: 8 }}>CATALYSTS</div>
            {(detail.catalysts || []).map((c, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.5, paddingLeft: 8, borderLeft: '2px solid #69ff4733' }}>{c}</div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontSize: 9, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 8 }}>RISKS</div>
            {(detail.risks || []).map((r, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.5, paddingLeft: 8, borderLeft: '2px solid #ff444433' }}>{r}</div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => addToWatchlist(detail)} style={{ flex: 1, padding: 12, background: watchlist.find(w => w.ticker === detail.ticker) ? '#69ff4720' : 'var(--bg3)', border: `1px solid ${watchlist.find(w => w.ticker === detail.ticker) ? 'var(--green)' : 'var(--border2)'}`, borderRadius: 8, color: watchlist.find(w => w.ticker === detail.ticker) ? 'var(--green)' : 'var(--text3)', fontSize: 10, letterSpacing: '0.1em' }}>
            {watchlist.find(w => w.ticker === detail.ticker) ? '★ WATCHLISTED' : '☆ ADD TO WATCHLIST'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 16px calc(100px + var(--safe-bottom))', overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.2em', marginBottom: 2 }}>AI-POWERED · 6-LAYER PIPELINE</div>
        <div style={{ fontSize: 44, fontFamily: 'var(--display)', color: '#fff', lineHeight: 1 }}>SCREENER</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>
          {lastRun ? `Last scan: ${new Date(lastRun).toLocaleDateString()} · ${weekId}` : 'No scan run yet this week'}
        </div>
      </div>

      {/* Sector selector */}
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 10 }}>SELECT SECTORS TO SCAN</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSectors(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
              style={{ fontSize: 9, padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--mono)',
                border: `1px solid ${sectors.includes(s) ? 'var(--cyan)' : 'var(--border)'}`,
                background: sectors.includes(s) ? '#00e5ff15' : 'transparent',
                color: sectors.includes(s) ? 'var(--cyan)' : 'var(--text3)',
              }}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={runScan} disabled={loading || sectors.length === 0} style={{ width: '100%', padding: 14, background: 'var(--cyan)', border: 'none', borderRadius: 10, color: 'var(--bg)', fontSize: 11, letterSpacing: '0.12em', fontFamily: 'var(--mono)', fontWeight: 500, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'SCANNING MARKETS…' : `SCAN ${sectors.length} SECTOR${sectors.length !== 1 ? 'S' : ''} · TOP 5 PICKS`}
        </button>
      </div>

      {error && <div style={{ ...card, borderColor: '#ff440033', marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--red)', marginBottom: 4 }}>Scan Error</div>
        <div style={{ fontSize: 10, color: 'var(--text2)' }}>{error}</div>
      </div>}

      {loading && <div style={{ ...card, textAlign: 'center', padding: 30 }}>
        <div style={{ fontSize: 11, color: 'var(--cyan)', marginBottom: 6 }}>Running 6-layer pipeline…</div>
        <div style={{ fontSize: 10, color: 'var(--text3)' }}>Revenue growth → Margins → FCF → Moat → Catalyst → Valuation</div>
      </div>}

      {/* Results */}
      {picks.length > 0 && !loading && (
        <div>
          <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 10 }}>TOP PICKS · {weekId}</div>
          {picks.map((pick, i) => (
            <div key={pick.ticker} onClick={() => setSelected(pick.ticker)} style={{ ...stockRow, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, background: '#00e5ff12', border: '1px solid #00e5ff28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--cyan)', fontFamily: 'var(--display)', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{pick.ticker}</span>
                  <span style={{ fontSize: 9, color: 'var(--text3)' }}>{pick.name}</span>
                  <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 3, background: '#00e5ff15', color: 'var(--cyan)', border: '1px solid #00e5ff25' }}>{pick.sector}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{pick.thesis?.slice(0, 65)}…</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
                <div style={{ fontSize: 16, color: scoreColor(pick.total_score), fontFamily: 'var(--display)' }}>{pick.total_score}/10</div>
                <div style={{ fontSize: 9, color: 'var(--text3)' }}>{pick.market_cap}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 10 }}>WATCHLIST</div>
          {watchlist.map(w => (
            <div key={w.ticker} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{w.ticker}</div>
                <div style={{ fontSize: 9, color: 'var(--text3)' }}>{w.sector} · Added {new Date(w.addedAt).toLocaleDateString()}</div>
              </div>
              <div style={{ fontSize: 14, color: scoreColor(w.total_score), fontFamily: 'var(--display)' }}>{w.total_score}/10</div>
              <button onClick={() => addToWatchlist(w)} style={{ fontSize: 10, color: 'var(--red)', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const card     = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12 };
const stockRow = { display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer' };
const backBtn  = { background: 'transparent', border: 'none', color: 'var(--text3)', fontSize: 10, letterSpacing: '0.1em', marginBottom: 16, padding: 0, cursor: 'pointer', display: 'block', fontFamily: 'var(--mono)' };
