import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══ AUTO-SAVING TEXTAREA ═══ */
function TextAreaField({ value, onSave, label, placeholder, readOnly = false, helper }) {
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

  return (
    <div style={{ flex: 1 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>}
      <textarea
        value={val}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #e8e8e8',
          fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s', resize: 'vertical', minHeight: 100,
          background: readOnly ? '#fafafa' : '#fff',
        }}
        onFocus={e => { if (!readOnly) e.target.style.borderColor = '#5a7c65' }}
        onBlur={e => { e.target.style.borderColor = '#e8e8e8'; handleBlur() }}
      />
      {helper && <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>{helper}</div>}
    </div>
  )
}

/* ═══ TEXT INPUT ═══ */
function TextField({ value, onSave, label, placeholder, readOnly = false }) {
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

  return (
    <div style={{ flex: 1 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>}
      <input
        type="text"
        value={val}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid #e8e8e8',
          fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
          background: readOnly ? '#fafafa' : '#fff',
        }}
        onFocus={e => { if (!readOnly) e.target.style.borderColor = '#5a7c65' }}
        onBlur={e => { e.target.style.borderColor = '#e8e8e8'; handleBlur() }}
      />
    </div>
  )
}

/* ═══ CARD COMPONENT ═══ */
function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.06)', ...style }}>
      {children}
    </div>
  )
}

/* ═══ SECTION HEADER ═══ */
function SectionHeader({ children }) {
  return (
    <div style={{ background: '#1a1a1a', color: '#fff', padding: '12px 20px', borderRadius: '8px 8px 0 0', margin: '-24px -24px 20px', fontSize: 16, fontWeight: 700 }}>
      {children}
    </div>
  )
}

