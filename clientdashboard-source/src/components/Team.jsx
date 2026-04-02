import React, { useState, useCallback, useMemo } from 'react';

const WF_KEYS = [
  'buyer-consultation', 'seller-consultation', 'pre-listing', 'active-listing',
  'open-house', 'seller-contract', 'buyer-contract',
  'immediately-post-close', 'first-90-days', 'monthly-touches', 'quarterly-touches',
  'annual-touches', 'personal-touches', 'inbound-referrals', 'outbound-referrals'
];

function normalizeRole(r) {
  if (!r) return '';
  const lower = r.toLowerCase();
  if (lower === 'agent') return 'agent';
  if (lower === 'admin') return 'admin';
  if (lower === 'automated') return 'automated';
  return lower;
}

function getTaskTags(node) {
  if (Array.isArray(node.taskTags) && node.taskTags.length > 0) return node.taskTags;
  const tags = [];
  if (node.isEmail) tags.push('Email Task');
  if (node.isRemote === true) tags.push('Remote');
  if (node.isRemote === false && !node.isEmail) tags.push('In-Person');
  return tags;
}

const Team = ({ hubData, onSave }) => {
  const allData = hubData?.allData || {};
  const teamMembers = useMemo(
    () => hubData?.teamMembers || hubData?._meta?.teamMembers || allData?.team?.members || [],
    [hubData, allData]
  );

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [memberTab, setMemberTab] = useState('overview');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: 'Agent', brokerage: '', city: '', state: '',
  });

  const roleOptions = ['Agent', 'Admin', 'Automated'];

  const roleDotColors = {
    agent: '#1A1A1A',
    admin: '#D4D926',
    automated: '#FFFFFF',
    Agent: '#1A1A1A',
    Admin: '#D4D926',
    Automated: '#FFFFFF',
  };

  const taskTypeDotColors = {
    'All Tasks': '#1A1A1A',
    'In-Person': '#4CAF50',
    'Remote': '#2196F3',
    'Email': '#9C27B0',
  };

  // Gather ALL workflow tasks
  const allTasks = useMemo(() => {
    const tasks = [];
    WF_KEYS.forEach(wfKey => {
      let workflow = allData[wfKey];
      if (!workflow) {
        const matchKey = Object.keys(allData).find(k => {
          const kl = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          const parts = wfKey.split('-');
          return parts.every(p => kl.includes(p));
        });
        if (matchKey) workflow = allData[matchKey];
      }
      if (workflow?.nodes && Array.isArray(workflow.nodes)) {
        workflow.nodes.forEach((node, idx) => {
          if (node && typeof node === 'object') {
            tasks.push({
              ...node,
              stepNumber: idx + 1,
              workflowKey: wfKey,
              workflowName: wfKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              _tags: getTaskTags(node),
              _role: normalizeRole(node.ownerType),
            });
          }
        });
      }
    });
    return tasks;
  }, [allData]);

  // Role counts
  const roleCounts = useMemo(() => {
    const counts = { agent: 0, admin: 0, automated: 0 };
    allTasks.forEach(t => {
      if (counts.hasOwnProperty(t._role)) counts[t._role]++;
    });
    return counts;
  }, [allTasks]);

  // Task type counts
  const taskCounts = useMemo(() => {
    let email = 0, remote = 0, inPerson = 0;
    allTasks.forEach(t => {
      if (t._tags.includes('Email Task')) email++;
      if (t._tags.includes('Remote')) remote++;
      if (t._tags.includes('In-Person')) inPerson++;
    });
    return { allTasks: allTasks.length, email, remote, inPerson };
  }, [allTasks]);

  // Filter tasks based on selection
  const selectedTasks = useMemo(() => {
    if (selectedRole) {
      const roleNorm = normalizeRole(selectedRole);
      return allTasks.filter(t => t._role === roleNorm);
    }
    if (selectedTaskType) {
      if (selectedTaskType === 'all') return allTasks;
      return allTasks.filter(t => t._tags.includes(selectedTaskType));
    }
    if (selectedMember) {
      return allTasks.filter(t => t.assignee === selectedMember.name);
    }
    return [];
  }, [allTasks, selectedRole, selectedTaskType, selectedMember]);

  // Get unique workflows and systems from selected tasks
  const selectedTasksMetadata = useMemo(() => {
    const workflows = new Set();
    const systems = new Set();
    selectedTasks.forEach(t => {
      workflows.add(t.workflowName);
      if (t.system) systems.add(t.system);
    });
    return {
      uniqueWorkflows: workflows.size,
      uniqueSystems: systems.size,
      allSystems: Array.from(systems),
    };
  }, [selectedTasks]);

  const saveTeam = useCallback((members) => {
    onSave({ teamMembers: members, _meta: { teamMembers: members }, allData: { ...allData, team: { members } } });
  }, [onSave, allData]);

  const handleOpenForm = (member = null) => {
    if (member) {
      setEditingId(member.id);
      setFormData(member);
    } else {
      setEditingId(null);
      setFormData({ id: Date.now(), name: '', email: '', phone: '', role: 'Agent', brokerage: '', city: '', state: '' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => { setIsFormOpen(false); setEditingId(null); };

  const handleSaveForm = () => {
    if (!formData.name.trim()) { alert('Name is required'); return; }
    let updated;
    if (editingId) {
      updated = teamMembers.map(m => m.id === editingId ? formData : m);
    } else {
      updated = [...teamMembers, formData];
    }
    saveTeam(updated);
    handleCloseForm();
  };

  const handleRemoveMember = (id) => {
    if (window.confirm('Remove this team member?')) {
      saveTeam(teamMembers.filter(m => m.id !== id));
      if (selectedMember?.id === id) setSelectedMember(null);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectRole = (role) => {
    setSelectedRole(selectedRole === role ? null : role);
    setSelectedMember(null);
    setSelectedTaskType(null);
    setMemberTab('overview');
  };

  const selectTaskType = (type) => {
    setSelectedTaskType(selectedTaskType === type ? null : type);
    setSelectedRole(null);
    setSelectedMember(null);
  };

  const selectMember = (member) => {
    setSelectedMember(selectedMember?.id === member.id ? null : member);
    setSelectedRole(null);
    setSelectedTaskType(null);
    setMemberTab('overview');
  };

  // Role tabs (5 tabs)
  const ROLE_TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'job-description', label: 'Job Description' },
    { key: '30-60-90', label: '30-60-90 Plan' },
    { key: 'accountability', label: 'Accountability' },
    { key: 'training', label: 'Training Manual' },
  ];

  // Member tabs (4 tabs)
  const MEMBER_TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'job-description', label: 'Job Description' },
    { key: '30-60-90', label: '30-60-90 Plan' },
    { key: 'training', label: 'Training Manual' },
  ];

  // Task type selector for role view - group by workflow
  const getTasksByWorkflow = (tasks) => {
    const grouped = {};
    tasks.forEach(t => {
      if (!grouped[t.workflowName]) grouped[t.workflowName] = [];
      grouped[t.workflowName].push(t);
    });
    return grouped;
  };

  // Role Overview Tab
  const renderRoleOverview = () => {
    const tasksByWorkflow = getTasksByWorkflow(selectedTasks);
    return (
      <div>
        {/* Systems & Tools section */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, textTransform: 'uppercase' }}>
            Systems & Tools
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedTasksMetadata.allSystems.length > 0 ? (
              selectedTasksMetadata.allSystems.map(system => (
                <span
                  key={system}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d0ccc4',
                    background: '#f5f5f5',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}
                >
                  {system}
                </span>
              ))
            ) : (
              <span style={{ fontSize: 13, color: '#999' }}>No systems assigned</span>
            )}
          </div>
        </div>

        {/* Tasks by workflow */}
        <div>
          {Object.entries(tasksByWorkflow).map(([wfName, tasks]) => (
            <div key={wfName} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#1a1a1a',
                marginBottom: 12,
                borderBottom: '1px solid #e5e2db',
                paddingBottom: 8,
              }}>
                {wfName} - {tasks.length} tasks
              </div>
              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #f0ede8',
                    display: 'flex',
                    alignItems: 'start',
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#999', minWidth: 24 }}>
                    {task.stepNumber}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: '#1a1a1a' }}>
                      {task.what || '(untitled)'}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {task._tags.map(tag => {
                        let bgColor = '#f3f2f0';
                        let textColor = '#1a1a1a';
                        if (tag === 'Remote') {
                          bgColor = '#2196F3';
                          textColor = '#fff';
                        } else if (tag === 'In-Person') {
                          bgColor = '#4CAF50';
                          textColor = '#fff';
                        }
                        const displayTag = tag === 'Email Task' ? 'Email' : tag;
                        return (
                          <span
                            key={tag}
                            style={{
                              padding: '2px 6px',
                              borderRadius: 3,
                              background: bgColor,
                              color: textColor,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {displayTag}
                          </span>
                        );
                      })}
                      {task.system && (
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {task.system}
                        </span>
                      )}
                      {task.when && (
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {task.when}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Role Job Description Tab
  const renderRoleJobDescription = () => {
    const tasksByWorkflow = getTasksByWorkflow(selectedTasks);
    const inPersonCount = selectedTasks.filter(t => t._tags.includes('In-Person')).length;
    const remoteCount = selectedTasks.filter(t => t._tags.includes('Remote')).length;

    const getPositionSummary = () => {
      const role = selectedRole || 'this role';
      const wfCount = Object.keys(tasksByWorkflow).length;
      return `The ${role} role is responsible for ${selectedTasks.length} critical tasks across ${wfCount} workflows. This role requires a balanced mix of in-person interactions and remote work, with a focus on execution, coordination, and continuous improvement.`;
    };

    return (
      <div>
        {/* Yellow header */}
        <div style={{
          background: '#1a1a1a',
          borderTop: '4px solid #D4D926',
          padding: '20px 24px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#D4D926', marginBottom: 8 }}>
            Job Description
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
            {selectedRole || 'Role'}
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {inPersonCount > 0 && (
            <span style={{
              padding: '6px 12px',
              background: '#4CAF50',
              color: '#fff',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
            }}>
              {inPersonCount} In-Person
            </span>
          )}
          {remoteCount > 0 && (
            <span style={{
              padding: '6px 12px',
              background: '#2196F3',
              color: '#fff',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
            }}>
              {remoteCount} Remote
            </span>
          )}
        </div>

        {/* Position Summary */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, textTransform: 'uppercase' }}>
            Position Summary
          </h3>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: 0 }}>
            {getPositionSummary()}
          </p>
        </div>

        {/* Tasks by Workflow */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 16, textTransform: 'uppercase' }}>
            Tasks by Workflow
          </h3>
          {Object.entries(tasksByWorkflow).map(([wfName, tasks]) => (
            <div key={wfName} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#D4D926', marginBottom: 8 }}>
                {wfName}
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, listStyleType: 'disc' }}>
                {tasks.map((t, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#555', marginBottom: 4, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700 }}>{t.what || '(untitled)'}</span>
                    {t.when && <span style={{ color: '#999', marginLeft: 8 }}>— {t.when}</span>}
                    {t._tags.length > 0 && (
                      <span style={{ marginLeft: 8 }}>
                        {t._tags.map(tag => {
                          const displayTag = tag === 'Email Task' ? 'Email' : tag;
                          return `[${displayTag}]`;
                        }).join(' ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Role 30-60-90 Tab
  const renderRole306090 = () => {
    const sortedTasks = [...selectedTasks].sort((a, b) => {
      const wfOrder = WF_KEYS;
      const aIdx = wfOrder.indexOf(a.workflowKey);
      const bIdx = wfOrder.indexOf(b.workflowKey);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.stepNumber - b.stepNumber;
    });

    const chunk = Math.ceil(sortedTasks.length / 3);
    const first30 = sortedTasks.slice(0, chunk);
    const next30 = sortedTasks.slice(chunk, chunk * 2);
    const last30 = sortedTasks.slice(chunk * 2);

    const renderPhase = (title, description, tasks, borderColor) => (
      <div style={{ marginBottom: 32 }}>
        <div style={{
          borderLeft: `6px solid ${borderColor}`,
          paddingLeft: 16,
          marginBottom: 16,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px 0' }}>
            {title}
          </h3>
          <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>
            {description}
          </p>
        </div>

        {tasks.map((t, i) => (
          <div key={i} style={{ marginLeft: 16, marginBottom: 12, display: 'flex', gap: 12 }}>
            <span style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: borderColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>
                {t.what || '(untitled)'}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {t.workflowName}{t.system ? ` • ${t.system}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    return (
      <div>
        {/* Yellow header */}
        <div style={{
          background: '#1a1a1a',
          borderTop: '4px solid #D4D926',
          padding: '20px 24px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#D4D926', marginBottom: 8 }}>
            30-60-90 Day Onboarding Plan
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
            {selectedRole || 'Role'}
          </div>
        </div>

        {renderPhase('First 30 Days', 'Learn the foundations. Observe, absorb, get your systems set up.', first30, '#D4D926')}
        {renderPhase('Days 31-60', 'Start owning your tasks. Execute with guidance, build confidence.', next30, '#FFB800')}
        {renderPhase('Days 61-90', 'Run independently. Refine and optimize your processes.', last30, '#2196F3')}
      </div>
    );
  };

  // Role Accountability Tab
  const renderRoleAccountability = () => {
    const tasksByWorkflow = getTasksByWorkflow(selectedTasks);
    const accountabilityItems = selectedTasks.filter(t => t.why && t.why.trim());

    return (
      <div>
        {/* Yellow header */}
        <div style={{
          background: '#1a1a1a',
          borderTop: '4px solid #D4D926',
          padding: '20px 24px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#D4D926', marginBottom: 8 }}>
            Accountability Metrics
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
            {selectedRole || 'Role'}
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 32 }}>
          These are the measurable standards this role is held to. Clear expectations mean nobody has to guess whether they're doing a good job.
        </p>

        {/* From Your Workflows */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 16, textTransform: 'uppercase' }}>
            From Your Workflows
          </h3>

          {accountabilityItems.length > 0 ? (
            accountabilityItems.map((t, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e2db' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>📋</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', flex: 1 }}>
                    {t.what || '(untitled)'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 4, marginLeft: 26 }}>
                  {t.workflowName}
                </div>
                <div style={{ fontSize: 12, color: '#555', marginLeft: 26, lineHeight: 1.5 }}>
                  <strong>Why:</strong> {t.why}
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 13, color: '#999' }}>No accountability metrics defined yet.</p>
          )}
        </div>

        {/* Custom Accountability Standards */}
        <div style={{ background: '#f9f9f9', border: '1px solid #e5e2db', borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, textTransform: 'uppercase' }}>
            Custom Accountability Standards
          </h3>
          <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px 0', lineHeight: 1.5 }}>
            Add specific, measurable standards for this role beyond what's captured in workflows.
          </p>
          <p style={{ fontSize: 12, color: '#999', margin: 0, lineHeight: 1.5 }}>
            Add custom KPIs and accountability standards in each workflow task's 'KPI' field, and they'll automatically appear here organized by workflow.
          </p>
        </div>
      </div>
    );
  };

  // Role Training Manual Tab
  const renderRoleTraining = () => {
    const tasksByWorkflow = getTasksByWorkflow(selectedTasks);

    return (
      <div>
        {/* Yellow header */}
        <div style={{
          background: '#1a1a1a',
          borderTop: '4px solid #D4D926',
          padding: '20px 24px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#D4D926', marginBottom: 8 }}>
            Training Manual
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
            {selectedRole || 'Role'}
          </div>
        </div>

        {/* Systems Box */}
        {selectedTasksMetadata.allSystems.length > 0 && (
          <div style={{
            background: '#f9f9f9',
            border: '1px solid #e5e2db',
            borderRadius: 8,
            padding: 16,
            marginBottom: 32,
          }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, textTransform: 'uppercase' }}>
              Systems You'll Need Access To
            </h3>
            <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>
              {selectedTasksMetadata.allSystems.join(', ')}
            </p>
          </div>
        )}

        {/* Tasks by Workflow */}
        {Object.entries(tasksByWorkflow).map(([wfName, tasks]) => (
          <div key={wfName} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
              {wfName}
            </h3>
            {tasks.map((t, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e2db',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
                    {t.what || '(untitled)'}
                  </div>
                  {t.system && (
                    <span style={{
                      padding: '2px 8px',
                      background: '#f3f2f0',
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#555',
                    }}>
                      {t.system}
                    </span>
                  )}
                </div>
                {t.when && (
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                    {t.when}
                  </div>
                )}
                {t.how && t.how.trim() ? (
                  <div style={{
                    background: '#fafaf9',
                    border: '1px solid #f0ede8',
                    borderRadius: 6,
                    padding: 12,
                    fontSize: 12,
                    color: '#555',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {t.how}
                  </div>
                ) : (
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffeeb0',
                    borderRadius: 6,
                    padding: 12,
                    fontSize: 12,
                    color: '#856404',
                  }}>
                    Training content not yet added. Fill in the HOW field in the workflow builder.
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Member Overview Tab
  const renderMemberOverview = () => {
    const tasksByWorkflow = getTasksByWorkflow(selectedTasks);
    const wfCount = Object.keys(tasksByWorkflow).length;

    if (selectedTasks.length === 0) {
      return (
        <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>∅</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            Nothing to compile yet
          </h3>
          <p style={{ fontSize: 13, color: '#999' }}>
            Assign tasks to {selectedMember?.name} in your workflows first.
          </p>
        </div>
      );
    }

    return (
      <div>
        {Object.entries(tasksByWorkflow).map(([wfName, tasks]) => (
          <div key={wfName} style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: 12,
              borderBottom: '1px solid #e5e2db',
              paddingBottom: 8,
            }}>
              {wfName} - {tasks.length} tasks
            </div>
            {tasks.map((task, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #f0ede8',
                  display: 'flex',
                  alignItems: 'start',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: '#999', minWidth: 24 }}>
                  {task.stepNumber}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: '#1a1a1a' }}>
                    {task.what || '(untitled)'}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {task._tags.map(tag => {
                      let bgColor = '#f3f2f0';
                      let textColor = '#1a1a1a';
                      if (tag === 'Remote') {
                        bgColor = '#2196F3';
                        textColor = '#fff';
                      } else if (tag === 'In-Person') {
                        bgColor = '#4CAF50';
                        textColor = '#fff';
                      }
                      const displayTag = tag === 'Email Task' ? 'Email' : tag;
                      return (
                        <span
                          key={tag}
                          style={{
                            padding: '2px 6px',
                            borderRadius: 3,
                            background: bgColor,
                            color: textColor,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {displayTag}
                        </span>
                      );
                    })}
                    {task.system && (
                      <span style={{ fontSize: 12, color: '#999' }}>
                        {task.system}
                      </span>
                    )}
                    {task.when && (
                      <span style={{ fontSize: 12, color: '#999' }}>
                        {task.when}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Member Job Description Tab
  const renderMemberJobDescription = () => {
    if (selectedTasks.length === 0) {
      return (
        <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>∅</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            Nothing to compile yet
          </h3>
          <p style={{ fontSize: 13, color: '#999' }}>
            Assign tasks to {selectedMember?.name} in your workflows first.
          </p>
        </div>
      );
    }

    const tasksByWorkflow = getTasksByWorkflow(selectedTasks);
    const inPersonCount = selectedTasks.filter(t => t._tags.includes('In-Person')).length;
    const remoteCount = selectedTasks.filter(t => t._tags.includes('Remote')).length;

    const getPositionSummary = () => {
      const wfCount = Object.keys(tasksByWorkflow).length;
      return `${selectedMember?.name} is responsible for ${selectedTasks.length} critical tasks across ${wfCount} workflows in the ${selectedMember?.role} role. This involves a mix of in-person interactions and remote work, requiring strong execution and coordination skills.`;
    };

    return (
      <div>
        {/* Yellow header */}
        <div style={{
          background: '#1a1a1a',
          borderTop: '4px solid #D4D926',
          padding: '20px 24px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#D4D926', marginBottom: 8 }}>
            Job Description
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
            {selectedMember?.name || 'Member'}
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {inPersonCount > 0 && (
            <span style={{
              padding: '6px 12px',
              background: '#4CAF50',
              color: '#fff',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
            }}>
              {inPersonCount} In-Person
            </span>
          )}
          {remoteCount > 0 && (
            <span style={{
              padding: '6px 12px',
              background: '#2196F3',
              color: '#fff',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
            }}>
              {remoteCount} Remote
            </span>
          )}
        </div>

        {/* Position Summary */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, textTransform: 'uppercase' }}>
            Position Summary
          </h3>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: 0 }}>
            {getPositionSummary()}
          </p>
        </div>

        {/* Tasks by Workflow */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 16, textTransform: 'uppercase' }}>
            Tasks by Workflow
          </h3>
          {Object.entries(tasksByWorkflow).map(([wfName, tasks]) => (
            <div key={wfName} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#D4D926', marginBottom: 8 }}>
                {wfName}
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, listStyleType: 'disc' }}>
                {tasks.map((t, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#555', marginBottom: 4, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700 }}>{t.what || '(untitled)'}</span>
                    {t.when && <span style={{ color: '#999', marginLeft: 8 }}>— {t.when}</span>}
                    {t._tags.length > 0 && (
                      <span style={{ marginLeft: 8 }}>
                        {t._tags.map(tag => {
                          const displayTag = tag === 'Email Task' ? 'Email' : tag;
                          return `[${displayTag}]`;
                        }).join(' ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Member 30-60-90 Tab
  const renderMember306090 = () => {
    if (selectedTasks.length === 0) {
      return (
        <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>∅</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            Nothing to compile yet
          </h3>
          <p style={{ fontSize: 13, color: '#999' }}>
            Assign tasks to {selectedMember?.name} in your workflows first.
          </p>
        </div>
      );
    }

    const sortedTasks = [...selectedTasks].sort((a, b) => {
      const wfOrder = WF_KEYS;
      const aIdx = wfOrder.indexOf(a.workflowKey);
      const bIdx = wfOrder.indexOf(b.workflowKey);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.stepNumber - b.stepNumber;
    });

    const chunk = Math.ceil(sortedTasks.length / 3);
    const first30 = sortedTasks.slice(0, chunk);
    const next30 = sortedTasks.slice(chunk, chunk * 2);
    const last30 = sortedTasks.slice(chunk * 2);

    const renderPhase = (title, description, tasks, borderColor) => (
      <div style={{ marginBottom: 32 }}>
        <div style={{
          borderLeft: `6px solid ${borderColor}`,
          paddingLeft: 16,
          marginBottom: 16,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px 0' }}>
            {title}
          </h3>
          <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>
            {description}
          </p>
        </div>

        {tasks.map((t, i) => (
          <div key={i} style={{ marginLeft: 16, marginBottom: 12, display: 'flex', gap: 12 }}>
            <span style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: borderColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>
                {t.what || '(untitled)'}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {t.workflowName}{t.system ? ` • ${t.system}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    return (
      <div>
        {/* Yellow header */}
        <div style={{
          background: '#1a1a1a',
          borderTop: '4px solid #D4D926',
          padding: '20px 24px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#D4D926', marginBottom: 8 }}>
            30-60-90 Day Onboarding Plan
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
            {selectedMember?.name || 'Member'}
          </div>
        </div>

        {renderPhase('First 30 Days', 'Learn the foundations. Observe, absorb, get your systems set up.', first30, '#D4D926')}
        {renderPhase('Days 31-60', 'Start owning your tasks. Execute with guidance, build confidence.', next30, '#FFB800')}
        {renderPhase('Days 61-90', 'Run independently. Refine and optimize your processes.', last30, '#2196F3')}
      </div>
    );
  };

  // Member Training Manual Tab
  const renderMemberTraining = () => {
    if (selectedTasks.length === 0) {
      return (
        <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>∅</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            Nothing to compile yet
          </h3>
          <p style={{ fontSize: 13, color: '#999' }}>
            Assign tasks to {selectedMember?.name} in your workflows first.
          </p>
        </div>
      );
    }

    const tasksByWorkflow = getTasksByWorkflow(selectedTasks);

    return (
      <div>
        {/* Yellow header */}
        <div style={{
          background: '#1a1a1a',
          borderTop: '4px solid #D4D926',
          padding: '20px 24px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#D4D926', marginBottom: 8 }}>
            Training Manual
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
            {selectedMember?.name || 'Member'}
          </div>
        </div>

        {/* Systems Box */}
        {selectedTasksMetadata.allSystems.length > 0 && (
          <div style={{
            background: '#f9f9f9',
            border: '1px solid #e5e2db',
            borderRadius: 8,
            padding: 16,
            marginBottom: 32,
          }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, textTransform: 'uppercase' }}>
              Systems You'll Need Access To
            </h3>
            <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>
              {selectedTasksMetadata.allSystems.join(', ')}
            </p>
          </div>
        )}

        {/* Tasks by Workflow */}
        {Object.entries(tasksByWorkflow).map(([wfName, tasks]) => (
          <div key={wfName} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
              {wfName}
            </h3>
            {tasks.map((t, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e2db',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
                    {t.what || '(untitled)'}
                  </div>
                  {t.system && (
                    <span style={{
                      padding: '2px 8px',
                      background: '#f3f2f0',
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#555',
                    }}>
                      {t.system}
                    </span>
                  )}
                </div>
                {t.when && (
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                    {t.when}
                  </div>
                )}
                {t.how && t.how.trim() ? (
                  <div style={{
                    background: '#fafaf9',
                    border: '1px solid #f0ede8',
                    borderRadius: 6,
                    padding: 12,
                    fontSize: 12,
                    color: '#555',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {t.how}
                  </div>
                ) : (
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffeeb0',
                    borderRadius: 6,
                    padding: 12,
                    fontSize: 12,
                    color: '#856404',
                  }}>
                    Training content not yet added. Fill in the HOW field in the workflow builder.
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f3f0', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* LEFT PANEL */}
      <div style={{ width: 350, borderRight: '1px solid #e5e2db', overflowY: 'auto', padding: 24, background: '#fff' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', color: '#1a1a1a' }}>Team</h1>
          <p style={{ fontSize: 13, color: '#999', margin: 0, lineHeight: 1.5 }}>
            Everyone on your team, current and future. Click a member to see their responsibilities pulled from every workflow you've built.
          </p>
        </div>

        {/* BY ROLE */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>By Role</div>
          {roleOptions.map(role => {
            const roleNorm = normalizeRole(role);
            const isActive = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => selectRole(role)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '8px 12px',
                  border: isActive ? '1px solid #999' : '1px solid transparent',
                  background: isActive ? '#f0ede8' : 'transparent',
                  borderRadius: 6, cursor: 'pointer', fontSize: 14,
                  color: '#1a1a1a', textAlign: 'left', marginBottom: 4,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: roleDotColors[roleNorm], flexShrink: 0, border: roleNorm === 'automated' ? '1px solid #ccc' : 'none' }} />
                <span style={{ flex: 1 }}>{role}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#999' }}>({roleCounts[roleNorm] || 0})</span>
              </button>
            );
          })}
        </div>

        {/* BY TASK TYPE */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>By Task Type</div>
          {[
            { label: 'All Tasks', key: 'all', count: taskCounts.allTasks, color: '#1a1a1a' },
            { label: 'In-Person', key: 'In-Person', count: taskCounts.inPerson, color: '#4CAF50' },
            { label: 'Remote', key: 'Remote', count: taskCounts.remote, color: '#2196F3' },
            { label: 'Email', key: 'Email Task', count: taskCounts.email, color: '#9C27B0' },
          ].map(({ label, key, count, color }) => {
            const isActive = selectedTaskType === key;
            return (
              <button
                key={key}
                onClick={() => selectTaskType(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '8px 12px',
                  border: isActive ? '1px solid #999' : '1px solid transparent',
                  background: isActive ? '#f0ede8' : 'transparent',
                  borderRadius: 6, cursor: 'pointer', fontSize: 14,
                  color: '#1a1a1a', textAlign: 'left', marginBottom: 4,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#999' }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* TEAM MEMBERS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Team Members</div>
          {teamMembers.map(member => {
            const isActive = selectedMember?.id === member.id;
            return (
              <button
                key={member.id}
                onClick={() => selectMember(member)}
                style={{
                  width: '100%', padding: '8px 12px',
                  border: isActive ? '1px solid #999' : '1px solid transparent',
                  background: isActive ? '#f0ede8' : 'transparent',
                  borderRadius: 6, cursor: 'pointer', textAlign: 'left',
                  marginBottom: 4,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{member.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{member.role}</div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => handleOpenForm()}
            style={{
              padding: '10px 16px',
              background: '#D4D926',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >Add Current Member</button>
          <button
            onClick={() => handleOpenForm()}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              color: '#1a1a1a',
              border: '2px dashed #999',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >Add Future Hire</button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 40 }}>
        {!selectedRole && !selectedMember && !selectedTaskType ? (
          <div style={{ textAlign: 'center', color: '#999', paddingTop: 80 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#1a1a1a' }}>Select a team member or role</h2>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>
              Click a role, task type, or team member to see their responsibilities across all workflows.
            </p>
          </div>
        ) : selectedRole || selectedTaskType ? (
          /* Role or task type view */
          <div>
            {selectedRole && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: roleDotColors[normalizeRole(selectedRole)], border: normalizeRole(selectedRole) === 'automated' ? '1px solid #ccc' : 'none' }} />
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>
                    {selectedRole}
                  </h2>
                </div>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>
                  All tasks assigned to the {selectedRole} role
                </p>
              </>
            )}

            {selectedTaskType && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#1a1a1a' }}>
                  {selectedTaskType === 'all' ? 'All Tasks' : selectedTaskType + ' Tasks'}
                </h2>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>
                  {selectedTasks.length} tasks
                </p>
              </>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 40, marginBottom: 32, alignItems: 'center', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>Tasks</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{selectedTasks.length}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>Workflows</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{selectedTasksMetadata.uniqueWorkflows}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>Systems</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{selectedTasksMetadata.uniqueSystems}</div>
              </div>
            </div>

            {selectedRole && (
              <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #f0ede8' }}>
                {ROLE_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setMemberTab(tab.key)}
                    style={{
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: memberTab === tab.key ? 700 : 500,
                      color: memberTab === tab.key ? '#1a1a1a' : '#999',
                      background: 'none',
                      border: 'none',
                      borderBottom: memberTab === tab.key ? '2px solid #1a1a1a' : '2px solid transparent',
                      cursor: 'pointer',
                      marginBottom: -2,
                    }}
                  >{tab.label}</button>
                ))}
              </div>
            )}

            {selectedTasks.length === 0 ? (
              <p style={{ color: '#999', fontSize: 14 }}>No tasks found.</p>
            ) : (
              <div>
                {memberTab === 'overview' && renderRoleOverview()}
                {memberTab === 'job-description' && renderRoleJobDescription()}
                {memberTab === '30-60-90' && renderRole306090()}
                {memberTab === 'accountability' && renderRoleAccountability()}
                {memberTab === 'training' && renderRoleTraining()}
              </div>
            )}
          </div>
        ) : selectedMember ? (
          /* Member detail view with tabs */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                {selectedMember?.name || 'Me'} ({selectedMember?.role})
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleOpenForm(selectedMember)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, background: '#f3f2f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleRemoveMember(selectedMember.id)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, background: 'none', border: '1px solid #e53935', borderRadius: 6, cursor: 'pointer', color: '#e53935' }}>Remove</button>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
              {selectedMember?.email ? selectedMember.email : '(no email)'}
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 40, marginBottom: 32, alignItems: 'center', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>Tasks</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{selectedTasks.length}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>Workflows</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{selectedTasksMetadata.uniqueWorkflows}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>Systems</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{selectedTasksMetadata.uniqueSystems}</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #f0ede8' }}>
              {MEMBER_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setMemberTab(tab.key)}
                  style={{
                    padding: '10px 16px',
                    fontSize: 13,
                    fontWeight: memberTab === tab.key ? 700 : 500,
                    color: memberTab === tab.key ? '#1a1a1a' : '#999',
                    background: 'none',
                    border: 'none',
                    borderBottom: memberTab === tab.key ? '2px solid #1a1a1a' : '2px solid transparent',
                    cursor: 'pointer',
                    marginBottom: -2,
                  }}
                >{tab.label}</button>
              ))}
            </div>

            {memberTab === 'overview' && renderMemberOverview()}
            {memberTab === 'job-description' && renderMemberJobDescription()}
            {memberTab === '30-60-90' && renderMember306090()}
            {memberTab === 'training' && renderMemberTraining()}
          </div>
        ) : null}
      </div>

      {/* ADD/EDIT MEMBER MODAL */}
      {isFormOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#1a1a1a' }}>
              {editingId ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Name *', field: 'name', placeholder: 'Full name' },
                { label: 'Email', field: 'email', placeholder: 'email@example.com', type: 'email' },
                { label: 'Phone', field: 'phone', placeholder: '(555) 123-4567', type: 'tel' },
                { label: 'Brokerage', field: 'brokerage', placeholder: 'Brokerage name' },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>{label}</label>
                  <input
                    type={type || 'text'}
                    value={formData[field] || ''}
                    onChange={e => handleInputChange(field, e.target.value)}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e2db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Role</label>
                <select
                  value={formData.role}
                  onChange={e => handleInputChange('role', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e2db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                >
                  {roleOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>City</label>
                  <input value={formData.city || ''} onChange={e => handleInputChange('city', e.target.value)} placeholder="City" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e2db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>State</label>
                  <input value={formData.state || ''} onChange={e => handleInputChange('state', e.target.value)} placeholder="State" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e2db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e2db' }}>
                <button onClick={handleCloseForm} style={{ padding: '10px 20px', background: '#f0ede8', color: '#1a1a1a', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveForm} style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
