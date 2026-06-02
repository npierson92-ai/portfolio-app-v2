import { supabase } from '../lib/supabase.js';
import { useState } from 'react';
import { STOCKS, RISK_LABEL, RISK_COLOR, TRIM_RULES, fmt } from '../data/stocks.js';

// Trim log now stored in Supabase

export default function Rebalance({ positionsWithStats, totalValue, addLot, recordTrim, sendNotification }) {
  const [trimLog, setTrimLog] = useState([]);
  useEffect(() => { loadTrimLogDB(); }, []);

  const loadTrimLogDB = async () => {
    const { data } = await supabase.from('trim_log').select('*').order('date', { ascending: false });
    if (data) setTrimLog(data);
  };
  const [logModal,  setLogModal]  = useState(null);
  const [logForm,   setLogForm]   = useState({ shares: '', price: '', notes: '' });
  const [tab,       setTab]       = useState('drift');

  const totalInvested = positionsWithStats.reduce((a, s) => a + s.cost, 0);
  const totalGain     = totalValue - totalInvested;

  const alerts = positionsWithStats.filter(s => s.alert);

  const saveTrim = () => {
    if (!logModal || !logForm.shares || !logForm.price) return;
    const shares    = +logForm.shares;
    const price     = +logForm.price;
    const gainValue = (price - logModal.position.avgCost) * shares;
    const entry = {
      id:        Date.now(),
      ticker:    logModal.ticker,
      shares,
      price,
      gainValue: Math.round(gainValue),
      gainPct:   ((price - logModal.position.avgCost) / logModal.position.avgCost * 100).toFixed(1),
      date:      new Date().toISOString(),
      notes:     logForm.notes,
      taxRate:   logModal.alert?.taxRate || 'unknown',
    };
    const updated = [entry, ...trimLog];
    setTrimLog(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    recordTrim(logModal.ticker, shares);
    setLogModal(null);
    setLogForm({ shares: '', price: '', notes: '' });
  };

  const totalRealized = trimLog.reduce((a, t) => a + t.gainValue, 0);

  return (
    <div style={{ padding: '16px 16px calc(100px + var(--safe-bottom))', overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.2em', marginBottom: 2 }}>TRIM RULES · DRIFT · GAINS</div>
        <div style={{ fontSize: 44, fontFamily: 'var(--display)', color: '#fff', lineHeight: 1 }}>REBALANCE</div>
      </div>

      {/* Trim alerts */}
      {alerts.length > 0 && (
        <div style={{ background: '#1a0a00', border: '1px solid #ff910044', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: 10 }}>
            ⚡ {alerts.length} ACTIVE TRIM ALERT{alerts.length > 1 ? 'S' : ''}
          </div>
          {alerts.map(s => (
            <div key={s.ticker} style={{ padding: '12px', background: '#0a0500', borderRadius: 8, marginBottom: 8, borderLeft: `2px solid ${s.alert.urgent ? 'var(--red)' : 'var(--gold)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, color: s.alert.urgent ? 'var(--red)' : 'var(--gold)', fontWeight: 500, marginBottom: 3 }}>{s.ticker}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.alert.message}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, color: 'var(--gold)', fontFamily: 'var(--display)' }}>{fmt(s.alert.trimValue)}</div>
                  <div style={{ fontSize: 9, color: s.alert.taxRate === 'long-term' ? 'var(--green)' : 'var(--gold)' }}>{s.alert.taxRate} gains</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text3)', marginBottom: 10 }}>
                <span>Trim {s.alert.trimShares} shares</span>
                <span>·</span>
                <span>+{(s.alert.gain * 100).toFixed(0)}% gain</span>
                {s.alert.monthsHeld && <span>· {s.alert.monthsHeld}mo held</span>}
              </div>
              <button onClick={() => { setLogModal(s); setLogForm({ shares: s.alert.trimShares.toString(), price: s.position.currentPrice.toFixed(2), notes: '' }); }}
                style={{ width: '100%', padding: '8px', background: '#ff910015', border: '1px solid #ff910033', borderRadius: 6, color: 'var(--gold)', fontSize: 10, letterSpacing: '0.08em', fontFamily: 'var(--mono)', cursor: 'pointer' }}>
                LOG THIS TRIM
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[['drift','DRIFT'],['rules','TRIM RULES'],['log','GAIN LOG']].map(([k,l]) => (
          <button key={k} style={{ ...tabBtn, ...(tab===k ? tabBtnOn : {}) }} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* DRIFT */}
      {tab === 'drift' && (
        <div>
          <div style={{ ...card, marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 14 }}>POSITION DRIFT FROM TARGET</div>
            {positionsWithStats.map(s => {
              const drift    = s.portfolioPct - s.pct;
              const hasAlert = !!s.alert;
              return (
                <div key={s.ticker} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.ticker}</span>
                      {hasAlert && <span style={{ fontSize: 8, color: 'var(--gold)' }}>⚡</span>}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text3)' }}>
                      <span style={{ color: Math.abs(drift) > 3 ? 'var(--gold)' : 'var(--text3)' }}>
                        {s.portfolioPct > 0 ? `${s.portfolioPct.toFixed(1)}%` : '—'}
                      </span>
                      {' '}vs {s.pct}% target
                      {drift !== 0 && s.portfolioPct > 0 && (
                        <span style={{ color: drift > 0 ? 'var(--gold)' : 'var(--cyan)', marginLeft: 4 }}>
                          ({drift > 0 ? '+' : ''}{drift.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, position: 'relative' }}>
                    <div style={{ position: 'absolute', height: '100%', width: `${Math.min(100, s.pct * 1.5)}%`, background: 'var(--bg3)', borderRadius: 2 }} />
                    {s.portfolioPct > 0 && (
                      <div style={{ position: 'absolute', height: '100%', width: `${Math.min(100, s.portfolioPct * 1.5)}%`, background: Math.abs(drift) > 3 ? 'var(--gold)' : s.color, borderRadius: 2, opacity: 0.7, transition: 'width 0.3s' }} />
                    )}
                    <div style={{ position: 'absolute', left: `${Math.min(99, s.pct * 1.5)}%`, top: -2, height: 8, width: 2, background: 'var(--text3)', borderRadius: 1 }} />
                  </div>
                  {s.position.shares > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 8, color: 'var(--text4)' }}>
                      <span>{fmt(s.value)}</span>
                      <span style={{ color: s.gainPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {s.gainPct >= 0 ? '+' : ''}{s.gainPct.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Portfolio totals */}
          <div style={{ ...card, borderColor: '#00e5ff15' }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 10 }}>PORTFOLIO TOTALS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Total Value',    value: fmt(totalValue),      color: 'var(--cyan)' },
                { label: 'Total Invested', value: fmt(totalInvested),   color: 'var(--text)' },
                { label: 'Unrealized P&L', value: `${totalGain >= 0 ? '+' : ''}${fmt(totalGain)}`, color: totalGain >= 0 ? 'var(--green)' : 'var(--red)' },
                { label: 'Realized Gains', value: `+${fmt(totalRealized)}`, color: 'var(--gold)' },
              ].map(m => (
                <div key={m.label} style={{ background: 'var(--bg3)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ fontSize: 8, color: 'var(--text3)', marginBottom: 2 }}>{m.label.toUpperCase()}</div>
                  <div style={{ fontSize: 14, color: m.color, fontFamily: 'var(--display)' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRIM RULES */}
      {tab === 'rules' && (
        <div>
          {TRIM_RULES.map((rule, i) => (
            <div key={i} style={{ ...card, borderColor: '#00e5ff15', marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--cyan)', fontFamily: 'var(--display)', letterSpacing: '0.05em', marginBottom: 6 }}>{rule.label}</div>
              {rule.weightTrigger ? (
                <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.7 }}>
                  If any position reaches <span style={{ color: 'var(--gold)' }}>2x its target weight</span>, trim back to target weight regardless of gain or holding period. Concentration risk outweighs tax cost.
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 8 }}>
                    Trim <span style={{ color: 'var(--gold)' }}>25%</span> of position when gain exceeds <span style={{ color: 'var(--green)' }}>{(rule.gainThreshold * 100).toFixed(0)}%</span>.
                    Gains taxed at <span style={{ color: rule.maxMonths <= 6 ? 'var(--gold)' : rule.maxMonths <= 12 ? 'var(--gold)' : 'var(--green)' }}>
                      {rule.maxMonths <= 12 ? 'short-term (ordinary income rate)' : 'long-term (15-20% rate)'}
                    </span>.
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 6 }}>
                    Higher threshold for shorter holds because the short-term tax rate eats more of the gain. Wait for a bigger move to justify the tax cost.
                  </div>
                </div>
              )}
            </div>
          ))}
          <div style={{ ...card, borderColor: '#ff444420' }}>
            <div style={{ fontSize: 9, color: 'var(--red)', letterSpacing: '0.12em', marginBottom: 8 }}>NEVER TRIM</div>
            {['Never trim at a loss — let it recover, thesis intact', 'Never trim below target weight', 'Never auto-sell on thesis break — that\'s a manual decision'].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--red)', flexShrink: 0 }}>✕</span><span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GAIN LOG */}
      {tab === 'log' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em' }}>REALIZED GAINS LOG</div>
            <div style={{ fontSize: 14, color: 'var(--green)', fontFamily: 'var(--display)' }}>+{fmt(totalRealized)}</div>
          </div>

          {trimLog.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 16, fontFamily: 'var(--display)', color: 'var(--text4)', marginBottom: 6 }}>NO TRIMS YET</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>When you trim a position, log it here to track realized gains</div>
            </div>
          ) : (
            trimLog.map(t => (
              <div key={t.id} style={{ ...card, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{t.ticker}</div>
                    <div style={{ fontSize: 9, color: 'var(--text3)' }}>{new Date(t.date).toLocaleDateString()} · {t.taxRate} gains</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, color: 'var(--green)', fontFamily: 'var(--display)' }}>+{fmt(t.gainValue)}</div>
                    <div style={{ fontSize: 9, color: 'var(--text3)' }}>+{t.gainPct}%</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                  {t.shares} shares @ ${t.price} · {t.notes || 'No notes'}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Log trim modal */}
      {logModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg2)', borderRadius: '16px 16px 0 0', padding: '24px 20px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 4 }}>LOG TRIM</div>
            <div style={{ fontSize: 28, fontFamily: 'var(--display)', color: '#fff', marginBottom: 16 }}>{logModal.ticker}</div>

            {[
              { label: 'SHARES TRIMMED', key: 'shares', type: 'number', placeholder: '0' },
              { label: 'SELL PRICE ($)', key: 'price',  type: 'number', placeholder: '0.00' },
              { label: 'NOTES',          key: 'notes',  type: 'text',   placeholder: 'Why you trimmed…' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 8, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 5 }}>{f.label}</div>
                <input type={f.type} value={logForm[f.key]} onChange={e => setLogForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
              </div>
            ))}

            {logForm.shares && logForm.price && logModal.position.avgCost && (
              <div style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 6, marginBottom: 14, fontSize: 10, color: 'var(--green)' }}>
                Estimated gain: +{fmt((+logForm.price - logModal.position.avgCost) * +logForm.shares)}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setLogModal(null)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }}>CANCEL</button>
              <button onClick={saveTrim} style={{ flex: 2, padding: 12, background: 'var(--green)', border: 'none', borderRadius: 8, color: 'var(--bg)', fontSize: 11, letterSpacing: '0.1em', fontFamily: 'var(--mono)', fontWeight: 500 }}>SAVE TRIM</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const card    = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12 };
const tabBtn  = { padding: '7px 14px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', fontSize: 10, letterSpacing: '0.1em', fontFamily: 'var(--mono)', cursor: 'pointer' };
const tabBtnOn= { background: 'var(--bg3)', color: 'var(--text)', borderColor: '#00e5ff33' };
