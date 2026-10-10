import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import {
  AlertTriangle, Scale, Check
} from 'lucide-react';
import './DashboardPanels.css';

export default function InterventionPlanner() {
  const {
    actions,
    updateActionStatus,
    addActionNote,
    recordPlasticCollected,
    assignAction
  } = useData();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [plasticKg, setPlasticKg] = useState('');
  const [assigneeName, setAssigneeName] = useState('');

  const filteredActions = actions.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return a.status === 'pending' || a.status === 'acknowledged';
    if (activeTab === 'in-progress') return a.status === 'in-progress';
    if (activeTab === 'completed') return a.status === 'completed';
    return true;
  });

  const totalPlasticIntercepted = actions.reduce((sum, a) => sum + (a.plasticCollected || 0), 0);
  const pendingActions = actions.filter(a => a.status === 'pending' || a.status === 'acknowledged');
  const primaryAction = pendingActions[0] || actions[0];

  const handleAdvanceStatus = (actionId: string, currentStatus: string) => {
    if (currentStatus === 'pending') updateActionStatus(actionId, 'acknowledged');
    else if (currentStatus === 'acknowledged') updateActionStatus(actionId, 'in-progress');
    else if (currentStatus === 'in-progress') updateActionStatus(actionId, 'completed');
  };

  const handleAddNote = (actionId: string) => {
    if (!newNote.trim()) return;
    addActionNote(actionId, newNote.trim());
    setNewNote('');
  };

  const handleRecordPlastic = (actionId: string) => {
    const val = parseFloat(plasticKg);
    if (isNaN(val) || val <= 0) return;
    recordPlasticCollected(actionId, val);
    setPlasticKg('');
  };

  const handleAssign = (actionId: string) => {
    if (!assigneeName.trim()) return;
    assignAction(actionId, assigneeName.trim());
    setAssigneeName('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="risk-badge risk-badge--low">COMPLETED</span>;
      case 'in-progress':
        return <span className="risk-badge risk-badge--moderate">IN PROGRESS</span>;
      case 'acknowledged':
        return <span className="risk-badge risk-badge--high">ACKNOWLEDGED</span>;
      default:
        return <span className="risk-badge risk-badge--very-high">PENDING</span>;
    }
  };

  return (
    <div className="panel-container">
      {/* ── Top Transparency Banner ── */}
      <div className="transparency-banner">
        <span className="transparency-banner__badge">Question 04 — WHAT FIRST?</span>
        <span>
          <strong>Municipal Intervention Queue:</strong> Prioritized work orders generated from risk calculations. Intercept accumulated debris at storm grates before water flow mobilizes plastic into subterranean conduits.
        </span>
      </div>

      {/* ── Panel Header ── */}
      <header className="panel-header">
        <div className="panel-header__titles">
          <span className="panel-header__question">Preventive Operations</span>
          <h1 className="panel-header__title">Municipal Action Planner</h1>
          <p className="panel-header__subtitle">
            Ranked preventive queue for BBMP and stormwater engineers. Dispatch crews before the rain starts to achieve maximum plastic interception with minimal downstream loss.
          </p>
        </div>
      </header>

      {/* ── Safety Constraints Alert ── */}
      <div style={{
        background: isDark ? 'rgba(208, 178, 122, 0.12)' : '#FAF5E8',
        border: isDark ? '1px solid rgba(208, 178, 122, 0.3)' : '1px solid #EADBBE',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <AlertTriangle size={20} style={{ color: isDark ? '#D0B27A' : '#8C6F38', flexShrink: 0 }} />
        <div style={{ fontSize: '0.813rem', color: isDark ? 'var(--color-text-primary)' : '#634E23' }}>
          <strong>Field Safety Protocol:</strong> Preventive debris clearing must cease if rainfall exceeds 15 mm/hr or water depth in open drains exceeds 0.2 meters. Never deploy single operators into confined culverts.
        </div>
      </div>

      {/* ── Top Priority Spotlight Focus ── */}
      {primaryAction && (
        <div className="card" style={{ background: 'var(--color-surface-secondary)', border: '1.5px solid var(--color-border)', padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.688rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: '#A04030', color: '#FFFFFF', letterSpacing: '0.04em' }}>
                  URGENT DISPATCH TARGET
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                  Work Order: {primaryAction.id} &bull; Window: {primaryAction.eventWindow}
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                {primaryAction.drainName} ({primaryAction.drainId})
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              {getStatusBadge(primaryAction.status)}
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Assigned: <strong>{primaryAction.assignee || 'Unassigned'}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div>
              <span className="metric-label">Priority Rationale</span>
              <p style={{ fontSize: '0.813rem', color: 'var(--color-text-primary)', marginTop: '2px', lineHeight: 1.45 }}>
                {primaryAction.reason}
              </p>
            </div>
            <div>
              <span className="metric-label">Recommended Preventive Directive</span>
              <p style={{ fontSize: '0.813rem', color: 'var(--color-text-heading)', fontWeight: 600, marginTop: '2px', lineHeight: 1.45 }}>
                {primaryAction.recommendedAction}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Location: <strong>{primaryAction.area}</strong> &bull; Urgency: <strong>{primaryAction.urgency}</strong>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {primaryAction.status !== 'completed' && (
                <button
                  onClick={() => handleAdvanceStatus(primaryAction.id, primaryAction.status)}
                  className="btn btn-primary btn-sm"
                >
                  <Check size={14} />
                  {primaryAction.status === 'pending'
                    ? 'Acknowledge Work Order'
                    : primaryAction.status === 'acknowledged'
                    ? 'Start Field Inspection'
                    : 'Mark Intervention Completed'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Status Tabs & Quick Queue ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 3, gap: 2 }}>
          <button
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', border: 'none', fontSize: '0.813rem' }}
            onClick={() => setActiveTab('all')}
          >
            All Work Orders ({actions.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', border: 'none', fontSize: '0.813rem' }}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingActions.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'in-progress' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', border: 'none', fontSize: '0.813rem' }}
            onClick={() => setActiveTab('in-progress')}
          >
            In Progress ({actions.filter(a => a.status === 'in-progress').length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', border: 'none', fontSize: '0.813rem' }}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({actions.filter(a => a.status === 'completed').length})
          </button>
        </div>

        <div style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Scale size={15} style={{ color: 'var(--color-forest)' }} />
          <span>Intercepted Plastic Mass: <strong>{totalPlasticIntercepted.toFixed(1)} kg</strong></span>
        </div>
      </div>

      {/* ── Work Queue Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Target Drain</th>
                <th>Corridor</th>
                <th>Recommended Action</th>
                <th>Urgency</th>
                <th>Assigned Crew</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.map(action => (
                <tr
                  key={action.id}
                  className={action.id === selectedActionId ? 'active' : ''}
                  onClick={() => setSelectedActionId(action.id === selectedActionId ? null : action.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: 600, color: 'var(--color-forest)' }}>{action.id}</td>
                  <td>
                    <strong>{action.drainName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{action.drainId}</div>
                  </td>
                  <td>{action.area}</td>
                  <td style={{ maxWidth: 300, fontSize: '0.813rem' }}>{action.recommendedAction}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: action.urgency === 'immediate' 
                        ? (isDark ? '#D17C64' : '#A04030') 
                        : (isDark ? '#D0B27A' : '#8C6F38')
                    }}>
                      {action.urgency === 'immediate' ? 'Immediate' : 'Within 2h'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.813rem' }}>{action.assignee || 'Unassigned'}</td>
                  <td>{getStatusBadge(action.status)}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvanceStatus(action.id, action.status);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      {action.status === 'pending'
                        ? 'Ack'
                        : action.status === 'acknowledged'
                        ? 'Start'
                        : action.status === 'in-progress'
                        ? 'Complete'
                        : 'Done'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detailed Action Inspector / Update Drawer ── */}
      {selectedActionId && (() => {
        const action = actions.find(a => a.id === selectedActionId);
        if (!action) return null;

        return (
          <div className="card" style={{ background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="metric-label">Selected Work Order Details</span>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                  {action.id} &bull; {action.drainName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedActionId(null)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Close Drawer
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* Field Notes & Logging */}
              <div style={{ background: 'var(--color-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Field Progress Log
                </span>
                {action.notes.length === 0 ? (
                  <p style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    No field notes recorded yet.
                  </p>
                ) : (
                  <ul style={{ paddingLeft: '16px', fontSize: '0.813rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {action.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <input
                    type="text"
                    placeholder="Add progress note..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.813rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                  />
                  <button
                    onClick={() => handleAddNote(action.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 12px' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Plastic Mass Logging & Crew Assignment */}
              <div style={{ background: 'var(--color-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Log Intercepted Plastic Mass (kg)
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      placeholder="e.g. 24.5"
                      value={plasticKg}
                      onChange={e => setPlasticKg(e.target.value)}
                      style={{ width: 120, padding: '6px 10px', fontSize: '0.813rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                    <button
                      onClick={() => handleRecordPlastic(action.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Record Mass
                    </button>
                    {action.plasticCollected && (
                      <span style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--color-forest)', alignSelf: 'center' }}>
                        Logged: {action.plasticCollected} kg
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Assign Response Crew
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. Ward 150 Squad Bravo"
                      value={assigneeName}
                      onChange={e => setAssigneeName(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', fontSize: '0.813rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                    <button
                      onClick={() => handleAssign(action.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
