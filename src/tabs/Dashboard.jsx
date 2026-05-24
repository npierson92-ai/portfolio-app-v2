import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { STOCKS, BLENDED, TARGET, START, fmt, project } from '../data/stocks.js';

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#07111e', border: '1px solid #1a2d40', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>
      <div style={{ color: '#556677', marginBottom: 4 }}>Year {label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.stroke }}>{p.name}: <b>{fmt(p.value)}</b></div>)}
    </div>
  );
};

export default function Dashboard({ weekly, setWeekly, totalValue, trimAlerts, positions }) {
  const [years,     setYears]     = useState(5);
  const [showSlider,setShowSlider]= useState(false);

  const portfolio = useMemo(() => project(weekly, START, years, BLENDED),  [weekly, years]);
  const sp500     = useMemo(() => project(weekly, START, years, 0.10),     [weekly, years]);
  const totalInvested = START + weekly * years * 52;
  const final     = portfolio[portfolio.length - 1];
  const vsSP      = final.value - sp500[years].value;

  const chartData = portfolio.map((r, i) => ({
    year:       `Y${i}`,
    'Portfolio': r.value,
    'S&P Only':  sp500[i].value,
    'Invested':  r.invested,
  }));

  // Contribution stats
  const weekOfMonth = Math.ceil(new Date().getDate() / 7);
  const currentWeek = ((weekOfMonth - 1) % 4) + 1;

  // Portfolio gain
  const totalCost  = Object.values(positions).reduce((a, p) => a + (p.shares * p.avgCost), 0);
  const totalGain  = totalValue - totalCost;
  const gainPct    = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <div style={{ padding: '16px 16px calc(100px + var(--safe-bottom))', overflowY: 'auto', height: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.2em', marginBottom: 2 }}>5-YEAR PLAN · $250K TARGET</div>
        <div style={{ fontSize: 44, fontFamily: 'var(--display)', color: '#fff', lineHeight: 1 }}>DASHBOARD</div>
      </div>

      {/* Trim alerts — front and center */}
      {trimAlerts.length > 0 && (
        <div style={{ background: '#1a0a00', border: '1px solid #ff910044', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: 10 }}>
            ⚡ {trimAlerts.length} TRIM ALERT{trimAlerts.length > 1 ? 'S' : ''}
          </div>
          {trimAlerts.map((alert, i) => (
            <div key={i} style={{ padding: '10px 12px', background: '#0a0500', borderRadius: 7, marginBottom: 6, borderLeft: `2px solid ${alert.urgent ? 'var(--red)' : 'var(--gold)'}` }}>
              <div style={{ fontSize: 12, color: alert.urgent ? 'var(--red)' : 'var(--gold)', marginBottom: 3, fontWeight: 500 }}>{alert.message}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text3)' }}>
                <span>Trim {alert.trimShares} shares</span>
                <span>≈ {fmt(alert.trimValue)}</span>
                {alert.taxRate && <span style={{ color: alert.taxRate === 'long-term' ? 'var(--green)' : 'var(--gold)' }}>{alert.taxRate} rate</span>}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 8 }}>Go to Rebalance tab to log the trim</div>
        </div>
      )}

      {/* Portfolio value */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 4 }}>PORTFOLIO VALUE</div>
            <div style={{ fontSize: 40, fontFamily: 'var(--display)', color: 'var(--cyan)', lineHeight: 1 }}>
              {totalValue > 0 ? fmt(totalValue) : '$—'}
            </div>
            {totalCost > 0 && (
              <div style={{ fontSize: 10, color: totalGain >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
                {totalGain >= 0 ? '+' : ''}{fmt(totalGain)} ({gainPct.toFixed(1)}%)
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 4 }}>THIS WEEK</div>
            <div style={{ fontSize: 18, fontFamily: 'var(--display)', color: 'var(--cyan)' }}>WEEK {currentWeek}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)' }}>${weekly.toLocaleString()} to deploy</div>
          </div>
        </div>

        {/* $250k progress */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text3)', marginBottom: 4 }}>
            <span>Progress to $250k</span>
            <span style={{ color: 'var(--text)' }}>
              {totalValue > 0 ? `${Math.min(100, (totalValue / TARGET * 100)).toFixed(1)}%` : '—'}
            </span>
          </div>
          <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${Math.min(100, totalValue > 0 ? (totalValue / TARGET * 100) : 0)}%`, background: totalValue >= TARGET ? 'var(--green)' : 'var(--cyan)', borderRadius: 2, transition: 'width 0.5s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text4)' }}>
          <span>$0</span><span style={{ color: 'var(--text3)' }}>$250,000</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'BLENDED EST',  value: `${(BLENDED*100).toFixed(1)}%/yr`, color: 'var(--cyan)' },
          { label: 'PROJECTED 5Y', value: fmt(project(weekly,START,5,BLENDED)[5].value), color: 'var(--green)' },
          { label: 'vs S&P 5Y',    value: `+${fmt(vsSP)}`, color: 'var(--gold)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 7, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 14, color: s.color, fontFamily: 'var(--display)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Projection chart */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em' }}>5-YEAR PROJECTION</div>
          <button onClick={() => setShowSlider(s => !s)} style={{ fontSize: 9, color: 'var(--text3)', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '3px 8px' }}>
            {years} YRS ▾
          </button>
        </div>
        {showSlider && (
          <div style={{ marginBottom: 12 }}>
            <input type="range" min={1} max={10} step={1} value={years} onChange={e => setYears(+e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text4)', marginTop: 3 }}>
              <span>1yr</span><span>10yr</span>
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top:4, right:4, left:0, bottom:0 }}>
            <defs>
              <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#0f1c2c"/>
            <XAxis dataKey="year" tick={{ fill:'#2a3d50', fontSize:9 }} tickLine={false}/>
            <YAxis tick={{ fill:'#2a3d50', fontSize:9 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={52}/>
            <Tooltip content={<ChartTip/>}/>
            <Area type="monotone" dataKey="Invested"  stroke="#1e3048" strokeWidth={1}   fill="none"         dot={false} strokeDasharray="3 3"/>
            <Area type="monotone" dataKey="S&P Only"  stroke="#334455" strokeWidth={1.5} fill="none"         dot={false}/>
            <Area type="monotone" dataKey="Portfolio" stroke="#00e5ff" strokeWidth={2.5} fill="url(#dGrad)"  dot={false} style={{ filter:'drop-shadow(0 0 5px #00e5ff44)' }}/>
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:9, color:'var(--text3)' }}>
          <span>S&P: {fmt(sp500[years].value)}</span>
          <span style={{ color:'var(--cyan)' }}>Portfolio: {fmt(final.value)}</span>
        </div>
      </div>

      {/* Weekly amount control */}
      <div style={card}>
        <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 10 }}>WEEKLY DCA AMOUNT</div>
        <div style={{ fontSize: 28, color: 'var(--cyan)', fontFamily: 'var(--display)', marginBottom: 10 }}>${weekly.toLocaleString()}/week</div>
        <input type="range" min={250} max={3000} step={50} value={weekly} onChange={e => setWeekly(+e.target.value)} />
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--text4)', marginTop:4 }}>
          <span>$250</span><span>$3,000</span>
        </div>
        <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <div style={{ background:'var(--bg3)', borderRadius:6, padding:'8px 10px' }}>
            <div style={{ fontSize:8, color:'var(--text3)', marginBottom:2 }}>ANNUAL TOTAL</div>
            <div style={{ fontSize:13, color:'var(--text)', fontFamily:'var(--display)' }}>{fmt(weekly*52)}</div>
          </div>
          <div style={{ background:'var(--bg3)', borderRadius:6, padding:'8px 10px' }}>
            <div style={{ fontSize:8, color:'var(--text3)', marginBottom:2 }}>MONTHLY TOTAL</div>
            <div style={{ fontSize:13, color:'var(--text)', fontFamily:'var(--display)' }}>{fmt(weekly*4)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const card = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12 };
