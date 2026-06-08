// ── Portfolio stocks ──────────────────────────────────────────────
// 11 positions: 41% index + 59% active
// 5-year horizon · $250k target · $10k start · $1k/week

export const STOCKS = [
  {
    ticker: 'VOO',  name: 'S&P 500 Index',   color: '#00e5ff', annualReturn: 0.10,  risk: 1, pct: 37,
    sector: 'Index',
    why: 'Core floor. Owns GOOGL, AMZN, NVDA at market weight. Can\'t catastrophically underperform.',
    rationale: '53% — reduced from 60% to make room for TSLA and WMT active positions.',
    thesis: `The index sleeve is your foundation, not your ceiling. VOO gives you diversified exposure to the 500 largest US companies with zero stock-picking risk. At 53% it ensures that even if every active position underperforms, you cannot catastrophically miss your $250k target.

The S&P 500 has returned ~10% annually over every rolling 20-year period in history. With $1k/week contributions, this sleeve alone generates significant wealth — the active 47% is where you generate alpha above that baseline.

Note that VOO already owns NVDA (~6%), MSFT (~7%), META (~2.4%), TSLA (~1.8%) and WMT (~0.8%) at index weights, so your effective exposure to your active picks is higher than the stated percentages.`,
  },
  {
    ticker: 'NVDA',  name: 'NVIDIA',         color: '#ff6b35', annualReturn: 0.13,  risk: 3, pct: 12,
    sector: 'AI Core',
    why: 'Undisputed AI chip leader. CUDA moat. Blackwell cycle early innings.',
    rationale: '14% — highest single active allocation. Conviction + moat depth justify max weight.',
    thesis: `NVIDIA has built the most defensible moat in technology through CUDA — a software ecosystem that took 10+ years to build and would take another 10 to replicate. While AMD and Intel can match chip-level performance, the developer tooling, libraries, and workflows built on CUDA create switching costs that make displacement nearly impossible.

The Blackwell architecture represents the next major compute cycle, with hyperscalers committing hundreds of billions in AI infrastructure spending through 2026. NVIDIA captures the largest share of that spend.

Beyond training, inference demand is emerging as a second independent growth vector. Every AI application deployed requires ongoing GPU compute. Sovereign AI — nations building national AI infrastructure — is a third demand vector that creates geopolitically diversified revenue.

Key risks: custom silicon from hyperscalers, China export restrictions, TSMC concentration risk. None are existential in the 5-year window.`,
  },
  {
    ticker: 'MSFT',  name: 'Microsoft',      color: '#00ccdd', annualReturn: 0.12,  risk: 2, pct: 8,
    sector: 'AI Core',
    why: 'Most durable AI mega-cap. Azure + Copilot monetization early innings.',
    rationale: '8% — best risk-adjusted name in active sleeve. Risk 2 with 12% return.',
    thesis: `Microsoft monetizes AI across every layer of the stack simultaneously — Azure cloud infrastructure, GitHub Copilot for developers, Microsoft 365 Copilot for enterprises, and Bing for consumers. Each represents a distinct monetization surface reinforcing the others.

The Azure relationship with OpenAI gives Microsoft first-mover advantage in enterprise AI deployment. Corporate customers deeply embedded in the Microsoft ecosystem are being upsold AI features within existing contracts — the lowest-friction AI monetization path in the industry.

At Risk 2, MSFT is the portfolio's most reliable active compounder. It's the name you hold through a tech correction and add to, not the one that panic-sells you out of conviction.`,
  },
  {
    ticker: 'META',  name: 'Meta',           color: '#0099bb', annualReturn: 0.125, risk: 3, pct: 6,
    sector: 'AI Core',
    why: 'Ad monopoly with AI dividend. Margin expansion accelerating.',
    rationale: '7% — strong return capped below MSFT due to advertiser dependency.',
    thesis: `Meta operates the world's most powerful digital advertising machine across 3.2 billion daily active users. Every dollar Meta spends on AI directly improves ad targeting precision, which directly increases advertiser ROI, which directly justifies higher CPMs. The cycle is self-reinforcing.

Llama open-source models are a strategic masterstroke — by commoditizing foundation models, Meta undermines OpenAI and Google's closed-model pricing power while positioning itself as the infrastructure-agnostic AI platform.

Key risks: EU regulatory action, advertiser concentration, young user demographic erosion to TikTok.`,
  },
  {
    ticker: 'CRWD',  name: 'CrowdStrike',    color: '#e8001c', annualReturn: 0.13,  risk: 3, pct: 8,
    sector: 'Security',
    why: 'Non-discretionary cybersecurity. Falcon platform deeply sticky ARR.',
    rationale: '8% — best non-AI conviction name. Mission-critical demand doesn\'t disappear in downturns.',
    thesis: `CrowdStrike's Falcon platform consolidates endpoint detection, threat intelligence, identity protection, and cloud security into a single agent — replacing 10-15 point solutions. The consolidation dynamic is the key growth driver: when budgets tighten, companies cut niche vendors and double down on platforms like CrowdStrike.

Net revenue retention above 120% reflects the land-and-expand model working perfectly. Ripping out CrowdStrike requires replacing a unified security data layer — almost no security team accepts that risk.

The 2024 software update incident that caused the global IT outage demonstrated the switching cost moat in practice — enterprises stayed despite the outage because alternatives were worse.`,
  },
  {
    ticker: 'AXON',  name: 'Axon',           color: '#ffd700', annualReturn: 0.13,  risk: 3, pct: 6,
    sector: 'Public Safety',
    why: 'Govt contracts recession-proof. Doesn\'t track Nasdaq. Real diversification.',
    rationale: '6% — genuine crash diversification. Public safety spending is counter-cyclical.',
    thesis: `Axon operates a hardware-software flywheel in public safety: TASER devices and body cameras create the initial government relationship, then Evidence.com and Axon Records generate recurring SaaS revenue. Government contracts are the stickiest customer relationships in commerce — replacing Axon would require a multi-year IT migration no police department will accept.

The AI opportunity is significant: Draft One uses AI to automatically write police reports from body camera footage, saving officers 3-4 hours per shift. This makes existing workflows faster and Axon more valuable.

International expansion — UK, Australia, Europe — represents a multi-year growth runway at earlier stages than the US deployment cycle.`,
  },
  {
    ticker: 'APLD',  name: 'Applied Digital', color: '#ff9100', annualReturn: 0.18,  risk: 5, pct: 6,
    sector: 'AI Infra',
    why: '$11B CoreWeave backlog. Highest upside. Pre-profit risk sized at 7%.',
    rationale: '7% — if you have conviction, size it properly. Hard cap given Risk 5.',
    thesis: `Applied Digital operates purpose-built AI data centers optimized for GPU density, power delivery, and liquid cooling. The bull case rests on $11B+ contracted backlog with CoreWeave, which itself is backed by Microsoft. Polaris Forge 1 represents 400MW of contracted capacity at a time when power-constrained AI compute demand is growing faster than supply can respond.

APLD doesn't need to pick the winning AI model or chip. It just needs to provide the physical infrastructure where compute workloads run.

The bear case is real: pre-profitability means the stock is valued on future cash flows with high execution risk. CoreWeave concentration means a single contract renegotiation changes the thesis. Capital-intensive construction projects run over budget.`,
  },
  {
    ticker: 'MELI',  name: 'MercadoLibre',   color: '#ffe600', annualReturn: 0.14,  risk: 3, pct: 5,
    sector: 'E-Commerce',
    why: 'Latin America e-commerce dominant. 85% of retail still offline. Less than 5% market share.',
    rationale: '5% — clearest geographic growth runway available. LatAm e-commerce penetration is a decade behind US.',
    thesis: `MercadoLibre is the dominant e-commerce and fintech platform across Latin America — the Amazon and PayPal of a region with 650 million people and e-commerce penetration roughly half the level of the US. Physical stores still represent 85% of retail spend in Latin America, and MELI holds less than 5% of total retail market share. That gap is the entire thesis.

Unique buyers in Brazil grew 29% year over year in Q3 2025 — the fastest pace since the pandemic peak and the largest quarterly buyer addition ever. FX-neutral GMV grew 30% in Brazil, 23% in Mexico, and 126% in Argentina in Q1 2025.

Mercado Pago, the fintech arm, is becoming the primary banking relationship for hundreds of millions of Latin Americans who are unbanked or underbanked. It is PayPal, Venmo, and a bank account combined — in markets where traditional banking never reached most people. This is a completely separate multi-billion dollar business compounding inside the same platform.

The logistics network — built from scratch because Latin American infrastructure required it — now handles 95% of MELI's shipments internally. This is a 25-year moat that Amazon, Shein, and Temu cannot replicate with a checkbook.

At a PEG ratio of 1.16 and P/E of 40x — below its 3-year average of 65x — you are buying this at a genuine valuation discount to its own history while the underlying growth is accelerating.

Key risks: currency volatility in Brazil and Argentina, Amazon Latin America investment, emerging market macro sensitivity. Sized at 5% to capture the long runway while acknowledging EM risk.`,
  },
  {
    ticker: 'MU',    name: 'Micron Technology', color: '#4fc3f7', annualReturn: 0.18,  risk: 3, pct: 3,
    sector: 'AI Memory',
    why: 'Only US HBM supplier. Every NVDA GPU needs Micron memory. $100B HBM by 2028.',
    rationale: '3% satellite — AI memory layer beneath NVDA. Cyclical risk keeps it small.',
    thesis: 'Micron is the picks-and-shovels play directly beneath NVDA. Every H100 and Blackwell GPU requires High Bandwidth Memory — Micron is one of only three companies globally that makes it and the only US-based manufacturer. HBM sold out for all of 2026. Q2 FY2026 revenue hit $23.86B record. Full-year consensus $76B — nearly double FY2025. Forward P/E below 8x for 57% YoY growth. June 24 Q3 earnings is the next catalyst. $100B HBM market by 2028 at 40% CAGR. Key risk: memory is historically cyclical — oversupply can collapse margins fast.',
  },
  {
    ticker: 'TSLA',  name: 'Tesla',          color: '#cc0000', annualReturn: 0.15,  risk: 4, pct: 3,
    sector: 'Autonomy/Energy',
    why: 'Robotaxi catalyst 2025-2026. Energy storage underappreciated. Sized small for Elon risk.',
    rationale: '3% — conviction play on Robotaxi launch. Small enough that sentiment swings don\'t crater portfolio.',
    thesis: `Tesla's investment thesis has evolved beyond EVs. The Robotaxi launch is the near-term catalyst — if FSD achieves sufficient autonomy for commercial deployment, the economics of the robotaxi network are extraordinary. Each vehicle becomes a revenue-generating asset rather than a depreciating one.

The energy storage business — Megapack and Powerwall — is growing rapidly and largely ignored by analysts focused on automotive margins. As grid-scale battery storage becomes essential infrastructure for renewable energy, this business could rival automotive in scale.

Optimus robot is a 3-5 year optionality play. Sized at 3% because Elon sentiment risk is real and ongoing — the stock moves 20% on a single tweet. Enough to benefit meaningfully if Robotaxi delivers, not enough to matter if it doesn't.`,
  },
  {
    ticker: 'MP',    name: 'MP Materials',    color: '#a8ff78', annualReturn: 0.18,  risk: 4, pct: 5,
    sector: 'Rare Earth',
    why: 'Only US fully integrated rare earth producer. Apple + DoD contracts. China decoupling tailwind.',
    rationale: '5% — only rare earth name that passes screening framework. Real revenue, government contracts, Apple partnership. Genuine portfolio diversification — doesn\'t correlate with Nasdaq.',
    thesis: `MP Materials is America's only fully integrated rare earth producer, spanning the entire supply chain from mining and processing at Mountain Pass in California to advanced metallization and magnet manufacturing in Fort Worth, Texas.

The strategic moat is extraordinary and government-backed: the US Department of Defense has established price floor agreements with MP, stabilizing earnings even if rare earth commodity prices weaken — a protection no typical commodity producer has. The Apple partnership gives MP a marquee commercial customer for its magnet production alongside the Pentagon relationship.

The macro tailwind is structural, not cyclical. China controls ~85% of global rare earth processing and has begun tightening export controls following US tariffs. Every EV motor, wind turbine, defense system, and AI data center uses rare earth magnets. The US government is actively funding domestic alternatives — MP is the primary beneficiary.

Revenue grew 35% to $275M in 2025, with the Magnetics division generating its first revenues and positive EBITDA. Record NdPr production and the ramp of the Fort Worth magnetics facility represent the next leg of margin expansion as downstream integration increases.

Key risks: rare earth commodity price volatility, Chinese competitive response, capital-intensive construction execution. Government price floors mitigate the commodity risk significantly. Sized at 5% — meaningful enough to matter, small enough to absorb if commodity cycles turn against them.`,
  },
];

