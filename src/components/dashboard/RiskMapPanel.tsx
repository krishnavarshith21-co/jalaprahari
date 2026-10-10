import { useEffect, useRef, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Suspense, lazy } from 'react';
import {
  MapPin, Filter, Layers, ArrowRight,
  Eye, List, Map as MapIcon, Info, Box, Compass, AlertCircle
} from 'lucide-react';
import './DashboardPanels.css';

const HeroScene = lazy(() => import('../three/HeroScene'));

export default function RiskMapPanel() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    drains,
    assessments,
    selectedDrainId,
    selectedDrain,
    selectedAssessment,
    selectDrain
  } = useData();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});

  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'schematic' | '3d' | 'table'>('map');
  const [tileError, setTileError] = useState<boolean>(false);

  const areas = Array.from(new Set(drains.map(d => d.area)));

  // Filter drains
  const filteredDrains = drains.filter(drain => {
    const assessment = assessments.find(a => a.drainId === drain.id);
    if (!assessment) return false;
    if (riskFilter !== 'all' && assessment.riskLevel !== riskFilter) return false;
    if (areaFilter !== 'all' && drain.area !== areaFilter) return false;
    return true;
  });

  // Color mapper
  const getMarkerColor = (level: string) => {
    if (isDark) {
      switch (level) {
        case 'very-high': return '#D17C64'; // muted terracotta
        case 'high': return '#D0B27A'; // champagne brass
        case 'moderate': return '#839578'; // sage
        default: return '#53664D'; // olive
      }
    }
    switch (level) {
      case 'very-high': return '#A04030';
      case 'high': return '#B9654B';
      case 'moderate': return '#C4A45A';
      default: return '#53664D';
    }
  };

  // Initialize and update Leaflet Map on theme or filter change
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Bangalore (12.9716, 77.5946)
      const map = L.map(mapContainerRef.current, {
        center: [12.95, 77.64],
        zoom: 11,
        zoomControl: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layer before re-adding appropriate theme tiles
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl = isDark
      ? 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      : 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    const tileAttribution =
      'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, USGS, METI';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: tileAttribution,
      maxZoom: 16,
      maxNativeZoom: 16,
      minZoom: 9,
    });

    tileLayer.on('tileerror', () => {
      setTileError(true);
      // Seamlessly transition to Vector Atlas when remote basemap fails
      setViewMode('schematic');
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Clear previous markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Add circle markers for filtered drains
    filteredDrains.forEach(drain => {
      const assessment = assessments.find(a => a.drainId === drain.id);
      const isSelected = drain.id === selectedDrainId;
      const level = assessment?.riskLevel || 'low';
      const color = getMarkerColor(level);

      const marker = L.circleMarker([drain.lat, drain.lng], {
        radius: isSelected ? 12 : 8,
        fillColor: color,
        color: isSelected ? (isDark ? '#D0B27A' : '#30372C') : (isDark ? '#111711' : '#FFFFFF'),
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: isDark ? 0.92 : 0.85,
      }).addTo(map);

      marker.bindTooltip(
        `<div style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; color: ${isDark ? '#F1EBDD' : '#1B2219'};">
          <div>${drain.name}</div>
          <div style="font-weight: normal; color: ${isDark ? '#C1C3B8' : '#555'};">Risk: ${assessment?.riskIndex || 0}/100 (${level.toUpperCase()})</div>
        </div>`,
        { direction: 'top', offset: [0, -8] }
      );

      marker.on('click', () => {
        selectDrain(drain.id);
      });

      markersRef.current[drain.id] = marker;
    });

    return () => {
      // Don't destroy map immediately on filter change
    };
  }, [viewMode, filteredDrains, assessments, selectedDrainId, selectDrain, isDark]);

  // Center on selected drain if changed
  useEffect(() => {
    if (mapInstanceRef.current && selectedDrain && viewMode === 'map') {
      mapInstanceRef.current.panTo([selectedDrain.lat, selectedDrain.lng], { animate: true });
    }
  }, [selectedDrain, viewMode]);

  return (
    <div className="panel-container">
      {/* ── Top Transparency Banner ── */}
      <div className="transparency-banner">
        <span className="transparency-banner__badge">Question 02 — WHERE?</span>
        <span>
          <strong>Geospatial Prioritization:</strong> Visualizing municipal drainage structures across Bangalore urban corridors. Coordinates represent illustrative synthetic demonstration inlets.
        </span>
      </div>

      {/* ── Panel Header ── */}
      <header className="panel-header">
        <div className="panel-header__titles">
          <span className="panel-header__question">Drainage Risk Geography</span>
          <h1 className="panel-header__title">Stormwater Inlet Risk Map</h1>
          <p className="panel-header__subtitle">
            Identify priority points of interception before urban plastic enters storm culverts and flows into Bellandur, Varthur, or downstream lakes.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="panel-header__actions">
          <div style={{ display: 'flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 3, gap: 2 }}>
            <button
              className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', border: 'none', fontSize: '0.813rem' }}
              onClick={() => setViewMode('map')}
              aria-label="Live Cartographic Map"
            >
              <MapIcon size={14} /> Cartographic Map
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'schematic' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', border: 'none', fontSize: '0.813rem' }}
              onClick={() => setViewMode('schematic')}
              aria-label="Vector Catchment Schematic"
            >
              <Compass size={14} /> Vector Atlas
            </button>
            <button
              className={`btn btn-sm ${viewMode === '3d' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', border: 'none', fontSize: '0.813rem' }}
              onClick={() => setViewMode('3d')}
              aria-label="3D Topographical Study"
            >
              <Box size={14} /> 3D Model
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', border: 'none', fontSize: '0.813rem' }}
              onClick={() => setViewMode('table')}
              aria-label="Tabular Ledger"
            >
              <List size={14} /> Table
            </button>
          </div>
        </div>
      </header>

      {/* ── Filter Bar & Map HUD ── */}
      <div className="filter-bar">
        <div className="filter-group">
          <Filter size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>RISK LEVEL:</span>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Risk Categories</option>
            <option value="very-high">Very High Only (&ge;75)</option>
            <option value="high">High Only (55-74)</option>
            <option value="moderate">Moderate Only (35-54)</option>
            <option value="low">Low Only (&lt;35)</option>
          </select>
        </div>

        <div className="filter-group">
          <Layers size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>CORRIDOR / WARD:</span>
          <select
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Bangalore Corridors</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
          Filtering <strong>{filteredDrains.length}</strong> of {drains.length} municipal inlets
        </span>
      </div>

      {tileError && (
        <div style={{
          background: isDark ? 'rgba(209, 124, 100, 0.15)' : '#FFF7E6',
          border: isDark ? '1px solid rgba(209, 124, 100, 0.35)' : '1px solid #FFE58F',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.813rem',
          color: isDark ? 'var(--text-primary)' : '#873800',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ color: isDark ? 'var(--accent-brass)' : '#873800', flexShrink: 0 }} />
            <span>Remote cartographic tiles degraded or unavailable. Switched to local Vector Basin Atlas.</span>
          </div>
          <button onClick={() => setViewMode('map')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            Retry Cartographic Basemap
          </button>
        </div>
      )}

      {/* ── Main Map / Table Grid with Side Inspector ── */}
      <div className="overview-grid">
        {/* Left/Center: Map, Vector Schematic, 3D Scene, or Accessible Table */}
        <div>
          {viewMode === 'map' ? (
            <div className="map-panel-wrapper">
              <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

              {/* In-Map HUD Bar */}
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 1000,
                background: isDark ? 'rgba(21, 28, 22, 0.94)' : 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                fontSize: '0.688rem',
                fontWeight: 600,
                color: isDark ? 'var(--accent-brass)' : 'var(--color-forest)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <span className="status-dot status-dot--active" />
                <span>{isDark ? 'ESRI WORLD DARK GRAY // BASIN ATLAS' : 'ESRI WORLD LIGHT GRAY // BASIN ATLAS'}</span>
              </div>

              {/* In-Map Legend */}
              <div className="map-legend">
                <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>
                  First-Flush Risk Index
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: isDark ? '#D17C64' : '#A04030', display: 'inline-block' }} />
                  <span>Very High (75-100)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: isDark ? '#D0B27A' : '#B9654B', display: 'inline-block' }} />
                  <span>High (55-74)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: isDark ? '#839578' : '#C4A45A', display: 'inline-block' }} />
                  <span>Moderate (35-54)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#53664D', display: 'inline-block' }} />
                  <span>Low (&lt;35)</span>
                </div>
              </div>
            </div>
          ) : viewMode === 'schematic' ? (
            /* High-Precision Vector Catchment Schematic */
            <div className="map-panel-wrapper" style={{ background: isDark ? '#111711' : '#FAF7F0', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                background: isDark ? 'rgba(21, 28, 22, 0.94)' : 'rgba(255, 255, 255, 0.94)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                fontSize: '0.688rem',
                fontWeight: 600,
                color: isDark ? 'var(--accent-brass)' : 'var(--color-forest)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Compass size={12} />
                <span>TOPOGRAPHIC SCHEMATIC // BELLANDUR-VARTHUR BASIN</span>
              </div>

              <svg viewBox="0 0 800 500" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="basinGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={isDark ? '#151C16' : '#F4EFE6'} />
                    <stop offset="100%" stopColor={isDark ? '#1B241D' : '#EBE3D3'} />
                  </linearGradient>
                  <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Basin Background Fill */}
                <rect width="800" height="500" fill="url(#basinGrad)" />

                {/* Topographic Contour Lines */}
                <path d="M 40,80 Q 250,50 480,110 T 760,90" fill="none" stroke={isDark ? '#2B372C' : '#D8CEBD'} strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 40,160 Q 230,130 450,180 T 760,170" fill="none" stroke={isDark ? '#2B372C' : '#D8CEBD'} strokeWidth="1" />
                <path d="M 40,240 Q 260,220 520,260 T 760,250" fill="none" stroke={isDark ? '#2B372C' : '#D8CEBD'} strokeWidth="1.2" strokeDasharray="4 2" />
                <path d="M 40,330 Q 300,310 560,340 T 760,330" fill="none" stroke={isDark ? '#2B372C' : '#D8CEBD'} strokeWidth="1" />
                <path d="M 40,420 Q 320,400 600,430 T 760,410" fill="none" stroke={isDark ? '#2B372C' : '#D8CEBD'} strokeWidth="1" strokeDasharray="3 3" />

                {/* Drainage Corridor Conduits */}
                <path d="M 120,120 C 220,180 340,210 500,240 S 680,310 720,380" fill="none" stroke={isDark ? '#839578' : '#688060'} strokeWidth="3.5" strokeOpacity={isDark ? 0.7 : 0.45} strokeLinecap="round" />
                <path d="M 280,100 C 350,160 420,220 500,240" fill="none" stroke={isDark ? '#839578' : '#688060'} strokeWidth="2.5" strokeOpacity={isDark ? 0.6 : 0.35} strokeLinecap="round" />
                <path d="M 220,360 C 340,320 440,280 500,240" fill="none" stroke={isDark ? '#839578' : '#688060'} strokeWidth="2.5" strokeOpacity={isDark ? 0.6 : 0.35} strokeLinecap="round" />

                {/* Waterbodies (Bellandur Lake & Varthur Lake) */}
                <path d="M 480,220 C 510,210 550,230 540,260 C 530,280 490,270 480,250 Z" fill={isDark ? '#203324' : '#9FB59A'} fillOpacity={isDark ? 0.75 : 0.4} stroke={isDark ? '#3D543F' : '#688060'} strokeWidth="1.2" />
                <text x="500" y="248" fontSize="10" fontFamily="DM Sans" fontWeight="600" fill={isDark ? '#A8B79E' : '#43503E'}>Bellandur Lake</text>

                <path d="M 680,360 C 710,340 750,370 740,400 C 720,420 670,400 680,360 Z" fill={isDark ? '#203324' : '#9FB59A'} fillOpacity={isDark ? 0.75 : 0.4} stroke={isDark ? '#3D543F' : '#688060'} strokeWidth="1.2" />
                <text x="690" y="388" fontSize="10" fontFamily="DM Sans" fontWeight="600" fill={isDark ? '#A8B79E' : '#43503E'}>Varthur Lake</text>

                {/* Projected Drain Pins */}
                {filteredDrains.map(d => {
                  const a = assessments.find(x => x.drainId === d.id);
                  const isSel = d.id === selectedDrainId;
                  const level = a?.riskLevel || 'low';
                  const color = getMarkerColor(level);

                  // Normalize coords between minLat: 12.84, maxLat: 13.04, minLng: 77.56, maxLng: 77.76
                  const minLat = 12.84;
                  const maxLat = 13.04;
                  const minLng = 77.56;
                  const maxLng = 77.76;
                  const x = 70 + ((d.lng - minLng) / (maxLng - minLng)) * 660;
                  const y = 430 - ((d.lat - minLat) / (maxLat - minLat)) * 360;

                  return (
                    <g
                      key={d.id}
                      onClick={() => selectDrain(d.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isSel && (
                        <circle cx={x} cy={y} r={18} fill="none" stroke={isDark ? '#D0B27A' : color} strokeWidth="2" strokeDasharray="3 3" opacity="0.85" />
                      )}
                      <circle cx={x} cy={y} r={isSel ? 10 : 7} fill={color} stroke={isDark ? '#111711' : '#FFFFFF'} strokeWidth={isSel ? 2.5 : 1.5} filter="url(#softGlow)" />
                      <circle cx={x} cy={y} r={isSel ? 3.5 : 2.5} fill={isDark ? '#F1EBDD' : '#FFFFFF'} />
                      <text
                        x={x}
                        y={y - (isSel ? 14 : 10)}
                        textAnchor="middle"
                        fontSize="9"
                        fontFamily="DM Sans"
                        fontWeight={isSel ? 700 : 600}
                        fill={isDark ? '#F1EBDD' : '#30372C'}
                      >
                        {d.id} ({a?.riskIndex ?? 0})
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* In-Map Legend for Schematic */}
              <div className="map-legend">
                <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>
                  Catchment Elements
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 14, height: 2, background: isDark ? '#839578' : '#688060', display: 'inline-block' }} />
                  <span>Stormwater Trunk Conduit</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: isDark ? '#D17C64' : '#A04030', display: 'inline-block' }} />
                  <span>Very High Risk Outfall (75-100)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: isDark ? '#D0B27A' : '#B9654B', display: 'inline-block' }} />
                  <span>High Risk Outfall (55-74)</span>
                </div>
              </div>
            </div>
          ) : viewMode === '3d' ? (
            /* 3D Catchment Architectural Study */
            <div className="map-panel-wrapper" style={{ background: isDark ? '#111711' : '#EAE6DC', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                background: isDark ? 'rgba(21, 28, 22, 0.94)' : 'rgba(255, 255, 255, 0.94)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                fontSize: '0.688rem',
                fontWeight: 600,
                color: isDark ? 'var(--accent-brass)' : 'var(--color-forest)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Box size={12} />
                <span>INTERACTIVE 3D CATCHMENT & INLET STUDY</span>
              </div>
              <Suspense fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
                  Loading 3D Catchment Model...
                </div>
              }>
                <HeroScene />
              </Suspense>
              <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 10, background: 'rgba(255, 255, 255, 0.92)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Drag to rotate view &bull; Scroll to zoom &bull; Click inlets to inspect drainage hydraulics
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Drain ID</th>
                      <th>Location</th>
                      <th>Coordinates</th>
                      <th>Catchment</th>
                      <th>Condition</th>
                      <th>Risk Level</th>
                      <th>Priority Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrains.map(d => {
                      const a = assessments.find(x => x.drainId === d.id);
                      return (
                        <tr
                          key={d.id}
                          className={d.id === selectedDrainId ? 'active' : ''}
                          onClick={() => selectDrain(d.id)}
                        >
                          <td style={{ fontWeight: 600, color: 'var(--color-forest)' }}>{d.id}</td>
                          <td>
                            <strong>{d.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{d.area}</div>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            {d.lat.toFixed(4)}°N, {d.lng.toFixed(4)}°E
                          </td>
                          <td>{d.catchmentArea} km²</td>
                          <td style={{ textTransform: 'capitalize' }}>{d.condition}</td>
                          <td>
                            <span className={`risk-badge risk-badge--${a?.riskLevel || 'low'}`}>
                              {a?.riskLevel}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700 }}>{a?.riskIndex || 0}/100</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Selected Drain Geospatial Profile */}
        <aside className="overview-sidebar">
          {selectedDrain && selectedAssessment ? (
            <div className="drain-detail-card">
              <div className="drain-detail-card__header">
                <div>
                  <span className="drain-detail-card__id">{selectedDrain.id} · Map Inspection</span>
                  <h3 className="drain-detail-card__name">{selectedDrain.name}</h3>
                  <span className="drain-detail-card__area">
                    <MapPin size={13} /> {selectedDrain.area}
                  </span>
                </div>
                <span className={`risk-badge risk-badge--${selectedAssessment.riskLevel}`}>
                  {selectedAssessment.riskLevel.toUpperCase()}
                </span>
              </div>

              {/* Geographic Coordinates & Catchment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--color-surface-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span className="metric-label">Coordinates</span>
                  <div style={{ fontSize: '0.813rem', fontWeight: 600 }}>
                    {selectedDrain.lat.toFixed(4)}°N, {selectedDrain.lng.toFixed(4)}°E
                  </div>
                </div>
                <div>
                  <span className="metric-label">Catchment Area</span>
                  <div style={{ fontSize: '0.813rem', fontWeight: 600 }}>
                    {selectedDrain.catchmentArea} sq km
                  </div>
                </div>
                <div>
                  <span className="metric-label">Channel Geometry</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {selectedDrain.drainageCapacity}
                  </div>
                </div>
                <div>
                  <span className="metric-label">Physical Condition</span>
                  <div style={{ fontSize: '0.813rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {selectedDrain.condition}
                  </div>
                </div>
              </div>

              {/* Land Use tags */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Surrounding Land Use & Surface Exposure
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedDrain.nearbyLandUse.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.75rem',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Factor Contribution Preview */}
              <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.688rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-forest)', letterSpacing: '0.04em' }}>
                  Leading Driver: {selectedAssessment.leadingFactor}
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  {selectedAssessment.explanation}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.688rem', color: 'var(--color-text-secondary)', paddingTop: '4px', borderTop: '1px solid var(--color-border)' }}>
                  <span>Calculated from: {selectedAssessment.rainfallIntensity} mm/hr rain &bull; {selectedAssessment.antecedentDryDays}d dry</span>
                  <span style={{ fontWeight: 600 }}>Score: {selectedAssessment.riskIndex}/100</span>
                </div>
              </div>

              {/* Action shortcuts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                <Link
                  to="/dashboard/drains"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Eye size={14} />
                  View Risk Factor Explanation
                </Link>
                <Link
                  to="/dashboard/interventions"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Add to Municipal Action Queue
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <Info size={24} style={{ color: 'var(--color-text-secondary)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Click any map marker to inspect its drainage geometry.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
