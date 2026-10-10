import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import type {
  DrainLocation, RiskAssessment, WeatherEvent, Alert,
  InterventionAction, Observation, MonitoringHealth, RiskLevel
} from '../types';
import {
  syntheticDrains,
  syntheticRiskAssessments,
  syntheticEvent,
  syntheticAlerts,
  syntheticActions,
  syntheticObservations,
  syntheticMonitoringHealth,
  createFactors,
  computeRiskIndex,
  getRiskLevel,
  getLeadingFactor,
  getRecommendedAction
} from '../data/synthetic';

interface DataContextType {
  drains: DrainLocation[];
  assessments: RiskAssessment[];
  selectedDrainId: string;
  selectedDrain: DrainLocation | undefined;
  selectedAssessment: RiskAssessment | undefined;
  selectDrain: (id: string) => void;
  event: WeatherEvent;
  updateEventParams: (rainfall: number, dryDays: number) => void;
  alerts: Alert[];
  acknowledgeAlert: (alertId: string, userName?: string) => void;
  resolveAlert: (alertId: string) => void;
  actions: InterventionAction[];
  updateActionStatus: (actionId: string, status: InterventionAction['status']) => void;
  addActionNote: (actionId: string, note: string) => void;
  recordPlasticCollected: (actionId: string, kg: number) => void;
  assignAction: (actionId: string, assignee: string) => void;
  observations: Observation[];
  addObservation: (obs: Omit<Observation, 'id' | 'timestamp'>) => void;
  monitoringHealth: MonitoringHealth;
  setMonitoringInterval: (minutes: number) => void;
  triggerDataRefresh: () => void;
  drainsSortedByRisk: (DrainLocation & { risk: RiskAssessment })[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [drains] = useState<DrainLocation[]>(syntheticDrains);
  const [selectedDrainId, setSelectedDrainId] = useState<string>('DR-004');
  const [event, setEvent] = useState<WeatherEvent>(syntheticEvent);
  const [assessments, setAssessments] = useState<RiskAssessment[]>(syntheticRiskAssessments);
  const [alerts, setAlerts] = useState<Alert[]>(syntheticAlerts);
  const [actions, setActions] = useState<InterventionAction[]>(syntheticActions);
  // Dynamic Next Scheduled Refresh calculator based on actual last refresh & cadence
  const computeNextRefresh = (lastIso: string, intervalMinutes: number): string => {
    const lastTime = new Date(lastIso).getTime();
    const intervalMs = intervalMinutes * 60 * 1000;
    if (isNaN(lastTime)) {
      return new Date(Date.now() + intervalMs).toISOString();
    }
    const nextTime = lastTime + intervalMs;
    // If calculated next time is already passed compared to now, schedule from now
    return new Date(nextTime > Date.now() ? nextTime : Date.now() + intervalMs).toISOString();
  };

  const [observations, setObservations] = useState<Observation[]>(syntheticObservations);
  const [monitoringHealth, setMonitoringHealth] = useState<MonitoringHealth>(() => {
    const initial = syntheticMonitoringHealth;
    return {
      ...initial,
      nextScheduledRefresh: computeNextRefresh(initial.lastSuccessfulRefresh, initial.monitoringInterval),
    };
  });

  // Sync health telemetry with backend API on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setMonitoringHealth(prev => {
            const last = data.last_successful_refresh || prev.lastSuccessfulRefresh;
            const interval = data.monitoring_interval || prev.monitoringInterval;
            return {
              ...prev,
              status: data.status,
              lastSuccessfulRefresh: last,
              monitoringInterval: interval,
              dataFreshness: data.data_freshness || prev.dataFreshness,
              dataMode: data.data_mode || prev.dataMode,
              nextScheduledRefresh: computeNextRefresh(last, interval),
            };
          });
        }
      })
      .catch(() => {
        // Backend offline or running decoupled; local state remains active
      });
  }, []);

  const selectedDrain = useMemo(
    () => drains.find(d => d.id === selectedDrainId) || drains[0],
    [drains, selectedDrainId]
  );

  const selectedAssessment = useMemo(
    () => assessments.find(a => a.drainId === selectedDrainId) || assessments[0],
    [assessments, selectedDrainId]
  );

  // Recalculate risk assessments dynamically when rainfall or antecedent dry period changes
  const updateEventParams = (rainfall: number, dryDays: number) => {
    // 1. Update event details
    let firstFlushRisk: RiskLevel = 'low';
    if (rainfall >= 25 && dryDays >= 7) firstFlushRisk = 'very-high';
    else if (rainfall >= 18 || dryDays >= 10) firstFlushRisk = 'high';
    else if (rainfall >= 10 || dryDays >= 5) firstFlushRisk = 'moderate';

    setEvent(prev => ({
      ...prev,
      rainfallIntensity: rainfall,
      antecedentDryDays: dryDays,
      firstFlushRisk,
      lastUpdated: new Date().toISOString(),
      description: `Assessed scenario: ${rainfall} mm/hr rainfall following ${dryDays} dry days. First-flush plastic mobilization index is classified as ${firstFlushRisk.toUpperCase()}.`,
    }));

    // Sync with backend simulation endpoint
    fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rainfall_intensity: rainfall,
        antecedent_dry_days: dryDays,
      }),
    }).catch(() => {});

    // 2. Recompute all drain risk assessments
    const updatedAssessments: RiskAssessment[] = drains.map(drain => {
      const factors = createFactors(drain, rainfall, dryDays);
      const riskIndex = computeRiskIndex(factors);
      const riskLevel = getRiskLevel(riskIndex);
      const leadingFactor = getLeadingFactor(factors);

      return {
        drainId: drain.id,
        riskIndex,
        riskLevel,
        leadingFactor,
        rainfallIntensity: rainfall,
        antecedentDryDays: dryDays,
        historicalPlasticScore: Math.round(factors.find(f => f.name === 'Historical Observations')?.normalizedScore || 0),
        drainageVulnerability: Math.round(factors.find(f => f.name === 'Drainage Vulnerability')?.normalizedScore || 0),
        catchmentExposure: Math.round(factors.find(f => f.name === 'Catchment Exposure')?.normalizedScore || 0),
        landUseRisk: Math.round(factors.find(f => f.name === 'Land Use Exposure')?.normalizedScore || 0),
        previousInterventionEffect: 0,
        dataFreshness: 'fresh' as const,
        lastUpdated: new Date().toISOString(),
        explanation: `Risk assessment for ${drain.name} based on simulated ${rainfall} mm/hr rainfall after ${dryDays}-day dry period. Leading factor: ${leadingFactor}. ${
          riskLevel === 'very-high' || riskLevel === 'high'
            ? 'High plastic mobilization potential due to commercial density and drain geometry.'
            : 'Conditions remain within manageable thresholds.'
        }`,
        factors,
        recommendedAction: getRecommendedAction(riskLevel, drain),
        confidence: (riskLevel === 'very-high' || riskLevel === 'high') ? 'moderate' as const : 'low' as const,
      };
    });

    setAssessments(updatedAssessments);

    // Synchronize actions state to maintain mathematical consistency with updated risk scores
    setActions(prevActions => {
      const highPriority = updatedAssessments
        .filter(r => r.riskLevel === 'very-high' || r.riskLevel === 'high')
        .sort((a, b) => b.riskIndex - a.riskIndex);

      const targetList = highPriority.length > 0
        ? highPriority
        : [...updatedAssessments].sort((a, b) => b.riskIndex - a.riskIndex).slice(0, 4);

      return targetList.map((risk, i) => {
        const drain = drains.find(d => d.id === risk.drainId)!;
        const existing = prevActions.find(a => a.drainId === drain.id);
        return {
          id: existing ? existing.id : `ACT-${String(i + 1).padStart(3, '0')}`,
          drainId: drain.id,
          drainName: drain.name,
          area: drain.area,
          riskLevel: risk.riskLevel,
          reason: `${risk.leadingFactor} is the leading risk factor (score: ${risk.riskIndex}/100). ${risk.explanation}`,
          recommendedAction: risk.recommendedAction,
          urgency: risk.riskLevel === 'very-high' ? ('immediate' as const) : ('within-2h' as const),
          eventWindow: `${new Date(event.expectedStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} — ${new Date(event.expectedEnd).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
          assignee: existing?.assignee || (i === 0 ? 'Ward 150 Squad Alpha' : undefined),
          status: existing?.status || (i === 0 ? 'acknowledged' : 'pending'),
          lastUpdated: new Date().toISOString(),
          notes: existing?.notes || (i === 0 ? ['Field team dispatched at 09:15'] : []),
          plasticCollected: existing?.plasticCollected,
          inspectionResult: existing?.inspectionResult,
        };
      });
    });
  };

  const selectDrain = (id: string) => {
    setSelectedDrainId(id);
  };

  const acknowledgeAlert = (alertId: string, userName = 'Municipal Operator') => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              status: 'acknowledged',
              acknowledgedBy: userName,
              acknowledgedAt: new Date().toISOString(),
            }
          : a
      )
    );

    // Persist alert acknowledgement to backend API
    fetch(`/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: userName }),
    }).catch(() => {});
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'resolved' } : a))
    );
  };

  const updateActionStatus = (actionId: string, status: InterventionAction['status']) => {
    setActions(prev =>
      prev.map(a =>
        a.id === actionId
          ? { ...a, status, lastUpdated: new Date().toISOString() }
          : a
      )
    );

    // Persist action status change to backend API
    fetch(`/api/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  const addActionNote = (actionId: string, note: string) => {
    setActions(prev =>
      prev.map(a =>
        a.id === actionId
          ? {
              ...a,
              notes: [...a.notes, `[${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}] ${note}`],
              lastUpdated: new Date().toISOString(),
            }
          : a
      )
    );

    fetch(`/api/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    }).catch(() => {});
  };

  const recordPlasticCollected = (actionId: string, kg: number) => {
    setActions(prev =>
      prev.map(a =>
        a.id === actionId
          ? {
              ...a,
              plasticCollected: (a.plasticCollected || 0) + kg,
              status: 'completed',
              notes: [...a.notes, `Verified plastic intercepted: ${kg} kg removed from inlet`],
              lastUpdated: new Date().toISOString(),
            }
          : a
      )
    );

    fetch(`/api/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plastic_collected: kg }),
    }).catch(() => {});
  };

  const assignAction = (actionId: string, assignee: string) => {
    setActions(prev =>
      prev.map(a =>
        a.id === actionId
          ? { ...a, assignee, lastUpdated: new Date().toISOString() }
          : a
      )
    );

    fetch(`/api/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignee }),
    }).catch(() => {});
  };

  const addObservation = (obs: Omit<Observation, 'id' | 'timestamp'>) => {
    const newObs: Observation = {
      ...obs,
      id: `OBS-${String(observations.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
    };
    setObservations(prev => [newObs, ...prev]);

    // Persist to backend API storage
    fetch('/api/observations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drain_id: obs.drainId,
        observed_by: obs.observedBy,
        plastic_level: obs.plasticLevel,
        plastic_weight: obs.plasticWeight,
        drain_condition: obs.drainCondition,
        water_flow: obs.waterFlow,
        notes: obs.notes,
      }),
    }).catch(() => {});
  };

  const setMonitoringInterval = (minutes: number) => {
    setMonitoringHealth(prev => ({
      ...prev,
      monitoringInterval: minutes,
      nextScheduledRefresh: computeNextRefresh(prev.lastSuccessfulRefresh, minutes),
    }));
  };

  const triggerDataRefresh = () => {
    const now = new Date().toISOString();
    return fetch('/api/health/refresh', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        const refreshedTime = data.last_successful_refresh || now;
        setMonitoringHealth(prev => ({
          ...prev,
          lastSuccessfulRefresh: refreshedTime,
          dataFreshness: (data.data_freshness as any) || 'fresh',
          nextScheduledRefresh: computeNextRefresh(refreshedTime, prev.monitoringInterval),
        }));
      })
      .catch(() => {
        setMonitoringHealth(prev => ({
          ...prev,
          lastSuccessfulRefresh: now,
          dataFreshness: 'fresh',
          nextScheduledRefresh: computeNextRefresh(now, prev.monitoringInterval),
        }));
      });
  };

  const drainsSortedByRisk = useMemo(() => {
    return drains
      .map(drain => ({
        ...drain,
        risk: assessments.find(r => r.drainId === drain.id) || assessments[0],
      }))
      .sort((a, b) => b.risk.riskIndex - a.risk.riskIndex);
  }, [drains, assessments]);

  return (
    <DataContext.Provider
      value={{
        drains,
        assessments,
        selectedDrainId,
        selectedDrain,
        selectedAssessment,
        selectDrain,
        event,
        updateEventParams,
        alerts,
        acknowledgeAlert,
        resolveAlert,
        actions,
        updateActionStatus,
        addActionNote,
        recordPlasticCollected,
        assignAction,
        observations,
        addObservation,
        monitoringHealth,
        setMonitoringInterval,
        triggerDataRefresh,
        drainsSortedByRisk,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
