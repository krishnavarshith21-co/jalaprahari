/**
 * JALAPRAHARI — Synthetic Demo Data
 * 
 * ⚠ IMPORTANT: All data in this file is synthetic and illustrative.
 * These are not real measurements, predictions, or municipal records.
 * Coordinates are approximate and do not represent actual drain locations.
 * Risk scores use provisional prototype weights and are not validated predictions.
 */

import type {
  DrainLocation, RiskAssessment, WeatherEvent, Alert,
  InterventionAction, Observation, MonitoringHealth, RiskFactor
} from '../types';

// ── Synthetic Drain Locations (Illustrative) ──
export const syntheticDrains: DrainLocation[] = [
  {
    id: 'DR-001',
    name: 'Sarjapur Road Junction Drain',
    area: 'Sarjapur Road',
    lat: 12.9100,
    lng: 77.6850,
    type: 'primary',
    catchmentArea: 2.4,
    nearbyLandUse: ['Commercial market', 'Residential', 'Bus stop'],
    drainageCapacity: 'Medium — 1.2m wide concrete channel',
    lastInspection: '2026-09-15',
    condition: 'moderate',
  },
  {
    id: 'DR-002',
    name: 'Koramangala Market Outfall',
    area: 'Koramangala',
    lat: 12.9352,
    lng: 77.6245,
    type: 'primary',
    catchmentArea: 3.1,
    nearbyLandUse: ['Vegetable market', 'Street food vendors', 'Residential dense'],
    drainageCapacity: 'High — 2m reinforced channel',
    lastInspection: '2026-09-28',
    condition: 'poor',
  },
  {
    id: 'DR-003',
    name: 'Whitefield Lake Inlet',
    area: 'Whitefield',
    lat: 12.9698,
    lng: 77.7500,
    type: 'secondary',
    catchmentArea: 1.8,
    nearbyLandUse: ['IT park', 'Construction site', 'Lake buffer zone'],
    drainageCapacity: 'Low — 0.8m earthen channel',
    lastInspection: '2026-10-01',
    condition: 'good',
  },
  {
    id: 'DR-004',
    name: 'Majestic Bus Station Drain',
    area: 'Majestic',
    lat: 12.9770,
    lng: 77.5713,
    type: 'primary',
    catchmentArea: 4.2,
    nearbyLandUse: ['Bus terminal', 'Commercial hub', 'Street market', 'Footpath vendors'],
    drainageCapacity: 'High — 2.5m box culvert',
    lastInspection: '2026-09-20',
    condition: 'critical',
  },
  {
    id: 'DR-005',
    name: 'Bellandur Lake Overflow',
    area: 'Bellandur',
    lat: 12.9260,
    lng: 77.6762,
    type: 'primary',
    catchmentArea: 5.6,
    nearbyLandUse: ['Lake catchment', 'Dense residential', 'Tech park'],
    drainageCapacity: 'High — Multiple channel confluence',
    lastInspection: '2026-10-05',
    condition: 'moderate',
  },
  {
    id: 'DR-006',
    name: 'Jayanagar 4th Block Drain',
    area: 'Jayanagar',
    lat: 12.9250,
    lng: 77.5838,
    type: 'secondary',
    catchmentArea: 1.5,
    nearbyLandUse: ['Shopping complex', 'Residential', 'Park'],
    drainageCapacity: 'Medium — 1m concrete drain',
    lastInspection: '2026-09-10',
    condition: 'good',
  },
  {
    id: 'DR-007',
    name: 'Hebbal Flyover Underpass Drain',
    area: 'Hebbal',
    lat: 13.0358,
    lng: 77.5970,
    type: 'primary',
    catchmentArea: 3.8,
    nearbyLandUse: ['Highway junction', 'Commercial area', 'Lake proximity'],
    drainageCapacity: 'Medium — Constrained by underpass geometry',
    lastInspection: '2026-08-25',
    condition: 'poor',
  },
  {
    id: 'DR-008',
    name: 'Electronic City Phase-1 Outfall',
    area: 'Electronic City',
    lat: 12.8456,
    lng: 77.6603,
    type: 'secondary',
    catchmentArea: 2.0,
    nearbyLandUse: ['Tech campus', 'Food court area', 'Residential colony'],
    drainageCapacity: 'Medium — 1.5m lined channel',
    lastInspection: '2026-09-30',
    condition: 'moderate',
  },
];

// ── Risk Factor Generator ──
export function calculateLandUseScore(landUses: string[]): number {
  const text = landUses.join(' ').toLowerCase();
  if (text.includes('bus terminal') || text.includes('commercial hub')) return 88;
  if (text.includes('vegetable market') || text.includes('street food') || text.includes('market')) return 82;
  if (text.includes('commercial')) return 68;
  if (text.includes('construction')) return 55;
  return 42;
}

