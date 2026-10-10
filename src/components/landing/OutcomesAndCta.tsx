import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export default function OutcomesAndCta() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleLaunch = () => {
    if (user) navigate('/dashboard');
    else navigate('/signin');
  };

  return (
    <section className="section section--outcomes" id="impact">
      <div className="container-wide">
        
        {/* Confident Final Editorial Spread */}
        <div className="outcomes-editorial-spread">
          
          {/* Left Column: Direct Intent & Actions */}
          <div className="outcomes-message-pane">
            <span className="editorial-eyebrow">Preventive Action</span>
            
            <h2 className="outcomes-headline">
              Make the first intervention count.
            </h2>

            <p className="outcomes-supporting-sentence">
              Identify high-risk drains, understand the evidence, and prioritize preventive action.
            </p>

            <div className="outcomes-actions-group">
              <button onClick={handleLaunch} className="btn btn-primary btn-lg">
                Explore Jalaprahari
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column: Sophisticated Engineering Interception Schematic */}
          <div className="outcomes-visual-pane">
            <div className="interception-diagram-surface">
              <div className="diagram-surface-header">
                <div className="header-title-group">
                  <span className="surface-title">Pre-Flush Catchment Interception</span>
                  <span className="surface-sep">&bull;</span>
                  <span className="surface-sub">Conceptual Hydraulic Section</span>
                </div>
                <span className="surface-tag">Field Engineering</span>
              </div>

              {/* Sophisticated Architectural Engineering Cross-Section */}
              <div className="interception-canvas">
                <svg viewBox="0 0 500 230" className="interception-svg" role="img" aria-label="Conceptual stormwater inlet interception schematic">
                  <defs>
                    {/* Asphalt Pavement Hatching Pattern */}
                    <pattern id="asphaltHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="8" stroke={isDark ? '#6B7A66' : '#3D4539'} strokeWidth="0.8" strokeOpacity="0.4" />
                    </pattern>
                    {/* Subgrade Soil Pattern */}
                    <pattern id="soilHatch" width="12" height="12" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="0.6" fill={isDark ? '#4F5D48' : '#7A846B'} fillOpacity="0.5" />
                      <circle cx="8" cy="8" r="0.6" fill={isDark ? '#4F5D48' : '#7A846B'} fillOpacity="0.5" />
                    </pattern>
                  </defs>

                  {/* Subgrade Ground Foundation */}
                  <rect x="20" y="115" width="460" height="95" fill={isDark ? '#1C261E' : '#EAE5DA'} />
                  <rect x="20" y="115" width="460" height="95" fill="url(#soilHatch)" />

                  {/* Road Asphalt Pavement Slab */}
                  <polygon points="20,110 210,115 210,140 20,140" fill={isDark ? '#232D25' : '#363D33'} />
                  <polygon points="20,110 210,115 210,140 20,140" fill="url(#asphaltHatch)" />
                  <line x1="20" y1="110" x2="210" y2="115" stroke={isDark ? '#3D4F3E' : '#252A23'} strokeWidth="1.5" />

                  {/* Concrete Curb Profile */}
                  <rect x="210" y="85" width="22" height="55" fill={isDark ? '#283329' : '#D2CCC0'} stroke={isDark ? '#3D4F3E' : '#30372C'} strokeWidth="1.2" />
                  <line x1="210" y1="85" x2="232" y2="85" stroke={isDark ? '#3D4F3E' : '#30372C'} strokeWidth="1.5" />

                  {/* Storm Catch Basin Masonry Vault */}
                  <rect x="232" y="115" width="70" height="95" fill={isDark ? '#182019' : '#242921'} stroke={isDark ? '#3D4F3E' : '#30372C'} strokeWidth="1.2" />
                  {/* Catch Basin Sump Bottom */}
                  <rect x="240" y="195" width="54" height="15" fill={isDark ? '#111711' : '#1B1E19'} />

                  {/* Subterranean Storm Conduit (Conduit heading downstream to right) */}
                  <path 
                    d="M 302 165 L 480 180 L 480 205 L 302 195 Z" 
                    fill={isDark ? '#232D25' : '#363D33'} 
                    stroke={isDark ? '#3D4F3E' : '#30372C'} 
                    strokeWidth="1.2" 
                  />
                  <line x1="302" y1="165" x2="480" y2="180" stroke={isDark ? '#839578' : '#7A9188'} strokeWidth="1" strokeDasharray="3 2" />

                  {/* Cast-Iron Curb Inlet Throat Opening */}
                  <rect x="228" y="98" width="16" height="17" fill={isDark ? '#111711' : '#1E231B'} stroke={isDark ? '#3D4F3E' : '#30372C'} strokeWidth="1" />
                  {/* Cast Iron Inlet Grate Ribs */}
                  <line x1="230" y1="102" x2="242" y2="102" stroke={isDark ? '#D0B27A' : '#AD8B56'} strokeWidth="1.8" />
                  <line x1="230" y1="108" x2="242" y2="108" stroke={isDark ? '#D0B27A' : '#AD8B56'} strokeWidth="1.8" />
                  <line x1="230" y1="114" x2="242" y2="114" stroke={isDark ? '#D0B27A' : '#AD8B56'} strokeWidth="1.8" />

                  {/* ── TEMPORARY PERMEABLE INTERCEPTION SCREEN (Installed across curb throat) ── */}
                  <g className="barrier-structure">
                    {/* Mounting Bracket Frame */}
                    <rect x="226" y="88" width="4" height="28" fill={isDark ? '#D0B27A' : '#AD8B56'} rx="1" stroke={isDark ? '#111711' : '#30372C'} strokeWidth="0.8" />
                    {/* Permeable Wire Mesh Screen Grid */}
                    <line x1="228" y1="92" x2="228" y2="115" stroke={isDark ? '#C4775D' : '#B9654B'} strokeWidth="3.2" />
                    <line x1="226" y1="96" x2="230" y2="96" stroke="#FFFFFF" strokeWidth="0.8" />
                    <line x1="226" y1="102" x2="230" y2="102" stroke="#FFFFFF" strokeWidth="0.8" />
                    <line x1="226" y1="108" x2="230" y2="108" stroke="#FFFFFF" strokeWidth="0.8" />
                  </g>

                  {/* ── FILTERED WATER DRAINAGE STREAMLINE (Continuous Sage Flow passing through screen) ── */}
                  <g className="water-flow-group">
                    <path 
                      className="flowing-water-streamline"
                      d="M 30 106 L 225 112 Q 245 114, 255 130 T 270 172 Q 285 180, 310 182 L 480 196" 
                      fill="none" 
                      stroke={isDark ? '#839578' : '#7A9188'} 
                      strokeWidth="2.5" 
                      strokeDasharray="6 3" 
                    />
                    <path 
                      className="flowing-water-streamline-secondary"
                      d="M 80 108 L 225 113 Q 248 116, 260 140 T 278 180 L 480 200" 
                      fill="none" 
                      stroke={isDark ? '#A8B89E' : '#A4B8A8'} 
                      strokeWidth="1.5" 
                      strokeDasharray="4 4" 
                      strokeOpacity="0.8" 
                    />
                  </g>

                  {/* ── MOBILIZED PLASTIC DEBRIS PARTICLES (Moving toward screen and arresting at mesh) ── */}
                  <g className="debris-particles-group">
                    {/* Approaching debris traveling along street gutter */}
                    <circle cx="50" cy="104" r="3" className="debris-particle-anim d1" fill={isDark ? '#C4775D' : '#B9654B'} />
                    <circle cx="85" cy="105" r="3.5" className="debris-particle-anim d2" fill={isDark ? '#C4775D' : '#B9654B'} />
                    <circle cx="120" cy="107" r="3" className="debris-particle-anim d3" fill={isDark ? '#C4775D' : '#B9654B'} />
                    <circle cx="155" cy="108" r="4" className="debris-particle-anim d4" fill={isDark ? '#C4775D' : '#B9654B'} />

                    {/* Debris particles arrested and trapped securely at barrier face */}
                    <circle cx="222" cy="109" r="4" fill={isDark ? '#C4775D' : '#B9654B'} stroke={isDark ? '#111711' : '#252A23'} strokeWidth="0.8" />
                    <circle cx="220" cy="103" r="3.5" fill={isDark ? '#C4775D' : '#B9654B'} stroke={isDark ? '#111711' : '#252A23'} strokeWidth="0.8" />
                    <circle cx="223" cy="98" r="3.8" fill={isDark ? '#C4775D' : '#B9654B'} stroke={isDark ? '#111711' : '#252A23'} strokeWidth="0.8" />
                    <circle cx="218" cy="113" r="3.2" fill={isDark ? '#C4775D' : '#B9654B'} stroke={isDark ? '#111711' : '#252A23'} strokeWidth="0.8" />
                  </g>

                  {/* ── MECHANICAL ANNOTATIONS & CALLOUT LEADER LINES ── */}
                  {/* Debris Flow Annotation */}
                  <g transform="translate(35, 78)">
                    <text x="0" y="0" fontSize="8" fontFamily="var(--font-mono)" fill={isDark ? '#D17C64' : '#B9654B'} fontWeight="700">
                      01 // APPROACHING PLASTIC
                    </text>
                    <text x="0" y="10" fontSize="7" fontFamily="var(--font-mono)" fill={isDark ? '#C1C3B8' : '#5A6155'}>
                      Surface runoff detachment
                    </text>
                    <line x1="75" y1="14" x2="95" y2="24" stroke={isDark ? '#D17C64' : '#B9654B'} strokeWidth="0.8" strokeDasharray="2 2" />
                  </g>

                  {/* Temporary Barrier Annotation */}
                  <g transform="translate(190, 52)">
                    <text x="0" y="0" fontSize="8" fontFamily="var(--font-mono)" fill={isDark ? '#D0B27A' : '#AD8B56'} fontWeight="700">
                      02 // INTERCEPTION SCREEN
                    </text>
                    <text x="0" y="10" fontSize="7" fontFamily="var(--font-mono)" fill={isDark ? '#C1C3B8' : '#5A6155'}>
                      Temporary permeable netting
                    </text>
                    <line x1="38" y1="14" x2="38" y2="34" stroke={isDark ? '#D0B27A' : '#AD8B56'} strokeWidth="0.8" />
                    <circle cx="38" cy="35" r="1.5" fill={isDark ? '#D0B27A' : '#AD8B56'} />
                  </g>

                  {/* Continuous Water Discharge Annotation */}
                  <g transform="translate(325, 140)">
                    <text x="0" y="0" fontSize="8" fontFamily="var(--font-mono)" fill={isDark ? '#839578' : '#53664D'} fontWeight="700">
                      03 // WATER DISCHARGE
                    </text>
                    <text x="0" y="10" fontSize="7" fontFamily="var(--font-mono)" fill={isDark ? '#C1C3B8' : '#5A6155'}>
                      Unchoked drainage to outfall
                    </text>
                    <line x1="45" y1="14" x2="45" y2="36" stroke={isDark ? '#839578' : '#53664D'} strokeWidth="0.8" strokeDasharray="2 2" />
                  </g>
                </svg>
              </div>

              <div className="diagram-caption-footer">
                <span className="diagram-caption-bullet" />
                <span>
                  <strong>Conceptual Engineering Model:</strong> Intervening before buoyant debris enters 
                  subterranean conduits prevents aquatic dispersion. Barrier mesh specifications require site-specific hydraulic verification.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
