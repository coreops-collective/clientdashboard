import { useState, useEffect, useCallback, useRef, useMemo, Component } from 'react'
import { WORKFLOW_SOPS } from '../data/workflowSops'

/* ═══ ERROR BOUNDARY ═══ */
class WorkflowErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#c44' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Something went wrong loading this workflow.</div>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>{this.state.error?.message}</div>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Try Again</button>
        </div>
      )
    }
    return this.props.children
  }
}

/* ═══ CONSTANTS ═══ */

const OWNER_LABELS = {
  agent: 'Agent', admin: 'Admin', automated: 'Automated',
  tc: 'TC', ops: 'Ops', lender: 'Lender', title: 'Title',
}

const OWNER_OPTIONS = ['agent', 'admin', 'automated', 'tc', 'ops', 'lender', 'title']

const ROLE_COLORS = {
  agent: { bg: 'rgb(195, 213, 159)', text: '#2d3e1f' },
  admin: { bg: 'rgb(236, 152, 163)', text: '#1a1a1a' },
  automated: { bg: 'rgb(250, 226, 223)', text: '#1a1a1a' },
  tc: { bg: '#a8c5da', text: '#1a1a1a' },
  ops: { bg: '#d4b896', text: '#1a1a1a' },
  lender: { bg: '#b8c9a3', text: '#1a1a1a' },
  title: { bg: '#c9b8d4', text: '#1a1a1a' },
}

const SYSTEM_TAGS = [
  'CRM', 'Calendar', 'Canva/Design', 'Zoom/Video', 'Phone',
  'Document Signing', 'Email', 'MLS', 'Transaction Management',
  'Social Media', 'Website', 'Forms', 'File Storage',
]

const TASK_TAGS = ['Email Task', 'Remote', 'In-Person', 'Link Needed']

const TAG_COLORS = {
  'Email Task': { bg: 'rgba(25, 118, 210, 0.15)', color: '#1565c0', activeBg: '#1565c0', activeColor: '#fff' },
  'Remote': { bg: 'rgba(211, 47, 47, 0.10)', color: '#c62828', activeBg: '#c62828', activeColor: '#fff' },
  'In-Person': { bg: 'rgba(230, 81, 0, 0.15)', color: '#d84315', activeBg: '#d84315', activeColor: '#fff' },
  'Link Needed': { bg: 'rgba(106, 27, 154, 0.10)', color: '#6a1b9a', activeBg: '#6a1b9a', activeColor: '#fff' },
}

const GOLD = '#C5A54E'
const GOLD_BORDER = '#C5A54E'

/* ═══ SAFE ARRAY HELPER ═══ */
function safeArr(val) {
  if (Array.isArray(val)) return val
  if (!val) return []
  if (typeof val === 'object') {
    try { return Object.values(val) } catch { return [] }
  }
  return []
}

/* ═══ ID GENERATOR ═══ */
let _idCounter = 0
function genId() {
  return `node_${Date.now()}_${++_idCounter}`
}

