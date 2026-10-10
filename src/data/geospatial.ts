/**
 * JALAPRAHARI — Canonical Geospatial Data Model & GeoJSON Architecture
 * 
 * ⚠ CARTOGRAPHIC & HYDROLOGICAL PROVENANCE NOTICE:
 * Bengaluru's urban hydrology is divided into three primary drainage valleys:
 * 1. Koramangala-Challaghatta (K-C) Valley — Draining southeast into Bellandur Lake & Varthur Lake.
 * 2. Vrishabhavathi Valley — Draining southwest towards Arkavathi / Cauvery basin (Majestic, Jayanagar).
 * 3. Hebbal Valley — Draining north towards Hebbal & Nagavara lakes (Hebbal corridor).
 * 
 * Drainage routes are classified strictly:
 * - 'verified-primary-trunk': Physically surveyed municipal rajakaluve (K-C Valley to Bellandur).
 * - 'modeled-feeder': Local stormwater feeder conduit aligned with DEM topography.
 * - 'illustrative-local-flow': Sub-basin washoff vector indicating flow towards the local watershed sink.
 * Unconnected drains are NEVER routed artificially to Bellandur Lake.
 */

import type { DrainLocation, CatchmentInfo } from '../types';

// ── Canonical Catchment Definitions ──
export const CANONICAL_CATCHMENTS: CatchmentInfo[] = [
  {
    id: 'CAT-KC-VALLEY',
    name: 'Koramangala-Challaghatta (K-C) Valley',
    basinType: 'primary-monitored-valley',
    receivingWaterbody: 'Bellandur Lake & Varthur Lake',
    hydrologicalConnectionVerified: true,
    boundaryProvenance: 'dem-valley-delineation',
    elevationRangeM: [885, 915],
  },
  {
    id: 'CAT-VRISHABHAVATHI',
    name: 'Vrishabhavathi Western Watershed',
    basinType: 'secondary-watershed',
    receivingWaterbody: 'Vrishabhavathi River Canal Corridor',
    hydrologicalConnectionVerified: false,
    boundaryProvenance: 'dem-valley-delineation',
    elevationRangeM: [910, 942],
  },
  {
    id: 'CAT-HEBBAL',
    name: 'Hebbal Northern Watershed',
    basinType: 'secondary-watershed',
    receivingWaterbody: 'Hebbal Lake & Nagavara Lake System',
    hydrologicalConnectionVerified: false,
    boundaryProvenance: 'watershed-atlas-reference',
    elevationRangeM: [905, 930],
  },
  {
    id: 'CAT-WHITEFIELD',
    name: 'Whitefield Eastern Sub-Basin',
    basinType: 'sub-catchment',
    receivingWaterbody: 'Whitefield Lake / Varthur Downstream Wetlands',
    hydrologicalConnectionVerified: false,
    boundaryProvenance: 'illustrative-corridor-boundary',
    elevationRangeM: [880, 905],
  },
  {
    id: 'CAT-ECITY',
    name: 'Electronic City Southern Corridor',
    basinType: 'sub-catchment',
    receivingWaterbody: 'Rayasandra Lake & Hebbagodi Chain',
    hydrologicalConnectionVerified: false,
    boundaryProvenance: 'illustrative-corridor-boundary',
    elevationRangeM: [895, 915],
  },
];

