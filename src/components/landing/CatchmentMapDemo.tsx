import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Layers, Droplets, Clock, ShieldAlert,
  Info, CheckCircle, ExternalLink, ChevronDown, ChevronUp,
  ZoomIn, ZoomOut, RotateCcw, HelpCircle, X
} from 'lucide-react';
import { syntheticDrains, getAssessmentForDrain } from '../../data/synthetic';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

// Layout and hydrologic flow metadata for each of the 8 monitored outfalls
interface DrainCartoMeta {
  labelDx: number;
  labelDy: number;
  labelAlign: 'left' | 'right';
  hasLeader: boolean;
  leaderDx?: number;
  leaderDy?: number;
  flowPath: string;
  subBasin: string;
  terminalX: number;
  terminalY: number;
  isVerifiedTrunk: boolean;
  receivingWaterway: string;
}

const DRAIN_CARTO_CONFIG: Record<string, DrainCartoMeta> = {
  'DR-007': { // Hebbal (Northern Ridge Corridor)
    labelDx: 18,
    labelDy: -8,
    labelAlign: 'left',
    hasLeader: false,
    flowPath: 'M 202 93 C 190 70, 175 50, 160 35',
    subBasin: 'Hebbal Northern Watershed',
    terminalX: 160,
    terminalY: 35,
    isVerifiedTrunk: false,
    receivingWaterway: 'Hebbal Lake & Nagavara System',
  },
  'DR-004': { // Majestic (Western Commercial Hub)
    labelDx: -82,
    labelDy: -8,
    labelAlign: 'right',
    hasLeader: false,
    flowPath: 'M 130 208 C 105 230, 85 250, 70 270',
    subBasin: 'Vrishabhavathi Western Crest',
    terminalX: 70,
    terminalY: 270,
    isVerifiedTrunk: false,
    receivingWaterway: 'Vrishabhavathi River Canal Corridor (West)',
  },
  'DR-006': { // Jayanagar (Southwest Residential Basin)
    labelDx: -82,
    labelDy: 6,
    labelAlign: 'right',
    hasLeader: false,
    flowPath: 'M 165 309 C 145 345, 130 385, 120 420',
    subBasin: 'Jayanagar Southwest Sub-Basin',
    terminalX: 120,
    terminalY: 420,
    isVerifiedTrunk: false,
    receivingWaterway: 'Yediyur / Vrishabhavathi Tributary',
  },
  'DR-002': { // Koramangala (Central Valley Market)
    labelDx: 18,
    labelDy: -24,
    labelAlign: 'left',
    hasLeader: true,
    leaderDx: 16,
    leaderDy: -12,
    flowPath: 'M 280 289 C 330 300, 380 304, 430 308 C 460 310, 490 315, 520 325',
    subBasin: 'Koramangala-Challaghatta Primary Trunk',
    terminalX: 520,
    terminalY: 325,
    isVerifiedTrunk: true,
    receivingWaterway: 'Bellandur Lake (via K-C Main Rajakaluve)',
  },
  'DR-005': { // Bellandur (Direct Lake Outfall Fringe)
    labelDx: 18,
    labelDy: -22,
    labelAlign: 'left',
    hasLeader: true,
    leaderDx: 16,
    leaderDy: -10,
    flowPath: 'M 426 307 C 460 315, 520 325, 600 350 C 640 365, 680 375, 700 380',
    subBasin: 'Bellandur-Varthur Spillway Cascade',
    terminalX: 700,
    terminalY: 380,
    isVerifiedTrunk: true,
    receivingWaterway: 'Varthur Lake (Spillway Cascade)',
  },
  'DR-001': { // Sarjapur Road (Southeast Feeder Corridor)
    labelDx: 18,
    labelDy: 10,
    labelAlign: 'left',
    hasLeader: false,
    flowPath: 'M 450 339 C 470 330, 495 328, 520 325',
    subBasin: 'Sarjapur-Bellandur South Corridor',
    terminalX: 520,
    terminalY: 325,
    isVerifiedTrunk: true,
    receivingWaterway: 'Bellandur Lake (Southern Wetland Inlet)',
  },
  'DR-003': { // Whitefield (East IT Valley Inlet)
    labelDx: -82,
    labelDy: -8,
    labelAlign: 'right',
    hasLeader: false,
    flowPath: 'M 634 222 C 650 235, 665 245, 680 260',
    subBasin: 'Whitefield Eastern Sub-Basin',
    terminalX: 680,
    terminalY: 260,
    isVerifiedTrunk: false,
    receivingWaterway: 'Whitefield Lake / Varthur Downstream Wetlands',
  },
  'DR-008': { // Electronic City (Southern Industrial Basin)
    labelDx: 18,
    labelDy: -8,
    labelAlign: 'left',
    hasLeader: false,
    flowPath: 'M 381 465 C 380 485, 380 505, 380 520',
    subBasin: 'Electronic City Southern Corridor',
    terminalX: 380,
    terminalY: 520,
    isVerifiedTrunk: false,
    receivingWaterway: 'Rayasandra Lake & Hebbagodi Chain',
  },
};

