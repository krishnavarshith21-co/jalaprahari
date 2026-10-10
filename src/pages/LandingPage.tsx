import { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, ChevronDown, Menu, X, Droplets, Camera, Box } from 'lucide-react';
import EnvironmentalMechanism from '../components/landing/EnvironmentalMechanism';
import CatchmentMapDemo from '../components/landing/CatchmentMapDemo';
import OutcomesAndCta from '../components/landing/OutcomesAndCta';
import ThemeToggle from '../components/shared/ThemeToggle';
import './LandingPage.css';

const HeroScene = lazy(() => import('../components/three/HeroScene'));

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroVisualMode, setHeroVisualMode] = useState<'photo' | '3d'>('photo');
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'demo', 'impact'];
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sections[i]);
            return;
          }
        }
      }
      setActiveSection('');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (user) navigate('/dashboard');
    else navigate('/signin');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="landing">
      {/* ─── 1. Navigation ─── */}
      <header className="landing-nav">
        <div className="container-wide landing-nav__inner">
          <Link to="/" className="landing-nav__brand" aria-label="Jalaprahari Home">
            <span className="brand-mark">JALAPRAHARI</span>
            <span className="brand-sanskrit">जलप्रहरी</span>
          </Link>

          <nav className="landing-nav__links" role="navigation" aria-label="Main navigation">
            <button
              onClick={() => scrollToSection('overview')}
              className={`nav-link ${activeSection === 'overview' ? 'nav-link--active' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className={`nav-link ${activeSection === 'demo' ? 'nav-link--active' : ''}`}
            >
              Catchment Atlas
            </button>
            <button
              onClick={() => scrollToSection('impact')}
              className={`nav-link ${activeSection === 'impact' ? 'nav-link--active' : ''}`}
            >
              Action
            </button>
            <Link to="/signin" className="nav-link">Sign In</Link>
            <ThemeToggle size="sm" />
            <button onClick={handleGetStarted} className="btn btn-primary btn-sm">
              Open Dashboard
              <ArrowRight size={14} />
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="landing-nav__mobile-theme-toggle">
              <ThemeToggle size="sm" />
            </div>
            <button 
              className="landing-nav__mobile-toggle" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <button onClick={() => scrollToSection('overview')} className="mobile-menu__link">Overview</button>
              <button onClick={() => scrollToSection('demo')} className="mobile-menu__link">Catchment Atlas</button>
              <button onClick={() => scrollToSection('impact')} className="mobile-menu__link">Action</button>
              <Link to="/signin" className="mobile-menu__link" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Appearance</span>
                <ThemeToggle showLabel size="sm" />
              </div>
              <button onClick={handleGetStarted} className="btn btn-primary" style={{ marginTop: '12px', width: '100%' }}>
                Open Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Section 1: Hero ─── */}
      <section className="hero">
        <div className="container-wide hero__grid">
          
          {/* Left Region — Direct Intent & Editorial Typography */}
          <div className="hero__content">
            <div className="hero-product-badge">
              <span className="badge-bullet" />
              <span>Jalaprahari &mdash; First-Flush Plastic Risk Intelligence</span>
            </div>

            <h1 className="hero__headline">
              Predict before<br />the plastic moves.
            </h1>

            <p className="hero__description">
              Identify when plastic-runoff risk may rise, discover which drains are most at risk, 
              and help municipal teams intervene before waste moves downstream.
            </p>

            <div className="hero__actions">
              <button onClick={handleGetStarted} className="btn btn-primary btn-lg">
                Explore Risk Intelligence
                <ArrowRight size={18} />
              </button>
              <button onClick={() => scrollToSection('overview')} className="btn btn-secondary btn-lg">
                How It Works
              </button>
            </div>
          </div>

          {/* Right Region — Documentary Environmental Visualization with Compact Illustrative Risk Panel */}
          <div className="hero__visual">
            <div className="hero-visual-frame">
              
              {/* Media Controls Bar */}
              <div className="visual-mode-bar">
                <span className="visual-caption">
                  {heroVisualMode === 'photo' 
                    ? 'Field Reference \u2014 Roadside Stormwater Inlet' 
                    : 'Catchment Topography \u2014 3D Geometric Study'}
                </span>
                <div className="visual-toggles">
                  <button
                    className={`visual-toggle-btn ${heroVisualMode === 'photo' ? 'active' : ''}`}
                    onClick={() => setHeroVisualMode('photo')}
                    aria-label="View field documentary photograph"
                  >
                    <Camera size={12} />
                    <span>Documentary</span>
                  </button>
                  <button
                    className={`visual-toggle-btn ${heroVisualMode === '3d' ? 'active' : ''}`}
                    onClick={() => setHeroVisualMode('3d')}
                    aria-label="View interactive 3D model"
                  >
                    <Box size={12} />
                    <span>3D Scene</span>
                  </button>
                </div>
              </div>

              {/* Primary Visual Container */}
              <div className="visual-media-box">
                {heroVisualMode === 'photo' ? (
                  <div className="documentary-photo-container">
                    <img 
                      src="/assets/urban_storm_inlet_litter.jpg" 
                      alt="Urban street curb and cast-iron stormwater grate with accumulated roadside plastic litter before a rain event" 
                      className="documentary-hero-img"
                    />

                    {/* Architectural Runoff Trace Hairline with Animated Flow and Focal Target */}
                    <svg className="hero-trace-svg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                      {/* Flow Path from roadside litter to drain */}
                      <path 
                        className="hero-animated-trace-path"
                        d="M 60 210 Q 140 230, 210 200" 
                        fill="none" 
                        stroke="#B9654B" 
                        strokeWidth="2" 
                        strokeDasharray="6 3" 
                        strokeOpacity="0.95" 
                      />
                      {/* Drainage inlet visual focal point */}
                      <circle cx="210" cy="200" r="18" className="hero-inlet-pulse" fill="none" stroke="#B9654B" strokeWidth="1" strokeOpacity="0.5" />
                      <circle cx="210" cy="200" r="8" fill="#B9654B" fillOpacity="0.25" stroke="#B9654B" strokeWidth="1.2" />
                      <circle cx="210" cy="200" r="3.5" fill="#B9654B" />
                      {/* Precise reticle crosshair markers */}
                      <line x1="196" y1="200" x2="224" y2="200" stroke="#30372C" strokeWidth="0.8" strokeOpacity="0.75" />
                      <line x1="210" y1="186" x2="210" y2="214" stroke="#30372C" strokeWidth="0.8" strokeOpacity="0.75" />
                      <line x1="210" y1="218" x2="210" y2="265" stroke="#30372C" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.6" />
                    </svg>

                    <div className="photo-tagline">
                      <span className="tagline-dot" />
                      <span>Focal Point: Street Gutter Ingress &bull; Antecedent Surface Accumulation</span>
                    </div>
                  </div>
                ) : (
                  <div className="hero-canvas-container">
                    <Suspense fallback={<HeroFallback />}>
                      <HeroScene />
                    </Suspense>
                  </div>
                )}
              </div>

              {/* Tactile Illustrative Risk Dossier Panel */}
              <div className="hero-drain-overlay">
                <div className="overlay-left-identity">
                  <div className="overlay-meta-line">
                    <span className="overlay-code">OUTLET // DR-004</span>
                    <span className="overlay-sep">&bull;</span>
                    <span className="overlay-status">PRIORITIZED OUTFALL</span>
                  </div>
                  <h3 className="overlay-name">Majestic Bus Station Drain</h3>
                  <div className="overlay-factors-row">
                    <span className="overlay-factor-tag">11d Antecedent Dry</span>
                    <span className="overlay-factor-tag">4.2 km² Catchment</span>
                    <span className="overlay-factor-tag">Demonstration</span>
                  </div>
                </div>

                <div className="overlay-right-metric">
                  <div className="overlay-score-box">
                    <span className="overlay-score-number">81</span>
                    <span className="overlay-score-denom">/100</span>
                  </div>
                  <span className="overlay-risk-tier">VERY HIGH RISK</span>
                  <button 
                    onClick={() => scrollToSection('demo')} 
                    className="overlay-inspect-link"
                  >
                    Inspect in Atlas &rarr;
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Quiet Editorial Scroll Cue */}
        <button 
          className="hero__scroll-cue"
          onClick={() => scrollToSection('overview')}
          aria-label="Scroll to mechanism overview"
        >
          <span>Explore Environmental Dynamics</span>
          <ChevronDown size={15} />
        </button>
      </section>

      {/* ─── Section 2: The Environmental Problem ─── */}
      <EnvironmentalMechanism />

      {/* ─── Section 3: Interactive Catchment Demonstration ─── */}
      <CatchmentMapDemo />

      {/* ─── Section 4: Final Call to Action ─── */}
      <OutcomesAndCta />

      {/* ─── Compact Editorial Footer ─── */}
      <footer className="landing-footer">
        <div className="container-wide landing-footer__inner">
          <div className="landing-footer__top">
            <div className="landing-footer__brand-block">
              <div className="footer-brand-title">
                <span className="brand-mark">JALAPRAHARI</span>
                <span className="brand-sanskrit">जलप्रहरी</span>
              </div>
              <p className="footer-tagline">
                First-flush plastic risk intelligence and preventive outfall management for urban catchments.
              </p>
              <div className="footer-status-pill">
                <span>Research Prototype &bull; Synthetic Catchment Baseline</span>
              </div>
            </div>

            <div className="landing-footer__nav-cols">
              <div className="footer-col">
                <span className="footer-col-header">PLATFORM</span>
                <button onClick={() => scrollToSection('overview')} className="footer-link">The Problem</button>
                <button onClick={() => scrollToSection('demo')} className="footer-link">Catchment Atlas</button>
                <button onClick={() => scrollToSection('impact')} className="footer-link">Preventive Action</button>
              </div>

              <div className="footer-col">
                <span className="footer-col-header">ACCOUNT & ACCESS</span>
                <Link to="/signin" className="footer-link">Municipal Sign In</Link>
                <Link to="/signup" className="footer-link">Request Onboarding</Link>
                <button onClick={handleGetStarted} className="footer-link footer-link--highlight">
                  Launch Platform Dashboard &rarr;
                </button>
              </div>
            </div>
          </div>

          <div className="landing-footer__bottom">
            <div className="footer-bottom-left">
              <span>&copy; 2026 Jalaprahari (जलप्रहरी). All rights reserved.</span>
              <span className="footer-dot">&bull;</span>
              <span>Environmental Decision Intelligence Atlas</span>
            </div>
            <div className="footer-bottom-notice">
              <strong>Demonstration Disclaimer:</strong> Jalaprahari operates with simulated 
              catchment scenarios and heuristic risk weights for research and decision-support prototyping. 
              Risk indices do not represent legally binding municipal predictions.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Hero Fallback ───
function HeroFallback() {
  return (
    <div className="hero-fallback">
      <div className="hero-fallback__content">
        <Droplets size={34} strokeWidth={1.5} color="var(--color-olive)" />
        <span className="fallback-title">CATCHMENT TOPOGRAPHY</span>
        <span className="fallback-subtitle">Loading 3D geometric study...</span>
      </div>
    </div>
  );
}
