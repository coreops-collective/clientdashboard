import React, { useState, useCallback, useMemo, useEffect } from 'react';
import './Pipeline.css';

const STAGES = [
  'Lead',
  'Consultation',
  'Pre-Listing',
  'Active Listing',
  'Active Shopper',
  'Under Contract',
  'Closed',
  'Fell Through'
];
const DEAL_TYPES = ['Buyer', 'Seller', 'Buyer/Seller', 'Outbound Referral', 'Lease'];

const stageColors = {
  Lead: { bg: '#e8e8e8', text: '#1a1a1a' },
  Consultation: { bg: '#d4e8f0', text: '#1a4a6b' },
  'Pre-Listing': { bg: '#f0e8d4', text: '#6b5a1a' },
  'Active Listing': { bg: '#d4f0e8', text: '#1a6b4a' },
  'Active Shopper': { bg: '#e8d4f0', text: '#4a1a6b' },
  'Under Contract': { bg: '#e8f0eb', text: '#3d6b4a' },
  Closed: { bg: '#1a1a1a', text: '#fff' },
  'Fell Through': { bg: '#fde8e8', text: '#8a4040' }
};

const typeColors = {
  Buyer: { bg: '#5a7c65', text: '#fff' },
  Seller: { bg: '#1a1a1a', text: '#fff' },
  'Buyer/Seller': { bg: '#D4D926', text: '#1a1a1a' },
  'Outbound Referral': { bg: '#8b5c8a', text: '#fff' },
  Lease: { bg: '#5a5a8a', text: '#fff' }
};

const emptyDeal = {
  id: '',
  clientName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  dealType: 'Buyer',
  stage: 'Lead',
  listDate: '',
  mutualAcceptanceDate: '',
  expirationDate: '',
  closeDate: '',
  salePrice: '',
  commissionPct: '',
  gci: '',
  costOfSale: [],
  leadSource: '',
  clientReferral: '',
  agentReferral: '',
  lender: '',
  titleCompany: '',
  titleEscrow: '',
  assignedAgent: '',
  coAgent: '',
  notes: ''
};

