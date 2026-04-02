import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, loadHub, saveHubData } from './lib/supabase'
import BusinessSnapshot from './components/BusinessSnapshot'
import CoreFoundation from './components/CoreFoundation'
import TargetAudience from './components/TargetAudience'
import BrandVoice from './components/BrandVoice'
import BrandGuidelines from './components/BrandGuidelines'
import Pipeline from './components/Pipeline'
import Finances from './components/Finances'
import Team from './components/Team'
import LeadSources from './components/LeadSources'
import LeadMagnets from './components/LeadMagnets'
import ClientForLife from './components/ClientForLife'
import AgentReferrals from './components/AgentReferrals'
import VendorPartnerships from './components/VendorPartnerships'
import EmailTemplateLibrary from './components/EmailTemplateLibrary'
import CrmSetup from './components/CrmSetup'
import ListingMarketing from './components/ListingMarketing'
import WorkflowEditor from './components/WorkflowEditor'
import Setup from './components/Setup'
import './styles/global.css'

/* ═══ CONSTANTS ═══ */

const OWNER_LABELS = {
  agent: 'Agent', admin: 'Admin', automated: 'Automated',
  tc: 'TC', ops: 'Ops', lender: 'Lender', title: 'Title',
}

const SIDEBAR = [
  { section: 'OVERVIEW' },
  { key: 'overview', label: 'Business Snapshot' },
  { section: 'FOUNDATION' },
  { key: 'core-foundation', label: 'Core Foundation' },
  { key: 'target-audience', label: 'Target Audience' },
  { key: 'brand-voice', label: 'Brand Voice & Tone' },
  { key: 'brand-guidelines', label: 'Brand Guidelines' },
  { section: 'MARKETING' },
  { key: 'lead-sources', label: 'Lead Sources & Strategy' },
  { key: 'lead-magnets', label: 'Lead Magnets & Landing Pages' },
  { key: 'email-templates', label: 'Email Template Library' },
  { key: 'crm-setup', label: 'CRM Setup & Lead Nurturing' },
  { key: 'listing-marketing', label: 'Listing Marketing' },
  { section: 'PIPELINE' },
  { key: 'pipeline', label: 'Pipeline & Transactions' },
  { section: 'TRANSACTIONS' },
  { key: 'buyer-consultation', label: 'Buyer Consultation' },
  { key: 'seller-consultation', label: 'Seller Consultation' },
  { key: 'pre-listing', label: 'Pre-Listing' },
  { key: 'active-listing', label: 'Active Listing' },
  { key: 'open-house', label: 'Open House' },
  { section: 'CLOSING' },
  { key: 'seller-contract', label: 'Seller Contract to Close' },
  { key: 'buyer-contract', label: 'Buyer Contract to Close' },
  { section: 'GROWTH' },
  { key: 'client-for-life', label: 'Client for Life' },
  { key: 'agent-referrals', label: 'Agent to Agent Referrals' },
  { key: 'vendor-partnerships', label: 'Vendor Partnerships' },
  { section: 'FINANCES' },
  { key: 'finances', label: 'Finances' },
  { section: 'TEAM' },
  { key: 'team', label: 'Team' },
  { section: '' },
  { key: 'setup', label: 'Setup' },
]

const WF_KEYS = [
  'buyer-consultation','seller-consultation','pre-listing',
  'active-listing','open-house','seller-contract','buyer-contract',
]

/* ═══ CUSTOM WORKFLOW HELPERS ═══ */

function customWfKey(name) {
  return 'custom-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'')
}

/** Map category names to the sidebar section label they belong under */
const CATEGORY_TO_SECTION = {
  Transactions: 'TRANSACTIONS',
  Closing: 'CLOSING',
  Growth: 'GROWTH',
  Marketing: 'MARKETING',
  Operations: 'OPERATIONS',
}

