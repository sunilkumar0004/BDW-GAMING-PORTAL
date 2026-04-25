'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './AuthModal.module.css';
import { useAuth, User } from '@/context/AuthContext';
import { signIn } from 'next-auth/react';

// --- SVG Icons ---
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
    <path d="M23.95 4.57a10 10 0 01-2.82.77 4.96 4.96 0 002.16-2.72c-.95.55-2 .95-3.12 1.17a4.92 4.92 0 00-8.39 4.49A14 14 0 011.67 3.15 4.92 4.92 0 003.2 9.72a4.9 4.9 0 01-2.23-.62v.06a4.93 4.93 0 003.95 4.83 4.86 4.86 0 01-2.22.08 4.93 4.93 0 004.6 3.42A9.9 9.9 0 010 19.54a13.94 13.94 0 007.55 2.21c9.06 0 14-7.5 14-14v-.64a10.02 10.02 0 002.46-2.55z"/>
  </svg>
);

const GuestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

type AuthStep = 'LOGIN' | 'OTP' | 'SUCCESS';
type AuthMode = 'SIGN_IN' | 'SIGN_UP';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  
  const [step, setStep] = useState<AuthStep>('LOGIN');
  const [mode, setMode] = useState<AuthMode>('SIGN_IN');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
      setStep('LOGIN');
      setMode('SIGN_IN');
      setName('');
      setEmail('');
      setPassword('');
      setSelectedProvider('');
      setOtp(Array(6).fill(''));
      setError('');
      setVerifiedUser(null);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isAuthModalOpen]);

  const handleGuestLogin = () => {
    const mockUser = {
      id: `guest_${Date.now()}`,
      name: `Guest User`,
      email: '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest${Date.now()}`
    };
    login(mockUser);
    closeAuthModal();
  };

  const handleSocialClick = async (provider: string) => {
    try {
      const pLower = provider.toLowerCase();
      setIsLoading(true);
      setError('');
      await signIn(pLower);
    } catch (err) {
      console.error(err);
      setError(`Failed to initiate ${provider} sign in.`);
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    
    if (mode === 'SIGN_UP' && !name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, email, password, name })
      });
      
      const data = await res.json();

      if (res.ok && data.user) {
        setVerifiedUser(data.user);
        setStep('SUCCESS');
      } else {
        setError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifySocialOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) return;

    setIsLoading(true);
    setError('');

    try {
      // Reusing the simulated verify OTP we built earlier
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: selectedProvider, code })
      });
      
      const data = await res.json();

      if (res.ok && data.user) {
        const finalUser = {
           ...data.user, 
           name: `${selectedProvider} User`,
           email: `${selectedProvider.toLowerCase()}@acc.com`,
           avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedProvider}${Date.now()}`
        };

        setVerifiedUser(finalUser);
        setStep('SUCCESS');
      } else {
        setError(data.error || 'Invalid Validation Code! Need 123456');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteLogin = () => {
    if (verifiedUser) {
      login(verifiedUser);
      closeAuthModal();
    }
  };

  useEffect(() => {
    if (step === 'OTP' && otp.join('').length === 6) {
      handleVerifySocialOtp();
    }
  }, [otp, step]);

  if (!isAuthModalOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={closeAuthModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeAuthModal}>
          <span className="material-icons">close</span>
        </button>

        {step === 'LOGIN' && (
          <>
            <div className={styles.header}>
              <h2>{mode === 'SIGN_IN' ? 'Sign in to BDW' : 'Create an Account'}</h2>
              <p>{mode === 'SIGN_IN' ? 'Welcome back! Please enter your details.' : 'Join the ultimate gaming portal.'}</p>
            </div>

            <div className={styles.tabs}>
              <button 
                className={`${styles.tabBtn} ${mode === 'SIGN_IN' ? styles.activeTab : ''}`}
                onClick={() => setMode('SIGN_IN')}
              >
                Sign In
              </button>
              <button 
                className={`${styles.tabBtn} ${mode === 'SIGN_UP' ? styles.activeTab : ''}`}
                onClick={() => setMode('SIGN_UP')}
              >
                Sign Up
              </button>
            </div>

            <form className={styles.form} onSubmit={handleCredentialsSubmit}>
              {mode === 'SIGN_UP' && (
                <div className={styles.inputGroup}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="user@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}
              
              <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                {isLoading ? 'Processing...' : (mode === 'SIGN_IN' ? 'Log in' : 'Create account')}
              </button>
            </form>

            <div className={styles.divider}>Or continue with</div>

            <div className={styles.socialButtonsInline}>
              <button className={styles.socialBtnSmall} onClick={() => handleSocialClick('Google')} title="Google">
                <GoogleIcon />
              </button>
              <button className={styles.socialBtnSmall} onClick={() => handleSocialClick('Facebook')} title="Facebook">
                <FacebookIcon />
              </button>
              <button className={styles.socialBtnSmall} onClick={() => handleSocialClick('Twitter')} title="Twitter">
                <TwitterIcon />
              </button>
              <button className={styles.socialBtnSmall} onClick={() => handleGuestLogin()} title="Continue as Guest">
                <GuestIcon />
              </button>
            </div>
          </>
        )}

        {step === 'OTP' && (
          <>
            <div className={styles.header}>
              <h2>Verify {selectedProvider}</h2>
              <p>Simulating 3rd party authentication via OTP overlay for {selectedProvider}.</p>
            </div>

            <div className={styles.otpContainer}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="password"
                  maxLength={1}
                  className={styles.otpCell}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button 
              className={styles.primaryBtn} 
              style={{ width: '100%' }}
              onClick={handleVerifySocialOtp}
              disabled={isLoading || otp.join('').length < 6}
            >
              {isLoading ? 'Verifying...' : 'Authorize App'}
            </button>

            <button className={styles.backBtn} onClick={() => setStep('LOGIN')}>
              Cancel Auth
            </button>
          </>
        )}

        {step === 'SUCCESS' && (
          <div className={styles.successState}>
            <div className={styles.successIconWrapper}>
              <span className={`material-icons ${styles.successIcon}`}>check_circle</span>
            </div>
            <h2>Success!</h2>
            <p>You have successfully logged in as <strong>{verifiedUser?.name}</strong>.</p>
            
            <button className={styles.primaryBtn} onClick={handleCompleteLogin} style={{ width: '100%', marginTop: '24px' }}>
              Let's Play
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
