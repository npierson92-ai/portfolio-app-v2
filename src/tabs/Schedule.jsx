import { useState, useEffect } from 'react';
import { STOCKS, WEEKS, fmt } from '../data/stocks.js';

const STORAGE_KEY = 'portfolio_v2_schedule';

export default function Schedule({ weekly }) {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  });

  const weekOfMonth = Math.ceil(new Date().getDate() / 7);
  const currentWeek = ((weekOfMonth - 1) % 4) + 1;
  const [viewWeek, setViewWeek] = useState(currentWeek - 1);

  const toggle = (key) => {
    const updated = { ...checked, [key]: !checked[key] };
    setChecked(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Reset checkboxes on new week
  useEffect(() => {
    const lastReset = localStorage.getItem('schedule_last_reset');
    const thisWeek  = `${new Date().getFullYear()}-W${currentWeek}`;
    if (lastReset !== thisWeek) {
      setChecked({});
      localStorage.setItem(STORAGE_KEY, '{}');
      localStorage.setItem('schedule_last_reset', thisWeek);
    }
  }, [currentWeek]);

  const wk       = WEEKS[viewWeek];
  const isActive = viewWeek === currentWeek - 1;

  return (
    <div style={{ padding: '16px 16px calc(100px + var(--safe-bottom))', overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.2em', marginBottom: 2 }}>DCA ROTATION · $1,000/WEEK</div>
        <div style={{ fontSize: 44, fontFamily: 'var(--display)', color: '#fff', lineHeight: 1 }}>SCHEDULE</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>2 stocks/day · Mon–Fri · full ${weekly.toLocaleString()} deployed</div>
      </div>

      {/* Week selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {WEEKS.map((w, i) => (
          <button key={i} onClick={() => setViewWeek(i)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 6, fontSize: 10,
            fontFamily: 'var(--mono)', letterSpacing: '0.08em', cursor: 'pointer',
            border: `1px solid ${viewWeek === i ? 'var(--cyan)' : 'var(--border)'}`,
            background: viewWeek === i ? '#00e5ff15' : 'var(--bg2)',
            color: viewWeek === i ? 'var(--cyan)' : 'var(--text3)',
          }}>
            W{i + 1}
            {i === currentWeek - 1 && <span style={{ display: 'block', fontSize: 7, color: 'var(--green)', marginTop: 2 }}>NOW</span>}
          </button>
        ))}
      </div>

      {/* Week header */}
      <div style={{ ...card, borderColor: isActive ? '#00e5ff22' : 'var(--border)', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 9, color: isActive ? 'var(--cyan)' : 'var(--text3)', letterSpacing: '0.12em', marginBottom: 2 }}>
              WEEK {viewWeek + 1} {isActive ? '· CURRENT' : ''}
            </div>
            <div style={{ fontSize: 22, fontFamily: 'var(--display)', color: '#fff', letterSpacing: '0.04em' }}>{wk.theme}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{wk.note}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, color: 'var(--cyan)', fontFamily: 'var(--display)' }}>${weekly.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: 'var(--green)' }}>fully deployed</div>
          </div>
        </div>
      </div>

      {/* Day cards */}
      {wk.days.map((d, di) => {
        const dayStocks = d.stocks.map(tk => STOCKS.find(s => s.ticker === tk || (tk === 'VOO' && s.ticker === 'VOO/SPY'))).filter(Boolean);
        const checkKey  = `W${viewWeek}-${d.day}`;
        const isDone    = checked[checkKey];

        return (
          <div key={di} style={{ ...card, borderColor: isDone ? '#69ff4722' : 'var(--border)', marginBottom: 8, opacity: isDone ? 0.7 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 2 }}>{d.day}</div>
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>{d.note}</div>
              </div>
              <button
                onClick={() => toggle(checkKey)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', border: `1px solid ${isDone ? 'var(--green)' : 'var(--border2)'}`,
                  background: isDone ? '#69ff4722' : 'transparent', color: isDone ? 'var(--green)' : 'var(--text3)',
                  fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                {isDone ? '✓' : '○'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {dayStocks.map(s => {
                const amt = Math.round(weekly * s.pct / 100);
                return (
                  <div key={s.ticker} style={{ flex: 1, background: `${s.color}0e`, border: `1px solid ${s.color}25`, borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: s.color, fontWeight: 500, marginBottom: 2 }}>{s.ticker}</div>
                    <div style={{ fontSize: 18, color: '#dce8f5', fontFamily: 'var(--display)' }}>${amt}</div>
                    <div style={{ fontSize: 8, color: 'var(--text3)', marginTop: 2 }}>{s.pct}% of portfolio</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Weekly total check */}
      <div style={{ ...card, borderColor: '#00e5ff15' }}>
        <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 8 }}>WEEKLY SUMMARY</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Total this week',   value: `$${weekly.toLocaleString()}` },
            { label: 'Days completed',    value: `${Object.keys(checked).filter(k => k.startsWith(`W${viewWeek}`)).length}/5` },
            { label: 'Annual contribution', value: fmt(weekly * 52) },
            { label: 'Monthly total',     value: fmt(weekly * 4) },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--bg3)', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontSize: 8, color: 'var(--text3)', marginBottom: 2 }}>{item.label.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--display)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const card = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 12 };