export function createFactors(drain: DrainLocation, rainfall: number, dryDays: number): RiskFactor[] {
  const landUseScore = calculateLandUseScore(drain.nearbyLandUse);

  const conditionScore = drain.condition === 'critical' ? 92 :
    drain.condition === 'poor' ? 75 :
    drain.condition === 'moderate' ? 50 : 25;

  const rainfallScore = Math.min(100, (rainfall / 40) * 100);
  const dryDaysScore = Math.min(100, (dryDays / 14) * 100);
  const catchmentScore = Math.min(100, (drain.catchmentArea / 5) * 100);

  return [
    {
      name: 'Rainfall Intensity',
      value: rainfall,
      weight: 0.25,
      normalizedScore: rainfallScore,
      description: `Expected ${rainfall} mm/hr intensity. ${rainfall > 20 ? 'Strong enough to mobilize surface debris.' : 'Moderate mobilization potential.'}`,
      dataSource: 'Weather forecast (synthetic demo)',
      isProvisional: true,
    },
    {
      name: 'Antecedent Dry Period',
      value: dryDays,
      weight: 0.20,
      normalizedScore: dryDaysScore,
      description: `${dryDays} days since last significant rainfall. ${dryDays > 7 ? 'Extended dry period allows substantial plastic accumulation.' : 'Recent rain may have partially cleared surfaces.'}`,
      dataSource: 'Historical weather records (synthetic demo)',
      isProvisional: true,
    },
    {
      name: 'Land Use Exposure',
      value: landUseScore,
      weight: 0.20,
      normalizedScore: landUseScore,
      description: `Nearby land use includes: ${drain.nearbyLandUse.join(', ')}. ${landUseScore > 70 ? 'High plastic generation potential from commercial activity.' : 'Moderate generation potential.'}`,
      dataSource: 'Land use survey (synthetic demo)',
      isProvisional: true,
    },
    {
      name: 'Drainage Vulnerability',
      value: conditionScore,
      weight: 0.15,
      normalizedScore: conditionScore,
      description: `Drain condition rated "${drain.condition}". ${conditionScore > 60 ? 'Compromised drainage increases blockage and overflow risk.' : 'Drainage infrastructure in acceptable condition.'}`,
      dataSource: 'Inspection records (synthetic demo)',
      isProvisional: true,
    },
    {
      name: 'Catchment Exposure',
      value: drain.catchmentArea,
      weight: 0.10,
      normalizedScore: catchmentScore,
      description: `Catchment area of ${drain.catchmentArea} sq km. ${drain.catchmentArea > 3 ? 'Large catchment concentrates runoff from multiple sources.' : 'Moderate catchment area.'}`,
      dataSource: 'GIS mapping (synthetic demo)',
      isProvisional: true,
    },
    {
      name: 'Historical Observations',
      value: landUseScore * 0.9,
      weight: 0.10,
      normalizedScore: landUseScore * 0.9,
      description: 'Based on synthetic historical plastic observation records for this location.',
      dataSource: 'Field observation history (synthetic demo)',
      isProvisional: true,
    },
  ];
}

export function computeRiskIndex(factors: RiskFactor[]): number {
  const weighted = factors.reduce((sum, f) => sum + f.normalizedScore * f.weight, 0);
  return Math.round(Math.min(100, Math.max(0, weighted)));
}

export function getRiskLevel(index: number): import('../types').RiskLevel {
  if (index >= 75) return 'very-high';
  if (index >= 55) return 'high';
  if (index >= 35) return 'moderate';
  return 'low';
}

export function getLeadingFactor(factors: RiskFactor[]): string {
  const sorted = [...factors].sort((a, b) => (b.normalizedScore * b.weight) - (a.normalizedScore * a.weight));
  return sorted[0]?.name || 'Unknown';
}

export function getRecommendedAction(level: import('../types').RiskLevel, drain: DrainLocation): string {
  if (level === 'very-high') {
    return `Immediate pre-event drain inspection and plastic debris removal at ${drain.name}. Deploy temporary screening if available. Clear surrounding surface litter within 200m radius of drain inlet.`;
  }
  if (level === 'high') {
    return `Priority inspection of ${drain.name} within 2 hours. Remove visible plastic accumulation from drain inlet and upstream channel section. Document observed litter volume.`;
  }
  if (level === 'moderate') {
    return `Scheduled inspection of ${drain.name} within 6 hours. Check drain inlet for obstructions and note plastic accumulation levels in the surrounding area.`;
  }
  return `Routine monitoring of ${drain.name}. No immediate intervention needed based on current risk assessment.`;
}

