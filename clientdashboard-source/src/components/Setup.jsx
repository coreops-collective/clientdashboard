import React, { useState, useCallback, useRef } from 'react';

const DEFAULT_WORKFLOW_ROLES = [
  { name: 'Agent', color: '#1A1A1A', textColor: '#FFFFFF', default: true },
  { name: 'Admin', color: '#D4D926', textColor: '#1A1A1A', default: true },
  { name: 'Automated', color: '#FFFFFF', textColor: '#1A1A1A', default: true },
];

const DEFAULT_BRANDING = {
  accentColor: '#D4D926',
  accentLight: '#FFFDE7',
  sidebarColor: '#1A1A1A',
  sidebarTextColor: '#FFFFFF',
  teamName: '',
  teamAbbreviation: '',
  whoColor: '#D4D926',
  whatColor: '#D4B896',
  whereColor: '#9B7653',
};

const VISIBLE_SECTIONS = [
  'Pipeline & Transactions',
  'Buyer Consultation',
  'Seller Consultation',
  'Pre-Listing',
  'Active Listing',
  'Open House',
  'Seller Contract to Close',
  'Buyer Contract to Close',
  'Immediately Post Close',
  'First 90 Days',
  'Monthly Touches',
  'Quarterly Touches',
  'Annual Touches',
  'Personal Touches',
  'Inbound Referrals',
  'Outbound Referrals',
];

const CLIENT_FIELDS_CONFIG = [
  { key: 'scheduler_link', label: 'Scheduler Link', placeholder: 'https://calendly.com/your-link', mergeTag: '{{scheduler_link}}' },
  { key: 'google_review_link', label: 'Google Review Link', placeholder: 'https://g.page/r/your-business/review', mergeTag: '{{google_review_link}}' },
  { key: 'website_url', label: 'Website URL', placeholder: 'https://yourteam.com', mergeTag: '{{website_url}}' },
  { key: 'intake_form_link', label: 'Intake / Questionnaire Form', placeholder: 'https://forms.gle/your-intake-form', mergeTag: '{{intake_form_link}}' },
  { key: 'buyer_guide_link', label: 'Buyer Guide Link', placeholder: 'https://yoursite.com/buyer-guide', mergeTag: '{{buyer_guide_link}}' },
  { key: 'seller_guide_link', label: 'Seller Guide Link', placeholder: 'https://yoursite.com/seller-guide', mergeTag: '{{seller_guide_link}}' },
  { key: 'cma_request_link', label: 'CMA Request Form', placeholder: 'https://forms.gle/cma-request', mergeTag: '{{cma_request_link}}' },
  { key: 'referral_form_link', label: 'Referral Form Link', placeholder: 'https://forms.gle/referral', mergeTag: '{{referral_form_link}}' },
  { key: 'social_media_link', label: 'Social Media (primary)', placeholder: 'https://instagram.com/yourbrand', mergeTag: '{{social_media_link}}' },
  { key: 'email_signature', label: 'Email Signature Name/Title', placeholder: 'Jane Smith, Realtor | The Smith Team', mergeTag: '{{email_signature}}' },
];

const sectionContainerStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #e5e2db',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
};

const sectionTitleStyle = {
  fontWeight: 700,
  fontSize: '18px',
  marginBottom: '8px',
};

const descriptionStyle = {
  fontSize: '13px',
  color: '#555',
  marginBottom: '16px',
};

const inputStyle = {
  border: '2px solid #e8e8e8',
  borderRadius: '6px',
  fontSize: '13px',
  padding: '8px 12px',
};

const primaryButtonStyle = {
  backgroundColor: '#1a1a1a',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 600,
  padding: '8px 16px',
  cursor: 'pointer',
};

const yellowButtonStyle = {
  backgroundColor: '#D4D926',
  color: '#1a1a1a',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 600,
  padding: '8px 16px',
  cursor: 'pointer',
};

const pillStyle = {
  backgroundColor: '#f0ede8',
  border: '1px solid #e5e2db',
  padding: '6px 12px',
  borderRadius: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  marginRight: '8px',
  marginBottom: '8px',
};

const removeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  color: '#999',
  padding: '0',
};

