import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import SignalAlertPopup from '../components/SignalAlertPopup';

const SignalAlertContext = createContext(null);

// Soft two-tone "ping" — fails silently if the browser blocks audio
function playPing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* autoplay blocked — fine */ }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// Register the service worker + browser push subscription
async function registerPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;

  const reg = await navigator.serviceWorker.register('/sw.js');

  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const { data } = await axios.get('/api/push/vapid-public-key');
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(data.key),
  });
  await axios.post('/api/push/subscribe', sub.toJSON());
}

export function SignalAlertProvider({ children }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const idRef = useRef(0);

  const pushAlert = useCallback((alert) => {
    const id = ++idRef.current;
    setAlerts(prev => [...prev.slice(-2), { ...alert, _id: id }]); // max 3 on screen
    playPing();
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a._id !== id));
  }, []);

  // Live SSE stream while the app is open
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const es = new EventSource(`/api/signals/stream?token=${encodeURIComponent(token)}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'signal') pushAlert(data);
      } catch { /* heartbeat or malformed */ }
    };
    return () => es.close();
  }, [user, pushAlert]);

  // Browser push registration (for when the app is closed)
  useEffect(() => {
    if (!user) return;
    registerPush().catch(() => { /* permission denied or unsupported */ });
  }, [user]);

  // Dev/demo hook: window.__testSignalAlert() fires a sample popup
  useEffect(() => {
    window.__testSignalAlert = (overrides = {}) => pushAlert({
      signal: {
        asset: 'NVDA', action: 'BUY', entry_price: 850, target_price: 950,
        stop_loss: 820, timeframe: 'Swing',
        rationale: 'Breakout above $850 resistance on massive volume. AI tailwind + earnings catalyst.',
        ...overrides.signal,
      },
      traderName: overrides.traderName || 'Carlos Ventura',
      traderProfileId: overrides.traderProfileId || 4,
    });
    return () => { delete window.__testSignalAlert; };
  }, [pushAlert]);

  return (
    <SignalAlertContext.Provider value={{ pushAlert }}>
      {children}
      {/* Popup stack — top right */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {alerts.map(a => (
          <SignalAlertPopup key={a._id} alert={a} onClose={() => removeAlert(a._id)} />
        ))}
      </div>
    </SignalAlertContext.Provider>
  );
}

export const useSignalAlerts = () => useContext(SignalAlertContext);