/** Build sidebar with custom workflows injected under their category sections */
function buildSidebar(customWorkflows) {
  const base = [...SIDEBAR]
  if (!customWorkflows || customWorkflows.length === 0) return base

  const grouped = {}
  customWorkflows.forEach(cw => {
    const section = CATEGORY_TO_SECTION[cw.category] || cw.category?.toUpperCase() || 'OPERATIONS'
    if (!grouped[section]) grouped[section] = []
    grouped[section].push({ key: customWfKey(cw.name), label: cw.name })
  })

  const result = []
  let currentSection = ''
  for (let i = 0; i < base.length; i++) {
    const item = base[i]
    if (item.section !== undefined) {
      if (currentSection && grouped[currentSection]) {
        grouped[currentSection].forEach(cw => result.push(cw))
        delete grouped[currentSection]
      }
      currentSection = item.section
    }
    result.push(item)
  }
  if (currentSection && grouped[currentSection]) {
    const setupIdx = result.findIndex(r => r.key === 'setup')
    const insertIdx = setupIdx >= 0 ? setupIdx : result.length
    grouped[currentSection].forEach(cw => result.splice(insertIdx, 0, cw))
    delete grouped[currentSection]
  }

  Object.entries(grouped).forEach(([section, items]) => {
    const setupIdx = result.findIndex(r => r.key === 'setup')
    const emptyDivIdx = result.findIndex((r, idx) => idx > 0 && r.section === '' && idx > result.length - 5)
    const insertIdx = emptyDivIdx >= 0 ? emptyDivIdx : (setupIdx >= 0 ? setupIdx : result.length)
    result.splice(insertIdx, 0, { section }, ...items)
  })

  return result
}

/* ═══ HELPERS ═══ */

function matchWfKeys(allData, pageKey) {
  return Object.keys(allData).filter(k => {
    const kl = k.toLowerCase().replace(/[^a-z0-9]/g, '')
    const parts = pageKey.split('-')
    return parts.every(p => kl.includes(p))
  })
}

function getProgress(hubData, key) {
  const ad = hubData?.allData || {}
  const meta = hubData?._meta || {}
  const snap = { ...(ad.snapshot || {}), ...(meta.snapshot || {}) }
  if (key === 'overview') {
    const fields = [snap.businessName, snap.location, snap.brokerage]
    return Math.round((fields.filter(f => f?.trim()).length / fields.length) * 100)
  }
  if (key === 'core-foundation') {
    const cf = ad['core-foundation'] || meta.coreFoundation || {}
    const v = cf.coreValues || meta.coreValues || []
    return v.length >= 5 ? 100 : Math.round((v.length / 5) * 100)
  }
  if (key === 'target-audience') {
    const audiences = ad['target-audience']?.audiences || meta.audiences || []
    return audiences.length > 0 ? Math.min(100, Math.round((audiences.length / 2) * 100)) : 0
  }
  if (key === 'brand-voice') {
    const d = ad['brand-voice'] || meta.brandVoice || {}
    const f = Object.values(d).filter(v => v && v?.toString().trim()).length
    return Math.min(100, Math.round((f / 3) * 100))
  }
  if (key === 'brand-guidelines') {
    const d = ad['brand-guidelines'] || meta.brandGuidelines || {}
    const f = Object.values(d).filter(v => v && v?.toString().trim()).length
    return Math.min(100, Math.round((f / 3) * 100))
  }
  if (key === 'setup') return (hubData?.systems || []).length > 0 ? 100 : 0
  if (key === 'finances') {
    const fin = ad.finances || meta.finances || {}
    return Object.values(fin).filter(v => v?.toString().trim()).length > 0 ? 20 : 0
  }
  if (key === 'team') return (hubData?.teamMembers || meta.teamMembers || []).length > 0 ? 100 : 0

  const wfKeys = matchWfKeys(ad, key)
  if (wfKeys.length === 0) return 0
  const nodes = wfKeys.flatMap(k => ad[k]?.nodes || [])
  const filled = nodes.filter(n => n.what?.trim()).length
  return nodes.length === 0 ? 0 : Math.round((filled / nodes.length) * 100)
}

function pctClass(p) {
  if (p >= 100) return 'done'
  if (p >= 60) return 'high'
  if (p >= 30) return 'mid'
  return 'low'
}

/* ═══ LOGIN ═══ */

