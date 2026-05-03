import { useState } from 'react';
import { useAuth } from '../store';
import '../pages/Onboarding.css';
import './Login.css';

export default function Login() {
  const { signInWithGoogle, authError } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      // error is in authError
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="onboard onboard--splash login-splash">
      <img src="/goku.png" alt="" className="splash__goku" />

      {/* Scouter HUD overlay */}
      <div className="scouter-hud">
        <div className="scouter-hud__bracket scouter-hud__bracket--tl" />
        <div className="scouter-hud__bracket scouter-hud__bracket--tr" />
        <div className="scouter-hud__bracket scouter-hud__bracket--bl" />
        <div className="scouter-hud__bracket scouter-hud__bracket--br" />
        <div className="scouter-hud__scanline" />
        <div className="scouter-hud__data scouter-hud__data--left">
          <span>PWR.LVL</span>
          <span>▸ 1,000</span>
          <span>STATUS: READY</span>
        </div>
        <div className="scouter-hud__data scouter-hud__data--right">
          <span>BLK: 01</span>
          <span>WK: 01</span>
          <span>▸ SCANNING</span>
        </div>
        <div className="scouter-hud__bottom">
          <div className="scouter-hud__bar-group">
            <span>STR</span>
            <div className="scouter-hud__minibar"><div style={{ width: '60%' }} /></div>
          </div>
          <div className="scouter-hud__bar-group">
            <span>SPD</span>
            <div className="scouter-hud__minibar"><div style={{ width: '45%' }} /></div>
          </div>
          <div className="scouter-hud__bar-group">
            <span>END</span>
            <div className="scouter-hud__minibar"><div style={{ width: '55%' }} /></div>
          </div>
        </div>
        <div className="scouter-hud__coords">
          <span>X:28.61</span>
          <span>Y:77.20</span>
        </div>
      </div>

      {/* Main content */}
      <div className="splash__content animate-in">
        <div className="splash__icon">⚡</div>
        <div className="splash__title-wrap">
          <div className="splash__title-burst" />
          <h1 className="splash__title">SAIYAN PROTOCOL</h1>
          <div className="splash__title-sub">サイヤ人プロトコル</div>
        </div>
        <p className="splash__sub">Hybrid Athlete Training System</p>
        <div className="splash__divider">
          <span /><span>⚡</span><span />
        </div>

        <button
          type="button"
          className="login-splash__btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="login-splash__google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {authError && (
          <div className="login-splash__error pixel-text">{authError}</div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="splash__reticle splash__reticle--1" />
      <div className="splash__reticle splash__reticle--2" />
      <div className="splash__scanlines" />
    </div>
  );
}
