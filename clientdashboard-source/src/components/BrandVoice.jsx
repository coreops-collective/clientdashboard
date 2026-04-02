import React, { useState, useCallback, useRef, useEffect } from 'react'
import './BrandVoice.css'

const TONE_DESCRIPTORS = [
  'Steady', 'Strategic', 'Protective', 'Warm', 'Direct',
  'Calm', 'Reassuring', 'Bold', 'Decisive', 'Analytical',
  'Practical', 'Grounded', 'Encouraging', 'Honest', 'Playful',
  'Approachable', 'Polished', 'Confident', 'Conversational', 'Authoritative',
  'Nurturing', 'Real', 'Straightforward', 'Refined', 'Energetic',
  'Focused', 'Empathetic', 'Concise', 'Passionate', 'Methodical'
]

const ANCHOR_OPTIONS = [
  'Coaching them through a decision',
  'Teaching them something they did not know',
  'Guiding them step by step',
  'Protecting them from a mistake',
  'Hyping them up when they need confidence',
  'Calming them down when they are spiraling',
  'Strategizing with them like a business partner',
]

const STORY_SECTIONS = [
  {
    key: 'origin',
    title: 'Your Origin',
    prompts: [
      { id: 'origin1', text: 'Why did you get into real estate? Not the version you say at networking events. The actual reason. Was there a specific moment, a specific person, a financial situation, a leap of faith? Write it down exactly the way you would tell it to someone sitting across the table from you.' },
      { id: 'origin2', text: 'What did you do before real estate, and does any of that still show up in how you work today?' },
      { id: 'origin3', text: 'What did you get wrong in your first few years that you would never repeat now?' },
    ]
  },
  {
    key: 'whyNow',
    title: 'Your Why Right Now',
    prompts: [
      { id: 'whyNow1', text: 'What do you love most about this work, even on the hard days?' },
      { id: 'whyNow2', text: 'If you woke up tomorrow and real estate was no longer an option, what would you do instead? What does that tell you about who you actually are?' },
    ]
  },
  {
    key: 'buyer',
    title: 'Buyer Stories',
    prompts: [
      { id: 'buyer1', text: 'Tell me about a first-time buyer you will never forget. What were they afraid of walking in? What happened during the process that tested them? What did it feel like when they got the keys?' },
      { id: 'buyer2', text: 'Tell me about a buyer who had been searching for a long time before they found you. What had gone wrong before? What did you do differently?' },
      { id: 'buyer3', text: 'Tell me about a competitive offer situation. How did you help your buyer navigate it? What was the moment they decided to trust your strategy?' },
      { id: 'buyer4', text: 'Tell me about a buyer who almost talked themselves out of buying. What were they worried about? What did you say, and what did they decide?' },
    ]
  },
  {
    key: 'seller',
    title: 'Seller Stories',
    prompts: [
      { id: 'seller1', text: 'Tell me about a seller who was nervous about their list price. How did you have that conversation? What happened?' },
      { id: 'seller2', text: 'Tell me about a listing that did not sell right away. What did you adjust, how did you communicate with your seller through it, and how did it end?' },
      { id: 'seller3', text: 'Tell me about a seller who tried to go it alone first, or used a different agent before you. What brought them to you, and what was different about their experience this time?' },
      { id: 'seller4', text: 'Tell me about a seller who had a timeline that felt impossible. How did you make it work?' },
    ]
  },
  {
    key: 'market',
    title: 'Market & Process Stories',
    prompts: [
      { id: 'market1', text: 'Tell me about a time the market shifted while you had a client mid-process. How did you communicate it and help them adjust?' },
      { id: 'market2', text: 'What is one thing about buying or selling that almost every client gets wrong going in? Tell me about the moment you explain it to them and watch it click.' },
      { id: 'market3', text: 'What do you know about this market specifically that someone working with a generic agent would never know?' },
    ]
  },
  {
    key: 'referral',
    title: 'The Referral Story',
    prompts: [
      { id: 'referral1', text: 'Tell me about a client who sent someone to you. Why do you think they did? What did that feel like?' },
      { id: 'referral2', text: 'What do clients say about you when they refer you? Have you ever heard the exact words? Write them down.' },
    ]
  },
]