// ── Upcoming Weather Event (Synthetic) ──
const RAINFALL_INTENSITY = 28; // mm/hr
const DRY_DAYS = 11;

export const syntheticEvent: WeatherEvent = {
  id: 'EVT-2026-042',
  referenceTime: '2026-10-10T08:00:00+05:30',
  expectedStart: '2026-10-10T14:00:00+05:30',
  expectedEnd: '2026-10-10T18:30:00+05:30',
  rainfallIntensity: RAINFALL_INTENSITY,
  rainfallDuration: 4.5,
  probability: 0.78,
  source: 'Synthetic scenario specification',
  lastUpdated: '2026-10-10T08:00:00+05:30',
  firstFlushRisk: 'high',
  leadTime: '~6 hours',
  antecedentDryDays: DRY_DAYS,
  description: 'Moderate-to-heavy rainfall expected across south-east Bangalore. Following an 11-day dry period, first-flush plastic mobilization risk is elevated for commercial and market-adjacent drainage locations.',
};

// ── Generate Risk Assessments ──
export const syntheticRiskAssessments: RiskAssessment[] = syntheticDrains.map(drain => {
  const factors = createFactors(drain, RAINFALL_INTENSITY, DRY_DAYS);
  const riskIndex = computeRiskIndex(factors);
  const riskLevel = getRiskLevel(riskIndex);
  const leadingFactor = getLeadingFactor(factors);

  return {
    drainId: drain.id,
    riskIndex,
    riskLevel,
    leadingFactor,
    rainfallIntensity: RAINFALL_INTENSITY,
    antecedentDryDays: DRY_DAYS,
    historicalPlasticScore: Math.round(factors.find(f => f.name === 'Historical Observations')?.normalizedScore || 0),
    drainageVulnerability: Math.round(factors.find(f => f.name === 'Drainage Vulnerability')?.normalizedScore || 0),
    catchmentExposure: Math.round(factors.find(f => f.name === 'Catchment Exposure')?.normalizedScore || 0),
    landUseRisk: Math.round(factors.find(f => f.name === 'Land Use Exposure')?.normalizedScore || 0),
    previousInterventionEffect: 0,
    dataFreshness: 'fresh' as const,
    lastUpdated: '2026-10-09T08:15:00+05:30',
    explanation: `Risk assessment for ${drain.name} based on expected ${RAINFALL_INTENSITY} mm/hr rainfall after ${DRY_DAYS}-day dry period. Leading factor: ${leadingFactor}. ${riskLevel === 'very-high' || riskLevel === 'high' ? 'This location has elevated risk due to a combination of commercial activity, drainage condition, and catchment characteristics.' : 'Current risk factors are within moderate thresholds.'}`,
    factors,
    recommendedAction: getRecommendedAction(riskLevel, drain),
    confidence: riskLevel === 'very-high' || riskLevel === 'high' ? 'moderate' as const : 'low' as const,
  };
});

// ── Synthetic Alerts ──
export const syntheticAlerts: Alert[] = [
  {
    id: 'ALT-001',
    drainId: 'DR-004',
    drainName: 'Majestic Bus Station Drain',
    eventId: 'EVT-2026-042',
    type: 'first-flush-warning',
    severity: 'very-high',
    message: 'Very high first-flush plastic risk detected at Majestic Bus Station Drain. Critical drain condition combined with 11-day dry period and expected 28 mm/hr rainfall.',
    createdAt: '2026-10-09T08:20:00+05:30',
    status: 'new',
  },
  {
    id: 'ALT-002',
    drainId: 'DR-002',
    drainName: 'Koramangala Market Outfall',
    eventId: 'EVT-2026-042',
    type: 'first-flush-warning',
    severity: 'high',
    message: 'High first-flush plastic risk at Koramangala Market Outfall. Market-adjacent location with poor drain condition.',
    createdAt: '2026-10-09T08:20:00+05:30',
    status: 'new',
  },
  {
    id: 'ALT-003',
    drainId: 'DR-007',
    drainName: 'Hebbal Flyover Underpass Drain',
    eventId: 'EVT-2026-042',
    type: 'risk-threshold',
    severity: 'high',
    message: 'Risk threshold exceeded at Hebbal Flyover Underpass. Constrained drainage and overdue inspection contribute to elevated risk.',
    createdAt: '2026-10-09T08:22:00+05:30',
    status: 'acknowledged',
    acknowledgedBy: 'Demo Operator',
    acknowledgedAt: '2026-10-09T09:00:00+05:30',
  },
  {
    id: 'ALT-004',
    drainId: 'DR-005',
    drainName: 'Bellandur Lake Overflow',
    eventId: 'EVT-2026-042',
    type: 'first-flush-warning',
    severity: 'high',
    message: 'Large catchment area and dense residential surroundings elevate first-flush risk for Bellandur Lake Overflow.',
    createdAt: '2026-10-09T08:25:00+05:30',
    status: 'new',
  },
  {
    id: 'ALT-005',
    drainId: 'DR-007',
    drainName: 'Hebbal Flyover Underpass Drain',
    eventId: 'EVT-2026-042',
    type: 'intervention-due',
    severity: 'moderate',
    message: 'Inspection overdue at Hebbal Flyover Underpass. Last inspection was over 45 days ago.',
    createdAt: '2026-10-09T06:00:00+05:30',
    status: 'resolved',
  },
];