// ── Canonical Drain Geospatial Records ──
export const CANONICAL_DRAIN_GEO_MAP: Record<string, Partial<DrainLocation>> = {
  'DR-001': {
    catchmentId: 'CAT-KC-VALLEY',
    catchmentName: 'Koramangala-Challaghatta (K-C) Valley',
    subBasin: 'Sarjapur-Bellandur South Corridor',
    receivingWaterbody: 'Bellandur Lake (Southern Wetland Inlet)',
    hydrologicalConnectionVerified: true,
    provenance: {
      coordinateSource: 'Municipal landmark geocode (provisional reference)',
      verificationStatus: 'provisional-survey',
      networkTopology: 'modeled-feeder',
      receivingWaterway: 'Bellandur Lake Southern Inlet',
      elevationM: 898,
      notes: 'Feeder conduit flowing northeast into Bellandur lake perimeter buffer.',
    },
  },
  'DR-002': {
    catchmentId: 'CAT-KC-VALLEY',
    catchmentName: 'Koramangala-Challaghatta (K-C) Valley',
    subBasin: 'Koramangala Primary Trunk Conduit',
    receivingWaterbody: 'Bellandur Lake (via K-C Main Rajakaluve)',
    hydrologicalConnectionVerified: true,
    provenance: {
      coordinateSource: 'Municipal primary culvert survey marker',
      verificationStatus: 'verified-monitored-inlet',
      networkTopology: 'verified-trunk-conduit',
      receivingWaterway: 'Koramangala-Challaghatta Rajakaluve to Bellandur Lake',
      elevationM: 906,
      notes: 'High-volume municipal stormwater outfall connected directly to the primary K-C trunk rajakaluve.',
    },
  },
  'DR-003': {
    catchmentId: 'CAT-WHITEFIELD',
    catchmentName: 'Whitefield Eastern Sub-Basin',
    subBasin: 'Whitefield-Kadugodi Lake Catchment',
    receivingWaterbody: 'Whitefield Lake / Varthur Downstream Wetland',
    hydrologicalConnectionVerified: false,
    provenance: {
      coordinateSource: 'Landmark geocode (provisional survey)',
      verificationStatus: 'provisional-survey',
      networkTopology: 'illustrative-local-flow',
      receivingWaterway: 'Whitefield Lake wetland sink',
      elevationM: 885,
      notes: 'Drains eastwards into Whitefield wetland basin; hydrologically separate from Bellandur outfall.',
    },
  },
  'DR-004': {
    catchmentId: 'CAT-VRISHABHAVATHI',
    catchmentName: 'Vrishabhavathi Western Watershed',
    subBasin: 'Majestic City Crest Sub-Basin',
    receivingWaterbody: 'Vrishabhavathi River Canal Corridor (West)',
    hydrologicalConnectionVerified: false,
    provenance: {
      coordinateSource: 'BMTC Terminal drainage survey point',
      verificationStatus: 'verified-monitored-inlet',
      networkTopology: 'illustrative-local-flow',
      receivingWaterway: 'Vrishabhavathi River Main Conduit',
      elevationM: 932,
      notes: 'Located on Bengaluru western ridge divide. Runoff drains southwest into Vrishabhavathi canal corridor; not connected to Bellandur.',
    },
  },
  'DR-005': {
    catchmentId: 'CAT-KC-VALLEY',
    catchmentName: 'Koramangala-Challaghatta (K-C) Valley',
    subBasin: 'Bellandur Outfall to Varthur Conduit',
    receivingWaterbody: 'Varthur Lake (via Bellandur-Varthur Channel)',
    hydrologicalConnectionVerified: true,
    provenance: {
      coordinateSource: 'K-C Valley weir discharge survey structure',
      verificationStatus: 'verified-monitored-inlet',
      networkTopology: 'verified-trunk-conduit',
      receivingWaterway: 'Bellandur-Varthur Inter-Lake Canal',
      elevationM: 891,
      notes: 'Primary weir outfall of Bellandur Lake discharging downstream towards Varthur Lake.',
    },
  },
  'DR-006': {
    catchmentId: 'CAT-VRISHABHAVATHI',
    catchmentName: 'Vrishabhavathi Western Watershed',
    subBasin: 'Jayanagar Southwest Residential Basin',
    receivingWaterbody: 'Yediyur / Vrishabhavathi Tributary',
    hydrologicalConnectionVerified: false,
    provenance: {
      coordinateSource: 'Ward 153 municipal junction survey',
      verificationStatus: 'provisional-survey',
      networkTopology: 'illustrative-local-flow',
      receivingWaterway: 'Southwest urban tributary towards Vrishabhavathi',
      elevationM: 922,
      notes: 'Residential sub-catchment draining southwest; does not cross the ridge to K-C trunk.',
    },
  },
  'DR-007': {
    catchmentId: 'CAT-HEBBAL',
    catchmentName: 'Hebbal Northern Watershed',
    subBasin: 'Hebbal-Nagavara Northern Valley',
    receivingWaterbody: 'Hebbal Lake & Nagavara Lake System',
    hydrologicalConnectionVerified: false,
    provenance: {
      coordinateSource: 'NH-44 Underpass stormwater sump reference',
      verificationStatus: 'verified-monitored-inlet',
      networkTopology: 'illustrative-local-flow',
      receivingWaterway: 'Hebbal Lake / Ponnaiyar River Basin',
      elevationM: 921,
      notes: 'Northern ridge outfall draining north towards Hebbal lake system in Ponnaiyar catchment; physically separate from Bellandur.',
    },
  },
  'DR-008': {
    catchmentId: 'CAT-ECITY',
    catchmentName: 'Electronic City Southern Corridor',
    subBasin: 'Electronic City Industrial Sub-Basin',
    receivingWaterbody: 'Rayasandra Lake & Hebbagodi Chain',
    hydrologicalConnectionVerified: false,
    provenance: {
      coordinateSource: 'ELCITA boundary stormwater outfall reference',
      verificationStatus: 'provisional-survey',
      networkTopology: 'illustrative-local-flow',
      receivingWaterway: 'Rayasandra Lake drainage sink',
      elevationM: 908,
      notes: 'Southern industrial corridor draining south towards Rayasandra / Hebbagodi lake chain.',
    },
  },
};

