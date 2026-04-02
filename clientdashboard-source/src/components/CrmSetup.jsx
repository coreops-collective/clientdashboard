import React, { useState, useCallback, useMemo } from 'react';
import { DRIP_CAMPAIGNS, applyMergeTags, CRM_MERGE_TAGS } from '../data/dripCampaigns';

const CrmSetup = ({ hubData, onSave }) => {
  const [activeTab, setActiveTab] = useState('routing');
  const [expandedCampaigns, setExpandedCampaigns] = useState({});
  const [expandedTouchpoints, setExpandedTouchpoints] = useState({});
  const [saveTimeout, setSaveTimeout] = useState(null);

  const crmData = useMemo(() => {
    return hubData?.allData?.['crm-setup'] || {
      leadIntake: { checklist: [] },
      selectedCrm: 'brivity',
      generatedTemplates: {},
      responseTimeStandards: [],
      leadRoutingRules: [],
      stageProgressionRules: [
        { from: 'COLD', to: 'NURTURE', trigger: 'Engages with content (opens emails, clicks links, responds to a text)' },
        { from: 'NURTURE', to: 'WATCH', trigger: 'Starts asking questions, gives timeline indicators, mentions life changes' },
        { from: 'WATCH', to: 'HOT', trigger: 'Actively looking, got pre-approved, ready to list, or gave a firm timeline' },
        { from: 'HOT', to: 'PIPELINE', trigger: 'Consultation scheduled or completed, moved to Pipeline tab as a deal' },
        { from: 'ANY', to: 'COLD', trigger: 'No engagement for 60+ days, doesn\'t respond to calls/texts/emails' }
      ],
      includeTexts: true
    };
  }, [hubData]);

  const teamMembers = hubData?.teamMembers || hubData?._meta?.teamMembers || [];

  const saveData = useCallback((updates) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    const updated = { ...crmData, ...updates };
    const timeoutId = setTimeout(() => {
      onSave({
        allData: { ...hubData?.allData, 'crm-setup': updated },
        _meta: { crmSetup: updated }
      });
    }, 1100);
    setSaveTimeout(timeoutId);
  }, [crmData, hubData, onSave, saveTimeout]);

  const temperatureCards = [
    { temp: 'HOT', color: '#e74c3c', bg: '#e74c3c', description: 'Ready within 90 days' },
    { temp: 'WATCH', color: '#f39c12', bg: '#f39c12', description: 'Ready in 3-6 months' },
    { temp: 'NURTURE', color: '#1abc9c', bg: '#1abc9c', description: 'Ready in 6-12 months' },
    { temp: 'COLD', color: '#2c3e50', bg: '#2c3e50', description: '12+ months / passive' }
  ];

  const crmOptions = [
    { id: 'generic', name: 'Generic' },
    { id: 'fub', name: 'Follow Up Boss' },
    { id: 'boldtrail', name: 'BoldTrail' },
    { id: 'sierra', name: 'Sierra Interactive' },
    { id: 'lofty', name: 'Lofty' },
    { id: 'brivity', name: 'Brivity' },
    { id: 'gohighlevel', name: 'GoHighLevel' },
    { id: 'other', name: 'Other (Custom)' }
  ];

  // Use imported CRM_MERGE_TAGS from dripCampaigns.js (single source of truth)
  const crmMergeTags = CRM_MERGE_TAGS;

  const campaigns = [
    { id: 'welcome-10day', name: '10-Day Welcome Sequence', duration: '10 days' },
    { id: 'buyer-hot', name: 'Buyer Hot Lead Campaign (0-90 Days)', duration: '12 weeks / 90 days' },
    { id: 'seller-hot', name: 'Seller Hot Lead Campaign (0-90 Days)', duration: '12 weeks / 90 days' },
    { id: 'buyer-watch', name: 'Buyer Watch Campaign (3-6 Months)', duration: '26 weeks / 6 months' },
    { id: 'seller-watch', name: 'Seller Watch Campaign (3-6 Months)', duration: '26 weeks / 6 months' },
    { id: 'buyer-nurture', name: 'Buyer Nurture Campaign (6+ Months)', duration: '12 months' },
    { id: 'seller-nurture', name: 'Seller Nurture Campaign (6+ Months)', duration: '12 months' },
    { id: 'cold-drip', name: 'Cold Lead Campaign - All Leads', duration: '12 months' },
    { id: 'guide-buyer', name: 'Buyer Guide Delivery Email', duration: 'Trigger-based' },
    { id: 'guide-seller', name: 'Seller Guide Delivery Email', duration: 'Trigger-based' }
  ];

  // Pull real touchpoints from imported drip campaign data
  const getCampaignTouchpoints = (campaignId) => {
    const campaign = DRIP_CAMPAIGNS[campaignId];
    if (!campaign) return [];
    return campaign?.touchpoints || [];
  };

  const leadIntakeDefaults = [
    { id: 'ic1', task: 'Lead info captured in CRM (name, phone, email, property address)', owner: 'Admin' },
    { id: 'ic2', task: 'Lead assigned to appropriate agent or team', owner: 'Admin' },
    { id: 'ic3', task: 'Lead temperature assigned (HOT, WATCH, NURTURE, COLD)', owner: 'Assigned Agent' },
    { id: 'ic4', task: 'First contact made within response time standard', owner: 'Assigned Agent' },
    { id: 'ic5', task: 'Initial qualification completed', owner: 'Assigned Agent' },
    { id: 'ic6', task: 'Drip campaign started in CRM', owner: 'Admin' },
    { id: 'ic7', task: 'Buyer/Seller intent determined', owner: 'Assigned Agent' },
    { id: 'ic8', task: 'Next step scheduled or drip sequence confirmed', owner: 'Assigned Agent' },
    { id: 'ic9', task: 'Lead notes and interaction history logged', owner: 'Assigned Agent' }
  ];

  const currentChecklist = crmData.leadIntake?.checklist?.length > 0
    ? crmData.leadIntake.checklist
    : leadIntakeDefaults;

  const buildCrmAutomationsTable = () => {
    const automations = [];
    if (hubData?.allData) {
      Object.entries(hubData.allData).forEach(([key, workflowData]) => {
        if (workflowData?.nodes && Array.isArray(workflowData.nodes)) {
          workflowData.nodes.forEach(node => {
            if (node.ownerType === 'automated' || (node.system && node.system.toLowerCase().includes('crm'))) {
              const trigger = node.trigger || node.type || 'Unknown';
              const action = node.action || node.name || 'Action';
              const system = node.system || 'CRM';
              automations.push({ workflow: key, trigger, action, system });
            }
          });
        }
      });
    }
    return automations;
  };

  // TAB 1: Lead Intake & Routing
  const renderRoutingTab = () => {
    const leadFlowSteps = [
      {
        icon: (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 4V28M20 28L14 22M20 28L26 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#7c5ace',
        label: 'Lead Comes In',
        subtitle: 'Any source'
      },
      {
        icon: (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2"/>
            <circle cx="28" cy="12" r="5" stroke="white" strokeWidth="2"/>
            <path d="M8 20C8 20 10 24 12 26M32 20C32 20 30 24 28 26M12 26C10 28 8 30 8 32M28 26C30 28 32 30 32 32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ),
        color: '#e07856',
        label: 'Route to Owner',
        subtitle: 'Assign immediately'
      },
      {
        icon: (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M18 8C18 8 12 12 12 18C12 24 18 32 18 32C18 32 24 24 24 18C24 12 18 8 18 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="18" cy="18" r="3" fill="white"/>
          </svg>
        ),
        color: '#d4a017',
        label: 'First Contact',
        subtitle: 'Speed to lead'
      },
      {
        icon: (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="12" stroke="white" strokeWidth="2"/>
            <circle cx="20" cy="20" r="6" stroke="white" strokeWidth="2"/>
            <circle cx="20" cy="20" r="2" fill="white"/>
          </svg>
        ),
        color: '#1abc9c',
        label: 'Qualify & Assign Temp',
        subtitle: 'HOT/WATCH/NURTURE/COLD'
      },
      {
        icon: (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 8C14 8 10 12 10 18C10 26 20 34 20 34C20 34 30 26 30 18C30 12 26 8 20 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 20L19 23L25 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#27ae60',
        label: 'Drip Sequence',
        subtitle: 'Automated follow-up'
      },
      {
        icon: (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M10 20L18 28L32 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#229954',
        label: 'Convert or Nurture',
        subtitle: 'Pipeline or keep warming'
      }
    ];

    return (
      <div style={{ padding: '24px' }}>
        {/* Flow Diagram */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>How a Lead Moves Through Your Business</h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Track the journey of each lead through your business pipeline</p>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            overflowX: 'auto',
            backgroundColor: '#fafaf8',
            borderRadius: '12px',
            border: '1px solid #f0ede7',
            padding: '40px 24px',
            gap: '24px'
          }}>
            {leadFlowSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${step.color}40`,
                    marginBottom: '16px',
                    flexShrink: 0
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '100px' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1a1a1a',
                      marginBottom: '4px'
                    }}>
                      {step.label}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      lineHeight: '1.4'
                    }}>
                      {step.subtitle}
                    </div>
                  </div>
                </div>
                {idx < 5 && (
                  <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '40px', fontSize: '20px', color: '#ccc' }}>
                    →
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

      {/* Temperature Cards */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>Lead Temperature Framework</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Classify leads based on their buying timeline and engagement level</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {temperatureCards.map(card => (
            <div
              key={card.temp}
              style={{
                backgroundColor: card.bg,
                borderRadius: '12px',
                padding: '28px 16px',
                textAlign: 'center',
                boxShadow: `0 4px 12px ${card.bg}40`,
                transition: 'all 0.2s ease',
                cursor: 'default'
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '12px', letterSpacing: '0.5px' }}>
                {card.temp}
              </div>
              <div style={{ fontSize: '13px', color: 'white', lineHeight: '1.5', opacity: 0.95 }}>
                {card.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Time Standards */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Response Time Standards</h3>
          <button
            onClick={() => {
              const newStandard = {
                id: `rts-${Date.now()}`,
                source: '',
                responseTime: '',
                contactMethod: 'phone',
                assignedTo: '',
                notes: ''
              };
              saveData({
                responseTimeStandards: [...(crmData.responseTimeStandards || []), newStandard]
              });
            }}
            style={{
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            + Add Standard
          </button>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f0ede7', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#faf8f4', borderBottom: '1.5px solid #e5e2db' }}>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Lead Source</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Response Time</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Contact Method</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Assigned To</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Notes/Script</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}></th>
              </tr>
            </thead>
            <tbody>
              {(crmData.responseTimeStandards || []).map(std => (
                <tr key={std.id} style={{ borderBottom: '1px solid #f0ede7' }}>
                <td style={{ padding: '14px' }}>
                  <input
                    type="text"
                    value={std.source}
                    onChange={(e) => {
                      const updated = (crmData.responseTimeStandards || []).map(s =>
                        s.id === std.id ? { ...s, source: e.target.value } : s
                      );
                      saveData({ responseTimeStandards: updated });
                    }}
                    placeholder="e.g., Website, Phone, Referral"
                    style={{
                      width: '100%',
                      border: '1px solid #d9d4cb',
                      borderRadius: '6px',
                      padding: '9px 11px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </td>
                <td style={{ padding: '14px' }}>
                  <input
                    type="text"
                    value={std.responseTime}
                    onChange={(e) => {
                      const updated = (crmData.responseTimeStandards || []).map(s =>
                        s.id === std.id ? { ...s, responseTime: e.target.value } : s
                      );
                      saveData({ responseTimeStandards: updated });
                    }}
                    placeholder="e.g., 15 minutes"
                    style={{
                      width: '100%',
                      border: '1px solid #d9d4cb',
                      borderRadius: '6px',
                      padding: '9px 11px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </td>
                <td style={{ padding: '14px' }}>
                  <select
                    value={std.contactMethod}
                    onChange={(e) => {
                      const updated = (crmData.responseTimeStandards || []).map(s =>
                        s.id === std.id ? { ...s, contactMethod: e.target.value } : s
                      );
                      saveData({ responseTimeStandards: updated });
                    }}
                    style={{
                      width: '100%',
                      border: '1px solid #d9d4cb',
                      borderRadius: '6px',
                      padding: '9px 11px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="text">Text</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </td>
                <td style={{ padding: '14px' }}>
                  <select
                    value={std.assignedTo}
                    onChange={(e) => {
                      const updated = (crmData.responseTimeStandards || []).map(s =>
                        s.id === std.id ? { ...s, assignedTo: e.target.value } : s
                      );
                      saveData({ responseTimeStandards: updated });
                    }}
                    style={{
                      width: '100%',
                      border: '1px solid #d9d4cb',
                      borderRadius: '6px',
                      padding: '9px 11px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(member => (
                      <option key={member.name} value={member.name}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '14px' }}>
                  <input
                    type="text"
                    value={std.notes}
                    onChange={(e) => {
                      const updated = (crmData.responseTimeStandards || []).map(s =>
                        s.id === std.id ? { ...s, notes: e.target.value } : s
                      );
                      saveData({ responseTimeStandards: updated });
                    }}
                    placeholder="Optional notes"
                    style={{
                      width: '100%',
                      border: '1px solid #d9d4cb',
                      borderRadius: '6px',
                      padding: '9px 11px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </td>
                <td style={{ padding: '14px' }}>
                  <button
                    onClick={() => {
                      const updated = (crmData.responseTimeStandards || []).filter(s => s.id !== std.id);
                      saveData({ responseTimeStandards: updated });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c0392b',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#a93226'}
                    onMouseLeave={(e) => e.target.style.color = '#c0392b'}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {/* Lead Routing Rules */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Lead Routing Rules</h3>
          <button
            onClick={() => {
              const newRule = {
                id: `lrr-${Date.now()}`,
                leadType: '',
                assignedTo: '',
                firstAction: '',
                startingTemp: 'NURTURE'
              };
              saveData({
                leadRoutingRules: [...(crmData.leadRoutingRules || []), newRule]
              });
            }}
            style={{
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            + Add Rule
          </button>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f0ede7', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#faf8f4', borderBottom: '1.5px solid #e5e2db' }}>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Lead Type</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Assigned To</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>First Action</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Starting Temp</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}></th>
              </tr>
            </thead>
          <tbody>
            {(crmData.leadRoutingRules || []).map(rule => (
              <tr key={rule.id} style={{ borderBottom: '1px solid #f0ede7' }}>
                <td style={{ padding: '14px' }}>
                  <input
                    type="text"
                    value={rule.leadType}
                    onChange={(e) => {
                      const updated = (crmData.leadRoutingRules || []).map(r =>
                        r.id === rule.id ? { ...r, leadType: e.target.value } : r
                      );
                      saveData({ leadRoutingRules: updated });
                    }}
                    placeholder="e.g., Buyer, Seller, Investor"
                    style={{
                      width: '100%',
                      border: '1px solid #d9d4cb',
                      borderRadius: '6px',
                      padding: '9px 11px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </td>
                <td style={{ padding: '14px' }}>
                  <select
                    value={rule.assignedTo}
                    onChange={(e) => {
                      const updated = (crmData.leadRoutingRules || []).map(r =>
                        r.id === rule.id ? { ...r, assignedTo: e.target.value } : r
                      );
                      saveData({ leadRoutingRules: updated });
                    }}
                    style={{
                      width: '100%',
                      border: '1px solid #d9d4cb',
                      borderRadius: '6px',
                      padding: '9px 11px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(member => (
                      <option key={member.name} value={member.name}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '14px' }}>
                  <input
                    type="text"
                    value={rule.firstAction}
                    onChange={(e) => {
                      const updated = (crmData.leadRoutingRules || []).map(r =>
                        r.id === rule.id ? { ...r, firstAction: e.target.value } : r
                      );
                      saveData({ leadRoutingRules: updated });
                    }}
                    placeholder="e.g., Call within 1 hour"
                    style={{
                      width: '100%',
                      border: '1px solid #d9d4cb',
                      borderRadius: '6px',
                      padding: '9px 11px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </td>
                <td style={{ padding: '14px' }}>
                  <select
                    value={rule.startingTemp}
                    onChange={(e) => {
                      const updated = (crmData.leadRoutingRules || []).map(r =>
                        r.id === rule.id ? { ...r, startingTemp: e.target.value } : r
                      );
                      saveData({ leadRoutingRules: updated });
                    }}
                    style={{
                      width: '100%',
                      border: '1px solid #d9d4cb',
                      borderRadius: '6px',
                      padding: '9px 11px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <option value="HOT">HOT</option>
                    <option value="WATCH">WATCH</option>
                    <option value="NURTURE">NURTURE</option>
                    <option value="COLD">COLD</option>
                  </select>
                </td>
                <td style={{ padding: '14px' }}>
                  <button
                    onClick={() => {
                      const updated = (crmData.leadRoutingRules || []).filter(r => r.id !== rule.id);
                      saveData({ leadRoutingRules: updated });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c0392b',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#a93226'}
                    onMouseLeave={(e) => e.target.style.color = '#c0392b'}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {/* Stage Progression Rules */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '18px' }}>Stage Progression Rules</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {crmData.stageProgressionRules?.map((rule, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: 'white',
                border: '1px solid #f0ede7',
                borderRadius: '10px'
              }}
            >
              <div style={{
                backgroundColor: '#1a1a1a',
                color: 'white',
                padding: '6px 11px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                minWidth: 'fit-content'
              }}>
                {rule.from}
              </div>
              <div style={{ fontSize: '16px', color: '#d9d4cb' }}>→</div>
              <div style={{
                backgroundColor: '#1a1a1a',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                minWidth: 'fit-content'
              }}>
                {rule.to}
              </div>
              <div style={{ fontSize: '12px', color: '#1a1a1a', flex: 1 }}>
                {rule.trigger}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Intake Checklist */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Lead Intake Checklist</h3>
          <button
            onClick={() => {
              const newItem = {
                id: `ic-${Date.now()}`,
                task: '',
                owner: 'Admin'
              };
              saveData({
                leadIntake: { ...crmData.leadIntake, checklist: [...currentChecklist, newItem] }
              });
            }}
            style={{
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Add Item
          </button>
        </div>
        <ol style={{ paddingLeft: '20px' }}>
          {currentChecklist.map((item, idx) => (
            <li
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
                padding: '12px',
                backgroundColor: '#faf8f4',
                borderRadius: '6px',
                listStyle: 'none',
                paddingLeft: '12px'
              }}
            >
              <span style={{ fontSize: '14px', color: '#1a1a1a', flex: 1 }}>
                {idx + 1}. {item.task}
              </span>
              <select
                value={item.owner}
                onChange={(e) => {
                  const updated = currentChecklist.map(i =>
                    i.id === item.id ? { ...i, owner: e.target.value } : i
                  );
                  saveData({
                    leadIntake: { ...crmData.leadIntake, checklist: updated }
                  });
                }}
                style={{
                  border: '2px solid #e8e8e8',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  minWidth: '140px'
                }}
              >
                <option value="Admin">Admin</option>
                <option value="Assigned Agent">Assigned Agent</option>
                {teamMembers.map(member => (
                  <option key={member.name} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const updated = currentChecklist.filter(i => i.id !== item.id);
                  saveData({
                    leadIntake: { ...crmData.leadIntake, checklist: updated }
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c0392b',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
    );
  };

  // TAB 2: CRM & Drip Campaigns
  const renderDripTab = () => (
    <div style={{ padding: '24px' }}>
      {/* Temperature Cards */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>Lead Temperature Framework</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Classify leads based on their buying timeline and engagement level</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {temperatureCards.map(card => (
            <div
              key={card.temp}
              style={{
                backgroundColor: card.bg,
                borderRadius: '12px',
                padding: '28px 16px',
                textAlign: 'center',
                boxShadow: `0 4px 12px ${card.bg}40`,
                transition: 'all 0.2s ease',
                cursor: 'default'
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '12px', letterSpacing: '0.5px' }}>
                {card.temp}
              </div>
              <div style={{ fontSize: '13px', color: 'white', lineHeight: '1.5', opacity: 0.95 }}>
                {card.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your CRM Platform */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '18px' }}>Your CRM Platform</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {crmOptions.map(option => (
            <button
              key={option.id}
              onClick={() => saveData({ selectedCrm: option.id })}
              style={{
                padding: '12px 14px',
                border: crmData.selectedCrm === option.id ? '1.5px solid #1a1a1a' : '1.5px solid #d9d4cb',
                backgroundColor: crmData.selectedCrm === option.id ? '#1a1a1a' : 'white',
                color: crmData.selectedCrm === option.id ? 'white' : '#1a1a1a',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: crmData.selectedCrm === option.id ? '0 2px 8px rgba(26, 26, 26, 0.15)' : 'none'
              }}
            >
              {option.name}
            </button>
          ))}
        </div>

        {/* Merge Tags Reference */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #f0ede7',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '14px' }}>Merge Tags Reference (with Purpose)</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {Object.entries(crmMergeTags[crmData.selectedCrm] || crmMergeTags.generic).map(([purpose, tag]) => (
              <div
                key={purpose}
                style={{
                  backgroundColor: '#faf8f4',
                  border: '1px solid #e5e2db',
                  borderRadius: '6px',
                  padding: '9px 13px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#1a1a1a'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#7f8c8d', marginBottom: '3px' }}>
                  {purpose.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div style={{ fontSize: '11px' }}>{tag}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Automation Setup Instructions */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #f0ede7',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>Automation Setup Instructions</h4>
          <p style={{ fontSize: '13px', color: '#1a1a1a', lineHeight: '1.6', margin: '0' }}>
            Use the merge tags above in your {crmOptions.find(o => o.id === crmData.selectedCrm)?.name || 'CRM'} automation sequences to personalize messages. Set up triggers based on the stage progression rules to automatically move leads through your temperature stages and drip campaigns.
          </p>
        </div>
      </div>

      {/* Brand Voice Detection */}
      {hubData?.allData?.['brand-voice']?.descriptorWords && (
        <div style={{
          backgroundColor: '#faf8f4',
          border: '1px solid #e5e2db',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '40px'
        }}>
          <div style={{ fontSize: '13px', color: '#1a1a1a' }}>
            <strong>Brand Voice data detected</strong> - Voice: {hubData.allData['brand-voice'].descriptorWords.join(', ')}
          </div>
        </div>
      )}

      {/* Drip Campaign Sequences */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '18px' }}>Drip Campaign Sequences</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              style={{
                border: '1px solid #f0ede7',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: 'white',
                transition: 'all 0.2s ease'
              }}
            >
              <button
                onClick={() => {
                  setExpandedCampaigns(prev => ({
                    ...prev,
                    [campaign.id]: !prev[campaign.id]
                  }));
                }}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  backgroundColor: expandedCampaigns[campaign.id] ? '#faf8f4' : 'white',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  borderBottom: expandedCampaigns[campaign.id] ? '1px solid #f0ede7' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>{campaign.name}</span>
                  <span style={{
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    padding: '5px 9px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {getCampaignTouchpoints(campaign.id).length} touchpoints
                  </span>
                  <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    ({campaign.duration})
                  </span>
                </div>
                <span style={{ fontSize: '18px', color: '#7f8c8d', transition: 'transform 0.2s' }}>
                  {expandedCampaigns[campaign.id] ? '−' : '+'}
                </span>
              </button>

              {expandedCampaigns[campaign.id] && (
                <div style={{ padding: '18px', backgroundColor: 'white' }}>
                  {/* Write Campaigns For Me Button */}
                  <div style={{ marginBottom: "18px" }}>
                    <button
                      onClick={() => {
                        // Placeholder for AI campaign writing functionality
                        alert("This feature will generate personalized campaign content based on your Brand Voice.");
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        backgroundColor: "#1a1a1a",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#333"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#1a1a1a"}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: "inline" }}>
                        <path d="M8 1L10.6 6.5H16.5L11.95 10.2L13.6 15.7L8 12L2.4 15.7L4.05 10.2L-0.5 6.5H5.4L8 1Z" fill="currentColor"/>
                      </svg>
                      Write Campaigns For Me
                    </button>
                    <div style={{ fontSize: "11px", color: "#7f8c8d", marginTop: "6px", textAlign: "center" }}>
                      Better results with Brand Voice filled out
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    {getCampaignTouchpoints(campaign.id).map((touchpoint, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: '12px',
                          padding: '14px',
                          backgroundColor: '#faf8f4',
                          borderRadius: '8px',
                          border: '1px solid #f0ede7'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
                              {touchpoint.day}: {applyMergeTags(touchpoint.subject, crmData.selectedCrm)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                              {touchpoint.type.charAt(0).toUpperCase() + touchpoint.type.slice(1)}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const touchpointId = `${campaign.id}-tp-${idx}`;
                              setExpandedTouchpoints(prev => ({
                                ...prev,
                                [touchpointId]: !prev[touchpointId]
                              }));
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#1a1a1a',
                              padding: '4px 8px',
                              transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#7f8c8d'}
                            onMouseLeave={(e) => e.target.style.color = '#1a1a1a'}
                          >
                            {expandedTouchpoints[`${campaign.id}-tp-${idx}`] ? 'Hide' : 'View'}
                          </button>
                        </div>
                        {expandedTouchpoints[`${campaign.id}-tp-${idx}`] && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e2db',
                            borderRadius: '6px',
                            padding: '12px',
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#1a1a1a',
                            lineHeight: '1.5',
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{applyMergeTags(touchpoint.body, crmData.selectedCrm)}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Include Texts Toggle */}
        <div style={{
          backgroundColor: '#faf8f4',
          border: '1px solid #e5e2db',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <input
            type="checkbox"
            checked={crmData.includeTexts}
            onChange={(e) => saveData({ includeTexts: e.target.checked })}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label style={{ fontSize: '13px', color: '#1a1a1a', cursor: 'pointer', flex: 1 }}>
            Include text messages (Uncheck if your CRM doesn't support automated texts)
          </label>
        </div>
      </div>
    </div>
  );

  // TAB 3: CRM Cheat Sheet
  const renderCheatSheetTab = () => {
    const automations = buildCrmAutomationsTable();

    return (
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '20px' }}>CRM Quick Reference</h3>

        {/* CRM Platform Info */}
        <div style={{
          backgroundColor: '#faf8f4',
          border: '1px solid #e5e2db',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>
            {crmOptions.find(o => o.id === crmData.selectedCrm)?.name || 'CRM Platform'}
          </h4>
          <p style={{ fontSize: '13px', color: '#7f8c8d', margin: '0 0 16px 0' }}>
            You are currently using {crmOptions.find(o => o.id === crmData.selectedCrm)?.name || 'Generic CRM'} as your CRM platform.
          </p>

          <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px', marginTop: '16px' }}>Common Merge Tags</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {Object.entries(crmMergeTags[crmData.selectedCrm] || crmMergeTags.generic).map(([purpose, tag]) => (
              <div
                key={purpose}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e2db',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#1a1a1a'
                }}
              >
                <span style={{ fontWeight: 600, marginRight: '4px' }}>
                  {purpose.charAt(0).toUpperCase() + purpose.slice(1)}:
                </span>
                {tag}
              </div>
            ))}
          </div>

          <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px', marginTop: '16px' }}>Setting Up Automations</h5>
          <ul style={{ fontSize: '13px', color: '#1a1a1a', lineHeight: '1.6', marginLeft: '20px', paddingLeft: '0', margin: '0' }}>
            <li style={{ marginBottom: '6px' }}>Create a workflow/automation rule for each temperature stage</li>
            <li style={{ marginBottom: '6px' }}>Set triggers based on lead behavior and engagement</li>
            <li style={{ marginBottom: '6px' }}>Use merge tags to personalize all messages</li>
            <li style={{ marginBottom: '6px' }}>Test each automation sequence before enabling</li>
            <li style={{ marginBottom: '6px' }}>Monitor response rates and engagement metrics</li>
            <li>Adjust triggers and sequences based on performance data</li>
          </ul>

          <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px', marginTop: '16px' }}>Best Practices</h5>
          <ul style={{ fontSize: '13px', color: '#1a1a1a', lineHeight: '1.6', marginLeft: '20px', paddingLeft: '0', margin: '0' }}>
            <li style={{ marginBottom: '6px' }}>Respond to leads within your defined response time standards</li>
            <li style={{ marginBottom: '6px' }}>Use the lead temperature to prioritize follow-up efforts</li>
            <li style={{ marginBottom: '6px' }}>Keep detailed notes on all lead interactions</li>
            <li style={{ marginBottom: '6px' }}>Regularly review and update stage progression triggers</li>
            <li>Track conversion rates from each temperature stage</li>
          </ul>
        </div>

        {/* CRM Automations */}
        <div style={{
          backgroundColor: '#faf8f4',
          border: '1px solid #e5e2db',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>Your CRM Automations</h4>
          {automations.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e2db' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: '#1a1a1a' }}>Workflow</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: '#1a1a1a' }}>Trigger/When</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: '#1a1a1a' }}>What Happens</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: '#1a1a1a' }}>System</th>
                </tr>
              </thead>
              <tbody>
                {automations.map((auto, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e2db' }}>
                    <td style={{ padding: '8px', color: '#1a1a1a' }}>{auto.workflow}</td>
                    <td style={{ padding: '8px', color: '#1a1a1a' }}>{auto.trigger}</td>
                    <td style={{ padding: '8px', color: '#1a1a1a' }}>{auto.action}</td>
                    <td style={{ padding: '8px', color: '#1a1a1a' }}>{auto.system}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: '13px', color: '#7f8c8d', margin: '0' }}>
              No CRM automations detected in your workflows yet. Set up workflows to automate your lead management and nurture sequences.
            </p>
          )}
        </div>

        {/* Drip Campaign Triggers */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #f0ede7',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '14px' }}>Drip Campaign Triggers by Temperature</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {crmData.stageProgressionRules?.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#faf8f4',
                  borderRadius: '8px',
                  border: '1px solid #e5e2db'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}>
                  {rule.from} to {rule.to}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d', lineHeight: '1.4' }}>
                  Trigger: {rule.trigger}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e2db',
        backgroundColor: '#faf8f4'
      }}>
        {[
          { id: 'routing', label: 'Lead Intake & Routing' },
          { id: 'drip', label: 'CRM & Drip Campaigns' },
          { id: 'cheatsheet', label: 'CRM Cheat Sheet' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: '#1a1a1a',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '3px solid #1a1a1a' : 'none',
              marginBottom: activeTab === tab.id ? '-2px' : '0'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'routing' && renderRoutingTab()}
      {activeTab === 'drip' && renderDripTab()}
      {activeTab === 'cheatsheet' && renderCheatSheetTab()}
    </div>
  );
};

export default CrmSetup;
