import { useState, useEffect, useRef, useCallback, Component } from 'react'

/* ═══ ERROR BOUNDARY ═══ */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('AgentReferrals Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px 0' }}>Something went wrong</h3>
          <p style={{ fontSize: 14, color: 'rgb(102,102,102)', margin: 0 }}>There was an error loading the Agent Referrals page. Please refresh and try again.</p>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ marginTop: 12, fontSize: 12, color: '#666', background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Pre-loaded default steps
const DEFAULT_INBOUND_STEPS = [
  { step: 1, what: 'Receive referral inquiry from referring agent', when: '', how: '', ownerType: 'agent' },
  { step: 2, what: 'Vet the referral - confirm client details, timeline, needs', when: '', how: '', ownerType: 'agent' },
  { step: 3, what: 'Sign referral agreement (standard 25% referral fee)', when: '', how: '', ownerType: 'admin' },
  { step: 4, what: 'Add client to CRM and assign to pipeline', when: '', how: '', ownerType: 'admin' },
  { step: 5, what: 'Begin consultation process (Buyer or Seller workflow)', when: '', how: '', ownerType: 'agent' },
  { step: 6, what: 'Keep referring agent updated on progress', when: '', how: '', ownerType: 'agent' },
  { step: 7, what: 'Close the deal - process referral fee payment', when: '', how: '', ownerType: 'admin' },
  { step: 8, what: 'Send thank-you to referring agent', when: '', how: '', ownerType: 'agent' },
  { step: 9, what: 'Add referring agent to nurture/follow-up rotation', when: '', how: '', ownerType: 'automated' },
]

const DEFAULT_OUTBOUND_STEPS = [
  { step: 1, what: 'Client needs agent in another market', when: '', how: '', ownerType: 'agent' },
  { step: 2, what: 'Research and vet potential agents (reviews, production, reputation)', when: '', how: '', ownerType: 'agent' },
  { step: 3, what: 'Contact agent and confirm availability/willingness', when: '', how: '', ownerType: 'agent' },
  { step: 4, what: 'Sign referral agreement (standard 25% referral fee)', when: '', how: '', ownerType: 'admin' },
  { step: 5, what: 'Introduce client to receiving agent', when: '', how: '', ownerType: 'agent' },
  { step: 6, what: 'Follow up with client to confirm connection was made', when: '', how: '', ownerType: 'agent' },
  { step: 7, what: 'Track deal progress with receiving agent', when: '', how: '', ownerType: 'agent' },
  { step: 8, what: 'Collect referral fee at closing', when: '', how: '', ownerType: 'admin' },
  { step: 9, what: 'Add receiving agent to referral network', when: '', how: '', ownerType: 'automated' },
]

const ROLE_COLORS = {
  agent: { bg: 'rgb(195, 213, 159)', text: 'rgb(255, 255, 255)' },
  admin: { bg: 'rgb(236, 152, 163)', text: 'rgb(26, 26, 26)' },
  automated: { bg: 'rgb(250, 226, 223)', text: 'rgb(26, 26, 26)' },
}

/* ═══ AUTO-SAVING TEXTAREA ═══ */
function NotesField({ label, value, onSave, placeholder }) {
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

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label || 'My Notes'}</label>
      <textarea value={val} onChange={handleChange} placeholder={placeholder} style={{
        width: '100%', minHeight: 80, padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
        fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
      }} />
    </div>
  )
}

/* ═══ AUTO-SAVING TEXT INPUT ═══ */
function InputField({ value, onSave, placeholder, style }) {
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
    <input
      type="text"
      value={val}
      onChange={handleChange}
      placeholder={placeholder}
      style={{
        padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6,
        fontSize: 13, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
        ...style,
      }}
    />
  )
}

