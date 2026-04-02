import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   SHARED UI COMPONENTS
   âââââââââââââââââââââââââââââââââââââââââââââââââââââââ */

function SectionHeader({ icon, title }) {
  return (
    <div style={{
      background: 'rgb(26,26,26)',
      color: '#fff',
      padding: '14px 20px',
      borderRadius: 8,
      marginBottom: 20,
      fontSize: 14,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {icon && <span>{icon}</span>}
      <span>{title}</span>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e2db',
      borderRadius: 8,
      padding: 24,
      marginBottom: 24,
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      ...style
    }}>
      {children}
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   TAPS RANGES â Profit First by Mike Michalowicz
   âââââââââââââââââââââââââââââââââââââââââââââââââââââââ */

const TAPS_RANGES = [
  { label: '$0 - $250K',     min: 0,        max: 250000,    profit: 5,  owner: 50, tax: 15, opex: 30 },
  { label: '$250K - $500K',  min: 250000,   max: 500000,    profit: 10, owner: 35, tax: 15, opex: 40 },
  { label: '$500K - $1M',    min: 500000,   max: 1000000,   profit: 15, owner: 20, tax: 15, opex: 50 },
  { label: '$1M - $5M',      min: 1000000,  max: 5000000,   profit: 10, owner: 10, tax: 15, opex: 65 },
  { label: '$5M - $10M',     min: 5000000,  max: 10000000,  profit: 15, owner: 5,  tax: 15, opex: 65 },
  { label: '$10M - $50M',    min: 10000000, max: 50000000,  profit: 20, owner: 0,  tax: 15, opex: 65 },
];

function getTapsRange(gci) {
  if (!gci || gci <= 0) return null;
  for (const range of TAPS_RANGES) {
    if (gci >= range.min && gci < range.max) return range;
  }
  return TAPS_RANGES[TAPS_RANGES.length - 1]; // fallback to highest
}

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   WHO PILL â clickable pill that opens a dropdown
   âââââââââââââââââââââââââââââââââââââââââââââââââââââââ */

const WHO_OPTIONS = ['Agent', 'Bookkeeper', 'CPA', 'Agent + CPA', 'Agent or Bookkeeper'];

function WhoPill({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowCustom(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allOptions = [...WHO_OPTIONS];
  if (value && !allOptions.includes(value)) {
    allOptions.push(value);
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>WHO:</span>
      <button
        onClick={() => { setOpen(!open); setShowCustom(false); }}
        style={{
          padding: '6px 12px',
          border: '1px solid #ddd',
          borderRadius: 4,
          fontSize: 13,
          background: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: '#333',
          minWidth: 100
        }}
      >
        <span>{value || 'Select...'}</span>
        <span style={{ fontSize: 10, color: '#999' }}>â¼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 30,
          marginTop: 4,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          zIndex: 100,
          minWidth: 180,
          overflow: 'hidden'
        }}>
          {allOptions.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '10px 14px',
                fontSize: 13,
                cursor: 'pointer',
                background: opt === value ? '#f5f3ee' : '#fff',
                fontWeight: opt === value ? 600 : 400,
                borderBottom: '1px solid #f0f0f0'
              }}
              onMouseOver={(e) => e.target.style.background = '#f9f7f3'}
              onMouseOut={(e) => e.target.style.background = opt === value ? '#f5f3ee' : '#fff'}
            >
              {opt}
            </div>
          ))}
          {!showCustom ? (
            <div
              onClick={() => setShowCustom(true)}
              style={{
                padding: '10px 14px',
                fontSize: 13,
                cursor: 'pointer',
                color: '#666',
                fontStyle: 'italic',
                borderTop: '1px solid #e5e2db'
              }}
              onMouseOver={(e) => e.target.style.background = '#f9f7f3'}
              onMouseOut={(e) => e.target.style.background = '#fff'}
            >
              + Add new...
            </div>
          ) : (
            <div style={{ padding: '8px 10px', borderTop: '1px solid #e5e2db', display: 'flex', gap: 6 }}>
              <input
                autoFocus
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customInput.trim()) {
                    onChange(customInput.trim());
                    setCustomInput('');
                    setOpen(false);
                    setShowCustom(false);
                  }
                }}
                placeholder="Type role..."
                style={{ flex: 1, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, outline: 'none' }}
              />
              <button
                onClick={() => {
                  if (customInput.trim()) {
                    onChange(customInput.trim());
                    setCustomInput('');
                    setOpen(false);
                    setShowCustom(false);
                  }
                }}
                style={{ padding: '6px 10px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   MAIN FINANCES COMPONENT
   âââââââââââââââââââââââââââââââââââââââââââââââââââââââ */

const Finances = ({ hubData, onSave }) => {
  const allData = hubData?.allData || {};
  const finances = allData?.finances || {};

  /* ââ Systems & Team from hub ââ */
  const hubSystems = hubData?.systems || [];
  const defaultSystems = [
    { id: 's1', name: 'CRM' }, { id: 's2', name: 'Email' }, { id: 's3', name: 'Phone' },
    { id: 's4', name: 'Calendar' }, { id: 's5', name: 'MLS' }, { id: 's6', name: 'Document Signing' },
    { id: 's7', name: 'Text/SMS' }, { id: 's8', name: 'Showing App' }, { id: 's9', name: 'Transaction Management' },
    { id: 's10', name: 'Canva/Design' }, { id: 's11', name: 'Zoom/Video' }, { id: 's12', name: 'Social Media' },
    { id: 's13', name: 'Brivity' },
  ];
  const hubTeamMembers = hubData?.teamMembers || [];

  const buildSystemsList = (hSys, defaults) => {
    if (!hSys || hSys.length === 0) return defaults.map(d => ({ ...d, monthlyAmount: 0 }));
    return hSys.map((sys, idx) => {
      if (typeof sys === 'string') return { id: `sys_${idx}`, name: sys, monthlyAmount: 0 };
      return { id: sys.id || `sys_${idx}`, name: sys.name || '', monthlyAmount: 0 };
    });
  };

  const applySystemCosts = (systemsList, costsObj) => {
    if (!costsObj) return systemsList;
    return systemsList.map(sys => ({ ...sys, monthlyAmount: costsObj[sys.id] ? parseFloat(costsObj[sys.id]) || 0 : sys.monthlyAmount || 0 }));
  };

  const buildTeamList = (members, costsObj) => {
    if (!Array.isArray(members)) return [];
    return members.map(m => ({
      id: m.id, name: m.name, role: m.role,
      monthlyAmount: costsObj?.[m.id] ? parseFloat(costsObj[m.id]) || 0 : 0
    }));
  };

  const defaultExpenseCategories = [
    { id: 1, name: 'Marketing & Advertising', description: 'Zillow, Facebook ads, signage, open house' },
    { id: 2, name: 'Technology & Software', description: 'CRM, MLS, transaction management, website' },
    { id: 3, name: 'Education & Coaching', description: 'Courses, conferences, coaching, designations' },
    { id: 4, name: 'Office & Admin', description: 'Rent, supplies, phone, internet, VA' },
    { id: 5, name: 'Transportation', description: 'Gas, car payment, mileage, parking' },
    { id: 6, name: 'Client Gifts & Events', description: 'Closing gifts, client appreciation, pop-bys' },
    { id: 7, name: 'Insurance & Licensing', description: 'E&O, health, licensing, association dues' },
    { id: 8, name: 'Meals & Entertainment', description: 'Client meetings, networking, team lunches' },
  ];

  const defaultSops = [
    { id: 1, frequency: 'EVERY CLOSE', responsible: 'Agent', text: 'Log closing in pipeline. Record sale price, GCI, cost of sale, lead source. Transfer commission into business checking.' },
    { id: 2, frequency: 'EVERY FRIDAY', responsible: 'Agent', text: 'Review the week\'s expenses. Categorize uncategorized items. Flag anything that looks off.' },
    { id: 3, frequency: '1ST & 15TH', responsible: 'Agent', text: 'Run Profit First allocations. Move money into Profit, Tax, and Owner\'s Pay accounts. Pay yourself.' },
    { id: 4, frequency: 'END OF MONTH', responsible: 'Agent or Bookkeeper', text: 'Reconcile all accounts. Compare bank statements to bookkeeping tool. Run P&L. Are you on track?' },
    { id: 5, frequency: 'QUARTERLY', responsible: 'Agent + CPA', text: 'Review P&L with accountant. Make estimated tax payments. Take quarterly profit distribution (50% of profit account).' },
    { id: 6, frequency: 'ANNUALLY', responsible: 'Agent + CPA', text: 'Full year review. File taxes. Set new revenue goals. Update TAPS percentages. Cancel unused recurring expenses.' },
  ];

  /* ââ Initialize state ââ */
  const initGCI = finances.tapsGCI ? parseFloat(finances.tapsGCI) : '';
  const initCOS = finances.tapsCostOfSale ? parseFloat(finances.tapsCostOfSale) : '';

  // Determine initial TAPS range from GCI
  const initRange = getTapsRange(typeof initGCI === 'number' ? initGCI : 0);

  const [localState, setLocalState] = useState({
    tapsGCI: initGCI,
    tapsCostOfSale: initCOS,
    tapsProfitPct: finances.tapsProfitPct ? parseFloat(finances.tapsProfitPct) : (initRange?.profit ?? 5),
    tapsOwnerPayPct: finances.tapsOwnerPayPct ? parseFloat(finances.tapsOwnerPayPct) : (initRange?.owner ?? 50),
    tapsTaxPct: finances.tapsTaxPct ? parseFloat(finances.tapsTaxPct) : (initRange?.tax ?? 15),
    bookkeepingTool: finances.bookkeepingTool || '',
    systems: applySystemCosts(buildSystemsList(hubSystems, defaultSystems), finances.systemCosts),
    team: buildTeamList(hubTeamMembers, finances.teamCosts),
    expenseCategories: Array.isArray(finances.expenseCategories) ? finances.expenseCategories : defaultExpenseCategories,
    sops: Array.isArray(finances.sops) ? finances.sops : defaultSops,
    tapsExpanded: false,
  });

  const debounceTimer = useRef(null);

  const debouncedSave = useCallback((newState) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const sysCosts = {};
      newState.systems.forEach(s => { sysCosts[s.id] = s.monthlyAmount ? String(s.monthlyAmount) : ''; });
      const teamCosts = {};
      newState.team.forEach(m => { teamCosts[m.id] = m.monthlyAmount ? String(m.monthlyAmount) : ''; });

      onSave({
        allData: {
          finances: {
            tapsGCI: String(newState.tapsGCI || ''),
            tapsCostOfSale: String(newState.tapsCostOfSale || ''),
            tapsProfitPct: String(newState.tapsProfitPct),
            tapsOwnerPayPct: String(newState.tapsOwnerPayPct),
            tapsTaxPct: String(newState.tapsTaxPct),
            bookkeepingTool: newState.bookkeepingTool,
            systemCosts: sysCosts,
            teamCosts: teamCosts,
            expenseCategories: newState.expenseCategories,
            sops: newState.sops
          }
        }
      });
    }, 1000);
  }, [onSave]);

  const updateField = useCallback((key, value) => {
    setLocalState(prev => {
      const newState = { ...prev, [key]: value };

      // Auto-populate TAPS percentages when GCI changes
      if (key === 'tapsGCI') {
        const range = getTapsRange(parseFloat(value) || 0);
        if (range) {
          newState.tapsProfitPct = range.profit;
          newState.tapsOwnerPayPct = range.owner;
          newState.tapsTaxPct = range.tax;
        }
      }

      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  /* ââ Computed values ââ */
  const gciNum = parseFloat(localState.tapsGCI) || 0;
  const cosNum = parseFloat(localState.tapsCostOfSale) || 0;
  const netProfit = gciNum - cosNum;
  const operatingExpensePercent = Math.max(0, 100 - localState.tapsProfitPct - localState.tapsOwnerPayPct - localState.tapsTaxPct);
  const activeRange = getTapsRange(gciNum);

  const systemsTotal = useMemo(() => {
    return (localState.systems || []).reduce((sum, s) => sum + (parseFloat(s.monthlyAmount) || 0), 0);
  }, [localState.systems]);

  const teamTotal = useMemo(() => {
    return (localState.team || []).reduce((sum, m) => sum + (parseFloat(m.monthlyAmount) || 0), 0);
  }, [localState.team]);

  /* ââ Shared button style ââ */
  const addBtnStyle = {
    marginTop: 16,
    padding: '10px 20px',
    background: '#fff',
    border: '2px dashed #c9b972',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#333',
    cursor: 'pointer',
  };

  const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* ââââ PAGE TITLE ââââ */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          Finances & Profit First
        </h1>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          Revenue minus Profit equals Expenses. You pay yourself FIRST, then figure out how to run the business on what's left. That's the whole game.
        </p>
      </div>

      {/* ââââ SECTION 1: TAPS ââââ */}
      <Card>
        <SectionHeader icon="ð²" title="What Can Your Business Sustainably Support?" />
        <p style={{ fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
          Enter your GCI and cost of sale. This will show you exactly what you should be paying yourself, setting aside for taxes, keeping as profit, and spending on your business.
        </p>

        {/* GCI + Cost of Sale + Net Profit */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#333' }}>Gross Commission Income (GCI)</label>
            <div style={{ display: 'flex', alignItems: 'center', borderRadius: 4, border: '1px solid #ddd' }}>
              <span style={{ padding: '0 10px', color: '#999', fontWeight: 600 }}>$</span>
              <input
                type="text"
                inputMode="numeric"
                value={localState.tapsGCI === '' ? '' : fmt(localState.tapsGCI)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  updateField('tapsGCI', raw === '' ? '' : parseInt(raw, 10));
                }}
                placeholder="0"
                style={{ flex: 1, border: 'none', padding: '10px 12px', fontSize: 14, outline: 'none' }}
              />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#333' }}>Cost of Sale</label>
            <div style={{ display: 'flex', alignItems: 'center', borderRadius: 4, border: '1px solid #ddd' }}>
              <span style={{ padding: '0 10px', color: '#999', fontWeight: 600 }}>$</span>
              <input
                type="text"
                inputMode="numeric"
                value={localState.tapsCostOfSale === '' ? '' : fmt(localState.tapsCostOfSale)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  updateField('tapsCostOfSale', raw === '' ? '' : parseInt(raw, 10));
                }}
                placeholder="0"
                style={{ flex: 1, border: 'none', padding: '10px 12px', fontSize: 14, outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Net Profit display â only when both values are entered */}
        {gciNum > 0 && (
          <div style={{
            background: netProfit >= 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${netProfit >= 0 ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: 8,
            padding: '14px 20px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Net Revenue (GCI - Cost of Sale)</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: netProfit >= 0 ? '#16a34a' : '#dc2626' }}>
              ${fmt(netProfit)}
            </span>
          </div>
        )}

        {/* TAPS Allocation Percentages */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: '#333', textTransform: 'uppercase' }}>
            Set Your Allocation Percentages:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {/* Profit */}
            <div style={{ border: '1px solid #e5e2db', borderTopWidth: 4, borderTopStyle: 'dashed', borderTopColor: 'rgb(76,175,80)', borderRadius: 8, padding: 20, background: '#fff', textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 12 }}>Profit</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                <input type="number" value={localState.tapsProfitPct} onChange={(e) => updateField('tapsProfitPct', parseFloat(e.target.value) || 0)}
                  style={{ width: 60, padding: '8px 6px', border: '2px solid rgb(76,175,80)', borderRadius: 4, fontSize: 18, fontWeight: 600, textAlign: 'center', outline: 'none', color: '#333' }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>%</span>
              </div>
              <p style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>Business Savings</p>
            </div>

            {/* Owner's Pay */}
            <div style={{ border: '1px solid #e5e2db', borderTopWidth: 4, borderTopStyle: 'dashed', borderTopColor: 'rgb(33,150,243)', borderRadius: 8, padding: 20, background: '#fff', textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 12 }}>Owner's Pay</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                <input type="number" value={localState.tapsOwnerPayPct} onChange={(e) => updateField('tapsOwnerPayPct', parseFloat(e.target.value) || 0)}
                  style={{ width: 60, padding: '8px 6px', border: '2px solid rgb(33,150,243)', borderRadius: 4, fontSize: 18, fontWeight: 600, textAlign: 'center', outline: 'none', color: '#333' }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>%</span>
              </div>
              <p style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>Your Payroll</p>
            </div>

            {/* Tax */}
            <div style={{ border: '1px solid #e5e2db', borderTopWidth: 4, borderTopStyle: 'dashed', borderTopColor: 'rgb(244,67,54)', borderRadius: 8, padding: 20, background: '#fff', textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 12 }}>Tax</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                <input type="number" value={localState.tapsTaxPct} onChange={(e) => updateField('tapsTaxPct', parseFloat(e.target.value) || 0)}
                  style={{ width: 60, padding: '8px 6px', border: '2px solid rgb(244,67,54)', borderRadius: 4, fontSize: 18, fontWeight: 600, textAlign: 'center', outline: 'none', color: '#333' }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>%</span>
              </div>
              <p style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>IRS</p>
            </div>

            {/* Operating Expenses (calculated) */}
            <div style={{ border: '1px solid #e5e2db', borderTopWidth: 4, borderTopStyle: 'dashed', borderTopColor: 'rgb(255,152,0)', borderRadius: 8, padding: 20, background: '#fff', textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 12 }}>Operating Expenses</p>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'rgb(255,152,0)' }}>{operatingExpensePercent}%</span>
              </div>
              <p style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>Running the Biz</p>
            </div>
          </div>
        </div>

        {/* BUDGET BREAKDOWN â dollar amounts per category */}
        {gciNum > 0 && (
          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: '#333', textTransform: 'uppercase' }}>
              Your Budget Breakdown
            </p>
            <div style={{ background: '#fafaf9', border: '1px solid #e5e2db', borderRadius: 8, overflow: 'hidden' }}>
              {[
                { label: 'Profit', pct: localState.tapsProfitPct, color: 'rgb(76,175,80)', desc: 'Business Savings' },
                { label: "Owner's Pay", pct: localState.tapsOwnerPayPct, color: 'rgb(33,150,243)', desc: 'Your Payroll' },
                { label: 'Tax', pct: localState.tapsTaxPct, color: 'rgb(244,67,54)', desc: 'Set Aside for IRS' },
                { label: 'Operating Expenses', pct: operatingExpensePercent, color: 'rgb(255,152,0)', desc: 'Running the Biz' },
              ].map((item, idx) => {
                const amount = netProfit * (item.pct / 100);
                const monthly = amount / 12;
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderBottom: idx < 3 ? '1px solid #e5e2db' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 4, height: 40, background: item.color, borderRadius: 2 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{item.desc}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: 600 }}>Monthly</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>${fmt(Math.round(monthly))}</div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 100 }}>
                        <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: 600 }}>Annual</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>${fmt(Math.round(amount))}</div>
                      </div>
                      <div style={{
                        background: item.color, color: '#fff', padding: '4px 10px', borderRadius: 4,
                        fontSize: 13, fontWeight: 700, minWidth: 50, textAlign: 'center'
                      }}>
                        {item.pct}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 20px', marginTop: 8, background: '#1a1a1a', borderRadius: 8, color: '#fff'
            }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Total Net Revenue</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#D4D926' }}>${fmt(netProfit)}/yr &nbsp; (${fmt(Math.round(netProfit / 12))}/mo)</span>
            </div>
          </div>
        )}

        {/* TAPS Table Toggle */}
        <div style={{ marginTop: 24 }}>
          <button onClick={() => updateField('tapsExpanded', !localState.tapsExpanded)}
            style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: '#555', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, transform: localState.tapsExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>&#9660;</span>
            View TAPS Allocation Table (All Revenue Ranges)
          </button>

          {localState.tapsExpanded && (
            <div style={{ marginTop: 16, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid #e5e2db' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e5e2db', color: '#c9b972' }}>Revenue Range</th>
                    <th style={{ padding: 12, textAlign: 'center', fontWeight: 700, borderBottom: '2px solid #e5e2db', color: 'rgb(76,175,80)' }}>Profit</th>
                    <th style={{ padding: 12, textAlign: 'center', fontWeight: 700, borderBottom: '2px solid #e5e2db', color: 'rgb(33,150,243)' }}>Owner's Pay</th>
                    <th style={{ padding: 12, textAlign: 'center', fontWeight: 700, borderBottom: '2px solid #e5e2db', color: 'rgb(244,67,54)' }}>Tax</th>
                    <th style={{ padding: 12, textAlign: 'center', fontWeight: 700, borderBottom: '2px solid #e5e2db', color: 'rgb(255,152,0)' }}>OpEx</th>
                  </tr>
                </thead>
                <tbody>
                  {TAPS_RANGES.map((range, idx) => {
                    const isActive = activeRange && range.label === activeRange.label;
                    return (
                      <tr key={idx} style={{
                        background: isActive ? '#fefce8' : (idx % 2 === 0 ? '#fff' : '#fafaf9'),
                        fontWeight: isActive ? 600 : 400,
                        borderLeft: isActive ? '3px solid #c9b972' : '3px solid transparent'
                      }}>
                        <td style={{ padding: 12, borderBottom: '1px solid #e5e2db' }}>{range.label}</td>
                        <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e2db' }}>{range.profit}%</td>
                        <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e2db' }}>{range.owner}%</td>
                        <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e2db' }}>{range.tax}%</td>
                        <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e2db' }}>{range.opex}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: 11, color: '#999', marginTop: 8, fontStyle: 'italic' }}>TAPS by Mike Michalowicz, Profit First</p>
            </div>
          )}
        </div>
      </Card>

      {/* ââââ SECTION 2: SYSTEMS & TEAM ââââ */}
      <Card>
        <SectionHeader icon="ð" title="Systems & Team Investment" />
        <p style={{ fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
          Every system you pay for and every person on your team is an investment. Enter the monthly cost for each one and see the 4x ROI needed to justify that spend.
        </p>

        {/* YOUR SYSTEMS */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: '#333', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>âï¸</span> <span style={{ textTransform: 'uppercase' }}>Your Systems</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(localState.systems || []).map((system) => {
              const amt = parseFloat(system.monthlyAmount) || 0;
              const roiNeeded = amt > 0 ? amt * 12 * 4 : 0;
              return (
                <div key={system.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', borderBottom: '1px solid #e5e2db', background: '#fff'
                }}>
                  <span style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>{system.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 4, width: 100 }}>
                      <span style={{ padding: '0 6px 0 8px', color: '#999', fontWeight: 600, fontSize: 13 }}>$</span>
                      <input
                      type="text"
                      inputMode="numeric"
                      value={amt > 0 ? amt : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        const updated = localState.systems.map(s =>
                          s.id === system.id ? { ...s, monthlyAmount: raw === '' ? 0 : parseFloat(raw) || 0 } : s
                        );
                        updateField('systems', updated);
                      }}
                      placeholder="0/mo"
                      style={{ flex: 1, padding: '8px 10px', border: 'none',  fontSize: 13, outline: 'none', textAlign: 'right' }}
                    />
                    </div>
                    {roiNeeded > 0 && (
                      <div style={{
                        background: '#1a1a1a', color: '#fff', padding: '6px 12px', borderRadius: 6,
                        fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, whiteSpace: 'nowrap'
                      }}>
                        <div style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.8 }}>4x ROI Needed</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#D4D926' }}>${fmt(roiNeeded)}<span style={{ fontSize: 10, fontWeight: 400 }}>/yr</span></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Systems Total */}
          {systemsTotal > 0 && (
            <div style={{ textAlign: 'right', padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#333' }}>
              Systems Total: ${fmt(systemsTotal)}/mo
            </div>
          )}

          <button onClick={() => {
            const newId = 'sys_custom_' + Date.now();
            updateField('systems', [...localState.systems, { id: newId, name: '', monthlyAmount: 0 }]);
          }} style={addBtnStyle}>+ Add System / Tool</button>
        </div>

        {/* YOUR TEAM */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: '#333', textTransform: 'uppercase' }}>Your Team</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(localState.team || []).map((member) => {
              const amt = parseFloat(member.monthlyAmount) || 0;
              const roiNeeded = amt > 0 ? amt * 12 * 4 : 0;
              return (
                <div key={member.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', borderBottom: '1px solid #e5e2db', background: '#fff'
                }}>
                  <div>
                    <p style={{ fontSize: 14, color: '#333', fontWeight: 500, margin: 0 }}>{member.name}</p>
                    {member.role && <p style={{ fontSize: 12, color: '#999', margin: '2px 0 0 0' }}>{member.role}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 4, width: 100 }}>
                      <span style={{ padding: '0 6px 0 8px', color: '#999', fontWeight: 600, fontSize: 13 }}>$</span>
                      <input
                      type="text"
                      inputMode="numeric"
                      value={amt > 0 ? amt : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        const updated = localState.team.map(t =>
                          t.id === member.id ? { ...t, monthlyAmount: raw === '' ? 0 : parseFloat(raw) || 0 } : t
                        );
                        updateField('team', updated);
                      }}
                      placeholder="0/mo"
                      style={{ flex: 1, padding: '8px 10px', border: 'none',  fontSize: 13, outline: 'none', textAlign: 'right' }}
                    />
                    </div>
                    {roiNeeded > 0 && (
                      <div style={{
                        background: '#1a1a1a', color: '#fff', padding: '6px 12px', borderRadius: 6,
                        fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, whiteSpace: 'nowrap'
                      }}>
                        <div style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.8 }}>4x ROI Needed</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#D4D926' }}>${fmt(roiNeeded)}<span style={{ fontSize: 10, fontWeight: 400 }}>/yr</span></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {teamTotal > 0 && (
            <div style={{ textAlign: 'right', padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#333' }}>
              Team Total: ${fmt(teamTotal)}/mo
            </div>
          )}

          <button onClick={() => {
            const newId = 'team_custom_' + Date.now();
            updateField('team', [...localState.team, { id: newId, name: '', role: '', monthlyAmount: 0 }]);
          }} style={addBtnStyle}>+ Add Team Member / Role</button>
        </div>

        {/* Combined monthly total */}
        {(systemsTotal + teamTotal) > 0 && (
          <div style={{
            marginTop: 20, padding: '14px 20px', background: '#f9f7f3', borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e2db'
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>Monthly Operating Budget</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>${fmt(systemsTotal + teamTotal)}/mo</span>
          </div>
        )}
      </Card>

      {/* ââââ SECTION 3: EXPENSE CATEGORIES ââââ */}
      <Card>
        <SectionHeader icon="ð" title="Expense Categories to Track" />
        <p style={{ fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
          Track these buckets in your bookkeeping tool. Whether it's QuickBooks, Relay, Wave, or a spreadsheet, these categories need to exist.
        </p>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#333' }}>Bookkeeping Tool</label>
          <input
            type="text"
            value={localState.bookkeepingTool}
            onChange={(e) => updateField('bookkeepingTool', e.target.value)}
            placeholder="e.g., QuickBooks, Relay, Wave"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {(localState.expenseCategories || []).map((cat) => (
            <div key={cat.id} style={{ border: '1px solid #e5e2db', borderRadius: 8, padding: 16, background: '#fff' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '0 0 4px 0' }}>{cat.name}</p>
              <p style={{ fontSize: 12, color: '#999', margin: 0 }}>{cat.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ââââ SECTION 4: SOP ââââ */}
      <Card>
        <SectionHeader icon="ð" title="Income & Expense Tracking SOP" />
        <p style={{ fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
          Your standard operating procedure for tracking money. Edit the tasks, assign WHO is responsible, and make it yours.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {(localState.sops || []).map((sop) => (
            <div key={sop.id} style={{ border: '1px solid #e5e2db', borderRadius: 8, padding: 20, background: '#fff' }}>
              {/* Top row: Frequency pill + WHO pill + trash â all on same line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={sop.frequency}
                  onChange={(e) => {
                    const updated = localState.sops.map(s => s.id === sop.id ? { ...s, frequency: e.target.value } : s);
                    updateField('sops', updated);
                  }}
                  style={{
                    padding: '8px 14px', border: '2px solid #c9b972', borderRadius: 4,
                    fontSize: 12, fontWeight: 700, textTransform: 'uppercase', outline: 'none',
                    background: '#fff', color: '#333', minWidth: 120, maxWidth: 180
                  }}
                />

                <WhoPill
                  value={sop.responsible}
                  onChange={(val) => {
                    const updated = localState.sops.map(s => s.id === sop.id ? { ...s, responsible: val } : s);
                    updateField('sops', updated);
                  }}
                />

                <div style={{ flex: 1 }} />

                <button
                  onClick={() => {
                    const updated = localState.sops.filter(s => s.id !== sop.id);
                    updateField('sops', updated);
                  }}
                  style={{
                    background: 'none', border: 'none', fontSize: 16, color: '#ccc',
                    cursor: 'pointer', padding: '4px 8px', borderRadius: 4
                  }}
                  title="Delete step"
                  onMouseOver={(e) => e.currentTarget.style.color = '#c44'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#ccc'}
                >
                  ð
                </button>
              </div>

              <textarea
                value={sop.text}
                onChange={(e) => {
                  const updated = localState.sops.map(s => s.id === sop.id ? { ...s, text: e.target.value } : s);
                  updateField('sops', updated);
                }}
                style={{
                  width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: 4,
                  fontSize: 13, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  resize: 'vertical', minHeight: 60, outline: 'none', lineHeight: 1.5, boxSizing: 'border-box'
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => {
              const newId = Math.max(...localState.sops.map(s => s.id), 0) + 1;
              updateField('sops', [...localState.sops, { id: newId, frequency: 'CUSTOM', responsible: 'Agent', text: '' }]);
            }}
            style={{ ...addBtnStyle, marginTop: 0, width: '100%', textAlign: 'center', padding: '14px 20px' }}
          >
            + Add Step
          </button>
        </div>
      </Card>
    </div>
  );
};

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   ERROR BOUNDARY
   âââââââââââââââââââââââââââââââââââââââââââââââââââââââ */

class FinancesErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Finances error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, color: '#856404' }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Something went wrong in the Finances section</p>
          <p style={{ fontSize: 13, color: '#666' }}>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 16px', background: '#ffc107', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function FinancesWithErrorBoundary(props) {
  return <FinancesErrorBoundary><Finances {...props} /></FinancesErrorBoundary>;
}
