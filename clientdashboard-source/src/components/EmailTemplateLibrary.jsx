import React, { useState, useCallback, useMemo } from 'react';
import { DRIP_CAMPAIGNS, applyMergeTags } from '../data/dripCampaigns';
import { WORKFLOW_EMAILS, WORKFLOW_PHASE_NAMES } from '../data/workflowEmails';

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e2db', borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.06)', ...style }}>
      {children}
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

const EmailTemplateLibrary = ({ hubData, onSave }) => {
  const allData = hubData?.allData || {};
  const savedEmails = allData?.['email-library'] || {};
  const selectedCrm = allData['crm-setup']?.selectedCrm || 'generic';

  // Collect all email nodes from all workflows
  const groups = useMemo(() => {
    const result = [];
    Object.entries(allData).forEach(([wfKey, wf]) => {
      if (!wf?.nodes) return;
      const emails = (wf.nodes || []).filter(n => n && n.isEmail);
      if (emails.length > 0) {
        const name = wf?.name || wf?.label || wfKey.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/^Custom\s*/i, '');
        result.push({ wfKey, name, emails });
      }
    });

    // Pull pre-loaded drip campaign emails from imported data
    const campaignNameMap = {
      'welcome-10day': '10-Day Welcome Sequence',
      'buyer-hot': 'Hot Buyer Campaign (0-90 Days)',
      'seller-hot': 'Hot Seller Campaign (0-90 Days)',
      'buyer-watch': 'Watch Buyer Campaign (3-6 Months)',
      'seller-watch': 'Watch Seller Campaign (3-6 Months)',
      'buyer-nurture': 'Nurture Buyer Campaign (6+ Months)',
      'seller-nurture': 'Nurture Seller Campaign (6+ Months)',
      'cold-drip': 'Cold Lead Campaign',
      'guide-buyer': 'Buyer Guide Delivery',
      'guide-seller': 'Seller Guide Delivery',
    };

    Object.entries(DRIP_CAMPAIGNS).forEach(([campaignId, campaign]) => {
      const emailTouchpoints = campaign.touchpoints.filter(tp => tp.type === 'email');
      if (emailTouchpoints.length === 0) return;

      const emails = emailTouchpoints.map((tp, idx) => ({
        id: `drip-${campaignId}-${idx}`,
        what: tp.subject || `${campaign.name} - ${tp.day}`,
        emailTemplate: tp.body || '',
        subjectLine: tp.subject || '',
        isEmail: true,
        when: tp.day || '',
        system: 'CRM Drip Campaign',
        emailStatus: tp.body?.trim() ? 'written' : 'needs',
        _isDrip: true,
        _campaignId: campaignId,
      }));

      result.push({
        wfKey: `drip-${campaignId}`,
        name: campaignNameMap[campaignId] || campaign.name,
        emails,
      });
    });

    // Pull workflow email templates from imported data
    Object.entries(WORKFLOW_EMAILS).forEach(([phaseId, templates]) => {
      if (!templates || templates.length === 0) return;
      const emails = templates.map((tpl) => ({
        id: tpl.id,
        what: tpl.subject || 'Untitled Template',
        emailTemplate: tpl.body || '',
        subjectLine: tpl.subject || '',
        isEmail: true,
        when: tpl.notes || '',
        system: 'Workflow Email',
        emailStatus: tpl.body?.trim() ? 'written' : 'needs',
        _isWorkflowTemplate: true,
        _phaseId: phaseId,
        _sourceFile: tpl.sourceFile,
      }));
      result.push({
        wfKey: `workflow-${phaseId}`,
        name: WORKFLOW_PHASE_NAMES[phaseId] || phaseId.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        emails,
      });
    });

    return result;
  }, [allData]);

  // Flat list of all emails with their workflow context
  const allEmails = useMemo(() => {
    const flat = [];
    groups.forEach(g => {
      g.emails.forEach(node => {
        flat.push({ ...node, workflowName: g.name, wfKey: g.wfKey });
      });
    });
    return flat;
  }, [groups]);

  const [selectedId, setSelectedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Detail panel local state
  const [detailState, setDetailState] = useState({});

  const getStatus = (node) => {
    if (node.emailTemplate?.trim()) return { label: 'WRITTEN', color: '#3d7a4a', key: 'written' };
    if (node.emailStatus === 'ready') return { label: 'READY TO GENERATE', color: '#d4860b', key: 'ready' };
    return { label: 'NEEDS TEMPLATE', color: '#c44', key: 'needs' };
  };

  const selectedEmail = useMemo(() => {
    if (!selectedId) return null;
    return allEmails.find(e => e.id === selectedId) || null;
  }, [selectedId, allEmails]);

  // Initialize detail state when selection changes
  // For drip campaign emails, apply CRM merge tags based on selected CRM
  const handleSelect = useCallback((email) => {
    setSelectedId(email.id);
    const isDrip = email._isDrip;
    const rawSubject = email.subjectLine || email.what || '';
    const rawBody = email.emailTemplate || '';
    setDetailState({
      subjectLine: isDrip ? applyMergeTags(rawSubject, selectedCrm) : rawSubject,
      previewText: email.previewText || '',
      emailBody: isDrip ? applyMergeTags(rawBody, selectedCrm) : rawBody,
      automationNotes: email.automationNotes || '',
      sendTiming: email.when || '',
      assignee: email.assignee || '',
      system: email.system || '',
      emailStatus: email.emailStatus || '',
    });
  }, [selectedCrm]);

  // Filter emails
  const filteredEmails = useMemo(() => {
    let filtered = allEmails;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => getStatus(e).key === filterStatus);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        (e.what || '').toLowerCase().includes(term) ||
        (e.workflowName || '').toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [allEmails, filterStatus, searchTerm]);

  // Save email template data back into the workflow node and email library
  const handleSaveTemplate = useCallback(() => {
    if (!selectedEmail) return;
    const wfKey = selectedEmail.wfKey;
    const wfData = allData[wfKey];
    if (!wfData?.nodes) return;

    const updatedNodes = wfData.nodes.map(node => {
      if (node.id === selectedEmail.id) {
        return {
          ...node,
          subjectLine: detailState.subjectLine,
          previewText: detailState.previewText,
          emailTemplate: detailState.emailBody,
          automationNotes: detailState.automationNotes,
          emailStatus: detailState.emailBody?.trim() ? 'written' : detailState.emailStatus,
        };
      }
      return node;
    });

    // Build the updated email library structure
    const emailLibrary = allData['email-library'] || { templates: {} };
    const updatedEmailLibrary = {
      ...emailLibrary,
      templates: {
        ...emailLibrary.templates,
        [selectedEmail.id]: {
          subject: detailState.subjectLine,
          preview: detailState.previewText,
          body: detailState.emailBody,
          notes: detailState.automationNotes,
        }
      }
    };

    const updatedData = {
      ...allData,
      [wfKey]: { ...wfData, nodes: updatedNodes },
      'email-library': updatedEmailLibrary,
    };

    // If _meta exists in hubData, also save to _meta.emailLibrary
    const savePayload = {
      allData: updatedData,
    };

    if (hubData?._meta) {
      savePayload._meta = {
        ...hubData._meta,
        emailLibrary: updatedEmailLibrary,
      };
    }

    onSave(savePayload);
  }, [selectedEmail, allData, detailState, onSave, hubData]);

  const handleDetailChange = (field, value) => {
    setDetailState(prev => ({ ...prev, [field]: value }));
  };

  const handleClearTemplate = () => {
    setDetailState(prev => ({
      ...prev,
      subjectLine: '',
      previewText: '',
      emailBody: '',
      automationNotes: '',
    }));
  };

  // Stats
  const stats = useMemo(() => {
    const total = allEmails.length;
    const written = allEmails.filter(e => e.emailTemplate?.trim()).length;
    const ready = allEmails.filter(e => !e.emailTemplate?.trim() && e.emailStatus === 'ready').length;
    const needs = total - written - ready;
    return { total, written, ready, needs };
  }, [allEmails]);

  // Group filtered emails by workflow for sidebar
  const groupedFiltered = useMemo(() => {
    const map = {};
    filteredEmails.forEach(e => {
      if (!map[e.wfKey]) map[e.wfKey] = { name: e.workflowName, emails: [] };
      map[e.wfKey].emails.push(e);
    });
    return Object.values(map);
  }, [filteredEmails]);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Email Template Library</h1>
      <p style={{ fontSize: 15, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>
        Every email across every workflow, in one place. Write the template once here, and the SOP links right back to it.
      </p>

      {/* Stats Bar */}
      <Card>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a' }}>{stats.total}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Total Emails</div>
          </div>
          <div style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#3d7a4a' }}>{stats.written}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Written</div>
          </div>
          <div style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#d4860b' }}>{stats.ready}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Ready to Generate</div>
          </div>
          <div style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#c44' }}>{stats.needs}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Needs Template</div>
          </div>
        </div>
      </Card>

      {allEmails.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: 40, background: '#fff', border: '1px solid #e5e2db', borderRadius: 8 }}>
          No email tasks found in your workflows yet.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Sidebar - Email List */}
          <div style={{ width: 380, flexShrink: 0 }}>
            {/* Search & Filter */}
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #e5e2db',
                  borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  marginBottom: 8,
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { key: 'all', label: 'All', color: '#1a1a1a' },
                  { key: 'written', label: 'Written', color: '#3d7a4a' },
                  { key: 'ready', label: 'Ready', color: '#d4860b' },
                  { key: 'needs', label: 'Needs Template', color: '#c44' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key)}
                    style={{
                      flex: 1,
                      padding: '6px 8px', fontSize: 11, fontWeight: 600, border: '1px solid',
                      borderColor: filterStatus === f.key ? f.color : '#e5e2db',
                      background: filterStatus === f.key ? f.color : '#fff',
                      color: filterStatus === f.key ? '#fff' : '#666',
                      borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                      textTransform: 'uppercase', letterSpacing: 0.5,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email List */}
            <div style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
              {groupedFiltered.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: 20, fontSize: 13 }}>No emails match your filter.</div>
              ) : groupedFiltered.map(g => (
                <div key={g.name} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#999', marginBottom: 6, padding: '0 4px' }}>
                    {g.name}
                  </div>
                  {g.emails.map((email) => {
                    const status = getStatus(email);
                    const isSelected = selectedId === email.id;
                    return (
                      <div
                        key={email.id}
                        onClick={() => handleSelect(email)}
                        style={{
                          padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s',
                          background: isSelected ? '#f5f3ef' : '#fff',
                          border: '1px solid',
                          borderColor: isSelected ? '#1a1a1a' : '#e5e2db',
                          borderRadius: 6, marginBottom: 4,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontWeight: 600, fontSize: 13, overflow: 'hidden',
                              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              color: isSelected ? '#1a1a1a' : '#333',
                            }}>
                              {email.what || '(untitled email)'}
                            </div>
                            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{email.when || ''}</div>
                          </div>
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: status.color,
                            textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
                            padding: '3px 8px', borderRadius: 4,
                            background: status.key === 'written' ? '#e8f5e9' : status.key === 'ready' ? '#fff3e0' : '#ffeaea',
                          }}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!selectedEmail ? (
              <Card style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#999', marginBottom: 8 }}>Select an email to view details</div>
                <div style={{ fontSize: 13, color: '#bbb' }}>Click on any email in the sidebar to edit its template, subject line, and automation instructions.</div>
              </Card>
            ) : (
              <div>
                {/* Header */}
                <Card>
                  <SectionHeader>{selectedEmail.what || '(untitled email)'}</SectionHeader>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Workflow</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{selectedEmail.workflowName}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Timing</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{selectedEmail.when || 'Not specified'}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Assignee</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{selectedEmail.assignee || selectedEmail.ownerType || 'Not assigned'}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>System</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{selectedEmail.system || 'Not specified'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(() => { const s = getStatus(selectedEmail); return (
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: s.color,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                        padding: '4px 12px', borderRadius: 4,
                        background: s.key === 'written' ? '#e8f5e9' : s.key === 'ready' ? '#fff3e0' : '#ffeaea',
                      }}>
                        {s.label}
                      </span>
                    )})()}
                  </div>
                </Card>

                {/* Subject Line */}
                <Card>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={detailState.subjectLine}
                      onChange={(e) => handleDetailChange('subjectLine', e.target.value)}
                      placeholder="Enter email subject line..."
                      style={{
                        width: '100%', padding: '10px 14px', border: '1px solid #e5e2db',
                        borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                      Preview Text
                    </label>
                    <input
                      type="text"
                      value={detailState.previewText}
                      onChange={(e) => handleDetailChange('previewText', e.target.value)}
                      placeholder="The text that shows in inbox previews..."
                      style={{
                        width: '100%', padding: '10px 14px', border: '1px solid #e5e2db',
                        borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </Card>

                {/* Email Body */}
                <Card>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    Email Body
                  </label>
                  <textarea
                    value={detailState.emailBody}
                    onChange={(e) => handleDetailChange('emailBody', e.target.value)}
                    placeholder="Write your email template here. Use placeholders like [First Name], [Property Address], etc."
                    rows={14}
                    style={{
                      width: '100%', padding: '12px 14px', border: '1px solid #e5e2db',
                      borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical',
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
                    Tip: Use [First Name], [Last Name], [Property Address], [Agent Name], [Closing Date] as placeholders.
                  </div>
                </Card>

                {/* Automation Notes */}
                <Card>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    Automation Instructions
                  </label>
                  <textarea
                    value={detailState.automationNotes}
                    onChange={(e) => handleDetailChange('automationNotes', e.target.value)}
                    placeholder="How should this email be triggered? What system sends it? Any conditions or delays?"
                    rows={4}
                    style={{
                      width: '100%', padding: '12px 14px', border: '1px solid #e5e2db',
                      borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical',
                    }}
                  />
                </Card>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  <button
                    onClick={handleSaveTemplate}
                    style={{
                      flex: 1, padding: '12px 20px', background: '#1a1a1a', color: '#fff',
                      border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseOver={(e) => e.target.style.background = '#333'}
                    onMouseOut={(e) => e.target.style.background = '#1a1a1a'}
                  >
                    Save Template
                  </button>
                  <button
                    onClick={handleClearTemplate}
                    style={{
                      padding: '12px 20px', background: '#fff', color: '#666',
                      border: '1px solid #e5e2db', borderRadius: 8, fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseOver={(e) => { e.target.style.background = '#f5f3ef'; }}
                    onMouseOut={(e) => { e.target.style.background = '#fff'; }}
                  >
                    Blank Slate
                  </button>
                </div>

                {/* Context from workflow */}
                {(selectedEmail.how || selectedEmail.kpis) && (
                  <Card>
                    <SectionHeader>Workflow Context</SectionHeader>
                    {selectedEmail.how && (
                      <div style={{ marginBottom: selectedEmail.kpis ? 16 : 0 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                          How (from SOP)
                        </label>
                        <div style={{ fontSize: 14, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#f9f8f6', padding: 14, borderRadius: 6, border: '1px solid #e5e2db' }}>
                          {selectedEmail.how}
                        </div>
                      </div>
                    )}
                    {selectedEmail.kpis && (
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                          KPIs
                        </label>
                        <div style={{ fontSize: 14, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#f9f8f6', padding: 14, borderRadius: 6, border: '1px solid #e5e2db' }}>
                          {selectedEmail.kpis}
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateLibrary;