/* ═══ WORKFLOW STEP CARD (matching WorkflowEditor style) ═══ */
function WorkflowStepCard({ node, index, totalSteps, onToggleComplete, onUpdate }) {
  const role = (node.ownerType || '').toLowerCase()
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.agent
  const isComplete = node.completed || false

  const cardStyle = {
    cursor: 'pointer',
    borderRadius: '10px',
    width: '340px',
    position: 'relative',
    backgroundColor: isComplete ? 'rgb(240,245,240)' : roleColor.bg,
    color: isComplete ? '#999' : roleColor.text,
    border: isComplete ? '2px solid rgb(195, 213, 159)' : 'none',
    boxShadow: 'rgba(0, 0, 0, 0.08) 0px 2px 6px',
    margin: '0 auto 16px auto',
    opacity: isComplete ? 0.75 : 1,
    transition: 'all 0.2s',
  }

  const contentStyle = {
    padding: '10px 16px 12px',
  }

  const roleBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: isComplete ? 'rgb(195, 213, 159)' : 'rgb(26, 26, 26)',
    color: 'white',
    fontSize: '9px',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: '8px',
    width: 'fit-content',
  }

  const checkboxStyle = {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    marginRight: '8px',
    accentColor: 'rgb(195, 213, 159)',
  }

  const titleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: '1.35',
    marginBottom: '6px',
    textDecoration: isComplete ? 'line-through' : 'none',
  }

  const metaStyle = {
    fontSize: '12px',
    opacity: 0.8,
    marginTop: '4px',
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  }

  return (
    <div style={cardStyle}>
      <div style={contentStyle}>
        <div style={headerStyle}>
          <input
            type="checkbox"
            checked={isComplete}
            onChange={(e) => {
              e.stopPropagation()
              onToggleComplete?.()
            }}
            style={checkboxStyle}
          />
          <div style={roleBadgeStyle}>
            {role === 'agent' ? 'Agent' : role === 'admin' ? 'Admin' : 'Automated'}
          </div>
        </div>
        <div style={titleStyle}>
          {node.what || '(untitled)'}
        </div>
        {node.when && <div style={metaStyle}>When: {node.when}</div>}
        {node.how && <div style={metaStyle}>How: {node.how}</div>}
      </div>
      {index < totalSteps - 1 && (
        <div style={{ textAlign: 'center', color: isComplete ? '#ccc' : roleColor.text, opacity: 0.4, fontSize: '20px', paddingBottom: '8px' }}>
          v
        </div>
      )}
    </div>
  )
}