/* ═══ AUDIENCE SIDEBAR ═══ */
function AudienceSidebar({ audiences, selectedId, onSelect, onAdd, onDelete }) {
  return (
    <div style={{ width: 180, borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column' }}>
      <button
        onClick={onAdd}
        style={{
          margin: '8px 8px 4px', padding: '10px 12px', background: '#5a7c65', color: '#fff', border: 'none',
          borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        + Add Audience
      </button>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {audiences.map((aud) => (
          <div
            key={aud.id}
            style={{
              padding: '12px 12px', cursor: 'pointer', borderLeft: aud.id === selectedId ? '4px solid #D4D926' : '4px solid transparent',
              background: aud.id === selectedId ? '#fffdf0' : 'transparent', transition: 'all 0.2s',
              position: 'relative',
            }}
            onClick={() => onSelect(aud.id)}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9f9f9' }}
            onMouseLeave={e => { e.currentTarget.style.background = aud.id === selectedId ? '#fffdf0' : 'transparent' }}
          >
            <div style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{aud.name || 'Untitled'}</div>
            {audiences.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(aud.id) }}
                style={{
                  position: 'absolute', right: 8, top: 8, background: 'none', border: 'none',
                  color: '#999', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0,
                  opacity: 0,
                }}
                onMouseEnter={e => { e.target.style.opacity = '1'; e.target.style.color = '#c44' }}
                onMouseLeave={e => { e.target.style.opacity = '0' }}
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */
export default function TargetAudience({ hubData, onSave }) {
  // Check multiple possible storage locations:
  // Original app stores in allData['target-audience'].audiences
  // New component saves to _meta.audiences
  const audiences = hubData?._meta?.audiences
    ?? hubData?.allData?.['target-audience']?.audiences
    ?? hubData?.audiences
    ?? hubData?._meta?.targetAudience
    ?? []
  const allData = hubData?.allData || {}
  const [selectedId, setSelectedId] = useState(audiences[0]?.id || null)

  const selectedAudience = audiences.find(a => a.id === selectedId) || audiences[0]

  const saveAudiences = useCallback((updatedAudiences) => {
    onSave({
      _meta: { audiences: updatedAudiences },
      allData: { ...allData, 'target-audience': { ...(allData['target-audience'] || {}), audiences: updatedAudiences } }
    })
  }, [onSave, allData])

  const handleFieldSave = useCallback((fieldKey, value) => {
    const updated = audiences.map(a =>
      a.id === selectedId ? { ...a, [fieldKey]: value } : a
    )
    saveAudiences(updated)
  }, [audiences, selectedId, saveAudiences])

  const handleAddAudience = useCallback(() => {
    const newId = Date.now().toString()
    const newAudience = {
      id: newId,
      name: 'New Audience',
      who: '',
      feeling: '',
      dayToDay: '',
      tried: '',
      chooseYou: '',
      keptUpNight: '',
      howSolve: '',
      whereOnline: '',
      whereMarket: '',
      howDecide: '',
    }
    const updated = [...audiences, newAudience]
    saveAudiences(updated)
    setSelectedId(newId)
  }, [audiences, saveAudiences])

  const handleDeleteAudience = useCallback((id) => {
    if (audiences.length <= 1) return
    const updated = audiences.filter(a => a.id !== id)
    saveAudiences(updated)
    setSelectedId(updated[0]?.id || null)
  }, [audiences, saveAudiences])

  const getExportLines = useCallback(() => {
    if (!selectedAudience) return []
    const lines = [
      `TARGET AUDIENCE: ${(selectedAudience.name || 'Untitled').toUpperCase()}`,
      '==================================================',
      '',
    ]
    const fields = [
      { key: 'who', label: 'Who They Are' },
      { key: 'feeling', label: 'What They Are Feeling' },
      { key: 'dayToDay', label: 'What Their Day-to-Day Looks Like' },
      { key: 'tried', label: 'What They Have Tried Before' },
      { key: 'chooseYou', label: 'Why They Choose You Specifically' },
      { key: 'keptUpNight', label: 'What Keeps Them Up At Night' },
      { key: 'howSolve', label: 'How You Solve It' },
      { key: 'whereOnline', label: 'Where They Spend Time Online' },
      { key: 'whereMarket', label: 'Where They Are in Your Market' },
      { key: 'howDecide', label: 'How They Make Decisions' },
    ]

    fields.forEach(({ key, label }) => {
      if (selectedAudience[key]) {
        lines.push(label)
        lines.push('------------------------------')
        lines.push(selectedAudience[key])
        lines.push('')
      }
    })
    return lines
  }, [selectedAudience])

  const handleExportTxt = useCallback(() => {
    const lines = getExportLines()
    if (!lines.length) return
    const text = lines.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedAudience.name || 'Audience'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [selectedAudience, getExportLines])

  const handleExportPdf = useCallback(() => {
    const lines = getExportLines()
    if (!lines.length) return
    // Build a simple HTML doc and use print-to-PDF
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${selectedAudience.name || 'Audience'}</title>
      <style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#1a1a1a;}
      h1{font-size:24px;border-bottom:2px solid #333;padding-bottom:8px;}
      h2{font-size:16px;color:#555;margin-top:24px;margin-bottom:4px;}
      p{font-size:14px;line-height:1.6;margin:0 0 16px;}
      hr{border:none;border-top:1px solid #ddd;margin:8px 0;}</style></head><body>`
      + `<h1>${selectedAudience.name || 'Untitled'}</h1>`
      + [
        { key: 'who', label: 'Who They Are' },
        { key: 'feeling', label: 'What They Are Feeling' },
        { key: 'dayToDay', label: 'What Their Day-to-Day Looks Like' },
        { key: 'tried', label: 'What They Have Tried Before' },
        { key: 'chooseYou', label: 'Why They Choose You Specifically' },
        { key: 'keptUpNight', label: 'What Keeps Them Up At Night' },
        { key: 'howSolve', label: 'How You Solve It' },
        { key: 'whereOnline', label: 'Where They Spend Time Online' },
        { key: 'whereMarket', label: 'Where They Are in Your Market' },
        { key: 'howDecide', label: 'How They Make Decisions' },
      ].filter(f => selectedAudience[f.key]).map(f => `<h2>${f.label}</h2><p>${selectedAudience[f.key].replace(/\n/g, '<br>')}</p>`).join('')
      + '</body></html>'

    const printWindow = window.open('', '_blank')
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => { printWindow.print() }, 500)
  }, [selectedAudience, getExportLines])

  if (!selectedAudience) {
    return <div style={{ padding: 40 }}>No audiences yet</div>
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fafafa' }}>
      <AudienceSidebar
        audiences={audiences}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={handleAddAudience}
        onDelete={handleDeleteAudience}
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
          {/* Header with Export */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', margin: 0, marginBottom: 8 }}>Target Audience</h1>
              <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.6, maxWidth: 600 }}>
                Map out your ideal audiences using the Message Mapping framework. Who are they really? What are they going through? Where do they spend their time and how do they make decisions?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleExportTxt}
                style={{
                  padding: '10px 16px', background: '#5a7c65', color: '#fff', border: 'none',
                  borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Export TXT
              </button>
              <button
                onClick={handleExportPdf}
                style={{
                  padding: '10px 16px', background: '#1a1a1a', color: '#fff', border: 'none',
                  borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Export PDF
              </button>
            </div>
          </div>

          {/* Audience Name */}
          <Card>
            <TextField
              value={selectedAudience.name}
              onSave={(val) => handleFieldSave('name', val)}
              label="Audience Name"
              placeholder="e.g., First-Time Buyer, Move-Up Seller"
            />
          </Card>

          {/* WHO SECTION */}
          <Card style={{ background: '#fdf8e8' }}>
            <SectionHeader>WHO</SectionHeader>
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>
                Stop thinking in demographics and start thinking in situations. The agents who connect most with their audience are not the ones who know their client's age bracket. They are the ones who understand exactly what their client is going through right now.
              </p>

              {/* 2-column grid: who + feeling */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <TextAreaField
                  value={selectedAudience.who}
                  onSave={(val) => handleFieldSave('who', val)}
                  label="Who They Are"
                  placeholder="Who is this person? Age, background, life stage, profession..."
                />
                <TextAreaField
                  value={selectedAudience.feeling}
                  onSave={(val) => handleFieldSave('feeling', val)}
                  label="What They Are Feeling"
                  placeholder="What emotions are they experiencing? Excited? Anxious? Overwhelmed?"
                />
              </div>

              {/* 2-column grid: dayToDay + tried */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <TextAreaField
                  value={selectedAudience.dayToDay}
                  onSave={(val) => handleFieldSave('dayToDay', val)}
                  label="What Their Day-to-Day Looks Like"
                  placeholder="What's their daily routine like? Where are they spending time?"
                />
                <TextAreaField
                  value={selectedAudience.tried}
                  onSave={(val) => handleFieldSave('tried', val)}
                  label="What They Have Tried Before"
                  placeholder="What have they already attempted? What solutions have they tried?"
                />
              </div>

              {/* Full width: chooseYou */}
              <TextAreaField
                value={selectedAudience.chooseYou}
                onSave={(val) => handleFieldSave('chooseYou', val)}
                label="Why They Choose You Specifically"
                placeholder="What is it about YOU that makes this audience want to work with you over anyone else?"
              />
            </div>
          </Card>

          {/* WHAT SECTION */}
          <Card>
            <SectionHeader>WHAT</SectionHeader>
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <TextAreaField
                  value={selectedAudience.keptUpNight}
                  onSave={(val) => handleFieldSave('keptUpNight', val)}
                  label="What Keeps Them Up At Night"
                  placeholder="What are they worried about? What questions are they asking?"
                  helper="Write their fears, frustrations, and the questions they are Googling at 11pm. Use their actual words, not your industry language."
                />
                <TextAreaField
                  value={selectedAudience.howSolve}
                  onSave={(val) => handleFieldSave('howSolve', val)}
                  label="How You Solve It"
                  placeholder="What is your specific solution or process?"
                  helper="For each problem, write the specific thing you do that addresses it. Not a generic answer. The actual thing."
                />
              </div>
            </div>
          </Card>

          {/* WHERE SECTION */}
          <Card>
            <SectionHeader>WHERE</SectionHeader>
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                <TextAreaField
                  value={selectedAudience.whereOnline}
                  onSave={(val) => handleFieldSave('whereOnline', val)}
                  label="Where They Spend Time Online"
                  placeholder="Instagram, Facebook, LinkedIn, Reddit, TikTok, podcasts..."
                />
                <TextAreaField
                  value={selectedAudience.whereMarket}
                  onSave={(val) => handleFieldSave('whereMarket', val)}
                  label="Where They Are in Your Market"
                  placeholder="What neighborhoods, price points, or areas are they looking in?"
                />
                <TextAreaField
                  value={selectedAudience.howDecide}
                  onSave={(val) => handleFieldSave('howDecide', val)}
                  label="How They Make Decisions"
                  placeholder="Are they data-driven? Emotional? Do they ask friends? Hire advisors?"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
