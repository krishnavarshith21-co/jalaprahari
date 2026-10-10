import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function FourQuestionsSystem() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/signin');
    }
  };

  return (
    <section className="section section--questions" id="questions">
      <div className="container-wide">
        
        {/* Section Header */}
        <div className="questions-header-compact">
          <span className="editorial-eyebrow">Decision Architecture</span>
          <h2 className="editorial-headline">
            The four core questions.
          </h2>
          <p className="questions-header-lead">
            Jalaprahari structures municipal decision-making into four sequential inquiries&mdash;from 
            timing and spatial priority to transparent evidence and targeted dispatch.
          </p>
        </div>

        {/* Four Distinct Architectural Chapters */}
        <div className="distinct-chapters-stack">

          {/* ── CHAPTER 01: WHEN? paired with Event Timeline ── */}
          <div className="chapter-spread chapter-spread--when">
            <div className="chapter-text-rail">
              <span className="chapter-num-badge">01 // WHEN?</span>
              <h3 className="chapter-heading">When is a high-plastic first-flush event likely?</h3>
              <p className="chapter-supporting-sentence">
                Predicts the mobilization window by comparing antecedent dry accumulation against forecast rainfall intensity.
              </p>
              <button
                onClick={() => handleNavigate('/dashboard/events')}
                className="chapter-inline-link"
              >
                <span>Explore Event Outlook</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="chapter-visual-surface surface--when">
              <div className="surface-header-bar">
                <span className="surface-title">Forecast Event Timeline &bull; Sample Basin (Demonstration)</span>
                <span className="surface-pill surface-pill--alert">First-Flush Watch</span>
              </div>
              <div className="when-timeline-grid">
                <div className="when-stat-block">
                  <span className="when-stat-label">Antecedent Window</span>
                  <span className="when-stat-val">11 Dry Days</span>
                  <span className="when-stat-sub">Baseline Accumulation</span>
                </div>
                <div className="when-stat-block when-stat-block--critical">
                  <span className="when-stat-label">Available Window</span>
                  <span className="when-stat-val">~6 Hours</span>
                  <span className="when-stat-sub">Pre-Flush Action Window</span>
                </div>
                <div className="when-stat-block">
                  <span className="when-stat-label">Forecast Intensity</span>
                  <span className="when-stat-val">28 mm/h</span>
                  <span className="when-stat-sub">Synthetic Peak Rate</span>
                </div>
              </div>
              <div className="when-sequence-progress-bar">
                <div className="prog-bar-seg prog-bar-seg--accum" style={{ width: '45%' }}>
                  <span>Dry Accumulation</span>
                </div>
                <div className="prog-bar-seg prog-bar-seg--target" style={{ width: '25%' }}>
                  <span>Action Window</span>
                </div>
                <div className="prog-bar-seg prog-bar-seg--wash" style={{ width: '30%' }}>
                  <span>Wash-Off Peak</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CHAPTER 02: WHERE? paired with Spatial Priority Ranking ── */}
          <div className="chapter-spread chapter-spread--where">
            <div className="chapter-text-rail">
              <span className="chapter-num-badge">02 // WHERE?</span>
              <h3 className="chapter-heading">Which drains are most at risk?</h3>
              <p className="chapter-supporting-sentence">
                Ranks urban stormwater outfalls by catchment slope, impervious area, and commercial litter accumulation.
              </p>
              <button
                onClick={() => handleNavigate('/dashboard/map')}
                className="chapter-inline-link"
              >
                <span>Explore Catchment Map</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="chapter-visual-surface surface--where">
              <div className="surface-header-bar">
                <span className="surface-title">Spatial Risk Ranking &bull; Outfalls (Illustrative)</span>
                <span className="surface-pill">Catchment Prioritization</span>
              </div>
              <div className="where-ranking-list">
                <div className="where-rank-item where-rank-item--critical">
                  <span className="rank-num">01</span>
                  <div className="rank-details">
                    <div className="rank-id-row">
                      <span className="rank-id">DR-004</span>
                      <span className="rank-name">Majestic Bus Station Drain</span>
                    </div>
                    <span className="rank-sub">4.2 km² Catchment &bull; Bus Terminal & Commercial Hub</span>
                  </div>
                  <div className="rank-score">
                    <span className="rank-score-num">81</span>
                    <span className="rank-score-denom">/100</span>
                  </div>
                </div>

                <div className="where-rank-item where-rank-item--high">
                  <span className="rank-num">02</span>
                  <div className="rank-details">
                    <div className="rank-id-row">
                      <span className="rank-id">DR-002</span>
                      <span className="rank-name">Koramangala Market Outfall</span>
                    </div>
                    <span className="rank-sub">3.1 km² Catchment &bull; Vegetable Market & Food Vendors</span>
                  </div>
                  <div className="rank-score">
                    <span className="rank-score-num">74</span>
                    <span className="rank-score-denom">/100</span>
                  </div>
                </div>

                <div className="where-rank-item where-rank-item--high">
                  <span className="rank-num">03</span>
                  <div className="rank-details">
                    <div className="rank-id-row">
                      <span className="rank-id">DR-007</span>
                      <span className="rank-name">Hebbal Flyover Underpass Drain</span>
                    </div>
                    <span className="rank-sub">3.8 km² Catchment &bull; Highway Underpass Geometry</span>
                  </div>
                  <div className="rank-score">
                    <span className="rank-score-num">72</span>
                    <span className="rank-score-denom">/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CHAPTER 03: WHY? paired with Factor-Contribution Graphic ── */}
          <div className="chapter-spread chapter-spread--why">
            <div className="chapter-text-rail">
              <span className="chapter-num-badge">03 // WHY?</span>
              <h3 className="chapter-heading">What evidence explains each high-risk drain?</h3>
              <p className="chapter-supporting-sentence">
                Deconstructs each risk score into auditable environmental parameters, terrain factors, and inlet conditions.
              </p>
              <button
                onClick={() => handleNavigate('/dashboard/drains')}
                className="chapter-inline-link"
              >
                <span>Inspect Risk Evidence</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="chapter-visual-surface surface--why">
              <div className="surface-header-bar">
                <span className="surface-title">Factor Contribution Ledger &bull; Outfall DR-004</span>
                <span className="surface-pill">Calibrated Heuristic Weights</span>
              </div>
              <div className="why-factors-ledger">
                <div className="ledger-entry">
                  <span className="ledger-name">Rainfall Intensity (28 mm/h expected)</span>
                  <div className="ledger-track-col">
                    <div className="ledger-track-bg">
                      <div className="ledger-track-fill" style={{ width: '70%', background: 'var(--color-terracotta)' }} />
                    </div>
                  </div>
                  <span className="ledger-weight">25% weight</span>
                </div>

                <div className="ledger-entry">
                  <span className="ledger-name">Antecedent Dry Duration (11 days)</span>
                  <div className="ledger-track-col">
                    <div className="ledger-track-bg">
                      <div className="ledger-track-fill" style={{ width: '79%', background: 'var(--color-brass)' }} />
                    </div>
                  </div>
                  <span className="ledger-weight">20% weight</span>
                </div>

                <div className="ledger-entry">
                  <span className="ledger-name">Land Use Exposure (Bus Terminal & Commercial)</span>
                  <div className="ledger-track-col">
                    <div className="ledger-track-bg">
                      <div className="ledger-track-fill" style={{ width: '88%', background: 'var(--color-brass)' }} />
                    </div>
                  </div>
                  <span className="ledger-weight">20% weight</span>
                </div>

                <div className="ledger-entry">
                  <span className="ledger-name">Drainage Vulnerability (Condition: Critical)</span>
                  <div className="ledger-track-col">
                    <div className="ledger-track-bg">
                      <div className="ledger-track-fill" style={{ width: '92%', background: 'var(--color-olive)' }} />
                    </div>
                  </div>
                  <span className="ledger-weight">15% weight</span>
                </div>

                <div className="ledger-entry">
                  <span className="ledger-name">Catchment Exposure (4.2 sq km)</span>
                  <div className="ledger-track-col">
                    <div className="ledger-track-bg">
                      <div className="ledger-track-fill" style={{ width: '84%', background: 'var(--color-forest)' }} />
                    </div>
                  </div>
                  <span className="ledger-weight">10% weight</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CHAPTER 04: WHAT FIRST? paired with Focused Action Directive ── */}
          <div className="chapter-spread chapter-spread--what">
            <div className="chapter-text-rail">
              <span className="chapter-num-badge">04 // WHAT FIRST?</span>
              <h3 className="chapter-heading">Which preventive actions should municipal teams prioritize?</h3>
              <p className="chapter-supporting-sentence">
                Generates targeted pre-event directives&mdash;such as curb sweeping and temporary screens&mdash;before runoff begins.
              </p>
              <button
                onClick={() => handleNavigate('/dashboard/interventions')}
                className="chapter-inline-link"
              >
                <span>Open Intervention Queue</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="chapter-visual-surface surface--what">
              <div className="surface-header-bar">
                <span className="surface-title">Operational Directive Queue (Illustrative)</span>
                <span className="surface-pill surface-pill--alert">Immediate Deployment</span>
              </div>
              <div className="what-directive-card">
                <div className="directive-tag-row">
                  <span className="directive-stamp">PRIMARY ACTION DIRECTIVE</span>
                  <span className="directive-countdown">
                    <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    Deploy prior to rain onset (~6h window)
                  </span>
                </div>
                <h4 className="directive-action-title">
                  Immediate Pre-Event Drain Inspection and Plastic Debris Removal
                </h4>
                <div className="directive-location">
                  <MapPin size={12} className="loc-pin" />
                  <span>Outfall DR-004 &bull; Majestic Bus Station Drain</span>
                </div>
                <div className="directive-meta-strip">
                  <span className="directive-status-tag">Ready for Dispatch</span>
                  <span className="directive-sop">Illustrative Municipal Directive &bull; Priority Level: Critical</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
