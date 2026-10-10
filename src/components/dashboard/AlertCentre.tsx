import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, Clock, Filter, Check, Eye, CheckCircle2
} from 'lucide-react';
import './DashboardPanels.css';

export default function AlertCentre() {
  const { alerts, acknowledgeAlert, resolveAlert, selectDrain } = useData();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    return true;
  });

  const countByStatus = {
    new: alerts.filter(a => a.status === 'new').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  const handleAcknowledge = (id: string) => {
    acknowledgeAlert(id, user?.fullName || 'Municipal Operator');
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'very-high': return isDark ? '#D17C64' : '#A04030';
      case 'high': return isDark ? '#C4775D' : '#B9654B';
      case 'moderate': return isDark ? '#D0B27A' : '#C4A45A';
      default: return isDark ? '#839578' : '#53664D';
    }
  };

  return (
    <div className="panel-container">
      {/* ── Top Transparency Banner ── */}
      <div className="transparency-banner">
        <span className="transparency-banner__badge">Automated Surveillance</span>
        <span>
          <strong>Municipal Alert Engine:</strong> Evaluates incoming weather forecasts against drain risk models. Deduplication algorithms suppress redundant warnings for identical inlets within the same storm cycle. Alerts represent synthetic prototype notifications.
        </span>
      </div>

      {/* ── Panel Header ── */}
      <header className="panel-header">
        <div className="panel-header__titles">
          <span className="panel-header__question">Tactical Incident Desk</span>
          <h1 className="panel-header__title">Municipal Alert Centre</h1>
          <p className="panel-header__subtitle">
            Chronological notification stream for stormwater drainage structures exceeding high plastic mobilization thresholds prior to rainfall onset.
          </p>
        </div>
        <div className="panel-header__actions">
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot status-dot--active" />
            Background Scheduler: Active (30m Interval &bull; Synthetic Demo)
          </span>
        </div>
      </header>

      {/* ── Status Tabs / Metrics Row ── */}
      <div className="metrics-row">
        <div
          className="metric-card"
          style={{ cursor: 'pointer', border: statusFilter === 'new' ? '2px solid var(--risk-very-high)' : undefined }}
          onClick={() => setStatusFilter(statusFilter === 'new' ? 'all' : 'new')}
        >
          <div className="metric-card__header">
            <span>New Actionable Alerts</span>
            <AlertTriangle size={16} style={{ color: 'var(--risk-very-high)' }} />
          </div>
          <div className="metric-card__value-wrap">
            <span className="metric-card__value" style={{ color: countByStatus.new > 0 ? 'var(--risk-very-high)' : undefined }}>
              {countByStatus.new}
            </span>
          </div>
          <span className="metric-card__subtext">Awaiting municipal crew dispatch</span>
        </div>

        <div
          className="metric-card"
          style={{ cursor: 'pointer', border: statusFilter === 'acknowledged' ? '2px solid var(--risk-moderate)' : undefined }}
          onClick={() => setStatusFilter(statusFilter === 'acknowledged' ? 'all' : 'acknowledged')}
        >
          <div className="metric-card__header">
            <span>Acknowledged / Dispatched</span>
            <Clock size={16} style={{ color: 'var(--risk-moderate)' }} />
          </div>
          <div className="metric-card__value-wrap">
            <span className="metric-card__value">{countByStatus.acknowledged}</span>
          </div>
          <span className="metric-card__subtext">Field crews notified or en route</span>
        </div>

        <div
          className="metric-card"
          style={{ cursor: 'pointer', border: statusFilter === 'resolved' ? '2px solid var(--color-forest)' : undefined }}
          onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}
        >
          <div className="metric-card__header">
            <span>Resolved Incidents</span>
            <CheckCircle size={16} style={{ color: 'var(--color-forest)' }} />
          </div>
          <div className="metric-card__value-wrap">
            <span className="metric-card__value">{countByStatus.resolved}</span>
          </div>
          <span className="metric-card__subtext">Cleared before first-flush wash-off</span>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="filter-bar">
        <div className="filter-group">
          <Filter size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>SEVERITY:</span>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Severity Levels</option>
            <option value="very-high">Very High Only</option>
            <option value="high">High Only</option>
            <option value="moderate">Moderate Only</option>
          </select>
        </div>

        <div className="filter-group">
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>STATUS:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Incident States</option>
            <option value="new">New ({countByStatus.new})</option>
            <option value="acknowledged">Acknowledged ({countByStatus.acknowledged})</option>
            <option value="resolved">Resolved ({countByStatus.resolved})</option>
          </select>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
          Displaying <strong>{filteredAlerts.length}</strong> incidents in feed
        </span>
      </div>

      {/* ── Professional Incident Chronological Feed ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--color-forest)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>No Matching Alerts</h3>
            <p style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              All notifications in this category have been acknowledged or filtered.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const sevColor = getSeverityColor(alert.severity);
            const isNew = alert.status === 'new';
            const isAck = alert.status === 'acknowledged';

            return (
              <div
                key={alert.id}
                className="card"
                style={{
                  padding: '18px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderLeft: `4px solid ${sevColor}`,
                  background: isNew 
                    ? 'var(--color-surface)' 
                    : isAck 
                      ? (isDark ? 'var(--color-surface-secondary)' : '#FAF8F3') 
                      : (isDark ? 'var(--color-surface-elevated)' : '#F7F6F2'),
                  transition: 'box-shadow var(--transition-fast)'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.688rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: sevColor,
                      color: isDark ? '#111711' : '#FFFFFF',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}>
                      {alert.severity} SEVERITY
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                      {alert.drainId} &bull; {alert.drainName}
                    </span>
                    <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)', background: 'var(--color-surface-secondary)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      Event: {alert.eventId}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: isNew 
                        ? (isDark ? 'rgba(209, 124, 100, 0.2)' : '#FDF2F0') 
                        : isAck 
                          ? (isDark ? 'rgba(208, 178, 122, 0.2)' : '#F8F4EA') 
                          : (isDark ? 'rgba(131, 149, 120, 0.2)' : '#F0F6EE'),
                      color: isNew 
                        ? (isDark ? '#E59882' : '#A04030') 
                        : isAck 
                          ? (isDark ? '#E0C895' : '#8C6F38') 
                          : (isDark ? '#A8B79E' : '#53664D')
                    }}>
                      {alert.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {alert.createdAt.slice(11, 16)} IST
                    </span>
                  </div>
                </div>

                {/* Incident Narrative */}
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                  {alert.message}
                </p>

                {/* Audit & Workflow Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    {alert.acknowledgedBy ? (
                      <span>Acknowledged by <strong>{alert.acknowledgedBy}</strong> at {alert.acknowledgedAt?.slice(11, 16)} IST</span>
                    ) : (
                      <span>Alert ID: <strong>{alert.id}</strong> &bull; Auto-triggered by risk rule threshold (&ge;55)</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link
                      to="/dashboard/map"
                      onClick={() => selectDrain(alert.drainId)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                    >
                      <Eye size={12} />
                      Inspect Inlet
                    </Link>

                    {isNew && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                      >
                        <Check size={12} />
                        Acknowledge & Dispatch
                      </button>
                    )}

                    {isAck && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 12px', fontSize: '0.75rem', color: 'var(--color-forest)', borderColor: 'var(--color-forest)' }}
                      >
                        <CheckCircle size={12} />
                        Mark Cleared
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