// ── GeoJSON FeatureCollections for GIS Overlays ──

export const BENGALURU_CATCHMENTS_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'CAT-KC-VALLEY',
      properties: {
        id: 'CAT-KC-VALLEY',
        name: 'Koramangala-Challaghatta (K-C) Valley',
        status: 'Primary Monitored Basin (Bellandur System)',
        receiving: 'Bellandur Lake & Varthur Lake',
        verified: true,
        fillColor: '#203324',
        strokeColor: '#4A6B53',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.610, 12.965],
          [77.645, 12.962],
          [77.675, 12.955],
          [77.725, 12.948],
          [77.728, 12.925],
          [77.695, 12.910],
          [77.670, 12.898],
          [77.640, 12.910],
          [77.615, 12.920],
          [77.605, 12.945],
          [77.610, 12.965],
        ]],
      },
    },
    {
      type: 'Feature',
      id: 'CAT-VRISHABHAVATHI',
      properties: {
        id: 'CAT-VRISHABHAVATHI',
        name: 'Vrishabhavathi Western Watershed',
        status: 'Western Crest Divide (DEM Modeled)',
        receiving: 'Vrishabhavathi River Canal Corridor',
        verified: false,
        fillColor: '#1F2922',
        strokeColor: '#3A4E3F',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.550, 12.990],
          [77.585, 12.985],
          [77.605, 12.945],
          [77.595, 12.915],
          [77.565, 12.910],
          [77.545, 12.935],
          [77.540, 12.970],
          [77.550, 12.990],
        ]],
      },
    },
    {
      type: 'Feature',
      id: 'CAT-HEBBAL',
      properties: {
        id: 'CAT-HEBBAL',
        name: 'Hebbal Northern Watershed',
        status: 'Northern Ridgeline (DEM Modeled)',
        receiving: 'Hebbal Lake & Nagavara Lake',
        verified: false,
        fillColor: '#1E2820',
        strokeColor: '#35473A',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.560, 13.060],
          [77.625, 13.060],
          [77.645, 13.020],
          [77.625, 12.995],
          [77.580, 12.995],
          [77.555, 13.020],
          [77.560, 13.060],
        ]],
      },
    },
    {
      type: 'Feature',
      id: 'CAT-WHITEFIELD',
      properties: {
        id: 'CAT-WHITEFIELD',
        name: 'Whitefield Eastern Sub-Basin',
        status: 'Eastern Lake Basin (DEM Modeled)',
        receiving: 'Whitefield Lake & Varthur Wetlands',
        verified: false,
        fillColor: '#1C271E',
        strokeColor: '#344538',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.725, 12.985],
          [77.770, 12.980],
          [77.775, 12.940],
          [77.730, 12.935],
          [77.720, 12.960],
          [77.725, 12.985],
        ]],
      },
    },
    {
      type: 'Feature',
      id: 'CAT-ECITY',
      properties: {
        id: 'CAT-ECITY',
        name: 'Electronic City Southern Corridor',
        status: 'Southern Industrial Basin (DEM Modeled)',
        receiving: 'Rayasandra Lake & Hebbagodi Chain',
        verified: false,
        fillColor: '#1B251D',
        strokeColor: '#304033',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.640, 12.875],
          [77.685, 12.870],
          [77.690, 12.830],
          [77.645, 12.825],
          [77.635, 12.850],
          [77.640, 12.875],
        ]],
      },
    },
  ],
};

