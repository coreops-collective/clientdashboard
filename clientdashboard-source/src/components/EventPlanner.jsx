import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══ CONSTANTS ═══ */
const EVENT_TYPES = ['Client Appreciation', 'Networking', 'Community', 'Holiday', 'Educational', 'Other']
const OWNER_COLORS = {
  agent: { bg: 'rgb(195, 213, 159)', text: '#2d3e1f' },
  admin: { bg: 'rgb(236, 152, 163)', text: '#5c1a24' },
  automated: { bg: 'rgb(250, 226, 223)', text: '#6b3a34' },
  'agent/admin': { bg: 'rgb(210, 195, 220)', text: '#3a2d42' },
  'admin + agent': { bg: 'rgb(210, 195, 220)', text: '#3a2d42' },
}
// Helper to normalize owner for color lookup
function normalizeOwner(owner) {
  if (!owner) return 'agent'
  return owner.toLowerCase()
}

/* ═══ HELPER: Format Date ═══ */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ═══ HELPER: Parse Date ═══ */
function parseDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.split('T')[0]
}

/* ═══ HELPER: Calculate Due Date ═══ */
function calculateDueDate(eventDate, task) {
  if (!eventDate) return ''
  const d = new Date(eventDate + 'T00:00:00')
  // Support original hub format: weeksOut + daysOut
  if (task.weeksOut !== undefined) {
    d.setDate(d.getDate() - (task.weeksOut * 7))
    d.setDate(d.getDate() - (task.daysOut || 0))
  } else if (task.daysBeforeEvent !== undefined && task.daysBeforeEvent !== null) {
    // Legacy rebuild format
    d.setDate(d.getDate() - task.daysBeforeEvent)
  } else {
    return task.dueDate || ''
  }
  return d.toISOString().split('T')[0]
}

/* ═══ DEFAULT TASK TEMPLATE (weeksOut/daysOut matches original hub format) ═══ */
const DEFAULT_TASKS = [
  { name: 'Define event goal + audience', notes: 'Ex: gratitude, visibility, lead gen', owner: 'Agent', weeksOut: 9, daysOut: 0 },
  { name: 'Choose event format + venue', notes: 'In-person, virtual, co-hosted, etc.', owner: 'Agent/Admin', weeksOut: 8, daysOut: 0 },
  { name: 'Book venue + confirm date/time', notes: 'Include deposit and contracts if needed', owner: 'Admin', weeksOut: 8, daysOut: 0 },
  { name: 'Build guest list from CRM', notes: 'Use tags: clients, SOI, vendors, agents', owner: 'Admin', weeksOut: 6, daysOut: 0 },
  { name: 'Design + order promo materials', notes: 'Flyers, invites, signs, swag', owner: 'Admin', weeksOut: 6, daysOut: 0 },
  { name: "Send 'Save the Date' invite", notes: 'Email and/or mail', owner: 'Admin', weeksOut: 5, daysOut: 0 },
  { name: 'Create RSVP form or page', notes: 'Google Form, Eventbrite, website', owner: 'Admin', weeksOut: 5, daysOut: 0 },
  { name: 'Promote event on social media', notes: '1-2x/week leading up to event', owner: 'Agent/Admin', weeksOut: 4, daysOut: 0 },
  { name: 'Weekly RSVP check-ins + reminders', notes: 'Nudge non-responders', owner: 'Admin', weeksOut: 3, daysOut: 3 },
  { name: 'Order food, drinks, rentals', notes: 'Include dietary info if applicable', owner: 'Admin', weeksOut: 3, daysOut: 0 },
  { name: 'Confirm vendor partners/collabs', notes: 'Coordinate swag, co-hosting, giveaways', owner: 'Agent', weeksOut: 3, daysOut: 0 },
  { name: 'Prep gifts, name tags, check-in list', notes: 'Include any branded materials', owner: 'Admin', weeksOut: 1, daysOut: 0 },
  { name: 'Send event reminder + logistics', notes: 'Include parking, attire, directions', owner: 'Admin', weeksOut: 0, daysOut: 3 },
  { name: 'Day-of setup and coordination', notes: 'Arrive early, check signage, test audio', owner: 'Admin + Agent', weeksOut: 0, daysOut: 0 },
  { name: 'Greet guests + gather photos/video', notes: 'Capture for marketing', owner: 'Agent/Admin', weeksOut: 0, daysOut: 0 },
  { name: 'Same-day thank-you text or email', notes: 'Quick personal message', owner: 'Admin', weeksOut: 0, daysOut: 0 },
  { name: 'Full follow-up email or call', notes: "Thanks for coming - anything I can do for you?", owner: 'Agent', weeksOut: 0, daysOut: -2 },
  { name: 'Upload photos + social recap', notes: 'Tag attendees, vendors', owner: 'Admin', weeksOut: 0, daysOut: -3 },
  { name: 'Update CRM with attendance notes', notes: 'Mark tags and follow-up dates', owner: 'Admin', weeksOut: 0, daysOut: -3 },
  { name: 'Add new contacts to database', notes: 'Include walk-ins or +1s', owner: 'Admin', weeksOut: 0, daysOut: -3 },
  { name: 'Send survey or feedback (optional)', notes: 'Google Form, email with incentive', owner: 'Admin', weeksOut: 0, daysOut: -7 },
  { name: 'Archive event doc for next time', notes: 'Save checklist, what worked, what didn\'t', owner: 'Admin', weeksOut: 0, daysOut: -7 },
]