function ColorSwatch({ color, onChange, size = 'medium' }) {
  const inputRef = useRef(null);
  const swatchSize = size === 'small' ? '20px' : '32px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: swatchSize,
          height: swatchSize,
          backgroundColor: color,
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={() => inputRef.current?.click()}
      />
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{ display: 'none' }}
      />
    </div>
  );
}

function TeamMembers({ hubData, onSave }) {
  const [members, setMembers] = useState(
    hubData.teamMembers || hubData._meta?.teamMembers || []
  );
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleAddMember = () => {
    if (newName.trim() && newRole.trim()) {
      const updated = [...members, { name: newName.trim(), role: newRole.trim() }];
      setMembers(updated);
      onSave({ teamMembers: updated, _meta: { teamMembers: updated } });
      setNewName('');
      setNewRole('');
    }
  };

  const handleRemoveMember = (index) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
    onSave({ teamMembers: updated, _meta: { teamMembers: updated } });
  };

  return (
    <div style={sectionContainerStyle}>
      <h2 style={sectionTitleStyle}>Team Members</h2>
      <div style={{ marginBottom: '16px' }}>
        {members.map((member, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
            <div>
              <strong>{member.name}</strong> — {member.role}
            </div>
            <button
              style={removeButtonStyle}
              onClick={() => handleRemoveMember(idx)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', color: '#666' }}>Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
            style={{ ...inputStyle, width: '100%', marginTop: '4px' }}
            placeholder="Team member name"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', color: '#666' }}>Role</label>
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
            style={{ ...inputStyle, width: '100%', marginTop: '4px' }}
            placeholder="Role (e.g., Agent, Manager)"
          />
        </div>
        <button style={primaryButtonStyle} onClick={handleAddMember}>
          Add
        </button>
      </div>
    </div>
  );
}

function WorkflowRoles({ hubData, onSave }) {
  const [roles, setRoles] = useState(
    hubData._meta?.workflowRoles || DEFAULT_WORKFLOW_ROLES
  );
  const [newRoleName, setNewRoleName] = useState('');

  const handleUpdateRole = (index, field, value) => {
    const updated = [...roles];
    updated[index] = { ...updated[index], [field]: value };
    setRoles(updated);
    onSave({ _meta: { workflowRoles: updated } });
  };

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      const updated = [
        ...roles,
        {
          name: newRoleName.trim(),
          color: '#D4D926',
          textColor: '#1A1A1A',
          default: false,
        },
      ];
      setRoles(updated);
      onSave({ _meta: { workflowRoles: updated } });
      setNewRoleName('');
    }
  };

  return (
    <div style={sectionContainerStyle}>
      <h2 style={sectionTitleStyle}>Workflow Roles</h2>
      <div style={{ marginBottom: '24px' }}>
        {roles.map((role, idx) => (
          <div key={idx} style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: role.color,
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              />
              <strong>{role.name}</strong>
              {role.default && <span style={{ fontSize: '11px', color: '#999', backgroundColor: '#eee', padding: '2px 6px', borderRadius: '3px' }}>default</span>}
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666' }}>Color:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <ColorSwatch color={role.color} onChange={(val) => handleUpdateRole(idx, 'color', val)} />
                  <input
                    type="text"
                    value={role.color}
                    onChange={(e) => handleUpdateRole(idx, 'color', e.target.value)}
                    style={{ ...inputStyle, width: '100px' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666' }}>Text:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <ColorSwatch color={role.textColor} onChange={(val) => handleUpdateRole(idx, 'textColor', val)} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <input
          type="text"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
          style={{ ...inputStyle, flex: 1 }}
          placeholder="New role name"
        />
        <button
          style={{
            ...yellowButtonStyle,
            border: '2px dashed #D4D926',
            backgroundColor: 'transparent',
            color: '#D4D926',
          }}
          onClick={handleAddRole}
        >
          + Add Role
        </button>
      </div>
    </div>
  );
}

function SystemsAndTools({ hubData, onSave }) {
  const [systems, setSystems] = useState(hubData.systems || []);
  const [newSystem, setNewSystem] = useState('');

  const handleAddSystem = () => {
    if (newSystem.trim()) {
      const updated = [...systems, newSystem.trim()];
      setSystems(updated);
      onSave({ systems: updated });
      setNewSystem('');
    }
  };

  const handleRemoveSystem = (index) => {
    const updated = systems.filter((_, i) => i !== index);
    setSystems(updated);
    onSave({ systems: updated });
  };

  return (
    <div style={sectionContainerStyle}>
      <h2 style={sectionTitleStyle}>Systems & Tools</h2>
      <div style={{ marginBottom: '16px' }}>
        {systems.map((system, idx) => (
          <div key={idx} style={pillStyle}>
            <span>{system}</span>
            <button
              style={removeButtonStyle}
              onClick={() => handleRemoveSystem(idx)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={newSystem}
          onChange={(e) => setNewSystem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSystem()}
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Add system or tool"
        />
        <button style={primaryButtonStyle} onClick={handleAddSystem}>
          Add
        </button>
      </div>
    </div>
  );
}

function LinksAndResources({ hubData, onSave }) {
  const [links, setLinks] = useState(hubData._meta?.links || []);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const missingUrls = links.filter((link) => !link.url || link.url.trim() === '');

  const handleUpdateLink = (index, field, value) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
    onSave({ _meta: { links: updated } });
  };

  const handleAddLink = () => {
    if (newLinkName.trim()) {
      const updated = [...links, { name: newLinkName.trim(), url: newLinkUrl.trim() }];
      setLinks(updated);
      onSave({ _meta: { links: updated } });
      setNewLinkName('');
      setNewLinkUrl('');
    }
  };

  const handleRemoveLink = (index) => {
    const updated = links.filter((_, i) => i !== index);
    setLinks(updated);
    onSave({ _meta: { links: updated } });
  };

  return (
    <div style={sectionContainerStyle}>
      <h2 style={sectionTitleStyle}>Links & Resources</h2>
      {missingUrls.length > 0 && (
        <div style={{
          backgroundColor: '#fffde7',
          border: '1px solid #D4D926',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#333',
        }}>
          {missingUrls.length} link{missingUrls.length !== 1 ? 's' : ''} still need URL{missingUrls.length !== 1 ? 's' : ''}: {missingUrls.map((l) => l.name).join(', ')}
        </div>
      )}
      <div style={{ marginBottom: '16px' }}>
        {links.map((link, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <input
              type="text"
              value={link.name}
              onChange={(e) => handleUpdateLink(idx, 'name', e.target.value)}
              style={{ ...inputStyle, width: '180px' }}
              placeholder="Link name"
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="URL"
            />
            <button
              style={removeButtonStyle}
              onClick={() => handleRemoveLink(idx)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <input
          type="text"
          value={newLinkName}
          onChange={(e) => setNewLinkName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
          style={{ ...inputStyle, width: '180px' }}
          placeholder="Link name"
        />
        <input
          type="text"
          value={newLinkUrl}
          onChange={(e) => setNewLinkUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
          style={{ ...inputStyle, flex: 1 }}
          placeholder="URL"
        />
        <button style={primaryButtonStyle} onClick={handleAddLink}>
          Add
        </button>
      </div>
    </div>
  );
}

function HubBranding({ hubData, onSave }) {
  const [branding, setBranding] = useState(
    hubData._meta?.branding || DEFAULT_BRANDING
  );

  const handleUpdate = (field, value) => {
    const updated = { ...branding, [field]: value };
    setBranding(updated);
    onSave({ _meta: { branding: updated } });
  };

  const handleReset = () => {
    setBranding(DEFAULT_BRANDING);
    onSave({ _meta: { branding: DEFAULT_BRANDING } });
  };

  return (
    <div style={sectionContainerStyle}>
      <h2 style={sectionTitleStyle}>Hub Branding</h2>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Brand Colors</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', marginBottom: '8px' }}>
              <ColorSwatch color={branding.accentColor} onChange={(val) => handleUpdate('accentColor', val)} />
              <input
                type="text"
                value={branding.accentColor}
                onChange={(e) => handleUpdate('accentColor', e.target.value)}
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>
            <div style={{ height: '20px', backgroundColor: branding.accentColor, borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>Accent Light</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', marginBottom: '8px' }}>
              <ColorSwatch color={branding.accentLight} onChange={(val) => handleUpdate('accentLight', val)} />
              <input
                type="text"
                value={branding.accentLight}
                onChange={(e) => handleUpdate('accentLight', e.target.value)}
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>
            <div style={{ height: '20px', backgroundColor: branding.accentLight, borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>Sidebar Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <ColorSwatch color={branding.sidebarColor} onChange={(val) => handleUpdate('sidebarColor', val)} />
              <input
                type="text"
                value={branding.sidebarColor}
                onChange={(e) => handleUpdate('sidebarColor', e.target.value)}
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>Sidebar Text Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <ColorSwatch color={branding.sidebarTextColor} onChange={(val) => handleUpdate('sidebarTextColor', val)} />
              <input
                type="text"
                value={branding.sidebarTextColor}
                onChange={(e) => handleUpdate('sidebarTextColor', e.target.value)}
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Team Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>Team Name</label>
            <input
              type="text"
              value={branding.teamName}
              onChange={(e) => handleUpdate('teamName', e.target.value)}
              style={{ ...inputStyle, width: '100%', marginTop: '4px' }}
              placeholder="Your team name"
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>Team Abbreviation (max 3 chars)</label>
            <input
              type="text"
              maxLength="3"
              value={branding.teamAbbreviation}
              onChange={(e) => handleUpdate('teamAbbreviation', e.target.value.toUpperCase())}
              style={{ ...inputStyle, width: '100%', marginTop: '4px' }}
              placeholder="ABC"
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Target Audience Section Colors</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>WHO Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <ColorSwatch color={branding.whoColor} onChange={(val) => handleUpdate('whoColor', val)} />
              <input
                type="text"
                value={branding.whoColor}
                onChange={(e) => handleUpdate('whoColor', e.target.value)}
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>WHAT Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <ColorSwatch color={branding.whatColor} onChange={(val) => handleUpdate('whatColor', val)} />
              <input
                type="text"
                value={branding.whatColor}
                onChange={(e) => handleUpdate('whatColor', e.target.value)}
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>WHERE Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <ColorSwatch color={branding.whereColor} onChange={(val) => handleUpdate('whereColor', val)} />
              <input
                type="text"
                value={branding.whereColor}
                onChange={(e) => handleUpdate('whereColor', e.target.value)}
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        style={{
          ...primaryButtonStyle,
          backgroundColor: '#f5f5f5',
          color: '#333',
          border: '1px solid #ddd',
        }}
        onClick={handleReset}
      >
        Reset to Default
      </button>
    </div>
  );
}

function VisibleSections({ hubData, onSave }) {
  const [visibleSections, setVisibleSections] = useState(
    hubData._meta?.visibleSections || {}
  );

  const handleToggleSection = (sectionName) => {
    const updated = { ...visibleSections };
    updated[sectionName] = !updated[sectionName];
    setVisibleSections(updated);
    onSave({ _meta: { visibleSections: updated } });
  };

  return (
    <div style={sectionContainerStyle}>
      <h2 style={sectionTitleStyle}>Visible Sections</h2>
      <p style={descriptionStyle}>
        Not every agent does open houses. Not every agent needs every workflow. Toggle off the sections that don't apply to your business.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {VISIBLE_SECTIONS.map((section) => (
          <div key={section} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
            <span style={{ fontSize: '13px' }}>{section}</span>
            <button
              style={{
                backgroundColor: visibleSections[section] ? '#D4D926' : '#e0e0e0',
                color: visibleSections[section] ? '#1a1a1a' : '#666',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
              onClick={() => handleToggleSection(section)}
            >
              {visibleSections[section] ? 'Show' : 'Hide'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomWorkflows({ hubData, onSave }) {
  const [workflows, setWorkflows] = useState(hubData._meta?.customWorkflows || []);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowCategory, setNewWorkflowCategory] = useState('Transactions');

  const handleAddWorkflow = () => {
    if (newWorkflowName.trim()) {
      const updated = [
        ...workflows,
        {
          name: newWorkflowName.trim(),
          category: newWorkflowCategory,
        },
      ];
      setWorkflows(updated);
      onSave({ _meta: { customWorkflows: updated } });
      setNewWorkflowName('');
    }
  };

  const handleRemoveWorkflow = (index) => {
    const updated = workflows.filter((_, i) => i !== index);
    setWorkflows(updated);
    onSave({ _meta: { customWorkflows: updated } });
  };

  return (
    <div style={sectionContainerStyle}>
      <h2 style={sectionTitleStyle}>Custom Workflows</h2>
      <p style={descriptionStyle}>
        Build your own workflows for processes unique to your business. They'll show up as new tabs in the sidebar.
      </p>

      <div style={{ marginBottom: '16px' }}>
        {workflows.map((workflow, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
            <div>
              <strong>{workflow.name}</strong> — {workflow.category}
            </div>
            <button
              style={removeButtonStyle}
              onClick={() => handleRemoveWorkflow(idx)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <input
          type="text"
          value={newWorkflowName}
          onChange={(e) => setNewWorkflowName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddWorkflow()}
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Workflow name"
        />
        <select
          value={newWorkflowCategory}
          onChange={(e) => setNewWorkflowCategory(e.target.value)}
          style={{ ...inputStyle, minWidth: '150px' }}
        >
          <option value="Transactions">Transactions</option>
          <option value="Marketing">Marketing</option>
          <option value="Growth">Growth</option>
        </select>
        <button style={yellowButtonStyle} onClick={handleAddWorkflow}>
          + Add Workflow
        </button>
      </div>
    </div>
  );
}

function ClientFields({ hubData, onSave }) {
  const [clientFields, setClientFields] = useState(hubData._meta?.clientFields || {});
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');

  const handleUpdateField = (key, value) => {
    const updated = { ...clientFields, [key]: value };
    setClientFields(updated);
    onSave({ _meta: { clientFields: updated } });
  };

  const handleAddCustomField = () => {
    if (newFieldKey.trim() && newFieldLabel.trim()) {
      const updated = { ...clientFields, [newFieldKey.trim()]: '' };
      setClientFields(updated);
      onSave({ _meta: { clientFields: updated } });
      setNewFieldKey('');
      setNewFieldLabel('');
    }
  };

  return (
    <div style={sectionContainerStyle}>
      <h2 style={sectionTitleStyle}>Client Fields (Merge Tags)</h2>
      <p style={descriptionStyle}>
        These values auto-fill into your email templates and workflows wherever you use the matching merge tags. For example, the value you enter for "Scheduler Link" will replace <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>{'{{scheduler_link}}'}</code> in any email template.
      </p>

      <div style={{ marginBottom: '24px' }}>
        {CLIENT_FIELDS_CONFIG.map((field) => (
          <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 200px', gap: '12px', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>{field.label}</label>
            <input
              type="text"
              value={clientFields[field.key] || ''}
              onChange={(e) => handleUpdateField(field.key, e.target.value)}
              style={{ ...inputStyle, width: '100%' }}
              placeholder={field.placeholder}
            />
            <div style={{ fontSize: '12px', color: '#999', fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              {field.mergeTag}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
        <input
          type="text"
          value={newFieldKey}
          onChange={(e) => setNewFieldKey(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddCustomField()}
          style={{ ...inputStyle, minWidth: '150px' }}
          placeholder="Field key"
        />
        <input
          type="text"
          value={newFieldLabel}
          onChange={(e) => setNewFieldLabel(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddCustomField()}
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Field label"
        />
        <button style={primaryButtonStyle} onClick={handleAddCustomField}>
          + Add custom field
        </button>
      </div>
    </div>
  );
}

export default function Setup({ hubData, onSave }) {
  if (!hubData) {
    return <div style={{ padding: '24px' }}>Loading setup...</div>;
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', background: '#f5f3f0', minHeight: '100vh', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#1a1a1a' }}>Setup</h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '32px', lineHeight: 1.6 }}>
        Configure your business hub settings, team members, branding, and integrations.
      </p>

      <TeamMembers hubData={hubData} onSave={onSave} />
      <WorkflowRoles hubData={hubData} onSave={onSave} />
      <SystemsAndTools hubData={hubData} onSave={onSave} />
      <LinksAndResources hubData={hubData} onSave={onSave} />
      <HubBranding hubData={hubData} onSave={onSave} />
      <VisibleSections hubData={hubData} onSave={onSave} />
      <CustomWorkflows hubData={hubData} onSave={onSave} />
      <ClientFields hubData={hubData} onSave={onSave} />
    </div>
  );
}