export const BLENDED    = STOCKS.reduce((a, s) => a + (s.pct / 100) * s.annualReturn, 0);
export const RISK_LABEL = ['', 'Low', 'Med-Low', 'Medium', 'Med-High', 'High'];
export const RISK_COLOR  = ['', '#69ff47', '#a0ff47', '#ffcc00', '#ff9100', '#ff4444'];
export const TARGET      = 250000;
export const START       = 10000;

// ── DCA Schedule ─────────────────────────────────────────────────
// 4-week rotation — full $1k deployed every week
// Week 1: VOO + AI Core heavy
// Week 2: VOO + Security + Public Safety + Streaming
// Week 3: VOO + Healthcare + AI Infra
// Week 4: VOO + Autonomy + Rare Earth + rebalance

export const WEEKS = [
  {
    week: 1, theme: 'AI Core Week',
    note: 'Highest conviction AI names — NVDA and index anchor',
    days: [
      { day: 'MON', stocks: ['VOO', 'NVDA'],  note: 'Index anchor + highest conviction' },
      { day: 'TUE', stocks: ['MSFT', 'META'],  note: 'AI Core duo — Azure + ad machine' },
      { day: 'WED', stocks: ['CRWD', 'APLD'],  note: 'Security + AI infra double-down' },
      { day: 'THU', stocks: ['NVDA', 'AXON'],  note: 'NVDA repeat + govt safety diversifier' },
      { day: 'FRI', stocks: ['MELI', 'MP'],    note: 'LatAm growth + rare earth close' },
    ],
  },
  {
    week: 2, theme: 'Growth & Safety Week',
    note: 'Non-AI diversification — MELI, MP, TSLA, AXON',
    days: [
      { day: 'MON', stocks: ['VOO', 'CRWD'],   note: 'Index anchor + non-discretionary security' },
      { day: 'TUE', stocks: ['AXON', 'MELI'],  note: 'Govt contracts + LatAm growth' },
      { day: 'WED', stocks: ['MSFT', 'META'],  note: 'Quality AI compounders' },
      { day: 'THU', stocks: ['TSLA', 'MP'],    note: 'Autonomy bet + rare earth play' },
      { day: 'FRI', stocks: ['NVDA', 'APLD'],  note: 'AI infra close — highest upside pair' },
    ],
  },
  {
    week: 3, theme: 'AI Infra Week',
    note: 'APLD and NVDA heavy — maximum AI infrastructure exposure',
    days: [
      { day: 'MON', stocks: ['VOO', 'NVDA'],   note: 'Anchor repeat — NVDA every cycle' },
      { day: 'TUE', stocks: ['APLD', 'CRWD'],  note: 'AI infra + security — both high conviction' },
      { day: 'WED', stocks: ['MSFT', 'AXON'],  note: 'Durable compounder + govt safety' },
      { day: 'THU', stocks: ['META', 'MELI'],  note: 'Ad monopoly + LatAm e-commerce' },
      { day: 'FRI', stocks: ['TSLA', 'MP'],    note: 'Autonomy + rare earth close' },
    ],
  },
  {
    week: 4, theme: 'Rebalance Week',
    note: 'Even distribution — review drift and trim if needed',
    days: [
      { day: 'MON', stocks: ['VOO', 'NVDA'],   note: 'Consistent anchor — never skip NVDA' },
      { day: 'TUE', stocks: ['TSLA', 'MP'],    note: 'Smaller positions — keep them funded' },
      { day: 'WED', stocks: ['CRWD', 'AXON'],  note: 'Security + govt — recession resistant pair' },
      { day: 'THU', stocks: ['MELI', 'META'],  note: 'Growth pair — LatAm + global ads' },
      { day: 'FRI', stocks: ['APLD', 'MSFT'],  note: 'High upside + quality close' },
    ],
  },
];

