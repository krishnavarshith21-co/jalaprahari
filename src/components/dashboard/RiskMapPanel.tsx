import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Suspense, lazy } from 'react';
import {
  Filter, Layers, ArrowRight,
  List, Map as MapIcon, Box, Compass, AlertCircle,
  Search, RotateCcw, CheckCircle2
} from 'lucide-react';
import './DashboardPanels.css';
import {
  BENGALURU_CATCHMENTS_GEOJSON,
  BENGALURU_WATERBODIES_GEOJSON,
  BENGALURU_DRAINAGE_NETWORK_GEOJSON,
  BENGALURU_CONTOURS_GEOJSON
} from '../../data/geospatial';

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
  const layerGroupsRef = useRef<{
    catchments?: L.GeoJSON;
    waterbodies?: L.GeoJSON;
    drainage?: L.GeoJSON;
    contours?: L.GeoJSON;
    markers?: L.LayerGroup;
  }>({});

  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'schematic' | '3d' | 'table'>('map');
  const [tileError, setTileError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  // Layer visibility toggles
  const [visibleLayers, setVisibleLayers] = useState({
    catchments: true,
    waterbodies: true,
    drainage: true,
    contours: true,
    markers: true,
  });

  const areas = useMemo(() => Array.from(new Set(drains.map(d => d.area))), [drains]);

  // Filter drains
  const filteredDrains = useMemo(() => {
    return drains.filter(drain => {
      const assessment = assessments.find(a => a.drainId === drain.id);
      if (!assessment) return false;
      if (riskFilter !== 'all' && assessment.riskLevel !== riskFilter) return false;
      if (areaFilter !== 'all' && drain.area !== areaFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = drain.id.toLowerCase().includes(query);
        const matchesName = drain.name.toLowerCase().includes(query);
        const matchesArea = drain.area.toLowerCase().includes(query);
        const matchesCatchment = (drain.catchmentName || '').toLowerCase().includes(query);
        if (!matchesId && !matchesName && !matchesArea && !matchesCatchment) return false;
      }
      return true;
    });
  }, [drains, assessments, riskFilter, areaFilter, searchQuery]);

  // Color mapper for markers & risk tiers
  const getMarkerColor = useCallback((level: string) => {
    if (isDark) {
      switch (level) {
        case 'very-high': return '#D17C64'; // terracotta
        case 'high': return '#D0B27A'; // antique brass
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
  }, [isDark]);

  // ── Initialize and update Leaflet Map ──
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Bangalore metropolitan basin extent
      const map = L.map(mapContainerRef.current, {
        center: [12.955, 77.645],
        zoom: 11,
        minZoom: 10,
        maxZoom: 16,
        zoomControl: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Basemap tile selection with robust error handling
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    // CARTO Dark Matter (Dark) / CARTO Positron (Light) with Esri fallback
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}{r}.png';

    const tileAttribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>';

    const tileLayer = L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 16,
      minZoom: 10,
      attribution: tileAttribution,
    });

    tileLayer.on('tileerror', () => {
      // If CARTO tiles have issues, try ESRI fallback before Vector Atlas
      const esriFallback = isDark
        ? 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        : 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      
      const fallbackLayer = L.tileLayer(esriFallback, {
        maxZoom: 16,
        minZoom: 10,
        attribution: 'Tiles &copy; Esri',
      });

      fallbackLayer.on('tileerror', () => {
        setTileError(true);
        setViewMode('schematic');
      });

      tileLayer.remove();
      fallbackLayer.addTo(map);
      tileLayerRef.current = fallbackLayer;
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // ── Analytical GeoJSON Layer 1: Catchment Boundaries ──
    if (layerGroupsRef.current.catchments) {
      layerGroupsRef.current.catchments.remove();
    }
    if (visibleLayers.catchments) {
      const catchmentsLayer = L.geoJSON(BENGALURU_CATCHMENTS_GEOJSON, {
        style: (feature) => ({
          color: isDark ? (feature?.properties.verified ? '#4A6B53' : '#35473A') : (feature?.properties.verified ? '#6A8B73' : '#8E9C89'),
          weight: feature?.properties.verified ? 1.8 : 1.2,
          dashArray: feature?.properties.verified ? undefined : '5, 4',
          fillColor: isDark ? (feature?.properties.verified ? '#1E2D22' : '#172019') : (feature?.properties.verified ? '#E5EDE6' : '#F0EBE0'),
          fillOpacity: isDark ? 0.35 : 0.25,
        }),
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(
            `<div style="font-family: system-ui, sans-serif; font-size: 11px; padding: 2px;">
              <strong style="color: ${isDark ? '#F1EBDD' : '#1B2219'};">${feature.properties.name}</strong><br/>
              <span style="color: ${feature.properties.verified ? '#8CA086' : '#C1C3B8'}; font-size: 10px;">${feature.properties.status}</span><br/>
              <span style="color: ${isDark ? '#92998D' : '#686152'}; font-size: 10px;">Recipient: ${feature.properties.receiving}</span>
            </div>`,
            { sticky: true, direction: 'top', opacity: 0.95 }
          );
        },
      }).addTo(map);
      layerGroupsRef.current.catchments = catchmentsLayer;
    }

    // ── Analytical GeoJSON Layer 2: Water Bodies (Lakes & Wetlands) ──
    if (layerGroupsRef.current.waterbodies) {
      layerGroupsRef.current.waterbodies.remove();
    }
    if (visibleLayers.waterbodies) {
      const waterLayer = L.geoJSON(BENGALURU_WATERBODIES_GEOJSON, {
        style: () => ({
          color: isDark ? '#3D5E48' : '#4E745A',
          weight: 1.5,
          fillColor: isDark ? '#1F3728' : '#7D9E87',
          fillOpacity: isDark ? 0.75 : 0.45,
        }),
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(
            `<div style="font-family: system-ui, sans-serif; font-size: 11px; padding: 2px;">
              <strong style="color: ${isDark ? '#D0B27A' : '#30372C'};">${feature.properties.name}</strong><br/>
              <span style="color: ${isDark ? '#F1EBDD' : '#1B2219'}; font-size: 10px;">${feature.properties.type} (${feature.properties.areaHectares} ha)</span><br/>
              <span style="color: ${isDark ? '#A8B79E' : '#4B6652'}; font-size: 9.5px;">${feature.properties.waterQuality}</span>
            </div>`,
            { sticky: true, direction: 'top', opacity: 0.95 }
          );
        },
      }).addTo(map);
      layerGroupsRef.current.waterbodies = waterLayer;
    }

    // ── Analytical GeoJSON Layer 3: Drainage Conduits & Rajakaluve ──
    if (layerGroupsRef.current.drainage) {
      layerGroupsRef.current.drainage.remove();
    }
    if (visibleLayers.drainage) {
      const drainageLayer = L.geoJSON(BENGALURU_DRAINAGE_NETWORK_GEOJSON, {
        style: (feature) => {
          const isVerifiedTrunk = feature?.properties.type === 'verified-primary-trunk';
          const isModeledFeeder = feature?.properties.type === 'modeled-feeder';
          return {
            color: isVerifiedTrunk
              ? (isDark ? '#C4975A' : '#9E6E32')
              : isModeledFeeder
              ? (isDark ? '#8CA086' : '#5D7757')
              : (isDark ? '#5B6E57' : '#7A8C76'),
            weight: isVerifiedTrunk ? 3.5 : 2.2,
            opacity: isDark ? 0.9 : 0.75,
            dashArray: isVerifiedTrunk ? undefined : '5, 4',
            lineCap: 'round',
          };
        },
        onEachFeature: (feature, layer) => {
          const verifiedBadge = feature.properties.verified
            ? `<span style="color: #D0B27A; font-weight: 700;">✓ Verified Stormwater Trunk</span>`
            : `<span style="color: #92998D;">Illustrative Sub-Basin Feeder</span>`;
          layer.bindTooltip(
            `<div style="font-family: system-ui, sans-serif; font-size: 11px; padding: 2px;">
              <strong style="color: ${isDark ? '#F1EBDD' : '#1B2219'};">${feature.properties.name}</strong><br/>
              ${verifiedBadge}<br/>
              <span style="font-size: 10px; color: ${isDark ? '#C1C3B8' : '#555'};">Geometry: ${feature.properties.width}</span>
            </div>`,
            { sticky: true, opacity: 0.95 }
          );
        },
      }).addTo(map);
      layerGroupsRef.current.drainage = drainageLayer;
    }

    // ── Analytical GeoJSON Layer 4: Topographic Contours ──
    if (layerGroupsRef.current.contours) {
      layerGroupsRef.current.contours.remove();
    }
    if (visibleLayers.contours) {
      const contoursLayer = L.geoJSON(BENGALURU_CONTOURS_GEOJSON, {
        style: () => ({
          color: isDark ? '#2E4033' : '#C7BFB0',
          weight: 1.0,
          dashArray: '3, 3',
          opacity: isDark ? 0.6 : 0.7,
        }),
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(
            `<span style="font-size: 10px; font-family: monospace;">Topographic Contour: ${feature.properties.label}</span>`,
            { sticky: true, opacity: 0.9 }
          );
        },
      }).addTo(map);
      layerGroupsRef.current.contours = contoursLayer;
    }

    // ── Analytical Layer 5: Monitored Inlets (Custom HTML DivIcons) ──
    if (layerGroupsRef.current.markers) {
      layerGroupsRef.current.markers.remove();
    }
    if (visibleLayers.markers) {
      const markersGroup = L.layerGroup();

      filteredDrains.forEach(drain => {
        const assessment = assessments.find(a => a.drainId === drain.id);
        const isSelected = drain.id === selectedDrainId;
        const level = assessment?.riskLevel || 'low';
        const color = getMarkerColor(level);

        const customIcon = L.divIcon({
          className: 'carto-marker-wrapper',
          html: `
            <div class="carto-marker-pin ${isSelected ? 'carto-marker-pin--selected' : ''}">
              <span class="carto-marker-dot" style="background-color: ${color};"></span>
              <span class="carto-marker-label">${drain.id}</span>
              <span class="carto-marker-score" style="background-color: ${color};">${assessment?.riskIndex ?? 0}</span>
            </div>
          `,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        const marker = L.marker([drain.lat, drain.lng], { icon: customIcon });

        marker.bindTooltip(
          `<div style="font-family: system-ui, sans-serif; font-size: 12px; font-weight: 600; color: ${isDark ? '#F1EBDD' : '#1B2219'}; padding: 4px;">
            <div style="font-size: 13px; font-weight: 700; color: ${color};">${drain.id} — ${drain.name}</div>
            <div style="margin-top: 4px; font-weight: normal; color: ${isDark ? '#C1C3B8' : '#444'};">
              Ward: <strong>${drain.area}</strong> | Catchment: <strong>${drain.catchmentName || 'K-C Valley'}</strong>
            </div>
            <div style="margin-top: 2px; font-weight: 600; color: ${color};">
              Priority Index: ${assessment?.riskIndex || 0}/100 (${level.toUpperCase()})
            </div>
            <div style="margin-top: 3px; font-size: 10px; color: ${drain.hydrologicalConnectionVerified ? '#D0B27A' : '#92998D'};">
              ${drain.hydrologicalConnectionVerified ? '✓ Verified K-C Valley Connection to Bellandur' : 'Illustrative Sub-Basin Outfall'}
            </div>
          </div>`,
          { direction: 'top', offset: [0, -12], opacity: 0.98 }
        );

        marker.on('click', () => {
          selectDrain(drain.id);
        });

        markersGroup.addLayer(marker);
      });

      markersGroup.addTo(map);
      layerGroupsRef.current.markers = markersGroup;
    }

    return () => {
      // Don't destroy whole map on render; preserve instance
    };
  }, [viewMode, filteredDrains, assessments, selectedDrainId, selectDrain, isDark, visibleLayers, getMarkerColor]);

  // Center on selected drain if changed
  useEffect(() => {
    if (mapInstanceRef.current && selectedDrain && viewMode === 'map') {
      mapInstanceRef.current.panTo([selectedDrain.lat, selectedDrain.lng], { animate: true });
    }
  }, [selectedDrain, viewMode]);

  // Reset extent function
  const handleResetExtent = () => {
    if (mapInstanceRef.current && viewMode === 'map') {
      mapInstanceRef.current.flyTo([12.955, 77.645], 11, { duration: 0.8 });
    }
  };

  return (
    <div className="panel-container">
      {/* ── Top Transparency & Provenance Banner ── */}
      <div className="transparency-banner">
        <span className="transparency-banner__badge">Question 02 — WHERE?</span>
        <span>
          <strong>Geospatial Intelligence:</strong> Canonical Bangalore drainage geography. Verified Koramangala-Challaghatta (K-C) Valley stormwater trunk; other sub-basins DEM-modeled. Relative Priority Index (0–100), not a probability.
        </span>
      </div>

      {/* ── Panel Header ── */}
      <header className="panel-header">
        <div className="panel-header__titles">
          <span className="panel-header__question">Drainage Risk Geography</span>
          <h1 className="panel-header__title">Stormwater Inlet Risk Map</h1>
          <p className="panel-header__subtitle">
            Identify priority points of interception before urban plastic enters storm culverts and flows into Bellandur Lake, Varthur Lake, or downstream regional watersheds.
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

      {/* ── Filter Bar & Map Controls HUD ── */}
      <div className="filter-bar">
        <div className="filter-group">
          <Filter size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>RISK TIER:</span>
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
          Displaying <strong>{filteredDrains.length}</strong> of {drains.length} monitored outfalls
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
          <button onClick={() => { setTileError(false); setViewMode('map'); }} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
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

              {/* In-Map Floating Tools HUD Cluster (Top Left) */}
              <div className="map-hud-cluster">
                {/* Search Box */}
                <div className="map-search-box">
                  <Search size={13} style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    className="map-search-input"
                    placeholder="Search drain or ward..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search drain inlet by ID or ward"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}
                      aria-label="Clear search"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {/* Layer Toggles Dropdown Button */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="map-hud-btn"
                    onClick={() => setShowLayerMenu(!showLayerMenu)}
                    aria-label="Toggle GIS map layers"
                  >
                    <Layers size={13} />
                    <span>Layers</span>
                  </button>

                  {showLayerMenu && (
                    <div className="map-layer-drawer">
                      <div style={{ fontWeight: 700, fontSize: '0.688rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 2 }}>
                        GIS Analytical Overlays
                      </div>
                      
                      <div className="map-layer-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={visibleLayers.catchments}
                            onChange={(e) => setVisibleLayers({ ...visibleLayers, catchments: e.target.checked })}
                          />
                          <span>Catchment Divides</span>
                        </label>
                      </div>

                      <div className="map-layer-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={visibleLayers.drainage}
                            onChange={(e) => setVisibleLayers({ ...visibleLayers, drainage: e.target.checked })}
                          />
                          <span>Stormwater Trunk Canals</span>
                        </label>
                      </div>

                      <div className="map-layer-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={visibleLayers.waterbodies}
                            onChange={(e) => setVisibleLayers({ ...visibleLayers, waterbodies: e.target.checked })}
                          />
                          <span>Lakes & Water Bodies</span>
                        </label>
                      </div>

                      <div className="map-layer-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={visibleLayers.contours}
                            onChange={(e) => setVisibleLayers({ ...visibleLayers, contours: e.target.checked })}
                          />
                          <span>Topographic Contours</span>
                        </label>
                      </div>

                      <div className="map-layer-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={visibleLayers.markers}
                            onChange={(e) => setVisibleLayers({ ...visibleLayers, markers: e.target.checked })}
                          />
                          <span>Monitored Outfalls</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset Extent Button */}
                <button
                  className="map-hud-btn"
                  onClick={handleResetExtent}
                  title="Reset view to full Bangalore basin"
                  aria-label="Reset map extent"
                >
                  <RotateCcw size={13} />
                  <span>Reset Extent</span>
                </button>
              </div>

              {/* In-Map Top-Right Status Badge */}
              <div style={{
                position: 'absolute',
                top: 14,
                right: 14,
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
                <span>{isDark ? 'CARTO DARK MATTER // BASIN ATLAS' : 'CARTO POSITRON // BASIN ATLAS'}</span>
              </div>

              {/* In-Map Legend (Bottom Right) */}
              <div className="map-legend">
                <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>
                  Relative Priority Index
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: isDark ? '#D17C64' : '#A04030', display: 'inline-block' }} />
                  <span>Very High (&ge;75)</span>
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
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 4, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 14, height: 3, background: isDark ? '#C4975A' : '#9E6E32', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.688rem' }}>Verified K-C Trunk</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 14, height: 2, borderBottom: `2px dashed ${isDark ? '#8CA086' : '#5D7757'}`, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.688rem' }}>Feeder Conduit</span>
                  </div>
                </div>
              </div>
            </div>
          ) : viewMode === 'schematic' ? (
            /* High-Precision Vector Catchment Schematic */
            <div className="map-panel-wrapper" style={{ background: isDark ? '#111711' : '#FAF7F0', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: 14,
                right: 14,
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
                <span>TOPOGRAPHIC SCHEMATIC // BANGALORE MULTI-BASIN ATLAS</span>
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

                {/* Sub-Catchment Regional Divides */}
                {/* 1. Hebbal North Watershed */}
                <path d="M 60,30 Q 240,20 460,70 T 740,60" fill="none" stroke={isDark ? '#2B372C' : '#D8CEBD'} strokeWidth="1.2" strokeDasharray="4 3" />
                <text x="75" y="45" fontSize="8" fontFamily="monospace" fill={isDark ? '#839578' : '#7A846B'}>HEBBAL NORTHERN RIDGELINE</text>

                {/* 2. Vrishabhavathi Western Crest Divide */}
                <path d="M 60,110 Q 180,180 200,320 T 120,470" fill="none" stroke={isDark ? '#324033' : '#D0C6B5'} strokeWidth="1.5" strokeDasharray="5 3" />
                <text x="35" y="240" fontSize="7.5" fontFamily="monospace" fill={isDark ? '#839578' : '#7A846B'} transform="rotate(-90 35 240)">VRISHABHAVATHI WESTERN CREST</text>

                {/* 3. Central Koramangala-Challaghatta Valley Contour */}
                <path d="M 220,180 Q 380,210 500,240 T 740,230" fill="none" stroke={isDark ? '#3D543F' : '#C5BCAE'} strokeWidth="1.5" />
                <text x="240" y="195" fontSize="8" fontFamily="monospace" fill={isDark ? '#A8B79E' : '#688060'}>KORAMANGALA-CHALLAGHATTA VALLEY</text>

                {/* 4. Southern Corridor Divide */}
                <path d="M 220,380 Q 420,360 620,400 T 740,430" fill="none" stroke={isDark ? '#2B372C' : '#D8CEBD'} strokeWidth="1.2" strokeDasharray="4 3" />
                <text x="250" y="475" fontSize="8" fontFamily="monospace" fill={isDark ? '#839578' : '#7A846B'}>SOUTHERN ELECTRONIC CITY CORRIDOR</text>

                {/* Verified Drainage Channels */}
                {/* A. Verified Primary Trunk: Koramangala Outfall (DR-002) to Bellandur Lake (DR-005) */}
                <path d="M 300,215 C 370,225 430,235 500,245" fill="none" stroke={isDark ? '#C4975A' : '#9E6E32'} strokeWidth="4" strokeLinecap="round" />
                {/* B. Verified Overflow Cascade: Bellandur Lake to Varthur Lake */}
                <path d="M 540,250 C 600,260 650,285 700,305" fill="none" stroke={isDark ? '#C4975A' : '#9E6E32'} strokeWidth="3.2" strokeLinecap="round" />
                {/* C. Sarjapur Feeder into Bellandur */}
                <path d="M 520,360 C 515,310 518,275 520,255" fill="none" stroke={isDark ? '#8CA086' : '#5D7757'} strokeWidth="2.5" strokeDasharray="4 2" strokeLinecap="round" />
                {/* D. Majestic Western Outflow to Vrishabhavathi */}
                <path d="M 120,120 C 100,160 85,210 75,270" fill="none" stroke={isDark ? '#5B6E57' : '#7A8C76'} strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" />
                {/* E. Jayanagar Southwest Outflow */}
                <path d="M 170,290 C 150,330 135,380 125,430" fill="none" stroke={isDark ? '#5B6E57' : '#7A8C76'} strokeWidth="2.2" strokeDasharray="5 3" strokeLinecap="round" />
                {/* F. Hebbal Northern Outflow */}
                <path d="M 220,50 C 200,40 180,30 160,25" fill="none" stroke={isDark ? '#5B6E57' : '#7A8C76'} strokeWidth="2.2" strokeDasharray="5 3" strokeLinecap="round" />

                {/* Waterbodies */}
                {/* Bellandur Lake */}
                <path d="M 480,230 C 510,220 550,235 545,265 C 530,280 490,275 480,250 Z" fill={isDark ? '#1F3728' : '#7D9E87'} fillOpacity={isDark ? 0.8 : 0.5} stroke={isDark ? '#3D5E48' : '#4E745A'} strokeWidth="1.5" />
                <text x="495" y="254" fontSize="9.5" fontFamily="DM Sans" fontWeight="700" fill={isDark ? '#D0B27A' : '#253526'}>Bellandur Lake</text>

                {/* Varthur Lake */}
                <path d="M 680,290 C 715,280 750,305 740,335 C 715,345 675,325 680,290 Z" fill={isDark ? '#1F3728' : '#7D9E87'} fillOpacity={isDark ? 0.8 : 0.5} stroke={isDark ? '#3D5E48' : '#4E745A'} strokeWidth="1.5" />
                <text x="690" y="318" fontSize="9" fontFamily="DM Sans" fontWeight="600" fill={isDark ? '#A8B79E' : '#253526'}>Varthur Lake</text>

                {/* Hebbal Lake */}
                <path d="M 140,20 C 165,15 185,25 175,40 C 160,45 135,35 140,20 Z" fill={isDark ? '#1F3728' : '#7D9E87'} fillOpacity={isDark ? 0.8 : 0.5} stroke={isDark ? '#3D5E48' : '#4E745A'} strokeWidth="1.2" />
                <text x="145" y="32" fontSize="7.5" fontFamily="DM Sans" fontWeight="600" fill={isDark ? '#A8B79E' : '#253526'}>Hebbal Lake</text>

                {/* Projected Drain Pins */}
                {filteredDrains.map(d => {
                  const a = assessments.find(x => x.drainId === d.id);
                  const isSel = d.id === selectedDrainId;
                  const level = a?.riskLevel || 'low';
                  const color = getMarkerColor(level);

                  // Normalize coords across Bangalore extent (minLat: 12.83, maxLat: 13.05, minLng: 77.55, maxLng: 77.77)
                  const minLat = 12.83;
                  const maxLat = 13.05;
                  const minLng = 77.55;
                  const maxLng = 77.77;
                  const x = 70 + ((d.lng - minLng) / (maxLng - minLng)) * 660;
                  const y = 440 - ((d.lat - minLat) / (maxLat - minLat)) * 380;

                  return (
                    <g
                      key={d.id}
                      onClick={() => selectDrain(d.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isSel && (
                        <circle cx={x} cy={y} r={20} fill="none" stroke={isDark ? '#D0B27A' : color} strokeWidth="2.5" strokeDasharray="4 3" opacity="0.9" />
                      )}
                      <circle cx={x} cy={y} r={isSel ? 11 : 8} fill={color} stroke={isDark ? '#111711' : '#FFFFFF'} strokeWidth={isSel ? 2.5 : 1.5} filter="url(#softGlow)" />
                      <circle cx={x} cy={y} r={isSel ? 4 : 2.5} fill={isDark ? '#F1EBDD' : '#FFFFFF'} />
                      <rect
                        x={x - 28}
                        y={y - (isSel ? 26 : 22)}
                        width="56"
                        height="16"
                        rx="4"
                        fill={isDark ? 'rgba(22, 30, 26, 0.92)' : 'rgba(255, 255, 255, 0.92)'}
                        stroke={isSel ? '#D0B27A' : (isDark ? '#2D3D2F' : '#D3CABA')}
                        strokeWidth={isSel ? 1.5 : 0.8}
                      />
                      <text
                        x={x}
                        y={y - (isSel ? 15 : 11)}
                        textAnchor="middle"
                        fontSize="8.5"
                        fontFamily="DM Sans"
                        fontWeight={isSel ? 800 : 700}
                        fill={isDark ? '#F1EBDD' : '#30372C'}
                      >
                        {d.id} · {a?.riskIndex ?? 0}
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
                  <span style={{ width: 14, height: 3, background: isDark ? '#C4975A' : '#9E6E32', display: 'inline-block' }} />
                  <span>Verified K-C Trunk Canal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 14, height: 2, borderBottom: `2px dashed ${isDark ? '#8CA086' : '#5D7757'}`, display: 'inline-block' }} />
                  <span>Sub-Basin Feeder Line</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: isDark ? '#D17C64' : '#A04030', display: 'inline-block' }} />
                  <span>Very High Risk (&ge;75)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: isDark ? '#D0B27A' : '#B9654B', display: 'inline-block' }} />
                  <span>High Risk (55-74)</span>
                </div>
              </div>
            </div>
          ) : viewMode === '3d' ? (
            /* 3D Topographical Basin Model */
            <div className="map-panel-wrapper" style={{ background: isDark ? '#111711' : '#EAE6DC', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: 14,
                left: 14,
                zIndex: 10,
                background: isDark ? 'rgba(21, 28, 22, 0.92)' : 'rgba(255, 255, 255, 0.92)',
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
                <Box size={14} />
                <span>3D TOPOGRAPHICAL STUDY // ROTATE TO INSPECT RIDGES</span>
              </div>
              <Suspense fallback={<div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Loading 3D Topographical Canvas...</div>}>
                <HeroScene />
              </Suspense>
            </div>
          ) : (
            /* Accessible Tabular Ledger */
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.813rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>DRAIN ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>LOCATION / WARD</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>CATCHMENT / BASIN</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>RECEIVING WATERBODY</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>PRIORITY INDEX</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>CONDITION</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrains.map(d => {
                      const a = assessments.find(x => x.drainId === d.id);
                      const isSel = d.id === selectedDrainId;
                      const level = a?.riskLevel || 'low';
                      return (
                        <tr
                          key={d.id}
                          onClick={() => selectDrain(d.id)}
                          style={{
                            borderBottom: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            background: isSel ? 'var(--color-surface-raised, rgba(208, 178, 122, 0.08))' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--color-text)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: getMarkerColor(level) }} />
                              {d.id}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px' }}>{d.name}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <div>{d.catchmentName || 'K-C Valley'}</div>
                            <span style={{ fontSize: '0.688rem', color: d.hydrologicalConnectionVerified ? 'var(--accent-brass)' : 'var(--color-text-secondary)' }}>
                              {d.hydrologicalConnectionVerified ? '✓ Verified Trunk' : 'DEM Sub-Basin'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', color: 'var(--color-text-secondary)' }}>
                            {d.receivingWaterbody || 'Bellandur Lake'}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span className={`risk-badge risk-badge--${level}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                              {a?.riskIndex ?? 0}/100
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', textTransform: 'capitalize' }}>{d.condition}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); selectDrain(d.id); }}
                              className={`btn btn-sm ${isSel ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Selected Drain Geospatial Dossier & Action Directives */}
        <div>
          {selectedDrain && selectedAssessment ? (
            <div className="drain-detail-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Dossier Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.875rem', color: 'var(--accent-brass)' }}>
                      {selectedDrain.id}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      · {selectedDrain.area}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.063rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                    {selectedDrain.name}
                  </h3>
                </div>
                <span className={`risk-badge risk-badge--${selectedAssessment.riskLevel}`} style={{ fontSize: '0.813rem' }}>
                  {selectedAssessment.riskLevel.toUpperCase()}
                </span>
              </div>

              {/* Priority Index Callout with Explicit Non-Probability Clarification */}
              <div style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.688rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block' }}>
                    Relative Priority Index
                  </span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: getMarkerColor(selectedAssessment.riskLevel), lineHeight: 1.1 }}>
                    {selectedAssessment.riskIndex}
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}> / 100</span>
                  </span>
                  <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: 2 }}>
                    Heuristic ranking score, not a probability.
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)', display: 'block' }}>Infrastructure</span>
                  <span style={{ fontSize: '0.813rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--color-text)' }}>
                    {selectedDrain.condition} Rating
                  </span>
                </div>
              </div>

              {/* Verified Catchment & Hydrological Connection Section */}
              <div style={{
                background: isDark ? 'rgba(30, 42, 34, 0.45)' : 'rgba(235, 243, 237, 0.7)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontSize: '0.688rem' }}>
                    Hydrological Connectivity
                  </span>
                  {selectedDrain.hydrologicalConnectionVerified ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-brass)', fontWeight: 700, fontSize: '0.688rem' }}>
                      <CheckCircle2 size={12} /> Verified Trunk
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.688rem' }}>
                      Illustrative Sub-Basin Feeder
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.688rem' }}>Watershed Basin:</div>
                  <strong style={{ color: 'var(--color-text)' }}>{selectedDrain.catchmentName || 'Koramangala-Challaghatta (K-C) Valley'}</strong>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.688rem' }}>Sub-Basin Corridor:</div>
                  <span style={{ color: 'var(--color-text)' }}>{selectedDrain.subBasin || 'Challaghatta Stormwater Corridor'}</span>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.688rem' }}>Receiving Water Sink:</div>
                  <strong style={{ color: selectedDrain.hydrologicalConnectionVerified ? 'var(--accent-brass)' : 'var(--color-text)' }}>
                    {selectedDrain.receivingWaterbody || 'Bellandur Lake & Varthur Lake System'}
                  </strong>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 6, fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>
                  <em>Provenance:</em> {selectedDrain.provenance?.coordinateSource || 'Municipal landmark geocode (provisional reference)'}
                </div>
              </div>

              {/* Leading Factors Breakdown */}
              <div>
                <span style={{ fontSize: '0.688rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                  Component Factor Breakdown
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedAssessment.factors.map(f => (
                    <div key={f.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 2 }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{f.name} ({Math.round(f.weight * 100)}%)</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{Math.round(f.normalizedScore)}/100</span>
                      </div>
                      <div className="factor-bar-track">
                        <div
                          className="factor-bar-fill"
                          style={{
                            width: `${Math.min(100, f.normalizedScore)}%`,
                            background: f.normalizedScore > 75 ? (isDark ? '#D17C64' : '#A04030') : (isDark ? '#D0B27A' : '#C4A45A')
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Operational Action Directive */}
              <div className="action-directive-card">
                <span style={{ fontSize: '0.688rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-brass)', display: 'block', marginBottom: 4 }}>
                  Operational Intervention Directive
                </span>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.813rem', color: 'var(--color-text)', lineHeight: 1.45 }}>
                  {selectedAssessment.recommendedAction}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    to="/dashboard/interventions"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, textAlign: 'center', padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    Deploy Crew <ArrowRight size={12} style={{ marginLeft: 4 }} />
                  </Link>
                  <Link
                    to="/dashboard/drains"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    View Dossier
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="drain-detail-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', textAlign: 'center', padding: 24 }}>
              Select a drain inlet marker on the map to inspect its geospatial dossier and factor assessment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
