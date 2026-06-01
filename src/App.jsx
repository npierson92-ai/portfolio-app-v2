import { useState, useCallback } from 'react';
import Dashboard  from './tabs/Dashboard.jsx';
import Schedule   from './tabs/Schedule.jsx';
import Stocks     from './tabs/Stocks.jsx';
import Screener   from './tabs/Screener.jsx';
import Rebalance  from './tabs/Rebalance.jsx';
import Journal    from './tabs/Journal.jsx';
import { usePortfolio }      from './hooks/usePortfolio.js';
import { usePrices }         from './hooks/usePrices.js';
import { useNotifications }  from './hooks/useNotifications.js';
import { STOCKS, fmt }       from './data/stocks.js';

const TABS = [
  { id: 'dashboard', label: 'Home',     icon: '📈' },
  { id: 'schedule',  label: 'Schedule', icon: '📅' },
  { id: 'stocks',    label: 'Stocks',   icon: '📊' },
  { id: 'screener',  label: 'Screener', icon: '🔍' },
  { id: 'rebalance', label: 'Rebalance',icon: '⚖️' },
  { id: 'journal',   label: 'Journal',  icon: '📓' },
];

export default function App() {
  const [tab,       setTab]      = useState('dashboard');
  const [weekly,    setWeekly]   = useState(1000);
  const [addModal,  setAddModal] = useState(null);
  const [addForm,   setAddForm]  = useState({ shares: '', cost: '', date: new Date().toISOString().slice(0, 10) });

  const { positions, positionsWithStats, totalValue, trimAlerts, updatePrice, addLot, recordTrim } = usePortfolio();
  const { loading: pricesLoading, lastFetch, fetchPrices } = usePrices(updatePrice);
  const { permission, requestPermission, sendLocalNotification } = useNotifications();

  // Send notifications for trim alerts
  const alertCount = trimAlerts.length;

  const handleAddLot = () => {
    if (!addModal) return;
    const sh = parseFloat(addForm.shares) || 0;
    const co = parseFloat(addForm.cost) || 0;
    const dt = addForm.date || new Date().toISOString().slice(0,10);
    if (!sh || !co) { alert('Enter shares and cost per share'); return; }
    addLot(addModal.ticker, sh, co, new Date(dt).toISOString());
    setAddModal(null);
    setAddForm({ shares: '', cost: '', date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: 'calc(var(--safe-top) + 10px) 16px 10px', background: 'var(--bg)', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 8, color: 'var(--text3)', letterSpacing: '0.2em', marginBottom: 1 }}>5-YEAR · $250K TARGET</div>
            <div style={{ fontSize: 24, fontFamily: 'var(--display)', color: '#fff', letterSpacing: '0.04em', lineHeight: 1 }}>PORTFOLIO</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {alertCount > 0 && (
              <div onClick={() => setTab('rebalance')} style={{ background: '#ff910020', border: '1px solid #ff910044', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>
                <span style={{ fontSize: 9, color: 'var(--gold)' }}>⚡ {alertCount} TRIM{alertCount > 1 ? 'S' : ''}</span>
              </div>
            )}
            <button onClick={fetchPrices} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6, padding: '4px 8px', color: 'var(--text3)', fontSize: 9, letterSpacing: '0.08em' }}>
              {pricesLoading ? '…' : '↻ PRICES'}
            </button>
            <button onClick={() => setAddModal({ ticker: 'NVDA' })} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6, padding: '4px 8px', color: 'var(--cyan)', fontSize: 9, letterSpacing: '0.08em' }}>
              + LOT
            </button>
          </div>
        </div>

        {/* Portfolio value strip */}
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 7, color: 'var(--text3)', marginBottom: 1 }}>PORTFOLIO</div>
            <div style={{ fontSize: 16, color: 'var(--cyan)', fontFamily: 'var(--display)' }}>{totalValue > 0 ? fmt(totalValue) : '$—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 7, color: 'var(--text3)', marginBottom: 1 }}>WEEKLY DCA</div>
            <div style={{ fontSize: 16, color: 'var(--text)', fontFamily: 'var(--display)' }}>${weekly.toLocaleString()}</div>
          </div>
          {lastFetch && (
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: 7, color: 'var(--text3)', marginBottom: 1 }}>PRICES</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{new Date(lastFetch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          )}
        </div>

        {/* Notification prompt if not enabled */}
        {permission === 'default' && (
          <div onClick={requestPermission} style={{ marginTop: 8, padding: '6px 10px', background: '#00e5ff10', border: '1px solid #00e5ff25', borderRadius: 6, cursor: 'pointer' }}>
            <span style={{ fontSize: 9, color: 'var(--cyan)' }}>🔔 Enable push notifications for trim alerts →</span>
          </div>
        )}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'dashboard'  && <Dashboard  weekly={weekly} setWeekly={setWeekly} totalValue={totalValue} trimAlerts={trimAlerts} positions={positions} />}
        {tab === 'schedule'   && <Schedule   weekly={weekly} />}
        {tab === 'stocks'     && <Stocks     positionsWithStats={positionsWithStats} weekly={weekly} />}
        {tab === 'screener'   && <Screener />}
        {tab === 'rebalance'  && <Rebalance  positionsWithStats={positionsWithStats} totalValue={totalValue} addLot={addLot} recordTrim={recordTrim} sendNotification={sendLocalNotification} />}
        {tab === 'journal'    && <Journal />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(6,13,26,0.96)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)', paddingBottom: 'var(--safe-bottom)', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0 4px' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 8, opacity: tab === t.id ? 1 : 0.4, transition: 'opacity .15s', position: 'relative' }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 7, color: tab === t.id ? 'var(--cyan)' : 'var(--text3)', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}>{t.label.toUpperCase()}</span>
              {t.id === 'rebalance' && alertCount > 0 && (
                <div style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add lot modal */}
      {addModal && (
  <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 200 }} onClick={() => setAddModal(null)}>
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--bg2)', borderRadius: '16px 16px 0 0', padding: '20px 20px 0' }} onClick={e => e.stopPropagation()}>
      <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 4 }}>LOG PURCHASE</div>
      <div style={{ fontSize: 28, fontFamily: 'var(--display)', color: '#fff', marginBottom: 12 }}>ADD LOT</div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 8, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 6 }}>STOCK</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {STOCKS.map(s => (
            <button key={s.ticker} onClick={() => setAddModal({ ticker: s.ticker })}
              style={{ fontSize: 9, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--mono)',
                border: `1px solid ${addModal.ticker === s.ticker ? s.color : 'var(--border)'}`,
                background: addModal.ticker === s.ticker ? `${s.color}15` : 'transparent',
                color: addModal.ticker === s.ticker ? s.color : 'var(--text3)',
                touchAction: 'manipulation',
              }}>
              {s.ticker}
            </button>
          ))}
        </div>
      </div>
      {[
        { label: 'SHARES', key: 'shares', type: 'number', placeholder: '10.5' },
        { label: 'COST/SHARE', key: 'cost', type: 'number', placeholder: '450.00' },
        { label: 'PURCHASE DATE', key: 'date', type: 'date', placeholder: '' },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 4 }}>{f.label}</div>
          <input type={f.type} value={addForm[f.key]} onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
        </div>
      ))}
      {addForm.shares && addForm.cost && (
        <div style={{ padding: '6px 10px', background: 'var(--bg3)', borderRadius: 6, marginBottom: 10, fontSize: 10, color: 'var(--cyan)' }}>
          Total: {fmt(+addForm.shares * +addForm.cost)}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)', paddingTop: 8 }}>
        <button onClick={() => setAddModal(null)} style={{ flex: 1, padding: 14, background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text3)', fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer', touchAction: 'manipulation' }}>CANCEL</button>
        <button onClick={handleAddLot} style={{ flex: 2, padding: 14, background: 'var(--cyan)', border: 'none', borderRadius: 8, color: 'var(--bg)', fontSize: 12, letterSpacing: '0.1em', fontFamily: 'var(--mono)', fontWeight: 500, cursor: 'pointer', touchAction: 'manipulation' }}>ADD LOT</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