// ── Trim logic ────────────────────────────────────────────────────
export const TRIM_RULES = [
  { label: 'Under 6 months',  maxMonths: 6,  gainThreshold: 0.40, trimPct: 0.25 },
  { label: '6–12 months',     maxMonths: 12, gainThreshold: 0.30, trimPct: 0.25 },
  { label: '12+ months',      maxMonths: 999,gainThreshold: 0.20, trimPct: 0.25 },
  { label: '2x target weight',maxMonths: 999,gainThreshold: 0,    trimPct: null, weightTrigger: 2.0 },
];

export function getTrimAlert(stock, position) {
  if (!position) return null;
  const { avgCost, currentPrice, shares, purchaseDate } = position;
  if (!avgCost || !currentPrice || !shares) return null;
  const gainPct     = (currentPrice - avgCost) / avgCost;
  const monthsHeld  = (Date.now() - new Date(purchaseDate)) / (1000 * 60 * 60 * 24 * 30);
  const currentPct  = (currentPrice * shares) / position.totalPortfolioValue * 100;
  const targetPct   = stock.pct;

  // Weight trigger — 2x target
  if (currentPct >= targetPct * 2) {
    const trimShares = Math.floor(shares * 0.25);
    return {
      type: 'weight',
      message: `${stock.ticker} is ${currentPct.toFixed(1)}% of portfolio — 2x target weight`,
      trimShares,
      trimValue: trimShares * currentPrice,
      gain: gainPct,
      urgent: true,
    };
  }

  // Gain triggers
  if (gainPct <= 0) return null;
  const rule = monthsHeld < 6
    ? TRIM_RULES[0]
    : monthsHeld < 12
    ? TRIM_RULES[1]
    : TRIM_RULES[2];

  if (gainPct >= rule.gainThreshold) {
    const trimShares = Math.floor(shares * rule.trimPct);
    return {
      type:       'gain',
      message:    `${stock.ticker} up ${(gainPct * 100).toFixed(0)}% — trim 25% (${rule.label} rate)`,
      trimShares,
      trimValue:  trimShares * currentPrice,
      gain:       gainPct,
      monthsHeld: Math.floor(monthsHeld),
      taxRate:    monthsHeld >= 12 ? 'long-term' : 'short-term',
      urgent:     gainPct >= rule.gainThreshold * 1.5,
    };
  }
  return null;
}

export function fmt(v) {
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${Math.round(v)}`;
}

export function project(weekly, start, years, rate) {
  const r = rate / 52;
  return Array.from({ length: years + 1 }, (_, y) => {
    const w  = y * 52;
    const fv = w === 0 ? start : start * Math.pow(1 + rate, y) + weekly * ((Math.pow(1 + r, w) - 1) / r);
    return { year: y, value: Math.round(fv), invested: Math.round(start + weekly * w) };
  });
}
