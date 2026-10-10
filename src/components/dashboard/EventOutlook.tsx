import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Info, RotateCcw, Sliders, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import './DashboardPanels.css';

export default function EventOutlook() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { event, updateEventParams } = useData();

  // Local state for simulator sliders
  const [simRainfall, setSimRainfall] = useState<number>(event.rainfallIntensity);
  const [simDryDays, setSimDryDays] = useState<number>(event.antecedentDryDays);
  const [isMechanismExpanded, setIsMechanismExpanded] = useState<boolean>(true);

  const handleApplySimulation = (rainfall: number, dryDays: number) => {
    setSimRainfall(rainfall);
    setSimDryDays(dryDays);
    updateEventParams(rainfall, dryDays);
  };

  const handleReset = () => {
    handleApplySimulation(28, 11);
  };

  const formattedStart = new Date(event.expectedStart).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const formattedEnd = new Date(event.expectedEnd).toLocaleString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });

  // Calculate dynamic wash-off metrics for SVG curve
  const peakMobilizationRate = Math.min(100, Math.round((simRainfall / 35) * (simDryDays / 12) * 85));

  return (
    <div className="panel-container">
      {/* ── Top Transparency Banner ── */}
      <div className="transparency-banner">
        <span className="transparency-banner__badge">Question 01 — WHEN?</span>
        <span>
          <strong>Temporal Event Assessment:</strong> Evaluates incoming weather forecasts against antecedent surface loading. First-flush mobilization is non-linear: buoyant plastics wash off during the initial 30 minutes of rainfall before water levels peak.
        </span>
      </div>

      {/* ── Panel Header ── */}
      <header className="panel-header">
        <div className="panel-header__titles">
          <span className="panel-header__question">Temporal Event Assessment</span>
          <h1 className="panel-header__title">First-Flush Timing & Forecast Outlook</h1>
          <p className="panel-header__subtitle">
            Anticipate the critical mobilization window. Surface plastic detachment occurs rapidly when early rain strikes dry, accumulated road corridors.
          </p>
        </div>
        <div className="panel-header__actions">
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RotateCcw size={14} />
            Reset Baseline
          </button>
        </div>
      </header>

      {/* ── Top Event Highlight Grid ── */}
      <div className="two-col-grid">
        {/* Left Card: Current Assessed Event */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '0.688rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-forest)' }}>
                Illustrative Scenario Timeline · ID {event.id}
              </span>
              <h2 style={{ fontSize: '1.625rem', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
                {formattedStart} — {formattedEnd}
              </h2>
            </div>
            <span className={`risk-badge risk-badge--${event.firstFlushRisk}`}>
              {event.firstFlushRisk.toUpperCase()} FIRST FLUSH
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.6, background: 'var(--color-bg)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            {event.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <span className="metric-label">Rainfall Intensity</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
                {event.rainfallIntensity} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>mm/hr</span>
              </div>
              <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>Scenario Forecast</span>
            </div>
            <div>
              <span className="metric-label">Antecedent Dry</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
                {event.antecedentDryDays} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>days</span>
              </div>
              <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>Surface Loading</span>
            </div>
            <div>
              <span className="metric-label">Action Lead Window</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brass)' }}>
                ~6 Hours
              </div>
              <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>From 08:00 IST Ref Epoch</span>
            </div>
          </div>

          {/* Meteorological Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap', gap: '8px' }}>
            <span>Source: <strong>Synthetic Scenario</strong></span>
            <span>Scenario Horizon: <strong>14:00 — 18:30 IST</strong></span>
            <span>Scoring Model: <strong>Provisional Heuristic Composite</strong></span>
          </div>
        </div>

        {/* Right Card: The Science of First Flush (Collapsible Mechanism Details) */}
        <div className="card" style={{ background: 'var(--color-surface-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div 
            onClick={() => setIsMechanismExpanded(!isMechanismExpanded)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-forest)' }}>
              <Info size={18} />
              <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
                Total Rainfall vs. Acute First-Flush Dynamic
              </h3>
            </div>
            {isMechanismExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            Conventional municipal flood warning models only react to water volume. Jalaprahari models the <strong>acute first-flush plastic detachment curve</strong>:
          </p>

          {isMechanismExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', background: 'var(--color-surface)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-forest)' }}>01</span>
                <div style={{ fontSize: '0.813rem' }}>
                  <strong>Antecedent Surface Deposition:</strong> Litter gathers undisturbed during dry periods ({event.antecedentDryDays} dry days). Each day increases the available mobile mass.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', background: 'var(--color-surface)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-forest)' }}>02</span>
                <div style={{ fontSize: '0.813rem' }}>
                  <strong>Acute Initial Flush:</strong> The initial 15–25 mm of precipitation generates peak shear force, mobilizing buoyant debris directly toward storm grates.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', background: 'var(--color-surface)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-forest)' }}>03</span>
                <div style={{ fontSize: '0.813rem' }}>
                  <strong>Exhaustion / Tail Depletion:</strong> Once surface debris is flushed into the conduit network, subsequent heavy rainfall transports mostly dilute sediment.
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--color-forest)' }} />
            <span>Preventive crews must clear grates within the <strong>action lead window</strong> before rainfall exceeds 10 mm.</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Temporal Mobilization Curve Visualization ── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
              Synthetic Mobilization vs. Hydrograph Curve
            </h3>
            <p style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)' }}>
              Conceptual relationship between storm hydrograph and plastic washoff flux. Notice how plastic peak leads the water peak.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 14, height: 3, background: isDark ? 'var(--risk-critical)' : '#B9654B', display: 'inline-block' }} />
              <span style={{ fontWeight: 600 }}>Plastic Mobilization Flux</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 14, height: 3, background: isDark ? 'var(--accent-forest)' : '#53664D', display: 'inline-block' }} />
              <span style={{ fontWeight: 600 }}>Storm Runoff Discharge</span>
            </div>
          </div>
        </div>

        {/* SVG Curve */}
        <div style={{ width: '100%', height: 200, background: isDark ? 'var(--bg-canvas)' : '#FAF7F0', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', padding: '16px', position: 'relative' }}>
          <svg viewBox="0 0 700 160" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="40" y1="20" x2="680" y2="20" stroke={isDark ? '#2B372C' : '#E2DAC9'} strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="65" x2="680" y2="65" stroke={isDark ? '#2B372C' : '#E2DAC9'} strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="110" x2="680" y2="110" stroke={isDark ? '#2B372C' : '#E2DAC9'} strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="140" x2="680" y2="140" stroke={isDark ? '#3D4C3E' : '#D0C6B2'} strokeWidth="1.5" />

            {/* Critical Action Window Shaded Box */}
            <rect x="140" y="20" width="160" height="120" fill={isDark ? 'rgba(208, 178, 122, 0.16)' : 'rgba(173, 139, 86, 0.12)'} />
            <text x="146" y="36" fontSize="9.5" fontFamily="DM Sans" fontWeight="700" fill={isDark ? 'var(--accent-brass)' : '#AD8B56'}>PRE-RAIN INTERVENTION WINDOW (ILLUSTRATIVE)</text>

            {/* Runoff Hydrograph Curve (Forest Green - peaks later at hour 2.5) */}
            <path
              d="M 40,140 C 140,140 220,130 320,50 C 400,-10 480,40 560,110 C 620,135 680,140 680,140"
              fill="none"
              stroke={isDark ? 'var(--accent-forest)' : '#53664D'}
              strokeWidth="2.5"
            />

            {/* Plastic Flush Curve (Terracotta - peaks early in hour 1) */}
            <path
              d="M 40,140 C 100,140 180,30 230,25 C 290,20 360,105 450,130 C 540,138 680,140 680,140"
              fill="none"
              stroke={isDark ? 'var(--risk-critical)' : '#B9654B'}
              strokeWidth="3"
            />

            {/* Peak Callout Pin */}
            <circle cx="230" cy="25" r="4.5" fill={isDark ? 'var(--risk-critical)' : '#B9654B'} />
            <text x="240" y="22" fontSize="10" fontFamily="DM Sans" fontWeight="700" fill={isDark ? 'var(--text-primary)' : '#A04030'}>
              Relative Mobilization Peak (Illustrative Index: {peakMobilizationRate})
            </text>

            {/* X Axis Labels */}
            <text x="40" y="155" fontSize="10" fontFamily="DM Sans" fill={isDark ? 'var(--text-muted)' : '#77796F'}>T-6h (Ref: 08:00 IST)</text>
            <text x="180" y="155" fontSize="10" fontFamily="DM Sans" fill={isDark ? 'var(--text-muted)' : '#77796F'}>Onset (14:00 IST)</text>
            <text x="320" y="155" fontSize="10" fontFamily="DM Sans" fill={isDark ? 'var(--text-muted)' : '#77796F'}>+1.5h Peak Wash-off</text>
            <text x="460" y="155" fontSize="10" fontFamily="DM Sans" fill={isDark ? 'var(--text-muted)' : '#77796F'}>+3.0h</text>
            <text x="640" y="155" fontSize="10" fontFamily="DM Sans" fill={isDark ? 'var(--text-muted)' : '#77796F'}>+4.5h Tail Depletion</text>
          </svg>
        </div>
      </div>

      {/* ── Interactive Scenario Simulator ── */}
      <div className="simulator-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brass)', textTransform: 'uppercase' }}>
              <Sliders size={14} /> Sensitivity Testing
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              What-If First-Flush Scenario Simulator
            </h3>
            <p style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)' }}>
              Adjust meteorological parameters below to evaluate how changing storm conditions shift the risk profile across all monitored Bangalore drain inlets in real time.
            </p>
          </div>

          {/* Quick Scenario Preset Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.688rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>PRESETS:</span>
            <button
              onClick={() => handleApplySimulation(28, 11)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Baseline (28mm / 11d)
            </button>
            <button
              onClick={() => handleApplySimulation(45, 16)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Cloudburst (45mm / 16d)
            </button>
            <button
              onClick={() => handleApplySimulation(12, 4)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Light Shower (12mm / 4d)
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', margin: '20px 0' }}>
          {/* Rainfall Intensity Slider */}
          <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
                Forecast Rainfall Intensity
              </label>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                {simRainfall} mm/hr
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={simRainfall}
              onChange={e => handleApplySimulation(Number(e.target.value), simDryDays)}
              style={{ width: '100%', accentColor: 'var(--color-forest)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.688rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              <span>5 mm/hr (Drizzle)</span>
              <span>25 mm/hr (Heavy)</span>
              <span>60 mm/hr (Torr.)</span>
            </div>
          </div>

          {/* Antecedent Dry Days Slider */}
          <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
                Antecedent Dry Period
              </label>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                {simDryDays} Days
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="28"
              step="1"
              value={simDryDays}
              onChange={e => handleApplySimulation(simRainfall, Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-forest)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.688rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              <span>1 Day (Recent Rain)</span>
              <span>10 Days (Accumulated)</span>
              <span>28 Days (Extreme)</span>
            </div>
          </div>
        </div>

        {/* Live Re-assessment Notice */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: 'var(--color-surface)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.813rem' }}>
          <span>
            Simulated Result: <strong>{simRainfall} mm/hr</strong> with <strong>{simDryDays} dry days</strong> yields <strong>{event.firstFlushRisk.toUpperCase()}</strong> first-flush mobilization.
          </span>
          <span style={{ color: 'var(--color-forest)', fontWeight: 600 }}>
            Risk Engine: Dynamically Recalculated Across All 8 Monitored Drains
          </span>
        </div>
      </div>
    </div>
  );
}
