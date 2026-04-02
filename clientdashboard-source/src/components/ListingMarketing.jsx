import React, { useState, useCallback, useRef, useEffect } from 'react'

const sectionConfigs = [
  {
    id: 'pre-listing',
    title: 'Pre-Listing Materials',
    subtitle: 'Everything you need before the sign goes in the yard.',
  },
  {
    id: 'active-listing',
    title: 'Active Listing Materials',
    subtitle: 'What goes live when the property is on the market.',
  },
  {
    id: 'open-house',
    title: 'Open House Materials',
    subtitle: 'Physical and digital materials for hosting open houses.',
  },
  {
    id: 'social-media',
    title: 'Social Media Content',
    subtitle: 'Posts, reels, stories, and templates for your listing marketing.',
  },
  {
    id: 'buyer-marketing',
    title: 'Buyer Marketing Materials',
    subtitle: 'What you use when working with buyers.',
  },
]

const STATUS_OPTIONS = [
  { value: 'Needed', color: '#fce8e8' },
  { value: 'In Progress', color: '#fef5e0' },
  { value: 'Ready', color: '#e8f5e9' },
  { value: 'N/A', color: '#f0f0f0' },
]

function DebouncedInput({ value, onChange, placeholder, style = {} }) {
  const [val, setVal] = useState(value || '')
  const prevValue = useRef(value)
  const timer = useRef(null)

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value
      setVal(value || '')
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

  return (
    <input
      type="text"
      value={val}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e2db', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', ...style }}
    />
  )
}

function StatusSelect({ value, onChange }) {
  const currentStatus = STATUS_OPTIONS.find(s => s.value === value) || STATUS_OPTIONS[0]

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #e5e2db',
        borderRadius: 4,
        fontSize: 13,
        fontFamily: 'inherit',
        background: currentStatus.color,
        cursor: 'pointer',
      }}
    >
      {STATUS_OPTIONS.map(status => (
        <option key={status.value} value={status.value}>{status.value}</option>
      ))}
    </select>
  )
}

function MaterialRow({ item, onUpdate, onRemove }) {
  return (
    <tr style={{ borderBottom: '1px solid #e5e2db' }}>
      <td style={{ padding: '12px 8px', width: '20%' }}>
        <DebouncedInput
          value={item.material}
          onChange={(v) => onUpdate({ ...item, material: v })}
          placeholder="e.g., Listing presentation"
        />
      </td>
      <td style={{ padding: '12px 8px', width: '15%' }}>
        <StatusSelect
          value={item.status}
          onChange={(v) => onUpdate({ ...item, status: v })}
        />
      </td>
      <td style={{ padding: '12px 8px', width: '25%' }}>
        <DebouncedInput
          value={item.templateLink}
          onChange={(v) => onUpdate({ ...item, templateLink: v })}
          placeholder="Canva link, Google Drive, etc."
        />
      </td>
      <td style={{ padding: '12px 8px', width: '30%' }}>
        <DebouncedInput
          value={item.notes}
          onChange={(v) => onUpdate({ ...item, notes: v })}
          placeholder="Who makes this, when it's needed, etc."
        />
      </td>
      <td style={{ padding: '12px 8px', width: '10%', textAlign: 'center' }}>
        <button
          onClick={() => onRemove()}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: 16,
            padding: '4px 8px',
          }}
        >
          x
        </button>
      </td>
    </tr>
  )
}

function AccordionSection({ config, items, onItemsChange }) {
  const [expanded, setExpanded] = useState(false)

  const handleAddMaterial = () => {
    const newItem = {
      id: Date.now(),
      material: '',
      status: 'Needed',
      templateLink: '',
      notes: '',
    }
    onItemsChange([...items, newItem])
  }

  const handleUpdateItem = (index, updatedItem) => {
    const updated = [...items]
    updated[index] = updatedItem
    onItemsChange(updated)
  }

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index)
    onItemsChange(updated)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: expanded ? '#1a1a1a' : '#fff',
          color: expanded ? '#fff' : '#1a1a1a',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{config.title}</span>
        <span style={{ fontSize: 16, transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          &#9660;
        </span>
      </div>

      {expanded && (
        <div style={{ padding: '20px', borderTop: '1px solid #e5e2db' }}>
          {config.subtitle && (
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 20 }}>
              {config.subtitle}
            </p>
          )}

          {items.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 8px', borderBottom: '1px solid #e5e2db' }}>
                    MATERIAL
                  </th>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 8px', borderBottom: '1px solid #e5e2db' }}>
                    STATUS
                  </th>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 8px', borderBottom: '1px solid #e5e2db' }}>
                    TEMPLATE / LINK
                  </th>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 8px', borderBottom: '1px solid #e5e2db' }}>
                    NOTES
                  </th>
                  <th style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 8px', borderBottom: '1px solid #e5e2db' }}>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <MaterialRow
                    key={item.id}
                    item={item}
                    onUpdate={(updated) => handleUpdateItem(idx, updated)}
                    onRemove={() => handleRemoveItem(idx)}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>No materials added yet.</p>
          )}

          <button
            onClick={handleAddMaterial}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              border: '1px solid #e5e2db',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              color: '#333',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#eee'
              e.target.style.borderColor = '#ccc'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f5f5f5'
              e.target.style.borderColor = '#e5e2db'
            }}
          >
            + Add Material
          </button>
        </div>
      )}
    </div>
  )
}

const ListingMarketing = ({ hubData, onSave }) => {
  const allData = hubData?.allData || {}
  const marketingData = allData['listing-marketing'] || hubData?._meta?.listingMarketing || { sections: {} }
  const sections = marketingData.sections || {}

  const [sectionStates, setSectionStates] = useState(
    sectionConfigs.reduce((acc, config) => {
      acc[config.id] = sections[config.id]?.items || []
      return acc
    }, {})
  )

  const saveData = useCallback((updatedSections) => {
    onSave({
      allData: { ...allData, 'listing-marketing': { sections: updatedSections } },
      _meta: { listingMarketing: { sections: updatedSections } },
    })
  }, [allData, onSave])

  const handleSectionChange = (sectionId, items) => {
    const updated = { ...sectionStates, [sectionId]: items }
    setSectionStates(updated)

    // Convert to the expected data structure for saving
    const sectionsForSave = {}
    sectionConfigs.forEach(config => {
      sectionsForSave[config.id] = {
        title: config.title,
        subtitle: config.subtitle,
        items: updated[config.id] || [],
      }
    })
    saveData(sectionsForSave)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 0 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 12px 0', color: '#1a1a1a' }}>
          Listing Marketing
        </h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#666', margin: 0 }}>
          Every piece of marketing your listings need, organized by stage. Build out your checklist, track what's ready and what still needs to be created, and link directly to your templates so nothing falls through the cracks.
        </p>
      </div>

      {sectionConfigs.map(config => (
        <AccordionSection
          key={config.id}
          config={config}
          items={sectionStates[config.id] || []}
          onItemsChange={(items) => handleSectionChange(config.id, items)}
        />
      ))}
    </div>
  )
}

export default ListingMarketing
