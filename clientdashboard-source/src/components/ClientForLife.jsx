import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import WorkflowEditor from './WorkflowEditor'
import EventPlanner from './EventPlanner'

/* ═══ PHASE DEFINITIONS ═══ */
const PHASES = [
  { key: 'post-close', label: 'Immediately Post Close', icon: 'clock', desc: 'What happens the moment the deal closes. Set the tone for a lifelong relationship.' },
  { key: '90-days', label: 'First 90 Days', icon: 'clock', desc: 'The critical window. Stay top of mind while the experience is still fresh.' },
  { key: 'monthly', label: 'Monthly Touches', icon: 'envelope', desc: 'Consistent value every month. Not salesy, just present and helpful.' },
  { key: 'quarterly', label: 'Quarterly Touches', icon: 'refresh', desc: 'Deeper check-ins every quarter. CMA updates, market insights, personal milestones.' },
  { key: 'annual', label: 'Annual Touches', icon: 'star', desc: 'Anniversary celebrations, year-in-review, annual home checkup reminders.' },
  { key: 'personal', label: 'Personal Touches', icon: 'heart', desc: 'Birthdays, anniversaries, life events. The things that make people feel seen.' },
  { key: 'events', label: 'Events & Pop-Bys', icon: 'calendar', desc: 'Client appreciation events, pop-by gifts, community gatherings.' },
]

/* ═══ ICON RENDERER ═══ */
function IconSpan({ type, size = 20 }) {
  const style = { display: 'inline-block', width: size, height: size }
  switch (type) {
    case 'clock':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    case 'envelope':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 6-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 6" />
        </svg>
      )
    case 'refresh':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36" />
        </svg>
      )
    case 'star':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 10.26 23.77 11.36 17.88 17.15 19.54 25.88 12 21.77 4.46 25.88 6.12 17.15 0.23 11.36 8.91 10.26" />
        </svg>
      )
    case 'heart':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    default:
      return null
  }
}

/* ═══ AUTO-SAVING TEXTAREA ═══ */
function NotesField({ value, onSave, placeholder }) {
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
    }, 1000)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Notes</label>
      <textarea
        value={val}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: 80,
          padding: '10px 12px',
          border: '2px solid #e8e8e8',
          borderRadius: 8,
          fontSize: 13,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          resize: 'vertical',
        }}
      />
    </div>
  )
}

