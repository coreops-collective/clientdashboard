import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══ CORE VALUES DATA (107 VALUES WITH DEFINITIONS) ═══ */
const ALL_VALUES = [
  // Personal Growth & Achievement (12)
  { word: 'Ambition', def: 'A strong desire to achieve success or make a positive impact in any field.', cat: 'Personal Growth & Achievement' },
  { word: 'Excellence', def: 'The pursuit of outstanding quality or merit in any field.', cat: 'Personal Growth & Achievement' },
  { word: 'Mastery', def: 'The comprehensive knowledge or skill in a subject or accomplishment.', cat: 'Personal Growth & Achievement' },
  { word: 'Progress', def: 'The act of moving forward or advancing toward a goal, embracing continuous improvement and development.', cat: 'Personal Growth & Achievement' },
  { word: 'Self-Discipline', def: 'The ability to control one\'s feelings and overcome one\'s weaknesses; the ability to pursue what one thinks is right despite temptation to abandon it.', cat: 'Personal Growth & Achievement' },
  { word: 'Growth', def: 'The process of developing or maturing physically, mentally, or spiritually.', cat: 'Personal Growth & Achievement' },
  { word: 'Achievement', def: 'The successful accomplishment of a goal or the attainment of something through effort and skill.', cat: 'Personal Growth & Achievement' },
  { word: 'Perseverance', def: 'The persistence in doing something despite difficulty or delay in achieving success.', cat: 'Personal Growth & Achievement' },
  { word: 'Success', def: 'The accomplishment of an aim or purpose.', cat: 'Personal Growth & Achievement' },
  { word: 'Determination', def: 'The quality of being firm in one\'s purpose and not giving up despite challenges or obstacles.', cat: 'Personal Growth & Achievement' },
  { word: 'Grit', def: 'The passion and perseverance for long-term and meaningful goals.', cat: 'Personal Growth & Achievement' },
  { word: 'Tenacity', def: 'The quality or fact of being very determined; determination.', cat: 'Personal Growth & Achievement' },

  // Relationships & Connection (12)
  { word: 'Love', def: 'A profound and caring affection towards someone or something.', cat: 'Relationships & Connection' },
  { word: 'Family', def: 'The bonds of love, support, and connection with those we consider our closest relatives, whether by blood or choice.', cat: 'Relationships & Connection' },
  { word: 'Friendship', def: 'A mutual bond between people, typically characterized by trust, support, and affection.', cat: 'Relationships & Connection' },
  { word: 'Community', def: 'A sense of fellowship and shared identity with a group of people with common interests, location, or values.', cat: 'Relationships & Connection' },
  { word: 'Belonging', def: 'The sense of acceptance and connection within a group or community.', cat: 'Relationships & Connection' },
  { word: 'Loyalty', def: 'A strong feeling of support or allegiance.', cat: 'Relationships & Connection' },
  { word: 'Compassion', def: 'The ability to empathize with others and a desire to alleviate their suffering.', cat: 'Relationships & Connection' },
  { word: 'Kindness', def: 'The quality of being friendly, considerate, and generous.', cat: 'Relationships & Connection' },
  { word: 'Trust', def: 'The firm belief in the reliability, truth, ability, or strength of someone or something.', cat: 'Relationships & Connection' },
  { word: 'Forgiveness', def: 'The act of letting go of resentment and thoughts of revenge.', cat: 'Relationships & Connection' },
  { word: 'Empathy', def: 'The ability to understand and share the feelings of others.', cat: 'Relationships & Connection' },
  { word: 'Caring', def: 'Showing concern and kindness towards others.', cat: 'Relationships & Connection' },

  // Collaboration & Teamwork (12)
  { word: 'Collaboration', def: 'Working together cooperatively towards a common goal.', cat: 'Collaboration & Teamwork' },
  { word: 'Teamwork', def: 'The combined action of a group, especially when effective and efficient.', cat: 'Collaboration & Teamwork' },
  { word: 'Partnership', def: 'A collaborative relationship built on mutual respect, shared goals, and joint effort toward common objectives.', cat: 'Collaboration & Teamwork' },
  { word: 'Unity', def: 'The state of being united or joined as a whole.', cat: 'Collaboration & Teamwork' },
  { word: 'Cooperation', def: 'Working together willingly and harmoniously to achieve shared goals or mutual benefit.', cat: 'Collaboration & Teamwork' },
  { word: 'Support', def: 'Providing encouragement, assistance, or backing to others in their endeavors or times of need.', cat: 'Collaboration & Teamwork' },
  { word: 'Brotherhood', def: 'A sense of camaraderie, solidarity, and mutual support often found within groups sharing common interests or goals.', cat: 'Collaboration & Teamwork' },
  { word: 'Solidarity', def: 'Unity and agreement in feeling or action, especially among individuals with a common interest or purpose.', cat: 'Collaboration & Teamwork' },
  { word: 'Camaraderie', def: 'A spirit of friendly companionship and mutual trust among people who spend time together.', cat: 'Collaboration & Teamwork' },
  { word: 'Inclusion', def: 'The practice of ensuring that people feel welcomed, respected, and connected, regardless of their background or identity.', cat: 'Collaboration & Teamwork' },
  { word: 'Diversity', def: 'The value of recognizing, respecting, and embracing differences among people, including cultural, racial, religious, and gender diversity.', cat: 'Collaboration & Teamwork' },
  { word: 'Reciprocity', def: 'The practice of exchanging things with others for mutual benefit; creating balanced and fair relationships.', cat: 'Collaboration & Teamwork' },

  // Integrity & Character (12)
  { word: 'Honesty', def: 'The quality of being truthful and transparent in dealings with others.', cat: 'Integrity & Character' },
  { word: 'Authenticity', def: 'Valuing being true to oneself; authentic individuals are genuine and sincere, not only in their actions but also in their expressions and beliefs.', cat: 'Integrity & Character' },
  { word: 'Courage', def: 'The quality of being brave; facing fear, danger, or adversity with strength and resolve.', cat: 'Integrity & Character' },
  { word: 'Respect', def: 'Treating others with dignity and acknowledging their worth as individuals.', cat: 'Integrity & Character' },
  { word: 'Fairness', def: 'The quality of making judgments that are free from discrimination.', cat: 'Integrity & Character' },
  { word: 'Responsibility', def: 'The state of being accountable for one\'s actions and their impact on others.', cat: 'Integrity & Character' },
  { word: 'Accountability', def: 'Taking responsibility for one\'s actions and their consequences.', cat: 'Integrity & Character' },
  { word: 'Humility', def: 'The characteristic of being modest and respectful.', cat: 'Integrity & Character' },
  { word: 'Honor', def: 'A strong sense of ethical integrity, upholding one\'s moral values, and being esteemed for one\'s noble qualities.', cat: 'Integrity & Character' },
  { word: 'Ethics', def: 'Moral principles that govern a person\'s behavior or the conducting of an activity.', cat: 'Integrity & Character' },
  { word: 'Sincerity', def: 'The quality of being free from pretense, deceit, or hypocrisy.', cat: 'Integrity & Character' },
  { word: 'Bravery', def: 'The courage to face challenges, pain, and fears, often associated with strength, resilience, and the ability to confront adversity.', cat: 'Integrity & Character' },

  // Freedom & Autonomy (11)
  { word: 'Independence', def: 'The state of being self-reliant and not dependent on others.', cat: 'Freedom & Autonomy' },
  { word: 'Choice', def: 'The freedom and power to make decisions that shape one\'s own life and direction.', cat: 'Freedom & Autonomy' },
  { word: 'Flexibility', def: 'The willingness and ability to adapt, change, or bend in response to new circumstances or information.', cat: 'Freedom & Autonomy' },
  { word: 'Adventure', def: 'The pursuit of exciting, novel, or risky experiences that push boundaries and create memorable moments.', cat: 'Freedom & Autonomy' },
  { word: 'Spontaneity', def: 'The quality of acting on impulse or instinct, introducing the unplanned and unexpected with openness.', cat: 'Freedom & Autonomy' },
  { word: 'Autonomy', def: 'The right and ability to govern oneself, make independent choices, and act according to one\'s own values.', cat: 'Freedom & Autonomy' },
  { word: 'Innovation', def: 'The act of introducing something new, whether it is an idea, method, or device. Innovation is key to progress and problem-solving.', cat: 'Freedom & Autonomy' },
  { word: 'Freedom', def: 'The power or right to act, speak, or think without hindrance or restraint.', cat: 'Freedom & Autonomy' },
  { word: 'Exploration', def: 'The act of seeking out new experiences, knowledge, or territories with curiosity and an open mind.', cat: 'Freedom & Autonomy' },
  { word: 'Openness', def: 'The quality of being open to new experiences, ideas, and changes.', cat: 'Freedom & Autonomy' },
  { word: 'Adaptability', def: 'The ability to adjust to new conditions or changes.', cat: 'Freedom & Autonomy' },

  // Security & Prosperity (11)
  { word: 'Safety', def: 'The condition of being protected from harm, danger, or risk, creating a foundation for security and peace of mind.', cat: 'Security & Prosperity' },
  { word: 'Stability', def: 'The state of being steady, consistent, and dependable; providing a reliable foundation in life.', cat: 'Security & Prosperity' },
  { word: 'Wealth', def: 'Often associated with an abundance of financial resources or possessions, but can also refer to richness in experience and knowledge.', cat: 'Security & Prosperity' },
  { word: 'Abundance', def: 'A plentiful supply or wealth of resources, opportunities, or experiences that exceed basic needs.', cat: 'Security & Prosperity' },
  { word: 'Order', def: 'The value of having structure and organization in one\'s life.', cat: 'Security & Prosperity' },
  { word: 'Tradition', def: 'The customs, beliefs, and practices passed down through generations that connect us to our heritage and roots.', cat: 'Security & Prosperity' },
  { word: 'Structure', def: 'An organized framework or system that provides order, clarity, and predictability in life.', cat: 'Security & Prosperity' },
  { word: 'Prosperity', def: 'A state of flourishing, thriving, and success in various aspects of life, including financial, emotional, and social well-being.', cat: 'Security & Prosperity' },
  { word: 'Comfort', def: 'A state of physical ease and freedom from pain or constraint; or emotional security and contentment.', cat: 'Security & Prosperity' },
  { word: 'Protection', def: 'The act of keeping someone or something safe from harm, damage, or loss.', cat: 'Security & Prosperity' },
  { word: 'Security', def: 'The state of being free from danger or threat.', cat: 'Security & Prosperity' },

  // Creativity & Expression (12)
  { word: 'Creativity', def: 'The ability to think outside the box and generate innovative ideas.', cat: 'Creativity & Expression' },
  { word: 'Artistry', def: 'The creative skill and imagination in producing works of aesthetic value, or personal expression through artistic means.', cat: 'Creativity & Expression' },
  { word: 'Beauty', def: 'While often associated with aesthetics, also means appreciating beauty in various forms: nature, art, relationships, or moments in life.', cat: 'Creativity & Expression' },
  { word: 'Originality', def: 'The ability to think independently and creatively.', cat: 'Creativity & Expression' },
  { word: 'Imagination', def: 'The ability to form new ideas, images, or concepts not present in immediate experience.', cat: 'Creativity & Expression' },
  { word: 'Expression', def: 'The act of conveying thoughts, feelings, or ideas through words, art, actions, or other creative means.', cat: 'Creativity & Expression' },
  { word: 'Vision', def: 'The ability to think about or plan the future with imagination or wisdom.', cat: 'Creativity & Expression' },
  { word: 'Playfulness', def: 'A lighthearted, fun-loving approach to life that embraces joy, spontaneity, and creativity.', cat: 'Creativity & Expression' },
  { word: 'Curiosity', def: 'The desire to learn and understand more; to explore and discover.', cat: 'Creativity & Expression' },
  { word: 'Resourcefulness', def: 'Being able to cope with difficult situations through imaginative and creative solutions.', cat: 'Creativity & Expression' },
  { word: 'Fun', def: 'The value of enjoying life and engaging in activities that bring joy and amusement.', cat: 'Creativity & Expression' },
  { word: 'Humor', def: 'The ability to enjoy or express what is amusing or comical; a valuable tool for coping with stress and creating bonds.', cat: 'Creativity & Expression' },

  // Wisdom & Spirituality (11)
  { word: 'Wisdom', def: 'The ability to think and act using knowledge, experience, understanding, common sense, and insight.', cat: 'Wisdom & Spirituality' },
  { word: 'Intelligence', def: 'The ability to acquire and apply knowledge and skills.', cat: 'Wisdom & Spirituality' },
  { word: 'Understanding', def: 'The ability to comprehend or grasp the meaning of something.', cat: 'Wisdom & Spirituality' },
  { word: 'Faith', def: 'Trust or confidence in a person, idea, or belief system, including religious faith; it often involves loyalty and commitment.', cat: 'Wisdom & Spirituality' },
  { word: 'Hope', def: 'The feeling of expectation and desire for something; inspiring perseverance through difficult times.', cat: 'Wisdom & Spirituality' },
  { word: 'Awareness', def: 'The practice of being fully present and engaged in the current moment with awareness and without judgment.', cat: 'Wisdom & Spirituality' },
  { word: 'Clarity', def: 'Being clear in communication and thought. Clarity helps in effective decision-making, problem-solving, and understanding.', cat: 'Wisdom & Spirituality' },
  { word: 'Grace', def: 'Elegance or beauty of form, manner, motion, or action; courtesy, empathy, and effective communication.', cat: 'Wisdom & Spirituality' },
  { word: 'Knowledge', def: 'The understanding and information gained through experience or education.', cat: 'Wisdom & Spirituality' },
  { word: 'Purpose', def: 'Having a sense of direction and meaning in life.', cat: 'Wisdom & Spirituality' },
  { word: 'Inspiration', def: 'The process of being mentally stimulated to do or feel something, especially something creative or positive.', cat: 'Wisdom & Spirituality' },

  // Well-Being & Vitality (13)
  { word: 'Health', def: 'The state of physical, mental, and emotional well-being, not merely the absence of disease.', cat: 'Well-Being & Vitality' },
  { word: 'Balance', def: 'The ability to create harmony among different aspects of life to maintain overall well-being and stability.', cat: 'Well-Being & Vitality' },
  { word: 'Harmony', def: 'The state of being in agreement or concord, seeking peaceful and balanced relationships.', cat: 'Well-Being & Vitality' },
  { word: 'Joy', def: 'The emotion of great delight or happiness caused by something exceptionally good or satisfying.', cat: 'Well-Being & Vitality' },
  { word: 'Passion', def: 'A strong and barely controllable emotion or enthusiasm for something or about doing something.', cat: 'Well-Being & Vitality' },
  { word: 'Gratitude', def: 'The quality of being thankful and showing appreciation for what one has and to others.', cat: 'Well-Being & Vitality' },
  { word: 'Peace', def: 'The absence of conflict and the presence of tranquility, harmony, and serenity.', cat: 'Well-Being & Vitality' },
  { word: 'Contentment', def: 'A state of satisfaction and peaceful happiness with one\'s situation and circumstances.', cat: 'Well-Being & Vitality' },
  { word: 'Mindfulness', def: 'The practice of being fully present and engaged in the current moment with awareness and without judgment.', cat: 'Well-Being & Vitality' },
  { word: 'Optimism', def: 'The tendency to have a positive outlook on life and to expect good outcomes.', cat: 'Well-Being & Vitality' },
  { word: 'Vitality', def: 'The state of being strong and active; energy.', cat: 'Well-Being & Vitality' },
  { word: 'Patience', def: 'The ability to wait calmly for something or to endure difficulties without frustration.', cat: 'Well-Being & Vitality' },
  { word: 'Enthusiasm', def: 'A strong excitement and eagerness about something.', cat: 'Well-Being & Vitality' },
]