/* Debounced textarea for stories */
function StoryTextarea({ value, onSave, placeholder }) {
  const [val, setVal] = useState(value || '')
  const prev = useRef(value)
  const timer = useRef(null)

  useEffect(() => {
    if (value !== prev.current) { prev.current = value; setVal(value || '') }
  }, [value])

  const handleChange = (e) => {
    const v = e.target.value
    setVal(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { prev.current = v; onSave(v) }, 1200)
  }

  const handleBlur = () => {
    clearTimeout(timer.current)
    if (val !== prev.current) { prev.current = val; onSave(val) }
  }

  return (
    <textarea
      value={val}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder || 'Write it the way you would say it out loud...'}
      className="story-textarea"
    />
  )
}

const SectionHeader = ({ title, subtitle }) => (
  <div className="section-header">
    <h2>{title}</h2>
    {subtitle && <p className="subtitle">{subtitle}</p>}
  </div>
)

const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>{children}</div>
)

const BrandVoice = ({ hubData, onSave }) => {
  const allData = hubData?.allData || {}
  const brandVoiceData = allData['brand-voice'] || hubData?._meta?.brandVoice || {}
  const coreFoundationValues = hubData?._meta?.coreFoundation?.coreValues || allData['core-foundation']?.coreValues || []

  // State
  const [coreValues, setCoreValues] = useState(
    brandVoiceData.coreValues || coreFoundationValues.map(v => ({ value: typeof v === 'string' ? v : v.value || '', behavior: '' }))
  )
  const [descriptorWords, setDescriptorWords] = useState(brandVoiceData.descriptorWords || [])
  const [guardrailsIAm, setGuardrailsIAm] = useState(brandVoiceData.guardrailsIAm || [])
  const [guardrailsNever, setGuardrailsNever] = useState(brandVoiceData.guardrailsNever || [])
  const [alwaysDo, setAlwaysDo] = useState(brandVoiceData.alwaysDo || [])
  const [signaturePhrases, setSignaturePhrases] = useState(brandVoiceData.signaturePhrases || [])
  const [neverDo, setNeverDo] = useState(brandVoiceData.neverDo || [])
  const [anchorEnergy, setAnchorEnergy] = useState(brandVoiceData.anchorEnergy || '')
  const [anchorFillIn, setAnchorFillIn] = useState(brandVoiceData.anchorFillIn || '')
  const [storyOrigin, setStoryOrigin] = useState(brandVoiceData.storyOrigin || { mistakes: '', turningPoint: '', whyRealEstate: '', beforeRealEstate: '' })
  const [storyMarket, setStoryMarket] = useState(brandVoiceData.storyMarket || { localKnowledge: '' })
  const [storyWhyNow, setStoryWhyNow] = useState(brandVoiceData.storyWhyNow || '')
  const [aboutYou, setAboutYou] = useState(brandVoiceData.aboutYou || {})

  // Sync core values from Core Foundation when they change
  useEffect(() => {
    if (coreFoundationValues.length > 0 && coreValues.length === 0) {
      const mapped = coreFoundationValues.map(v => ({ value: typeof v === 'string' ? v : v.value || '', behavior: '' }))
      setCoreValues(mapped)
    }
  }, [coreFoundationValues])

  // Save helper - dual save to allData and _meta
  const saveField = useCallback((key, val) => {
    const updatedBV = { ...brandVoiceData, [key]: val }
    onSave({
      _meta: { brandVoice: { [key]: val } },
      allData: { ...allData, 'brand-voice': updatedBV }
    })
  }, [onSave, brandVoiceData, allData])

  const debounceTimer = useRef({})
  const debounce = (key, val) => {
    clearTimeout(debounceTimer.current[key])
    debounceTimer.current[key] = setTimeout(() => saveField(key, val), 1000)
  }

  // Descriptor word bank - toggle and auto-populate guardrails (I Am + But Never slot)
  const toggleDescriptor = (descriptor) => {
    let updatedWords
    if (descriptorWords.includes(descriptor)) {
      // DESELECT: remove from words, guardrails I Am, and corresponding But Never slot
      updatedWords = descriptorWords.filter(d => d !== descriptor)
      const idx = guardrailsIAm.indexOf(descriptor)
      const updatedIAm = guardrailsIAm.filter(g => g !== descriptor)
      setGuardrailsIAm(updatedIAm)
      saveField('guardrailsIAm', updatedIAm)
      // Also remove the corresponding "But Never" slot at the same index
      if (idx >= 0 && idx < guardrailsNever.length) {
        const updatedNever = guardrailsNever.filter((_, i) => i !== idx)
        setGuardrailsNever(updatedNever)
        saveField('guardrailsNever', updatedNever)
      }
    } else {
      // SELECT: add to words, add to guardrails I Am at first empty slot or end, add paired But Never slot
      updatedWords = [...descriptorWords, descriptor]
      if (!guardrailsIAm.includes(descriptor)) {
        // Find first empty slot, or append
        const emptyIdx = guardrailsIAm.findIndex(g => !g || !g.trim())
        let updatedIAm, updatedNever
        if (emptyIdx >= 0) {
          updatedIAm = [...guardrailsIAm]
          updatedIAm[emptyIdx] = descriptor
          updatedNever = [...guardrailsNever]
          // Make sure the "But Never" array is at least as long
          while (updatedNever.length <= emptyIdx) updatedNever.push('')
        } else {
          updatedIAm = [...guardrailsIAm, descriptor]
          updatedNever = [...guardrailsNever, '']
        }
        setGuardrailsIAm(updatedIAm)
        setGuardrailsNever(updatedNever)
        saveField('guardrailsIAm', updatedIAm)
        saveField('guardrailsNever', updatedNever)
      }
    }
    setDescriptorWords(updatedWords)
    saveField('descriptorWords', updatedWords)
  }

  // Core Values in Action
  const updateCoreValueBehavior = (index, behavior) => {
    const updated = [...coreValues]; updated[index] = { ...updated[index], behavior }
    setCoreValues(updated); debounce('coreValues', updated)
  }
  const addCoreValueRow = () => {
    const updated = [...coreValues, { value: '', behavior: '' }]
    setCoreValues(updated); saveField('coreValues', updated)
  }
  const updateCoreValueName = (index, value) => {
    const updated = [...coreValues]; updated[index] = { ...updated[index], value }
    setCoreValues(updated); debounce('coreValues', updated)
  }
  const removeCoreValueRow = (index) => {
    const updated = coreValues.filter((_, i) => i !== index)
    setCoreValues(updated); saveField('coreValues', updated)
  }

  // Guardrails (I Am + But Never kept in sync as paired rows)
  const updateGuardrailIAm = (i, v) => {
    const u = [...guardrailsIAm]; while (u.length <= i) u.push(''); u[i] = v
    setGuardrailsIAm(u); debounce('guardrailsIAm', u)
  }
  const removeGuardrailIAm = (i) => {
    // Remove both I Am and But Never at this index to keep pairs in sync
    const uIAm = guardrailsIAm.filter((_, idx) => idx !== i)
    const uNever = guardrailsNever.filter((_, idx) => idx !== i)
    setGuardrailsIAm(uIAm); saveField('guardrailsIAm', uIAm)
    setGuardrailsNever(uNever); saveField('guardrailsNever', uNever)
  }
  const updateGuardrailNever = (i, v) => {
    const u = [...guardrailsNever]; while (u.length <= i) u.push(''); u[i] = v
    setGuardrailsNever(u); debounce('guardrailsNever', u)
  }
  const removeGuardrailNever = (i) => {
    // Remove both to keep pairs in sync
    const uIAm = guardrailsIAm.filter((_, idx) => idx !== i)
    const uNever = guardrailsNever.filter((_, idx) => idx !== i)
    setGuardrailsIAm(uIAm); saveField('guardrailsIAm', uIAm)
    setGuardrailsNever(uNever); saveField('guardrailsNever', uNever)
  }

  // Writing Rules
  const addAlwaysDo = () => { const u = [...alwaysDo, '']; setAlwaysDo(u); saveField('alwaysDo', u) }
  const updateAlwaysDo = (i, v) => { const u = [...alwaysDo]; u[i] = v; setAlwaysDo(u); debounce('alwaysDo', u) }
  const removeAlwaysDo = (i) => { const u = alwaysDo.filter((_, idx) => idx !== i); setAlwaysDo(u); saveField('alwaysDo', u) }
  const addNeverDo = () => { const u = [...neverDo, '']; setNeverDo(u); saveField('neverDo', u) }
  const updateNeverDo = (i, v) => { const u = [...neverDo]; u[i] = v; setNeverDo(u); debounce('neverDo', u) }
  const removeNeverDo = (i) => { const u = neverDo.filter((_, idx) => idx !== i); setNeverDo(u); saveField('neverDo', u) }
  const addSignaturePhrase = () => { const u = [...signaturePhrases, '']; setSignaturePhrases(u); saveField('signaturePhrases', u) }
  const updateSignaturePhrase = (i, v) => { const u = [...signaturePhrases]; u[i] = v; setSignaturePhrases(u); debounce('signaturePhrases', u) }
  const removeSignaturePhrase = (i) => { const u = signaturePhrases.filter((_, idx) => idx !== i); setSignaturePhrases(u); saveField('signaturePhrases', u) }

  // Stories - map prompt IDs to original hub fields
  const saveStoryAnswer = (id, val) => {
    if (id === 'origin1') {
      const updated = { ...storyOrigin, whyRealEstate: val }
      setStoryOrigin(updated); saveField('storyOrigin', updated)
    } else if (id === 'origin2') {
      const updated = { ...storyOrigin, beforeRealEstate: val }
      setStoryOrigin(updated); saveField('storyOrigin', updated)
    } else if (id === 'origin3') {
      const updated = { ...storyOrigin, mistakes: val }
      setStoryOrigin(updated); saveField('storyOrigin', updated)
    } else if (id === 'whyNow1' || id === 'whyNow2') {
      setStoryWhyNow(val); saveField('storyWhyNow', val)
    } else if (id === 'market3') {
      const updated = { ...storyMarket, localKnowledge: val }
      setStoryMarket(updated); saveField('storyMarket', updated)
    }
  }

  const getStoryAnswer = (id) => {
    if (id === 'origin1') return storyOrigin.whyRealEstate
    if (id === 'origin2') return storyOrigin.beforeRealEstate
    if (id === 'origin3') return storyOrigin.mistakes
    if (id === 'whyNow1' || id === 'whyNow2') return storyWhyNow
    if (id === 'market3') return storyMarket.localKnowledge
    return ''
  }

  const updateAboutYouField = (field, val) => {
    const updated = { ...aboutYou, [field]: val }
    setAboutYou(updated); debounce('aboutYou', updated)
  }

  // Export helper - generates all content as formatted text
  const generateGuideContent = () => {
    let text = 'BRAND VOICE & TONE GUIDE\n' + '='.repeat(60) + '\n\n'
    text += 'CORE VALUES IN ACTION\n' + '-'.repeat(40) + '\n'
    coreValues.forEach(item => {
      text += `I VALUE: ${item.value}\nWHICH MEANS I ALWAYS: ${item.behavior || '(Not yet defined)'}\n\n`
    })
    text += 'MY DESCRIPTOR WORDS\n' + '-'.repeat(40) + '\n'
    text += descriptorWords.join(', ') || '(Not yet defined)'
    text += '\n\n'
    text += 'GUARDRAILS\n' + '-'.repeat(40) + '\n'
    text += 'I AM:\n' + (guardrailsIAm.map(g => `  - ${g}`).join('\n') || '  (Not yet defined)')
    text += '\n\nBUT NEVER:\n' + (guardrailsNever.map(g => `  - ${g}`).join('\n') || '  (Not yet defined)')
    text += '\n\n'
    text += 'WRITING RULES\n' + '-'.repeat(40) + '\n'
    text += 'THINGS I ALWAYS DO:\n' + (alwaysDo.map(r => `  - ${r}`).join('\n') || '  (Not yet defined)')
    text += '\n\nTHINGS I NEVER DO:\n' + (neverDo.map(r => `  - ${r}`).join('\n') || '  (Not yet defined)')
    text += '\n\nSIGNATURE PHRASES:\n' + (signaturePhrases.map(p => `  - "${p}"`).join('\n') || '  (Not yet defined)')
    text += '\n\n'
    text += 'ANCHOR ENERGY\n' + '-'.repeat(40) + '\n'
    text += anchorEnergy || '(Not yet defined)'
    if (anchorFillIn) text += `\nMy written voice should feel like I am ${anchorFillIn} with the reader.`
    text += '\n\n'
    text += 'STORYTELLING\n' + '-'.repeat(40) + '\n'
    STORY_SECTIONS.forEach(section => {
      text += `\n${section.title.toUpperCase()}\n`
      section.prompts.forEach(p => {
        const answer = getStoryAnswer(p.id)
        if (answer) {
          text += `Q: ${p.text.substring(0, 80)}...\nA: ${answer}\n\n`
        }
      })
    })
    text += 'ABOUT YOU\n' + '-'.repeat(40) + '\n'
    const aboutYouFields = [
      { key: 'firstJob', label: 'First Job' },
      { key: 'whereGrowUp', label: 'Where You Grew Up' },
      { key: 'friendsDescribe', label: 'How Friends Describe You' },
      { key: 'playlistDrive', label: 'Go-To Playlist for Drives' },
      { key: 'doEveryDay', label: 'Something You Do Every Day' },
      { key: 'desertIsland', label: 'Desert Island Items' },
      { key: 'surprisinglyGoodAt', label: 'Surprisingly Good At' },
      { key: 'favoriteRestaurants', label: 'Favorite Local Restaurants' },
      { key: 'localQuirk', label: 'Local Area Quirk' },
      { key: 'favoriteDay', label: 'Favorite Day of the Week' },
      { key: 'onlineVsReal', label: 'Online vs Real Life' },
      { key: 'misunderstood', label: 'Often Misunderstood About' },
      { key: 'proud', label: 'Something You\'re Proud Of' },
      { key: 'quote', label: 'Favorite Quote' },
    ]
    aboutYouFields.forEach(field => {
      if (aboutYou[field.key]) {
        text += `${field.label}:\n${aboutYou[field.key]}\n\n`
      }
    })
    return text
  }

  // Export as TXT
  const downloadTXT = () => {
    const text = generateGuideContent()
    const el = document.createElement('a')
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    el.setAttribute('download', 'brand_voice_guide.txt')
    el.style.display = 'none'
    document.body.appendChild(el); el.click(); document.body.removeChild(el)
  }

  // Export as PDF using browser print
  const downloadPDF = () => {
    const text = generateGuideContent()
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Brand Voice & Tone Guide</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    h1 {
      font-size: 32px;
      margin-bottom: 40px;
      text-align: center;
      border-bottom: 3px solid #333;
      padding-bottom: 20px;
    }
    h2 {
      font-size: 20px;
      margin-top: 40px;
      margin-bottom: 15px;
      font-weight: 700;
      text-transform: uppercase;
      color: #1a1a1a;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    h3 {
      font-size: 14px;
      margin-top: 20px;
      margin-bottom: 8px;
      font-weight: 700;
      color: #1a1a1a;
    }
    p {
      margin: 0 0 12px 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    ul {
      margin-left: 20px;
      margin-bottom: 15px;
    }
    li {
      margin-bottom: 6px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .pair-row {
      display: flex;
      gap: 40px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .pair-col {
      flex: 1;
    }
    @media print {
      body { padding: 20px; }
      h1 { font-size: 28px; }
      h2 { margin-top: 25px; }
    }
  </style>
</head>
<body>
  <h1>Brand Voice & Tone Guide</h1>
  ${formatContentForPDF(text)}
</body>
</html>
    `
    const newWindow = window.open('', '_blank')
    newWindow.document.write(htmlContent)
    newWindow.document.close()
    setTimeout(() => {
      newWindow.print()
      // Don't close the window - let user close it after printing
    }, 250)
  }

  // Helper to format text content into nice HTML for PDF
  const formatContentForPDF = (text) => {
    let html = ''
    const lines = text.split('\n')
    let currentSection = null
    let bufferedContent = []

    const flushBuffer = () => {
      if (bufferedContent.length > 0) {
        const content = bufferedContent.join('\n').trim()
        if (content) {
          html += `<div class="section"><p>${content.replace(/\n/g, '<br>')}</p></div>`
        }
        bufferedContent = []
      }
    }

    lines.forEach((line) => {
      // Check if this is a section header (all caps with dashes or equals)
      if (line.match(/^[A-Z\s]+$/) && line.length > 10 && !line.includes('(')) {
        flushBuffer()
        html += `<h2>${line.trim()}</h2>`
      } else if (line.match(/^-{20,}$/) || line.match(/^={20,}$/)) {
        // Skip separator lines
      } else if (line.trim()) {
        bufferedContent.push(line)
      } else {
        flushBuffer()
      }
    })
    flushBuffer()

    return html
  }

  return (
    <div className="brand-voice-container">
      <div className="brand-voice-header">
        <div>
          <h1>Brand Voice & Tone</h1>
          <p className="brand-voice-subtitle">
            Your voice is not what you say. It is how you make people feel when you say it. Work through each section honestly. The real version is what connects.
          </p>
        </div>
        <div className="export-buttons">
          <button onClick={downloadTXT} className="export-button">
            Export as TXT
          </button>
          <button onClick={downloadPDF} className="export-button">
            Export as PDF
          </button>
        </div>
      </div>

      {/* Section 1: Core Values in Action */}
      <Card>
        <SectionHeader title="Core Values in Action" />
        <p className="section-intro">
          You already identified your core values. Now we make them operational. A value that does not change how you behave is just a word.
        </p>
        <table className="values-table">
          <thead>
            <tr>
              <th>I VALUE</th>
              <th>WHICH MEANS I ALWAYS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coreValues.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => updateCoreValueName(idx, e.target.value)}
                    placeholder="e.g., Honesty"
                    className="value-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.behavior}
                    onChange={(e) => updateCoreValueBehavior(idx, e.target.value)}
                    placeholder="e.g., I tell clients the truth even when it is uncomfortable"
                    className="value-input"
                  />
                </td>
                <td style={{ width: 30 }}>
                  <button onClick={() => removeCoreValueRow(idx)} className="remove-btn-inline">x</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addCoreValueRow} className="add-btn" style={{ marginTop: 8 }}>
          + Add value
        </button>
      </Card>

      {/* Section 2: Descriptor Word Bank */}
      <Card>
        <SectionHeader title="Your Descriptor Word Bank" />
        <p className="section-intro">
          Do not overthink this. Read through the list and click the words that make you think "yes, that is me" or "yes, that is who I am building toward." You are looking for 3 to 5 words.
        </p>
        <div className="descriptor-grid">
          {TONE_DESCRIPTORS.map(descriptor => (
            <button
              key={descriptor}
              className={`descriptor-btn ${descriptorWords.includes(descriptor) ? 'selected' : ''}`}
              onClick={() => toggleDescriptor(descriptor)}
            >
              {descriptor}
            </button>
          ))}
        </div>
        {descriptorWords.length > 0 && (
          <div className="my-words-bar">
            <span className="my-words-label">MY WORDS:</span>
            <span>{descriptorWords.join(', ')}</span>
          </div>
        )}
      </Card>

      {/* Section 3: Guardrails */}
      <Card>
        <SectionHeader title="Guardrails" />
        <p className="section-intro">
          Guardrails tell you and anyone writing on your behalf exactly where your voice lives. Not vague. Not aspirational. Specific enough that two different people could read them and produce the same feeling in their writing.
        </p>
        <div className="guardrails-container">
          <div className="guardrail-column">
            <h3 className="guardrail-title i-am">I Am</h3>
          </div>
          <div className="guardrail-column">
            <h3 className="guardrail-title but-never">But Never</h3>
          </div>
        </div>
        {/* Paired rows: I Am + But Never on the same line */}
        {Array.from({ length: Math.max(guardrailsIAm.length, guardrailsNever.length, 1) }).map((_, idx) => (
          <div key={idx} className="guardrails-container" style={{ marginBottom: 4 }}>
            <div className="guardrail-column">
              <div className="guardrail-item">
                <input type="text" value={guardrailsIAm[idx] || ''} onChange={(e) => updateGuardrailIAm(idx, e.target.value)} placeholder="e.g., Direct" />
                <button onClick={() => removeGuardrailIAm(idx)} className="remove-btn" aria-label="Remove">x</button>
              </div>
            </div>
            <div className="guardrail-column">
              <div className="guardrail-item">
                <input type="text" value={guardrailsNever[idx] || ''} onChange={(e) => updateGuardrailNever(idx, e.target.value)} placeholder="e.g., Harsh" />
                <button onClick={() => removeGuardrailNever(idx)} className="remove-btn" aria-label="Remove">x</button>
              </div>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => {
            const updatedIAm = [...guardrailsIAm, '']
            const updatedNever = [...guardrailsNever, '']
            setGuardrailsIAm(updatedIAm)
            setGuardrailsNever(updatedNever)
            saveField('guardrailsIAm', updatedIAm)
            saveField('guardrailsNever', updatedNever)
          }} className="add-btn">+ Add Guardrail Pair</button>
        </div>
      </Card>

      {/* Section 4: Writing Rules & Quirks */}
      <Card>
        <SectionHeader title="Writing Rules & Quirks" />
        <p className="section-intro">
          This is the stuff that makes your writing feel like YOU and not like it was spit out by a template. Formatting pet peeves, regional slang, recurring phrases, things you always do, things you'd never do. If someone else is writing for you (or AI is drafting for you), this is the cheat sheet that keeps it from sounding generic.
        </p>

        <div className="writing-subsection">
          <h3>Things I Always Do in My Writing</h3>
          <p className="writing-helper">The habits, phrases, and patterns that show up naturally. These are the things that make people read something and say "that sounds exactly like you."</p>
          {alwaysDo.map((item, idx) => (
            <div key={idx} className="writing-item">
              <span className="always-icon">&#9675;</span>
              <input type="text" value={item} onChange={(e) => updateAlwaysDo(idx, e.target.value)} placeholder="e.g., Always end emails with a CTA or next step" />
              <button onClick={() => removeAlwaysDo(idx)} className="remove-btn">x</button>
            </div>
          ))}
          <button onClick={addAlwaysDo} className="add-btn">+ Add</button>
        </div>

        <div className="writing-subsection" style={{ marginTop: 32 }}>
          <h3>Things I Never Do in My Writing</h3>
          <p className="writing-helper">The formatting, punctuation, words, or styles that make your skin crawl. If you see it in a draft, you know immediately that it wasn't written by you.</p>
          {neverDo.map((item, idx) => (
            <div key={idx} className="writing-item">
              <span className="never-icon">x</span>
              <input type="text" value={item} onChange={(e) => updateNeverDo(idx, e.target.value)} placeholder="e.g., Never use em dashes, they feel pretentious to me" />
              <button onClick={() => removeNeverDo(idx)} className="remove-btn">x</button>
            </div>
          ))}
          <button onClick={addNeverDo} className="add-btn">+ Add</button>
        </div>

        <div className="writing-subsection" style={{ marginTop: 32 }}>
          <h3>Signature Phrases or Words</h3>
          <p className="writing-helper">The words or phrases you use so often that your friends could quote them back to you. Your verbal fingerprints.</p>
          {signaturePhrases.map((item, idx) => (
            <div key={idx} className="phrase-item">
              <input type="text" value={item} onChange={(e) => updateSignaturePhrase(idx, e.target.value)} placeholder='e.g., "Let me walk you through it"' />
              <button onClick={() => removeSignaturePhrase(idx)} className="remove-btn">x</button>
            </div>
          ))}
          <button onClick={addSignaturePhrase} className="add-btn">+ Add</button>
        </div>
      </Card>

      {/* Section 5: Anchor */}
      <Card>
        <SectionHeader title="Anchor" />
        <p className="section-intro">
          When you talk to a client face to face, what energy are you giving? Circle one dominant energy. That is the lens your writing goes through.
        </p>
        <div className="anchor-options">
          {ANCHOR_OPTIONS.map(option => (
            <button
              key={option}
              className={`anchor-option ${anchorEnergy === option ? 'selected' : ''}`}
              onClick={() => {
                const newVal = anchorEnergy === option ? '' : option
                setAnchorEnergy(newVal)
                saveField('anchorEnergy', newVal)
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="anchor-fill-in">
          <div className="anchor-fill-label">
            My written voice should feel like I am <span className="anchor-blank">____________</span> with the reader.
          </div>
          <input
            type="text"
            value={anchorFillIn}
            onChange={(e) => { setAnchorFillIn(e.target.value); debounce('anchorFillIn', e.target.value) }}
            placeholder="e.g., coaching, guiding, strategizing..."
            className="anchor-input"
          />
        </div>
      </Card>

      {/* Section 6: Storytelling Guide */}
      <Card>
        <SectionHeader title="Storytelling Guide" />
        <p className="section-intro">
          Your story is not a biography. It is not a resume. It is not a highlight reel of your production numbers. It is the thing that makes a stranger feel like they already know you before they ever pick up the phone. Answer these prompts honestly. The polished version is not what connects. The real version is.
        </p>

        {STORY_SECTIONS.map(section => (
          <div key={section.key} className="story-section">
            <h3>{section.title}</h3>
            {section.prompts.map(prompt => (
              <div key={prompt.id} className="story-prompt-block">
                <p className="story-prompt-text"><strong>{prompt.text}</strong></p>
                <StoryTextarea
                  value={getStoryAnswer(prompt.id)}
                  onSave={(val) => saveStoryAnswer(prompt.id, val)}
                />
              </div>
            ))}
          </div>
        ))}
      </Card>

      {/* Section 7: About You */}
      <Card>
        <SectionHeader title="About You" />
        {[
          { key: 'firstJob', label: 'Tell me about your first job:' },
          { key: 'whereGrowUp', label: 'Where did you grow up?' },
          { key: 'friendsDescribe', label: 'Your best friends would describe you as:' },
          { key: 'playlistDrive', label: 'Your go-to playlist for a long drive:' },
          { key: 'doEveryDay', label: 'Something you do every day:' },
          { key: 'desertIsland', label: 'Three things you\'d take if stranded on a desert island:' },
          { key: 'surprisinglyGoodAt', label: "You're surprisingly good at:" },
          { key: 'favoriteRestaurants', label: 'Your favorite local restaurants (give us at least 3):' },
          { key: 'localQuirk', label: 'A quirk about your local area that is appealing to community members:' },
          { key: 'favoriteDay', label: 'Your favorite day of the week:' },
          { key: 'onlineVsReal', label: 'The biggest difference between you online and you in real life is:' },
          { key: 'misunderstood', label: 'Something people often get wrong about you:' },
          { key: 'proud', label: "Something you're proud of:" },
          { key: 'quote', label: 'A quote you live by:' },
        ].map(({ key, label }) => (
          <div key={key} className="about-prompt">
            <label><strong>{label}</strong></label>
            <StoryTextarea
              value={aboutYou[key] || ''}
              onSave={(val) => updateAboutYouField(key, val)}
            />
          </div>
        ))}
      </Card>
    </div>
  )
}

export default BrandVoice