/* ═══ SOP ACCORDION ═══ */
function SopAccordion({ sop }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid #e5e2db', borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: open ? '#f9f8f6' : '#fff' }}
      >
        <span style={{ fontSize: 12, color: '#999', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{sop.title}</span>
        <span style={{ fontSize: 10, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>SOP</span>
      </div>
      {open && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0ede8', fontSize: 13, lineHeight: 1.7, color: '#333', whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto' }}>
          {sop.content}
        </div>
      )}
    </div>
  );
}

/* ═══ ARROW CONNECTOR ═══ */
function ArrowConnector({ size = 'normal' }) {
  const isSmall = size === 'small'
  const height = isSmall ? 24 : 32
  const margin = isSmall ? '4px 0' : '6px 0'

  return (
    <div style={{
      textAlign: 'center',
      margin,
      display: 'flex',
      justifyContent: 'center',
    }}>
      <svg width="2" height={height} style={{ display: 'block', overflow: 'visible' }}>
        <line x1="1" y1="0" x2="1" y2={height - 4} stroke="#c3d59f" strokeWidth="1.5" />
        <polygon points={`1,${height} -2,${height - 6} 4,${height - 6}`} fill="#c3d59f" />
      </svg>
    </div>
  )
}

/* ═══ TASK DETAIL SIDE PANEL ═══ */
/* This matches the original hub: always-editable structured fields */

function TaskDetailPanel({ node, stepLabel, onClose, onUpdate, onRemove, teamMembers, emailLibrary, onConvertToSubtask, onNavigate }) {
  const role = (node.ownerType || '').toLowerCase()
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.agent
  const [form, setForm] = useState({ ...node })
  const debounceRef = useRef(null)

  useEffect(() => { setForm({ ...node }) }, [node.id])

  const pushUpdate = useCallback((updated) => {
    setForm(updated)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onUpdate(updated)
    }, 600)
  }, [onUpdate])

  const set = (key, val) => {
    const updated = { ...form, [key]: val }
    pushUpdate(updated)
  }

  const toggleTag = (tag) => {
    const tags = form.taskTags || []
    const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    pushUpdate({ ...form, taskTags: next })
  }

  const labelStyle = {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: '#888',
    marginBottom: 6,
    marginTop: 18,
  }

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #e0ddd8',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    background: '#fafaf9',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const textareaStyle = {
    ...inputStyle,
    minHeight: 72,
    resize: 'vertical',
    lineHeight: 1.5,
  }

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23999' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: 30,
  }

  const activeTags = form.taskTags || []

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
      background: '#fff',
      boxShadow: '-6px 0 30px rgba(0,0,0,0.12)',
      zIndex: 100,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e8e5e0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {stepLabel && <span style={{ fontSize: 13, fontWeight: 600, color: '#999' }}>Step {stepLabel}</span>}
          <span style={{
            padding: '2px 8px', borderRadius: 4,
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            background: roleColor.bg, color: roleColor.text,
          }}>{OWNER_LABELS[role] || role || '--'}</span>
        </div>
        <button onClick={onClose} style={{
          width: 30, height: 30, borderRadius: '50%',
          background: '#f3f2f0', border: 'none', cursor: 'pointer',
          fontSize: 16, fontWeight: 700, color: '#999',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>&times;</button>
      </div>

      {/* Scrollable form body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 24px' }}>
        {/* WHAT */}
        <div style={labelStyle}>What</div>
        <input
          value={form.what || ''}
          onChange={e => set('what', e.target.value)}
          placeholder="Task name..."
          style={inputStyle}
        />

        {/* WHO - Role + Assignee */}
        <div style={labelStyle}>Who</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={form.ownerType || ''}
            onChange={e => {
              if (e.target.value === '__ADD_NEW__') {
                const newRole = prompt('Enter new role name:')
                if (newRole?.trim()) {
                  set('ownerType', newRole.trim())
                }
              } else {
                set('ownerType', e.target.value)
              }
            }}
            style={{ ...selectStyle, flex: '0 0 120px' }}
          >
            <option value="">Role...</option>
            {OWNER_OPTIONS.map(o => <option key={o} value={o}>{OWNER_LABELS[o]}</option>)}
            <option value="__ADD_NEW__">Other / Add...</option>
          </select>
          <select
            value={form.assignee || ''}
            onChange={e => set('assignee', e.target.value)}
            style={{ ...selectStyle, flex: 1 }}
          >
            <option value="">Unassigned</option>
            {(teamMembers || []).map((m, i) => {
              const name = typeof m === 'string' ? m : (m.name || m.label || '')
              return <option key={i} value={name}>{name}</option>
            })}
          </select>
        </div>

        {/* WHERE */}
        <div style={labelStyle}>Where</div>
        <select
          value={form.system || ''}
          onChange={e => {
            if (e.target.value === '__ADD_NEW__') {
              const newSystem = prompt('Enter new system name:')
              if (newSystem?.trim()) {
                set('system', newSystem.trim())
              }
            } else {
              set('system', e.target.value)
            }
          }}
          style={selectStyle}
        >
          <option value="">Select system...</option>
          {SYSTEM_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          <option value="__ADD_NEW__">Other / Add New...</option>
        </select>

        {/* WHEN */}
        <div style={labelStyle}>When</div>
        <input
          value={form.when || ''}
          onChange={e => set('when', e.target.value)}
          placeholder="Timing / trigger..."
          style={inputStyle}
        />

        {/* WHY */}
        <div style={labelStyle}>Why This Matters</div>
        <textarea
          value={form.why || ''}
          onChange={e => set('why', e.target.value)}
          placeholder="Purpose and rationale..."
          style={textareaStyle}
        />

        {/* KPIs */}
        <div style={labelStyle}>KPIs / Success Metrics</div>
        <textarea
          value={form.kpis || ''}
          onChange={e => set('kpis', e.target.value)}
          placeholder="Key performance indicators..."
          style={textareaStyle}
        />

        {/* HOW - Training */}
        <div style={labelStyle}>How - Training</div>
        <textarea
          value={form.how || ''}
          onChange={e => set('how', e.target.value)}
          placeholder="Scripts, SOPs, training..."
          style={textareaStyle}
        />

        {/* TASK TAGS */}
        <div style={labelStyle}>Task Tags</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TASK_TAGS.map(tag => {
            const isActive = activeTags.includes(tag)
            const tc = TAG_COLORS[tag]
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? 'none' : `1.5px solid ${tc.color}30`,
                  background: isActive ? tc.activeBg : tc.bg,
                  color: isActive ? tc.activeColor : tc.color,
                  transition: 'all 0.15s',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>

        {/* EMAIL TEMPLATE - shown if 'Email Task' tag is active */}
        {activeTags.includes('Email Task') && (
          <div>
            <div style={labelStyle}>Email Template</div>
            <button
              onClick={() => onNavigate?.('email-templates')}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${GOLD_BORDER}`,
                borderRadius: 6,
                background: 'rgba(197, 165, 78, 0.08)',
                color: GOLD,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(197, 165, 78, 0.15)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(197, 165, 78, 0.08)' }}
            >
              ✉ View / Edit Email Template in Library
            </button>
          </div>
        )}

        {/* LINK NEEDED - shown if 'Link Needed' tag is active */}
        {activeTags.includes('Link Needed') && (
          <div style={{
            marginTop: 18,
            padding: '16px',
            border: '2px solid #66bb6a',
            borderRadius: 8,
            background: 'rgba(102, 187, 106, 0.05)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2e7d32', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              🔗 Link Needed for This Step
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 6 }}>What link is needed? (e.g., Pre-Consultation Form)</label>
              <input
                value={form.linkLabel || ''}
                onChange={e => set('linkLabel', e.target.value)}
                placeholder="e.g., Pre-Consultation Form"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 6 }}>URL (add later or paste here)</label>
              <input
                value={form.linkUrl || ''}
                onChange={e => set('linkUrl', e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
            <div style={{ fontSize: 10, color: '#2e7d32', fontStyle: 'italic' }}>
              Auto-synced to your Links & Resources in Setup.
            </div>
          </div>
        )}

        {/* END OF WORKFLOW */}
        <div style={{ marginTop: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: '#555' }}>
            <input
              type="checkbox"
              checked={form.endOfWorkflow || false}
              onChange={e => set('endOfWorkflow', e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            End of Workflow
          </label>
        </div>

        {/* CONVERT TO SUBTASK */}
        <button
          onClick={() => { onConvertToSubtask?.(node.id); onClose() }}
          style={{
            marginTop: 24,
            width: '100%',
            padding: '10px 0',
            background: 'none',
            border: '1.5px solid #1976d2',
            borderRadius: 8,
            color: '#1976d2',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(25, 118, 210, 0.08)' }}
          onMouseOut={e => { e.currentTarget.style.background = 'none' }}
        >
          Convert to Subtask
        </button>

        {/* REMOVE STEP */}
        {onRemove && (
          <button
            onClick={() => { onRemove(node.id); onClose() }}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '10px 0',
              background: 'none',
              border: '1.5px solid #e53935',
              borderRadius: 8,
              color: '#e53935',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fbe9e7' }}
            onMouseOut={e => { e.currentTarget.style.background = 'none' }}
          >
            Remove Step
          </button>
        )}
      </div>
    </div>
  )
}

/* ═══ WORKFLOW CARD ═══ */

function WfCard({ node, stepLabel, isSelected, onSelect, onMoveUp, onMoveDown, onDelete, isFirst, isLast, onUpdate, availableRoles, onConvertToSubtask, onNavigate }) {
  const role = (node.ownerType || '').toLowerCase()
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.agent
  const tags = node.taskTags || []
  const [hovered, setHovered] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const roleDropdownRef = useRef(null)

  // Helper to get accent border color for role
  const getAccentColor = (role) => {
    const colorMap = {
      agent: '#c3d59f',
      admin: '#ec98a3',
      automated: '#fae2df',
      tc: '#a8c5da',
      ops: '#d4b896',
      lender: '#b8c9a3',
      title: '#c9b8d4',
    }
    return colorMap[role] || '#c3d59f'
  }

  const handleRoleChange = (newRole) => {
    if (onUpdate) onUpdate(node.id, { ownerType: newRole })
    setRoleDropdownOpen(false)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false)
      }
    }
    if (roleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [roleDropdownOpen])

  const accentColor = getAccentColor(role)

  return (
    <div
      style={{
        cursor: 'pointer',
        borderRadius: 10,
        width: 480,
        position: 'relative',
        backgroundColor: '#fafaf8',
        color: '#1a1a1a',
        border: isSelected ? `2px solid ${GOLD}` : '2px solid #e5e2db',
        borderLeft: `3px solid ${accentColor}`,
        boxShadow: isSelected
          ? `0 4px 12px rgba(0,0,0,0.1)`
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.15s ease',
      }}
      onClick={() => onSelect?.(node, stepLabel)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ padding: '16px' }}>
        {/* Top row: Step number circle + role badge + system name */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Step number circle */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: accentColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {stepLabel}
            </div>

            {/* Role badge - clickable dropdown */}
            <div ref={roleDropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  setRoleDropdownOpen(!roleDropdownOpen)
                }}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: 12,
                  backgroundColor: accentColor,
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  cursor: 'pointer',
                }}
                title="Click to change role"
              >
                {OWNER_LABELS[role] || role}
              </div>
              {/* Role dropdown menu */}
              {roleDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    backgroundColor: '#fff',
                    border: `1px solid ${accentColor}`,
                    borderRadius: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    minWidth: 120,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {(availableRoles || OWNER_OPTIONS).map((r, idx) => (
                    <div
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      style={{
                        padding: '8px 12px',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: role === r ? accentColor + '20' : 'transparent',
                        color: role === r ? accentColor : '#333',
                        borderBottom: idx < OWNER_OPTIONS.length - 1 ? '1px solid #f0f0f0' : 'none',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseOver={(e) => {
                        if (role !== r) e.currentTarget.style.backgroundColor = accentColor + '10'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = role === r ? accentColor + '20' : 'transparent'
                      }}
                    >
                      {OWNER_LABELS[r] || r}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* System name - right aligned */}
          {node.system && (
            <div style={{ fontSize: 11, fontWeight: 600, color: '#666', textAlign: 'right' }}>
              {node.system}
            </div>
          )}
        </div>

        {/* Task title */}
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 8, color: '#1a1a1a' }}>
          {node.what || '(untitled)'}
        </div>

        {/* When/timing */}
        {node.when && (
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8, fontStyle: 'italic' }}>
            {node.when}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {tags.map(tag => {
              const tc = TAG_COLORS[tag] || TAG_COLORS['Email Task']
              return (
                <span key={tag} style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: 4,
                  backgroundColor: tc.bg,
                  color: tc.color,
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                }}>
                  {tag}
                </span>
              )
            })}
          </div>
        )}

        {/* Action controls - visible on hover */}
        {hovered && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-start', marginTop: 8 }}>
            {/* Role Dropdown */}
            <select
              value={role}
              onChange={handleRoleChange}
              onClick={e => e.stopPropagation()}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                backgroundColor: 'transparent',
                color: '#666',
                fontSize: 10,
                fontWeight: 600,
                border: `1px solid ${accentColor}`,
                cursor: 'pointer',
              }}
            >
              {(availableRoles || OWNER_OPTIONS).map(r => (
                <option key={r} value={r}>{OWNER_LABELS[r] || r}</option>
              ))}
            </select>

            {/* Convert to Subtask button */}
            {onConvertToSubtask && !node.isSubtask && (
              <button
                onClick={e => { e.stopPropagation(); onConvertToSubtask(node.id) }}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  border: '1px solid #c3d59f',
                  cursor: 'pointer',
                  color: '#666',
                }}
                title="Convert to subtask"
              >Make Subtask</button>
            )}

            {/* Email Task button if tag is active */}
            {tags.includes('Email Task') && onNavigate && (
              <button
                onClick={e => { e.stopPropagation(); onNavigate('email-templates') }}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 600,
                  border: `1px solid ${GOLD}`,
                  backgroundColor: 'transparent',
                  color: GOLD,
                  cursor: 'pointer',
                }}
              >Email Template</button>
            )}
          </div>
        )}
      </div>

      {/* Move up/down + delete controls - visible on hover, positioned outside */}
      {hovered && (
        <div style={{
          position: 'absolute', top: -12, right: -12,
          display: 'flex', gap: 4,
        }}>
          {!isFirst && onMoveUp && (
            <button
              onClick={e => { e.stopPropagation(); onMoveUp() }}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#fff', border: `1px solid ${accentColor}`,
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accentColor, boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              title="Move up"
            >^</button>
          )}
          {!isLast && onMoveDown && (
            <button
              onClick={e => { e.stopPropagation(); onMoveDown() }}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#fff', border: `1px solid ${accentColor}`,
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accentColor, boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              title="Move down"
            >v</button>
          )}
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#e53935', border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              title="Delete"
            >&times;</button>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══ DECISION DIAMOND ═══ */

function DecisionDiamond({ node, onEdit, onDelete, isEditing }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0', position: 'relative' }}>
      {/* Dark decision bar */}
      <div
        style={{
          width: 480,
          background: 'linear-gradient(135deg, #2c2c2c, #3a3a3a)',
          borderRadius: 10,
          padding: '18px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative',
          cursor: isEditing ? 'pointer' : 'default',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          transition: 'all 0.15s ease',
        }}
        onClick={() => isEditing && onEdit?.()}
      >
        {/* Amber/gold icon box */}
        <div style={{
          width: 40, height: 40,
          background: '#d4a574',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M12 2 L22 12 L12 22 L2 12 Z" />
          </svg>
        </div>

        {/* Text content */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 14, fontWeight: 600,
            color: '#fff',
            lineHeight: 1.3,
          }}>{node.what || 'Decision?'}</div>
          <div style={{
            fontSize: 10, color: 'rgba(255,255,255,0.5)',
            marginTop: 2,
          }}>Decision point</div>
        </div>

        {/* Delete button */}
        {isEditing && onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            style={{
              position: 'absolute', top: -12, right: -12,
              width: 28, height: 28, borderRadius: '50%',
              background: '#e53935', color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: 16, fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >&times;</button>
        )}
      </div>
    </div>
  )
}

/* ═══ BRANCH RENDERING ═══ */

function DecisionBranches({ yesNodes, noNodes, allNodes, onSelect, onUpdateNode, onMoveNode, onDeleteNode, onAddYes, onAddNo, isEditing, selectedNodeId }) {
  const [activeTab, setActiveTab] = useState('yes')

  const yesNodeIds = safeArr(yesNodes)
  const noNodeIds = safeArr(noNodes)

  const yesBranchNodes = yesNodeIds.map(id => allNodes.find(n => n.id === id)).filter(Boolean)
  const noBranchNodes = noNodeIds.map(id => allNodes.find(n => n.id === id)).filter(Boolean)

  const isYesActive = activeTab === 'yes'
  const activeNodes = isYesActive ? yesBranchNodes : noBranchNodes
  const activeNodeIds = isYesActive ? yesNodeIds : noNodeIds
  const activePrefix = isYesActive ? 'Y' : 'N'
  const onAddActive = isYesActive ? onAddYes : onAddNo
  const yesColor = '#6b8a3e'
  const noColor = '#c44'
  const activeColor = isYesActive ? yesColor : noColor
  const activeBgLight = isYesActive ? '#f0f4e8' : '#fef1f3'
  const activeBottomBorder = isYesActive ? '#c3d59f' : '#ec98a3'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -4, marginBottom: 20 }}>
      {/* Tab bar */}
      <div style={{
        width: 480,
        display: 'flex',
        borderBottom: '1px solid #e5e2db',
        background: '#fff',
      }}>
        {/* YES tab */}
        <button
          onClick={() => setActiveTab('yes')}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.5px',
            border: 'none',
            background: isYesActive ? activeBgLight : 'transparent',
            color: yesColor,
            cursor: 'pointer',
            borderBottom: isYesActive ? '3px solid #c3d59f' : '3px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >YES PATH</button>

        {/* NO tab */}
        <button
          onClick={() => setActiveTab('no')}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.5px',
            border: 'none',
            background: !isYesActive ? activeBgLight : 'transparent',
            color: noColor,
            cursor: 'pointer',
            borderBottom: !isYesActive ? '3px solid #ec98a3' : '3px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >NO PATH</button>
      </div>

      {/* Active branch cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', width: 480, marginTop: 16 }}>
        {activeNodes.map((node, idx) => {
          const sLabel = `${activePrefix}${idx + 1}`
          return (
            <div key={node.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {idx > 0 && <ArrowConnector size="small" />}
              <div style={{ width: 420, display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Left badge */}
                <div style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  background: activeColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                  fontSize: 11, fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {sLabel}
                </div>
                <div style={{ flex: 1 }}>
                  <WfCard
                    node={node}
                    stepLabel={sLabel}
                    isSelected={selectedNodeId === node.id}
                    onSelect={onSelect}
                    onMoveUp={idx > 0 ? () => onMoveNode(node.id, 'up', activeNodeIds) : undefined}
                    onMoveDown={idx < activeNodes.length - 1 ? () => onMoveNode(node.id, 'down', activeNodeIds) : undefined}
                    onDelete={() => onDeleteNode(node.id)}
                    isFirst={idx === 0}
                    isLast={idx === activeNodes.length - 1}
                    onUpdate={onUpdateNode}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* Add step button */}
        {isEditing && (
          <button
            onClick={onAddActive}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              marginTop: 4, padding: '3px 6px',
              fontSize: 10, fontWeight: 500, cursor: 'pointer',
              background: 'transparent', border: 'none',
              color: activeColor, opacity: 0.4,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
          >+ add step</button>
        )}
      </div>
    </div>
  )
}

/* ═══ DECISION EDIT MODAL ═══ */

function DecisionEditModal({ node, onSave, onClose }) {
  const [what, setWhat] = useState(node.what || '')
  const [yesLabel, setYesLabel] = useState(node.yesLabel || 'YES')
  const [noLabel, setNoLabel] = useState(node.noLabel || 'NO')

  const save = () => {
    onSave({ ...node, what, yesLabel, noLabel })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 24, width: 420, maxWidth: '90vw', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Edit Decision Point</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Decision Question</label>
          <textarea value={what} onChange={e => setWhat(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e0ddd8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 60, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(76, 175, 80)', marginBottom: 4 }}>Yes Label</label>
            <input value={yesLabel} onChange={e => setYesLabel(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e0ddd8', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(244, 67, 54)', marginBottom: 4 }}>No Label</label>
            <input value={noLabel} onChange={e => setNoLabel(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e0ddd8', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', background: '#f3f2f0', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
        </div>
      </div>
    </div>
  )
}

/* ═══ ADD-STEP LINK ═══ */

function AddSubStepLink({ onClick }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      style={{
        display: 'flex', alignItems: 'center', gap: 2,
        marginTop: 2, marginLeft: 40,
        fontSize: 9, color: '#d0ccc4',
        background: 'none', border: 'none',
        cursor: 'pointer', padding: '2px 4px',
        opacity: 0.5,
        transition: 'opacity 0.2s ease',
      }}
      onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
      onMouseOut={e => e.currentTarget.style.opacity = '0.5'}
    >+ add sub-step</button>
  )
}

function AddMainTaskButton({ onClick }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      style={{
        marginTop: 12,
        marginBottom: 12,
        padding: '8px 16px',
        fontSize: 12,
        fontWeight: 600,
        color: '#888',
        background: 'rgba(195, 213, 159, 0.15)',
        border: '1.5px dashed #c3d59f',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = 'rgba(195, 213, 159, 0.25)'
        e.currentTarget.style.color = '#666'
        e.currentTarget.style.borderColor = '#c3d59f'
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = 'rgba(195, 213, 159, 0.15)'
        e.currentTarget.style.color = '#888'
        e.currentTarget.style.borderColor = '#c3d59f'
      }}
    >+ Add Main Task</button>
  )
}

/* ═══ MAIN WORKFLOW EDITOR COMPONENT ═══ */

function WorkflowEditorInner({ pageKey, hubData, onSave, onNavigate }) {
  const allData = hubData?.allData || {}
  const meta = hubData?._meta || {}
  const teamMembers = meta.teamMembers || []

  const [view, setView] = useState('map')
  const [roleFilter, setRoleFilter] = useState('all')
  const isEditing = true // Always editing - no toggle needed
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedStep, setSelectedStep] = useState('')
  const [editingDecision, setEditingDecision] = useState(null)

  // Find matching workflow keys
  const wfKeys = useMemo(() => {
    return Object.keys(allData).filter(k => {
      const kl = k.toLowerCase().replace(/[^a-z0-9]/g, '')
      const parts = pageKey.split('-')
      return parts.every(p => kl.includes(p))
    })
  }, [allData, pageKey])

  const primaryKey = wfKeys[0] || pageKey
  const wfData = wfKeys.length > 0 ? wfKeys.reduce((acc, k) => {
    const d = allData[k] || {}
    const rawNodes = Array.isArray(d.nodes) ? d.nodes : []
    return {
      nodes: [...(acc.nodes || []), ...rawNodes].filter(n => n && typeof n === 'object'),
      name: acc.name || d.name || d.label,
      notes: [acc.notes, d.notes].filter(Boolean).join('\n\n'),
    }
  }, { nodes: [], name: '', notes: '' }) : { nodes: [], name: '', notes: '' }

  const allNodes = wfData.nodes
  const notes = wfData.notes

  // Role list
  const roles = useMemo(() => {
    return [...new Set(allNodes.map(n => (n.ownerType || '').toLowerCase()).filter(Boolean))]
  }, [allNodes])

  // Notes
  const [localNotes, setLocalNotes] = useState(notes)
  const saveTimer = useRef(null)
  useEffect(() => { setLocalNotes(notes) }, [notes])

  const handleNotesChange = (val) => {
    setLocalNotes(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (primaryKey && onSave) {
        const wf = { ...(allData[primaryKey] || {}), notes: val }
        onSave({ allData: { ...allData, [primaryKey]: wf } })
      }
    }, 1500)
  }

  // ── Save nodes back (also propagates systems to setup/finances) ──
  const saveNodes = useCallback((newNodes) => {
    if (!primaryKey || !onSave) return
    const wf = { ...(allData[primaryKey] || {}), nodes: newNodes }
    const savePayload = { allData: { ...allData, [primaryKey]: wf } }

    // Propagate systems: collect all unique systems from ALL workflows
    const allSystems = new Set()
    // Systems from the updated workflow
    newNodes.forEach(n => { if (n.system) allSystems.add(n.system) })
    // Systems from other workflows
    Object.keys(allData).forEach(k => {
      if (k === primaryKey) return
      const d = allData[k]
      if (d?.nodes && Array.isArray(d.nodes)) {
        d.nodes.forEach(n => { if (n?.system) allSystems.add(n.system) })
      }
    })
    // Merge with existing setup systems
    const existingSystems = hubData?.systems || []
    const mergedSystems = [...new Set([...existingSystems, ...allSystems])]
    if (mergedSystems.length > existingSystems.length) {
      savePayload.systems = mergedSystems
    }

    onSave(savePayload)
  }, [allData, primaryKey, onSave, hubData])

  // ── Node manipulation ──
  const updateNode = useCallback((nodeId, updates) => {
    const newNodes = allNodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
    saveNodes(newNodes)
  }, [allNodes, saveNodes])

  const addTask = useCallback((afterIndex) => {
    const newNode = { id: genId(), what: '', when: '', why: '', kpis: '', how: '', ownerType: 'agent', type: 'task', taskTags: [] }
    const newNodes = [...allNodes]
    const insertAt = afterIndex !== undefined ? afterIndex + 1 : newNodes.length
    newNodes.splice(insertAt, 0, newNode)
    saveNodes(newNodes)
  }, [allNodes, saveNodes])

  const addDecision = useCallback((afterIndex) => {
    const newNode = {
      id: genId(), type: 'decision', what: 'Decision point?',
      yesLabel: 'YES', noLabel: 'NO', yesBranch: [], noBranch: [],
    }
    const newNodes = [...allNodes]
    const insertAt = afterIndex !== undefined ? afterIndex + 1 : newNodes.length
    newNodes.splice(insertAt, 0, newNode)
    saveNodes(newNodes)
  }, [allNodes, saveNodes])

  const deleteNode = useCallback((nodeId) => {
    let newNodes = allNodes.filter(n => n.id !== nodeId && n.parentId !== nodeId)
    newNodes = newNodes.map(n => {
      if (n.type === 'decision') {
        return {
          ...n,
          yesBranch: safeArr(n.yesBranch).filter(id => id !== nodeId),
          noBranch: safeArr(n.noBranch).filter(id => id !== nodeId),
        }
      }
      return n
    })
    saveNodes(newNodes)
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
  }, [allNodes, saveNodes, selectedNode])

  const moveNode = useCallback((nodeId, direction, branchIds) => {
    if (branchIds) {
      const idx = branchIds.indexOf(nodeId)
      if (idx < 0) return
      const newBranch = [...branchIds]
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= newBranch.length) return
      ;[newBranch[idx], newBranch[swapIdx]] = [newBranch[swapIdx], newBranch[idx]]
      const newNodes = allNodes.map(n => {
        if (n.type === 'decision') {
          const updated = { ...n }
          if (safeArr(n.yesBranch).includes(nodeId)) updated.yesBranch = newBranch
          if (safeArr(n.noBranch).includes(nodeId)) updated.noBranch = newBranch
          return updated
        }
        return n
      })
      saveNodes(newNodes)
    } else {
      const mainNodes = allNodes.filter(n => !n.parentId && !n.isSubtask)
      const idx = mainNodes.findIndex(n => n.id === nodeId)
      if (idx < 0) return
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= mainNodes.length) return
      const actualIdx = allNodes.indexOf(mainNodes[idx])
      const actualSwapIdx = allNodes.indexOf(mainNodes[swapIdx])
      const newNodes = [...allNodes]
      ;[newNodes[actualIdx], newNodes[actualSwapIdx]] = [newNodes[actualSwapIdx], newNodes[actualIdx]]
      saveNodes(newNodes)
    }
  }, [allNodes, saveNodes])

  const addSubStep = useCallback((parentId) => {
    const newNode = { id: genId(), what: '', when: '', why: '', kpis: '', how: '', ownerType: 'agent', type: 'task', parentId, isSubtask: true, taskTags: [] }
    const parentIdx = allNodes.findIndex(n => n.id === parentId)
    let insertIdx = parentIdx + 1
    while (insertIdx < allNodes.length && allNodes[insertIdx].parentId === parentId) {
      insertIdx++
    }
    const newNodes = [...allNodes]
    newNodes.splice(insertIdx, 0, newNode)
    saveNodes(newNodes)
  }, [allNodes, saveNodes])

  const addToBranch = useCallback((decisionId, branch) => {
    const newTaskId = genId()
    const newTask = { id: newTaskId, what: '', when: '', why: '', kpis: '', how: '', ownerType: 'agent', type: 'task', taskTags: [] }
    const newNodes = allNodes.map(n => {
      if (n.id === decisionId) {
        const updated = { ...n }
        if (branch === 'yes') updated.yesBranch = [...safeArr(updated.yesBranch), newTaskId]
        else updated.noBranch = [...safeArr(updated.noBranch), newTaskId]
        return updated
      }
      return n
    })
    const decIdx = newNodes.findIndex(n => n.id === decisionId)
    newNodes.splice(decIdx + 1, 0, newTask)
    saveNodes(newNodes)
  }, [allNodes, saveNodes])

  const insertMainTaskAt = useCallback((atIndex) => {
    const newNode = { id: genId(), what: '', when: '', why: '', kpis: '', how: '', ownerType: 'agent', type: 'task', taskTags: [] }
    // Get all main tasks (no parent, not subtask)
    const mainTasks = allNodes.filter(n => !n.parentId && !n.isSubtask)
    if (atIndex >= mainTasks.length) {
      // Append at end
      saveNodes([...allNodes, newNode])
    } else {
      // Insert before the task at this position
      const targetTask = mainTasks[atIndex]
      const insertIdx = allNodes.findIndex(n => n.id === targetTask.id)
      const newNodes = [...allNodes]
      newNodes.splice(insertIdx, 0, newNode)
      saveNodes(newNodes)
    }
  }, [allNodes, saveNodes])

  const updateDecision = useCallback((updatedNode) => {
    const newNodes = allNodes.map(n => n.id === updatedNode.id ? updatedNode : n)
    saveNodes(newNodes)
  }, [allNodes, saveNodes])

  // ── Select node handler ──
  const handleSelectNode = (node, stepLabel) => {
    if (node.type === 'decision') return
    setSelectedNode(node)
    setSelectedStep(stepLabel)
  }

  const handleUpdateSelectedNode = (updatedNode) => {
    updateNode(updatedNode.id, updatedNode)
    setSelectedNode(updatedNode)
  }

  // ── Build visual flow ──
  const branchNodeIds = useMemo(() => {
    const ids = new Set()
    allNodes.forEach(n => {
      if (n.type === 'decision') {
        safeArr(n.yesBranch).forEach(id => ids.add(id))
        safeArr(n.noBranch).forEach(id => ids.add(id))
      }
    })
    return ids
  }, [allNodes])

  const mainFlow = useMemo(() => {
    return allNodes.filter(n => !n.parentId && !n.isSubtask && !branchNodeIds.has(n.id))
  }, [allNodes, branchNodeIds])

  const filtered = roleFilter === 'all' ? mainFlow : mainFlow.filter(n => {
    if (n.type === 'decision') return true
    return (n.ownerType || '').toLowerCase() === roleFilter
  })

  // ── Render ──
  let stepCounter = 0

  return (
    <div style={{
      background: '#fafaf9', minHeight: '100vh', paddingBottom: 40,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* Notes box - compact collapsible */}
      <div style={{ maxWidth: 900, margin: '0 auto 16px', padding: '0 20px' }}>
        <details style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, overflow: 'hidden' }}>
          <summary style={{
            padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#555',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', listStyle: 'none',
            userSelect: 'none',
          }}>
            <span>My Notes</span>
            <span style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>Auto-saves</span>
          </summary>
          <div style={{ padding: '0 16px 12px' }}>
            <textarea
              value={localNotes}
              onChange={e => handleNotesChange(e.target.value)}
              placeholder="Add your notes, reminders, or ideas for this workflow here..."
              style={{
                width: '100%',
                minHeight: 70,
                padding: 10,
                border: '1px solid #e8e8e8',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
                background: '#fafaf8',
              }}
            />
          </div>
        </details>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {[['map', 'Workflow Map'], ['sop', 'SOP Checklist']].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setView(k)}
              style={{
                padding: '7px 16px',
                fontSize: 12,
                fontWeight: view === k ? 700 : 600,
                cursor: 'pointer',
                border: '1px solid rgb(243, 242, 240)',
                borderRadius: k === 'map' ? '6px 0 0 6px' : '0 6px 6px 0',
                background: view === k ? 'rgb(243, 242, 240)' : 'white',
                color: '#1a1a1a',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Add buttons (edit mode) */}
      {view === 'map' && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          <button
            onClick={() => addTask()}
            style={{
              padding: '7px 14px', borderRadius: 6, border: 'none',
              background: '#f3f2f0', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >+ Task</button>
          <button
            onClick={() => addDecision()}
            style={{
              padding: '7px 14px', borderRadius: 6, border: 'none',
              background: '#fdf6e3', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', color: GOLD,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >+ Decision</button>
        </div>
      )}

      {/* Role legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 12, fontSize: 13, color: '#555' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: ROLE_COLORS.agent.bg, marginRight: 4, verticalAlign: -1 }} /> Agent</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: ROLE_COLORS.admin.bg, marginRight: 4, verticalAlign: -1 }} /> Admin</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: ROLE_COLORS.automated.bg, marginRight: 4, verticalAlign: -1, border: '1px solid #ddd' }} /> Automated</span>
      </div>

      {/* Role filters */}
      {roles.length > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => setRoleFilter('all')}
            style={{
              padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
              fontSize: 11, fontWeight: roleFilter === 'all' ? 700 : 600,
              backgroundColor: roleFilter === 'all' ? '#1a1a1a' : 'white',
              color: roleFilter === 'all' ? 'white' : '#1a1a1a',
              border: roleFilter === 'all' ? 'none' : '1px solid #e6e4df',
            }}
          >All Roles</button>
          {roles.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                fontSize: 11, fontWeight: roleFilter === r ? 700 : 600,
                backgroundColor: roleFilter === r ? '#1a1a1a' : 'white',
                color: roleFilter === r ? 'white' : '#1a1a1a',
                border: roleFilter === r ? 'none' : '1px solid #e6e4df',
              }}
            >{OWNER_LABELS[r] || r}</button>
          ))}
        </div>
      )}

      {/* MAP VIEW */}
      {view === 'map' ? (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px', backgroundColor: '#faf9f7', borderRadius: 0 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: 40, background: '#fff', border: '1px solid #e5e2db', borderRadius: 8 }}>
              {wfKeys.length === 0
                ? "This workflow hasn't been set up yet. Your CoreOps team will build this out for you!"
                : 'No tasks in this workflow yet.'}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {filtered.map((node, idx) => {
              if (node.type === 'decision') {
                const hasYes = safeArr(node.yesBranch).length > 0
                const hasNo = safeArr(node.noBranch).length > 0
                const showBranches = hasYes || hasNo || isEditing

                return (
                  <div key={node.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {idx > 0 && <ArrowConnector />}
                    <DecisionDiamond
                      node={node}
                      isEditing={isEditing}
                      onEdit={() => setEditingDecision(node)}
                      onDelete={() => deleteNode(node.id)}
                    />
                    {/* YES/NO branches */}
                    {showBranches && (
                      <DecisionBranches
                        yesNodes={safeArr(node.yesBranch)}
                        noNodes={safeArr(node.noBranch)}
                        allNodes={allNodes}
                        isEditing={isEditing}
                        selectedNodeId={selectedNode?.id}
                        onSelect={handleSelectNode}
                        onUpdateNode={updateNode}
                        onMoveNode={moveNode}
                        onDeleteNode={deleteNode}
                        onAddYes={() => addToBranch(node.id, 'yes')}
                        onAddNo={() => addToBranch(node.id, 'no')}
                      />
                    )}
                    {/* Rejoin line after branches */}
                    {showBranches && idx < filtered.length - 1 && (
                      <ArrowConnector />
                    )}
                  </div>
                )
              }

              // Regular task node
              stepCounter++
              const sLabel = String(stepCounter)
              const subs = allNodes.filter(n => n.parentId === node.id)

              return (
                <div key={node.id || idx} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {idx > 0 && <ArrowConnector />}
                  {/* Add Main Task button before this task (except for first task) */}
                  {idx > 0 && (
                    <AddMainTaskButton onClick={() => insertMainTaskAt(idx)} />
                  )}
                  <WfCard
                    node={node}
                    stepLabel={sLabel}
                    isSelected={selectedNode?.id === node.id}
                    onSelect={handleSelectNode}
                    onMoveUp={() => moveNode(node.id, 'up')}
                    onMoveDown={() => moveNode(node.id, 'down')}
                    onDelete={() => deleteNode(node.id)}
                    isFirst={idx === 0}
                    isLast={idx === filtered.length - 1}
                    onUpdate={updateNode}
                    availableRoles={OWNER_OPTIONS}
                    onConvertToSubtask={addSubStep}
                    onNavigate={onNavigate}
                  />
                  {/* Sub-steps */}
                  {subs.map((sub, si) => (
                    <div key={sub.id} style={{ marginLeft: 20, marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <ArrowConnector size="small" />
                      <WfCard
                        node={sub}
                        stepLabel={`${sLabel}.${si + 1}`}
                        isSelected={selectedNode?.id === sub.id}
                        onSelect={handleSelectNode}
                        onDelete={() => deleteNode(sub.id)}
                        isFirst={si === 0}
                        isLast={si === subs.length - 1}
                        onUpdate={updateNode}
                        availableRoles={OWNER_OPTIONS}
                        onNavigate={onNavigate}
                      />
                    </div>
                  ))}
                  {/* Add sub-step link */}
                  <AddSubStepLink onClick={() => addSubStep(node.id)} />
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* SOP CHECKLIST VIEW */
        <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 20px' }}>
          {/* Reference SOPs for this workflow */}
          {(() => {
            const matchingSops = WORKFLOW_SOPS[pageKey] || [];
            if (matchingSops.length === 0) return null;
            return (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference SOPs</div>
                {matchingSops.map(sop => (
                  <SopAccordion key={sop.id} sop={sop} />
                ))}
              </div>
            );
          })()}
          {allNodes.map((node, i) => {
            if (node.type === 'decision') {
              return (
                <div key={node.id || i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0ede8', alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, transform: 'rotate(45deg)', background: '#fdf6e3', border: `2px solid ${GOLD_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ transform: 'rotate(-45deg)', fontSize: 12, fontWeight: 700, color: GOLD }}>?</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: GOLD }}>{node.what || 'Decision Point'}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                      {node.yesLabel || 'YES'} / {node.noLabel || 'NO'}
                    </div>
                  </div>
                </div>
              )
            }
            const role = (node.ownerType || '').toLowerCase()
            const rc = ROLE_COLORS[role] || ROLE_COLORS.agent
            return (
              <div
                key={node.id || i}
                onClick={() => handleSelectNode(node, String(i + 1))}
                style={{
                  display: 'flex', gap: 12, padding: '12px 0',
                  borderBottom: '1px solid #f0ede8',
                  alignItems: 'flex-start', cursor: 'pointer',
                  paddingLeft: node.isSubtask || node.parentId ? 32 : 0,
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f9f8f6'}
                onMouseOut={e => e.currentTarget.style.background = ''}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: rc.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  color: rc.text,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{node.what || '(untitled)'}</div>
                  {node.how && <div style={{ fontSize: 13, color: '#555', marginTop: 4, whiteSpace: 'pre-wrap', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{node.how}</div>}
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {node.ownerType && <span>{OWNER_LABELS[role] || node.ownerType}</span>}
                    {node.system && <span>{node.system}</span>}
                    {node.when && <span>{node.when}</span>}
                    {(node.taskTags || []).map(tag => {
                      const tc = TAG_COLORS[tag] || TAG_COLORS['Email Task']
                      return <span key={tag} style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: tc.bg, color: tc.color }}>{tag.toUpperCase()}</span>
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Decision edit modal */}
      {editingDecision && (
        <DecisionEditModal
          node={editingDecision}
          onSave={(updated) => { updateDecision(updated); setEditingDecision(null) }}
          onClose={() => setEditingDecision(null)}
        />
      )}

      {/* Task detail side panel */}
      {selectedNode && (
        <>
          <div onClick={() => setSelectedNode(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.25)', zIndex: 99 }} />
          <TaskDetailPanel
            node={selectedNode}
            stepLabel={selectedStep}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateSelectedNode}
            onRemove={deleteNode}
            teamMembers={teamMembers}
            emailLibrary={allData['email-library']?.templates || {}}
            onConvertToSubtask={(nodeId) => {
              // Find the node's index and the previous main-flow node
              const idx = allNodes.findIndex(n => n.id === nodeId)
              if (idx <= 0) return
              // Find the nearest previous non-subtask node
              let parentId = null
              for (let i = idx - 1; i >= 0; i--) {
                if (!allNodes[i].parentId && !allNodes[i].isSubtask && allNodes[i].type !== 'decision') {
                  parentId = allNodes[i].id
                  break
                }
              }
              if (!parentId) return
              const newNodes = allNodes.map(n =>
                n.id === nodeId ? { ...n, parentId, isSubtask: true } : n
              )
              saveNodes(newNodes)
              setSelectedNode(null)
            }}
            onNavigate={onNavigate}
          />
        </>
      )}
    </div>
  )
}

export default function WorkflowEditor(props) {
  return (
    <WorkflowErrorBoundary>
      <WorkflowEditorInner {...props} />
    </WorkflowErrorBoundary>
  )
}
