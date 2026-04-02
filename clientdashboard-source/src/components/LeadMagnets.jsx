import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══ AUTO-SAVING TEXT FIELD ═══ */
function Field({ label, value, onSave, placeholder, multiline = false, helper = null }) {
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
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
        {label}
      </label>
      {helper && (
        <p style={{ fontSize: 12, color: '#999', fontStyle: 'italic', marginBottom: 6, margin: '4px 0 6px 0' }}>
          {helper}
        </p>
      )}
      <textarea value={val} onChange={handleChange} onBlur={handleBlur} placeholder={placeholder} style={style} />
    </div>
  )
}

/* ═══ DELIVERY METHOD SELECTOR ═══ */
function DeliveryMethodSelector({ selected, onChange }) {
  const methods = [
    { id: 'native-form', label: 'Native Website Form' },
    { id: 'crm-landing', label: 'CRM Landing Page / Form' },
    { id: 'third-party', label: 'Third-Party Landing Page' },
    { id: 'zapier', label: 'Zapier / Make Integration' },
    { id: 'manual', label: 'Manual / Not Automated Yet' },
  ]

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>
        How is the Lead Magnet Delivered?
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onChange(method.id)}
            style={{
              padding: '12px 12px',
              border: '2px solid #e8e8e8',
              borderRadius: 6,
              background: selected === method.id ? '#d4edda' : '#fff',
              color: selected === method.id ? '#155724' : '#555',
              borderColor: selected === method.id ? '#28a745' : '#e8e8e8',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: selected === method.id ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
          >
            {method.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ═══ EXPANDABLE SECTION ═══ */
function ExpandableSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 12px',
          background: '#f9f9f9',
          border: '1px solid #e8e8e8',
          borderRadius: 6,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          fontWeight: 600,
          color: '#555',
          textAlign: 'left',
        }}
      >
        {title}
        <span style={{ fontSize: 16, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ paddingTop: 12, borderLeft: '2px solid #e8e8e8', paddingLeft: 12, marginTop: 8 }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ═══ STATUS BADGE ═══ */
function StatusBadge({ isLive, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '8px 16px',
        borderRadius: 20,
        border: 'none',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        background: isLive ? '#d4edda' : '#f5f5f5',
        color: isLive ? '#155724' : '#999',
        transition: 'all 0.2s ease',
      }}
    >
      {isLive ? '✓ Live' : 'Not Live'}
    </button>
  )
}

