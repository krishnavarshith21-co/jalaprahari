import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/shared/ThemeToggle';
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import './AuthPages.css';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!passwordChecks.length) { setError('Password must be at least 8 characters.'); return; }
    
    setLoading(true);
    const result = await signUp(email, password, fullName);
    setLoading(false);
    if (result.error) setError(result.error);
    else setSuccess(true);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-page__left">
          <div className="auth-page__brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Link to="/" className="auth-brand-link">
              <span className="brand-mark">JALAPRAHARI</span>
              <span className="brand-sanskrit">जलप्रहरी</span>
            </Link>
            <ThemeToggle size="sm" />
          </div>
          <div className="auth-page__narrative">
            <h2>Guardian of water.</h2>
            <p>Your account is being set up.</p>
          </div>
        </div>
        <div className="auth-page__right">
          <div className="auth-form-container">
            <h1 className="auth-form__title">Check your email</h1>
            <p className="auth-form__subtitle" style={{ marginBottom: '24px' }}>
              We've sent a confirmation link to <strong>{email}</strong>. 
              Click the link to activate your account, then sign in.
            </p>
            <Link to="/signin" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Go to Sign In
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <div className="auth-page__brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Link to="/" className="auth-brand-link">
            <span className="brand-mark">JALAPRAHARI</span>
            <span className="brand-sanskrit">जलप्रहरी</span>
          </Link>
          <ThemeToggle size="sm" />
        </div>
        <div className="auth-page__narrative">
          <h2>Guardian of water.</h2>
          <p>
            Join the platform designed to predict high-plastic first-flush events 
            and prioritize municipal intervention at the most critical drainage points.
          </p>
          <div className="auth-page__visual">
            <div className="auth-visual-grid">
              {['When', 'Where', 'Why', 'What first'].map((q, i) => (
                <div key={i} className="auth-visual-item">
                  <ShieldCheck size={16} />
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="auth-page__footer-text">Predict. Prioritize. Intercept.</p>
      </div>

      <div className="auth-page__right">
        <div className="auth-form-container">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <ThemeToggle size="sm" />
          </div>
          <h1 className="auth-form__title">Create account</h1>
          <p className="auth-form__subtitle">
            Set up your Jalaprahari platform access.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Create a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="password-checks">
                <span className={passwordChecks.length ? 'check--pass' : ''}>8+ characters</span>
                <span className={passwordChecks.uppercase ? 'check--pass' : ''}>Uppercase letter</span>
                <span className={passwordChecks.number ? 'check--pass' : ''}>Number</span>
              </div>
            </div>

            {error && <div className="auth-form__error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="auth-form__switch">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