export const BENGALURU_WATERBODIES_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Bellandur Lake',
        type: 'Terminal Urban Waterbody',
        areaHectares: 361,
        waterQuality: 'Critical Eutrophication / Surface Foam Barrier Monitored',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.655, 12.940],
          [77.668, 12.942],
          [77.682, 12.937],
          [77.684, 12.928],
          [77.674, 12.924],
          [77.658, 12.928],
          [77.655, 12.940],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Varthur Lake',
        type: 'Downstream Wetland Sink',
        areaHectares: 180,
        waterQuality: 'High Siltation & Macrophyte Loading',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.705, 12.948],
          [77.725, 12.946],
          [77.728, 12.938],
          [77.712, 12.934],
          [77.702, 12.940],
          [77.705, 12.948],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Agara Lake',
        type: 'Mid-Basin Retention Lake',
        areaHectares: 58,
        waterQuality: 'Restored Aeration Sump',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.632, 12.924],
          [77.640, 12.925],
          [77.642, 12.918],
          [77.634, 12.917],
          [77.632, 12.924],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Madivala Lake',
        type: 'Upper Basin Wetland Lake',
        areaHectares: 114,
        waterQuality: 'Monitored Riparian Zone',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.612, 12.918],
          [77.624, 12.919],
          [77.625, 12.909],
          [77.615, 12.908],
          [77.612, 12.918],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Ulsoor Lake',
        type: 'Central Urban Reservoir',
        areaHectares: 50,
        waterQuality: 'Historic Siltation Sump',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.616, 12.986],
          [77.624, 12.985],
          [77.625, 12.978],
          [77.617, 12.979],
          [77.616, 12.986],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Hebbal Lake',
        type: 'Northern Catchment Reservoir',
        areaHectares: 65,
        waterQuality: 'Avian Habitat Buffer Zone',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.585, 13.050],
          [77.596, 13.048],
          [77.595, 13.039],
          [77.584, 13.041],
          [77.585, 13.050],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Sankey Tank',
        type: 'Western Ridge Catchment Lake',
        areaHectares: 15,
        waterQuality: 'Urban Recreational Basin',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.571, 13.011],
          [77.577, 13.010],
          [77.578, 13.004],
          [77.572, 13.005],
          [77.571, 13.011],
        ]],
      },
    },
  ],
};

