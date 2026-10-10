export default function TraceableWorkflow() {
  const pipelineStages = [
    {
      num: '01',
      name: 'Environmental inputs',
      detail: 'Precipitation forecasts, antecedent dry days, and GIS drainage parameters.',
      transition: 'Raw data routed to schema validation',
    },
    {
      num: '02',
      name: 'Data validation',
      detail: 'Bounding checks, coordinate sanity tests, and missing attribute flagging.',
      transition: 'Verified records pass to classifier',
    },
    {
      num: '03',
      name: 'Event assessment',
      detail: 'Cross-examines rain forecast against antecedent dryness to detect first-flush likelihood.',
      transition: 'Trigger threshold initiates spatial scoring',
    },
    {
      num: '04',
      name: 'Drain-level ranking',
      detail: 'Multi-criteria spatial scoring across catchment slope, impervious cover, and land use.',
      transition: 'Scored outfalls sorted into priority roster',
    },
    {
      num: '05',
      name: 'Evidence explanation',
      detail: 'Deconstructs every drain score into transparent contributing environmental factors.',
      transition: 'Attribution rationale feeds alert threshold',
    },
    {
      num: '06',
      name: 'Alert generation',
      detail: 'Threshold-based warnings notify municipal teams before rainfall onset.',
      transition: 'Approved alerts generate action directives',
    },
    {
      num: '07',
      name: 'Municipal intervention',
      detail: 'Issues prioritized field orders for temporary mesh barriers and targeted curb sweeps.',
      transition: 'Field deployment logged in registry',
    },
    {
      num: '08',
      name: 'Outcome recording',
      detail: 'Logs post-event inspections and captured debris to calibrate future model runs.',
      transition: 'Empirical feedback refines scoring weights',
    },
  ];

  return (
    <section className="section section--workflow" id="how-it-works">
      <div className="container-wide">
        
        {/* Section Header */}
        <div className="workflow-header">
          <div className="workflow-title-block">
            <span className="editorial-eyebrow">Scientific Pipeline</span>
            <h2 className="editorial-headline">
              A traceable path from atmosphere to outfall.
            </h2>
          </div>
          <p className="workflow-lead-block">
            Municipal accountability requires transparent provenance. The platform follows an unbroken 
            eight-stage sequence connecting raw meteorological data to verified field outcome recording.
          </p>
        </div>

        {/* Technical Research Diagram (Continuous Connected Sequence — Zero Box Cards) */}
        <div className="research-pipeline-diagram">
          
          {/* Top Phase Classification Brackets */}
          <div className="pipeline-phases-bar">
            <div className="phase-bracket" style={{ flex: 2 }}>
              <span className="bracket-title">Data Ingestion & Validation</span>
              <span className="bracket-line" />
            </div>
            <div className="phase-bracket" style={{ flex: 3 }}>
              <span className="bracket-title">Analytical Inference & Ranking</span>
              <span className="bracket-line" />
            </div>
            <div className="phase-bracket" style={{ flex: 2 }}>
              <span className="bracket-title">Field Intervention</span>
              <span className="bracket-line" />
            </div>
            <div className="phase-bracket" style={{ flex: 1 }}>
              <span className="bracket-title">Calibration</span>
              <span className="bracket-line" />
            </div>
          </div>

          {/* Continuous Sequential Pipeline Track */}
          <div className="pipeline-flow-track">
            {/* Horizontal Continuous Axis Line (Desktop) */}
            <div className="track-axis-line" aria-hidden="true" />

            <div className="pipeline-nodes-row">
              {pipelineStages.map((stage, idx) => (
                <div key={stage.num} className="pipeline-stage-node">
                  
                  {/* Axis Node Marker with Directional Step */}
                  <div className="stage-node-marker">
                    <span className="marker-core">
                      <span className="marker-num">{stage.num}</span>
                    </span>
                    {idx < pipelineStages.length - 1 && (
                      <span className="marker-connector-arrow" aria-hidden="true">&rarr;</span>
                    )}
                  </div>

                  {/* Stage Text & Transition Note */}
                  <div className="stage-content">
                    <h3 className="stage-title">{stage.name}</h3>
                    <p className="stage-desc">{stage.detail}</p>
                    <div className="stage-transition">
                      <span className="transition-bullet">&bull;</span>
                      <span className="transition-text">{stage.transition}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Bottom Provenance Footnote */}
          <div className="pipeline-diagram-footer">
            <span className="footer-status-dot" />
            <span>
              All intermediate outputs remain auditable within the system, ensuring every work order 
              is backed by transparent environmental factors.
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