/* ═══ MAGNET CARD ═══ */
function MagnetCard({ magnet, onUpdate, onDelete }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, padding: 20, marginBottom: 16 }}>
      {/* Header with name and delete button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <Field
            label="Lead Magnet Name + What is it?"
            value={magnet.name}
            onSave={(val) => onUpdate({ ...magnet, name: val })}
            placeholder="e.g., Email Marketing Hacks PDF Guide"
          />
        </div>
        <button
          onClick={onDelete}
          style={{
            marginLeft: 12,
            marginTop: 18,
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: '1px solid #ddd',
            color: '#c44',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Lead Magnet Notes */}
      <Field
        label="Lead Magnet Notes"
        value={magnet.notes}
        onSave={(val) => onUpdate({ ...magnet, notes: val })}
        placeholder="Key details about this magnet, performance notes, etc."
        multiline
        helper="What's special about this magnet? Any important context?"
      />

      {/* Landing Page URL */}
      <Field
        label="Landing Page URL"
        value={magnet.landingPageUrl}
        onSave={(val) => onUpdate({ ...magnet, landingPageUrl: val })}
        placeholder="https://example.com/checklist"
      />

      {/* Delivery Method */}
      <DeliveryMethodSelector
        selected={magnet.deliveryMethod}
        onChange={(method) => onUpdate({ ...magnet, deliveryMethod: method })}
      />

      {/* Third-Party Tool (conditional) */}
      {(magnet.deliveryMethod === 'crm-landing' || magnet.deliveryMethod === 'third-party' || magnet.deliveryMethod === 'zapier') && (
        <Field
          label="Third-Party Tool / Platform"
          value={magnet.thirdPartyTool}
          onSave={(val) => onUpdate({ ...magnet, thirdPartyTool: val })}
          placeholder="e.g., Leadpages, Unbounce, Zapier, Make, etc."
        />
      )}

      {/* Zapier Link (conditional) */}
      {magnet.deliveryMethod === 'zapier' && (
        <Field
          label="Zapier / Make Integration Link"
          value={magnet.zapierLink}
          onSave={(val) => onUpdate({ ...magnet, zapierLink: val })}
          placeholder="https://zapier.com/..."
        />
      )}

      {/* Automation Notes */}
      <Field
        label="Automation Notes"
        value={magnet.deliveryDetails}
        onSave={(val) => onUpdate({ ...magnet, deliveryDetails: val })}
        placeholder="How does the delivery work? What happens after signup? Any manual steps?"
        multiline
      />

      {/* Delivery Email (Expandable) */}
      <ExpandableSection title="Delivery Email">
        <Field
          label="Subject Line"
          value={magnet.deliveryEmailSubject}
          onSave={(val) => onUpdate({ ...magnet, deliveryEmailSubject: val })}
          placeholder="Your [Lead Magnet] is ready!"
        />

        <Field
          label="Email Body"
          value={magnet.deliveryEmailBody}
          onSave={(val) => onUpdate({ ...magnet, deliveryEmailBody: val })}
          placeholder="Dear [First Name],..."
          multiline
        />

        <Field
          label="Link to Actual Lead Magnet"
          value={magnet.description}
          onSave={(val) => onUpdate({ ...magnet, description: val })}
          placeholder="https://example.com/download/checklist-pdf"
          helper="The direct download or access link included in the email"
        />

        <Field
          label="Follow-Up Trigger"
          value={magnet.followUpTrigger}
          onSave={(val) => onUpdate({ ...magnet, followUpTrigger: val })}
          placeholder="e.g., After 3 days, send follow-up email"
        />
      </ExpandableSection>

      {/* Status and Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #e8e8e8' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Status</label>
        <StatusBadge
          isLive={magnet.isLive}
          onToggle={() => onUpdate({ ...magnet, isLive: !magnet.isLive })}
        />
      </div>
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */
export default function LeadMagnets({ hubData, onSave }) {
  // Read from allData structure first, with fallback to _meta
  const leadMagnetsData = hubData?.allData?.['lead-magnets'] || {
    magnets: [],
    websiteHost: '',
    deliveryNotes: '',
  }

  const magnets = leadMagnetsData.magnets || []
  const websiteHost = leadMagnetsData.websiteHost || ''
  const deliveryNotes = leadMagnetsData.deliveryNotes || ''

  const saveData = useCallback((updatedMagnets, updatedWebsiteHost, updatedDeliveryNotes) => {
    const updated = {
      magnets: updatedMagnets,
      websiteHost: updatedWebsiteHost,
      deliveryNotes: updatedDeliveryNotes,
    }
    onSave({ allData: { ...hubData.allData, 'lead-magnets': updated } })
  }, [onSave, hubData.allData])

  const addMagnet = () => {
    const newMagnet = {
      id: Date.now().toString(),
      name: '',
      notes: '',
      isLive: false,
      zapierLink: '',
      description: '',
      deliveryMethod: '',
      landingPageUrl: '',
      thirdPartyTool: '',
      deliveryDetails: '',
      deliveryEmailBody: '',
      deliveryEmailSubject: '',
      followUpTrigger: '',
    }
    saveData([...magnets, newMagnet], websiteHost, deliveryNotes)
  }

  const updateMagnet = (updated) => {
    saveData(
      magnets.map(m => m.id === updated.id ? updated : m),
      websiteHost,
      deliveryNotes
    )
  }

  const deleteMagnet = (id) => {
    saveData(
      magnets.filter(m => m.id !== id),
      websiteHost,
      deliveryNotes
    )
  }

  const liveCount = magnets.filter(m => m.isLive).length

  return (
    <div>
      <p style={{ fontSize: 15, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>
        Map out every lead magnet you have, where it lives, and how the delivery automation works. Every magnet should have a clear audience, a landing page, and a delivery sequence that turns downloads into conversations.
      </p>

      {/* ═══ WEBSITE SETUP SECTION ═══ */}
      <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 16, marginTop: 0 }}>
          Website Setup
        </h3>

        <Field
          label="Website Host / Platform"
          value={websiteHost}
          onSave={(val) => saveData(magnets, val, deliveryNotes)}
          placeholder="e.g., Webflow, WordPress, Wix, Squarespace, etc."
        />

        <Field
          label="Website URL"
          value={hubData?.allData?.['lead-magnets']?.websiteUrl || ''}
          onSave={(val) => {
            const updated = { ...leadMagnetsData, websiteUrl: val }
            onSave({ allData: { ...hubData.allData, 'lead-magnets': updated } })
          }}
          placeholder="https://example.com"
        />

        <Field
          label="General Notes on Website / Hosting / Limitations"
          value={deliveryNotes}
          onSave={(val) => saveData(magnets, websiteHost, val)}
          placeholder="Any constraints or setup notes for this hosting platform?"
          multiline
        />
      </div>

      {/* ═══ YOUR LEAD MAGNETS SECTION ═══ */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>
          Your Lead Magnets
        </h3>

        {magnets.length > 0 && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ padding: '12px 20px', background: '#d4edda', border: '1px solid #28a745', borderRadius: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#155724' }}>{liveCount}</span>
              <span style={{ color: '#155724', marginLeft: 8 }}>Live</span>
            </div>
            <div style={{ padding: '12px 20px', background: '#f5f5f5', border: '1px solid #e5e2db', borderRadius: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>{magnets.length}</span>
              <span style={{ color: '#555', marginLeft: 8 }}>Total</span>
            </div>
          </div>
        )}

        {magnets.map((magnet) => (
          <MagnetCard
            key={magnet.id}
            magnet={magnet}
            onUpdate={updateMagnet}
            onDelete={() => deleteMagnet(magnet.id)}
          />
        ))}

        {magnets.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: 40, background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, marginBottom: 16 }}>
            No lead magnets yet. Add your first one to start tracking your funnels.
          </div>
        )}
      </div>

      <button
        onClick={addMagnet}
        style={{
          width: '100%',
          padding: '14px 20px',
          background: '#1a1a1a',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 14,
          marginTop: 8,
        }}
      >
        + Add Lead Magnet
      </button>
    </div>
  )
}
