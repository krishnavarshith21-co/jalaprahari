import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.error) setError(result.error);
    else setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <div className="auth-page__brand">
          <Link to="/" className="auth-brand-link">
            <span className="brand-mark">JALAPRAHARI</span>
            <span className="brand-sanskrit">जलप्रहरी</span>
          </Link>
        </div>
        <div className="auth-page__narrative">
          <h2>Guardian of water.</h2>
          <p>Reset your password and regain access to the platform.</p>
        </div>
        <p className="auth-page__footer-text">Predict. Prioritize. Intercept.</p>
      </div>

      <div className="auth-page__right">
        <div className="auth-form-container">
          {sent ? (
            <>
              <h1 className="auth-form__title">Check your email</h1>
              <p className="auth-form__subtitle" style={{ marginBottom: '24px' }}>
                If an account exists for <strong>{email}</strong>, we've sent a password 
                recovery link. Check your inbox and follow the instructions.
              </p>
              <p className="auth-form__subtitle" style={{ marginBottom: '24px', fontSize: '0.813rem' }}>
                Didn't receive the email? Check your spam folder or try again with a different address.
              </p>
              <Link to="/signin" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Return to Sign In
                <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/signin" className="auth-back-link">
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
              <h1 className="auth-form__title">Reset password</h1>
              <p className="auth-form__subtitle">
                Enter the email address associated with your account and we'll 
                send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    className={`form-input ${error ? 'form-input--error' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                {error && <div className="auth-form__error">{error}</div>}

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Recovery Link'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
