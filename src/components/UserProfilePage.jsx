import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import ModerationPanel from './ModerationPanel.jsx';
import './UserProfilePage.css';
import API_URL from '../config.js';

const formatUA = (ua) => {
  if (!ua) return 'Unknown device';
  const s = ua.toLowerCase();
  let os = 'Unknown';
  if (s.includes('windows')) os = 'Windows';
  else if (s.includes('mac os')) os = 'macOS';
  else if (s.includes('android')) os = 'Android';
  else if (s.includes('iphone') || s.includes('ipad')) os = 'iOS';
  else if (s.includes('linux')) os = 'Linux';
  let browser = 'Unknown browser';
  if (s.includes('edg/')) browser = 'Edge';
  else if (s.includes('chrome')) browser = 'Chrome';
  else if (s.includes('firefox')) browser = 'Firefox';
  else if (s.includes('safari')) browser = 'Safari';
  return `${browser} on ${os}`;
};
const UserProfilePage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('general');
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [projects, setProjects] = useState([]);
  const [devices, setDevices] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [emailData, setEmailData] = useState({ old: '', new: '', code: '', step: 1 });
  const authHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
  }), [token]);
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setProfileData(user);
  }, [user, navigate]);
  useEffect(() => {
    if (!user?.id || !token) return;
    if (activeSection === 'projects') fetchProjects();
    if (activeSection === 'manage') fetchDevices();
  }, [activeSection, user, token]);
  const flashErr = (m) => { setError(m); setSuccess(''); };
  const flashOk = (m) => { setSuccess(m); setError(''); setTimeout(() => setSuccess(''), 3000); };
  const fetchProjects = async () => {
    try {
      const r = await fetch(`${API_URL}/users/${user.id}/modpacks`, { headers: authHeaders() });
      if (r.ok) setProjects(await r.json());
    } catch (e) { console.error(e); }
  };

  const fetchDevices = async () => {
    try {
      const r = await fetch(`${API_URL}/users/${user.id}/sessions`, { headers: authHeaders() });
      if (r.ok) setDevices(await r.json());
    } catch (e) { console.error(e); }
  };
  const handleProfileUpdate = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          username: profileData.username,
          discord_username: profileData.discord_username
        })
      });
      if (!response.ok) {
        const j = await response.json().catch(() => ({}));
        throw new Error(j.detail || 'Failed to update profile');
      }
      flashOk('Profile updated successfully!');
    } catch (err) { flashErr(err.message); }
    finally { setLoading(false); }
  };
  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) { flashErr('New passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ current_password: passwords.old, new_password: passwords.new })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to change password');
      }
      flashOk('Password changed successfully!');
      setPasswords({ old: '', new: '', confirm: '' });
      setShowPasswordModal(false);
    } catch (err) { flashErr(err.message); }
    finally { setLoading(false); }
  };

  const handleEmailRequest = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_URL}/users/change-email/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ old_email: emailData.old, new_email: emailData.new }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.detail || 'Failed to send code');
      }
      setEmailData(d => ({ ...d, step: 2 }));
      flashOk('Verification code sent to your current email');
    } catch (e) { flashErr(e.message); }
    finally { setLoading(false); }
  };

  const handleEmailConfirm = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_URL}/users/change-email/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ code: emailData.code }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.detail || 'Invalid code');
      }
      flashOk('Email updated. You will be signed out — please log in again.');
      setShowEmailModal(false);
      setEmailData({ old: '', new: '', code: '', step: 1 });
      setTimeout(() => { logout(); navigate('/login'); }, 1200);
    } catch (e) { flashErr(e.message); }
    finally { setLoading(false); }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('This will logout all devices. Continue?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${user.id}/logout-all`, {
        method: 'POST', headers: authHeaders(),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to logout all devices');
      }
      flashOk('Logged out from all devices');
      setTimeout(() => { logout(); navigate('/login'); }, 800);
    } catch (err) { flashErr(err.message); }
    finally { setLoading(false); }
  };

  const handleLogoutDevice = async (sessionId, isCurrent) => {
    if (!window.confirm(isCurrent ? 'Sign out of this device?' : 'Sign out of this device?')) return;
    try {
      const r = await fetch(`${API_URL}/users/${user.id}/sessions/${sessionId}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.detail || 'Failed to revoke session');
      }
      if (isCurrent) { logout(); navigate('/login'); return; }
      flashOk('Device signed out');
      fetchDevices();
    } catch (e) { flashErr(e.message); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone!')) return;
    if (!window.confirm('Really delete your account? All your modpacks will be removed too.')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to delete account');
      }
      flashOk('Account deleted');
      setTimeout(() => { logout(); navigate('/'); }, 800);
    } catch (err) { flashErr(err.message); }
    finally { setLoading(false); }
  };

  const handleDeleteAllProjects = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/users/${user.id}/modpacks`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.detail || 'Failed to delete projects');
      }
      const j = await r.json();
      flashOk(`Deleted ${j.deleted || 0} project(s)`);
      setShowDeleteAllModal(false);
      setProjects([]);
    } catch (err) { flashErr(err.message); }
    finally { setLoading(false); }
  };

  if (!user) return <div>Redirecting...</div>;

  return (
    <div className="user-profile-wrapper">
      <Sidebar mobileOpen={false} />
      <main className="user-profile-main">
        <div className="user-profile-container">
          <div className="profile-header">
            <h1>Account Settings</h1>
            <p>Manage your profile, projects, and security settings</p>
          </div>

          <div className="profile-content">
            <div className="profile-sidebar">
              <div className="profile-nav">
                <button className={`nav-item ${activeSection === 'general' ? 'active' : ''}`} onClick={() => setActiveSection('general')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M20 21v-2c0-3.3-1.3-5-8-5s-8 1.7-8 5v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  General
                </button>
                <button className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`} onClick={() => setActiveSection('projects')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9L12 3L21 9V21H3V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Projects
                </button>
                <button className={`nav-item ${activeSection === 'manage' ? 'active' : ''}`} onClick={() => setActiveSection('manage')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Management
                </button>
                <button className={`nav-item ${activeSection === 'security' ? 'active' : ''}`} onClick={() => setActiveSection('security')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 6V12C4 19 12 22 12 22S20 19 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Security
                </button>
                {(user.role === 'owner' || user.role === 'moderator') && (
                  <button className={`nav-item ${activeSection === 'moderation' ? 'active' : ''}`} onClick={() => setActiveSection('moderation')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 8V15C2 20.5 12 22 12 22S22 20.5 22 15V8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Moderation
                  </button>
                )}
              </div>
            </div>

            <div className="profile-main">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {activeSection === 'general' && (
                <div className="section">
                  <h2>General Information</h2>
                  <div className="form-group">
                    <label>Username</label>
                    <input type="text" value={profileData.username || ''} onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} placeholder="Your username"/>
                  </div>
                  <div className="form-group">
                    <label>Discord Username (optional)</label>
                    <input type="text" value={profileData.discord_username || ''} onChange={(e) => setProfileData({ ...profileData, discord_username: e.target.value })} placeholder="Your Discord username"/>
                  </div>
                  <button className="btn btn-primary" onClick={handleProfileUpdate} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {activeSection === 'projects' && (
                <div className="section">
                  <h2>My Projects</h2>
                  <div className="projects-list">
                    {projects.length > 0 ? (
                      projects.map(project => (
                        <div key={project.id} className="project-card">
                          <div className="project-info">
                            <h3>
                              {project.name}
                              {project.is_banned && <span className="badge banned" style={{ marginLeft: 8 }}>banned</span>}
                            </h3>
                            <p className="project-desc">{project.description}</p>
                          </div>
                          <div className="project-actions">
                            <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/modpack/${project.id}`)}>
                              View
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No projects yet. <a href="/upload">Create one now!</a></p>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'manage' && (
                <div className="section">
                  <h2>Management</h2>

                  <div className="management-card">
                    <h3>Delete Account</h3>
                    <p>Permanently delete your account and all its data. This action cannot be undone.</p>
                    <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={loading}>
                      Delete Account
                    </button>
                  </div>

                  <div className="management-card">
                    <h3>Delete All Projects</h3>
                    <p>Permanently delete all your modpacks. This action cannot be undone.</p>
                    <button className="btn btn-danger" disabled={loading} onClick={() => setShowDeleteAllModal(true)}>
                      Delete All Projects
                    </button>
                  </div>

                  <div className="management-card">
                    <h3>Logged In Devices</h3>
                    <p>See all devices where you're logged in and logout from any device.</p>
                    <div className="devices-list">
                      {devices.length === 0 && <p className="muted">No active sessions found.</p>}
                      {devices.map(d => (
                        <div key={d.id} className="device-item">
                          <div>
                            <strong>{formatUA(d.user_agent)}</strong>
                            {d.is_current && <span className="badge ok" style={{ marginLeft: 8 }}>this device</span>}
                            <div className="muted small">
                              IP {d.ip || 'unknown'} · last seen {new Date(d.last_seen).toLocaleString()}
                            </div>
                          </div>
                          <button className="btn btn-sm btn-danger" onClick={() => handleLogoutDevice(d.id, d.is_current)}>
                            Logout
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="section">
                  <h2>Security</h2>

                  <div className="security-card">
                    <h3>Change Password</h3>
                    <p>Update your password to keep your account secure.</p>
                    <button className="btn btn-primary" onClick={() => setShowPasswordModal(true)}>
                      Change Password
                    </button>
                  </div>

                  <div className="security-card">
                    <h3>Change Email</h3>
                    <p>Update your email address. We'll send a verification code to your current email to confirm.</p>
                    <button className="btn btn-primary" onClick={() => { setEmailData({ old: '', new: '', code: '', step: 1 }); setShowEmailModal(true); }}>
                      Change Email
                    </button>
                  </div>

                  <div className="security-card">
                    <h3>Logout All Devices</h3>
                    <p>Sign out from all devices except this one. Your sessions will be ended immediately.</p>
                    <button className="btn btn-secondary" onClick={handleLogoutAllDevices} disabled={loading}>
                      {loading ? 'Logging out...' : 'Logout All Devices'}
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'moderation' && (user?.role === 'owner' || user?.role === 'moderator') && (
                <ModerationPanel user={user} token={token} />
              )}
            </div>
          </div>
        </div>

        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Change Password</h3>
              <div className="form-group">
                <label>Old Password</label>
                <input type="password" value={passwords.old} onChange={(e) => setPasswords({ ...passwords, old: e.target.value })} placeholder="Enter current password"/>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} placeholder="Enter new password"/>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Confirm new password"/>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handlePasswordChange} disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showEmailModal && (
          <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Change Email</h3>
              {emailData.step === 1 ? (
                <>
                  <p className="muted">We'll send a verification code to your current email address.</p>
                  <div className="form-group">
                    <label>Current Email</label>
                    <input type="email" value={emailData.old} onChange={(e) => setEmailData({ ...emailData, old: e.target.value })} placeholder="Your current email"/>
                  </div>
                  <div className="form-group">
                    <label>New Email</label>
                    <input type="email" value={emailData.new} onChange={(e) => setEmailData({ ...emailData, new: e.target.value })} placeholder="New email address"/>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowEmailModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleEmailRequest} disabled={loading || !emailData.old || !emailData.new}>
                      {loading ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="muted">Enter the 6-digit code sent to <strong>{emailData.old}</strong>.</p>
                  <div className="form-group">
                    <label>Verification Code</label>
                    <input type="text" value={emailData.code} onChange={(e) => setEmailData({ ...emailData, code: e.target.value })} placeholder="6-digit code" maxLength={12}/>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setEmailData(d => ({ ...d, step: 1, code: '' }))}>Back</button>
                    <button className="btn btn-primary" onClick={handleEmailConfirm} disabled={loading || !emailData.code}>
                      {loading ? 'Confirming...' : 'Confirm Change'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {showDeleteAllModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteAllModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Delete All Projects</h3>
              <p>This will permanently delete <strong>all of your modpacks</strong> and their files. This cannot be undone.</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowDeleteAllModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteAllProjects} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete All Projects'}
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
};
export default UserProfilePage;