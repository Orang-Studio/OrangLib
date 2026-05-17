import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import API_URL from '../config.js';
import './LoginPage.css';
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LetgFwsAAAAAEDwOzzFzLmaWtQwGAyz96gGEOWj';
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showTips, setShowTips] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  useEffect(() => {
    if (window.grecaptcha && window.grecaptcha.execute) {
      setRecaptchaLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setRecaptchaLoaded(true);
    };

    document.body.appendChild(script);

    return () => {};
  }, []);

  const executeRecaptcha = async () => {
    if (recaptchaLoaded && window.grecaptcha) {
      try {
        console.log('Executing reCAPTCHA with key:', RECAPTCHA_SITE_KEY);
        const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'login' });
        console.log('reCAPTCHA token generated:', token ? 'YES' : 'NO');
        return token;
      } catch (error) {
        console.error('reCAPTCHA execution failed:', error);
        return null;
      }
    } else {
      console.error('reCAPTCHA not loaded:', { recaptchaLoaded, grecaptcha: !!window.grecaptcha });
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = await executeRecaptcha();
    if (!token) {
      setError('reCAPTCHA verification failed. Please try again.');
      setLoading(false);
      return;
    }

    try {
      await login(username, password, token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-header">
            <div className="login-logo">
              <img src="/icons/orange.png" alt="OrangLib" className="logo-icon" />
              <h1>OrangLib</h1>
            </div>
            <p className="login-subtitle">Modpack Hub</p>
          </div>

          <h2 className="login-title">Welcome Back</h2>
          {successMessage && <div className="success-message">{successMessage}</div>}
          {error && <div className="error-message"><span className="error-icon"></span> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">
                <span>Username or Email</span>
                <button type="button" className="tip-btn" onClick={() => setShowTips(!showTips)} title="Show tips">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="bold">?</text>
                  </svg>
                </button>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter your username or email"
                required
              />
              {showTips && (
                <div className="input-tip">
                  Tip: Use the username or email you registered with
                </div>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="password">
                <span>Password</span>
                <button type="button" className="tip-btn" onClick={() => setShowTips(!showTips)} title="Show tips">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="bold">?</text>
                  </svg>
                </button>
              </label>
              <div className="input-with-toggle">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" className="password-toggle" aria-pressed={showPassword} onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12c1.73-2.61 4.11-4.57 6.67-5.83"></path>
                      <path d="M1 1l22 22"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {showTips && (
                <div className="input-tip">
                  Tip: Keep your password secure and never share it. Use a strong, unique password. Write it down!
                </div>
              )}
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              <span>{loading ? 'Logging in...' : 'Login'}</span>
              {loading && <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/></svg>}
            </button>
          </form>

          <div className="login-links">
            <Link to="/forgot-password" className="link-btn">Forgot Password?</Link>
          </div>

          <div className="login-divider">or</div>

          <div className="login-register">
            <p>Don't have an account?</p>
            <Link to="/register" className="register-btn">Register Now</Link>
          </div>
        </div>
        
        <div className="login-info-panel">
          <div className="info-card">
            <h3>Quick Start</h3>
            <p>Login to your OrangLib account to access your modpacks, upload new versions, and manage your projects.</p>
          </div>
          <div className="info-card">
            <h3>Need Help?</h3>
            <p>Check our <Link to="/docs">documentation</Link> or <Link to="/privacy">contact us</Link> if you have any questions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;