function LoginPage({ onLogin, brandName, hubData }) {
  const [username, setUsername] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const creds = hubData?.credentials || hubData?._meta?.credentials || {}
      const users = hubData?.users || hubData?._meta?.users || []
      const inputLower = username.trim().toLowerCase()

      if (creds.username && creds.password) {
        if (inputLower === creds.username.toLowerCase() && pass === creds.password) {
          onLogin({ username: creds.username, role: 'client' }); return
        }
      }

      const matched = users.find(u => {
        const uName = (u.username || u.email || u.name || '').toLowerCase()
        return uName === inputLower && u.password === pass
      })
      if (matched) { onLogin({ username: matched.username || matched.name, role: matched.role || 'client' }); return }

      const hubSlug = hubData?._hubSlug || ''
      if (hubSlug && inputLower === hubSlug.toLowerCase().replace(/[^a-z0-9]/g, '') && pass === 'coreops2026') {
        onLogin({ username: inputLower, role: 'client' }); return
      }
      if (inputLower === 'admin' && pass === 'coreops2026') {
        onLogin({ username: 'admin', role: 'admin' }); return
      }
      if (username.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: username.trim(), password: pass })
        if (error) throw error
        onLogin(data.user); return
      }
      throw new Error('Invalid username or password')
    } catch (ex) { setErr(ex.message || 'Invalid credentials') }
    finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <h1>{brandName || 'Business Hub'}</h1>
        <p>Sign in to access your systems & workflows</p>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
        <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} required />
        <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        {err && <div className="login-error">{err}</div>}
      </form>
    </div>
  )
}

/* ═══ TASK DETAIL PANEL ═══ */

