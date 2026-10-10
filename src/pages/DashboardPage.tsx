import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard, CloudRain, Map, Database, Bell, ListChecks,
  ClipboardCheck, Settings, LogOut, Menu, X,
  ExternalLink, Compass, ShieldCheck
} from 'lucide-react';
import OverviewPanel from '../components/dashboard/OverviewPanel';
import EventOutlook from '../components/dashboard/EventOutlook';
import RiskMapPanel from '../components/dashboard/RiskMapPanel';
import DrainIntelligence from '../components/dashboard/DrainIntelligence';
import AlertCentre from '../components/dashboard/AlertCentre';
import InterventionPlanner from '../components/dashboard/InterventionPlanner';
import ObservationsPanel from '../components/dashboard/ObservationsPanel';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import ThemeToggle from '../components/shared/ThemeToggle';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { event, alerts, actions } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const newAlertsCount = alerts.filter(a => a.status === 'new').length;
  const pendingActionsCount = actions.filter(a => a.status === 'pending' || a.status === 'acknowledged').length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  interface NavItem {
    path: string;
    icon: typeof LayoutDashboard;
    label: string;
    end?: boolean;
    badge?: string | null;
    isAlert?: boolean;
    isAction?: boolean;
  }

  interface NavGroup {
    group: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      group: 'DECISION INTELLIGENCE',
      items: [
        { path: '', icon: LayoutDashboard, label: 'Overview', end: true, badge: null },
        { path: 'events', icon: CloudRain, label: 'Event Outlook', end: false, badge: `${event.rainfallIntensity} mm/h` },
        { path: 'map', icon: Map, label: 'Risk Map', end: false, badge: null },
        { path: 'drains', icon: Database, label: 'Drain Intelligence', end: false, badge: null },
      ]
    },
    {
      group: 'OPERATIONAL RESPONSE',
      items: [
        { path: 'alerts', icon: Bell, label: 'Alert Centre', end: false, badge: newAlertsCount > 0 ? `${newAlertsCount} new` : null, isAlert: true },
        { path: 'interventions', icon: ListChecks, label: 'Intervention Planner', end: false, badge: pendingActionsCount > 0 ? `${pendingActionsCount} pend` : null, isAction: true },
        { path: 'observations', icon: ClipboardCheck, label: 'Observations', end: false, badge: null },
      ]
    },
    {
      group: 'CONFIGURATION',
      items: [
        { path: 'settings', icon: Settings, label: 'Settings', end: false, badge: 'Demo' },
      ]
    }
  ];

  // Derive current location title for breadcrumb
  const currentPathSegment = location.pathname.replace('/dashboard', '').replace('/', '');
  const getPageTitle = () => {
    switch (currentPathSegment) {
      case 'events': return 'Event Outlook // Question 01: WHEN?';
      case 'map': return 'Risk Map // Question 02: WHERE?';
      case 'drains': return 'Drain Intelligence // Question 03: WHY?';
      case 'alerts': return 'Alert Centre // Real-Time Triggers';
      case 'interventions': return 'Intervention Planner // Question 04: WHAT FIRST?';
      case 'observations': return 'Field Observations // Calibration';
      case 'settings': return 'System Configuration & Health';
      default: return 'Command Overview // Unified Operational Canvas';
    }
  };

  return (
    <div className="dashboard">
      {/* Mobile Top Header */}
      <header className="dashboard__mobile-header">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="dashboard__menu-btn" aria-label="Toggle navigation">
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="brand-mark" style={{ fontSize: '0.813rem' }}>JALAPRAHARI</span>
          <span className="brand-sanskrit" style={{ fontSize: '0.625rem' }}>जलप्रहरी</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle size="sm" />
          <Link to="/" style={{ fontSize: '0.75rem', color: 'var(--color-forest)', fontWeight: 600 }}>
            Atlas &rarr;
          </Link>
        </div>
      </header>

      {/* Bespoke Command Atlas Sidebar */}
      <aside className={`dashboard__sidebar ${sidebarOpen ? 'dashboard__sidebar--open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar__header">
          <Link to="/" className="sidebar__brand-link" title="Return to Public Atlas">
            <div className="sidebar__brand">
              <span className="brand-mark">JALAPRAHARI</span>
              <span className="brand-sanskrit">जलप्रहरी</span>
            </div>
            <span className="sidebar__badge">ENVIRONMENTAL ATLAS</span>
          </Link>
          
          <div className="sidebar__corridor-tag">
            <Compass size={11} />
            <span>Bangalore South-East Basin</span>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="sidebar__nav" role="navigation" aria-label="Dashboard navigation">
          {navGroups.map((group) => (
            <div key={group.group} className="sidebar__group">
              <span className="sidebar__group-title">{group.group}</span>
              <div className="sidebar__group-items">
                {group.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={`/dashboard/${item.path}`}
                    end={item.end}
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={16} className="sidebar__link-icon" />
                    <span className="sidebar__link-text">{item.label}</span>
                    {item.badge && (
                      <span className={`sidebar__pill ${item.isAlert ? 'sidebar__pill--alert' : item.isAction ? 'sidebar__pill--action' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Storm Status Quick Telemetry Box */}
        <div className="sidebar__telemetry">
          <div className="telemetry-header">
            <span className="status-dot status-dot--active" />
            <span>DEMO SCENARIO LOADED</span>
          </div>
          <div className="telemetry-body">
            <div className="telemetry-metric">
              <span className="telemetry-label">Rain Intensity</span>
              <span className="telemetry-val">{event.rainfallIntensity} mm/h</span>
            </div>
            <div className="telemetry-metric">
              <span className="telemetry-label">Action Window</span>
              <span className="telemetry-val" style={{ color: 'var(--color-brass)' }}>~6h (Illustrative)</span>
            </div>
          </div>
          <div className="telemetry-sub">
            Scenario: 08:00 IST reference to 14:00 IST onset.
          </div>
        </div>

        {/* Footer & User Profile */}
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {user?.fullName?.charAt(0) || 'M'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.fullName || 'Municipal Operator'}</span>
              <span className="sidebar__user-role">{user?.role || 'Stormwater Engineer'}</span>
            </div>
          </div>
          <div className="sidebar__footer-actions">
            <ThemeToggle size="sm" />
            <div className="sidebar__footer-links-group">
              <Link to="/" className="sidebar__footer-link" title="Public Environmental Atlas">
                <ExternalLink size={13} />
                <span>Atlas</span>
              </Link>
              <button onClick={handleSignOut} className="sidebar__signout" aria-label="Sign out">
                <LogOut size={13} />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {sidebarOpen && <div className="dashboard__overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content Workspace */}
      <div className="dashboard__workspace">
        {/* Top Context & Command Strip */}
        <header className="dashboard__command-strip">
          <div className="command-strip__breadcrumb">
            <span className="command-strip__crumb-root">JALAPRAHARI COMMAND</span>
            <span className="command-strip__sep">/</span>
            <span className="command-strip__crumb-active">{getPageTitle()}</span>
          </div>

          <div className="command-strip__status-group">
            <div className="command-strip__status-pill">
              <span className="status-dot status-dot--active" />
              <span>STORM EVENT: {event.id} ({event.rainfallIntensity} mm/hr)</span>
            </div>
            <div className="command-strip__status-pill command-strip__status-pill--subtle">
              <ShieldCheck size={13} style={{ color: 'var(--color-forest)' }} />
              <span>SYNTHETIC DEMO BASELINE</span>
            </div>
            <ThemeToggle size="sm" />
          </div>
        </header>

        {/* Routed Dashboard Views */}
        <main className="dashboard__main">
          <Routes>
            <Route index element={<OverviewPanel />} />
            <Route path="events" element={<EventOutlook />} />
            <Route path="map" element={<RiskMapPanel />} />
            <Route path="drains" element={<DrainIntelligence />} />
            <Route path="alerts" element={<AlertCentre />} />
            <Route path="interventions" element={<InterventionPlanner />} />
            <Route path="observations" element={<ObservationsPanel />} />
            <Route path="settings" element={<SettingsPanel />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
