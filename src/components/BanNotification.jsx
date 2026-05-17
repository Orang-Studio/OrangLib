import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config.js';
import './BanNotification.css';

const DISMISSED_KEY = 'oranglib_dismissed_bans';

function getDismissed() {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); }
  catch { return []; }
}
function setDismissed(list) {
  try { localStorage.setItem(DISMISSED_KEY, JSON.stringify(list)); }
  catch {}
}

const BanNotification = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);

  const fetchBanned = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      const r = await fetch(`${API_URL}/users/${user.id}/modpacks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return;
      const packs = await r.json();
      const dismissed = getDismissed();
      const banned = packs
        .filter(p => p.is_banned && !dismissed.includes(p.id))
        .map(p => ({
          id: p.id,
          name: p.name,
          reason: p.banned_reason,
          banned_at: p.banned_at,
        }));
      setNotices(banned);
    } catch {}
  }, [user?.id, token]);

  useEffect(() => { fetchBanned(); }, [fetchBanned]);

  const dismiss = (id) => {
    setDismissed([...getDismissed(), id]);
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  if (!notices.length) return null;

  return (
    <div className="ban-notification-stack">
      {notices.map(n => {
        const BAN_DAYS = 6;
        let daysLeft = null;
        if (n.banned_at) {
          const deleteAt = new Date(n.banned_at).getTime() + BAN_DAYS * 86400000;
          daysLeft = Math.max(0, Math.ceil((deleteAt - Date.now()) / 86400000));
        }
        return (
          <div key={n.id} className="ban-notification" role="alert">
            <svg className="ban-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M4.93 4.93L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>

            <div className="ban-body">
              <span className="ban-title">
                Your modpack <strong>"{n.name}"</strong> was banned for breaking the rules.
              </span>
              {n.reason && (
                <span className="ban-reason"> Reason: {n.reason}</span>
              )}
              {daysLeft !== null && (
                <span className="ban-countdown">
                  {daysLeft > 0
                    ? ` It will be permanently deleted in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
                    : ' It is scheduled for deletion.'}
                </span>
              )}
            </div>

            <button
              className="ban-close"
              onClick={() => dismiss(n.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};
export default BanNotification;