/* ═══ REFERRAL TRACKING FORM ═══ */
function ReferralTrackingForm({ agents, onLogReferral }) {
  const [formData, setFormData] = useState({
    agentName: '',
    clientName: '',
    date: '',
    status: 'pending',
    feePercentage: 25,
  })

  const handleSubmit = () => {
    if (!formData.agentName || !formData.clientName || !formData.date) {
      alert('Please fill in Agent Name, Client Name, and Date')
      return
    }
    onLogReferral(formData)
    setFormData({ agentName: '', clientName: '', date: '', status: 'pending', feePercentage: 25 })
  }

  return (
    <div style={{ marginBottom: 32, padding: 24, background: '#f9f9f9', borderRadius: 12, border: '1px solid rgb(243,242,240)' }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px 0' }}>Log a Referral</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Agent Name</label>
          <select
            value={formData.agentName}
            onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
            style={{
              width: '100%', padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6,
              fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          >
            <option value="">Select an agent...</option>
            {agents.map(a => (
              <option key={a.id} value={a.name}>{a.name || '(Unnamed)'}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Client Name</label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            placeholder="Client name"
            style={{
              width: '100%', padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6,
              fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            style={{
              width: '100%', padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6,
              fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            style={{
              width: '100%', padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6,
              fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Fee %</label>
          <input
            type="number"
            value={formData.feePercentage}
            onChange={(e) => setFormData({ ...formData, feePercentage: parseInt(e.target.value) || 25 })}
            style={{
              width: '100%', padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6,
              fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        style={{
          padding: '10px 20px', background: '#5a7c65', color: '#fff', border: 'none',
          borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Log Referral
      </button>
    </div>
  )
}

/* ═══ REFERRAL NETWORK DIRECTORY ═══ */
function ReferralDirectory({ agents, onSave, hubData }) {
  // Defensive check: ensure agents is always an array
  const agentsArray = Array.isArray(agents) ? agents : []

  const addAgent = () => {
    const updated = [...agentsArray, {
      id: Date.now().toString(),
      name: '',
      brokerage: '',
      market: '',
      specialty: '',
      phone: '',
      email: '',
      mailingAddress: '',
      birthday: '',
      favorites: '',
      referralClients: [],
      notes: '',
      referralFee: 25,
    }]
    onSave(updated)
  }

  const logReferral = (referralData) => {
    // Find the agent and add to their referralClients array
    const updated = agentsArray.map(a => {
      if (a.name === referralData.agentName) {
        return {
          ...a,
          referralClients: [...(a.referralClients || []), {
            id: Date.now().toString(),
            ...referralData,
          }],
        }
      }
      return a
    })
    onSave(updated)
  }

  const updateAgent = (id, field, val) => {
    const updated = agentsArray.map(a => a.id === id ? { ...a, [field]: val } : a)
    onSave(updated)
  }

  const removeAgent = (id) => {
    onSave(agentsArray.filter(a => a.id !== id))
  }

  // Count referrals for an agent based on pipeline data
  const countReferrals = (agentName) => {
    if (!hubData || !hubData.allData || !hubData.allData.pipeline) {
      return { inbound: 0, outbound: 0 }
    }
    const deals = hubData.allData.pipeline || []
    let inbound = 0
    let outbound = 0
    deals.forEach(deal => {
      if (deal.agentReferral === agentName) {
        if (deal.referralType === 'inbound') inbound++
        else if (deal.referralType === 'outbound') outbound++
      }
    })
    return { inbound, outbound }
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <ReferralTrackingForm agents={agentsArray} onLogReferral={logReferral} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Referral Network Directory</h3>
        <button
          onClick={addAgent}
          style={{
            padding: '7px 14px', background: '#fff', color: '#1a1a1a', border: '1px solid rgb(230,228,223)',
            borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          + Add Agent
        </button>
      </div>

      {agentsArray.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', border: '1px solid rgb(243,242,240)', borderRadius: 8, color: 'rgb(153,153,153)', fontSize: 14 }}>
          No referral agents in your network yet. Add your first contact.
        </div>
      )}

      {Array.isArray(agentsArray) && agentsArray.map((agent) => {
        const { inbound, outbound } = countReferrals(agent.name)
        return (
          <div key={agent.id} style={{
            padding: 24, background: '#fff', border: '1px solid rgb(243,242,240)', borderRadius: 12,
            marginBottom: 16, position: 'relative', boxShadow: 'rgba(0, 0, 0, 0.04) 0px 1px 3px',
          }}>
            <button
              onClick={() => removeAgent(agent.id)}
              style={{
                position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
                color: '#999', cursor: 'pointer', fontSize: 16, padding: 0, hover: { color: '#1a1a1a' },
              }}
            >
              ✕
            </button>

            {/* Agent Name - Editable */}
            <div style={{ marginBottom: 12 }}>
              <InputField
                value={agent.name}
                onSave={(v) => updateAgent(agent.id, 'name', v)}
                placeholder="Agent Name"
                style={{ fontSize: 18, fontWeight: 700, border: agent.name ? '2px solid transparent' : '2px solid #e8e8e8', padding: '6px 12px' }}
              />
            </div>

            {/* Brokerage and Market */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 14, color: 'rgb(102,102,102)' }}>
              <div>
                <span style={{ fontWeight: 600, marginRight: 6 }}>Brokerage:</span>
                <InputField value={agent.brokerage} onSave={(v) => updateAgent(agent.id, 'brokerage', v)} placeholder="Brokerage Name" style={{ marginTop: 4 }} />
              </div>
              <div>
                <span style={{ fontWeight: 600, marginRight: 6 }}>Market:</span>
                <InputField value={agent.market} onSave={(v) => updateAgent(agent.id, 'market', v)} placeholder="City / Region" style={{ marginTop: 4 }} />
              </div>
            </div>

            {/* Contact Info Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Phone</label>
                <InputField value={agent.phone} onSave={(v) => updateAgent(agent.id, 'phone', v)} placeholder="Phone Number" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Email</label>
                <InputField value={agent.email} onSave={(v) => updateAgent(agent.id, 'email', v)} placeholder="Email Address" />
              </div>
            </div>

            {/* Mailing Address - Full Width */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Mailing Address</label>
              <InputField value={agent.mailingAddress} onSave={(v) => updateAgent(agent.id, 'mailingAddress', v)} placeholder="Street Address" />
            </div>

            {/* Birthday and Favorites */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Birthday</label>
                <input
                  type="date"
                  value={agent.birthday ?? ''}
                  onChange={(e) => updateAgent(agent.id, 'birthday', e.target.value)}
                  style={{
                    padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6,
                    fontSize: 13, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Favorites / Preferences</label>
                <InputField value={agent.favorites} onSave={(v) => updateAgent(agent.id, 'favorites', v)} placeholder="e.g., Golf, Coffee, Wine..." />
              </div>
            </div>

            {/* Referral Tracking and Fee Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16, padding: '12px', background: 'rgb(250,250,250)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>Referral Activity</div>
                <div style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 600 }}>
                  Inbound: <span style={{ color: 'rgb(90, 180, 90)' }}>{inbound}</span> | Outbound: <span style={{ color: 'rgb(180, 90, 90)' }}>{outbound}</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Referral Fee</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number"
                    value={agent.referralFee ?? 25}
                    onChange={(e) => updateAgent(agent.id, 'referralFee', parseInt(e.target.value) || 25)}
                    style={{
                      padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6,
                      fontSize: 13, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ paddingTop: 8, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap' }}>%</span>
                </div>
              </div>
            </div>

            {/* Specialty and Notes */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Specialty</label>
              <InputField value={agent.specialty} onSave={(v) => updateAgent(agent.id, 'specialty', v)} placeholder="Buyer / Seller / Both" />
            </div>

            {/* Notes */}
            <NotesField
              label="Notes"
              value={agent.notes}
              onSave={(v) => updateAgent(agent.id, 'notes', v)}
              placeholder="Any additional notes about this agent..."
            />
          </div>
        )
      })}
    </div>
  )
}

/* ═══ WORKFLOW STEPS VIEW ═══ */
function WorkflowStepsView({ label, desc, data, onSave, defaultSteps }) {
  // Support both nodes array and legacy steps array
  const nodesArray = (Array.isArray(data.nodes) && data.nodes.length > 0)
    ? data.nodes
    : (Array.isArray(data.steps) && data.steps.length > 0)
      ? data.steps
      : (Array.isArray(defaultSteps) ? defaultSteps : [])

  const saveNodes = (updated) => {
    onSave({ ...data, nodes: updated })
  }

  const addNode = () => {
    const newNode = {
      id: Date.now().toString(),
      order: (nodesArray.length || 0) + 1,
      what: '',
      when: '',
      how: '',
      why: '',
      kpis: '',
      type: 'task',
      ownerType: 'agent',
      taskTags: [],
      system: '',
      assignee: '',
    }
    saveNodes([...nodesArray, newNode])
  }

  const updateNode = (updated) => {
    saveNodes(nodesArray.map(n => (n.id || n.step || n.order) === (updated.id || updated.step || updated.order) ? updated : n))
  }

  const toggleNodeComplete = (nodeId) => {
    const updated = nodesArray.map(n => {
      if ((n.id || n.step || n.order) === nodeId) {
        return { ...n, completed: !n.completed }
      }
      return n
    })
    saveNodes(updated)
  }

  const deleteNode = (id) => {
    saveNodes(nodesArray.filter(n => (n.id || n.step || n.order) !== id))
  }

  return (
    <div>
      <p style={{ fontSize: 14, color: 'rgb(102,102,102)', lineHeight: 1.6, marginBottom: 24 }}>{desc}</p>

      <NotesField
        label="Strategy Notes"
        value={data.notes}
        onSave={(val) => onSave({ ...data, notes: val })}
        placeholder={`Strategy notes for ${label.toLowerCase()}...`}
      />

      <NotesField
        label="Referral Fee Agreement"
        value={data.feeAgreement}
        onSave={(val) => onSave({ ...data, feeAgreement: val })}
        placeholder="e.g., Standard 25% referral fee, paid at closing. Referral agreement signed before first showing."
      />

      <div style={{ marginTop: 28, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px 0' }}>Process Steps</h3>
        <div style={{ textAlign: 'center' }}>
          {Array.isArray(nodesArray) && nodesArray.map((node, idx) => (
            <WorkflowStepCard
              key={node.id || node.step || node.order}
              node={node}
              index={idx}
              totalSteps={nodesArray.length}
              onToggleComplete={() => toggleNodeComplete(node.id || node.step || node.order)}
              onUpdate={updateNode}
            />
          ))}
        </div>
        <button
          onClick={addNode}
          style={{
            width: '100%', padding: '12px 20px', background: '#1a1a1a', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, marginTop: 8,
          }}
        >
          + Add Step
        </button>
      </div>
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */
function AgentReferralsContent({ hubData, onSave }) {
  const allData = hubData?.allData || {}
  const meta = hubData?._meta || {}

  // Read from THREE separate allData keys - check allData first (primary source), then _meta as fallback
  const refData = allData['agent-referrals'] ? { ...allData['agent-referrals'] } : (meta.agentReferrals ? { ...meta.agentReferrals } : {})

  // Initialize workflow data with default steps if not present
  const inboundData = allData['agent-referral-inbound']
    ? { ...allData['agent-referral-inbound'] }
    : { nodes: DEFAULT_INBOUND_STEPS.map(s => ({ ...s, id: `default-inbound-${s.step}` })), notes: '', feeAgreement: '' }

  const outboundData = allData['agent-referral-outbound']
    ? { ...allData['agent-referral-outbound'] }
    : { nodes: DEFAULT_OUTBOUND_STEPS.map(s => ({ ...s, id: `default-outbound-${s.step}` })), notes: '', feeAgreement: '' }

  const [activeSubPage, setActiveSubPage] = useState(null)

  // Defensive: ensure agents is an array (original hub uses "directory" key)
  // First check directory, then agents, then default to empty array
  const agents = (() => {
    if (Array.isArray(refData?.directory)) return refData.directory
    if (Array.isArray(refData?.agents)) return refData.agents
    return []
  })()
  const inboundNodes = Array.isArray(inboundData?.nodes) ? inboundData.nodes : []
  const outboundNodes = Array.isArray(outboundData?.nodes) ? outboundData.nodes : []

  // Save agents to agent-referrals (use "directory" key to match original hub)
  const saveDirectory = useCallback((updatedAgents) => {
    const updatedRef = { ...refData, directory: updatedAgents }
    onSave({
      allData: { ...allData, 'agent-referrals': updatedRef },
      _meta: { agentReferrals: updatedRef },
    })
  }, [onSave, refData, allData])

  // Save inbound workflow to agent-referral-inbound
  const saveInboundWorkflow = useCallback((workflowData) => {
    const updatedInbound = { ...inboundData, ...workflowData }
    onSave({
      allData: { ...allData, 'agent-referral-inbound': updatedInbound },
    })
  }, [onSave, inboundData, allData])

  // Save outbound workflow to agent-referral-outbound
  const saveOutboundWorkflow = useCallback((workflowData) => {
    const updatedOutbound = { ...outboundData, ...workflowData }
    onSave({
      allData: { ...allData, 'agent-referral-outbound': updatedOutbound },
    })
  }, [onSave, outboundData, allData])

  const SUB_PAGES = [
    {
      key: 'inbound',
      label: 'Inbound Referrals',
      desc: 'When another agent sends you a client. Track the referral, serve the client, pay the fee, nurture the relationship.',
      defaultSteps: DEFAULT_INBOUND_STEPS.map(s => ({ ...s, id: `default-inbound-${s.step}` })),
    },
    {
      key: 'outbound',
      label: 'Outbound Referrals',
      desc: 'When you send a client to another agent. Vet the agent, protect your client, collect your fee, maintain the connection.',
      defaultSteps: DEFAULT_OUTBOUND_STEPS.map(s => ({ ...s, id: `default-outbound-${s.step}` })),
    },
  ]

  if (activeSubPage) {
    const page = SUB_PAGES.find(p => p.key === activeSubPage)

    // Get the correct workflow data based on which page is active
    let pageData = {}
    let saveHandler = null

    if (activeSubPage === 'inbound') {
      pageData = inboundData
      saveHandler = saveInboundWorkflow
    } else if (activeSubPage === 'outbound') {
      pageData = outboundData
      saveHandler = saveOutboundWorkflow
    }

    return (
      <div>
        <button
          onClick={() => setActiveSubPage(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', background: 'none', border: 'none',
            color: '#5a7c65', cursor: 'pointer', fontWeight: 600, fontSize: 13, marginBottom: 20,
          }}
        >
          Back to Agent to Agent Referrals
        </button>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20, color: '#1a1a1a' }}>{page.label}</h2>
        <WorkflowStepsView
          label={page.label}
          desc={page.desc}
          data={pageData}
          onSave={saveHandler}
          defaultSteps={page.defaultSteps}
        />
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#1a1a1a' }}>Agent to Agent Referrals</h1>
      <p style={{ fontSize: 14, color: 'rgb(102,102,102)', marginBottom: 28, lineHeight: 1.6 }}>
        Referrals are the highest-converting lead source in real estate. Track your referral network, build workflows for inbound/outbound referrals, and nurture these relationships.
      </p>

      <ReferralDirectory agents={agents} onSave={saveDirectory} hubData={hubData} />

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr' }}>
        {Array.isArray(SUB_PAGES) && SUB_PAGES.map((page) => (
          <div
            key={page.key}
            onClick={() => setActiveSubPage(page.key)}
            style={{
              padding: '32px', background: '#fff', border: '1px solid rgb(243,242,240)', borderRadius: 12,
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#1a1a1a' }}>{page.label}</h3>
            <p style={{ fontSize: 14, color: 'rgb(102,102,102)', lineHeight: 1.6, margin: 0 }}>{page.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AgentReferrals(props) {
  return (
    <ErrorBoundary>
      <AgentReferralsContent {...props} />
    </ErrorBoundary>
  )
}