function Pipeline({ hubData, onSave }) {
  const allData = hubData?.allData || {};
  const deals = allData?.pipeline?.deals || hubData?._meta?.pipeline || [];

  const [filterStage, setFilterStage] = useState('All Stages');
  const [filterType, setFilterType] = useState('All Types');
  const [hideClosed, setHideClosed] = useState(false);
  const [sortBy, setSortBy] = useState('Newest First');
  const [viewPeriod, setViewPeriod] = useState('All Time');
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState(emptyDeal);
  const [expandedDeals, setExpandedDeals] = useState(new Set());
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [newLeadSource, setNewLeadSource] = useState('');
  const [showNewLeadSourceInput, setShowNewLeadSourceInput] = useState(false);
  const fileInputRef = React.useRef(null);

  const savePipeline = useCallback((updatedDeals) => {
    onSave({
      _meta: { pipeline: updatedDeals },
      allData: { ...allData, pipeline: { ...allData.pipeline, deals: updatedDeals } }
    });
  }, [onSave, allData]);

  const debouncedSave = useCallback((updatedDeals) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    const timeout = setTimeout(() => savePipeline(updatedDeals), 1000);
    setSaveTimeout(timeout);
  }, [saveTimeout, savePipeline]);

  // Get lead sources (could be strings or objects with .name)
  const leadSources = useMemo(() => {
    const raw = hubData?.allData?.['lead-sources']?.sources || hubData?._meta?.leadSources || [];
    if (!Array.isArray(raw)) return [];
    return raw.map(s => typeof s === 'string' ? s : (s?.name || s?.label || String(s || ''))).filter(Boolean);
  }, [hubData]);

  // Get clients for Client Referral - from Client for Life past clients + pipeline closed deals
  const clientsList = useMemo(() => {
    const cflClients = hubData?.allData?.['client-for-life']?.pastClients || [];
    const pipelineDeals = hubData?.allData?.pipeline?.deals || hubData?._meta?.pipeline || [];
    const closedClients = pipelineDeals
      .filter(d => d.stage === 'Closed' && d.clientName)
      .map(d => ({ id: d.id, name: d.clientName }));
    const allClients = [...cflClients, ...closedClients];
    // Deduplicate by name
    const seen = new Set();
    return allClients.filter(c => {
      const name = c?.name || c?.clientName || '';
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [hubData]);

  // Get agents for Agent Referral
  const agentsList = useMemo(() => {
    const raw = hubData?.allData?.['agent-referrals']?.directory || hubData?.allData?.['agent-referrals']?.agents || [];
    if (!Array.isArray(raw)) return [];
    return raw;
  }, [hubData]);

  // Get lenders
  const lendersList = useMemo(() => {
    const vendors = hubData.allData?.['vendor-partnerships']?.vendors || [];
    return vendors.filter(v => v.category === 'Lender');
  }, [hubData]);

  // Get title companies
  const titleCompaniesList = useMemo(() => {
    const vendors = hubData.allData?.['vendor-partnerships']?.vendors || [];
    return vendors.filter(v => v.category === 'Title Company');
  }, [hubData]);

  // Get team members
  const teamMembers = useMemo(() => {
    return hubData?.teamMembers || hubData?._meta?.teamMembers || [];
  }, [hubData]);

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let result = [...deals];

    if (filterStage !== 'All Stages') {
      result = result.filter(d => d.stage === filterStage);
    }

    if (filterType !== 'All Types') {
      result = result.filter(d => d.dealType === filterType);
    }

    if (hideClosed) {
      result = result.filter(d => d.stage !== 'Closed' && d.stage !== 'Fell Through' && d.stage !== 'Lost');
    }

    if (sortBy === 'Newest First') {
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (sortBy === 'Oldest First') {
      result.sort((a, b) => (a.id || 0) - (b.id || 0));
    } else if (sortBy === 'Price High to Low') {
      result.sort((a, b) => {
        const priceA = parseFloat(a.salePrice?.replace(/[,$]/g, '') || 0);
        const priceB = parseFloat(b.salePrice?.replace(/[,$]/g, '') || 0);
        return priceB - priceA;
      });
    } else if (sortBy === 'Price Low to High') {
      result.sort((a, b) => {
        const priceA = parseFloat(a.salePrice?.replace(/[,$]/g, '') || 0);
        const priceB = parseFloat(b.salePrice?.replace(/[,$]/g, '') || 0);
        return priceA - priceB;
      });
    }

    return result;
  }, [deals, filterStage, filterType, hideClosed, sortBy]);

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped = {};
    STAGES.forEach(stage => {
      grouped[stage] = filteredDeals.filter(d => d.stage === stage);
    });
    return grouped;
  }, [filteredDeals]);

  // Calculate stats
  const stats = useMemo(() => {
    const pipeline = deals.filter(d => d.stage === 'Pipeline').length;
    const pending = deals.filter(d => d.stage === 'Pending' || d.stage === 'Under Contract').length;
    const pendingGci = deals
      .filter(d => d.stage === 'Pending' || d.stage === 'Under Contract')
      .reduce((sum, d) => sum + (parseFloat(d.gci) || 0), 0);
    const closedUnits = deals.filter(d => d.stage === 'Closed').length;
    const closedGci = deals
      .filter(d => d.stage === 'Closed')
      .reduce((sum, d) => sum + (parseFloat(d.gci) || 0), 0);
    const totalVolume = deals
      .filter(d => d.stage === 'Closed')
      .reduce((sum, d) => sum + (parseFloat(d.salePrice?.replace(/[,$]/g, '') || 0)), 0);
    const avgGci = closedUnits > 0 ? closedGci / closedUnits : 0;
    const buyerCount = deals.filter(d => d.dealType === 'Buyer').length;
    const sellerCount = deals.filter(d => d.dealType === 'Seller').length;

    return {
      pipeline,
      pending,
      pendingGci,
      closedUnits,
      closedGci,
      totalVolume,
      avgGci,
      buyerCount,
      sellerCount
    };
  }, [deals]);

  const handleOpenForm = () => {
    setEditingDeal(null);
    setFormData(emptyDeal);
    setShowForm(true);
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal.id);
    setFormData({ ...deal });
    // Don't set showForm to true - we'll expand inline instead
    toggleDealExpand(deal.id);
  };

  const handleDeleteDeal = (id) => {
    if (window.confirm('Delete this deal?')) {
      const updated = deals.filter(d => d.id !== id);
      savePipeline(updated);
    }
  };

  const handleFormChange = (field, value) => {
    const updated = { ...formData, [field]: value };

    if (field === 'salePrice' || field === 'commissionPct') {
      const price = parseFloat(updated.salePrice?.replace(/[,$]/g, '') || 0);
      const pct = parseFloat(updated.commissionPct) || 0;
      updated.gci = (price * (pct / 100)).toFixed(2);
    }

    // Handle lead source selection
    if (field === 'leadSource') {
      setShowNewLeadSourceInput(value === 'Other / Add New');
      setNewLeadSource('');
    }

    setFormData(updated);
  };

  const handleAddCostOfSale = () => {
    const updated = { ...formData };
    if (!Array.isArray(updated.costOfSale)) {
      updated.costOfSale = [];
    }
    updated.costOfSale.push({ label: '', amount: '' });
    setFormData(updated);
  };

  const handleRemoveCostOfSale = (index) => {
    const updated = { ...formData };
    updated.costOfSale.splice(index, 1);
    setFormData(updated);
  };

  const handleCostOfSaleChange = (index, field, value) => {
    const updated = { ...formData };
    if (!Array.isArray(updated.costOfSale)) {
      updated.costOfSale = [];
    }
    if (!updated.costOfSale[index]) {
      updated.costOfSale[index] = { label: '', amount: '' };
    }
    updated.costOfSale[index][field] = value;
    setFormData(updated);
  };

  const handleSaveDeal = () => {
    if (!formData.clientName.trim()) {
      alert('Client name is required');
      return;
    }

    // Handle new lead source
    let updatedFormData = { ...formData };
    if (showNewLeadSourceInput && newLeadSource.trim()) {
      updatedFormData.leadSource = newLeadSource.trim();
    }

    let updated;
    if (editingDeal) {
      updated = deals.map(d => d.id === editingDeal ? updatedFormData : d);
    } else {
      const newDeal = {
        ...updatedFormData,
        id: Date.now().toString()
      };
      updated = [...deals, newDeal];
    }

    savePipeline(updated);
    setShowForm(false);
    setFormData(emptyDeal);
    setEditingDeal(null);
    setShowNewLeadSourceInput(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData(emptyDeal);
    setEditingDeal(null);
    setShowNewLeadSourceInput(false);
  };

  const toggleDealExpand = (id) => {
    const newSet = new Set(expandedDeals);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedDeals(newSet);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value?.toString().replace(/[,$]/g, '') || 0);
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        const newDeals = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          // Parse CSV line properly (handle quoted values with commas)
          const values = [];
          let current = '';
          let inQuotes = false;
          for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim().replace(/^"|"$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim().replace(/^"|"$/g, ''));

          const deal = {
            id: Date.now().toString() + Math.random(),
            clientName: values[headers.indexOf('Client Name')] || '',
            address: values[headers.indexOf('Address')] || '',
            city: values[headers.indexOf('City')] || '',
            state: values[headers.indexOf('State')] || '',
            zip: values[headers.indexOf('Zip')] || '',
            dealType: values[headers.indexOf('Deal Type')] || 'Buyer',
            stage: values[headers.indexOf('Stage')] || 'Lead',
            listDate: values[headers.indexOf('List Date')] || '',
            mutualAcceptanceDate: values[headers.indexOf('Mutual Acceptance Date')] || '',
            expirationDate: values[headers.indexOf('Expiration Date')] || '',
            closeDate: values[headers.indexOf('Close Date')] || '',
            salePrice: values[headers.indexOf('Sale Price')] || '',
            commissionPct: values[headers.indexOf('Commission %')] || '',
            gci: values[headers.indexOf('GCI')] || '',
            costOfSale: [],
            leadSource: values[headers.indexOf('Lead Source')] || '',
            clientReferral: values[headers.indexOf('Client Referral')] || '',
            agentReferral: values[headers.indexOf('Agent Referral')] || '',
            lender: values[headers.indexOf('Lender')] || '',
            titleCompany: values[headers.indexOf('Title Company')] || '',
            titleEscrow: values[headers.indexOf('Title/Escrow')] || '',
            assignedAgent: values[headers.indexOf('Assigned Agent')] || '',
            coAgent: values[headers.indexOf('Co-Agent')] || '',
            notes: values[headers.indexOf('Notes')] || ''
          };
          newDeals.push(deal);
        }

        const updated = [...deals, ...newDeals];
        savePipeline(updated);
        alert(`Successfully imported ${newDeals.length} deals`);
      } catch (err) {
        alert('Error parsing CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const exportCSV = () => {
    const headers = ['Client Name', 'Address', 'City', 'State', 'Zip', 'Deal Type', 'Stage', 'List Date', 'Mutual Acceptance Date', 'Expiration Date', 'Close Date', 'Sale Price', 'Commission %', 'GCI', 'Cost of Sale', 'Lead Source', 'Client Referral', 'Agent Referral', 'Lender', 'Title Company', 'Title/Escrow', 'Assigned Agent', 'Co-Agent', 'Notes'];
    const rows = deals.map(d => [
      d.clientName, d.address, d.city, d.state, d.zip, d.dealType, d.stage, d.listDate, d.mutualAcceptanceDate, d.expirationDate, d.closeDate,
      d.salePrice, d.commissionPct, d.gci,
      Array.isArray(d.costOfSale) ? d.costOfSale.map(c => `${c.label}: ${c.amount}`).join('; ') : d.costOfSale,
      d.leadSource, d.clientReferral, d.agentReferral, d.lender, d.titleCompany, d.titleEscrow, d.assignedAgent, d.coAgent, d.notes
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pipeline-container">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImportCSV}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="pipeline-header">
        <div className="header-left">
          <h1>Pipeline & Transactions</h1>
          <p className="header-description">Track every deal from first contact to the closing table. Your numbers tell the real story.</p>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={exportCSV}>Export CSV</button>
          <button className="btn-primary" onClick={handleOpenForm}>+ New Deal</button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>Import CSV</button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <span>VIEW:</span>
        <div className="toggle-buttons">
          {['All Time', 'Year', 'Quarter', 'Month'].map(period => (
            <button
              key={period}
              className={`toggle-btn ${viewPeriod === period ? 'active' : ''}`}
              onClick={() => setViewPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row 1 - Dark Cards */}
      <div className="stats-row-1">
        <div className="stat-card dark">
          <div className="stat-label">PIPELINE</div>
          <div className="stat-value">{stats.pipeline}</div>
        </div>
        <div className="stat-card dark">
          <div className="stat-label">PENDING</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card dark">
          <div className="stat-label">PENDING GCI</div>
          <div className="stat-value">{formatCurrency(stats.pendingGci)}</div>
        </div>
        <div className="stat-card dark">
          <div className="stat-label">CLOSED UNITS</div>
          <div className="stat-value">{stats.closedUnits}</div>
        </div>
        <div className="stat-card dark">
          <div className="stat-label">CLOSED GCI</div>
          <div className="stat-value">{formatCurrency(stats.closedGci)}</div>
        </div>
      </div>

      {/* Stats Row 2 */}
      <div className="stats-row-2">
        <div className="stat-card beige">
          <div className="stat-label">Total Sales Volume</div>
          <div className="stat-value">{formatCurrency(stats.totalVolume)}</div>
        </div>
        <div className="stat-card white">
          <div className="stat-label">Avg GCI Per Deal</div>
          <div className="stat-value">{formatCurrency(stats.avgGci)}</div>
        </div>
        <div className="stat-card white">
          <div className="stat-label">Deal Type Split</div>
          <div className="stat-value split-display">
            <span>{stats.buyerCount}B</span>
            <span>/</span>
            <span>{stats.sellerCount}S</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>All Stages</label>
          <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
            <option value="All Stages">All Stages</option>
            {STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>All Types</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All Types">All Types</option>
            {DEAL_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <button
            className={`toggle-filter ${hideClosed ? 'active' : ''}`}
            onClick={() => setHideClosed(!hideClosed)}
          >
            Hide Closed
          </button>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Newest First">Newest First</option>
            <option value="Oldest First">Oldest First</option>
            <option value="Price High to Low">Price High to Low</option>
            <option value="Price Low to High">Price Low to High</option>
          </select>
        </div>

        <div className="deal-count">
          {filteredDeals.length} deals
        </div>
      </div>

      {/* Deals by Stage */}
      <div className="deals-container">
        {STAGES.map(stage => {
          const stageDeals = dealsByStage[stage];
          if (stageDeals.length === 0 && filterStage !== 'All Stages' && filterStage !== stage) return null;
          if (hideClosed && (stage === 'Closed' || stage === 'Fell Through' || stage === 'Lost')) return null;

          return (
            <div key={stage} className="stage-group">
              <div className="stage-header">
                {stage} ({stageDeals.length})
              </div>
              {stageDeals.length === 0 ? (
                <div className="empty-stage">No deals in this stage</div>
              ) : (
                <div className="deals-list">
                  {stageDeals.map(deal => (
                    <div key={deal.id} className="deal-row">
                      <div className="deal-header-row">
                        <div className="deal-left">
                          <span className="deal-dot"></span>
                          <span className="deal-name">{deal.clientName}</span>
                        </div>
                        <div className="deal-right">
                          <span
                            className="badge"
                            style={{
                              backgroundColor: stageColors[deal.stage]?.bg,
                              color: stageColors[deal.stage]?.text
                            }}
                          >
                            {deal.stage}
                          </span>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: typeColors[deal.dealType]?.bg,
                              color: typeColors[deal.dealType]?.text
                            }}
                          >
                            {deal.dealType}
                          </span>
                          <button
                            className="expand-btn"
                            onClick={() => toggleDealExpand(deal.id)}
                          >
                            {expandedDeals.has(deal.id) ? '^' : 'v'}
                          </button>
                        </div>
                      </div>

                      {expandedDeals.has(deal.id) && (
                        <div className="deal-details-inline">
                          <div className="detail-row">
                            <span className="detail-label">Address:</span>
                            <span>{deal.address}, {deal.city}, {deal.state} {deal.zip}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Sale Price:</span>
                            <span>{formatCurrency(deal.salePrice)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">GCI:</span>
                            <span>{formatCurrency(deal.gci)}</span>
                          </div>
                          {deal.listDate && (
                            <div className="detail-row">
                              <span className="detail-label">List Date:</span>
                              <span>{deal.listDate}</span>
                            </div>
                          )}
                          {deal.mutualAcceptanceDate && (
                            <div className="detail-row">
                              <span className="detail-label">Mutual Acceptance Date:</span>
                              <span>{deal.mutualAcceptanceDate}</span>
                            </div>
                          )}
                          {deal.expirationDate && (
                            <div className="detail-row">
                              <span className="detail-label">Expiration Date:</span>
                              <span>{deal.expirationDate}</span>
                            </div>
                          )}
                          {deal.closeDate && (
                            <div className="detail-row">
                              <span className="detail-label">Close Date:</span>
                              <span>{deal.closeDate}</span>
                            </div>
                          )}
                          <div className="deal-actions-inline">
                            <button className="btn-small" onClick={() => {
                              setEditingDeal(deal.id);
                              setFormData({ ...deal });
                              setShowForm(true);
                              toggleDealExpand(deal.id);
                            }}>Edit</button>
                            <button className="btn-small danger" onClick={() => handleDeleteDeal(deal.id)}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDeal ? 'Edit Deal' : 'New Deal'}</h2>
              <button className="btn-close" onClick={handleCloseForm}>X</button>
            </div>

            <div className="form-scroll">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Client Name *</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => handleFormChange('clientName', e.target.value)}
                      placeholder="Client name"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Property Address</h3>
                <div className="form-row">
                  <div className="form-group full">
                    <label>Property Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="Address"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleFormChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleFormChange('state', e.target.value)}
                      placeholder="State"
                      maxLength="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Zip</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => handleFormChange('zip', e.target.value)}
                      placeholder="Zip"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Deal Type</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Deal Type</label>
                    <select
                      value={formData.dealType}
                      onChange={(e) => handleFormChange('dealType', e.target.value)}
                    >
                      {DEAL_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Stage</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Stage</label>
                    <select
                      value={formData.stage}
                      onChange={(e) => handleFormChange('stage', e.target.value)}
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Dates</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>List Date</label>
                    <input
                      type="date"
                      value={formData.listDate}
                      onChange={(e) => handleFormChange('listDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mutual Acceptance Date</label>
                    <input
                      type="date"
                      value={formData.mutualAcceptanceDate}
                      onChange={(e) => handleFormChange('mutualAcceptanceDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiration Date</label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => handleFormChange('expirationDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Close Date</label>
                    <input
                      type="date"
                      value={formData.closeDate}
                      onChange={(e) => handleFormChange('closeDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Financial</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Sale Price</label>
                    <input
                      type="text"
                      value={formData.salePrice}
                      onChange={(e) => handleFormChange('salePrice', e.target.value)}
                      placeholder="$0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Commission %</label>
                    <input
                      type="text"
                      value={formData.commissionPct}
                      onChange={(e) => handleFormChange('commissionPct', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>GCI</label>
                    <input
                      type="text"
                      value={formData.gci}
                      disabled
                      placeholder="Auto-calculated"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4 style={{ marginBottom: '12px' }}>Cost of Sale</h4>
                  {Array.isArray(formData.costOfSale) && formData.costOfSale.map((cost, index) => (
                    <div key={index} className="cost-item">
                      <input
                        type="text"
                        placeholder="Label (e.g., Closing Costs)"
                        value={cost.label}
                        onChange={(e) => handleCostOfSaleChange(index, 'label', e.target.value)}
                        className="cost-label"
                      />
                      <input
                        type="text"
                        placeholder="Amount"
                        value={cost.amount}
                        onChange={(e) => handleCostOfSaleChange(index, 'amount', e.target.value)}
                        className="cost-amount"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCostOfSale(index)}
                        className="btn-remove-cost"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddCostOfSale}
                    className="btn-add-cost"
                  >
                    + Add Cost
                  </button>
                </div>
              </div>

              <div className="form-section">
                <h3>Lead Source</h3>
                <div className="form-row">
                  <div className="form-group full">
                    <label>Lead Source</label>
                    <select
                      value={formData.leadSource}
                      onChange={(e) => handleFormChange('leadSource', e.target.value)}
                    >
                      <option value="">Select lead source</option>
                      {leadSources.map((source, idx) => (
                        <option key={`${source}-${idx}`} value={source}>{source}</option>
                      ))}
                      <option value="Other / Add New">Other / Add New</option>
                    </select>
                  </div>
                </div>
                {showNewLeadSourceInput && (
                  <div className="form-row">
                    <div className="form-group full">
                      <label>New Lead Source</label>
                      <input
                        type="text"
                        value={newLeadSource}
                        onChange={(e) => setNewLeadSource(e.target.value)}
                        placeholder="Enter new lead source"
                      />
                    </div>
                  </div>
                )}
              </div>

              {(formData.leadSource === 'Client Referral' || formData.leadSource === 'Past Client') && (
                <div className="form-section">
                  <h3>Client Referral</h3>
                  <div className="form-row">
                    <div className="form-group full">
                      <label>Select Client</label>
                      <select
                        value={formData.clientReferral || ''}
                        onChange={(e) => handleFormChange('clientReferral', e.target.value)}
                      >
                        <option value="">Select a client</option>
                        {clientsList.map((client, idx) => {
                          const cName = client?.name || client?.clientName || '';
                          return cName ? (
                            <option key={`${cName}-${idx}`} value={cName}>{cName}</option>
                          ) : null;
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {formData.leadSource === 'Agent Referral' && (
                <div className="form-section">
                  <h3>Agent Referral</h3>
                  <div className="form-row">
                    <div className="form-group full">
                      <label>Select Agent</label>
                      <select
                        value={formData.agentReferral || ''}
                        onChange={(e) => handleFormChange('agentReferral', e.target.value)}
                      >
                        <option value="">Select an agent</option>
                        {agentsList.map((agent, idx) => {
                          const aName = typeof agent === 'string' ? agent : (agent?.name || agent?.agentName || '');
                          return aName ? (
                            <option key={`${aName}-${idx}`} value={aName}>{aName}</option>
                          ) : null;
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-section">
                <h3>Vendors</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Lender</label>
                    <select
                      value={formData.lender || ''}
                      onChange={(e) => handleFormChange('lender', e.target.value)}
                    >
                      <option value="">Select lender...</option>
                      {lendersList.map((lender, idx) => {
                        const lName = typeof lender === 'string' ? lender : (lender?.name || lender?.companyName || '');
                        return lName ? (
                          <option key={`${lName}-${idx}`} value={lName}>{lName}</option>
                        ) : null;
                      })}
                      <option value="__ADD_NEW__">+ Add Lender</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Title Company</label>
                    <select
                      value={formData.titleCompany || ''}
                      onChange={(e) => handleFormChange('titleCompany', e.target.value)}
                    >
                      <option value="">Select title company...</option>
                      {titleCompaniesList.map((company, idx) => {
                        const tName = typeof company === 'string' ? company : (company?.name || company?.companyName || '');
                        return tName ? (
                          <option key={`${tName}-${idx}`} value={tName}>{tName}</option>
                        ) : null;
                      })}
                      <option value="__ADD_NEW__">+ Add Title Company</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full">
                    <label>Title / Escrow</label>
                    <input
                      type="text"
                      value={formData.titleEscrow || ''}
                      onChange={(e) => handleFormChange('titleEscrow', e.target.value)}
                      placeholder="Additional title/escrow notes"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Team</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Assigned Agent</label>
                    <select
                      value={formData.assignedAgent || ''}
                      onChange={(e) => handleFormChange('assignedAgent', e.target.value)}
                    >
                      <option value="">Select agent...</option>
                      {teamMembers.map((member, idx) => {
                        const mName = typeof member === 'string' ? member : (member?.name || '');
                        return mName ? (
                          <option key={`${mName}-${idx}`} value={mName}>{mName}</option>
                        ) : null;
                      })}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Co-Agent</label>
                    <input
                      type="text"
                      value={formData.coAgent || ''}
                      onChange={(e) => handleFormChange('coAgent', e.target.value)}
                      placeholder="Co-agent name"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Notes</h3>
                <div className="form-row">
                  <div className="form-group full">
                    <label>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Additional notes"
                      rows="4"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {editingDeal && (
                <button className="btn-danger" onClick={() => {
                  handleDeleteDeal(editingDeal);
                  handleCloseForm();
                }}>
                  Delete
                </button>
              )}
              <div className="footer-right">
                <button className="btn-secondary" onClick={handleCloseForm}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveDeal}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pipeline;