const CORE_VALUES_BY_CATEGORY = ALL_VALUES.reduce((acc, val) => {
  if (!acc[val.cat]) acc[val.cat] = []
  acc[val.cat].push(val.word)
  return acc
}, {})

/* ═══ AUTO-SAVING TEXTAREA ═══ */
function TextAreaField({ value, onSave, label, placeholder, readOnly = false }) {
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
          transition: 'border-color 0.2s', resize: 'vertical', minHeight: 80,
          background: readOnly ? '#fafafa' : '#fff',
        }}
        onFocus={e => { if (!readOnly) e.target.style.borderColor = '#5a7c65' }}
        onBlur={e => { e.target.style.borderColor = '#e8e8e8'; handleBlur() }}
      />
    </div>
  )
}

function SectionHeader({ children }) {
  return (
    <div style={{ background: '#1a1a1a', color: '#fff', padding: '12px 20px', borderRadius: '8px 8px 0 0', margin: '-24px -24px 20px', fontSize: 16, fontWeight: 700 }}>
      {children}
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.06)', ...style }}>
      {children}
    </div>
  )
}

/* ═══ TAB NAVIGATION ═══ */
function TabNav({ activeTab, setActiveTab, tabs }) {
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #e8e8e8' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            padding: '12px 16px', fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 500,
            color: activeTab === tab.id ? '#1a1a1a' : '#999', background: 'none', border: 'none',
            borderBottom: activeTab === tab.id ? '3px solid #5a7c65' : 'none', cursor: 'pointer',
            transition: 'color 0.2s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/* ═══ CORE VALUE CARD (for My Core Values section - inline editing) ═══ */
function CoreValueCard({ value, definition, statements, onDemote, onSaveStatement }) {
  const [why, setWhy] = useState(statements?.why || '')
  const [story, setStory] = useState(statements?.story || '')
  const [daily, setDaily] = useState(statements?.daily || '')
  const timer = useRef(null)

  useEffect(() => {
    setWhy(statements?.why || '')
    setStory(statements?.story || '')
    setDaily(statements?.daily || '')
  }, [statements])

  const save = (field, val) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      onSaveStatement(value, { ...statements, [field]: val })
    }, 1000)
  }

  return (
    <div style={{
      background: '#1a1a1a', borderRadius: 8, padding: 16, border: '1px solid #333',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#D4D926' }}>{value}</div>
          {definition && <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.4, marginTop: 4 }}>{definition}</div>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
          <button onClick={() => onDemote(value)} title="Move back to Important" style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14 }}>&#8595;</button>
          <button onClick={() => onDemote(value)} title="Remove from Core" style={{ background: 'none', border: 'none', color: '#c44', cursor: 'pointer', fontSize: 14 }}>&#10005;</button>
        </div>
      </div>
      <textarea
        value={why} onChange={(e) => { setWhy(e.target.value); save('why', e.target.value) }}
        placeholder="Why this value?"
        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #444', background: '#2a2a2a', color: '#ddd', fontSize: 12, fontFamily: 'inherit', resize: 'vertical', minHeight: 60, boxSizing: 'border-box', marginBottom: 8 }}
      />
      <textarea
        value={story} onChange={(e) => { setStory(e.target.value); save('story', e.target.value) }}
        placeholder="The story behind it"
        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #444', background: '#2a2a2a', color: '#ddd', fontSize: 12, fontFamily: 'inherit', resize: 'vertical', minHeight: 60, boxSizing: 'border-box', marginBottom: 8 }}
      />
      <textarea
        value={daily} onChange={(e) => { setDaily(e.target.value); save('daily', e.target.value) }}
        placeholder="How it shows up daily"
        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #444', background: '#2a2a2a', color: '#ddd', fontSize: 12, fontFamily: 'inherit', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }}
      />
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */
export default function CoreFoundation({ hubData, onSave }) {
  const meta = hubData?._meta || {}
  const allData = hubData?.allData || {}
  // Merge both data sources: allData provides initial values, _meta overrides with new saves
  const data = { ...(allData?.['core-foundation'] || {}), ...(meta.coreFoundation || {}) }

  const [activeTab, setActiveTab] = useState('exercises')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [customValueInput, setCustomValueInput] = useState('')
  // removed separate editing panel state - now inline on cards

  // Local state for text inputs with debounced save
  const [localPurposeBenefit, setLocalPurposeBenefit] = useState(data.purposeBenefit || '')
  const [localPurposeAudience, setLocalPurposeAudience] = useState(data.purposeAudience || '')
  const [localPurposeOutcome, setLocalPurposeOutcome] = useState(data.purposeOutcome || '')
  const [localCorePromise, setLocalCorePromise] = useState(data.corePromise || '')
  const [localPromiseProof, setLocalPromiseProof] = useState(data.promiseProof || '')
  const [localPromiseBroken, setLocalPromiseBroken] = useState(data.promiseBroken || '')
  const [localCoreFunctionStatement, setLocalCoreFunctionStatement] = useState(data.coreFunctionStatement || '')
  const [localCoreFunctionProtect, setLocalCoreFunctionProtect] = useState(data.coreFunctionProtect || '')
  const [localCoreFunctionDelegate, setLocalCoreFunctionDelegate] = useState(data.coreFunctionDelegate || '')
  const debounceTimers = useRef({})

  // Sync from server when data changes externally
  useEffect(() => {
    setLocalPurposeBenefit(data.purposeBenefit || '')
    setLocalPurposeAudience(data.purposeAudience || '')
    setLocalPurposeOutcome(data.purposeOutcome || '')
    setLocalCorePromise(data.corePromise || '')
    setLocalPromiseProof(data.promiseProof || '')
    setLocalPromiseBroken(data.promiseBroken || '')
    setLocalCoreFunctionStatement(data.coreFunctionStatement || '')
    setLocalCoreFunctionProtect(data.coreFunctionProtect || '')
    setLocalCoreFunctionDelegate(data.coreFunctionDelegate || '')
  }, [hubData])

  // Extract data
  const importantValues = data.importantValues || []
  const coreValues = data.coreValues || []
  const valueStatements = data.valueStatements || {}
  const discoveryAnswers = data.discoveryAnswers || {}
  const purposeBenefit = data.purposeBenefit || ''
  const purposeAudience = data.purposeAudience || ''
  const purposeOutcome = data.purposeOutcome || ''
  const corePromise = data.corePromise || ''
  const promiseProof = data.promiseProof || ''
  const promiseBroken = data.promiseBroken || ''
  const coreFunctionStatement = data.coreFunctionStatement || ''
  const coreFunctionProtect = data.coreFunctionProtect || ''
  const coreFunctionDelegate = data.coreFunctionDelegate || ''

  // Save function — dual save to both _meta and allData
  const saveField = useCallback((key, val) => {
    const updatedCF = { ...data, [key]: val }
    onSave({
      _meta: { coreFoundation: { [key]: val } },
      allData: { ...allData, 'core-foundation': updatedCF }
    })
  }, [onSave, data, allData])

  const debouncedSave = useCallback((key, val) => {
    clearTimeout(debounceTimers.current[key])
    debounceTimers.current[key] = setTimeout(() => saveField(key, val), 1200)
  }, [saveField])

  // Value management
  const getValueDef = (word) => ALL_VALUES.find(v => v.word === word)?.def || ''
  const allValueWords = ALL_VALUES.map(v => v.word)
  const filteredValueWords = categoryFilter ? CORE_VALUES_BY_CATEGORY[categoryFilter] : allValueWords
  const availableValueWords = filteredValueWords.filter(v => !importantValues.includes(v) && !coreValues.includes(v))

  const getValueState = (value) => {
    if (coreValues.includes(value)) return 'core'
    if (importantValues.includes(value)) return 'important'
    return 'available'
  }

  const addImportantValue = (value) => {
    const updated = [...importantValues, value]
    saveField('importantValues', updated)
  }

  const addCustomValue = () => {
    if (!customValueInput.trim()) return
    const updated = [...importantValues, customValueInput.trim()]
    saveField('importantValues', updated)
    setCustomValueInput('')
  }

  const promoteToCore = (value) => {
    if (coreValues.length >= 7) { alert('Max 7 core values'); return }
    const newCore = [...coreValues, value]
    const newImportant = importantValues.filter(v => v !== value)
    const updatedCF = { ...data, coreValues: newCore, importantValues: newImportant }
    onSave({
      _meta: { coreFoundation: { coreValues: newCore, importantValues: newImportant } },
      allData: { ...allData, 'core-foundation': updatedCF }
    })
  }

  const demoteFromCore = (value) => {
    const newCore = coreValues.filter(v => v !== value)
    const newImportant = [...importantValues, value]
    const updatedCF = { ...data, coreValues: newCore, importantValues: newImportant }
    onSave({
      _meta: { coreFoundation: { coreValues: newCore, importantValues: newImportant } },
      allData: { ...allData, 'core-foundation': updatedCF }
    })
  }

  const removeImportantValue = (value) => {
    const updated = importantValues.filter(v => v !== value)
    saveField('importantValues', updated)
  }

  const saveValueStatement = (valueName, statementsObj) => {
    const updated = { ...valueStatements, [valueName]: statementsObj }
    saveField('valueStatements', updated)
  }

  // Completion check
  const purposeComplete = (localPurposeBenefit || purposeBenefit) && (localPurposeAudience || purposeAudience) && (localPurposeOutcome || purposeOutcome)
  const canShowOverview = coreValues.length >= 3 && ((localCorePromise || corePromise) || purposeComplete) && (localCoreFunctionStatement || coreFunctionStatement)

  // Discovery Q&A
  const discoveryQuestions = [
    { id: 'q1', label: 'Why Real Estate?', text: 'Why real estate? You could sell anything. You could be in tech sales, medical devices, insurance. You chose this. What is it about helping people with their homes that keeps pulling you back, even on the worst days?' },
    { id: 'q2', label: 'Your Best Client Experience', text: 'Think about your absolute best client experience. Not the biggest commission. The one that reminded you why you do this. What happened? What role did YOU play in making that moment possible?' },
    { id: 'q3', label: 'The One Thing You Guarantee', text: 'If you could guarantee ONE thing for every single person who works with you, what would it be? Not "a good experience." Get specific. What do they walk away with that they couldn\'t have gotten anywhere else?' },
    { id: 'q4', label: 'What Clients Say About You', text: 'When your past clients refer you to their friends, what do they say? Not the nice-sounding stuff. What\'s the real reason they trust you with the people they care about?' },
    { id: 'q5', label: 'Your Core Function', text: 'What\'s the ONE thing in your business that, if it stopped happening, everything else would fall apart? Not admin tasks, not marketing. The thing that makes YOUR business actually work.' },
    { id: 'q6', label: 'Your 10-Year Vision', text: 'Fast forward 10 years. You\'ve built something incredible. What does it look like? What\'s the impact you\'ve made? Not on your bank account. On your community, your industry, the families you\'ve served.' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Core Foundation</h1>
      <p style={{ fontSize: 15, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>
        Build the foundation of your business. Your core values, purpose, and function drive every decision you make.
      </p>

      <TabNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={[
          { id: 'exercises', label: 'Self-Discovery Exercises' },
          ...(canShowOverview ? [{ id: 'overview', label: 'Company Overview' }] : []),
        ]}
      />

      {activeTab === 'exercises' && (
        <>
          {/* SECTION 1: CORE VALUES */}
          <Card>
            <SectionHeader>Core Values Selection</SectionHeader>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
              Select 3-7 core values that define who you are. Start by exploring all values, then promote your most important ones to Core Values.
            </p>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>Filter by Category</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setCategoryFilter(null)}
                  style={{
                    padding: '6px 12px', fontSize: 12, fontWeight: categoryFilter === null ? 700 : 500,
                    background: categoryFilter === null ? '#5a7c65' : '#f0f0f0', color: categoryFilter === null ? '#fff' : '#333',
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                  }}
                >
                  All Values
                </button>
                {Object.keys(CORE_VALUES_BY_CATEGORY).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: '6px 12px', fontSize: 12, fontWeight: categoryFilter === cat ? 700 : 500,
                      background: categoryFilter === cat ? '#5a7c65' : '#f0f0f0', color: categoryFilter === cat ? '#fff' : '#333',
                      border: 'none', borderRadius: 4, cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Values Grid */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>Available Values</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                {availableValueWords.map((value) => (
                  <button
                    key={value}
                    onClick={() => addImportantValue(value)}
                    style={{
                      padding: 12, borderRadius: 8, border: '2px dashed #ddd', background: '#fff', cursor: 'pointer',
                      fontSize: 13, fontWeight: 500, color: '#333', transition: 'all 0.2s', textAlign: 'left',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#5a7c65'; e.currentTarget.style.background = '#f5f5f5' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.background = '#fff' }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{value}</div>
                    <div style={{ fontSize: 10, color: '#666', lineHeight: 1.3 }}>{getValueDef(value)}</div>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={customValueInput}
                  onChange={(e) => setCustomValueInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') addCustomValue() }}
                  placeholder="Or add a custom value..."
                  style={{ flex: 1, padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
                />
                <button onClick={addCustomValue} style={{ padding: '8px 16px', background: '#5a7c65', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Add</button>
              </div>
            </div>

            {/* Important to Me - yellow dashed border */}
            {importantValues.length > 0 && (
              <div style={{ marginBottom: 24, padding: 20, border: '2px dashed #D4D926', borderRadius: 12, background: '#fdfce8' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Important to Me ({importantValues.length})</div>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
                  These values resonate with you. Now narrow it down. Which 3-7 are truly at your CORE?
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {importantValues.map((value) => (
                    <div key={value} style={{ padding: 12, borderRadius: 8, background: '#D4D926', color: '#1a1a1a' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{value}</div>
                      <div style={{ fontSize: 10, color: '#333', lineHeight: 1.3, marginBottom: 8 }}>{getValueDef(value)}</div>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => promoteToCore(value)} title="Promote to Core Value" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#1a1a1a', padding: 0 }}>&#9734;</button>
                        <button onClick={() => removeImportantValue(value)} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#1a1a1a', padding: 0 }}>&#10005;</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Core Values - dark background, inline editing */}
            {coreValues.length > 0 && (
              <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 24, border: '2px solid #333' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#D4D926', marginBottom: 16 }}>My Core Values ({coreValues.length} of 3-7)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {coreValues.map((value) => (
                    <CoreValueCard
                      key={value}
                      value={value}
                      definition={getValueDef(value)}
                      statements={valueStatements[value]}
                      onDemote={demoteFromCore}
                      onSaveStatement={saveValueStatement}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* SECTION 2: DISCOVERY EXERCISES */}
          <Card>
            <SectionHeader>Discovery Exercises</SectionHeader>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 20, lineHeight: 1.6 }}>
              Answer these 6 questions honestly. They help unlock your authentic purpose and what truly drives your business.
            </p>
            {discoveryQuestions.map((q) => (
              <div key={q.id} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>{q.label}</label>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 1.6 }}>{q.text}</p>
                <TextAreaField
                  value={discoveryAnswers[q.id] || ''}
                  onSave={(v) => saveField('discoveryAnswers', { ...discoveryAnswers, [q.id]: v })}
                  placeholder="Your answer..."
                />
              </div>
            ))}
          </Card>

          {/* SECTION 3: CORE PROMISE */}
          <Card>
            <SectionHeader>Core Promise</SectionHeader>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
              Define the specific promise you make to every client. Be concrete. What exactly do you guarantee?
            </p>

            <div style={{ marginBottom: 20, background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 12 }}>Purpose Statement Formula</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>My business exists to</span>
                <input
                  type="text"
                  value={localPurposeBenefit}
                  onChange={(e) => { setLocalPurposeBenefit(e.target.value); debouncedSave('purposeBenefit', e.target.value) }}
                  placeholder="[what benefit]"
                  style={{ flex: 1, minWidth: 200, padding: '6px 10px', border: '2px solid #e8e8e8', borderRadius: 4, fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>to</span>
                <input
                  type="text"
                  value={localPurposeAudience}
                  onChange={(e) => { setLocalPurposeAudience(e.target.value); debouncedSave('purposeAudience', e.target.value) }}
                  placeholder="[who/what audience]"
                  style={{ flex: 1, minWidth: 200, padding: '6px 10px', border: '2px solid #e8e8e8', borderRadius: 4, fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>so that</span>
                <input
                  type="text"
                  value={localPurposeOutcome}
                  onChange={(e) => { setLocalPurposeOutcome(e.target.value); debouncedSave('purposeOutcome', e.target.value) }}
                  placeholder="[what outcome/transformation]"
                  style={{ flex: 1, minWidth: 200, padding: '6px 10px', border: '2px solid #e8e8e8', borderRadius: 4, fontSize: 13 }}
                />
              </div>
              {localPurposeBenefit && localPurposeAudience && localPurposeOutcome && (
                <div style={{ marginTop: 16, padding: 12, background: '#fff', borderRadius: 6, borderLeft: '4px solid #5a7c65', fontSize: 13, color: '#333', lineHeight: 1.6 }}>
                  <strong>Your Purpose:</strong> My business exists to {localPurposeBenefit} to {localPurposeAudience} so that {localPurposeOutcome}.
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <TextAreaField
                label="My Promise to Every Client"
                value={localCorePromise}
                onSave={(v) => { setLocalCorePromise(v); debouncedSave('corePromise', v) }}
                placeholder="What specific promise do you make? What do they get that's different?"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <TextAreaField
                label="How I Deliver On This Promise"
                value={localPromiseProof}
                onSave={(v) => { setLocalPromiseProof(v); debouncedSave('promiseProof', v) }}
                placeholder="What's your system, process, or approach? How do you actually deliver it?"
              />
            </div>

            <div>
              <TextAreaField
                label="What Happens When It Breaks"
                value={localPromiseBroken}
                onSave={(v) => { setLocalPromiseBroken(v); debouncedSave('promiseBroken', v) }}
                placeholder="If you break this promise, what do you do? How do you make it right?"
              />
            </div>
          </Card>

          {/* SECTION 4: CORE FUNCTION */}
          <Card>
            <SectionHeader>Core Function</SectionHeader>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
              Identify the ONE thing that makes your business work. This is what you protect and optimize relentlessly.
            </p>

            <div style={{ marginBottom: 16 }}>
              <TextAreaField
                label="My business succeeds when I consistently..."
                value={localCoreFunctionStatement}
                onSave={(v) => { setLocalCoreFunctionStatement(v); debouncedSave('coreFunctionStatement', v) }}
                placeholder="The one core function that drives your business..."
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <TextAreaField
                label="How I Protect My Core Function"
                value={localCoreFunctionProtect}
                onSave={(v) => { setLocalCoreFunctionProtect(v); debouncedSave('coreFunctionProtect', v) }}
                placeholder="What systems, boundaries, or practices keep this protected?"
              />
            </div>

            <div>
              <TextAreaField
                label="What I Delegate to Protect It"
                value={localCoreFunctionDelegate}
                onSave={(v) => { setLocalCoreFunctionDelegate(v); debouncedSave('coreFunctionDelegate', v) }}
                placeholder="What do you stop doing or delegate so you can focus on this?"
              />
            </div>
          </Card>
        </>
      )}

      {activeTab === 'overview' && canShowOverview && (
        <>
          {/* CORE VALUES OVERVIEW */}
          {coreValues.length >= 3 && (
            <Card style={{ background: '#1a1a1a', color: '#fff', borderColor: '#333' }}>
              <SectionHeader style={{ marginBottom: 0, margin: '-24px -24px 20px' }}>My Core Values</SectionHeader>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {coreValues.map((value) => (
                  <div
                    key={value}
                    style={{
                      background: '#D4D926', color: '#1a1a1a', padding: 16, borderRadius: 8,
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{value}</div>
                    {valueStatements[value]?.why && (
                      <div style={{ marginBottom: 8, fontSize: 13, lineHeight: 1.5 }}>
                        <strong>Why:</strong> {valueStatements[value].why}
                      </div>
                    )}
                    {valueStatements[value]?.story && (
                      <div style={{ marginBottom: 8, fontSize: 13, lineHeight: 1.5 }}>
                        <strong>Story:</strong> {valueStatements[value].story}
                      </div>
                    )}
                    {valueStatements[value]?.daily && (
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                        <strong>Daily:</strong> {valueStatements[value].daily}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* CORE PROMISE OVERVIEW */}
          {(corePromise || purposeComplete) && (
            <Card style={{ borderColor: '#D4D926', borderWidth: 2 }}>
              <SectionHeader>My Promise</SectionHeader>
              {purposeComplete && (
                <div style={{ marginBottom: 16, padding: 12, background: '#faf6e8', borderRadius: 6, fontSize: 13, lineHeight: 1.6 }}>
                  <strong>Purpose:</strong> My business exists to {purposeBenefit} to {purposeAudience} so that {purposeOutcome}.
                </div>
              )}
              {corePromise && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>The Promise</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: '#333', padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                    {corePromise}
                  </div>
                </div>
              )}
              {promiseProof && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>How I Deliver</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: '#333', padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                    {promiseProof}
                  </div>
                </div>
              )}
              {promiseBroken && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>When It Breaks</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: '#333', padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                    {promiseBroken}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* CORE FUNCTION OVERVIEW */}
          {coreFunctionStatement && (
            <Card>
              <SectionHeader>My Core Function</SectionHeader>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>The Function</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#333', padding: 12, background: '#f5f5f5', borderRadius: 6, fontWeight: 600 }}>
                  My business succeeds when I consistently {coreFunctionStatement}.
                </div>
              </div>
              {coreFunctionProtect && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>How I Protect It</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: '#333', padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                    {coreFunctionProtect}
                  </div>
                </div>
              )}
              {coreFunctionDelegate && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>What I Delegate</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: '#333', padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                    {coreFunctionDelegate}
                  </div>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  )
}