/* ═══ TOUCHPOINT ITEM ═══ */
function TouchPoint({ item, onUpdate, onDelete }) {
  const [what, setWhat] = useState(item.what || '')
  const [when, setWhen] = useState(item.when || '')
  const [how, setHow] = useState(item.how || '')
  const [owner, setOwner] = useState(item.ownerType || 'agent')
  const timer = useRef(null)

  useEffect(() => {
    setWhat(item.what || '')
    setWhen(item.when || '')
    setHow(item.how || '')
    setOwner(item.ownerType || 'agent')
  }, [item])

  const save = (overrides = {}) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      onUpdate({ ...item, what, when, how, ownerType: owner, ...overrides })
    }, 800)
  }

  const OWNER_COLORS = {
    agent: { bg: 'rgb(195, 213, 159)', text: '#2d3e1f' },
    admin: { bg: 'rgb(236, 152, 163)', text: '#5c1a24' },
    automated: { bg: 'rgb(250, 226, 223)', text: '#6b3a34' },
  }

  const ownerStyle = OWNER_COLORS[owner] || OWNER_COLORS.agent

  return (
    <div style={{ padding: 16, background: '#fff', border: '1px solid rgb(243, 242, 240)', borderRadius: 8, marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
        <select
          value={owner}
          onChange={(e) => { setOwner(e.target.value); save({ ownerType: e.target.value }) }}
          style={{ padding: '6px 8px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, background: ownerStyle.bg, color: ownerStyle.text, cursor: 'pointer', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
          <option value="automated">Automated</option>
        </select>
        <input
          value={what}
          onChange={(e) => { setWhat(e.target.value); save({ what: e.target.value }) }}
          placeholder="What needs to happen?"
          style={{ flex: 1, padding: '6px 10px', border: '2px solid #e8e8e8', borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
        />
        <button
          onClick={onDelete}
          style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid #ddd', color: '#c44', borderRadius: '50%', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}
        >
          ×
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input
          value={when}
          onChange={(e) => { setWhen(e.target.value); save({ when: e.target.value }) }}
          placeholder="When? e.g., Day 1, Week 2, Monthly"
          style={{ padding: '6px 10px', border: '2px solid #e8e8e8', borderRadius: 6, fontSize: 12, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
        />
        <input
          value={how}
          onChange={(e) => { setHow(e.target.value); save({ how: e.target.value }) }}
          placeholder="How? e.g., Email, Text, Handwritten Card"
          style={{ padding: '6px 10px', border: '2px solid #e8e8e8', borderRadius: 6, fontSize: 12, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
        />
      </div>
    </div>
  )
}

/* ═══ PHASE BUILDER VIEW ═══ */
function PhaseBuilder({ phase, data, onSave, onBack }) {
  // Defensive: handle multiple possible data structures for touchpoints
  const touchPoints = data.touchPoints || data.nodes || data.steps || []

  const saveTouchPoints = (updated) => {
    // Preserve original data structure key if it exists
    const key = data.touchPoints !== undefined ? 'touchPoints' :
                data.nodes !== undefined ? 'nodes' :
                data.steps !== undefined ? 'steps' : 'touchPoints'
    onSave({ ...data, [key]: updated })
  }

  const addTouchPoint = () => {
    const newTP = {
      id: Date.now().toString(),
      what: '',
      when: '',
      how: '',
      ownerType: 'agent',
    }
    saveTouchPoints([...touchPoints, newTP])
  }

  const updateTouchPoint = (updated) => {
    saveTouchPoints(touchPoints.map(tp => tp.id === updated.id ? updated : tp))
  }

  const deleteTouchPoint = (id) => {
    saveTouchPoints(touchPoints.filter(tp => tp.id !== id))
  }

  return (
    <div>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', background: 'none', border: 'none', color: '#5a7c65', cursor: 'pointer', fontWeight: 600, fontSize: 13, marginBottom: 20 }}
      >
        ← Back to Client for Life
      </button>

      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'rgb(26, 26, 26)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>{phase.label}</h2>
      <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 24, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>{phase.desc}</p>

      <div style={{ marginBottom: 24 }}>
        <div style={{ background: 'rgb(26, 26, 26)', color: '#fff', padding: '14px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          Touchpoints ({touchPoints.length})
        </div>
        {touchPoints.map((tp) => (
          <TouchPoint
            key={tp.id}
            item={tp}
            onUpdate={updateTouchPoint}
            onDelete={() => deleteTouchPoint(tp.id)}
          />
        ))}
        <button
          onClick={addTouchPoint}
          style={{ width: '100%', padding: '12px 20px', background: 'rgb(26, 26, 26)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          + Add Touchpoint
        </button>
      </div>

      <NotesField
        value={data.notes}
        onSave={(val) => onSave({ ...data, notes: val })}
        placeholder="Add your ideas, reminders, or strategy notes for this phase..."
      />
    </div>
  )
}

/* ═══ SPOKE WHEEL VIEW ═══ */
function SpokeWheelView({ data, onPhaseClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, marginBottom: 40 }}>
      {/* Wheel Container */}
      <div style={{ position: 'relative', width: 620, height: 620, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Central Circle */}
        <div
          style={{
            position: 'absolute',
            width: 140,
            height: 140,
            background: 'rgb(26, 26, 26)',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            gap: 6,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          <svg style={{ width: 24, height: 24, color: '#fff', flexShrink: 0 }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, textAlign: 'center', letterSpacing: 0.5 }}>CLIENT FOR LIFE</div>
        </div>

        {/* Spokes (Dashed Lines) */}
        <svg
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          viewBox="0 0 620 620"
        >
          {PHASES.map((_, idx) => {
            const angle = (idx * 360) / PHASES.length - 90
            const rad = (angle * Math.PI) / 180
            const x2 = 310 + 215 * Math.cos(rad)
            const y2 = 310 + 215 * Math.sin(rad)
            return (
              <line
                key={`spoke-${idx}`}
                x1="310"
                y1="310"
                x2={x2}
                y2={y2}
                stroke="rgb(200, 200, 200)"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            )
          })}
        </svg>

        {/* Spoke Circles */}
        {PHASES.map((phase, idx) => {
          const angle = (idx * 360) / PHASES.length - 90
          const rad = (angle * Math.PI) / 180
          const radius = 215
          const x = 310 + radius * Math.cos(rad)
          const y = 310 + radius * Math.sin(rad)

          return (
            <button
              key={phase.key}
              onClick={() => onPhaseClick(phase.key)}
              style={{
                position: 'absolute',
                left: `${(x / 620) * 100}%`,
                top: `${(y / 620) * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: '#e8e8e8',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
                gap: 5,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#d8d8d8'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#e8e8e8'
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ color: 'rgb(26, 26, 26)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconSpan type={phase.icon} size={26} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgb(26, 26, 26)', textAlign: 'center', lineHeight: 1.2, paddingX: 8 }}>
                {phase.label}
              </div>
              <div style={{ fontSize: 9, color: '#999', fontWeight: 500 }}>click to build →</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ═══ STATUS BADGE ═══ */
function StatusBadge({ status }) {
  const colors = {
    Active: { bg: '#e8f5e9', text: '#2e7d32' },
    VIP: { bg: '#fdf6e3', text: '#b8860b' },
    Nurturing: { bg: '#e3f2fd', text: '#1565c0' },
    Inactive: { bg: '#f5f5f5', text: '#999' },
  }
  const c = colors[status] || colors.Active
  return (
    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: c.bg, color: c.text }}>{status}</span>
  )
}

const CLIENT_STATUSES = ['Active', 'VIP', 'Nurturing', 'Inactive']

/* ═══ EDITABLE CLIENT ROW ═══ */
function EditableClientRow({ client, onUpdate, onDelete, allClients = [], pipelineData = [] }) {
  const [editing, setEditing] = useState(!client.name)
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState({ ...client })
  const timer = useRef(null)

  // Calculate referral tracking
  const referredBy = client.referredBy ? [client.referredBy] : []
  const hasReferred = allClients
    .filter(c => c.referredBy && c.referredBy.toLowerCase() === (client.name || '').toLowerCase())
    .map(c => c.name)
    .filter(Boolean)
  const pipelineReferred = pipelineData
    .filter(d => d.leadSource === 'Client Referral' && d.clientReferral && d.clientReferral.toLowerCase() === (client.name || '').toLowerCase())
    .map(d => d.clientName)
    .filter(Boolean)

  const save = (updates) => {
    const updated = { ...form, ...updates }
    setForm(updated)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onUpdate(updated), 800)
  }

  const isSOI = client.type === 'soi'

  if (!editing) {
    return (
      <>
        <tr style={{ borderBottom: '1px solid rgb(243, 242, 240)', cursor: 'pointer' }}>
          <td style={{ padding: '10px 12px', fontWeight: 500, cursor: 'pointer' }} onClick={() => setEditing(true)}>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: 6, fontSize: 12, fontWeight: 700 }}
            >
              {expanded ? '▼' : '▶'}
            </button>
            {client.name || '—'}
          </td>
          <td style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => setEditing(true)}>{client.closeDate || '—'}</td>
          <td style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => setEditing(true)}>{isSOI ? 'SOI' : 'Client'}</td>
          <td style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => setEditing(true)}><StatusBadge status={client.status || 'Active'} /></td>
          {!isSOI && <td style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => setEditing(true)}>{client.clientType || '—'}</td>}
          {isSOI && (
            <td style={{ padding: '10px 12px', fontSize: 12, color: '#5a7c65', cursor: 'pointer', fontWeight: 600 }} onClick={() => setEditing(true)}>
              {client.referralNames?.length || 0} referred
            </td>
          )}
          <td style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => setEditing(true)}>{client.referredBy || '—'}</td>
          <td style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => setEditing(true)}>{client.referrals || 0}</td>
        </tr>
        {expanded && (hasReferred.length > 0 || pipelineReferred.length > 0 || referredBy.length > 0) && (
          <tr style={{ borderBottom: '1px solid rgb(243, 242, 240)', background: '#f9f9f9' }}>
            <td colSpan="8" style={{ padding: '12px 20px', fontSize: 12, color: '#555' }}>
              {referredBy.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Referred by:</strong> {referredBy.join(', ')}
                </div>
              )}
              {(hasReferred.length > 0 || pipelineReferred.length > 0) && (
                <div>
                  <strong>Has referred:</strong> {[...hasReferred, ...pipelineReferred].filter(Boolean).join(', ') || 'None yet'}
                </div>
              )}
            </td>
          </tr>
        )}
      </>
    )
  }

  const inputStyle = { width: '100%', padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, boxSizing: 'border-box' }

  return (
    <tr style={{ borderBottom: '1px solid rgb(243, 242, 240)', background: '#fafaf9' }}>
      <td style={{ padding: '6px 8px' }}>
        <input style={inputStyle} value={form.name || ''} onChange={e => save({ name: e.target.value })} placeholder="Name" autoFocus />
      </td>
      <td style={{ padding: '6px 8px' }}>
        <input style={inputStyle} type="date" value={form.closeDate || ''} onChange={e => save({ closeDate: e.target.value })} />
      </td>
      <td style={{ padding: '6px 8px', fontSize: 12 }}>{isSOI ? 'SOI' : 'Client'}</td>
      <td style={{ padding: '6px 8px' }}>
        <select style={inputStyle} value={form.status || 'Active'} onChange={e => save({ status: e.target.value })}>
          {CLIENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      {!isSOI && (
        <td style={{ padding: '6px 8px' }}>
          <select style={inputStyle} value={form.clientType || ''} onChange={e => save({ clientType: e.target.value })}>
            <option value="">—</option>
            <option value="Buyer">Buyer</option>
            <option value="Seller">Seller</option>
            <option value="Buyer-Seller">Buyer-Seller</option>
            <option value="Investor">Investor</option>
          </select>
        </td>
      )}
      {isSOI && (
        <td style={{ padding: '6px 8px' }}>
          <input
            style={inputStyle}
            value={(form.referralNames || []).join(', ')}
            onChange={e => save({ referralNames: e.target.value.split(',').map(n => n.trim()).filter(n => n) })}
            placeholder="Names of referred clients (comma-separated)"
          />
        </td>
      )}
      <td style={{ padding: '6px 8px' }}>
        <input style={inputStyle} value={form.referredBy || ''} onChange={e => save({ referredBy: e.target.value })} placeholder="Who referred" />
      </td>
      <td style={{ padding: '6px 8px' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <input style={{ ...inputStyle, width: 40 }} type="number" min="0" value={form.referrals || 0} onChange={e => save({ referrals: parseInt(e.target.value) || 0 })} />
          <button onClick={() => { setEditing(false) }} style={{ fontSize: 11, padding: '3px 8px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Done</button>
          <button onClick={() => onDelete(client.id)} style={{ fontSize: 11, padding: '3px 8px', background: 'none', color: '#e53935', border: '1px solid #e53935', borderRadius: 4, cursor: 'pointer' }}>X</button>
        </div>
      </td>
    </tr>
  )
}

/* ═══ PAST CLIENTS & SOI ═══ */
function PastClientsSection({ pastClients, pipelineClients = [], onUpdate, onAddClient, onAddSOI }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  // Merge pipeline closed deals into past clients (auto-populate)
  const mergedClients = useMemo(() => {
    const manual = pastClients || []
    const existingNames = new Set(manual.map(c => (c.name || '').toLowerCase()))
    const fromPipeline = (pipelineClients || [])
      .filter(d => !existingNames.has((d.clientName || '').toLowerCase()))
      .map(d => ({
        id: `pipeline-${d.id}`,
        name: d.clientName,
        closeDate: d.closeDate || '',
        type: 'client',
        status: 'Active',
        clientType: d.dealType || '',
        address: d.address || '',
        referredBy: d.leadSource === 'Client Referral' ? (d.clientReferral || '') : (d.leadSource || ''),
        referrals: 0,
        fromPipeline: true,
      }))
    return [...manual, ...fromPipeline]
  }, [pastClients, pipelineClients])

  const clientCount = mergedClients.filter(c => c.type !== 'soi').length
  const soiCount = mergedClients.filter(c => c.type === 'soi').length
  const vipCount = mergedClients.filter(c => c.status === 'VIP').length

  const filtered = filter === 'all' ? mergedClients
    : filter === 'client' ? mergedClients.filter(c => c.type !== 'soi')
    : filter === 'soi' ? mergedClients.filter(c => c.type === 'soi')
    : filter === 'vip' ? mergedClients.filter(c => c.status === 'VIP')
    : mergedClients

  return (
    <div style={{ marginTop: 40, borderTop: '1px solid rgb(243, 242, 240)', paddingTop: 24 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '14px 20px',
          background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8,
          cursor: 'pointer', fontWeight: 700, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <span>Past Clients & Sphere of Influence ({clientCount} clients, {soiCount} SOI{vipCount > 0 ? `, ${vipCount} VIP` : ''})</span>
        <span style={{ fontSize: 16 }}>{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={onAddClient} style={{ padding: '10px 16px', background: '#5a7c65', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Add Client</button>
            <button onClick={onAddSOI} style={{ padding: '10px 16px', background: '#8b9fa8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Add SOI Contact</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {[['all', 'All'], ['client', 'Clients'], ['soi', 'SOI'], ['vip', 'VIP']].map(([key, label]) => (
                <button key={key} onClick={() => setFilter(key)} style={{
                  padding: '5px 12px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: filter === key ? '#1a1a1a' : '#f3f2f0',
                  color: filter === key ? '#fff' : '#555',
                  border: 'none',
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgb(243, 242, 240)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#555' }}>Name</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#555' }}>Close Date</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#555' }}>Type</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#555' }}>Status</th>
                  {filter !== 'soi' && <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#555' }}>Client Type</th>}
                  {filter === 'soi' && <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#555' }}>Referral Names</th>}
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#555' }}>Referred By</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#555' }}>Referrals</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((client, idx) => (
                    <EditableClientRow
                      key={client.id || idx}
                      client={client}
                      onUpdate={(updated) => onUpdate(updated)}
                      onDelete={(id) => onUpdate(null, id)}
                      allClients={mergedClients}
                      pipelineData={pipelineClients}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={filter === 'soi' ? 7 : 7} style={{ padding: '16px 12px', textAlign: 'center', color: '#999' }}>
                      {filter !== 'all' ? `No ${filter === 'vip' ? 'VIP' : filter} contacts` : 'No clients or contacts yet. Closed deals will automatically appear here.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */
export default function ClientForLife({ hubData, onSave, onNavigate }) {
  const [activePhaseKey, setActivePhaseKey] = useState(null)

  // Read from allData first, then fall back to _meta
  const allData = hubData?.allData || {}
  const cflData = useMemo(() => {
    const base = { ...allData['client-for-life'] || hubData?._meta?.clientForLife || {} }
    // Merge in individual cfl-* keys - prioritize direct cfl-* keys over merged structure
    PHASES.forEach(p => {
      const cflKey = `cfl-${p.key}`
      if (allData[cflKey]) {
        base[p.key] = allData[cflKey]
      }
    })
    return base
  }, [allData, hubData])
  const pastClients = cflData.pastClients || hubData?.pastClients || []

  // Get closed pipeline deals to auto-populate
  const pipelineClients = useMemo(() => {
    const deals = allData?.pipeline?.deals || hubData?._meta?.pipeline || []
    if (!Array.isArray(deals)) return []
    return deals.filter(d => d.stage === 'Closed' && d.clientName)
  }, [allData, hubData])

  const saveCflData = useCallback(
    (updated) => {
      onSave({
        _meta: { clientForLife: updated },
        allData: { 'client-for-life': updated },
      })
    },
    [onSave]
  )

  const savePhaseData = useCallback(
    (phaseKey, phaseData) => {
      const updated = { ...cflData, [phaseKey]: phaseData }
      const cflKey = `cfl-${phaseKey}`
      onSave({
        _meta: { clientForLife: updated },
        allData: { 'client-for-life': updated, [cflKey]: phaseData },
      })
    },
    [cflData, onSave]
  )

  const addClient = () => {
    const newClient = { id: Date.now().toString(), name: '', closeDate: '', type: 'client', status: 'Active', clientType: '', referredBy: '', referrals: 0 }
    saveCflData({ ...cflData, pastClients: [...pastClients, newClient] })
  }

  const addSOI = () => {
    const newSOI = { id: Date.now().toString(), name: '', closeDate: '', type: 'soi', status: 'Active', clientType: '', referredBy: '', referrals: 0 }
    saveCflData({ ...cflData, pastClients: [...pastClients, newSOI] })
  }

  const updateClient = (updatedClient, deleteId) => {
    if (deleteId) {
      // Delete
      saveCflData({ ...cflData, pastClients: pastClients.filter(c => c.id !== deleteId) })
    } else if (updatedClient) {
      // If from pipeline, add to manual list
      if (updatedClient.fromPipeline) {
        const clean = { ...updatedClient }
        delete clean.fromPipeline
        saveCflData({ ...cflData, pastClients: [...pastClients, clean] })
      } else {
        // Update existing
        const exists = pastClients.find(c => c.id === updatedClient.id)
        if (exists) {
          saveCflData({ ...cflData, pastClients: pastClients.map(c => c.id === updatedClient.id ? updatedClient : c) })
        } else {
          saveCflData({ ...cflData, pastClients: [...pastClients, updatedClient] })
        }
      }
    }
  }

  if (activePhaseKey) {
    const phase = PHASES.find(p => p.key === activePhaseKey)
    if (!phase) return null

    // Read phase data from allData cfl-* key first, then fall back to cflData
    const cflKey = `cfl-${activePhaseKey}`
    const phaseData = allData[cflKey] || cflData[activePhaseKey] || {}

    // For events phase, render EventPlanner (when available)
    // For all other phases, render WorkflowEditor
    const isEventPhase = activePhaseKey === 'events'

    return (
      <div>
        <button
          onClick={() => setActivePhaseKey(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', background: 'none', border: 'none', color: '#5a7c65', cursor: 'pointer', fontWeight: 600, fontSize: 13, marginBottom: 20 }}
        >
          ← Back to Client for Life
        </button>

        {isEventPhase ? (
          <EventPlanner hubData={hubData} onSave={onSave} />
        ) : (
          <WorkflowEditor
            pageKey={cflKey}
            hubData={hubData}
            onSave={onSave}
            onNavigate={onNavigate}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
          GROWTH
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'rgb(26, 26, 26)', marginBottom: 16 }}>Client for Life Program</h1>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6 }}>
          Your past clients are your most valuable asset. Click into each phase to build the workflow that keeps you top of mind forever. Closed deals from your pipeline automatically appear in your Past Clients list.
        </p>
      </div>

      <SpokeWheelView data={cflData} onPhaseClick={setActivePhaseKey} />

      <PastClientsSection
        pastClients={pastClients}
        pipelineClients={pipelineClients}
        onUpdate={updateClient}
        onAddClient={addClient}
        onAddSOI={addSOI}
      />
    </div>
  )
}
