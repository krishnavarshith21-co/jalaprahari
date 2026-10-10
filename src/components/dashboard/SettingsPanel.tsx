import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import {
  RefreshCw, Download, CheckCircle2, FileText
} from 'lucide-react';
import './DashboardPanels.css';

export default function SettingsPanel() {
  const {
    monitoringHealth,
    setMonitoringInterval,
    triggerDataRefresh,
    drainsSortedByRisk,
    actions
  } = useData();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [successNote, setSuccessNote] = useState('');

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerDataRefresh();
      setSuccessNote('Telemetry state synchronized with demonstration store.');
      setTimeout(() => setSuccessNote(''), 3500);
    } catch {
      setSuccessNote('Refresh completed using local in-memory store.');
      setTimeout(() => setSuccessNote(''), 3500);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportJSON = () => {
    const reportData = {
      platform: 'Jalaprahari First-Flush Plastic Risk Intelligence (जलप्रहरी)',
      exportedAt: new Date().toISOString(),
      monitoringHealth,
      rankedDrains: drainsSortedByRisk.map(d => ({
        id: d.id,
        name: d.name,
        area: d.area,
        coordinates: { lat: d.lat, lng: d.lng },
        catchmentAreaKm2: d.catchmentArea,
        condition: d.condition,
        riskIndex: d.risk.riskIndex,
        riskLevel: d.risk.riskLevel,
        leadingFactor: d.risk.leadingFactor,
        recommendedAction: d.risk.recommendedAction,
        factors: d.risk.factors.map(f => ({
          name: f.name,
          score: Math.round(f.normalizedScore),
          weight: f.weight,
          contribution: Number((f.normalizedScore * f.weight).toFixed(1)),
          provenance: f.dataSource
        }))
      })),
      interventions: actions,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jalaprahari-risk-dossier-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Drain ID', 'Drain Name', 'Corridor', 'Latitude', 'Longitude', 'Catchment Area (km2)', 'Condition', 'Risk Index (0-100)', 'Risk Level', 'Leading Factor', 'Recommended Action'];
    const rows = drainsSortedByRisk.map(d => [
      d.id,
      `"${d.name}"`,
      `"${d.area}"`,
      d.lat,
      d.lng,
      d.catchmentArea,
      d.condition,
      d.risk.riskIndex,
      d.risk.riskLevel,
      `"${d.risk.leadingFactor}"`,
      `"${d.risk.recommendedAction}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jalaprahari-ranked-drains-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel-container">
      {/* ── Top Transparency Banner ── */}
      <div className="transparency-banner">
        <span className="transparency-banner__badge">System Transparency</span>
        <span>
          <strong>Operational Parameters:</strong> Real-time engine health, telemetry connections, and background scheduling cadence. All weights and parameters are exposed for municipal review.
        </span>
      </div>

      {/* ── Panel Header ── */}
      <header className="panel-header">
        <div className="panel-header__titles">
          <span className="panel-header__question">Platform Health & Telemetry</span>
          <h1 className="panel-header__title">Configuration & Health Center</h1>
          <p className="panel-header__subtitle">
            Manage background data polling, inspect connected data source adapters, and export auditable compliance reports.
          </p>
        </div>
        <div className="panel-header__actions">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Trigger Data Sync'}
          </button>
        </div>
      </header>

      {successNote && (
        <div style={{ background: 'var(--risk-low-bg)', color: 'var(--color-text-primary)', border: '1px solid var(--border-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.813rem' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--accent-forest)' }} />
          {successNote}
        </div>
      )}

      {/* ── Health & Telemetry Grid ── */}
      <div className="two-col-grid">
        {/* Left: Background Service Health */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
              Monitoring Service Health
            </h3>
            <span className="risk-badge risk-badge--low">
              <span className="status-dot status-dot--active" /> SIMULATION ACTIVE
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--color-surface-secondary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span className="metric-label">Operational Mode</span>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-forest)' }}>
                SYNTHETIC DEMO SCENARIO
              </div>
            </div>
            <div>
              <span className="metric-label">Data Freshness</span>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                In-Memory Demo State
              </div>
            </div>
            <div>
              <span className="metric-label">Last Successful Refresh</span>
              <div style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)' }}>
                {new Date(monitoringHealth.lastSuccessfulRefresh).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
              </div>
            </div>
            <div>
              <span className="metric-label">Next Scheduled Cycle</span>
              <div style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)' }}>
                {new Date(monitoringHealth.nextScheduledRefresh).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
              </div>
            </div>
          </div>

          {/* Refresh Interval Selector */}
          <div className="form-group">
            <label className="form-label">
              Background Polling Cadence (In-Memory Scheduler · No daemon):
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[15, 30, 60].map(mins => (
                <button
                  key={mins}
                  className={`btn btn-sm ${monitoringHealth.monitoringInterval === mins ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setMonitoringInterval(mins)}
                  style={{ border: monitoringHealth.monitoringInterval === mins ? 'none' : undefined }}
                >
                  Every {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          {/* Explicit Disclosure Box */}
          <div style={{ background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <strong>Telemetry Mode Disclosure:</strong> Jalaprahari is currently running on an illustrative demonstration baseline. Weather inputs simulate an impending 28 mm/hr storm scenario. Live physical IoT radar / acoustic level sensors are not configured in this prototype instance.
          </div>
        </div>

        {/* Right: Data Sources & Connected Adapters */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
            Configured Data Adapters & Layers
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'var(--color-surface-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.813rem', display: 'block' }}>Weather Forecast Adapter</strong>
                <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>Synthetic Demo Radar Feed &bull; 15m cadence</span>
              </div>
              <span className="risk-badge risk-badge--moderate" style={{ fontSize: '0.688rem' }}>SYNTHETIC DEMO FEED</span>
            </div>

            <div style={{ background: 'var(--color-surface-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.813rem', display: 'block' }}>Drainage GIS Infrastructure Registry</strong>
                <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>8 Primary & Secondary Inlets &bull; Bangalore Corridor</span>
              </div>
              <span className="risk-badge" style={{ fontSize: '0.688rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>IN-MEMORY GIS REGISTRY</span>
            </div>

            <div style={{ background: 'var(--color-surface-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.813rem', display: 'block' }}>Field Inspection Logbook</strong>
                <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>Ground-truth observations registry &bull; In-memory store</span>
              </div>
              <span className="risk-badge" style={{ fontSize: '0.688rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>LOCAL BROWSER & API STORE</span>
            </div>

            <div style={{ background: 'var(--color-surface-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)', display: 'block' }}>Empirical Ultrasonic Water Depth Sensors</strong>
                <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>Hardware telemetry adapter</span>
              </div>
              <span style={{ fontSize: '0.688rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>NOT CONFIGURED</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Export & Compliance Section ── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
          Municipal Compliance & Data Export
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Download auditable first-flush risk reports for environmental regulatory filings, municipal budget planning, or offline GIS analysis.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportJSON}
            className="btn btn-primary btn-sm"
          >
            <Download size={14} />
            Export Full Risk Intelligence Dossier (JSON)
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
          >
            <FileText size={14} />
            Export Ranked Inlets (CSV)
          </button>
        </div>
      </div>

      {/* ── User & Organization Profile ── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
          Session Profile & Role Access
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', background: 'var(--color-surface-secondary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
          <div>
            <span className="metric-label">Authenticated Operator</span>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.fullName || 'Municipal Operator'}</div>
          </div>
          <div>
            <span className="metric-label">Access Role</span>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>{user?.role || 'Stormwater Engineer'}</div>
          </div>
          <div>
            <span className="metric-label">Assigned Jurisdiction</span>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>BBMP South-East Wards</div>
          </div>
          <div>
            <span className="metric-label">Platform Build</span>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-forest)' }}>v1.0.0 Research Preview</div>
          </div>
        </div>
      </div>
    </div>
  );
}
