import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

/* ═══ AUTO-SAVING FIELD ═══
   Uses local state so typing is instant.
   Debounces saves so Supabase isn't hammered on every keystroke.
   Only sends the single key that changed (not the whole snapshot).
*/
function Field({ value, onSave, label, placeholder, prefix, suffix, type = 'text', readOnly = false, bold = false }) {
  const [val, setVal] = useState(value ?? '')
  const prevValue = useRef(value)

  // Only sync from parent if the value actually changed externally
  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value
      setVal(value ?? '')
    }
  }, [value])

  const timer = useRef(null)
  const handleChange = (e) => {
    const newVal = e.target.value
    setVal(newVal)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      prevValue.current = newVal
      onSave?.(newVal)
    }, 1200)
  }

  // Save immediately on blur
  const handleBlur = (e) => {
    e.target.style.borderColor = '#e8e8e8'
    clearTimeout(timer.current)
    if (val !== prevValue.current) {
      prevValue.current = val
      onSave?.(val)
    }
  }

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ padding: '10px 8px 10px 12px', background: '#f5f5f5', border: '2px solid #e8e8e8', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 13, color: '#666' }}>{prefix}</span>}
        <input
          type={type}
          value={val}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: prefix ? '0 8px 8px 0' : suffix ? '8px 0 0 8px' : 8,
            border: '2px solid #e8e8e8', fontSize: 13, fontFamily: 'inherit', outline: 'none',
            boxSizing: 'border-box', transition: 'border-color 0.2s',
            fontWeight: bold ? 700 : 400,
            background: readOnly ? '#fafafa' : '#fff',
            ...(prefix ? { borderLeft: 'none' } : {}),
            ...(suffix ? { borderRight: 'none' } : {}),
          }}
          onFocus={e => { if (!readOnly) e.target.style.borderColor = '#5a7c65' }}
          onBlur={handleBlur}
        />
        {suffix && <span style={{ padding: '10px 12px 10px 8px', background: '#f5f5f5', border: '2px solid #e8e8e8', borderLeft: 'none', borderRadius: '0 8px 8px 0', fontSize: 13, color: '#666' }}>{suffix}</span>}
      </div>
    </div>
  )
}

function SectionHeader({ children }) {
  return (
    <div style={{ background: '#1a1a1a', color: '#fff', padding: '12px 20px', borderRadius: '8px 8px 0 0', margin: '-24px -24px 20px', fontSize: 16, fontWeight: 700 }}>
      {children}
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.06)', ...style }}>
      {children}
    </div>
  )
}

