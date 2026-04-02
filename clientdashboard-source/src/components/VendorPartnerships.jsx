import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══ AUTO-SAVING FIELD ═══ */
function Field({ label, value, onSave, placeholder, multiline = false, type = 'text' }) {
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
    timer.current = setTimeout(() => { prevValue.current = newVal; onSave?.(newVal) }, 1200)
  }

  const handleBlur = () => {
    clearTimeout(timer.current)
    if (val !== prevValue.current) { prevValue.current = val; onSave?.(val) }
  }

  const Component = multiline ? 'textarea' : 'input'
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      <Component
        type={type}
        value={val}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '2px solid #e8e8e8',
          borderRadius: 8,
          fontSize: 13,
          fontFamily: 'inherit',
          resize: multiline ? 'vertical' : 'none',
          minHeight: multiline ? 80 : 44,
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

/* ═══ MODAL ═══ */
function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, paddingLeft: 16, paddingRight: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#999' }}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ═══ DEFAULT CATEGORIES ═══ */
const DEFAULT_CATEGORIES = [
  'Lender', 'Inspector', 'Appraiser', 'Title Company', 'Home Warranty',
  'Photographer', 'Stager', 'Handyman', 'Plumber', 'Electrician',
  'HVAC', 'Roofer', 'Landscaper', 'Painter', 'Pest Control',
  'Cleaning Service', 'Moving Company', 'Insurance Agent', 'Attorney', 'Mortgage Broker',
]

