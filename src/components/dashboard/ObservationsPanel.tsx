import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import {
  ClipboardCheck, Plus, CheckCircle2
} from 'lucide-react';
import './DashboardPanels.css';

export default function ObservationsPanel() {
  const { drains, observations, addObservation } = useData();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [drainId, setDrainId] = useState<string>(drains[0]?.id || '');
  const [plasticLevel, setPlasticLevel] = useState<'none' | 'light' | 'moderate' | 'heavy' | 'severe'>('moderate');
  const [plasticWeight, setPlasticWeight] = useState<string>('');
  const [waterFlow, setWaterFlow] = useState<'dry' | 'trickle' | 'normal' | 'high' | 'flooding'>('dry');
  const [drainCondition, setDrainCondition] = useState<string>('Grating intact, sediment buildup present');
  const [notes, setNotes] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDrain = drains.find(d => d.id === drainId);
    if (!selectedDrain) return;

    addObservation({
      drainId: selectedDrain.id,
      drainName: selectedDrain.name,
      observedBy: user?.fullName || 'Municipal Field Inspector',
      plasticLevel,
      plasticWeight: plasticWeight ? parseFloat(plasticWeight) : undefined,
      notes: notes.trim() || 'Visual survey completed prior to storm.',
      drainCondition,
      waterFlow,
    });

    setSuccessMessage(`Field observation for ${selectedDrain.name} successfully logged.`);
    setNotes('');
    setPlasticWeight('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const filteredObservations = observations.filter(obs => {
    if (levelFilter !== 'all' && obs.plasticLevel !== levelFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        obs.drainId.toLowerCase().includes(q) ||
        obs.drainName.toLowerCase().includes(q) ||
        obs.observedBy.toLowerCase().includes(q) ||
        obs.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="panel-container">
      {/* ── Top Transparency Banner ── */}
      <div className="transparency-banner">
        <span className="transparency-banner__badge">Empirical Calibration</span>
        <span>
          <strong>Ground-Truth Feedback Loop:</strong> Field inspection records validate and calibrate the heuristic risk scoring baseline. Historical entries include synthetic demonstration logs alongside user-submitted entries.
        </span>
      </div>

      {/* ── Panel Header ── */}
      <header className="panel-header">
        <div className="panel-header__titles">
          <span className="panel-header__question">Field Validation Desk</span>
          <h1 className="panel-header__title">Observations & Ground-Truth Registry</h1>
          <p className="panel-header__subtitle">
            Log physical curb inspections and recorded plastic mass to provide ground truth for heuristic calibration.
          </p>
        </div>
      </header>

      {/* ── Form & Calibration Guidelines Grid ── */}
      <div className="two-col-grid">
        {/* Left: Log Observation Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ClipboardCheck size={20} style={{ color: 'var(--color-forest)' }} />
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
              Log Field Inspection Entry
            </h2>
          </div>

          {successMessage && (
            <div style={{ background: 'var(--risk-low-bg)', color: isDark ? 'var(--accent-sage)' : '#4A6043', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.813rem' }}>
              <CheckCircle2 size={16} />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Drain Location:</label>
              <select
                value={drainId}
                onChange={e => setDrainId(e.target.value)}
                className="form-input"
              >
                {drains.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.id} — {d.name} ({d.area})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Plastic Accumulation Level:</label>
                <select
                  value={plasticLevel}
                  onChange={e => setPlasticLevel(e.target.value as any)}
                  className="form-input"
                >
                  <option value="none">None — Clear inlet</option>
                  <option value="light">Light — Isolated wrappers</option>
                  <option value="moderate">Moderate — Regular debris</option>
                  <option value="heavy">Heavy — Dense packaging accumulation</option>
                  <option value="severe">Severe — Grate choked by plastic</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Measured Mass (kg, Optional):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 14.5"
                  value={plasticWeight}
                  onChange={e => setPlasticWeight(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Water Flow State:</label>
                <select
                  value={waterFlow}
                  onChange={e => setWaterFlow(e.target.value as any)}
                  className="form-input"
                >
                  <option value="dry">Dry — Stagnant surface</option>
                  <option value="trickle">Trickle — Minor trickle</option>
                  <option value="normal">Normal — Base dry flow</option>
                  <option value="high">High — Swift runoff flow</option>
                  <option value="flooding">Flooding — Grate submerged</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Grate / Culvert Physical State:</label>
                <select
                  value={drainCondition}
                  onChange={e => setDrainCondition(e.target.value)}
                  className="form-input"
                >
                  <option value="Grating intact, sediment buildup present">Grating intact, sediment buildup present</option>
                  <option value="Clear aperture, good structural condition">Clear aperture, good condition</option>
                  <option value="Partially obstructed by vegetation">Partially obstructed by vegetation</option>
                  <option value="Severe siltation, damaged grate bars">Severe siltation, damaged grate bars</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Field Inspector Observations & Notes:</label>
              <textarea
                rows={3}
                placeholder="Document specific waste types (bottles, multi-layer pouches, thermocol) and surrounding footpath conditions..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
              <Plus size={16} />
              Submit Observation Entry
            </button>
          </form>
        </div>

        {/* Right: Validation Protocol & Scientific Rationale */}
        <div className="card" style={{ background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
            Calibration Methodology & Role of Field Data
          </h3>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.55 }}>
            Heuristic rules provide initial pre-storm priority, but empirical field observations are essential for long-term predictive accuracy:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--color-surface)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <strong style={{ fontSize: '0.813rem', color: 'var(--color-forest)', display: 'block', marginBottom: '3px' }}>
                1. Ground-Truth Mass Correlation
              </strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                Comparing estimated risk indices against actual intercepted plastic mass (kg) helps adjust the Land Use Exposure weight (currently provisional 20%).
              </p>
            </div>

            <div style={{ background: 'var(--color-surface)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <strong style={{ fontSize: '0.813rem', color: 'var(--color-forest)', display: 'block', marginBottom: '3px' }}>
                2. False-Positive Suppression
              </strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                Drains recently swept or mechanically cleared are flagged with reduced vulnerability for 48 hours following verified log submission.
              </p>
            </div>

            <div style={{ background: 'var(--color-surface)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <strong style={{ fontSize: '0.813rem', color: 'var(--color-forest)', display: 'block', marginBottom: '3px' }}>
                3. Distinction Between Observed and Synthetic Data
              </strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                Demonstration baseline records are flagged separately from authenticated municipal surveyor entries to maintain audit integrity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ground-Truth Historical Ledger ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
              Field Inspection History Ledger
            </h3>
            <p style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)' }}>
              Historical observation registry showing accumulation levels, flow states, and logged plastic masses.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search drain or inspector..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="table-search-input"
            />
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Accumulation Levels</option>
              <option value="severe">Severe Only</option>
              <option value="heavy">Heavy Only</option>
              <option value="moderate">Moderate Only</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Drain Structure</th>
                <th>Plastic Level</th>
                <th>Logged Mass</th>
                <th>Flow State</th>
                <th>Inspector</th>
                <th>Timestamp</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredObservations.map(obs => (
                <tr key={obs.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-forest)' }}>{obs.id}</td>
                  <td>
                    <strong>{obs.drainName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {obs.drainId} &bull; {obs.drainCondition}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: obs.plasticLevel === 'severe' 
                        ? (isDark ? 'rgba(209, 124, 100, 0.2)' : '#FDF2F0') 
                        : obs.plasticLevel === 'heavy' 
                          ? (isDark ? 'rgba(208, 178, 122, 0.2)' : '#FAF3EA') 
                          : (isDark ? 'rgba(131, 149, 120, 0.2)' : '#F4F7F2'),
                      color: obs.plasticLevel === 'severe' 
                        ? (isDark ? '#E59882' : '#A04030') 
                        : obs.plasticLevel === 'heavy' 
                          ? (isDark ? '#E0C895' : '#B9654B') 
                          : (isDark ? '#A8B79E' : '#53664D'),
                      textTransform: 'capitalize'
                    }}>
                      {obs.plasticLevel}
                    </span>
                  </td>
                  <td>
                    {obs.plasticWeight ? (
                      <strong>{obs.plasticWeight} kg</strong>
                    ) : (
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Visual only</span>
                    )}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{obs.waterFlow}</td>
                  <td style={{ fontSize: '0.813rem' }}>{obs.observedBy}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {obs.timestamp.slice(0, 10)} {obs.timestamp.slice(11, 16)}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.688rem', padding: '2px 6px', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      {obs.id.startsWith('OBS-') ? 'Demonstration' : 'User Entry'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
