// ─── Jalaprahari Types ───

export type RiskLevel = 'low' | 'moderate' | 'high' | 'very-high';

export interface GeospatialProvenance {
  coordinateSource: string;
  verificationStatus: 'verified-monitored-inlet' | 'provisional-survey' | 'illustrative-demo';
  networkTopology: 'verified-trunk-conduit' | 'modeled-feeder' | 'illustrative-local-flow';
  receivingWaterway: string;
  elevationM?: number;
  notes: string;
}

export interface CatchmentInfo {
  id: string;
  name: string;
  basinType: 'primary-monitored-valley' | 'secondary-watershed' | 'sub-catchment';
  receivingWaterbody: string;
  hydrologicalConnectionVerified: boolean;
  boundaryProvenance: 'dem-valley-delineation' | 'watershed-atlas-reference' | 'illustrative-corridor-boundary';
  elevationRangeM: [number, number];
}

export interface DrainLocation {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  type: 'primary' | 'secondary' | 'tertiary';
  catchmentArea: number; // sq km
  nearbyLandUse: string[];
  drainageCapacity: string;
  lastInspection: string;
  condition: 'good' | 'moderate' | 'poor' | 'critical';
  catchmentId?: string;
  catchmentName?: string;
  subBasin?: string;
  receivingWaterbody?: string;
  hydrologicalConnectionVerified?: boolean;
  provenance?: GeospatialProvenance;
}

export interface RiskAssessment {
  drainId: string;
  riskIndex: number; // 0-100
  riskLevel: RiskLevel;
  leadingFactor: string;
  rainfallIntensity: number; // mm/hr
  antecedentDryDays: number;
  historicalPlasticScore: number; // 0-100
  drainageVulnerability: number; // 0-100
  catchmentExposure: number; // 0-100
  landUseRisk: number; // 0-100
  previousInterventionEffect: number; // 0-100
  dataFreshness: 'fresh' | 'recent' | 'stale';
  lastUpdated: string;
  explanation: string;
  factors: RiskFactor[];
  recommendedAction: string;
  confidence: 'high' | 'moderate' | 'low';
}

export interface RiskFactor {
  name: string;
  value: number;
  weight: number;
  normalizedScore: number;
  description: string;
  dataSource: string;
  isProvisional: boolean;
}

export interface WeatherEvent {
  id: string;
  referenceTime?: string;
  expectedStart: string;
  expectedEnd: string;
  rainfallIntensity: number;
  rainfallDuration: number;
  probability: number;
  source: string;
  lastUpdated: string;
  firstFlushRisk: RiskLevel;
  leadTime: string;
  antecedentDryDays: number;
  description: string;
}

export interface Alert {
  id: string;
  drainId: string;
  drainName: string;
  eventId: string;
  type: 'first-flush-warning' | 'risk-threshold' | 'data-stale' | 'intervention-due';
  severity: RiskLevel;
  message: string;
  createdAt: string;
  status: 'new' | 'acknowledged' | 'resolved' | 'escalated';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface InterventionAction {
  id: string;
  drainId: string;
  drainName: string;
  area: string;
  riskLevel: RiskLevel;
  reason: string;
  recommendedAction: string;
  urgency: 'immediate' | 'within-2h' | 'within-6h' | 'within-24h';
  eventWindow: string;
  assignee?: string;
  status: 'pending' | 'acknowledged' | 'in-progress' | 'completed';
  lastUpdated: string;
  notes: string[];
  plasticCollected?: number; // kg
  inspectionResult?: string;
}

export interface Observation {
  id: string;
  drainId: string;
  drainName: string;
  timestamp: string;
  observedBy: string;
  plasticLevel: 'none' | 'light' | 'moderate' | 'heavy' | 'severe';
  plasticWeight?: number; // kg
  notes: string;
  photoUrl?: string;
  drainCondition: string;
  waterFlow: 'dry' | 'trickle' | 'normal' | 'high' | 'flooding';
}

export interface MonitoringHealth {
  status: 'operational' | 'degraded' | 'offline';
  lastSuccessfulRefresh: string;
  dataFreshness: 'fresh' | 'recent' | 'stale' | 'unavailable';
  activeSources: string[];
  dataMode: 'live' | 'synthetic-demo' | 'stale' | 'unavailable';
  monitoringInterval: number; // minutes
  nextScheduledRefresh: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'viewer' | 'operator' | 'admin';
}