export const BENGALURU_DRAINAGE_NETWORK_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // 1. Verified K-C Valley Primary Stormwater Trunk (Koramangala to Bellandur)
    {
      type: 'Feature',
      properties: {
        name: 'Koramangala-Challaghatta Primary Trunk Rajakaluve',
        type: 'verified-primary-trunk',
        verified: true,
        width: '4.5m — 8m open reinforced masonry conduit',
        sourceId: 'DR-002',
        targetId: 'DR-005',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.6245, 12.9352], // DR-002 Koramangala Market Outfall
          [77.6360, 12.9330], // ST Bed confluence
          [77.6490, 12.9320], // Challaghatta Junction
          [77.6580, 12.9300], // Bellandur West inlet
          [77.6762, 12.9260], // DR-005 Bellandur Lake Overflow
        ],
      },
    },
    // 2. Verified Inter-Lake Conduit (Bellandur Lake to Varthur Lake)
    {
      type: 'Feature',
      properties: {
        name: 'Bellandur-to-Varthur Spillway Channel',
        type: 'verified-primary-trunk',
        verified: true,
        width: '6m hydraulic overflow cascade',
        sourceId: 'DR-005',
        targetId: 'VARTHUR',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.6762, 12.9260], // DR-005 Bellandur Outfall
          [77.6880, 12.9320], // Yamalur cascade
          [77.7020, 12.9380], // Varthur inlet
          [77.7150, 12.9420], // Varthur Lake center
        ],
      },
    },
    // 3. Modeled Feeder: Sarjapur Road feeder into Bellandur
    {
      type: 'Feature',
      properties: {
        name: 'Sarjapur Road Feeder Conduit',
        type: 'modeled-feeder',
        verified: true,
        width: '1.2m concrete channel',
        sourceId: 'DR-001',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.6850, 12.9100], // DR-001 Sarjapur Road
          [77.6790, 12.9180], // Kaikondrahalli link
          [77.6740, 12.9240], // Bellandur South buffer
        ],
      },
    },
    // 4. Illustrative: Vrishabhavathi Western Trunk (Majestic)
    {
      type: 'Feature',
      properties: {
        name: 'Vrishabhavathi Western Canal (Majestic Outflow)',
        type: 'illustrative-local-flow',
        verified: false,
        width: '3m underground culvert to open masonry nala',
        sourceId: 'DR-004',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.5713, 12.9770], // DR-004 Majestic Bus Station
          [77.5620, 12.9650], // Cottonpet / Mysore Road feeder
          [77.5500, 12.9520], // Vrishabhavathi canal main
        ],
      },
    },
    // 5. Illustrative: Jayanagar Southwest Tributary
    {
      type: 'Feature',
      properties: {
        name: 'Jayanagar Southwest Stormwater Feeder',
        type: 'illustrative-local-flow',
        verified: false,
        width: '1m covered drain',
        sourceId: 'DR-006',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.5838, 12.9250], // DR-006 Jayanagar
          [77.5740, 12.9200], // Yediyur catchment link
          [77.5610, 12.9120], // Towards southern valley
        ],
      },
    },
    // 6. Illustrative: Hebbal Northern Trunk
    {
      type: 'Feature',
      properties: {
        name: 'Hebbal Valley Stormwater Conduit',
        type: 'illustrative-local-flow',
        verified: false,
        width: '1.8m box culvert',
        sourceId: 'DR-007',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.5970, 13.0358], // DR-007 Hebbal Underpass
          [77.5920, 13.0420], // Towards Hebbal Lake feeder
          [77.5890, 13.0470], // Hebbal Lake inlet
        ],
      },
    },
    // 7. Illustrative: Whitefield East Feeder
    {
      type: 'Feature',
      properties: {
        name: 'Whitefield Eastern Sub-Basin Feeder',
        type: 'illustrative-local-flow',
        verified: false,
        width: '0.8m earthen ditch',
        sourceId: 'DR-003',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.7500, 12.9698], // DR-003 Whitefield
          [77.7420, 12.9600], // Whitefield lake corridor
          [77.7320, 12.9520], // Downstream wetland
        ],
      },
    },
    // 8. Illustrative: Electronic City Feeder
    {
      type: 'Feature',
      properties: {
        name: 'Electronic City Southern Outfall Feeder',
        type: 'illustrative-local-flow',
        verified: false,
        width: '1.5m lined drain',
        sourceId: 'DR-008',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.6603, 12.8456], // DR-008 Electronic City
          [77.6680, 12.8380], // Towards Rayasandra
          [77.6740, 12.8320], // Rayasandra lake sink
        ],
      },
    },
  ],
};

export const BENGALURU_CONTOURS_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { elevationM: 940, label: '940m Crest Divide' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.555, 12.995],
          [77.575, 12.980],
          [77.570, 12.940],
          [77.560, 12.905],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { elevationM: 920, label: '920m Valley Ridge' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.585, 13.045],
          [77.600, 12.990],
          [77.595, 12.935],
          [77.585, 12.880],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { elevationM: 900, label: '900m Mid-Valley Slope' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.630, 13.030],
          [77.635, 12.965],
          [77.630, 12.915],
          [77.640, 12.850],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { elevationM: 885, label: '885m Terminal Sink' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.670, 13.010],
          [77.680, 12.955],
          [77.695, 12.925],
          [77.685, 12.870],
        ],
      },
    },
  ],
};