/* ═══ HELPER: Recalculate Task Dates ═══ */
function recalculateTaskDates(tasks, eventDate) {
  if (!eventDate) return tasks
  return tasks.map(task => {
    // Support both formats: weeksOut/daysOut (original) and daysBeforeEvent (legacy)
    if (task.weeksOut !== undefined || task.daysBeforeEvent !== undefined) {
      return {
        ...task,
        dueDate: calculateDueDate(eventDate, task),
      }
    }
    return task
  })
}

/* ═══ AUTO-SAVING INPUT FIELD ═══ */
function InputField({ label, value, onChange, placeholder, type = 'text', multiline = false }) {
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
      onChange?.(newVal)
    }, 1000)
  }

  const handleBlur = () => {
    clearTimeout(timer.current)
    if (val !== prevValue.current) {
      prevValue.current = val
      onChange?.(val)
    }
  }

  const Component = multiline ? 'textarea' : 'input'
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #e8e8e8',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    resize: multiline ? 'vertical' : 'none',
    minHeight: multiline ? 80 : 44,
    boxSizing: 'border-box',
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          {label}
        </label>
      )}
      <Component
        type={type}
        value={val}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )
}

/* ═══ COLLAPSIBLE SECTION ═══ */
function CollapsibleSection({ title, children, backgroundColor = '#1a1a1a', defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: backgroundColor,
          color: '#fff',
          border: 'none',
          borderRadius: isOpen ? '8px 8px 0 0' : 8,
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 13,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {title}
        <span style={{ fontSize: 12, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{
          padding: 16,
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: '0 0 8px 8px',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ═══ TASK ITEM ═══ */
function TaskItem({ task, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState(task)
  const timer = useRef(null)

  const save = (updates) => {
    const updated = { ...form, ...updates }
    setForm(updated)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onUpdate(updated), 1000)
  }

  const toggleStatus = () => {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    save({ status: newStatus })
  }

  const ownerKey = normalizeOwner(task.owner)
  const ownerStyle = OWNER_COLORS[ownerKey] || OWNER_COLORS.agent

  if (!expanded) {
    return (
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #f0ede8',
      }}>
        <input
          type="checkbox"
          checked={task.status === 'done'}
          onChange={toggleStatus}
          style={{ width: 18, height: 18, cursor: 'pointer' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: task.status === 'done' ? '#999' : '#1a1a1a',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
          }}>
            {task.name}
          </div>
          {task.notes && (
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              {task.notes}
            </div>
          )}
        </div>
        {task.dueDate && (
          <div style={{ fontSize: 11, color: '#777', whiteSpace: 'nowrap', minWidth: 60 }}>
            {formatDate(task.dueDate)}
          </div>
        )}
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '4px 8px',
          borderRadius: 4,
          background: ownerStyle.bg,
          color: ownerStyle.text,
          whiteSpace: 'nowrap',
        }}>
          {task.owner || 'Agent'}
        </span>
        <button
          onClick={() => setExpanded(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            color: '#999',
            padding: 0,
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ▶
        </button>
      </div>
    )
  }

  return (
    <div style={{
      padding: 12,
      background: '#f9f9f9',
      borderRadius: 8,
      marginBottom: 8,
      border: '1px solid #e8e8e8',
    }}>
      <button
        onClick={() => setExpanded(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 0',
          background: 'none',
          border: 'none',
          color: '#5a7c65',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 12,
          marginBottom: 12,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        ▼ Collapse
      </button>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Task Name
        </label>
        <input
          value={form.name || ''}
          onChange={(e) => save({ name: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '2px solid #e8e8e8',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Notes
        </label>
        <textarea
          value={form.notes || ''}
          onChange={(e) => save({ notes: e.target.value })}
          style={{
            width: '100%',
            minHeight: 60,
            padding: '8px 10px',
            border: '2px solid #e8e8e8',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>
            Owner
          </label>
          <select
            value={form.owner || 'agent'}
            onChange={(e) => save({ owner: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: 'none',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              background: ownerStyle.bg,
              color: ownerStyle.text,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
            <option value="agent/admin">Agent/Admin</option>
            <option value="automated">Automated</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>
            Due Date
          </label>
          <input
            type="date"
            value={parseDate(form.dueDate)}
            onChange={(e) => save({ dueDate: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '2px solid #e8e8e8',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <select
          value={form.status || 'pending'}
          onChange={(e) => save({ status: e.target.value })}
          style={{
            flex: 1,
            padding: '6px 8px',
            border: '2px solid #e8e8e8',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        >
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>
        <button
          onClick={onDelete}
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: '1px solid #ddd',
            color: '#c44',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          x
        </button>
      </div>
    </div>
  )
}

/* ═══ EVENT CARD ═══ */
function EventCard({ event, onUpdate, onDelete, vendors = [] }) {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState(event)
  const timer = useRef(null)

  const tasks = form.tasks || []
  const doneCount = tasks.filter(t => t.status === 'done').length
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0

  const save = (updates) => {
    const updated = { ...form, ...updates }
    setForm(updated)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onUpdate(updated), 1000)
  }

  const addTask = () => {
    const newTask = {
      id: `task-${Date.now()}`,
      name: '',
      notes: '',
      owner: 'agent',
      status: 'pending',
      dueDate: '',
    }
    save({ tasks: [...tasks, newTask] })
  }

  const updateTask = (updated) => {
    save({ tasks: tasks.map(t => t.id === updated.id ? updated : t) })
  }

  const deleteTask = (id) => {
    save({ tasks: tasks.filter(t => t.id !== id) })
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          width: '100%',
          padding: 16,
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          marginBottom: 12,
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
              {form.name || 'Untitled Event'}
            </div>
            <div style={{ fontSize: 12, color: '#777', marginBottom: 8 }}>
              {form.type || 'No type'} · {(form.eventDate || form.date) ? formatDate(form.eventDate || form.date) : 'No date'}
            </div>
            <div style={{
              height: 4,
              background: '#e8e8e8',
              borderRadius: 2,
              marginBottom: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: '#c3d59f',
                width: `${progress}%`,
                transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>
              {doneCount}/{tasks.length} tasks done · {progress}%
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              color: '#999',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ▶
          </span>
        </div>
      </button>
    )
  }

  return (
    <div style={{
      padding: 16,
      background: '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: 8,
      marginBottom: 12,
    }}>
      <button
        onClick={() => setExpanded(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 0',
          background: 'none',
          border: 'none',
          color: '#5a7c65',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 12,
          marginBottom: 12,
          fontFamily: 'inherit',
        }}
      >
        ▼
      </button>

      <InputField
        label="Event Name"
        value={form.name}
        onChange={(val) => save({ name: val })}
        placeholder="e.g., Summer Client Appreciation"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
            Event Type
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={form.type || ''}
              onChange={(e) => save({ type: e.target.value })}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '2px solid #e8e8e8',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            >
              <option value="">Select type</option>
              {EVENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              style={{
                padding: '10px 12px',
                background: '#f3f2f0',
                border: '2px solid #e8e8e8',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              + Add Type
            </button>
          </div>
        </div>

        <InputField
          label="Event Date"
          value={parseDate(form.eventDate || form.date)}
          onChange={(val) => {
            const currentTasks = form.tasks || []
            const newTasks = recalculateTaskDates(currentTasks, val)
            save({ eventDate: val, tasks: newTasks })
          }}
          type="date"
        />
      </div>

      <InputField
        label="Venue"
        value={form.venue}
        onChange={(val) => save({ venue: val })}
        placeholder="Physical location or online link"
      />

      <InputField
        label="Budget"
        value={form.budget || ''}
        onChange={(val) => save({ budget: val ? parseInt(val) : 0 })}
        type="number"
        placeholder="$0"
      />

      <InputField
        label="Notes"
        value={form.notes}
        onChange={(val) => save({ notes: val })}
        placeholder="Event strategy, ideas, or reminders..."
        multiline
      />

      <CollapsibleSection title="Event Sponsors" backgroundColor="#d1b8a2">
        <div style={{ fontSize: 12, color: '#777', marginBottom: 12 }}>
          Link to vendor partnerships
        </div>
        {(form.sponsors || []).length > 0 ? (
          <div style={{ marginBottom: 12 }}>
            {form.sponsors.map((sponsor, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e8e8e8',
              }}>
                <span style={{ fontSize: 12 }}>{sponsor}</span>
                <button
                  onClick={() => save({
                    sponsors: form.sponsors.filter((_, i) => i !== idx),
                  })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c44',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                >
                  remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
            No sponsors added yet
          </div>
        )}
        <button
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#f3f2f0',
            border: '2px solid #e8e8e8',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          + Link Vendor
        </button>
      </CollapsibleSection>

      <CollapsibleSection title={`Planning Timeline (${doneCount}/${tasks.length} done)`} backgroundColor="rgb(26, 26, 26)">
        <div style={{ marginBottom: 12 }}>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={updateTask}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>
        <button
          onClick={addTask}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 12,
            fontFamily: 'inherit',
          }}
        >
          + Add Task
        </button>
      </CollapsibleSection>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button
          onClick={() => onDelete()}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: 'none',
            border: '1px solid #ddd',
            color: '#c44',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 12,
            fontFamily: 'inherit',
          }}
        >
          Delete Event
        </button>
      </div>
    </div>
  )
}

/* ═══ POP-BY CARD ═══ */
function PopByCard({ item, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState(item)
  const timer = useRef(null)

  const save = (updates) => {
    const updated = { ...form, ...updates }
    setForm(updated)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onUpdate(updated), 1000)
  }

  const typeBgColor = form.type === 'pop-by' ? '#e8f5e9' : '#e3f2fd'
  const typeTextColor = form.type === 'pop-by' ? '#2e7d32' : '#1565c0'

  if (!expanded) {
    return (
      <div style={{
        padding: 12,
        background: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: 8,
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                {form.name || 'Untitled Send'}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                background: typeBgColor,
                color: typeTextColor,
                whiteSpace: 'nowrap',
                textTransform: 'capitalize',
              }}>
                {form.type || 'pop-by'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
              {form.date ? formatDate(form.date) : 'No date'}
            </div>
            {form.item && (
              <div style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>
                {form.item.length > 60 ? form.item.substring(0, 60) + '...' : form.item}
              </div>
            )}
            <div style={{ fontSize: 10, color: '#999' }}>
              Status: {form.status || 'planning'}
            </div>
          </div>
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              color: '#999',
              padding: 0,
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ▶
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: 12,
      background: '#f9f9f9',
      border: '1px solid #e8e8e8',
      borderRadius: 8,
      marginBottom: 8,
    }}>
      <button
        onClick={() => setExpanded(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 0',
          background: 'none',
          border: 'none',
          color: '#5a7c65',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 11,
          marginBottom: 8,
          fontFamily: 'inherit',
        }}
      >
        ▼ Collapse
      </button>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>
          Campaign Name
        </label>
        <input
          value={form.name || ''}
          onChange={(e) => save({ name: e.target.value })}
          style={{
            width: '100%',
            padding: '6px 10px',
            border: '2px solid #e8e8e8',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>
            Type
          </label>
          <select
            value={form.type || 'pop-by'}
            onChange={(e) => save({ type: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '2px solid #e8e8e8',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          >
            <option value="pop-by">Pop-By</option>
            <option value="mail-by">Mail-By</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>
            Send Date
          </label>
          <input
            type="date"
            value={parseDate(form.date)}
            onChange={(e) => save({ date: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '2px solid #e8e8e8',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>
          Item / Campaign Description
        </label>
        <textarea
          value={form.item || ''}
          onChange={(e) => save({ item: e.target.value })}
          style={{
            width: '100%',
            minHeight: 50,
            padding: '6px 10px',
            border: '2px solid #e8e8e8',
            borderRadius: 6,
            fontSize: 11,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>
            Status
          </label>
          <select
            value={form.status || 'planning'}
            onChange={(e) => save({ status: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '2px solid #e8e8e8',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          >
            <option value="planning">Planning</option>
            <option value="ready">Ready to Send</option>
            <option value="sent">Sent</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>
          Notes
        </label>
        <textarea
          value={form.notes || ''}
          onChange={(e) => save({ notes: e.target.value })}
          style={{
            width: '100%',
            minHeight: 40,
            padding: '6px 10px',
            border: '2px solid #e8e8e8',
            borderRadius: 6,
            fontSize: 11,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        onClick={onDelete}
        style={{
          width: '100%',
          padding: '6px 10px',
          background: 'none',
          border: '1px solid #ddd',
          color: '#c44',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 11,
          fontFamily: 'inherit',
        }}
      >
        Delete
      </button>
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */
export default function EventPlanner({ hubData, onSave }) {
  const [activeTab, setActiveTab] = useState('events')
  const [popByTab, setPopByTab] = useState('sends')
  const data = hubData?.allData?.['cfl-events'] || { events: [], popbySends: [], popbyClients: [] }

  const save = (updates) => {
    onSave({
      allData: {
        'cfl-events': { ...data, ...updates },
      },
    })
  }

  const addEvent = () => {
    const tasks = DEFAULT_TASKS.map((template, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      name: template.name,
      notes: template.notes,
      owner: template.owner,
      status: 'pending',
      dueDate: '',
      weeksOut: template.weeksOut,
      daysOut: template.daysOut,
    }))
    const newEvent = {
      id: `evt-${Date.now()}`,
      name: '',
      eventDate: '',
      type: '',
      venue: '',
      budget: 0,
      notes: '',
      sponsorIds: [],
      tasks: tasks,
    }
    save({ events: [...(data.events || []), newEvent] })
  }

  const updateEvent = (updated) => {
    save({ events: (data.events || []).map(e => e.id === updated.id ? updated : e) })
  }

  const deleteEvent = (id) => {
    save({ events: (data.events || []).filter(e => e.id !== id) })
  }

  const addPopBy = () => {
    const newPopBy = {
      id: `ps-${Date.now()}`,
      date: '',
      item: '',
      name: '',
      type: 'mail-by',
      notes: '',
      status: 'planning',
      targetZips: [],
      targetTypes: [],
    }
    save({ popbySends: [...(data.popbySends || []), newPopBy] })
  }

  const updatePopBy = (updated) => {
    save({ popbySends: (data.popbySends || []).map(p => p.id === updated.id ? updated : p) })
  }

  const deletePopBy = (id) => {
    save({ popbySends: (data.popbySends || []).filter(p => p.id !== id) })
  }

  const pastClients = hubData?.allData?.['client-for-life']?.clients || []

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}>
        Client for Life
      </h2>
      <p style={{ fontSize: 14, color: '#777', lineHeight: 1.6, marginBottom: 24 }}>
        Plan, execute, and track client appreciation events and pop-by campaigns that strengthen relationships.
      </p>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 24, borderBottom: '2px solid #e8e8e8' }}>
        <button
          onClick={() => setActiveTab('events')}
          style={{
            padding: '12px 16px',
            background: activeTab === 'events' ? '#fff' : 'transparent',
            border: activeTab === 'events' ? '2px solid #1a1a1a' : '2px solid transparent',
            borderBottom: activeTab === 'events' ? 'none' : '2px solid #e8e8e8',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === 'events' ? '#1a1a1a' : '#999',
          }}
        >
          Event Planner
        </button>
        <button
          onClick={() => setActiveTab('popbys')}
          style={{
            padding: '12px 16px',
            background: activeTab === 'popbys' ? '#fff' : 'transparent',
            border: activeTab === 'popbys' ? '2px solid #1a1a1a' : '2px solid transparent',
            borderBottom: activeTab === 'popbys' ? 'none' : '2px solid #e8e8e8',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === 'popbys' ? '#1a1a1a' : '#999',
          }}
        >
          Pop-Bys & Mail-Bys
        </button>
      </div>

      {/* EVENT PLANNER TAB */}
      {activeTab === 'events' && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#1a1a1a' }}>
            Event Planner
          </h3>
          <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>
            Build a 22-task planning timeline for each event. Track progress with task completion.
          </p>

          <CollapsibleSection title="Event SOP Reference" backgroundColor="#1a1a1a" defaultOpen={false}>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 8 }}>
                Each event includes a standard operating procedure with 22 planning tasks:
              </p>
              <ul style={{ paddingLeft: 20, marginBottom: 8 }}>
                <li>Phase 1: Define scope and goals</li>
                <li>Phase 2: Budget and logistics</li>
                <li>Phase 3: Invitations and vendor coordination</li>
                <li>Phase 4: Execution and management</li>
                <li>Phase 5: Debrief and ROI analysis</li>
              </ul>
              <p style={{ fontSize: 11, color: '#999' }}>
                Assign tasks to Agent, Admin, or Automated workflows.
              </p>
            </div>
          </CollapsibleSection>

          <button
            onClick={addEvent}
            style={{
              padding: '12px 16px',
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 16,
              fontFamily: 'inherit',
            }}
          >
            + Add Event
          </button>

          <div>
            {(data.events || []).map(event => (
              <EventCard
                key={event.id}
                event={event}
                onUpdate={updateEvent}
                onDelete={() => deleteEvent(event.id)}
              />
            ))}
          </div>

          {(data.events || []).length === 0 && (
            <div style={{
              padding: 32,
              background: '#f9f9f9',
              borderRadius: 8,
              textAlign: 'center',
              color: '#999',
              fontSize: 13,
            }}>
              No events yet. Click "+ Add Event" to get started.
            </div>
          )}
        </div>
      )}

      {/* POP-BYS & MAIL-BYS TAB */}
      {activeTab === 'popbys' && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#1a1a1a' }}>
            Pop-Bys & Mail-Bys
          </h3>
          <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>
            Plan surprise pop-by visits and mail-by campaigns to delight clients throughout the year.
          </p>

          <div style={{ display: 'flex', gap: 1, marginBottom: 16, borderBottom: '2px solid #e8e8e8' }}>
            <button
              onClick={() => setPopByTab('clients')}
              style={{
                padding: '10px 12px',
                background: popByTab === 'clients' ? '#fff' : 'transparent',
                border: popByTab === 'clients' ? '2px solid #1a1a1a' : '2px solid transparent',
                borderBottom: popByTab === 'clients' ? 'none' : '2px solid #e8e8e8',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: popByTab === 'clients' ? '#1a1a1a' : '#999',
              }}
            >
              Client List ({pastClients.length})
            </button>
            <button
              onClick={() => setPopByTab('sends')}
              style={{
                padding: '10px 12px',
                background: popByTab === 'sends' ? '#fff' : 'transparent',
                border: popByTab === 'sends' ? '2px solid #1a1a1a' : '2px solid transparent',
                borderBottom: popByTab === 'sends' ? 'none' : '2px solid #e8e8e8',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: popByTab === 'sends' ? '#1a1a1a' : '#999',
              }}
            >
              Sends & Campaigns
            </button>
          </div>

          {popByTab === 'clients' && (
            <div>
              {pastClients.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 12,
                }}>
                  {pastClients.map((client, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 12,
                        background: '#fff',
                        border: '1px solid #e8e8e8',
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
                        {client.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                        {client.closeDate ? formatDate(client.closeDate) : 'No close date'}
                      </div>
                      {client.status && (
                        <div style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: '#f0ede8',
                          color: '#555',
                          display: 'inline-block',
                        }}>
                          {client.status}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: 24,
                  background: '#f9f9f9',
                  borderRadius: 8,
                  textAlign: 'center',
                  color: '#999',
                  fontSize: 12,
                }}>
                  No clients yet - Add clients in the Past Clients & SOI tab in Client for Life to see them here.
                </div>
              )}
            </div>
          )}

          {popByTab === 'sends' && (
            <div>
              <button
                onClick={addPopBy}
                style={{
                  padding: '10px 14px',
                  background: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 12,
                  marginBottom: 12,
                  fontFamily: 'inherit',
                }}
              >
                + Add Send Campaign
              </button>

              <div>
                {(data.popbySends || []).map(popby => (
                  <PopByCard
                    key={popby.id}
                    item={popby}
                    onUpdate={updatePopBy}
                    onDelete={() => deletePopBy(popby.id)}
                  />
                ))}
              </div>

              {(data.popbySends || []).length === 0 && (
                <div style={{
                  padding: 24,
                  background: '#f9f9f9',
                  borderRadius: 8,
                  textAlign: 'center',
                  color: '#999',
                  fontSize: 12,
                }}>
                  No send campaigns yet. Click "+ Add Send Campaign" to create one.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