export default function CatchmentMapDemo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Selected drain state (defaults to highest risk DR-004)
  const [selectedDrainId, setSelectedDrainId] = useState<string>('DR-004');
  const [filterRisk, setFilterRisk] = useState<'all' | 'very-high' | 'high'>('all');
  const [hoveredDrainId, setHoveredDrainId] = useState<string | null>(null);
  const [showSecondaryDetails, setShowSecondaryDetails] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // Cartographic layer visibility toggles
  const [activeLayers, setActiveLayers] = useState({
    contours: true,
    channels: true,
    waterbodies: true,
    urban: true,
  });

  // Pan and Zoom interaction state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dedicated Theme-Driven Cartographic Visual Identity
  const cartoTheme = useMemo(() => {
    if (isDark) {
      return {
        canvasFill: '#111711',
        graticuleGrid: '#1C281E',
        commercialHatch: '#243326',
        basinGradNorthStart: '#17231A',
        basinGradNorthStop: '#111912',
        basinGradWestStart: '#18241B',
        basinGradWestStop: '#121A13',
        basinGradValleyStart: '#1C291F',
        basinGradValleyStop: '#131C14',
        basinGradLakeStart: '#1E2F23',
        basinGradLakeStop: '#152119',
        basinStroke: '#2D3D2F',
        basinText: '#839578',
        lakeGradStart: '#2A4434',
        lakeGradStop: '#1A2E22',
        lakeStroke: '#3E5C47',
        lakeWaterLine: '#A8B79E',
        lakeTitle: '#F1EBDD',
        lakeSub: '#A8B79E',
        contourMajor: '#2F4032',
        contourMinor: '#223025',
        contourText: '#768773',
        urbanFill: '#1A261C',
        urbanStroke: '#2B3B2E',
        urbanText: '#8E9C89',
        roadStroke: '#334335',
        channelPrimary: '#8CA086', // light sage-green
        channelSecondary: '#5B6E57', // subdued olive-green
        channelChevron: '#8CA086',
        junctionVaultFill: '#111711',
        junctionVaultStroke: '#8CA086',
        activeTraceHalo: 'rgba(196, 119, 93, 0.32)',
        activeTraceLine: '#C4775D', // muted copper
        markerColors: {
          'very-high': '#D17C64',
          'high': '#D0B27A',
          'moderate': '#A8B79E',
          'low': '#839578',
        },
        pinHaloFill: '#111711',
        badgeBgSelected: '#232E25',
        badgeBgNormal: '#1B241D',
        badgeBorderSelected: '#D0B27A',
        badgeTextSelected: '#F1EBDD',
        badgeTextNormal: '#F1EBDD',
        reticleCrosshair: '#F1EBDD',
        marginaliaBg: '#1B241D',
        marginaliaBorder: '#343F35',
        marginaliaText: '#F1EBDD',
        marginaliaSub: '#C1C3B8',
        marginaliaMuted: '#92998D',
        marginaliaNorthStar: '#D17C64',
        tooltipBg: '#1B241D',
        tooltipBorder: '#343F35',
        tooltipTitle: '#D17C64',
        tooltipName: '#F1EBDD',
        tooltipSub: '#C1C3B8',
        tooltipRisk: '#A8B79E',
      };
    }
    return {
      canvasFill: '#F4EFE6',
      graticuleGrid: '#E6DFD3',
      commercialHatch: '#D3CBBB',
      basinGradNorthStart: '#FFFFFF',
      basinGradNorthStop: '#FAF6EF',
      basinGradWestStart: '#FFFFFF',
      basinGradWestStop: '#F5EFE4',
      basinGradValleyStart: '#FCFAF5',
      basinGradValleyStop: '#EFE8DA',
      basinGradLakeStart: '#EDF4EE',
      basinGradLakeStop: '#E3EDE4',
      basinStroke: '#C5BCAE',
      basinText: '#7A846B',
      lakeGradStart: '#7E9B87',
      lakeGradStop: '#5E7D69',
      lakeStroke: '#465E4E',
      lakeWaterLine: '#FFFFFF',
      lakeTitle: '#FFFFFF',
      lakeSub: '#D4E4D8',
      contourMajor: '#C5BCA8',
      contourMinor: '#DCD5C3',
      contourText: '#8C8473',
      urbanFill: '#E8E2D4',
      urbanStroke: '#D3CABA',
      urbanText: '#686152',
      roadStroke: '#D6CEC0',
      channelPrimary: '#38463B',
      channelSecondary: '#485A4C',
      channelChevron: '#38463B',
      junctionVaultFill: '#FFFFFF',
      junctionVaultStroke: '#38463B',
      activeTraceHalo: 'rgba(185, 101, 75, 0.28)',
      activeTraceLine: '#B9654B',
      markerColors: {
        'very-high': '#B9654B',
        'high': '#AD8B56',
        'moderate': '#53664D',
        'low': '#53664D',
      },
      pinHaloFill: '#FFFFFF',
      badgeBgSelected: '#30372C',
      badgeBgNormal: '#FFFFFF',
      badgeBorderSelected: '#30372C',
      badgeTextSelected: '#FFFFFF',
      badgeTextNormal: '#30372C',
      reticleCrosshair: '#30372C',
      marginaliaBg: '#FFFFFF',
      marginaliaBorder: '#D3CABA',
      marginaliaText: '#30372C',
      marginaliaSub: '#688072',
      marginaliaMuted: '#8C8473',
      marginaliaNorthStar: '#B9654B',
      tooltipBg: '#FFFFFF',
      tooltipBorder: '#30372C',
      tooltipTitle: '#B9654B',
      tooltipName: '#30372C',
      tooltipSub: '#686152',
      tooltipRisk: '#4B6652',
    };
  }, [isDark]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const selectedDrain = useMemo(() => {
    return syntheticDrains.find(d => d.id === selectedDrainId) || syntheticDrains[3];
  }, [selectedDrainId]);

  const selectedAssessment = useMemo(() => {
    return getAssessmentForDrain(selectedDrain.id);
  }, [selectedDrain]);

  const handleOpenDashboard = () => {
    if (user) navigate('/dashboard/drains');
    else navigate('/signin');
  };

  // Filter drains by risk tier
  const filteredDrains = useMemo(() => {
    return syntheticDrains.filter(d => {
      const assess = getAssessmentForDrain(d.id);
      if (!assess) return true;
      if (filterRisk === 'all') return true;
      return assess.riskLevel === filterRisk;
    });
  }, [filterRisk]);

  // Project geographic coordinates onto the 760 x 560 cartographic canvas
  const mapNodes = useMemo(() => {
    const minLat = 12.8300;
    const maxLat = 13.0500;
    const minLng = 77.5500;
    const maxLng = 77.7700;

    const canvasWidth = 760;
    const canvasHeight = 560;
    const padX = 70;
    const padY = 65;
    const innerW = canvasWidth - padX * 2;
    const innerH = canvasHeight - padY * 2;

    return syntheticDrains.map(drain => {
      const xNorm = (drain.lng - minLng) / (maxLng - minLng);
      const yNorm = 1 - ((drain.lat - minLat) / (maxLat - minLat));
      
      const x = Math.round(padX + xNorm * innerW);
      const y = Math.round(padY + yNorm * innerH);

      const assess = getAssessmentForDrain(drain.id);
      const defaultMeta: DrainCartoMeta = {
        labelDx: 18,
        labelDy: -8,
        labelAlign: 'left',
        hasLeader: false,
        leaderDx: undefined,
        leaderDy: undefined,
        flowPath: `M ${x} ${y} L 520 325`,
        subBasin: 'Local Catchment Basin',
        terminalX: 520,
        terminalY: 325,
        isVerifiedTrunk: false,
        receivingWaterway: 'Local Regional Sink',
      };
      const meta: DrainCartoMeta = DRAIN_CARTO_CONFIG[drain.id] || defaultMeta;

      return {
        ...drain,
        svgX: x,
        svgY: y,
        labelDx: meta.labelDx,
        labelDy: meta.labelDy,
        labelAlign: meta.labelAlign,
        hasLeader: meta.hasLeader,
        leaderDx: meta.leaderDx,
        leaderDy: meta.leaderDy,
        flowPath: meta.flowPath,
        subBasin: meta.subBasin,
        terminalX: meta.terminalX,
        terminalY: meta.terminalY,
        isVerifiedTrunk: meta.isVerifiedTrunk,
        receivingWaterway: meta.receivingWaterway,
        assessment: assess,
      };
    });
  }, []);

  // Pan & Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(2.2, Number((prev + 0.25).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => {
      const next = Math.max(1, Number((prev - 0.25).toFixed(2)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Mouse drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1 && pan.x === 0 && pan.y === 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    // Bound the panning
    const limit = (zoom - 1) * 220;
    setPan({
      x: Math.max(-limit, Math.min(limit, newX)),
      y: Math.max(-limit, Math.min(limit, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const selectedNode = mapNodes.find(n => n.id === selectedDrainId) || mapNodes[3];
  const hoveredNode = hoveredDrainId ? mapNodes.find(n => n.id === hoveredDrainId) : null;

  return (
    <section className="section section--demo" id="demo">
      <div className="container-wide">
        
        {/* Section Header */}
        <div className="demo-header">
          <div className="demo-header__text">
            <span className="editorial-eyebrow">Interactive Catchment Atlas</span>
            <h2 className="editorial-headline">
              A closer look at a high-risk drain.
            </h2>
            <p className="demo-header__lead">
              Inspect monitored urban outfalls across the South-East Bangalore basin. 
              Select any drainage node to evaluate topographical ridgelines, tributary washoff vectors, and the recommended intervention directive.
            </p>
          </div>
          <div className="demo-disclaimer-pill">
            <Info size={14} />
            <span>Demonstration basin with illustrative parameters</span>
          </div>
        </div>

        {/* 2-Region Atlas Layout: Spacious Cartographic Map + Focused Intelligence Panel */}
        <div className="demo-atlas-layout">
          
          {/* ── LEFT REGION: 64% Wide Interactive Cartographic Map ── */}
          <div className="atlas-map-canvas-pane">
            
            {/* Map Top Precision Instrument Control Bar */}
            <div className="map-control-bar">
              <div className="map-caption">
                <span className="caption-dot" />
                <span className="caption-title">BANGALORE SE BASIN // GEOSPATIAL ATLAS</span>
                <span className="caption-badge">DEMO CATCHMENT</span>
              </div>

              {/* Layer Toggles & Filter Group */}
              <div className="map-filter-group">
                {/* Layer Switches */}
                <div className="toolbar-btn-group" role="group" aria-label="Map layers">
                  <button 
                    className={`filter-btn ${activeLayers.contours ? 'filter-btn--active' : ''}`}
                    onClick={() => setActiveLayers(prev => ({ ...prev, contours: !prev.contours }))}
                    title="Toggle 10m Elevation Contours"
                    aria-pressed={activeLayers.contours}
                  >
                    <Layers size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    Contours
                  </button>
                  <button 
                    className={`filter-btn ${activeLayers.channels ? 'filter-btn--active' : ''}`}
                    onClick={() => setActiveLayers(prev => ({ ...prev, channels: !prev.channels }))}
                    title="Toggle Stormwater Trunk Channels"
                    aria-pressed={activeLayers.channels}
                  >
                    Channels
                  </button>
                  <button 
                    className={`filter-btn ${activeLayers.waterbodies ? 'filter-btn--active' : ''}`}
                    onClick={() => setActiveLayers(prev => ({ ...prev, waterbodies: !prev.waterbodies }))}
                    title="Toggle Recipient Waterbodies"
                    aria-pressed={activeLayers.waterbodies}
                  >
                    Waterways
                  </button>
                  <button 
                    className={`filter-btn ${activeLayers.urban ? 'filter-btn--active' : ''}`}
                    onClick={() => setActiveLayers(prev => ({ ...prev, urban: !prev.urban }))}
                    title="Toggle Urban Road Network"
                    aria-pressed={activeLayers.urban}
                  >
                    Urban Grid
                  </button>
                </div>

                <span className="filter-divider" aria-hidden="true" />

                {/* Risk Filter */}
                <div className="toolbar-btn-group" role="group" aria-label="Risk filters">
                  <span className="filter-label">Filter:</span>
                  <button 
                    className={`filter-btn ${filterRisk === 'all' ? 'filter-btn--active' : ''}`}
                    onClick={() => setFilterRisk('all')}
                  >
                    All ({syntheticDrains.length})
                  </button>
                  <button 
                    className={`filter-btn ${filterRisk === 'very-high' ? 'filter-btn--active' : ''}`}
                    onClick={() => setFilterRisk('very-high')}
                  >
                    Very High
                  </button>
                  <button 
                    className={`filter-btn ${filterRisk === 'high' ? 'filter-btn--active' : ''}`}
                    onClick={() => setFilterRisk('high')}
                  >
                    High
                  </button>
                </div>

                <span className="filter-divider" aria-hidden="true" />

                {/* Pan/Zoom Controls */}
                <div className="toolbar-btn-group" role="group" aria-label="Map navigation">
                  <button 
                    className="filter-btn filter-btn--icon"
                    onClick={handleZoomIn}
                    title="Zoom in"
                    aria-label="Zoom in"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button 
                    className="filter-btn filter-btn--icon"
                    onClick={handleZoomOut}
                    title="Zoom out"
                    aria-label="Zoom out"
                  >
                    <ZoomOut size={13} />
                  </button>
                  {(zoom > 1 || pan.x !== 0 || pan.y !== 0) && (
                    <button 
                      className="filter-btn filter-btn--icon"
                      onClick={handleResetView}
                      title="Reset map view"
                      aria-label="Reset map view"
                    >
                      <RotateCcw size={12} />
                    </button>
                  )}
                  <button
                    className={`filter-btn ${showLegend ? 'filter-btn--active' : ''}`}
                    onClick={() => setShowLegend(!showLegend)}
                    title="Toggle cartographic legend"
                    aria-label="Toggle cartographic legend"
                  >
                    <HelpCircle size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                    Legend
                  </button>
                </div>

              </div>
            </div>

            {/* Interactive SVG Cartographic Map Canvas */}
            <div 
              className={`carto-canvas-wrapper ${isDragging ? 'carto-canvas-wrapper--dragging' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              {/* Collapsible Cartographic Legend Drawer Overlay */}
              {showLegend && (
                <div className="carto-legend-overlay" role="region" aria-label="Cartographic Legend">
                  <div className="legend-overlay-header">
                    <span className="legend-title">CARTOGRAPHIC KEY</span>
                    <button 
                      className="legend-close-btn"
                      onClick={() => setShowLegend(false)}
                      aria-label="Close legend"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="legend-grid">
                    <div className="legend-col">
                      <span className="legend-col-header">OUTLET RISK TIERS</span>
                      <div className="legend-item">
                        <span className="legend-swatch legend-swatch--very-high" />
                        <span>Very High Risk (75–100)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-swatch legend-swatch--high" />
                        <span>High Risk (55–74)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-swatch legend-swatch--moderate" />
                        <span>Moderate Risk (35–54)</span>
                      </div>
                    </div>

                    <div className="legend-col">
                      <span className="legend-col-header">HYDROGRAPHY</span>
                      <div className="legend-item">
                        <span className="legend-line legend-line--trunk" />
                        <span>Primary Trunk Culvert</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-line legend-line--tributary" />
                        <span>Secondary Tributary</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-line legend-line--active" />
                        <span>Active Washoff Trace</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-swatch legend-swatch--water" />
                        <span>Recipient Lake Sink</span>
                      </div>
                    </div>

                    <div className="legend-col">
                      <span className="legend-col-header">TOPOGRAPHY</span>
                      <div className="legend-item">
                        <span className="legend-line legend-line--contour-index" />
                        <span>Index Contour (20m interval)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-line legend-line--contour-inter" />
                        <span>Intermediate Contour</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-line legend-line--ridge" />
                        <span>Sub-Catchment Divide</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SVG Main Geospatial Map Surface */}
              <svg 
                viewBox="0 0 760 560" 
                className="carto-svg" 
                role="img" 
                aria-label="Bangalore South-East Demonstration Catchment Atlas Map"
              >
                <defs>
                  {/* Fine Cartographic Coordinate Graticule Grid Pattern */}
                  <pattern id="atlasGraticuleGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="40" y2="0" stroke={cartoTheme.graticuleGrid} strokeWidth="0.5" strokeDasharray="1 3" />
                    <line x1="0" y1="0" x2="0" y2="40" stroke={cartoTheme.graticuleGrid} strokeWidth="0.5" strokeDasharray="1 3" />
                  </pattern>

                  {/* Commercial Land-Use Hachure Pattern */}
                  <pattern id="commercialHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="6" stroke={cartoTheme.commercialHatch} strokeWidth="0.75" strokeOpacity="0.45" />
                  </pattern>

                  {/* Recipient Lake Natural Water Gradient */}
                  <linearGradient id="recipientLakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={cartoTheme.lakeGradStart} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={cartoTheme.lakeGradStop} stopOpacity="0.95" />
                  </linearGradient>

                  {/* Sub-Catchment Shading Gradients */}
                  <radialGradient id="basinGradNorth" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor={cartoTheme.basinGradNorthStart} stopOpacity="0.75" />
                    <stop offset="100%" stopColor={cartoTheme.basinGradNorthStop} stopOpacity="0.3" />
                  </radialGradient>

                  <radialGradient id="basinGradWest" cx="30%" cy="40%" r="70%">
                    <stop offset="0%" stopColor={cartoTheme.basinGradWestStart} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={cartoTheme.basinGradWestStop} stopOpacity="0.25" />
                  </radialGradient>

                  <radialGradient id="basinGradValley" cx="45%" cy="45%" r="60%">
                    <stop offset="0%" stopColor={cartoTheme.basinGradValleyStart} stopOpacity="0.65" />
                    <stop offset="100%" stopColor={cartoTheme.basinGradValleyStop} stopOpacity="0.3" />
                  </radialGradient>

                  <radialGradient id="basinGradLakeFringe" cx="40%" cy="40%" r="65%">
                    <stop offset="0%" stopColor={cartoTheme.basinGradLakeStart} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={cartoTheme.basinGradLakeStop} stopOpacity="0.4" />
                  </radialGradient>
                </defs>

                {/* ── BASE BACKGROUND & GRATICULE ── */}
                <rect width="760" height="560" fill={cartoTheme.canvasFill} />
                <rect width="760" height="560" fill="url(#atlasGraticuleGrid)" />

                {/* ── ZOOMABLE WORLD CONTAINER ── */}
                <g 
                  id="map-world"
                  transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                  style={{ 
                    transformOrigin: '380px 280px', 
                    transition: isDragging ? 'none' : 'transform 0.22s ease-out' 
                  }}
                >

                  {/* 1. Organic Sub-Catchment Basin Surfaces */}
                  <g className="carto-basins">
                    {/* North Sub-Catchment (Hebbal Corridor) */}
                    <path
                      d="M 50 30 C 180 15, 340 25, 400 70 C 440 100, 360 170, 280 190 C 210 200, 160 160, 100 120 C 40 80, 20 40, 50 30 Z"
                      fill="url(#basinGradNorth)"
                      stroke={cartoTheme.basinStroke}
                      strokeWidth="1.2"
                      strokeDasharray="5 4"
                    />
                    <text x="140" y="65" fontSize="8" fontFamily="var(--font-mono)" fill={cartoTheme.basinText} letterSpacing="0.08em" fontWeight="600">
                      HEBBAL NORTHERN RIDGELINE // SUB-BASIN
                    </text>

                    {/* Western Transit Crest (Majestic / Jayanagar) */}
                    <path
                      d="M 50 120 C 120 150, 170 180, 200 240 C 230 300, 210 360, 140 380 C 80 400, 30 330, 25 240 C 20 170, 30 130, 50 120 Z"
                      fill="url(#basinGradWest)"
                      stroke={cartoTheme.basinStroke}
                      strokeWidth="1.2"
                      strokeDasharray="5 4"
                    />
                    <text x="38" y="240" fontSize="7.5" fontFamily="var(--font-mono)" fill={cartoTheme.basinText} letterSpacing="0.08em" fontWeight="600" transform="rotate(-90 38 240)">
                      VRISHABHAVATHI CREST DIVIDE
                    </text>

                    {/* Central Koramangala Valley (Challaghatta Basin) */}
                    <path
                      d="M 210 190 C 310 180, 420 210, 460 260 C 490 300, 450 360, 380 365 C 290 370, 240 340, 210 280 C 190 240, 190 200, 210 190 Z"
                      fill="url(#basinGradValley)"
                      stroke={cartoTheme.basinStroke}
                      strokeWidth="1.2"
                      strokeDasharray="5 4"
                    />
                    <text x="245" y="210" fontSize="8" fontFamily="var(--font-mono)" fill={cartoTheme.basinText} letterSpacing="0.08em" fontWeight="600">
                      CENTRAL VALLEY RAJAKALUVE DRAINAGE CORRIDOR
                    </text>

                    {/* Bellandur-Varthur Recipient Lake Basin */}
                    <path
                      d="M 430 150 C 560 140, 680 160, 720 230 C 740 300, 700 400, 580 410 C 500 415, 450 360, 440 290 C 430 220, 420 160, 430 150 Z"
                      fill="url(#basinGradLakeFringe)"
                      stroke={cartoTheme.lakeStroke}
                      strokeWidth="1.2"
                      strokeDasharray="5 4"
                    />
                    <text x="510" y="180" fontSize="8" fontFamily="var(--font-mono)" fill={cartoTheme.basinText} letterSpacing="0.08em" fontWeight="600">
                      BELLANDUR LAKE TERMINAL RECIPIENT WATERSHED
                    </text>

                    {/* South Corridor Sub-Catchment (Sarjapur / E-City) */}
                    <path
                      d="M 220 370 C 320 360, 420 365, 470 410 C 510 450, 480 520, 380 535 C 270 540, 200 470, 200 410 C 200 380, 210 370, 220 370 Z"
                      fill="url(#basinGradWest)"
                      stroke={cartoTheme.basinStroke}
                      strokeWidth="1.2"
                      strokeDasharray="5 4"
                    />
                    <text x="260" y="525" fontSize="7.5" fontFamily="var(--font-mono)" fill={cartoTheme.basinText} letterSpacing="0.08em" fontWeight="600">
                      SOUTHERN INDUSTRIAL OUTLETS // CHANDAPURA CONFLUENCE
                    </text>
                  </g>

                  {/* 2. Topographic Elevation Contours (Layer: contours) */}
                  {activeLayers.contours && (
                    <g className="carto-contours">
                      {/* 940m Index Contour */}
                      <path d="M 60 40 Q 130 110, 120 190 T 100 310 T 50 420" fill="none" stroke={cartoTheme.contourMajor} strokeWidth="1.2" />
                      <text x="52" y="110" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.contourText}>940m</text>

                      {/* 930m Contour */}
                      <path d="M 160 40 Q 200 130, 190 220 T 170 330 T 120 460" fill="none" stroke={cartoTheme.contourMinor} strokeWidth="0.8" />
                      <text x="178" y="115" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.contourText}>930m</text>

                      {/* 920m Index Contour */}
                      <path d="M 260 50 Q 290 160, 270 250 T 250 360 T 210 490" fill="none" stroke={cartoTheme.contourMajor} strokeWidth="1.2" />
                      <text x="272" y="140" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.contourText}>920m</text>

                      {/* 910m Contour */}
                      <path d="M 360 60 Q 380 180, 350 270 T 340 390 T 310 520" fill="none" stroke={cartoTheme.contourMinor} strokeWidth="0.8" />
                      <text x="365" y="165" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.contourText}>910m</text>

                      {/* 900m Index Contour */}
                      <path d="M 460 80 Q 470 200, 430 290 T 430 410 T 420 530" fill="none" stroke={cartoTheme.contourMajor} strokeWidth="1.2" />
                      <text x="452" y="210" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.contourText}>900m</text>

                      {/* 890m Terminal Lake Contour */}
                      <path d="M 560 110 Q 550 230, 510 310 T 510 430 T 530 530" fill="none" stroke={cartoTheme.contourMinor} strokeWidth="0.8" />
                      <text x="535" y="235" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.contourText}>890m</text>
                    </g>
                  )}

                  {/* 3. Urban Context & Built-Up Surface Alignments (Layer: urban) */}
                  {activeLayers.urban && (
                    <g className="carto-urban">
                      {/* Commercial Footprint Polygons with Fine Hatching */}
                      <rect x="95" y="180" width="65" height="55" rx="3" fill={cartoTheme.urbanFill} fillOpacity="0.75" stroke={cartoTheme.urbanStroke} strokeWidth="0.8" />
                      <rect x="95" y="180" width="65" height="55" rx="3" fill="url(#commercialHatch)" />
                      <text x="100" y="230" fontSize="6.5" fontFamily="var(--font-mono)" fill={cartoTheme.urbanText}>MAJESTIC HUB</text>

                      <rect x="245" y="260" width="68" height="50" rx="3" fill={cartoTheme.urbanFill} fillOpacity="0.75" stroke={cartoTheme.urbanStroke} strokeWidth="0.8" />
                      <rect x="245" y="260" width="68" height="50" rx="3" fill="url(#commercialHatch)" />
                      <text x="250" y="306" fontSize="6.5" fontFamily="var(--font-mono)" fill={cartoTheme.urbanText}>KORAMANGALA COM.</text>

                      <rect x="600" y="195" width="65" height="52" rx="3" fill={cartoTheme.urbanFill} fillOpacity="0.75" stroke={cartoTheme.urbanStroke} strokeWidth="0.8" />
                      <rect x="600" y="195" width="65" height="52" rx="3" fill="url(#commercialHatch)" />
                      <text x="605" y="243" fontSize="6.5" fontFamily="var(--font-mono)" fill={cartoTheme.urbanText}>WHITEFIELD TECH</text>

                      {/* Major Urban Arterial Road Corridors */}
                      <g stroke={cartoTheme.roadStroke} strokeWidth="1.5" strokeLinecap="round" fill="none">
                        {/* Outer Ring Road Corridor */}
                        <path d="M 110 60 Q 320 110, 490 230 T 510 430 T 350 510" strokeDasharray="6 2" />
                        {/* Hosur Road Highway */}
                        <path d="M 130 210 L 390 510" />
                        {/* Airport Arterial Link */}
                        <path d="M 190 30 L 205 130 L 130 210" />
                        {/* Sarjapur Road Axis */}
                        <path d="M 270 295 L 670 345" />
                      </g>
                    </g>
                  )}

                  {/* 4. Complete Drainage Conduit Network (Layer: channels) */}
                  {activeLayers.channels && (
                    <g className="carto-channels">
                      {/* Background Inactive Network */}
                      <g fill="none" strokeLinecap="round">
                        {/* 1. Verified Primary Trunk: Koramangala Outfall to Bellandur Confluence */}
                        <path d="M 280 289 C 330 300, 380 304, 430 308 C 460 310, 490 315, 520 325" stroke={cartoTheme.channelPrimary} strokeWidth="3.6" />
                        {/* 2. Verified Overflow Cascade: Bellandur Lake to Varthur Lake */}
                        <path d="M 520 325 C 570 340, 630 360, 700 380" stroke={cartoTheme.channelPrimary} strokeWidth="3.2" />
                        {/* 3. Sarjapur Feeder into Bellandur Southern Reach */}
                        <path d="M 450 339 C 470 330, 495 328, 520 325" stroke={cartoTheme.channelSecondary} strokeWidth="2.2" strokeDasharray="4 2" />
                        {/* 4. Vrishabhavathi Western Canal (Majestic Outflow - Separate Watershed) */}
                        <path d="M 130 208 C 105 230, 85 250, 70 270" stroke={cartoTheme.channelSecondary} strokeWidth="2.4" strokeDasharray="5 3" />
                        {/* 5. Jayanagar Southwest Sub-Basin Feeder */}
                        <path d="M 165 309 C 145 345, 130 385, 120 420" stroke={cartoTheme.channelSecondary} strokeWidth="2.2" strokeDasharray="5 3" />
                        {/* 6. Hebbal Northern Watershed Conduit */}
                        <path d="M 202 93 C 190 70, 175 50, 160 35" stroke={cartoTheme.channelSecondary} strokeWidth="2.2" strokeDasharray="5 3" />
                        {/* 7. Electronic City Southern Industrial Conduit */}
                        <path d="M 381 465 C 380 485, 380 505, 380 520" stroke={cartoTheme.channelSecondary} strokeWidth="2.2" strokeDasharray="5 3" />
                        {/* 8. Whitefield Eastern Sub-Basin Feeder */}
                        <path d="M 634 222 C 650 235, 665 245, 680 260" stroke={cartoTheme.channelSecondary} strokeWidth="2.2" strokeDasharray="5 3" />
                      </g>

                      {/* Downhill Directional Flow Chevrons along Conduits */}
                      <g fill={cartoTheme.channelChevron} opacity="0.75">
                        <polygon points="340,301 346,303 340,305" />
                        <polygon points="390,305 396,307 390,309" />
                        <polygon points="450,311 456,313 450,315" />
                        <polygon points="600,350 606,352 600,354" />
                        <polygon points="95,245 92,251 98,249" />
                        <polygon points="185,55 180,50 186,47" />
                      </g>

                      {/* Conduit Junction Vault Nodes */}
                      <g fill={cartoTheme.junctionVaultFill} stroke={cartoTheme.junctionVaultStroke} strokeWidth="1.5">
                        <circle cx="280" cy="289" r="4" />
                        <circle cx="430" cy="308" r="3.5" />
                        <circle cx="450" cy="339" r="3.5" />
                        <circle cx="130" cy="208" r="3.5" />
                      </g>
                    </g>
                  )}

                  {/* 5. Receiving Waterways & Lake Sinks (Layer: waterbodies) */}
                  {activeLayers.waterbodies && (
                    <g className="carto-waterbodies">
                      {/* Bellandur Lake Wetland Body */}
                      <path
                        d="M 480 305 C 500 280, 550 285, 590 310 C 620 330, 610 370, 570 380 C 530 390, 480 375, 465 345 C 460 325, 470 310, 480 305 Z"
                        fill="url(#recipientLakeGrad)"
                        stroke={cartoTheme.lakeStroke}
                        strokeWidth="1.6"
                      />
                      {/* Lake Water Ripple Hachures */}
                      <path d="M 510 320 Q 535 323, 550 320" stroke={cartoTheme.lakeWaterLine} strokeOpacity="0.45" strokeWidth="1" fill="none" />
                      <path d="M 525 345 Q 555 348, 575 345" stroke={cartoTheme.lakeWaterLine} strokeOpacity="0.45" strokeWidth="1" fill="none" />
                      <path d="M 500 360 Q 520 363, 540 360" stroke={cartoTheme.lakeWaterLine} strokeOpacity="0.45" strokeWidth="1" fill="none" />

                      <text x="540" y="348" fontSize="8.5" fontFamily="var(--font-mono)" fill={cartoTheme.lakeTitle} fontWeight="700" textAnchor="middle" letterSpacing="0.05em">
                        BELLANDUR LAKE
                      </text>
                      <text x="540" y="358" fontSize="6.5" fontFamily="var(--font-mono)" fill={cartoTheme.lakeSub} textAnchor="middle">
                        HYDROLOGICAL SINK // 885M MSL
                      </text>

                      {/* Varthur Outfall Wetland Outlet (Continuing eastward to Pinakini) */}
                      <path
                        d="M 640 355 C 665 345, 715 355, 745 375 C 735 400, 690 410, 660 395 Z"
                        fill="url(#recipientLakeGrad)"
                        stroke={cartoTheme.lakeStroke}
                        strokeWidth="1.4"
                      />
                      <text x="700" y="380" fontSize="7.5" fontFamily="var(--font-mono)" fill={cartoTheme.lakeSub} fontWeight="700">
                        VARTHUR LAKE
                      </text>

                      {/* Hebbal Lake Sink (Northern Valley) */}
                      <path
                        d="M 135 20 C 155 12, 185 22, 175 42 C 155 48, 130 38, 135 20 Z"
                        fill="url(#recipientLakeGrad)"
                        stroke={cartoTheme.lakeStroke}
                        strokeWidth="1.2"
                      />
                      <text x="155" y="32" fontSize="6.5" fontFamily="var(--font-mono)" fill={cartoTheme.lakeSub} fontWeight="600" textAnchor="middle">
                        HEBBAL LAKE
                      </text>

                      {/* Whitefield Wetland Basin */}
                      <path
                        d="M 660 245 C 675 235, 705 245, 700 268 C 685 275, 655 265, 660 245 Z"
                        fill="url(#recipientLakeGrad)"
                        stroke={cartoTheme.lakeStroke}
                        strokeWidth="1.2"
                      />
                      <text x="680" y="258" fontSize="6" fontFamily="var(--font-mono)" fill={cartoTheme.lakeSub} fontWeight="600" textAnchor="middle">
                        WHITEFIELD
                      </text>
                    </g>
                  )}

                  {/* 6. Dynamic Active Selected Runoff Streamline Trace */}
                  {selectedNode && (
                    <g className="carto-active-trace-layer" aria-hidden="true">
                      {/* Soft Wide Underlying Halo */}
                      <path
                        d={selectedNode.flowPath}
                        fill="none"
                        stroke={cartoTheme.activeTraceHalo}
                        strokeWidth="7"
                        strokeLinecap="round"
                      />
                      {/* Crisp Terracotta / Copper Animated Dashed Path */}
                      <path
                        d={selectedNode.flowPath}
                        fill="none"
                        stroke={cartoTheme.activeTraceLine}
                        strokeWidth="2.8"
                        strokeDasharray="6 4"
                        className="carto-active-stream-flow"
                      />
                      {/* Confluence Inflow Terminal Node Indicator (Dynamic based on selected basin sink) */}
                      <circle cx={selectedNode.terminalX || 520} cy={selectedNode.terminalY || 325} r="5" fill={cartoTheme.activeTraceLine} />
                      <circle cx={selectedNode.terminalX || 520} cy={selectedNode.terminalY || 325} r="9" fill="none" stroke={cartoTheme.activeTraceLine} strokeWidth="1.2" strokeDasharray="2 2" />
                    </g>
                  )}

                  {/* 7. Drainage Outfall Markers & Collision-Free Label Badges */}
                  <g className="carto-markers-layer">
                    {mapNodes.map((node) => {
                      const isSelected = node.id === selectedDrainId;
                      const isHovered = node.id === hoveredDrainId;
                      const isFiltered = filteredDrains.some(fd => fd.id === node.id);
                      const riskLevel = (node.assessment?.riskLevel || 'moderate') as keyof typeof cartoTheme.markerColors;
                      const markerColor = cartoTheme.markerColors[riskLevel] || cartoTheme.markerColors.moderate;

                      // Compute label bounding box position
                      const badgeWidth = isSelected ? 72 : 62;
                      const badgeHeight = isSelected ? 20 : 17;
                      const badgeX = node.labelAlign === 'right' 
                        ? node.svgX + node.labelDx 
                        : node.svgX + node.labelDx;
                      const badgeY = node.svgY + node.labelDy;

                      return (
                        <g 
                          key={node.id} 
                          className={`map-node-group ${isSelected ? 'map-node--selected' : ''}`}
                          onClick={() => setSelectedDrainId(node.id)}
                          onMouseEnter={() => setHoveredDrainId(node.id)}
                          onMouseLeave={() => setHoveredDrainId(null)}
                          onFocus={() => setHoveredDrainId(node.id)}
                          onBlur={() => setHoveredDrainId(null)}
                          tabIndex={0}
                          role="button"
                          aria-label={`Outfall ${node.id}: ${node.name}. Risk Score: ${node.assessment?.riskIndex} / 100`}
                          style={{ 
                            cursor: 'pointer', 
                            opacity: isFiltered ? 1 : 0.22,
                            outline: 'none',
                          }}
                        >
                          {/* Leader Line for Offset Labels */}
                          {node.hasLeader && (
                            <line 
                              x1={node.svgX} 
                              y1={node.svgY} 
                              x2={node.svgX + (node.leaderDx || 0)} 
                              y2={node.svgY + (node.leaderDy || 0)} 
                              stroke={cartoTheme.marginaliaMuted} 
                              strokeWidth="0.8" 
                              strokeDasharray="2 2"
                            />
                          )}

                          {/* Selected Reticle Highlight & Ambient Pulse */}
                          {isSelected && (
                            <g className="carto-selected-reticle">
                              <circle 
                                cx={node.svgX} 
                                cy={node.svgY} 
                                r="28" 
                                fill={markerColor} 
                                fillOpacity={isDark ? "0.14" : "0.1"} 
                                className="carto-beacon-ambient" 
                              />
                              <circle 
                                cx={node.svgX} 
                                cy={node.svgY} 
                                r="20" 
                                fill="none" 
                                stroke={markerColor} 
                                strokeWidth="1.2" 
                                className="carto-beacon-pulse" 
                              />
                              <circle 
                                cx={node.svgX} 
                                cy={node.svgY} 
                                r="13" 
                                fill="none" 
                                stroke={markerColor} 
                                strokeWidth="1.5" 
                                strokeDasharray="3 2"
                              />
                              {/* Cardinal Crosshair Hairlines */}
                              <line x1={node.svgX - 24} y1={node.svgY} x2={node.svgX - 14} y2={node.svgY} stroke={cartoTheme.reticleCrosshair} strokeWidth="1" />
                              <line x1={node.svgX + 14} y1={node.svgY} x2={node.svgX + 24} y2={node.svgY} stroke={cartoTheme.reticleCrosshair} strokeWidth="1" />
                              <line x1={node.svgX} y1={node.svgY - 24} x2={node.svgX} y2={node.svgY - 14} stroke={cartoTheme.reticleCrosshair} strokeWidth="1" />
                              <line x1={node.svgX} y1={node.svgY + 14} x2={node.svgX} y2={node.svgY + 24} stroke={cartoTheme.reticleCrosshair} strokeWidth="1" />
                            </g>
                          )}

                          {/* Hover Pin Halo Enhancement */}
                          {isHovered && !isSelected && (
                            <circle cx={node.svgX} cy={node.svgY} r="14" fill={markerColor} fillOpacity="0.18" />
                          )}

                          {/* Outer Pin Halo Ring */}
                          <circle 
                            cx={node.svgX} 
                            cy={node.svgY} 
                            r={isSelected ? 8.5 : 7.5} 
                            fill={cartoTheme.pinHaloFill} 
                            stroke={markerColor} 
                            strokeWidth={isSelected ? 2.8 : 2.2} 
                          />
                          
                          {/* Inner Central Target Core */}
                          <circle 
                            cx={node.svgX} 
                            cy={node.svgY} 
                            r={isSelected ? 3.5 : 2.8} 
                            fill={markerColor} 
                          />

                          {/* High-Contrast Label Pill Badge */}
                          <g transform={`translate(${badgeX}, ${badgeY})`}>
                            {/* Badge Container Box */}
                            <rect 
                              x="0" 
                              y="0" 
                              width={badgeWidth} 
                              height={badgeHeight} 
                              rx="4" 
                              fill={isSelected ? cartoTheme.badgeBgSelected : cartoTheme.badgeBgNormal} 
                              stroke={isSelected ? cartoTheme.badgeBorderSelected : markerColor}
                              strokeWidth={isSelected ? 1.5 : 1}
                              filter="drop-shadow(0 1px 3px rgba(0,0,0,0.2))"
                            />
                            
                            {/* Identifier Label */}
                            <text 
                              x="6" 
                              y={isSelected ? 13 : 11.5} 
                              fontSize="8" 
                              fontFamily="var(--font-mono)" 
                              fill={isSelected ? cartoTheme.badgeTextSelected : cartoTheme.badgeTextNormal} 
                              fontWeight="700"
                              letterSpacing="0.04em"
                            >
                              {node.id}
                            </text>

                            {/* Score Tag Container */}
                            <rect
                              x={isSelected ? 44 : 36}
                              y={isSelected ? 3 : 2.5}
                              width={isSelected ? 23 : 20}
                              height={isSelected ? 14 : 12}
                              rx="2.5"
                              fill={isSelected ? markerColor : (isDark ? '#232E25' : (riskLevel === 'very-high' ? '#FAF0ED' : '#F6F3EC'))}
                            />
                            {/* Score Value */}
                            <text 
                              x={isSelected ? 55.5 : 46} 
                              y={isSelected ? 13 : 11.5} 
                              fontSize="7.5" 
                              fontFamily="var(--font-mono)" 
                              fill={isSelected ? '#FFFFFF' : (isDark ? '#F1EBDD' : markerColor)} 
                              fontWeight="800"
                              textAnchor="middle"
                            >
                              {node.assessment?.riskIndex}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>

                </g>
                {/* ── END OF ZOOMABLE WORLD ── */}

                {/* ── FIXED CARTOGRAPHIC MARGINALIA & METRICS (Pinned to map frame) ── */}
                
                {/* 1. Compass Rose & North Arrow (Top Right) */}
                <g transform="translate(712, 42)" aria-hidden="true">
                  <circle cx="0" cy="0" r="16" fill={cartoTheme.marginaliaBg} fillOpacity="0.9" stroke={cartoTheme.marginaliaBorder} strokeWidth="0.8" />
                  <line x1="0" y1="12" x2="0" y2="-12" stroke={cartoTheme.marginaliaText} strokeWidth="1" />
                  <line x1="-12" y1="0" x2="12" y2="0" stroke={cartoTheme.marginaliaText} strokeWidth="1" />
                  {/* Pointed North Star Needle */}
                  <polygon points="0,-13 -3,0 0,-2" fill={cartoTheme.marginaliaNorthStar} />
                  <polygon points="0,-13 3,0 0,-2" fill={cartoTheme.marginaliaText} />
                  <polygon points="0,13 -3,0 0,2" fill={cartoTheme.basinText} />
                  <polygon points="0,13 3,0 0,2" fill={cartoTheme.marginaliaMuted} />
                  <text x="0" y="-17" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaText} fontWeight="800" textAnchor="middle">N</text>
                </g>

                {/* 2. Scale Bar & Technical Datum (Bottom Left) */}
                <g transform="translate(24, 495)" aria-hidden="true">
                  <rect x="0" y="0" width="168" height="42" rx="3" fill={cartoTheme.marginaliaBg} fillOpacity="0.92" stroke={cartoTheme.marginaliaBorder} strokeWidth="0.8" />
                  <line x1="12" y1="16" x2="82" y2="16" stroke={cartoTheme.marginaliaText} strokeWidth="2" />
                  <line x1="12" y1="12" x2="12" y2="20" stroke={cartoTheme.marginaliaText} strokeWidth="1.5" />
                  <line x1="47" y1="13" x2="47" y2="19" stroke={cartoTheme.marginaliaText} strokeWidth="1" />
                  <line x1="82" y1="12" x2="82" y2="20" stroke={cartoTheme.marginaliaText} strokeWidth="1.5" />
                  <text x="12" y="28" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaSub}>0</text>
                  <text x="44" y="28" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaSub}>2.5</text>
                  <text x="76" y="28" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaSub}>5.0 km</text>

                  <text x="100" y="16" fontSize="6.5" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaMuted} letterSpacing="0.04em">SCALE: 1:50,000</text>
                  <text x="100" y="27" fontSize="6.5" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaMuted}>PROJ: UTM 43N</text>
                </g>

                {/* 3. Basin Title Cartouche Block (Top Left) */}
                <g transform="translate(24, 24)" aria-hidden="true">
                  <rect x="0" y="0" width="220" height="34" rx="3" fill={cartoTheme.marginaliaBg} fillOpacity="0.92" stroke={cartoTheme.marginaliaBorder} strokeWidth="0.8" />
                  <text x="10" y="14" fontSize="7.5" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaText} fontWeight="700" letterSpacing="0.06em">
                    BANGALORE SOUTHERN BASIN
                  </text>
                  <text x="10" y="25" fontSize="6.5" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaSub}>
                    CATCHMENT HYDRAULIC ELEV. 885M – 945M
                  </text>
                </g>

                {/* 4. Outer Graticule Frame & Border Coordinate Marks */}
                <rect x="2" y="2" width="756" height="556" fill="none" stroke={cartoTheme.marginaliaBorder} strokeWidth="1.2" />
                <text x="6" y="14" fontSize="6" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaMuted}>13°02'N</text>
                <text x="6" y="552" fontSize="6" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaMuted}>12°50'N</text>
                <text x="720" y="552" fontSize="6" fontFamily="var(--font-mono)" fill={cartoTheme.marginaliaMuted}>77°45'E</text>

                {/* 5. Active Hover Tooltip Card (Rendered on top of all layers) */}
                {hoveredNode && hoveredNode.id !== selectedDrainId && (
                  <g transform={`translate(${Math.min(540, hoveredNode.svgX + 20)}, ${Math.max(40, hoveredNode.svgY - 50)})`} aria-hidden="true">
                    <rect 
                      x="0" 
                      y="0" 
                      width="180" 
                      height="64" 
                      rx="4" 
                      fill={cartoTheme.tooltipBg} 
                      stroke={cartoTheme.tooltipBorder} 
                      strokeWidth="1.2" 
                      filter="drop-shadow(0 4px 12px rgba(0,0,0,0.35))"
                    />
                    <text x="10" y="16" fontSize="8" fontFamily="var(--font-mono)" fill={cartoTheme.tooltipTitle} fontWeight="700">
                      {hoveredNode.id} // {hoveredNode.assessment?.riskLevel.toUpperCase().replace('-', ' ')}
                    </text>
                    <text x="10" y="29" fontSize="8.5" fontFamily="var(--font-heading)" fill={cartoTheme.tooltipName} fontWeight="600">
                      {hoveredNode.name}
                    </text>
                    <text x="10" y="42" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.tooltipSub}>
                      Catchment: {hoveredNode.catchmentArea} km² • {hoveredNode.area}
                    </text>
                    <text x="10" y="54" fontSize="7" fontFamily="var(--font-mono)" fill={cartoTheme.tooltipRisk} fontWeight="600">
                      Risk Index: {hoveredNode.assessment?.riskIndex}/100 • Click to inspect
                    </text>
                  </g>
                )}

              </svg>
            </div>

            {/* Quick Outfall Selection Rail Below Map */}
            <div className="map-quick-selector">
              <span className="quick-label">MONITORED OUTFALLS:</span>
              <div className="quick-buttons-row">
                {syntheticDrains.map((drain) => {
                  const assess = getAssessmentForDrain(drain.id);
                  const isSelected = drain.id === selectedDrainId;
                  return (
                    <button
                      key={drain.id}
                      onClick={() => setSelectedDrainId(drain.id)}
                      className={`quick-drain-pill ${isSelected ? 'quick-drain-pill--active' : ''}`}
                      aria-pressed={isSelected}
                    >
                      <span className={`pill-dot pill-dot--${assess?.riskLevel}`} />
                      <span className="pill-id">{drain.id}</span>
                      <span className="pill-score">{assess?.riskIndex}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── RIGHT REGION: Well-Composed Intelligence Dossier Panel (Preserved) ── */}
          <div className="atlas-dossier-pane">
            <div className="dossier-card">
              
              {/* 1. Drain Name & Risk Category */}
              <div className="dossier-card__header">
                <div>
                  <div className="dossier-id-row">
                    <span className="dossier-code">{selectedDrain.id}</span>
                    <span className="dossier-type">{selectedDrain.type} Outfall</span>
                  </div>
                  <h3 className="dossier-name">{selectedDrain.name}</h3>
                  <span className="dossier-location">
                    <MapPin size={12} />
                    {selectedDrain.area}
                  </span>
                </div>

                <div className="dossier-risk-badge">
                  <span className="risk-badge__score">{selectedAssessment?.riskIndex ?? 81}</span>
                  <span className="risk-badge__denom">/100</span>
                  <span className={`risk-badge__category risk-badge__category--${selectedAssessment?.riskLevel}`}>
                    {selectedAssessment?.riskLevel.toUpperCase().replace('-', ' ')} RISK
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: 2, textAlign: 'right' }}>
                    Relative Priority Index
                  </span>
                </div>
              </div>

              {/* 2. Hydrological Connectivity & Watershed Basin Provenance */}
              <div style={{
                background: isDark ? 'rgba(30, 42, 34, 0.45)' : 'rgba(235, 243, 237, 0.7)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.688rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                    Hydrological Watershed
                  </span>
                  {selectedDrain.hydrologicalConnectionVerified ? (
                    <span style={{ color: 'var(--color-brass)', fontWeight: 700, fontSize: '0.688rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={11} /> Verified Trunk
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.688rem' }}>
                      DEM Sub-Basin Feeder
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                  {selectedDrain.catchmentName || 'Koramangala-Challaghatta (K-C) Valley'}
                </div>
                <div style={{ fontSize: '0.688rem', color: 'var(--color-text-secondary)' }}>
                  Recipient Sink: <strong style={{ color: selectedDrain.hydrologicalConnectionVerified ? 'var(--color-brass)' : 'var(--color-text)' }}>{selectedDrain.receivingWaterbody || 'Bellandur Lake'}</strong>
                </div>
              </div>

              {/* 3. Relevant Event Context */}
              <div className="dossier-event-context">
                <div className="context-box">
                  <div className="context-box__icon">
                    <Droplets size={14} color="var(--color-olive)" />
                  </div>
                  <div className="context-box__text">
                    <span className="context-box__label">Forecast Intensity</span>
                    <span className="context-box__val">{selectedAssessment?.rainfallIntensity ?? 28} mm/h peak</span>
                  </div>
                </div>
                <div className="context-box">
                  <div className="context-box__icon">
                    <Clock size={14} color="var(--color-olive)" />
                  </div>
                  <div className="context-box__text">
                    <span className="context-box__label">Antecedent Dry</span>
                    <span className="context-box__val">{selectedAssessment?.antecedentDryDays ?? 11} days</span>
                  </div>
                </div>
                <div className="context-box">
                  <div className="context-box__icon">
                    <ShieldAlert size={14} color="var(--color-olive)" />
                  </div>
                  <div className="context-box__text">
                    <span className="context-box__label">Inlet State</span>
                    <span className="context-box__val">{selectedDrain.condition.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* 3. Leading Contributing Factors */}
              <div className="dossier-evidence-section">
                <div className="evidence-header">
                  <span className="evidence-title">Leading Contributing Evidence</span>
                  <span className="evidence-note">Weighted factors</span>
                </div>

                <div className="evidence-list">
                  {selectedAssessment?.factors.slice(0, 3).map((factor, i) => (
                    <div key={i} className="evidence-item">
                      <div className="evidence-item__top">
                        <span className="evidence-name">{factor.name}</span>
                        <span className="evidence-score">{Math.round(factor.normalizedScore)}/100</span>
                      </div>
                      <div className="evidence-bar">
                        <div 
                          className="evidence-bar__fill"
                          style={{
                            width: `${factor.normalizedScore}%`,
                            background: factor.normalizedScore > 75 ? 'var(--color-terracotta)' :
                              factor.normalizedScore > 45 ? 'var(--color-brass)' : 'var(--color-sage)'
                          }}
                        />
                      </div>
                      <span className="evidence-desc">{factor.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Recommended First Action */}
              <div className="dossier-action-section">
                <div className="action-tag">
                  <CheckCircle size={13} />
                  <span>Recommended First Action</span>
                </div>
                <p className="action-description">
                  {selectedAssessment?.recommendedAction}
                </p>
                <div className="action-meta">
                  <span className="action-window">Dispatch Window: Prior to rain onset (~6h)</span>
                </div>
              </div>

              {/* 5. Visible Synthetic-Data Notice */}
              <div className="dossier-synthetic-banner">
                <Info size={13} className="synthetic-icon" />
                <span><strong>Synthetic Data Notice:</strong> Catchment baselines, weather forecasts, and risk scores are simulated for demonstration.</span>
              </div>

              {/* Action Link to Full Dashboard */}
              <button 
                onClick={handleOpenDashboard}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              >
                Inspect Drain in Intelligence Dashboard
                <ExternalLink size={14} />
              </button>

              {/* 6. Secondary Technical Details (Placed below main decision information) */}
              <div className="secondary-details-wrapper">
                <button 
                  onClick={() => setShowSecondaryDetails(!showSecondaryDetails)}
                  className="secondary-toggle-btn"
                >
                  <span>{showSecondaryDetails ? 'Hide Secondary Technical Attributes' : 'View Secondary Technical Attributes'}</span>
                  {showSecondaryDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showSecondaryDetails && (
                  <div className="secondary-details-pane">
                    <div className="sec-item">
                      <span className="sec-label">Catchment Area:</span>
                      <span className="sec-val">{selectedDrain.catchmentArea} km²</span>
                    </div>
                    <div className="sec-item">
                      <span className="sec-label">Drainage Capacity:</span>
                      <span className="sec-val">{selectedDrain.drainageCapacity}</span>
                    </div>
                    <div className="sec-item">
                      <span className="sec-label">Catchment Land Use:</span>
                      <span className="sec-val">{selectedDrain.nearbyLandUse.join(', ')}</span>
                    </div>
                    <div className="sec-item">
                      <span className="sec-label">Inlet Condition:</span>
                      <span className="sec-val">{selectedDrain.condition.toUpperCase()}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
