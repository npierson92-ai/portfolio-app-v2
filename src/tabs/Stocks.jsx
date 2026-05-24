import { useState } from 'react';
import { STOCKS, RISK_LABEL, RISK_COLOR, fmt } from '../data/stocks.js';

const PROXY = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';

async function fetchNews(ticker, name) {
  const res = await fetch(`${PROXY}/api/news`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker, name }),
  });
  const data  = await res.json();
  if (data.error) throw new Error(data.error);
  const clean = data.text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

const SENT_COLOR = { bullish: '#69ff47', neutral: '#ffcc00', bearish: '#ff4444' };
const IMP_COLOR  = { positive: '#69ff47', neutral: '#ffcc00', negative: '#ff4444' };
const VIEWS      = ['positions', 'thesis', 'news'];

export default function Stocks({ positionsWithStats, weekly }) {
  const [view,     setView]     = useState('positions');
  const [selected, setSelected] = useState(null);
  const [newsData, setNewsData] = useState({});
  const [loading,  setLoading]  = useState(null);
  const [newsError,setNewsError]= useState(null);

  const stock = selected ? STOCKS.find(s => s.ticker === selected) : null;
  const pos   = selected ? positionsWithStats.find(s => s.ticker === selected) : null;

  const loadNews = async (s) => {
    setNewsError(null);
    if (newsData[s.ticker]) return;
    setLoading(s.ticker);
    try {
      const result = await fetchNews(s.ticker, s.name);
      setNewsData(prev => ({ ...prev, [s.ticker]: result }));
    } catch (e) {
      setNewsError(e.message);
    } finally {
      setLoading(null);
    }
  };

  // Detail view
  if (selected && stock) {
    const news = newsData[stock.ticker];
    return (
      <div style={{ padding: '16px 16px calc(100px + var(--safe-bottom))', overflowY: 'auto', height: '100%' }}>
        <button onClick={() => setSelected(null)} style={backBtn}>← ALL STOCKS</button>

        {/* Stock header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: stock.color, letterSpacing: '0.15em', marginBottom: 2 }}>{stock.name} · {stock.sector}</div>
          <div style={{ fontSize: 44, fontFamily: 'var(--display)', color: '#fff', lineHeight: 1 }}>{stock.ticker}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: RISK_COLOR[stock.risk] }}>{RISK_LABEL[stock.risk]} risk</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{stock.pct}% portfolio</span>
            <span style={{ fontSize: 10, color: 'var(--gold)' }}>{(stock.annualReturn * 100).toFixed(0)}% est. annual</span>
          </div>
        </div>

        {/* Position stats if held */}
        {pos && pos.position.shares > 0 && (
          <div style={{ ...card, borderColor: `${stock.color}25`, marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 10 }}>YOUR POSITION</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { label: 'SHARES',    value: pos.position.shares.toFixed(2), color: 'var(--text)' },
                { label: 'AVG COST',  value: `$${pos.position.avgCost.toFixed(2)}`, color: 'var(--text)' },
                { label: 'CUR PRICE', value: pos.position.currentPrice > 0 ? `$${pos.position.currentPrice.toFixed(2)}` : '—', color: 'var(--cyan)' },
                { label: 'VALUE',     value: fmt(pos.value), color: 'var(--cyan)' },
                { label: 'GAIN/LOSS', value: `${pos.gain >= 0 ? '+' : ''}${fmt(pos.gain)}`, color: pos.gain >= 0 ? 'var(--green)' : 'var(--red)' },
                { label: 'RETURN',    value: `${pos.gainPct >= 0 ? '+' : ''}${pos.gainPct.toFixed(1)}%`, color: pos.gainPct >= 0 ? 'var(--green)' : 'var(--red)' },
              ].map(m => (
                <div key={m.label} style={{ background: 'var(--bg3)', borderRadius: 6, padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 7, color: 'var(--text3)', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 13, color: m.color, fontFamily: 'var(--display)' }}>{m.value}</div>
                </div>
              ))}
            </div>
            {pos.alert && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#1a0a00', borderRadius: 6, borderLeft: '2px solid var(--gold)' }}>
                <div style={{ fontSize: 11, color: 'var(--gold)' }}>⚡ {pos.alert.message}</div>
              </div>
            )}
          </div>
        )}

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['thesis','THESIS'],['news','LIVE NEWS']].map(([k,l]) => (
            <button key={k} style={{ ...tabBtn, ...(view === k ? tabBtnOn : {}) }} onClick={() => { setView(k); if (k === 'news') loadNews(stock); }}>{l}</button>
          ))}
        </div>

        {/* Thesis */}
        {view === 'thesis' && (
          <div style={card}>
            <div style={{ fontSize: 9, color: stock.color, letterSpacing: '0.15em', marginBottom: 14 }}>INVESTMENT THESIS</div>
            {stock.thesis.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 14 }}>{para}</p>
            ))}
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--bg3)' }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 6 }}>SIZING RATIONALE</div>
              <p style={{ fontSize: 11, color: '#667788', lineHeight: 1.7 }}>{stock.rationale}</p>
            </div>
          </div>
        )}

        {/* News */}
        {view === 'news' && (
          <div>
            {loading === stock.ticker && (
              <div style={{ ...card, textAlign: 'center', padding: 30 }}>
                <div style={{ fontSize: 11, color: 'var(--cyan)', marginBottom: 6 }}>Searching the web…</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>Fetching latest {stock.ticker} news</div>
              </div>
            )}
            {newsError && (
              <div style={{ ...card, borderColor: '#ff444433' }}>
                <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 4 }}>Error loading news</div>
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>{newsError}</div>
              </div>
            )}
            {news && !loading && (
              <>
                <div style={{ ...card, borderColor: `${SENT_COLOR[news.sentiment]}33` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em' }}>CURRENT HEALTH</div>
                    <div style={{ fontSize: 10, color: SENT_COLOR[news.sentiment], padding: '2px 8px', borderRadius: 4, background: `${SENT_COLOR[news.sentiment]}18`, border: `1px solid ${SENT_COLOR[news.sentiment]}33` }}>
                      {news.sentiment?.toUpperCase()}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>{news.summary}</p>
                </div>
                {(news.items || []).map((item, i) => (
                  <div key={i} style={{ ...card, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, flex: 1, lineHeight: 1.4 }}>{item.headline}</div>
                      <div style={{ fontSize: 8, color: IMP_COLOR[item.impact], padding: '2px 6px', borderRadius: 3, background: `${IMP_COLOR[item.impact]}15`, border: `1px solid ${IMP_COLOR[item.impact]}25`, flexShrink: 0 }}>
                        {item.impact?.toUpperCase()}
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 6 }}>{item.detail}</p>
                    <div style={{ fontSize: 9, color: 'var(--text4)' }}>
                      {item.source}
                      {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)', marginLeft: 8, textDecoration: 'none' }}>↗ Read</a>}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={card}>
                    <div style={{ fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em', marginBottom: 8 }}>CATALYSTS</div>
                    {(news.catalysts || []).map((c, i) => (
                      <div key={i} style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.5, paddingLeft: 8, borderLeft: '2px solid #69ff4733' }}>{c}</div>
                    ))}
                  </div>
                  <div style={card}>
                    <div style={{ fontSize: 9, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 8 }}>RISKS</div>
                    {(news.risks || []).map((r, i) => (
                      <div key={i} style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.5, paddingLeft: 8, borderLeft: '2px solid #ff444433' }}>{r}</div>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setNewsData(prev => { const n={...prev}; delete n[stock.ticker]; return n; }); loadNews(stock); }} style={refreshBtn}>↻ REFRESH</button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div style={{ padding: '16px 16px calc(100px + var(--safe-bottom))', overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.2em', marginBottom: 2 }}>10 POSITIONS · LIVE PRICES</div>
        <div style={{ fontSize: 44, fontFamily: 'var(--display)', color: '#fff', lineHeight: 1 }}>STOCKS</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>Tap any stock for thesis + live news</div>
      </div>

      {positionsWithStats.map(s => {
        const hasPos   = s.position.shares > 0;
        const hasAlert = !!s.alert;
        const amt      = Math.round(weekly * s.pct / 100);
        return (
          <div key={s.ticker} onClick={() => { setSelected(s.ticker); setView('thesis'); }} style={{ ...stockRow, borderColor: hasAlert ? '#ff910033' : 'var(--border)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: `${s.color}12`, border: `1px solid ${s.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: s.color, flexShrink: 0 }}>
              {s.ticker.slice(0, 4)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{s.ticker}</span>
                <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>{s.sector}</span>
                {hasAlert && <span style={{ fontSize: 8, color: 'var(--gold)' }}>⚡ TRIM</span>}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{s.why.slice(0, 55)}…</div>
              {hasPos && (
                <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 9 }}>
                  <span style={{ color: 'var(--text3)' }}>{s.position.shares.toFixed(2)} shares</span>
                  <span style={{ color: s.gainPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {s.gainPct >= 0 ? '+' : ''}{s.gainPct.toFixed(1)}%
                  </span>
                  <span style={{ color: 'var(--cyan)' }}>{fmt(s.value)}</span>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
              {s.position.currentPrice > 0
                ? <div style={{ fontSize: 14, color: s.color, fontFamily: 'var(--display)' }}>${s.position.currentPrice.toFixed(2)}</div>
                : <div style={{ fontSize: 12, color: 'var(--text3)' }}>${amt}/wk</div>
              }
              <div style={{ fontSize: 9, color: 'var(--text3)' }}>{s.pct}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const card      = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12 };
const stockRow  = { display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: 8, cursor: 'pointer' };
const backBtn   = { background: 'transparent', border: 'none', color: 'var(--text3)', fontSize: 10, letterSpacing: '0.1em', marginBottom: 16, padding: 0, cursor: 'pointer', display: 'block' };
const tabBtn    = { padding: '7px 14px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', fontSize: 10, letterSpacing: '0.1em' };
const tabBtnOn  = { background: 'var(--bg3)', color: 'var(--text)', borderColor: '#00e5ff33' };
const refreshBtn= { width: '100%', padding: 10, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text3)', fontSize: 10, letterSpacing: '0.1em', fontFamily: 'var(--mono)' };
