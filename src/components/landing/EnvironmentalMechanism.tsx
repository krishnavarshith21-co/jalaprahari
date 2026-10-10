import { useState } from 'react';
import { ArrowRight, ChevronRight, ChevronDown } from 'lucide-react';

export default function EnvironmentalMechanism() {
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  const sequenceSteps = [
    {
      step: '01',
      title: 'Plastic accumulates',
      description: 'Dry intervals allow buoyant litter and packaging to gather along urban curbs and pavement depressions.',
    },
    {
      step: '02',
      title: 'Rainfall mobilizes litter',
      description: 'Early surface runoff generates hydraulic shear stress that detaches and carries surface debris within the opening hour.',
    },
    {
      step: '03',
      title: 'Plastic enters drains',
      description: 'Runoff funnels mobilized waste through unscreened stormwater inlets straight into subterranean conduits.',
    },
    {
      step: '04',
      title: 'Waste moves downstream',
      description: 'Underground conduit networks discharge unintercepted plastic directly into lakes and rivers.',
    },
  ];

  const workflowStages = [
    { num: '01', label: 'Environmental inputs', role: 'Telemetry' },
    { num: '02', label: 'Validation', role: 'Quality Control' },
    { num: '03', label: 'Event assessment', role: 'Temporal' },
    { num: '04', label: 'Drain ranking', role: 'Spatial' },
    { num: '05', label: 'Evidence', role: 'Attribution' },
    { num: '06', label: 'Alert', role: 'Notification' },
    { num: '07', label: 'Intervention', role: 'Dispatch' },
    { num: '08', label: 'Outcome', role: 'Calibration' },
  ];

  return (
    <section className="section section--mechanism" id="overview">
      <div className="container-wide">
        
        {/* Section Header */}
        <div className="mechanism-header-compact">
          <span className="editorial-eyebrow">The Environmental Problem</span>
          <h2 className="editorial-headline">
            The critical moment is easy to miss.
          </h2>
          <div className="mechanism-paragraphs">
            <p className="mechanism-p">
              During dry intervals between storms, plastic packaging, wrappers, and discarded containers 
              accumulate along urban curbs, commercial gutters, and impervious pavement depressions. 
              Municipal street sweeping follows fixed administrative calendars rather than weather forecasts, 
              leaving this buoyant litter on the ground as clouds gather.
            </p>
            <p className="mechanism-p">
              When rainfall begins, surface runoff quickly develops hydraulic force that mobilizes this 
              accumulation during the first flush. Unscreened stormwater inlets ingest the debris directly 
              into underground conduits, carrying it into lakes and rivers before conventional post-storm 
              cleanup teams can respond.
            </p>
          </div>
        </div>

        {/* Tactile 4-Step Visual Transport Sequence */}
        <div className="mechanism-sequence-container">
          <div className="sequence-label-bar">
            <div className="label-bar-left">
              <span className="sequence-label-title">Transport Sequence</span>
              <span className="label-sep">&bull;</span>
              <span className="sequence-label-sub">How roadside waste becomes aquatic pollution</span>
            </div>
            <span className="sequence-label-tag">First-Flush Dynamics</span>
          </div>

          <div className="mechanism-sequence-grid">
            {sequenceSteps.map((item, idx) => (
              <div key={item.step} className="sequence-node-wrapper">
                <div className="sequence-card">
                  <div className="sequence-card__header">
                    <span className="sequence-step-num">{item.step}</span>
                    <span className="sequence-step-dot" />
                  </div>
                  <h3 className="sequence-card__title">{item.title}</h3>
                  <p className="sequence-card__desc">{item.description}</p>
                </div>
                {idx < sequenceSteps.length - 1 && (
                  <div className="sequence-connector" aria-hidden="true">
                    <ArrowRight size={16} className="connector-arrow" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Concise Expandable Methodology Section */}
        <div className="methodology-accordion">
          <button
            type="button"
            className="methodology-toggle-btn"
            onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
            aria-expanded={isMethodologyOpen}
          >
            <div className="methodology-toggle-label">
              <span className="methodology-pill">Methodology</span>
              <span className="methodology-title">8-Stage Technical Decision Pipeline</span>
              <span className="methodology-meta-note">&bull; Illustrative Prototype Architecture</span>
            </div>
            <div className="methodology-toggle-action">
              <span className="toggle-action-text">
                {isMethodologyOpen ? 'Hide Methodology' : 'View Methodology'}
              </span>
              <ChevronDown 
                size={15} 
                className={`toggle-chevron ${isMethodologyOpen ? 'toggle-chevron--open' : ''}`} 
              />
            </div>
          </button>

          {isMethodologyOpen && (
            <div className="workflow-ribbon-container workflow-ribbon-container--expanded">
              <div className="workflow-ribbon-header">
                <div className="ribbon-title-col">
                  <span className="ribbon-eyebrow">Platform Architecture</span>
                  <span className="ribbon-title">End-to-End Decision Pipeline</span>
                </div>
                <span className="ribbon-meta">8 Connected Operational Stages &bull; Illustrative Pipeline</span>
              </div>

              <div className="workflow-ribbon-track">
                {workflowStages.map((stage, i) => (
                  <div key={stage.num} className="ribbon-stage-item">
                    <div className="stage-marker-row">
                      <span className="stage-num">{stage.num}</span>
                      <span className="stage-dot" />
                    </div>
                    <div className="stage-info">
                      <span className="stage-label">{stage.label}</span>
                      <span className="stage-role">{stage.role}</span>
                    </div>
                    {i < workflowStages.length - 1 && (
                      <div className="stage-divider-arrow" aria-hidden="true">
                        <ChevronRight size={13} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