/* ═══ FEE ROW COMPONENT ═══
   Each fee gets its own local state so typing works properly.
   Saves on blur or after 1.5s debounce.
*/
function FeeRow({ fee, index, onUpdate, onRemove }) {
  const [name, setName] = useState(fee.feeName || '')
  const [amount, setAmount] = useState(fee.amount || '')
  const nameRef = useRef(fee.feeName || '')
  const amountRef = useRef(fee.amount || '')
  const timer = useRef(null)

  // Sync from parent only if changed externally
  useEffect(() => {
    if (fee.feeName !== nameRef.current) { nameRef.current = fee.feeName || ''; setName(fee.feeName || '') }
    if (fee.amount !== amountRef.current) { amountRef.current = fee.amount || ''; setAmount(fee.amount || '') }
  }, [fee.feeName, fee.amount])

  const debouncedSave = (newName, newAmount) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      nameRef.current = newName
      amountRef.current = newAmount
      onUpdate(index, newName, newAmount)
    }, 1500)
  }

  const handleNameChange = (e) => {
    const v = e.target.value
    setName(v)
    debouncedSave(v, amount)
  }
  const handleAmountChange = (e) => {
    const v = e.target.value
    setAmount(v)
    debouncedSave(name, v)
  }
  const handleBlur = () => {
    clearTimeout(timer.current)
    if (name !== nameRef.current || amount !== amountRef.current) {
      nameRef.current = name
      amountRef.current = amount
      onUpdate(index, name, amount)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
      <input value={name} onChange={handleNameChange} onBlur={handleBlur} placeholder="Fee name" style={{ flex: 1, padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ padding: '8px', background: '#f5f5f5', border: '2px solid #e8e8e8', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: 13, color: '#666' }}>$</span>
        <input value={amount} onChange={handleAmountChange} onBlur={handleBlur} placeholder="0" style={{ width: 100, padding: '8px 12px', border: '2px solid #e8e8e8', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: 13, fontFamily: 'inherit' }} />
      </div>
      <button onClick={() => onRemove(index)} style={{ color: '#c44', fontSize: 18, padding: '4px 8px', cursor: 'pointer', background: 'none', border: 'none' }}>x</button>
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */

export default function BusinessSnapshot({ hubData, onSave }) {
  const meta = hubData?._meta || {}
  const allData = hubData?.allData || {}
  // Read from both sources with _meta taking priority
  const snapshot = { ...(allData?.snapshot || {}), ...(meta.snapshot || {}) }

  // ─── SAVE: only sends the single key that changed ───
  // saveHubData in supabase.js will deep-merge this into _meta.snapshot
  const saveField = useCallback((key, val) => {
    const updatedSnapshot = { ...snapshot, [key]: val }
    onSave({
      _meta: { snapshot: { [key]: val } },
      allData: { ...allData, snapshot: updatedSnapshot }
    })
  }, [onSave, snapshot, allData])

  // ─── PARSE HELPERS ───
  const num = (v) => parseFloat(String(v || '0').replace(/[,$]/g, '')) || 0
  const fmt = (n) => {
    if (!n && n !== 0) return ''
    return Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  // ─── TRANSACTION FEES ───
  const fees = snapshot.transactionFees || []
  const addFee = () => {
    const updated = [...fees, { id: Date.now().toString(), feeName: '', amount: '' }]
    saveField('transactionFees', updated)
  }
  const updateFee = useCallback((idx, newName, newAmount) => {
    // Read fresh from snapshot via closure - but since we send just transactionFees key,
    // the deep merge will only replace transactionFees, not touch other fields
    const currentFees = hubData?.allData?.snapshot?.transactionFees || hubData?._meta?.snapshot?.transactionFees || []
    const updated = currentFees.map((f, i) => i === idx ? { ...f, feeName: newName, amount: newAmount } : f)
    saveField('transactionFees', updated)
  }, [hubData, saveField])
  const removeFee = (idx) => {
    saveField('transactionFees', fees.filter((_, i) => i !== idx))
  }
  const totalFees = fees.reduce((sum, f) => sum + (parseFloat(String(f.amount || '').replace(/[,$]/g, '')) || 0), 0)

  // ─── PREVIOUS YEAR STATS ───
  const lyListings = num(snapshot.lastYearListingsClosed)
  const lyBuyers = num(snapshot.lastYearBuyersClosed)
  const lyTotal = lyListings + lyBuyers
  const lyListingPct = lyTotal > 0 ? Math.round(lyListings / lyTotal * 100) : 0
  const lyBuyerPct = lyTotal > 0 ? Math.round(lyBuyers / lyTotal * 100) : 0
  const lyGCI = num(snapshot.lastYearGCI)
  const lyExpenses = num(snapshot.totalExpenses)
  const lyProfitMargin = lyExpenses > 0 && lyGCI > 0 ? Math.round((1 - lyExpenses / lyGCI) * 100) : 0

  // ─── AVERAGES ───
  const avgPrice = num(snapshot.avgSalesPrice)
  const avgComm = num(snapshot.avgCommPct)
  const avgCostBuyer = num(snapshot.avgCostBuyer)
  const avgCostSeller = num(snapshot.avgCostSeller)
  const totalCap = num(snapshot.totalCap)

  // ─── GCI PER TRANSACTION ───
  const gciPerDeal = avgPrice * (avgComm / 100)

  // ─── AVERAGE COST PER TRANSACTION ───
  const avgCostPerDeal = (avgCostBuyer > 0 && avgCostSeller > 0)
    ? (avgCostBuyer + avgCostSeller) / 2
    : (avgCostBuyer || avgCostSeller || 0)

  // ─── NET COMMISSION PER TRANSACTION ───
  const netCommPerDeal = gciPerDeal - avgCostPerDeal - totalFees

  // ─── USE NET IF POSITIVE, OTHERWISE GROSS ───
  const commForCalc = netCommPerDeal > 0 ? netCommPerDeal : gciPerDeal

  // ─── GOAL CALCULATIONS (exact original formula) ───
  const goalNetIncome = num(snapshot.goalNetIncome)
  const canCalcGoal = goalNetIncome > 0 && avgPrice > 0 && avgComm > 0 && gciPerDeal > 0 && commForCalc > 0

  // goalUnits = ceil((goalNetIncome + totalCap) / netCommPerTransaction)
  const goalUnits = canCalcGoal ? Math.ceil((goalNetIncome + totalCap) / commForCalc) : 0
  // goalGCI = goalUnits * gciPerDeal
  const goalGCI = canCalcGoal ? Math.round(goalUnits * gciPerDeal) : 0

  // ─── GOAL SPLIT BY LISTING VS BUYER (from previous year distribution) ───
  const goalListingUnits = goalUnits > 0 && lyListingPct > 0 ? Math.ceil(goalUnits * (lyListingPct / 100)) : 0
  const goalBuyerUnits = goalUnits > 0 && lyBuyerPct > 0 ? Math.ceil(goalUnits * (lyBuyerPct / 100)) : 0

  // ─── LISTING FUNNEL (exact original: work backward from closings to appointments) ───
  const listSignedClosed = num(snapshot.listingConvSignedClosed)
  const listHeldSigned = num(snapshot.listingConvHeldSigned)
  const listSetHeld = num(snapshot.listingConvSetHeld)

  const listSignedNeeded = listSignedClosed > 0 ? Math.ceil(goalListingUnits / (listSignedClosed / 100)) : 0
  const listHeldNeeded = listHeldSigned > 0 ? Math.ceil(listSignedNeeded / (listHeldSigned / 100)) : 0
  const listSetNeeded = listSetHeld > 0 ? Math.ceil(listHeldNeeded / (listSetHeld / 100)) : 0

  // ─── BUYER FUNNEL (exact original: work backward from closings to appointments) ───
  const buySignedClosed = num(snapshot.buyerConvSignedClosed)
  const buyHeldSigned = num(snapshot.buyerConvHeldSigned)
  const buySetHeld = num(snapshot.buyerConvSetHeld)

  const buySignedNeeded = buySignedClosed > 0 ? Math.ceil(goalBuyerUnits / (buySignedClosed / 100)) : 0
  const buyHeldNeeded = buyHeldSigned > 0 ? Math.ceil(buySignedNeeded / (buyHeldSigned / 100)) : 0
  const buySetNeeded = buySetHeld > 0 ? Math.ceil(buyHeldNeeded / (buySetHeld / 100)) : 0

  // ─── YTD ───
  const ytdGCI = num(snapshot.ytdGCI)
  const ytdUnits = num(snapshot.ytdUnits)
  const ytdGCIProgress = goalGCI > 0 ? Math.min(100, Math.round((ytdGCI / goalGCI) * 100)) : 0

  // ─── PULL FROM PIPELINE ───
  const pullFromPipeline = () => {
    alert('Pull from Pipeline will aggregate your closed deals once Pipeline & Transactions is built out. Add deals there first.')
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Business Snapshot</h1>
      <p style={{ fontSize: 15, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>
        This is the heartbeat of your business. Fill this out honestly so your goals, strategies, and decisions are built on real numbers.
      </p>

      {/* ══════ BUSINESS INFORMATION ══════ */}
      <Card>
        <SectionHeader>Business Information</SectionHeader>
        <Field label="Business Name" value={snapshot.businessName} onSave={v => saveField('businessName', v)} placeholder="Your business name" />
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <Field label="Location" value={snapshot.location} onSave={v => saveField('location', v)} placeholder="City, State" />
          <Field label="Brokerage" value={snapshot.brokerage} onSave={v => saveField('brokerage', v)} placeholder="Your brokerage" />
        </div>
        {(hubData?.teamMembers || meta.teamMembers || []).length > 0 && (
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>Current Team Members</label>
            <div style={{ background: '#f8f7f5', border: '1px solid #e5e2db', borderRadius: 6, padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{(hubData?.teamMembers || meta.teamMembers || []).length}</div>
              {(hubData?.teamMembers || meta.teamMembers || []).map((m, i) => (
                <div key={i} style={{ fontSize: 13, color: '#555' }}>{m.name} <span style={{ color: '#999' }}>({m.role || 'Team'})</span></div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ══════ SALES INFORMATION ══════ */}
      <Card>
        <SectionHeader>Sales Information</SectionHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#555' }}>Enter your averages or pull from your pipeline data.</span>
          <button onClick={pullFromPipeline} style={{ padding: '6px 14px', background: '#fff', border: '2px solid #e8e8e8', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>Pull from Pipeline</button>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Field label="Average Sales Price" value={snapshot.avgSalesPrice} onSave={v => saveField('avgSalesPrice', v)} placeholder="349,817" prefix="$" />
          <Field label="Average Commission %" value={snapshot.avgCommPct} onSave={v => saveField('avgCommPct', v)} placeholder="2.86" suffix="%" />
        </div>
        {gciPerDeal > 0 && (
          <div style={{ background: '#f8f7f5', border: '1px solid #e5e2db', borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 13, color: '#333' }}>
            <strong>Average GCI Per Transaction:</strong> ${fmt(Math.round(gciPerDeal))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Field label="Avg Cost of Sale Per Transaction (Buyers)" value={snapshot.avgCostBuyer} onSave={v => saveField('avgCostBuyer', v)} placeholder="3,031" prefix="$" />
          <Field label="Avg Cost of Sale Per Transaction (Sellers)" value={snapshot.avgCostSeller} onSave={v => saveField('avgCostSeller', v)} placeholder="2,050" prefix="$" />
        </div>
        <Field label="Total Cap Amount" value={snapshot.totalCap} onSave={v => saveField('totalCap', v)} placeholder="15,000" prefix="$" />

        {/* Per-Transaction Fees */}
        <div style={{ marginTop: 20, background: '#f8f7f5', border: '1px solid #e5e2db', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Per-Transaction Fees</div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>Office fees, TC fees, E&O, and any other per-file costs that eat into your commission.</div>
          {fees.map((f, i) => (
            <FeeRow key={f.id || i} fee={f} index={i} onUpdate={updateFee} onRemove={removeFee} />
          ))}
          {totalFees > 0 && (
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>Total per transaction: ${fmt(totalFees)}</div>
          )}
          <button onClick={addFee} style={{ fontSize: 13, color: '#5a7c65', fontWeight: 600, padding: '6px 14px', border: '1px dashed #ccc', borderRadius: 6, background: 'none', cursor: 'pointer' }}>+ Add Fee</button>
        </div>

        <div style={{ marginTop: 16 }}>
          <Field label="Top 5 Lead Sources" value={snapshot.topLeadSources} onSave={v => saveField('topLeadSources', v)} placeholder="e.g., Zillow, SOI, Referrals, Open Houses, Website" />
        </div>
      </Card>

      {/* ══════ PREVIOUS YEAR STATS ══════ */}
      <Card>
        <SectionHeader>Previous Year Stats</SectionHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: '#555' }}>
          These stats help calculate your goals and funnel numbers.
          <button onClick={pullFromPipeline} style={{ padding: '6px 14px', background: '#fff', border: '2px solid #e8e8e8', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>Pull from Pipeline</button>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Field label="Last Year GCI" value={snapshot.lastYearGCI} onSave={v => saveField('lastYearGCI', v)} placeholder="88,951" prefix="$" />
          <Field label="Last Year Total Expenses" value={snapshot.totalExpenses} onSave={v => saveField('totalExpenses', v)} placeholder="23,150" prefix="$" />
        </div>
        {lyProfitMargin > 0 && (
          <div style={{ background: '#f8f7f5', border: '1px solid #e5e2db', borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 13, color: '#333' }}>
            <strong>Previous Year Profit Margin:</strong> {lyProfitMargin}%
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Field label="# of Listings Closed Last Year" value={snapshot.lastYearListingsClosed} onSave={v => saveField('lastYearListingsClosed', v)} placeholder="e.g., 5" />
          <Field label="# of Buyers Closed Last Year" value={snapshot.lastYearBuyersClosed} onSave={v => saveField('lastYearBuyersClosed', v)} placeholder="e.g., 4" />
        </div>
        {/* Auto-calculated totals and percentages */}
        {lyTotal > 0 && (
          <div style={{ background: '#f8f7f5', border: '1px solid #e5e2db', borderRadius: 6, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 32, fontSize: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 2 }}>Total Units</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{lyTotal}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 2 }}>Listings</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{lyListings} <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>({lyListingPct}%)</span></div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 2 }}>Buyers</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{lyBuyers} <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>({lyBuyerPct}%)</span></div>
              </div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Field label="# of Inbound Referrals Closed" value={snapshot.inboundReferralsClosed} onSave={v => saveField('inboundReferralsClosed', v)} placeholder="0" />
          <Field label="# of Outbound Referrals Closed" value={snapshot.outboundReferralsClosed} onSave={v => saveField('outboundReferralsClosed', v)} placeholder="0" />
        </div>
        <Field label="Total Units Closed (All Time)" value={snapshot.totalUnitsAllTime} onSave={v => saveField('totalUnitsAllTime', v)} placeholder="e.g., 45" />
      </Card>

      {/* ══════ THIS YEAR'S GOALS ══════ */}
      <Card>
        <SectionHeader>This Year's Goals</SectionHeader>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>Start with your net income goal. We'll calculate the GCI and units you need based on your averages, costs, and fees.</p>
        <Field label="I want to take home (Net Income Goal)" value={snapshot.goalNetIncome} onSave={v => saveField('goalNetIncome', v)} placeholder="500,000" prefix="$" />
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Gross Commission Income Goal</label>
            <div style={{ padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8, background: '#fafafa', fontSize: 13, fontWeight: 700, minHeight: 20 }}>
              {goalGCI > 0 ? `$${fmt(goalGCI)}` : <span style={{ fontWeight: 400, color: '#999' }}>Enter net income goal + averages above</span>}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Total Unit Goal</label>
            <div style={{ padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8, background: '#fafafa', fontSize: 13, fontWeight: 700, minHeight: 20 }}>
              {goalUnits > 0 ? goalUnits : <span style={{ fontWeight: 400, color: '#999' }}>Auto-calculated</span>}
            </div>
          </div>
        </div>
        {canCalcGoal && (
          <div style={{ background: '#f8f7f5', border: '1px solid #e5e2db', borderRadius: 6, padding: 12, marginTop: 16, fontSize: 13, color: '#555', lineHeight: 1.6 }}>
            Based on <strong>${fmt(Math.round(gciPerDeal))}</strong> avg GCI per deal,{' '}
            <strong>${fmt(Math.round(avgCostPerDeal))}</strong> avg costs,{' '}
            {totalFees > 0 && <><strong>${fmt(totalFees)}</strong> in fees, </>}
            {totalCap > 0 && <><strong>${fmt(totalCap)}</strong> cap, </>}
            your net per deal is <strong>${fmt(Math.round(netCommPerDeal > 0 ? netCommPerDeal : gciPerDeal))}</strong>.
            You need <strong>{goalUnits} transactions</strong> to hit your goal.
            {goalListingUnits > 0 && goalBuyerUnits > 0 && (
              <> ({goalListingUnits} listings, {goalBuyerUnits} buyers based on last year's split)</>
            )}
          </div>
        )}
      </Card>

      {/* ══════ YEAR TO DATE ══════ */}
      <Card>
        <SectionHeader>Year to Date ({new Date().getFullYear()})</SectionHeader>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Field label="YTD GCI" value={snapshot.ytdGCI} onSave={v => saveField('ytdGCI', v)} placeholder="0" prefix="$" />
          <Field label="YTD Units Closed" value={snapshot.ytdUnits} onSave={v => saveField('ytdUnits', v)} placeholder="0" />
        </div>
        {goalGCI > 0 && ytdGCI > 0 && (
          <div style={{ background: '#f8f7f5', border: '1px solid #e5e2db', borderRadius: 6, padding: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>GCI Goal Progress</span>
              <span style={{ fontWeight: 700 }}>{ytdGCIProgress}%</span>
            </div>
            <div style={{ background: '#e8e8e8', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{ background: '#5a7c65', height: '100%', width: `${ytdGCIProgress}%`, borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12, color: '#888' }}>
              <span>${fmt(ytdGCI)} earned</span>
              <span>${fmt(goalGCI)} goal</span>
            </div>
          </div>
        )}
      </Card>

      {/* ══════ LISTING FUNNEL ══════ */}
      <Card>
        <SectionHeader>Listing Funnel</SectionHeader>
        {goalListingUnits <= 0 && (
          <div style={{ background: '#fdf8e8', border: '1px solid #e8ddb8', borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 13, color: '#8a7540' }}>
            Fill in Previous Year Stats (# listings + # buyers closed) and This Year's Goals above to see your funnel numbers.
          </div>
        )}
        <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>Enter your conversion rates at each stage. The funnel works backward from your goal closings to calculate how many appointments you need to set.</p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Field label="% of Set Appts that are Held" value={snapshot.listingConvSetHeld} onSave={v => saveField('listingConvSetHeld', v)} placeholder="e.g., 80" suffix="%" />
          <Field label="% of Held Appts that get Signed" value={snapshot.listingConvHeldSigned} onSave={v => saveField('listingConvHeldSigned', v)} placeholder="e.g., 65" suffix="%" />
          <Field label="% of Signed that Close" value={snapshot.listingConvSignedClosed} onSave={v => saveField('listingConvSignedClosed', v)} placeholder="e.g., 90" suffix="%" />
        </div>
        {goalListingUnits > 0 && listSetNeeded > 0 && (
          <>
            <div style={{ background: '#f8f7f5', borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 0, justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{listSetNeeded}</div>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Appts to Set</div>
                </div>
                <div style={{ fontSize: 20, color: '#ccc' }}>&rarr;</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{listHeldNeeded}</div>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Appts Held</div>
                </div>
                <div style={{ fontSize: 20, color: '#ccc' }}>&rarr;</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{listSignedNeeded}</div>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Agreements Signed</div>
                </div>
                <div style={{ fontSize: 20, color: '#ccc' }}>&rarr;</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#5a7c65' }}>{goalListingUnits}</div>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Listings Closed</div>
                </div>
              </div>
            </div>
            {/* Monthly & Weekly Breakdown */}
            <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#333' }}>Your Listing Activity Targets</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, background: '#f8f7f5', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Per Month</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{(listSetNeeded / 12).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>appts to set</div>
                </div>
                <div style={{ flex: 1, background: '#f8f7f5', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Per Week</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{(listSetNeeded / 52).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>appts to set</div>
                </div>
                <div style={{ flex: 1, background: '#f8f7f5', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Monthly Closings</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#5a7c65' }}>{(goalListingUnits / 12).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>listings closed</div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* ══════ BUYER FUNNEL ══════ */}
      <Card>
        <SectionHeader>Buyer Funnel</SectionHeader>
        {goalBuyerUnits <= 0 && (
          <div style={{ background: '#fdf8e8', border: '1px solid #e8ddb8', borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 13, color: '#8a7540' }}>
            Fill in Previous Year Stats (# listings + # buyers closed) and This Year's Goals above to see your funnel numbers.
          </div>
        )}
        <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>Enter your conversion rates at each stage. The funnel works backward from your goal closings to calculate how many appointments you need to set.</p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Field label="% of Set Appts that are Held" value={snapshot.buyerConvSetHeld} onSave={v => saveField('buyerConvSetHeld', v)} placeholder="e.g., 75" suffix="%" />
          <Field label="% of Held Appts that get Signed" value={snapshot.buyerConvHeldSigned} onSave={v => saveField('buyerConvHeldSigned', v)} placeholder="e.g., 60" suffix="%" />
          <Field label="% of Signed that Close" value={snapshot.buyerConvSignedClosed} onSave={v => saveField('buyerConvSignedClosed', v)} placeholder="e.g., 85" suffix="%" />
        </div>
        {goalBuyerUnits > 0 && buySetNeeded > 0 && (
          <>
            <div style={{ background: '#f8f7f5', borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 0, justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{buySetNeeded}</div>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Appts to Set</div>
                </div>
                <div style={{ fontSize: 20, color: '#ccc' }}>&rarr;</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{buyHeldNeeded}</div>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Appts Held</div>
                </div>
                <div style={{ fontSize: 20, color: '#ccc' }}>&rarr;</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{buySignedNeeded}</div>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Agreements Signed</div>
                </div>
                <div style={{ fontSize: 20, color: '#ccc' }}>&rarr;</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#5a7c65' }}>{goalBuyerUnits}</div>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Buyers Closed</div>
                </div>
              </div>
            </div>
            {/* Monthly & Weekly Breakdown */}
            <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#333' }}>Your Buyer Activity Targets</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, background: '#f8f7f5', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Per Month</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{(buySetNeeded / 12).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>appts to set</div>
                </div>
                <div style={{ flex: 1, background: '#f8f7f5', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Per Week</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{(buySetNeeded / 52).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>appts to set</div>
                </div>
                <div style={{ flex: 1, background: '#f8f7f5', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Monthly Closings</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#5a7c65' }}>{(goalBuyerUnits / 12).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>buyers closed</div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