function TaskDetailPanel({ node, onClose, stepLabel }) {
  if (!node) return null
  const role = (node.ownerType || '').toLowerCase()
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 520, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: `var(--role-${role || 'agent'})`, color: `var(--role-${role || 'agent'}-text)`, padding: '20px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {stepLabel && <span style={{ fontSize: 12, opacity: 0.7 }}>Step {stepLabel}</span>}
            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: 'rgba(0,0,0,0.12)' }}>{OWNER_LABELS[role] || role || '--'}</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.12)', border: 'none', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: 'inherit', fontWeight: 700 }}>&times;</button>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>{node.what || '(untitled)'}</div>
        {node.when && <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>{node.when}</div>}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Meta row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0ede8' }}>
          {node.assignee && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Assignee</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{node.assignee}</div>
            </div>
          )}
          {node.system && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>System</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{node.system}</div>
            </div>
          )}
          {node.ownerType && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Owner</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{OWNER_LABELS[role] || node.ownerType}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            {node.isEmail && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#e8f5e9', color: '#3d7a4a', textTransform: 'uppercase' }}>EMAIL</span>}
            {node.isRemote === true && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#e3f2fd', color: '#1565c0', textTransform: 'uppercase' }}>REMOTE</span>}
            {node.isRemote === false && !node.isEmail && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#fff3e0', color: '#e65100', textTransform: 'uppercase' }}>IN-PERSON</span>}
          </div>
        </div>

        {/* HOW - The SOP instructions */}
        {node.how && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>How (SOP Instructions)</div>
            <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: '#f9f8f6', padding: 16, borderRadius: 8, border: '1px solid #e5e2db' }}>{node.how}</div>
          </div>
        )}

        {/* WHY */}
        {node.why && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Why</div>
            <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: '#f9f8f6', padding: 16, borderRadius: 8, border: '1px solid #e5e2db' }}>{node.why}</div>
          </div>
        )}

        {/* KPIs */}
        {node.kpis && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>KPIs</div>
            <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: '#f9f8f6', padding: 16, borderRadius: 8, border: '1px solid #e5e2db' }}>{node.kpis}</div>
          </div>
        )}

        {/* Email template preview if it's an email node */}
        {node.isEmail && node.emailTemplate && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Email Template</div>
            <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #e5e2db' }}>{node.emailTemplate}</div>
          </div>
        )}

        {/* Show all other fields that have content */}
        {Object.entries(node).filter(([k, v]) =>
          v && typeof v === 'string' && v.trim() &&
          !['id','what','how','why','when','kpis','ownerType','assignee','system','type','order','parentId','emailTemplate','emailStatus','subjectLine','previewText','automationNotes'].includes(k) &&
          typeof v !== 'boolean'
        ).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</div>
            <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: '#f9f8f6', padding: 16, borderRadius: 8, border: '1px solid #e5e2db' }}>{value}</div>
          </div>
        ))}

        {/* Empty state if no detail content */}
        {!node.how && !node.why && !node.kpis && (
          <div style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No SOP details yet</div>
            <div style={{ fontSize: 13 }}>Your CoreOps team will fill in the how, why, and KPIs for this task.</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══ WORKFLOW MAP ═══ */

function WorkflowMap({ nodes = [], roleFilter = 'all', onSelectNode }) {
  const filtered = roleFilter === 'all' ? nodes : nodes.filter(n => (n.ownerType || '').toLowerCase() === roleFilter)
  if (!filtered.length) return <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 40 }}>No tasks in this workflow yet.</p>
  const parents = filtered.filter(n => !n.isSubtask && !n.parentId)
  const subs = (pid) => filtered.filter(n => (n.isSubtask || n.parentId) && n.parentId === pid)

  return (
    <div style={{ maxWidth: 740, margin: '0 auto' }}>
      {parents.map((node, idx) => {
        const role = (node.ownerType || '').toLowerCase()
        const children = subs(node.id)
        return (
          <div key={node.id || idx}>
            {idx > 0 && <div className="wf-arrow">&darr;</div>}
            <div className={`wf-card wf-card-${role}`} onClick={() => onSelectNode(node, String(idx + 1))} style={{ cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.15s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.12)' }} onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
              <span className="wf-card-step">{idx + 1}</span>
              <span className="wf-card-role">{OWNER_LABELS[role] || role || '--'}</span>
              {node.system && <div className="wf-card-system">{node.system}</div>}
              <div className="wf-card-what">{node.what || '(untitled)'}</div>
              {node.when && <div className="wf-card-when">{node.when}</div>}
              <div className="wf-card-tags">
                {node.isEmail && <span className="wf-tag">EMAIL</span>}
                {node.isRemote === false && !node.isEmail && <span className="wf-tag">IN-PERSON</span>}
                {node.isRemote && <span className="wf-tag">REMOTE</span>}
              </div>
            </div>
            {children.map((sub, si) => (
              <div key={sub.id || si} className="wf-subtask">
                <div className={`wf-card wf-card-${(sub.ownerType || '').toLowerCase()}`} onClick={() => onSelectNode(sub, `${idx + 1}.${si + 1}`)} style={{ cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.15s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.12)' }} onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                  <span className="wf-card-step">{idx + 1}.{si + 1}</span>
                  <span className="wf-card-role">{OWNER_LABELS[(sub.ownerType || '').toLowerCase()] || sub.ownerType || '--'}</span>
                  {sub.system && <div className="wf-card-system">{sub.system}</div>}
                  <div className="wf-card-what">{sub.what || '(untitled)'}</div>
                  {sub.when && <div className="wf-card-when">{sub.when}</div>}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ═══ WORKFLOW PAGE ═══ */

function WorkflowPage({ pageKey, hubData, onSave }) {
  const allData = hubData?.allData || {}
  const [roleFilter, setRoleFilter] = useState('all')
  const [view, setView] = useState('map')
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedStep, setSelectedStep] = useState('')
  const wfKeys = matchWfKeys(allData, pageKey)
  const allNodes = wfKeys.flatMap(k => allData[k]?.nodes || [])
  const notes = wfKeys.map(k => allData[k]?.notes).filter(Boolean).join('\n\n')
  const roles = [...new Set(allNodes.map(n => (n.ownerType || '').toLowerCase()).filter(Boolean))]

  const [localNotes, setLocalNotes] = useState(notes)
  const saveTimer = useRef(null)
  useEffect(() => { setLocalNotes(notes) }, [notes])

  const handleNotesChange = (val) => {
    setLocalNotes(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (wfKeys[0] && onSave) {
        const wf = { ...allData[wfKeys[0]], notes: val }
        onSave({ allData: { ...allData, [wfKeys[0]]: wf } })
      }
    }, 1500)
  }

  const handleSelectNode = (node, stepLabel) => {
    setSelectedNode(node)
    setSelectedStep(stepLabel)
  }

  return (
    <div>
      <div className="notes-box">
        <div className="notes-box-header">My Notes for this Workflow <span style={{ marginLeft: 'auto', fontSize: 11, color: '#b89d4a', fontWeight: 400 }}>Auto-saves</span></div>
        <textarea value={localNotes} onChange={e => handleNotesChange(e.target.value)} placeholder="Add your notes, reminders, or ideas for this workflow here..." />
      </div>

      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 16 }}>
        {[['map', 'Workflow Map'], ['sop', 'SOP Checklist']].map(([k, label]) => (
          <button key={k} onClick={() => setView(k)} style={{
            padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
            border: '1px solid #e5e2db', background: view === k ? '#fff' : 'transparent',
            boxShadow: view === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            color: view === k ? '#1a1a1a' : '#555', cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 12, fontSize: 13, color: '#555' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: 'var(--role-agent)', marginRight: 4, verticalAlign: -1 }} /> Agent</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: 'var(--role-admin)', marginRight: 4, verticalAlign: -1 }} /> Admin</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: 'var(--role-automated)', marginRight: 4, verticalAlign: -1 }} /> Automated</span>
      </div>

      {roles.length > 1 && (
        <div className="role-filters" style={{ justifyContent: 'center' }}>
          <button className={`role-filter ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => setRoleFilter('all')}>All Roles</button>
          {roles.map(r => (
            <button key={r} className={`role-filter ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(r)}>{OWNER_LABELS[r] || r}</button>
          ))}
        </div>
      )}

      {view === 'map' ? <WorkflowMap nodes={allNodes} roleFilter={roleFilter} onSelectNode={handleSelectNode} /> : (
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          {allNodes.map((node, i) => {
            const role = (node.ownerType || '').toLowerCase()
            return (
              <div key={node.id || i} onClick={() => handleSelectNode(node, String(i + 1))} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0ede8', alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = '#f9f8f6'} onMouseOut={e => e.currentTarget.style.background = ''}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `var(--role-${role || 'agent'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, color: `var(--role-${role || 'agent'}-text)` }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{node.what || '(untitled)'}</div>
                  {node.how && <div style={{ fontSize: 13, color: '#555', marginTop: 4, whiteSpace: 'pre-wrap', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{node.how}</div>}
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {node.ownerType && <span>{OWNER_LABELS[role] || node.ownerType}</span>}
                    {node.system && <span>{node.system}</span>}
                    {node.when && <span>{node.when}</span>}
                    {node.isEmail && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: '#e8f5e9', color: '#3d7a4a' }}>EMAIL</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>Click to view full SOP details</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {wfKeys.length === 0 && (
        <div style={{ textAlign: 'center', color: '#999', padding: 40, background: '#fff', border: '1px solid #e5e2db', borderRadius: 8 }}>
          This workflow hasn't been set up yet. Your CoreOps team will build this out for you!
        </div>
      )}

      {/* Slide-out detail panel */}
      {selectedNode && (
        <>
          <div onClick={() => setSelectedNode(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }} />
          <TaskDetailPanel node={selectedNode} stepLabel={selectedStep} onClose={() => setSelectedNode(null)} />
        </>
      )}
    </div>
  )
}

/* ═══ CONTENT PAGE (generic text fields) ═══ */

function ContentField({ field, data, onChange }) {
  const [val, setVal] = useState(data[field.key] || '')
  useEffect(() => { setVal(data[field.key] || '') }, [data[field.key]])
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{field.label}</label>
      <textarea
        value={val}
        onChange={e => { setVal(e.target.value); onChange(field.key, e.target.value) }}
        placeholder={field.placeholder || ''}
        style={{ width: '100%', minHeight: field.multiline ? 100 : 50, resize: 'vertical', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
      />
    </div>
  )
}

function ContentPage({ hubData, onSave, metaKey, fields, title, subtitle }) {
  const meta = hubData?._meta || {}
  const data = meta[metaKey] || {}
  const saveTimer = useRef(null)
  const handleChange = (field, val) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      onSave({ _meta: { ...meta, [metaKey]: { ...data, [field]: val } } })
    }, 1200)
  }
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 15, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>{subtitle}</p>}
      <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, padding: 24 }}>
        <div style={{ background: '#1a1a1a', color: '#fff', padding: '12px 20px', borderRadius: '8px 8px 0 0', margin: '-24px -24px 20px', fontSize: 16, fontWeight: 700 }}>{title}</div>
        {fields.map(f => <ContentField key={f.key} field={f} data={data} onChange={handleChange} />)}
      </div>
    </div>
  )
}

/* ═══ EMAIL TEMPLATE LIBRARY ═══ */

function EmailTemplatePage({ hubData }) {
  const allData = hubData?.allData || {}
  const groups = []
  Object.entries(allData).forEach(([wfKey, wf]) => {
    const emails = (wf?.nodes || []).filter(n => n.isEmail)
    if (emails.length > 0) {
      const name = wf?.name || wf?.label || wfKey.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/^Custom\s*/i, '')
      groups.push({ name, emails })
    }
  })

  const getStatus = (node) => {
    if (node.emailTemplate?.trim()) return { label: 'WRITTEN', color: '#3d7a4a' }
    if (node.emailStatus === 'ready') return { label: 'READY TO GENERATE', color: '#d4860b' }
    return { label: 'NEEDS TEMPLATE', color: '#c44' }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Email Template Library</h1>
      <p style={{ fontSize: 15, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>Every email across every workflow, in one place. Write the template once here, and the SOP links right back to it.</p>
      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: 40, background: '#fff', border: '1px solid #e5e2db', borderRadius: 8 }}>No email tasks found in your workflows yet.</div>
      ) : groups.map(g => (
        <div key={g.name} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#999', marginBottom: 8 }}>{g.name}</div>
          {g.emails.map((node, i) => {
            const status = getStatus(node)
            return (
              <div key={node.id || i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                background: '#fff', border: '1px solid #e5e2db',
                borderRadius: i === 0 ? '8px 8px 0 0' : i === g.emails.length - 1 ? '0 0 8px 8px' : 0,
                borderTop: i > 0 ? 'none' : undefined,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{node.what || '(untitled email)'}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{node.when || ''}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: status.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{status.label}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* Setup page is now in components/Setup.jsx */

/* ═══ PLACEHOLDER PAGE ═══ */

function PlaceholderPage({ title, subtitle }) {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 15, color: '#555', marginBottom: 24 }}>{subtitle}</p>}
      <div style={{ textAlign: 'center', color: '#999', padding: 40, background: '#fff', border: '1px solid #e5e2db', borderRadius: 8 }}>
        This section is being built. Check back soon!
      </div>
    </div>
  )
}

/* ═══ MAIN APP ═══ */

export default function App() {
  const [hub, setHub] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('overview')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const contentDiv = document.querySelector('.hub-content')
    if (contentDiv) {
      contentDiv.scrollTop = 0
    }
  }, [activePage])

  const slug = (() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('hub')) return p.get('hub')
    const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '')
    return path || null
  })()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const targetSlug = slug || 'default'
    loadHub(targetSlug)
      .then(d => { setHub(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!hub?.hub_data) return
    const r = document.documentElement

    // Apply hubBranding colors from hub data
    const b = hub.hub_data.hubBranding || {}
    const bg = hub.hub_data.allData?.['brand-guidelines'] || hub.hub_data._meta?.brandGuidelines || {}

    // hubBranding fields: accent, sidebarColor, sidebarTextColor, whoColor, whatColor, whereColor, accentLight
    const primary = bg.primaryColor || b.sidebarColor || b.primaryColor
    const accent = bg.accentColor || b.accent || b.accentColor
    const sidebarColor = b.sidebarColor
    const sidebarTextColor = b.sidebarTextColor
    const accentLight = b.accentLight

    if (primary && /^#[0-9A-Fa-f]{3,6}$/.test(primary)) {
      r.style.setProperty('--brand-primary', primary)
      r.style.setProperty('--brand-primary-dark', b.primaryDark || primary)
      r.style.setProperty('--color-primary', primary)
    }
    if (accent && /^#[0-9A-Fa-f]{3,6}$/.test(accent)) {
      r.style.setProperty('--brand-accent', accent)
      r.style.setProperty('--color-accent', accent)
    }
    if (sidebarColor) {
      r.style.setProperty('--sidebar-bg', sidebarColor)
    }
    if (sidebarTextColor) {
      r.style.setProperty('--sidebar-text', sidebarTextColor)
    }
    if (accentLight) {
      r.style.setProperty('--accent-light', accentLight)
    }

    // Apply roleColors from hub data
    const rc = hub.hub_data.roleColors || {}
    if (rc.agent?.color) r.style.setProperty('--role-agent', rc.agent.color)
    if (rc.agent?.textColor) r.style.setProperty('--role-agent-text', rc.agent.textColor)
    if (rc.admin?.color) r.style.setProperty('--role-admin', rc.admin.color)
    if (rc.admin?.textColor) r.style.setProperty('--role-admin-text', rc.admin.textColor)
    if (rc.automated?.color) r.style.setProperty('--role-automated', rc.automated.color)
    if (rc.automated?.textColor) r.style.setProperty('--role-automated-text', rc.automated.textColor)
  }, [hub])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }, [])

  const handleSave = useCallback(async (newData) => {
    if (!hub) return
    try {
      const merged = await saveHubData(hub.id, newData)
      setHub(prev => ({ ...prev, hub_data: merged }))
      showToast('Saved')
    } catch (err) {
      console.error('Save error:', err)
      showToast('Save failed')
    }
  }, [hub, showToast])

  if (loading) return <div className="loading-page"><div className="spinner" /><div style={{ color: '#999' }}>Loading your hub...</div></div>
  if (!hub) return <div className="login-page"><div className="login-card"><h1>Hub Not Found</h1><p>{slug ? `No hub found for "${slug}".` : 'No hub data found.'} Check your link or contact your CoreOps team.</p></div></div>

  const hubData = hub.hub_data || {}
  const meta = hubData._meta || {}
  const isAdminBypass = new URLSearchParams(window.location.search).get('admin') === 'true'
  const requiresAuth = hubData.requiresAuth !== false
  if (requiresAuth && !user && !isAdminBypass) {
    return <LoginPage onLogin={setUser} brandName={hubData.allData?.snapshot?.businessName || meta.snapshot?.businessName || meta.businessInfo?.businessName || hub.client_name || hub.client_slug} hubData={{ ...hubData, _hubSlug: hub.client_slug }} />
  }

  const brandName = hubData.allData?.snapshot?.businessName || meta.snapshot?.businessName || meta.businessInfo?.businessName || hub.client_name || hub.client_slug || 'Business Hub'
  const brandInitials = brandName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  // Get uploaded logo from brand guidelines (first logo in the array)
  const brandGuidelines = hubData.allData?.['brand-guidelines'] || meta.brandGuidelines || {}
  const uploadedLogo = (brandGuidelines.logos && brandGuidelines.logos.length > 0) ? brandGuidelines.logos[0].url : null

  // Build dynamic sidebar including custom workflows
  const customWorkflows = meta.customWorkflows || []
  const dynamicSidebar = buildSidebar(customWorkflows)
  const customWfKeys = customWorkflows.map(cw => customWfKey(cw.name))

  const currentItem = dynamicSidebar.find(s => s.key === activePage)
  const currentSection = (() => {
    let sec = ''
    for (const s of dynamicSidebar) {
      if (s.section !== undefined) sec = s.section
      if (s.key === activePage) return sec
    }
    return ''
  })()

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <BusinessSnapshot hubData={hubData} onSave={handleSave} />
      case 'core-foundation': return <CoreFoundation hubData={hubData} onSave={handleSave} />
      case 'target-audience':
        return <TargetAudience hubData={hubData} onSave={handleSave} />
      case 'brand-voice':
        return <BrandVoice hubData={hubData} onSave={handleSave} />
      case 'brand-guidelines':
        return <BrandGuidelines hubData={hubData} onSave={handleSave} />
      case 'lead-sources': return <LeadSources hubData={hubData} onSave={handleSave} />
      case 'lead-magnets': return <LeadMagnets hubData={hubData} onSave={handleSave} />
      case 'email-templates': return <EmailTemplateLibrary hubData={hubData} onSave={handleSave} />
      case 'crm-setup': return <CrmSetup hubData={hubData} onSave={handleSave} />
      case 'listing-marketing': return <ListingMarketing hubData={hubData} onSave={handleSave} />
      case 'pipeline': return <Pipeline hubData={hubData} onSave={handleSave} />
      case 'finances': return <Finances hubData={hubData} onSave={handleSave} />
      case 'team': return <Team hubData={hubData} onSave={handleSave} />
      case 'client-for-life': return <ClientForLife hubData={hubData} onSave={handleSave} onNavigate={(page) => setActivePage(page)} />
      case 'agent-referrals': return <AgentReferrals hubData={hubData} onSave={handleSave} />
      case 'vendor-partnerships': return <VendorPartnerships hubData={hubData} onSave={handleSave} />
      case 'setup': return <Setup hubData={hubData} onSave={handleSave} />
      default:
        if (WF_KEYS.includes(activePage)) return <WorkflowEditor pageKey={activePage} hubData={hubData} onSave={handleSave} onNavigate={(page) => setActivePage(page)} />
        if (customWfKeys.includes(activePage)) {
          const cwName = customWorkflows.find(cw => customWfKey(cw.name) === activePage)?.name || activePage
          if (!hubData.allData?.[activePage]) {
            const initData = { ...hubData.allData, [activePage]: { name: cwName, nodes: [] } }
            handleSave({ allData: initData })
          }
          return <WorkflowEditor pageKey={activePage} hubData={hubData} onSave={handleSave} onNavigate={(page) => setActivePage(page)} />
        }
        return <PlaceholderPage title={currentItem?.label || 'Coming Soon'} />
    }
  }

  return (
    <div className="hub-layout">
      <nav className="hub-sidebar">
        <div className="sidebar-header">
          {uploadedLogo ? (
            <img src={uploadedLogo} alt="Logo" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'contain', background: '#fff', flexShrink: 0 }} />
          ) : (
            <div className="sidebar-logo">{brandInitials}</div>
          )}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 }}>COREOPS</div>
            <div className="sidebar-brand-name">Business Hub</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
          {dynamicSidebar.map((item, idx) => {
            if (item.section !== undefined) {
              if (!item.section) return <div key={idx} style={{ height: 8 }} />
              return <div key={idx} className="sidebar-section">{item.section}</div>
            }
            const pct = getProgress(hubData, item.key)
            return (
              <div key={item.key} className={`sidebar-item ${activePage === item.key ? 'active' : ''}`} onClick={() => setActivePage(item.key)}>
                <span className="sidebar-item-label">{item.label}</span>
                <div className="sidebar-progress">
                  {pct >= 100 ? (
                    <span style={{ color: 'var(--brand-primary)', fontSize: 14, fontWeight: 700 }}>&#10003;</span>
                  ) : (
                    <>
                      <div className="progress-bar">
                        <div className={`progress-bar-fill ${pctClass(pct)}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#999', minWidth: 22 }}>{pct}%</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span className="sync-dot" />
            <span style={{ fontSize: 12 }}>Synced</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>CoreOps Team</span>
            <button onClick={() => supabase.auth.signOut()} style={{ fontSize: 12, color: '#999', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>Powered by CoreOps Collective</div>
        </div>
      </nav>

      <main className="hub-main">
        <div className="hub-header">
          <div className="hub-header-sub">SET UP YOUR SYSTEMS TO SCALE</div>
          <div className="hub-header-title">{currentItem?.label || 'Business Snapshot'}</div>
        </div>
        <div className="hub-content">{renderPage()}</div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
