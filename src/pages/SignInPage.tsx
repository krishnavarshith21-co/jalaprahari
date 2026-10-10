import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/shared/ThemeToggle';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import './AuthPages.css';

export default function SignInPage() {
  const navigate = useNavigate();
  const { signIn, demoSignIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
    else navigate('/dashboard');
  };

  const handleDemoSignIn = () => {
    demoSignIn();
    navigate('/dashboard');
  };

  return (
    <div className="auth-canvas">
      
      {/* Top Atlas Brand Bar */}
      <header className="auth-canvas-header">
        <div className="container-wide auth-canvas-header__inner">
          <Link to="/" className="auth-brand-anchor">
            <span className="brand-mark">JALAPRAHARI</span>
            <span className="brand-sanskrit">जलप्रहरी</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle size="sm" />
            <Link to="/" className="auth-return-link">
              <ArrowLeft size={14} />
              <span>Return to Atlas Overview</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Wide Editorial Authentication Arena */}
      <main className="auth-canvas-main">
        <div className="container-wide auth-layout-grid">
          
          {/* Left Column: Brand Statement & Documentary Drainage Inset */}
          <div className="auth-editorial-column">
            <span className="auth-eyebrow">Municipal Access &bull; Decision Suite</span>
            <h1 className="auth-headline">
              Predict before the plastic moves.
            </h1>
            <p className="auth-editorial-lead">
              Authorized access to the Jalaprahari decision intelligence platform. 
              Identify first-flush mobilization windows, evaluate drainage vulnerability, 
              and coordinate preventive intervention before rainfall reaches receiving waters.
            </p>

            {/* Carefully Cropped Documentary Drainage Inset with Runoff Trace */}
            <div className="auth-photo-inset">
              <div className="inset-frame">
                <img 
                  src="/assets/urban_storm_inlet_litter.jpg" 
                  alt="Documentary reference: urban drainage inlet with roadside plastic accumulation" 
                  className="inset-img"
                />
                <div className="inset-caption">
                  <span className="caption-dot" />
                  <span>Field Reference: Antecedent Litter Accumulation at Gutter Ingress</span>
                </div>
              </div>
            </div>

            <div className="auth-scope-note">
              <span>Operational Research Platform &bull; Synthetic Catchment Baseline</span>
            </div>
          </div>

          {/* Right Column: Accessible, Refined Authentication Form */}
          <div className="auth-form-column">
            <div className="auth-form-sheet">
              <div className="form-sheet-header">
                <h2 className="form-sheet-title">Municipal Sign In</h2>
                <p className="form-sheet-subtitle">
                  Enter authorized credentials to access catchment risk intelligence.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="form-group">
                  <label htmlFor="auth-email" className="form-label">Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    className={`form-input ${error ? 'form-input--error' : ''}`}
                    placeholder="officer@watershed.gov.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="auth-password" className="form-label">Password</label>
                    <Link to="/forgot-password" className="form-forgot-link">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="auth-input-wrapper">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${error ? 'form-input--error' : ''}`}
                      placeholder="Enter account password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && <div className="auth-form-error" role="alert">{error}</div>}

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg" 
                  style={{ width: '100%', justifyContent: 'center' }} 
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Platform'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              {/* Clear Demonstration Access Section */}
              <div className="auth-demo-divider">
                <span className="divider-line" />
                <span className="divider-text">or evaluate platform</span>
                <span className="divider-line" />
              </div>

              <div className="auth-demo-section">
                <div className="demo-header-row">
                  <span className="demo-tag">Evaluation Mode</span>
                  <span className="demo-scope">Synthetic Demonstration Catchment</span>
                </div>
                <p className="demo-explanation">
                  Inspect all intelligence modules and risk calculations using pre-loaded synthetic scenarios. 
                  Demonstration sessions do not modify municipal monitoring records.
                </p>
                <button 
                  onClick={handleDemoSignIn}
                  className="btn btn-secondary btn-md"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Enter Synthetic Demonstration Session
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="form-sheet-footer">
                <span>Need municipal onboarding?</span>
                <Link to="/signup" className="footer-signup-link">Request demonstration access</Link>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