// ── Synthetic Intervention Actions ──
export const syntheticActions: InterventionAction[] = syntheticRiskAssessments
  .filter(r => r.riskLevel === 'very-high' || r.riskLevel === 'high')
  .sort((a, b) => b.riskIndex - a.riskIndex)
  .map((risk, i) => {
    const drain = syntheticDrains.find(d => d.id === risk.drainId)!;
    return {
      id: `ACT-${String(i + 1).padStart(3, '0')}`,
      drainId: drain.id,
      drainName: drain.name,
      area: drain.area,
      riskLevel: risk.riskLevel,
      reason: `${risk.leadingFactor} is the leading risk factor (score: ${risk.riskIndex}/100). ${risk.explanation}`,
      recommendedAction: risk.recommendedAction,
      urgency: risk.riskLevel === 'very-high' ? 'immediate' as const : 'within-2h' as const,
      eventWindow: `${new Date(syntheticEvent.expectedStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} — ${new Date(syntheticEvent.expectedEnd).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      assignee: i === 0 ? 'Ward 150 Squad Alpha' : undefined,
      status: i === 0 ? 'acknowledged' as const : 'pending' as const,
      lastUpdated: '2026-10-09T09:00:00+05:30',
      notes: i === 0 ? ['Field team dispatched at 09:15'] : [],
    };
  });

// ── Synthetic Observations ──
export const syntheticObservations: Observation[] = [
  {
    id: 'OBS-001',
    drainId: 'DR-004',
    drainName: 'Majestic Bus Station Drain',
    timestamp: '2026-10-08T10:30:00+05:30',
    observedBy: 'Demo Inspector',
    plasticLevel: 'heavy',
    plasticWeight: 12.5,
    notes: 'Significant plastic bag and food packaging accumulation around drain inlet. Upstream footpath vendors contributing to litter. Drain grating partially blocked.',
    drainCondition: 'Grating corroded, partial blockage observed',
    waterFlow: 'dry',
  },
  {
    id: 'OBS-002',
    drainId: 'DR-002',
    drainName: 'Koramangala Market Outfall',
    timestamp: '2026-10-07T14:00:00+05:30',
    observedBy: 'Demo Inspector',
    plasticLevel: 'moderate',
    notes: 'Vegetable market waste including plastic carry bags observed. Market cleaning scheduled but unverified.',
    drainCondition: 'Channel walls cracked, sediment buildup present',
    waterFlow: 'trickle',
  },
];

// ── Monitoring Health ──
export const syntheticMonitoringHealth: MonitoringHealth = {
  status: 'operational',
  lastSuccessfulRefresh: '2026-10-09T08:00:00+05:30',
  dataFreshness: 'fresh',
  activeSources: ['Weather forecast (synthetic)', 'Drain registry (synthetic)', 'Observation log (synthetic)'],
  dataMode: 'synthetic-demo',
  monitoringInterval: 30,
  nextScheduledRefresh: '2026-10-09T08:30:00+05:30',
};

// ── Helper: Get assessment for a drain ──
export function getAssessmentForDrain(drainId: string): RiskAssessment | undefined {
  return syntheticRiskAssessments.find(r => r.drainId === drainId);
}

export function getDrain(drainId: string): DrainLocation | undefined {
  return syntheticDrains.find(d => d.id === drainId);
}

// ── Sorted drains by risk ──
export function getDrainsSortedByRisk(): (DrainLocation & { risk: RiskAssessment })[] {
  return syntheticDrains
    .map(drain => ({
      ...drain,
      risk: syntheticRiskAssessments.find(r => r.drainId === drain.id)!,
    }))
    .sort((a, b) => b.risk.riskIndex - a.risk.riskIndex);
}
