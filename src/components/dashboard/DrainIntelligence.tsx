import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import {
  ChevronDown, ChevronUp, Calculator, MapPin, ArrowRight
} from 'lucide-react';
import './DashboardPanels.css';

export default function DrainIntelligence() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    drains,
    assessments,
    selectedDrainId,
    selectedDrain,
    selectedAssessment,
    selectDrain,
    actions
  } = useData();

  const [showMathDetails, setShowMathDetails] = useState<boolean>(false);

  if (!selectedDrain || !selectedAssessment) {
    return <div>Loading intelligence dossier...</div>;
  }

  const relatedAction = actions.find(a => a.drainId === selectedDrain.id);

  // Prepare chart data for factor contributions
  const chartData = selectedAssessment.factors.map(f => ({
    name: f.name,
    score: Math.round(f.normalizedScore),
    weightPct: Math.round(f.weight * 100),
    weightedContribution: Math.round(f.normalizedScore * f.weight),
    raw: f.value,
    source: f.dataSource,
    desc: f.description,
  }));

  const getBarColor = (score: number) => {
    if (isDark) {
      if (score >= 75) return 'var(--risk-critical)';
      if (score >= 55) return 'var(--risk-high)';
      if (score >= 35) return 'var(--accent-brass)';
      return 'var(--accent-forest)';
    }
    if (score >= 75) return '#A04030';
    if (score >= 55) return '#B9654B';
    if (score >= 35) return '#C4A45A';
    return '#53664D';
  };

  // Sort factors by contribution to identify top 3 drivers
  const sortedFactors = [...selectedAssessment.factors].sort(
    (a, b) => (b.normalizedScore * b.weight) - (a.normalizedScore * a.weight)
  );
  const topThreeDrivers = sortedFactors.slice(0, 3);

  return (
    <div className="panel-container">
      {/* ── Top Transparency Banner ── */}
      <div className="transparency-banner">
        <span className="transparency-banner__badge">Question 03 — WHY?</span>
        <span>
          <strong>Explainable Attribution Engine:</strong> Transparent factor scoring with clear mathematical attribution. Scores are relative priority indexes (0–100), not percentage probabilities. All factor weights are initial heuristic baseline assumptions.
        </span>
      </div>

      {/* ── Panel Header with Quick Drain Selector ── */}
      <header className="panel-header">
        <div className="panel-header__titles">
          <span className="panel-header__question">Auditable Factor Breakdown</span>
          <h1 className="panel-header__title">Drain Risk Intelligence Profile</h1>
          <p className="panel-header__subtitle">
            Scientific evidence dossier for <strong>{selectedDrain.name}</strong>. Inspect the physical, meteorological, and land-use factors that elevate this inlet's priority.
          </p>
        </div>

        {/* Quick Drain Selector Dropdown */}
        <div className="panel-header__actions">
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            INSPECT DRAIN:
          </label>
          <select
            value={selectedDrainId}
            onChange={e => selectDrain(e.target.value)}
            className="filter-select"
            style={{ fontWeight: 600, padding: '8px 14px' }}
          >
            {drains.map(d => {
              const a = assessments.find(x => x.drainId === d.id);
              return (
                <option key={d.id} value={d.id}>
                  {d.id} — {d.name} ({a?.riskIndex}/100)
                </option>
              );
            })}
          </select>
        </div>
      </header>

      {/* ── Primary Score & Identity Dossier Card ── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase' }}>
                {selectedDrain.id} &bull; {selectedDrain.area}
              </span>
              <span className={`risk-badge risk-badge--${selectedAssessment.riskLevel}`}>
                {selectedAssessment.riskLevel.toUpperCase()} RISK
              </span>
              <span style={{ fontSize: '0.688rem', background: 'var(--color-surface-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                Confidence: {selectedAssessment.confidence.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>
                Coordinates: {selectedDrain.lat.toFixed(4)}°N, {selectedDrain.lng.toFixed(4)}°E
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
              {selectedDrain.name}
            </h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              <span>Watershed: <strong style={{ color: 'var(--color-text-heading)' }}>{selectedDrain.catchmentName || 'Koramangala-Challaghatta (K-C) Valley'}</strong></span>
              <span>Sub-Basin: <strong style={{ color: 'var(--color-text-heading)' }}>{selectedDrain.subBasin || 'Primary Trunk Corridor'}</strong></span>
              <span>Receiving Sink: <strong style={{ color: selectedDrain.hydrologicalConnectionVerified ? 'var(--color-brass)' : 'var(--color-text-heading)' }}>{selectedDrain.receivingWaterbody || 'Bellandur Lake'}</strong></span>
              <span>Network: <strong style={{ color: selectedDrain.hydrologicalConnectionVerified ? 'var(--accent-brass)' : 'inherit' }}>{selectedDrain.hydrologicalConnectionVerified ? '✓ Verified Trunk Canal' : 'DEM Sub-Basin Feeder'}</strong></span>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.688rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', display: 'block' }}>
                Relative Priority Index
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-body)', color: 'var(--color-text-heading)', lineHeight: 1 }}>
                {selectedAssessment.riskIndex}
                <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}> / 100</span>
              </div>
              <span style={{ fontSize: '0.625rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: 2 }}>
                Relative heuristic ranking
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostic Narrative Rationale */}
        <div style={{ background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-forest)', display: 'block', marginBottom: '6px' }}>
            Plain-English Diagnostic Summary
          </span>
          <p style={{ fontSize: '0.938rem', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
            {selectedAssessment.explanation}
          </p>
        </div>

        {/* Top 3 Leading Factor Driver Chips */}
        <div>
          <span style={{ fontSize: '0.688rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
            Primary Drivers (Descending Mathematical Contribution)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {topThreeDrivers.map((driver, idx) => {
              const contribution = Math.round(driver.normalizedScore * driver.weight);
              return (
                <div key={driver.name} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.688rem', fontWeight: 700, color: 'var(--color-brass)' }}>
                      DRIVER #0{idx + 1}
                    </span>
                    <span style={{ fontSize: '0.813rem', fontWeight: 700, color: getBarColor(driver.normalizedScore) }}>
                      +{contribution} pts ({Math.round(driver.normalizedScore)}/100)
                    </span>
                  </div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--color-text-heading)' }}>
                    {driver.name}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {driver.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Factor Breakdown & Visual Chart ── */}
      <div className="two-col-grid">
        {/* Left: Recharts Factor Contribution Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
              Normalized Factor Scores & Provisional Weights
            </h3>
            <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>
              0–100 Normalized Scale
            </span>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 110, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: isDark ? 'var(--text-secondary)' : '#565F52' }}
                  stroke={isDark ? 'var(--border-subtle)' : '#DDD6C8'}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: isDark ? 'var(--text-secondary)' : '#565F52' }}
                  stroke={isDark ? 'var(--border-subtle)' : '#DDD6C8'}
                  width={105}
                />
                <Tooltip
                  contentStyle={{
                    background: isDark ? 'var(--bg-surface-raised)' : '#FCFAF6',
                    borderColor: isDark ? 'var(--border-subtle)' : '#DDD6C8',
                    color: isDark ? 'var(--text-primary)' : '#2A3027',
                    borderRadius: '6px',
                    fontSize: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  }}
                  itemStyle={{ color: isDark ? 'var(--text-primary)' : '#2A3027' }}
                  formatter={(value: any, _name: any, item: any) => [
                    `${value} / 100 (Weight: ${item.payload.weightPct}%, Contrib: +${item.payload.weightedContribution} pts)`,
                    'Normalized Score'
                  ]}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Factors above 70 indicate elevated mobilization risk and trigger targeted municipal priority.
          </span>
        </div>

        {/* Right: Detailed Factor Provenance & Data Origin Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
            Data Source Provenance & Weights
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {selectedAssessment.factors.map(f => (
              <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.813rem', display: 'block' }}>{f.name}</span>
                  <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>
                    Source: {f.dataSource}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--color-forest)', display: 'block' }}>
                    {Math.round(f.weight * 100)}% Weight
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Score: {Math.round(f.normalizedScore)}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mathematical Audit Drawer (Expandable) ── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <button
          onClick={() => setShowMathDetails(!showMathDetails)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={18} style={{ color: 'var(--color-brass)' }} />
            <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
              Mathematical Formulation & Audit Trail
            </h3>
            <span style={{ fontSize: '0.688rem', background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)' }}>
              Formula & Attribution
            </span>
          </div>
          {showMathDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showMathDetails && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--color-surface-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.813rem', color: 'var(--color-text-heading)' }}>
              Composite Risk Index (R) = &Sigma; (Weight_i &times; Score_i)
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: '0.813rem' }}>
                <thead>
                  <tr>
                    <th>Factor Name</th>
                    <th>Normalized Score (s_i)</th>
                    <th>Provisional Weight (w_i)</th>
                    <th>Contribution (w_i &times; s_i)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAssessment.factors.map(f => {
                    const contribution = Number((f.normalizedScore * f.weight).toFixed(1));
                    return (
                      <tr key={f.name}>
                        <td style={{ fontWeight: 600 }}>{f.name}</td>
                        <td>{Math.round(f.normalizedScore)} / 100</td>
                        <td>{(f.weight * 100).toFixed(0)}% ({f.weight.toFixed(2)})</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>+{contribution} pts</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: 'var(--color-surface-secondary)', fontWeight: 700 }}>
                    <td>Total Composite Risk Index</td>
                    <td>—</td>
                    <td>100% (1.00)</td>
                    <td style={{ fontSize: '1rem', color: 'var(--color-clay-red)' }}>
                      {selectedAssessment.riskIndex} / 100 ({selectedAssessment.riskLevel.toUpperCase()})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, background: 'var(--color-bg)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <strong>Scientific Provenance Note:</strong> All weights shown above are Initial Heuristic Weights established for research and demonstration testing. They are not statistically calibrated against empirical field microplastic catch nets until field telemetry sensors are deployed.
            </div>
          </div>
        )}
      </div>

      {/* ── Recommended Preventive Intervention Directives ── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
            Recommended Municipal Action Directive
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Urgency: <strong>{selectedAssessment.riskLevel === 'very-high' ? 'Immediate Pre-Storm' : 'Within 4 Hours'}</strong>
          </span>
        </div>

        <p style={{ fontSize: '0.938rem', color: 'var(--color-text-primary)', lineHeight: 1.6, background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
          {selectedAssessment.recommendedAction}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {relatedAction ? (
            <div style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)' }}>
              Assigned Work Order: <strong>{relatedAction.id}</strong> &bull; Status: <strong style={{ textTransform: 'capitalize' }}>{relatedAction.status}</strong>
            </div>
          ) : (
            <div style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)' }}>
              No active work order dispatched for this location.
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/dashboard/map" className="btn btn-secondary btn-sm">
              <MapPin size={14} />
              Inspect on Risk Map
            </Link>
            <Link to="/dashboard/interventions" className="btn btn-primary btn-sm">
              <ArrowRight size={14} />
              Open Intervention Planner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