/* ═══ VENDOR CARD ═══ */
function VendorCard({ vendor, onUpdate, onDelete, sponsorshipHistory }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid rgb(243,242,240)', borderRadius: 8, padding: 16, marginBottom: 12
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{vendor.name}</div>              <div style={{ fontSize: 12, color: '#777' }}>{vendor.company}</div>
            </div>
            {vendor.isPrimary && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 4,
                background: '#5a7c65', color: '#fff', whiteSpace: 'nowrap'
              }}>PRIMARY</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
            <strong>{vendor.category || 'Uncategorized'}</strong>
          </div>
          {vendor.phone && (
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{vendor.phone}</div>
          )}
          {vendor.email && (
            <div style={{ fontSize: 12, color: '#0066cc', marginBottom: 4 }}>
              <a href={`mailto:${vendor.email}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
                {vendor.email}
              </a>
            </div>
          )}
          {vendor.birthday && (
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Birthday: {new Date(vendor.birthday).toLocaleDateString()}</div>
          )}
          {vendor.mailingAddress && (
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{vendor.mailingAddress}</div>
          )}
          {vendor.notes && (
            <div style={{ fontSize: 12, color: '#777', marginTop: 8, fontStyle: 'italic' }}>{vendor.notes}</div>
          )}
          {sponsorshipHistory && sponsorshipHistory.length > 0 && (
            <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
              Sponsored {sponsorshipHistory.length} event{sponsorshipHistory.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
          <button
            onClick={() => onUpdate({ ...vendor, isPrimary: !vendor.isPrimary })}
            title={vendor.isPrimary ? 'Remove primary' : 'Set as primary'}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: vendor.isPrimary ? '#5a7c65' : '#f0ede8', color: vendor.isPrimary ? '#fff' : '#555',
              border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 16, fontWeight: 'bold'
            }}
          >*</button>
          <button
            onClick={onDelete}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: '1px solid #ddd', color: '#c44',
              borderRadius: '50%', cursor: 'pointer', fontSize: 16, fontWeight: 'bold'
            }}
          >x</button>
        </div>
      </div>
    </div>
  )
}

/* ═══ VENDOR FORM MODAL ═══ */
function VendorFormModal({ isOpen, onClose, vendor, onSave, customCategories }) {
  const [form, setForm] = useState(vendor || {
    name: '', company: '', category: '', phone: '', email: '',
    birthday: '', mailingAddress: '', whyRecommend: '', notes: '', isPrimary: false,
  })
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    if (vendor) setForm(vendor)
  }, [vendor, isOpen])

  const handleSave = () => {
    onSave(form)
    onClose()
  }

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories].filter(c => c && c.trim())
  const uniqueCategories = [...new Set(allCategories)]

  return (
    <Modal isOpen={isOpen} title={vendor?.id ? 'Edit Vendor' : 'Add Vendor'} onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Contact Name
        </label>
        <input
          type="text"
          value={form.name || ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Company
        </label>
        <input
          type="text"
          value={form.company || ''}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          placeholder="Company name"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Category
        </label>
        <select
          value={form.category || ''}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        >
          <option value="">Select a category</option>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Phone
        </label>
        <input
          type="tel"
          value={form.phone || ''}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="(555) 123-4567"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Email
        </label>
        <input
          type="email"
          value={form.email || ''}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="email@example.com"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Birthday
        </label>
        <input
          type="date"
          value={form.birthday || ''}
          onChange={(e) => setForm({ ...form, birthday: e.target.value })}
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Mailing Address
        </label>
        <input
          type="text"
          value={form.mailingAddress || ''}
          onChange={(e) => setForm({ ...form, mailingAddress: e.target.value })}
          placeholder="Street address, city, state, zip"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Why Recommend
        </label>
        <textarea
          value={form.whyRecommend || ''}
          onChange={(e) => setForm({ ...form, whyRecommend: e.target.value })}
          placeholder="Why do you recommend this vendor?"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', minHeight: 80, boxSizing: 'border-box', resize: 'vertical',
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Notes
        </label>
        <textarea
          value={form.notes || ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any additional notes"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', minHeight: 80, boxSizing: 'border-box', resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px', background: '#fff', color: '#555', border: '2px solid #e8e8e8',
            borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit'
          }}
        >
          Save Vendor
        </button>
      </div>
    </Modal>
  )
}

/* ═══ RESOURCE FORM MODAL ═══ */
function ResourceFormModal({ isOpen, onClose, resource, onSave }) {
  const [form, setForm] = useState(resource || {
    name: '', category: '', vendor: '', cost: '', url: '', notes: '',
  })

  useEffect(() => {
    if (resource) setForm(resource)
  }, [resource, isOpen])

  const handleSave = () => {
    onSave(form)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} title={resource?.id ? 'Edit Resource' : 'Add Resource'} onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Resource Name
        </label>
        <input
          type="text"
          value={form.name || ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., Business Cards, Lockbox"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Category
        </label>
        <select
          value={form.category || ''}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        >
          <option value="">Select a category</option>
          {DEFAULT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Vendor/Supplier
        </label>
        <input
          type="text"
          value={form.vendor || ''}
          onChange={(e) => setForm({ ...form, vendor: e.target.value })}
          placeholder="Where you order from"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Cost
        </label>
        <input
          type="text"
          value={form.cost || ''}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
          placeholder="$X.XX per unit"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Link
        </label>
        <input
          type="url"
          value={form.url || ''}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://..."
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Notes
        </label>
        <textarea
          value={form.notes || ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any additional notes"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', minHeight: 80, boxSizing: 'border-box', resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px', background: '#fff', color: '#555', border: '2px solid #e8e8e8',
            borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit'
          }}
        >
          Save Resource
        </button>
      </div>
    </Modal>
  )
}

/* ═══ EVENT FORM MODAL ═══ */
function EventFormModal({ isOpen, onClose, event, onSave, vendors, availableEvents = [] }) {
  const [form, setForm] = useState(event || {
    eventName: '', eventDate: '', eventType: '', sponsors: [], linkedEventId: null,
  })
  const [sponsorDetails, setSponsorDetails] = useState(event?.sponsorDetails || {})
  const [useExistingEvent, setUseExistingEvent] = useState(false)

  useEffect(() => {
    if (event) {
      setForm(event)
      setSponsorDetails(event?.sponsorDetails || {})
    }
  }, [event, isOpen])

  const handleSave = () => {
    onSave({ ...form, sponsorDetails })
    onClose()
  }

  const handleSponsorToggle = (vendorId) => {
    setForm({
      ...form,
      sponsors: form.sponsors.includes(vendorId)
        ? form.sponsors.filter(id => id !== vendorId)
        : [...(form.sponsors || []), vendorId]
    })
  }

  return (
    <Modal isOpen={isOpen} title={event?.id ? 'Edit Event' : 'Add Event'} onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Event Name
        </label>
        <input
          type="text"
          value={form.eventName || ''}
          onChange={(e) => setForm({ ...form, eventName: e.target.value })}
          placeholder="e.g., Spring Market, Chamber Mixer"
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Event Date
        </label>
        <input
          type="date"
          value={form.eventDate || ''}
          onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Event Type
        </label>
        <select
          value={form.eventType || ''}
          onChange={(e) => setForm({ ...form, eventType: e.target.value })}
          style={{
            width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        >
          <option value="">Select type</option>
          <option value="Community">Community</option>
          <option value="Networking">Networking</option>
          <option value="Marketing">Marketing</option>
          <option value="Sponsorship">Sponsorship</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {availableEvents.length > 0 && (
        <div style={{ marginBottom: 24, padding: 16, background: '#f9f8f6', borderRadius: 8, border: '1px solid rgb(243,242,240)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={useExistingEvent}
              onChange={(e) => {
                setUseExistingEvent(e.target.checked)
                if (!e.target.checked) setForm({ ...form, linkedEventId: null })
              }}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>Link to existing event</span>
          </label>
          {useExistingEvent && (
            <select
              value={form.linkedEventId || ''}
              onChange={(e) => setForm({ ...form, linkedEventId: e.target.value || null })}
              style={{
                width: '100%', padding: '10px 12px', border: '2px solid #e8e8e8', borderRadius: 8,
                fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            >
              <option value="">Select an event</option>
              {availableEvents.map(evt => (
                <option key={evt.id} value={evt.id}>{evt.name} ({new Date(evt.date).toLocaleDateString()})</option>
              ))}
            </select>
          )}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 12 }}>
          Sponsors
        </label>
        {vendors.length === 0 ? (
          <div style={{ fontSize: 13, color: '#999' }}>No vendors yet. Add vendors first to assign sponsorships.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vendors.map(vendor => (
              <label key={vendor.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.sponsors?.includes(vendor.id) || false}
                  onChange={() => handleSponsorToggle(vendor.id)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{vendor.name} ({vendor.company})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px', background: '#fff', color: '#555', border: '2px solid #e8e8e8',
            borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit'
          }}
        >
          Save Event
        </button>
      </div>
    </Modal>
  )
}

export default function VendorPartnerships({ hubData, onSave }) {
  const sourceData = hubData?.allData?.['vendor-partnerships'] || hubData?._meta?.vendorPartnerships || {}
  const vendors = sourceData.vendors || []
  const resources = sourceData.resources || []
  const events = sourceData.events || []
  const customCategories = sourceData.customCategories || []
  
  // Get available events from event-planner
  const availableEvents = (hubData?.allData?.['event-planner']?.events || hubData?.allData?.eventPlanner?.events || []).map(evt => ({
    id: evt.id,
    name: evt.eventName || evt.name || 'Untitled',
    date: evt.eventDate || evt.date,
  }))

  const [showVendorForm, setShowVendorForm] = useState(false)
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [editingResource, setEditingResource] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)

  const saveData = useCallback((updated) => {
    onSave({
      _meta: { vendorPartnerships: updated },
      allData: { 'vendor-partnerships': updated }
    })
  }, [onSave])

  const handleAddVendor = () => {
    setEditingVendor(null)
    setShowVendorForm(true)
  }

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor)
    setShowVendorForm(true)
  }

  const handleSaveVendor = (vendor) => {
    if (vendor.id) {
      saveData({
        vendors: vendors.map(v => v.id === vendor.id ? vendor : v),
        resources, events, customCategories: customCategories.includes(vendor.category) ? customCategories : [...customCategories, vendor.category].filter(c => !DEFAULT_CATEGORIES.includes(c))
      })
    } else {
      const newVendor = { ...vendor, id: Date.now().toString() }
      const newCustom = vendor.category && !DEFAULT_CATEGORIES.includes(vendor.category) && !customCategories.includes(vendor.category)
        ? [...customCategories, vendor.category]
        : customCategories
      saveData({
        vendors: [...vendors, newVendor],
        resources, events, customCategories: newCustom
      })
    }
  }

  const handleDeleteVendor = (id) => {
    saveData({
      vendors: vendors.filter(v => v.id !== id),
      resources, events, customCategories
    })
  }

  const handleAddResource = () => {
    setEditingResource(null)
    setShowResourceForm(true)
  }

  const handleEditResource = (resource) => {
    setEditingResource(resource)
    setShowResourceForm(true)
  }

  const handleSaveResource = (resource) => {
    if (resource.id) {
      saveData({
        vendors,
        resources: resources.map(r => r.id === resource.id ? resource : r),
        events, customCategories
      })
    } else {
      const newResource = { ...resource, id: Date.now().toString() }
      saveData({
        vendors,
        resources: [...resources, newResource],
        events, customCategories
      })
    }
  }

  const handleDeleteResource = (id) => {
    saveData({
      vendors, resources: resources.filter(r => r.id !== id),
      events, customCategories
    })
  }

  const handleAddEvent = () => {
    setEditingEvent(null)
    setShowEventForm(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  const handleSaveEvent = (event) => {
    if (event.id) {
      saveData({
        vendors, resources,
        events: events.map(e => e.id === event.id ? event : e),
        customCategories
      })
    } else {
      const newEvent = { ...event, id: Date.now().toString() }
      saveData({
        vendors, resources,
        events: [...events, newEvent],
        customCategories
      })
    }
  }

  const handleDeleteEvent = (id) => {
    saveData({
      vendors, resources,
      events: events.filter(e => e.id !== id),
      customCategories
    })
  }

  const getEventSponsors = (eventId) => {
    const event = events.find(e => e.id === eventId)
    return event?.sponsors?.map(sponsorId => vendors.find(v => v.id === sponsorId)).filter(Boolean) || []
  }

  const getVendorEventHistory = (vendorId) => {
    return events.filter(e => e.sponsors?.includes(vendorId))
  }

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* VENDOR PARTNERSHIPS SECTION */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Vendor Partnerships</h1>
          <button
            onClick={handleAddVendor}
            style={{
              padding: '8px 16px', background: '#fff', color: '#1a1a1a',
              border: '2px solid #1a1a1a', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13
            }}
          >
            + Add Vendor
          </button>
        </div>
        <p style={{
          fontSize: 15, color: '#666', marginBottom: 24, lineHeight: 1.6,
          maxWidth: '100%'
        }}>
          Track vendor relationships and co-marketing sponsorships. Strong partnerships amplify your reach and create mutual growth opportunities.
        </p>

        {vendors.length === 0 ? (
          <div style={{
            textAlign: 'center', color: 'rgb(153,153,153)', padding: 40, background: '#f9f8f6',
            border: '1px solid rgb(243,242,240)', borderRadius: 8, marginBottom: 16, fontSize: 13
          }}>
            No vendors yet. Add your first vendor partnership.
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onUpdate={handleEditVendor}
                onDelete={() => handleDeleteVendor(vendor.id)}
                sponsorshipHistory={getVendorEventHistory(vendor.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* BUSINESS RESOURCES SECTION */}
      <div style={{ marginBottom: 48, background: '#fff', border: '1px solid rgb(243,242,240)', borderRadius: 8, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Business Resources & Supplies</h2>
          <button
            onClick={handleAddResource}
            style={{
              padding: '8px 16px', background: '#fff', color: '#1a1a1a',
              border: '2px solid #1a1a1a', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13
            }}
          >
            + Add Resource
          </button>
        </div>
        <p style={{
          fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 1.6,
          maxWidth: '100%', marginTop: 0
        }}>
          Where you get your stuff. Listing signs, business cards, lockboxes, and everything else you order for your business.
        </p>

        {resources.length === 0 ? (
          <div style={{
            textAlign: 'center', color: 'rgb(153,153,153)', padding: 32, background: '#f9f8f6',
            border: '1px solid rgb(243,242,240)', borderRadius: 8, fontSize: 13
          }}>
            No resources yet. Add your first business resource.
          </div>
        ) : (
          <div>
            {resources.map((resource) => (
              <div
                key={resource.id}
                style={{
                  background: '#f9f8f6', border: '1px solid rgb(243,242,240)', borderRadius: 8, padding: 14, marginBottom: 12
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
                      {resource.name}
                    </div>
                    {resource.category && (
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#999', marginBottom: 4 }}>
                        {resource.category}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>
                      {resource.vendor}
                    </div>
                    {resource.cost && (
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 4 }}>
                        {resource.cost}
                      </div>
                    )}
                    {resource.url && (
                      <div style={{ fontSize: 12, color: '#0066cc', marginBottom: 4 }}>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>
                          View Link
                        </a>
                      </div>
                    )}
                    {resource.notes && (
                      <div style={{ fontSize: 12, color: '#777', marginTop: 8, fontStyle: 'italic' }}>
                        {resource.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
                    <button
                      onClick={() => handleEditResource(resource)}
                      style={{
                        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#e8e8e8', border: 'none', borderRadius: '50%',
                        cursor: 'pointer', fontSize: 16, color: '#555', fontWeight: 'bold'
                      }}
                    >
                      =
                    </button>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      style={{
                        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'none', border: '1px solid #ddd', color: '#c44',
                        borderRadius: '50%', cursor: 'pointer', fontSize: 16, fontWeight: 'bold'
                      }}
                    >
                      x
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EVENT & SPONSORSHIP SECTION */}
      <div style={{ background: '#fff', border: '1px solid rgb(243,242,240)', borderRadius: 8, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Event & Sponsorship Tracker</h2>
          <button
            onClick={handleAddEvent}
            style={{
              padding: '8px 16px', background: '#fff', color: '#1a1a1a',
              border: '2px solid #1a1a1a', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13
            }}
          >
            + Add Event
          </button>
        </div>
        <p style={{
          fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 1.6,
          maxWidth: '100%', marginTop: 0
        }}>
          Track your events and which vendors sponsor them. Build stronger partnerships by showing vendors the value of working with you.
        </p>

        {events.length === 0 ? (
          <div style={{
            textAlign: 'center', color: 'rgb(153,153,153)', padding: 32, background: '#f9f8f6',
            border: '1px solid rgb(243,242,240)', borderRadius: 8, fontSize: 13
          }}>
            No events yet. Add your first event to track sponsorships.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse', background: '#fff',
              border: '1px solid rgb(243,242,240)', borderRadius: 8
            }}>
              <thead>
                <tr style={{ background: '#f9f8f6', borderBottom: '2px solid rgb(243,242,240)' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#555' }}>Event</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#555' }}>Date</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#555' }}>Type</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#555' }}>Sponsors</th>
                  <th style={{ padding: 12, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#555' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <tr key={event.id} style={{ borderBottom: idx < events.length - 1 ? '1px solid rgb(243,242,240)' : 'none' }}>
                    <td style={{ padding: 12, fontSize: 13, color: '#1a1a1a', fontWeight: 500 }}>
                      {event.eventName}
                    </td>
                    <td style={{ padding: 12, fontSize: 13, color: '#666' }}>
                      {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: 12, fontSize: 13, color: '#666' }}>
                      {event.eventType}
                    </td>
                    <td style={{ padding: 12, fontSize: 13, color: '#666' }}>
                      {getEventSponsors(event.id).length > 0
                        ? getEventSponsors(event.id).map(v => v.name).join(', ')
                        : '-'
                      }
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditEvent(event)}
                          style={{
                            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#f0ede8', border: 'none', borderRadius: '50%',
                            cursor: 'pointer', fontSize: 14, color: '#555', fontWeight: 'bold'
                          }}
                        >
                          =
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          style={{
                            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'none', border: '1px solid #ddd', color: '#c44',
                            borderRadius: '50%', cursor: 'pointer', fontSize: 14, fontWeight: 'bold'
                          }}
                        >
                          x
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      <VendorFormModal
        isOpen={showVendorForm}
        onClose={() => setShowVendorForm(false)}
        vendor={editingVendor}
        onSave={handleSaveVendor}
        customCategories={customCategories}
      />

      <ResourceFormModal
        isOpen={showResourceForm}
        onClose={() => setShowResourceForm(false)}
        resource={editingResource}
        onSave={handleSaveResource}
      />

      <EventFormModal
        isOpen={showEventForm}
        onClose={() => setShowEventForm(false)}
        event={editingEvent}
        onSave={handleSaveEvent}
        vendors={vendors}
        availableEvents={availableEvents}
      />
    </div>
  )
}
