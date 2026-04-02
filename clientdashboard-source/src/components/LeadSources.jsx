import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

/* ═══ AUTO-SAVING TEXT FIELD ═══ */
function Field({ label, value, onSave, placeholder, multiline = false }) {
  const [val, setVal] = useState(value ?? '')
  const prevValue = useRef(value)
  const timer = useRef(null)

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value
      setVal(value ?? '')
    }
  }, [value])

  const handleChange = (e) => {
    const newVal = e.target.value
    setVal(newVal)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      prevValue.current = newVal
      onSave?.(newVal)
    }, 1200)
  }

  const handleBlur = () => {
    clearTimeout(timer.current)
    if (val !== prevValue.current) {
      prevValue.current = val
      onSave?.(val)
    }
  }

  const style = {
    width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
    fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
    ...(multiline ? { minHeight: 100 } : { minHeight: 44 }),
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      <textarea value={val} onChange={handleChange} onBlur={handleBlur} placeholder={placeholder} style={style} />
    </div>
  )
}

/* ═══ REPEATER LIST ═══ */
function RepeaterField({ label, items = [], onSave, placeholder }) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (!newItem.trim()) return
    const updated = [...items, newItem.trim()]
    onSave(updated)
    setNewItem('')
  }

  const removeItem = (idx) => {
    const updated = items.filter((_, i) => i !== idx)
    onSave(updated)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      {items.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              background: '#faf8f4', border: '1px solid #e5e2db', borderRadius: 6, marginBottom: 4,
            }}>
              <span style={{ flex: 1, fontSize: 13 }}>{item}</span>
              <button
                onClick={() => removeItem(i)}
                style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#c44', cursor: 'pointer', fontSize: 16 }}
              >&#10005;</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addItem() }}
          placeholder={placeholder}
          style={{ flex: 1, padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
        />
        <button onClick={addItem} style={{ padding: '8px 16px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Add</button>
      </div>
    </div>
  )
}

/* ═══ EXERCISE SECTION ═══ */
function Exercise({ number, title, prompt, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
          background: open ? '#1a1a1a' : '#fff', color: open ? '#fff' : '#1a1a1a', transition: 'all 0.2s',
        }}
      >
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: open ? '#D4D926' : '#f0ede8', color: open ? '#1a1a1a' : '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{number}</span>
        <span style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{title}</span>
        <span style={{ fontSize: 18, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>&#9660;</span>
      </div>
      {open && (
        <div style={{ padding: 20 }}>
          {prompt && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic', borderLeft: '3px solid #e5e2db', paddingLeft: 16 }}>{prompt}</p>}
          {children}
        </div>
      )}
    </div>
  )
}

/* ═══ LEAD SOURCE PERFORMANCE TABLE ═══ */
function PerformanceTable({ deals = [] }) {
  const performanceData = useMemo(() => {
    const grouped = {}
    let totalClosed = 0
    let totalGci = 0

    deals.forEach(deal => {
      if (deal.stage === 'closed' || deal.stage === 'Closed') {
        const source = deal.source || 'Unknown'
        if (!grouped[source]) {
          grouped[source] = { count: 0, gci: 0 }
        }
        grouped[source].count += 1
        grouped[source].gci += deal.gci || 0
        totalClosed += 1
        totalGci += deal.gci || 0
      }
    })

    return { grouped, totalClosed, totalGci }
  }, [deals])

  const sources = Object.keys(performanceData.grouped).sort()

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Lead Source Performance</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse', fontSize: 13,
          border: '1px solid #e5e2db'
        }}>
          <thead>
            <tr style={{ background: '#f9f7f3', borderBottom: '2px solid #e5e2db' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#555', borderRight: '1px solid #e5e2db' }}>Source</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#555', borderRight: '1px solid #e5e2db' }}># Closed</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#555', borderRight: '1px solid #e5e2db' }}>Total GCI</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#555' }}>Avg GCI/Deal</th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#999' }}>No closed deals found</td>
              </tr>
            ) : (
              <>
                {sources.map(source => {
                  const data = performanceData.grouped[source]
                  const avgGci = data.count > 0 ? (data.gci / data.count).toFixed(0) : 0
                  return (
                    <tr key={source} style={{ borderBottom: '1px solid #e5e2db' }}>
                      <td style={{ padding: '12px', borderRight: '1px solid #e5e2db', fontWeight: 500 }}>{source}</td>
                      <td style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid #e5e2db' }}>{data.count}</td>
                      <td style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid #e5e2db' }}>${data.gci.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>${avgGci.toLocaleString('en-US')}</td>
                    </tr>
                  )
                })}
                <tr style={{ background: '#f9f7f3', borderTop: '2px solid #e5e2db', fontWeight: 600 }}>
                  <td style={{ padding: '12px', borderRight: '1px solid #e5e2db' }}>TOTAL</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid #e5e2db' }}>{performanceData.totalClosed}</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid #e5e2db' }}>${performanceData.totalGci.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    ${performanceData.totalClosed > 0 ? (performanceData.totalGci / performanceData.totalClosed).toFixed(0).toLocaleString('en-US') : '0'}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */
export default function LeadSources({ hubData, onSave }) {
  // Data extraction with fallback logic
  const allData = hubData?.allData || {}
  const leadSourcesData = allData?.['lead-sources'] || {}
  const metaData = hubData?._meta?.leadSources || {}

  // Use allData as primary, fallback to _meta
  // Sources can be stored as: sources['source-list'] (rebuild) or sources (array, original) or metaData.sourceList
  const rawSources = leadSourcesData.sources
  const sourceList = Array.isArray(rawSources) ? rawSources
    : rawSources?.['source-list'] || metaData.sourceList || []
  const nurturePlan = leadSourcesData.strategy?.nurturePlan || leadSourcesData.nurturePlan || metaData.nurturePlan || ''
  const bestRoi = leadSourcesData.bestRoi || metaData.bestRoi || ''
  const worstRoi = leadSourcesData.worstRoi || metaData.worstRoi || ''

  // Pipeline/deals data
  const deals = allData?.pipeline?.deals || hubData?._meta?.pipeline || []

  const saveAllData = useCallback((updates) => {
    onSave({ allData: { ...hubData.allData, 'lead-sources': updates } })
  }, [hubData.allData, onSave])

  const saveMeta = useCallback((key, val) => {
    // Dual save to both allData and _meta for consistency
    onSave({
      allData: {
        ...hubData.allData,
        'lead-sources': {
          ...leadSourcesData,
          [key]: val
        }
      },
      _meta: { leadSources: { [key]: val } }
    })
  }, [hubData.allData, leadSourcesData, onSave])

  const handleSourceListSave = useCallback((newList) => {
    saveAllData({
      ...leadSourcesData,
      sources: { 'source-list': newList },
    })
  }, [leadSourcesData, saveAllData])

  const handleNurturePlanSave = useCallback((val) => {
    saveAllData({
      ...leadSourcesData,
      strategy: { nurturePlan: val },
    })
  }, [leadSourcesData, saveAllData])

  return (
    <div>
      {/* Lead Source Performance Table */}
      <PerformanceTable deals={deals} />

      {/* Your Lead Sources */}
      <Exercise
        number={1}
        title="Your Lead Sources"
        prompt="Where are your clients actually coming from? Be ruthless about tracking this. If you can't measure it, you can't grow it. Every dollar and every hour you spend on lead generation should be justified by the numbers below."
        defaultOpen={true}
      >
        <RepeaterField
          label="Active Lead Sources"
          items={sourceList}
          onSave={handleSourceListSave}
          placeholder="e.g., Sphere of Influence, Zillow, Agent Referral, Open Houses, Website Sign Up"
        />
        <Field
          label="Which Source Gives You the Best ROI?"
          value={bestRoi}
          onSave={(val) => saveMeta('bestRoi', val)}
          placeholder="Look at cost vs. closings. Which source is actually putting money in your pocket, not just leads in your CRM?"
          multiline
        />
        <Field
          label="Which Source Are You Spending On That Isn't Working?"
          value={worstRoi}
          onSave={(val) => saveMeta('worstRoi', val)}
          placeholder="This is the hard one. What are you paying for out of habit, fear, or hope? Be honest."
          multiline
        />
      </Exercise>

      {/* Nurture Plan */}
      <Exercise
        number={2}
        title="Lead Nurture Plan"
        prompt="A lead without follow-up is just a name on a list. What happens after someone raises their hand?"
      >
        <Field
          label="What Happens When a Lead Comes In?"
          value={nurturePlan}
          onSave={handleNurturePlanSave}
          placeholder="Speed to lead matters. What's your first 5 minutes look like? First 24 hours? First week?"
          multiline
        />
      </Exercise>
    </div>
  )
}
