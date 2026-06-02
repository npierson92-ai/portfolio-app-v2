
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

function getWeekLabel() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return 'Week ' + week + ', ' + year;
}

const PROMPTS = [
  "What did you buy this week and why?",
  "Which positions are you most confident in?",
  "Any news that changed your thesis?",
  "Are you sticking to the DCA schedule?",
  "Market conditions this week?",
  "Any trim alerts triggered?",
  "New information on any holdings?",
  "What would make you sell a position?",
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ week: '', notes: '', bought: '', trimmed: '', confidence: '', rating: 3 });

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('journal').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const save = async () => {
    try {
      if (editing) {
        await supabase.from('journal').update(form).eq('id', editing.id);
      } else {
        await supabase.from('journal').insert({ ...form, date: new Date().toISOString() });
      }
      await loadEntries();
      setView('list');
      setEditing(null);
    } catch(e) { alert('Failed to save entry.'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await supabase.from('journal').delete().eq('id', id);
    await loadEntries();
  };

  const startNew = () => {
    setForm({ week: getWeekLabel(), notes: '', bought: '', trimmed: '', confidence: '', rating: 3 });
    setEditing(null);
    setView('edit');
  };

  const startEdit = (e) => {
    setForm({ week: e.week, notes: e.notes||'', bought: e.bought||'', trimmed: e.trimmed||'', confidence: e.confidence||'', rating: e.rating||3 });
    setEditing(e);
    setView('edit');
  };

  if (view === 'edit') return (
    <div style={{ padding: '16px 16px calc(100px + var(--safe-bottom))', overflowY: 'auto', height: '100%' }}>
      <button onClick={() => setView('list')} style={backBtn}>← JOURNAL</button>
      <div style={{ fontSize: 36, fontFamily: 'var(--display)', color: '#fff', marginBottom: 4 }}>{editing ? 'EDIT' : 'NEW ENTRY'}</div>
      <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 20 }}>{form.week}</div>
      {[
        { label: 'WEEK', key: 'week', rows: 1 },
        { label: 'WHAT DID YOU BUY?', key: 'bought', rows: 2, placeholder: 'Tickers, amounts...' },
        { label: 'DID YOU TRIM ANYTHING?', key: 'trimmed', rows: 2, placeholder: 'Ticker, shares, gain...' },
        { label: 'CONFIDENCE NOTE', key: 'confidence', rows: 2, placeholder: 'How confident in holdings?' },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 8, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 5 }}>{f.label}</div>
          <textarea rows={f.rows} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder||''} />
        </div>
      ))}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 8, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 8 }}>WEEKLY NOTES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setForm(f => ({ ...f, notes: f.notes + (f.notes ? '\n\n' : '') + p + '\n' }))}
              style={{ fontSize: 8, color: 'var(--text3)', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 7px', cursor: 'pointer', fontFamily: 'var(--mono)', touchAction: 'manipulation' }}>
              + {p.slice(0,28)}...
            </button>
          ))}
        </div>
        <textarea rows={8} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Your weekly journal entry..." />
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 8, color: 'var(--text3)', letterSpacing: '0.12em', marginBottom: 6 }}>
          WEEK RATING: {['','😞 Poor','😐 Below avg','🙂 Average','😊 Good','🚀 Excellent'][form.rating]}
        </div>
        <input type="range" min={1} max={5} value={form.rating} onChange={e => setForm(p => ({ ...p, rating: +e.target.value }))} />
      </div>
      <button onClick={save} style={saveBtn}>SAVE ENTRY</button>
    </div>
  );

  return (
    <div style={{ padding: '16px 16px calc(100px + var(--safe-bottom))', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.2em', marginBottom: 2 }}>WEEKLY LOG · CLOUD SAVED</div>
          <div style={{ fontSize: 44, fontFamily: 'var(--display)', color: '#fff', lineHeight: 1 }}>JOURNAL</div>
        </div>
        <button onClick={startNew} style={newBtn}>+ NEW</button>
      </div>
      {loading && <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 11 }}>Loading...</div>}
      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text4)' }}>
          <div style={{ fontSize: 28, fontFamily: 'var(--display)', marginBottom: 8 }}>NO ENTRIES YET</div>
          <div style={{ fontSize: 11 }}>Start your weekly log</div>
        </div>
      )}
      {entries.map(e => (
        <div key={e.id} style={entryCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>{e.week}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)' }}>{new Date(e.date||e.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(n => <div key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: n <= e.rating ? 'var(--cyan)' : 'var(--border)' }} />)}
            </div>
          </div>
          {e.bought && <div style={{ marginBottom: 8, padding: '7px 10px', background: 'var(--bg3)', borderRadius: 5, borderLeft: '2px solid #00e5ff44' }}><div style={{ fontSize: 7, color: 'var(--text3)', marginBottom: 2 }}>BOUGHT</div><div style={{ fontSize: 11, color: 'var(--text2)' }}>{e.bought}</div></div>}
          {e.trimmed && <div style={{ marginBottom: 8, padding: '7px 10px', background: 'var(--bg3)', borderRadius: 5, borderLeft: '2px solid #69ff4744' }}><div style={{ fontSize: 7, color: 'var(--text3)', marginBottom: 2 }}>TRIMMED</div><div style={{ fontSize: 11, color: 'var(--text2)' }}>{e.trimmed}</div></div>}
          {e.notes && <div style={{ fontSize: 11, color: '#667788', lineHeight: 1.6, marginBottom: 10 }}>{e.notes.length > 150 ? e.notes.slice(0,150)+'...' : e.notes}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => startEdit(e)} style={editBtn}>EDIT</button>
            <button onClick={() => del(e.id)} style={delBtn}>DELETE</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const saveBtn={width:'100%',padding:14,background:'var(--cyan)',border:'none',borderRadius:10,color:'var(--bg)',fontSize:12,letterSpacing:'0.12em',fontFamily:'var(--mono)',fontWeight:500,cursor:'pointer',touchAction:'manipulation'};
const newBtn={padding:'8px 16px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:8,color:'var(--cyan)',fontSize:10,letterSpacing:'0.1em',fontFamily:'var(--mono)',cursor:'pointer',touchAction:'manipulation'};
const backBtn={background:'transparent',border:'none',color:'var(--text3)',fontSize:10,letterSpacing:'0.1em',marginBottom:16,padding:0,cursor:'pointer',display:'block',fontFamily:'var(--mono)',touchAction:'manipulation'};
const entryCard={background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:16,marginBottom:10};
const editBtn={padding:'6px 12px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:6,color:'var(--text2)',fontSize:9,letterSpacing:'0.1em',fontFamily:'var(--mono)',cursor:'pointer',touchAction:'manipulation'};
const delBtn={padding:'6px 12px',background:'transparent',border:'1px solid #ff444433',borderRadius:6,color:'var(--red)',fontSize:9,letterSpacing:'0.1em',fontFamily:'var(--mono)',cursor:'pointer',touchAction:'manipulation'};
