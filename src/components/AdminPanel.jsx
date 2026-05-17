import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import API_URL from '../config.js';
import './AdminPanel.css';

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'modpacks', label: 'Modpacks' },
  { id: 'publishing', label: 'Modpack Publishing' },
  { id: 'ips', label: 'IP Bans' },
  { id: 'audit', label: 'Audit Log' },
];

const AdminPanel = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [modpacks, setModpacks] = useState([]);
  const [ipBans, setIpBans] = useState([]);
  const [audit, setAudit] = useState([]);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [dialogValue, setDialogValue] = useState('');
  const [dialogValue2, setDialogValue2] = useState('');
  const [pubMenuId, setPubMenuId] = useState(null);
  const [versionsModal, setVersionsModal] = useState(null);
  const [versionsList, setVersionsList] = useState([]);
  const [editModpack, setEditModpack] = useState(null);
  const [editVersion, setEditVersion] = useState(null);
  const [editVersionForm, setEditVersionForm] = useState({ version_number: '', changelog: '', version_tag: '' });

  const authHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user && !user.is_admin) { navigate('/'); return; }
  }, [user, token, navigate]);

  const flashOk = (m) => { setOk(m); setErr(''); setTimeout(() => setOk(''), 2500); };
  const flashErr = (m) => { setErr(m); setOk(''); };

  const apiJson = async (method, url, body) => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}${url}`, {
        method,
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (r.status === 401) { logout(); navigate('/login'); throw new Error('Session expired'); }
      const j = r.status === 204 ? null : await r.json().catch(() => null);
      if (!r.ok) throw new Error((j && j.detail) || `${method} ${url} failed`);
      return j;
    } finally {
      setLoading(false);
    }
  };


  const loadUsers = useCallback(async (q = '') => {
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      setUsers(await apiJson('GET', `/admin/users?${params}`));
    } catch (e) { flashErr(e.message); }
  }, []);

  const loadModpacks = useCallback(async (q = '') => {
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      setModpacks(await apiJson('GET', `/admin/modpacks?${params}`));
    } catch (e) { flashErr(e.message); }
  }, []);

  const loadIpBans = useCallback(async () => {
    try { setIpBans(await apiJson('GET', '/admin/ip-bans')); }
    catch (e) { flashErr(e.message); }
  }, []);

  const loadAudit = useCallback(async () => {
    try { setAudit(await apiJson('GET', '/admin/audit')); }
    catch (e) { flashErr(e.message); }
  }, []);

  useEffect(() => {
    if (!token || !user?.is_admin) return;
    if (tab === 'users') loadUsers(search);
    else if (tab === 'modpacks') loadModpacks(search);
    else if (tab === 'publishing') loadModpacks(search);
    else if (tab === 'ips') loadIpBans();
    else if (tab === 'audit') loadAudit();
  }, [tab, token, user]);


  const openVersions = async (m) => {
    setPubMenuId(null);
    setVersionsModal(m);
    try {
      const list = await apiJson('GET', `/admin/modpacks/${m.id}/versions`);
      setVersionsList(list || []);
    } catch (e) { flashErr(e.message); }
  };
  const reloadVersions = async () => {
    if (!versionsModal) return;
    try {
      const list = await apiJson('GET', `/admin/modpacks/${versionsModal.id}/versions`);
      setVersionsList(list || []);
    } catch (e) { flashErr(e.message); }
  };
  const approveVersion = async (v, verdict = 'allow') => {
    try {
      await apiJson('POST', `/admin/modpacks/${versionsModal.id}/versions/${v.id}/approve`, { verdict });
      flashOk(`Version marked ${verdict}`);
      await reloadVersions();
    } catch (e) { flashErr(e.message); }
  };
  const deleteVersionAdmin = async (v) => {
    if (!window.confirm(`Delete version ${v.version_number}? File will be removed.`)) return;
    try {
      await apiJson('DELETE', `/admin/modpacks/${versionsModal.id}/versions/${v.id}`);
      flashOk('Version deleted');
      await reloadVersions();
    } catch (e) { flashErr(e.message); }
  };
  const openEditModpack = async (m) => {
    setPubMenuId(null);
    setEditModpack(m);
    try {
      const list = await apiJson('GET', `/admin/modpacks/${m.id}/versions`);
      setVersionsList(list || []);
    } catch (e) { flashErr(e.message); }
  };
  const openEditVersion = (v) => {
    setEditVersion(v);
    setEditVersionForm({
      version_number: v.version_number || '',
      changelog: v.changelog || '',
      version_tag: v.version_tag || '',
    });
  };
  const saveEditVersion = async () => {
    if (!editVersion) return;
    try {
      await apiJson('PATCH', `/admin/modpacks/${editModpack.id}/versions/${editVersion.id}`, editVersionForm);
      flashOk('Version updated');
      setEditVersion(null);

      try {
        const list = await apiJson('GET', `/admin/modpacks/${editModpack.id}/versions`);
        setVersionsList(list || []);
      } catch (_e) {  }
    } catch (e) { flashErr(e.message); }
  };


  const closeDialog = () => { setDialog(null); setDialogValue(''); setDialogValue2(''); };

  const openDialog = (kind, target) => {
    setDialog({ kind, target });
    setDialogValue('');
    setDialogValue2('');
  };

  const submitDialog = async () => {
    if (!dialog) return;
    const { kind, target } = dialog;
    try {
      if (kind === 'ban-user') {
        await apiJson('POST', `/admin/users/${target.id}/ban`, { reason: dialogValue });
        flashOk(`Banned ${target.username}`);
        await loadUsers(search);
      } else if (kind === 'ban-modpack') {
        await apiJson('POST', `/admin/modpacks/${target.id}/ban`, { reason: dialogValue });
        flashOk(`Banned modpack "${target.name}"`);
        await loadModpacks(search);
      } else if (kind === 'reset-password') {
        await apiJson('POST', `/admin/users/${target.id}/password`, { new_password: dialogValue });
        flashOk('Password updated');
      } else if (kind === 'change-email') {
        await apiJson('POST', `/admin/users/${target.id}/email`, { new_email: dialogValue });
        flashOk('Email updated');
        await loadUsers(search);
      } else if (kind === 'ban-ip') {
        await apiJson('POST', '/admin/ip-bans', { ip: dialogValue, reason: dialogValue2 });
        flashOk('IP banned');
        await loadIpBans();
      }
      closeDialog();
    } catch (e) {
      flashErr(e.message);
    }
  };

  const unbanUser = async (u) => {
    if (!window.confirm(`Unban ${u.username}?`)) return;
    try { await apiJson('POST', `/admin/users/${u.id}/unban`); flashOk('Unbanned'); await loadUsers(search); }
    catch (e) { flashErr(e.message); }
  };
  const deleteUser = async (u) => {
    if (!window.confirm(`PERMANENTLY delete ${u.username}? This cannot be undone.`)) return;
    if (!window.confirm(`Are you absolutely sure?`)) return;
    try { await apiJson('DELETE', `/admin/users/${u.id}`); flashOk('Deleted'); await loadUsers(search); }
    catch (e) { flashErr(e.message); }
  };
  const unbanModpack = async (m) => {
    if (!window.confirm(`Unban "${m.name}"?`)) return;
    try { await apiJson('POST', `/admin/modpacks/${m.id}/unban`); flashOk('Unbanned'); await loadModpacks(search); }
    catch (e) { flashErr(e.message); }
  };
  const deleteModpack = async (m) => {
    if (!window.confirm(`PERMANENTLY delete "${m.name}"? Files removed too.`)) return;
    try { await apiJson('DELETE', `/admin/modpacks/${m.id}`); flashOk('Deleted'); await loadModpacks(search); }
    catch (e) { flashErr(e.message); }
  };
  const unbanIp = async (row) => {
    if (!window.confirm(`Unban ${row.ip}?`)) return;
    try { await apiJson('DELETE', `/admin/ip-bans/${encodeURIComponent(row.ip)}`); flashOk('Unbanned IP'); await loadIpBans(); }
    catch (e) { flashErr(e.message); }
  };

  if (!user || !user.is_admin) {
    return (
      <div className="admin-wrap">
        <Sidebar mobileOpen={false} />
        <main className="admin-main"><p style={{ padding: '2rem' }}>Loading…</p></main>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <Sidebar mobileOpen={false} />
      <main className="admin-main">
        <div className="admin-container">
          <div className="admin-header">
            <h1>Administration</h1>
            <p>Signed in as <strong>{user.username}</strong></p>
          </div>

          <div className="admin-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`admin-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => { setTab(t.id); setSearch(''); }}
              >{t.label}</button>
            ))}
          </div>

          {err && <div className="admin-alert err">{err}</div>}
          {ok && <div className="admin-alert ok">{ok}</div>}

          {(tab === 'users' || tab === 'modpacks' || tab === 'publishing') && (
            <div className="admin-search">
              <input
                placeholder={`Search ${tab === 'publishing' ? 'modpacks' : tab}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (tab === 'users' ? loadUsers(search) : loadModpacks(search))}
                maxLength={80}
              />
              <button onClick={() => tab === 'users' ? loadUsers(search) : loadModpacks(search)}>Search</button>
            </div>
          )}

          {tab === 'users' && (
            <div className="admin-table">
              <div className="admin-thead users">
                <span>ID</span><span>Username</span><span>Email</span><span>Status</span><span>Actions</span>
              </div>
              {users.map(u => (
                <div key={u.id} className="admin-row users">
                  <span>#{u.id}</span>
                  <span>{u.username}{u.is_admin && <span className="badge admin">admin</span>}</span>
                  <span className="truncate">{u.email}</span>
                  <span>
                    {u.is_banned ? <span className="badge banned" title={u.banned_reason || ''}>banned</span>
                      : <span className="badge ok">active</span>}
                  </span>
                  <span className="actions">
                    {u.is_banned
                      ? <button onClick={() => unbanUser(u)}>Unban</button>
                      : <button onClick={() => openDialog('ban-user', u)} disabled={u.id === user.id || u.is_admin}>Ban</button>}
                    <button onClick={() => openDialog('reset-password', u)}>Password</button>
                    <button onClick={() => openDialog('change-email', u)}>Email</button>
                    <button className="danger" onClick={() => deleteUser(u)} disabled={u.id === user.id}>Delete</button>
                  </span>
                </div>
              ))}
              {!users.length && <p className="admin-empty">No users.</p>}
            </div>
          )}

          {tab === 'modpacks' && (
            <div className="admin-table">
              <div className="admin-thead mods">
                <span>ID</span><span>Name</span><span>Owner</span><span>Status</span><span>Actions</span>
              </div>
              {modpacks.map(m => (
                <div key={m.id} className="admin-row mods">
                  <span>#{m.id}</span>
                  <span className="truncate">{m.name}</span>
                  <span className="truncate">{m.owner_username || `#${m.owner_id}`}</span>
                  <span>
                    {m.is_banned ? <span className="badge banned">banned</span>
                      : m.is_public ? <span className="badge ok">public</span>
                      : <span className="badge dim">private</span>}
                  </span>
                  <span className="actions">
                    <button onClick={() => navigate(`/modpack/${m.id}`)}>Open</button>
                    {m.is_banned
                      ? <button onClick={() => unbanModpack(m)}>Unban</button>
                      : <button onClick={() => openDialog('ban-modpack', m)}>Ban</button>}
                    <button className="danger" onClick={() => deleteModpack(m)}>Delete</button>
                  </span>
                </div>
              ))}
              {!modpacks.length && <p className="admin-empty">No modpacks.</p>}
            </div>
          )}
          {tab === 'publishing' && (
            <div className="admin-table">
              <div className="admin-thead mods">
                <span>ID</span><span>Name</span><span>Owner</span><span>Status</span><span>Actions</span>
              </div>
              {modpacks.map(m => (
                <div key={m.id} className="admin-row mods">
                  <span>#{m.id}</span>
                  <span className="truncate">{m.name}</span>
                  <span className="truncate">{m.owner_username || `#${m.owner_id}`}</span>
                  <span>
                    {m.is_banned ? <span className="badge banned">banned</span>
                      : m.is_public ? <span className="badge ok">public</span>
                      : <span className="badge dim">private</span>}
                  </span>
                  <span className="actions" style={{ position: 'relative' }}>
                    <button onClick={() => setPubMenuId(pubMenuId === m.id ? null : m.id)} aria-label="Menu">⋮</button>
                    {pubMenuId === m.id && (
                      <div className="admin-popover" onMouseLeave={() => setPubMenuId(null)}>
                        <button onClick={() => openVersions(m)}>Versions</button>
                        <button onClick={() => openEditModpack(m)}>Edit</button>
                        <button className="danger" onClick={() => { setPubMenuId(null); deleteModpack(m); }}>Delete</button>
                      </div>
                    )}
                  </span>
                </div>
              ))}
              {!modpacks.length && <p className="admin-empty">No modpacks.</p>}
            </div>
          )}
          {tab === 'ips' && (
            <div>
              <div className="admin-search">
                <button onClick={() => openDialog('ban-ip', null)}>+ Ban an IP</button>
              </div>
              <div className="admin-table">
                <div className="admin-thead ips">
                  <span>IP</span><span>Reason</span><span>Banned at</span><span>Actions</span>
                </div>
                {ipBans.map(row => (
                  <div key={row.ip} className="admin-row ips">
                    <span>{row.ip}</span>
                    <span className="truncate">{row.reason || '—'}</span>
                    <span>{row.banned_at ? new Date(row.banned_at).toLocaleString() : ''}</span>
                    <span className="actions">
                      <button onClick={() => unbanIp(row)}>Unban</button>
                    </span>
                  </div>
                ))}
                {!ipBans.length && <p className="admin-empty">No banned IPs.</p>}
              </div>
            </div>
          )}
          {tab === 'audit' && (
            <div className="admin-table">
              <div className="admin-thead audit">
                <span>When</span><span>Admin</span><span>Action</span><span>Target</span><span>IP</span><span>Details</span>
              </div>
              {audit.map(a => (
                <div key={a.id} className="admin-row audit">
                  <span>{new Date(a.created_at).toLocaleString()}</span>
                  <span>{a.admin_username || `#${a.admin_id}`}</span>
                  <span>{a.action}</span>
                  <span>{a.target_type ? `${a.target_type}:${a.target_id}` : '—'}</span>
                  <span>{a.ip || '—'}</span>
                  <span className="truncate">{a.details ? JSON.stringify(a.details) : ''}</span>
                </div>
              ))}
              {!audit.length && <p className="admin-empty">No audit entries.</p>}
            </div>
          )}
        </div>
        {dialog && (
          <div className="admin-dialog-backdrop" onClick={closeDialog}>
            <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>
                {dialog.kind === 'ban-user' && `Ban ${dialog.target.username}`}
                {dialog.kind === 'ban-modpack' && `Ban "${dialog.target.name}"`}
                {dialog.kind === 'reset-password' && `Set new password for ${dialog.target.username}`}
                {dialog.kind === 'change-email' && `Set new email for ${dialog.target.username}`}
                {dialog.kind === 'ban-ip' && 'Ban an IP address'}
              </h3>
              {dialog.kind === 'ban-ip' && (
                <>
                  <label>IP address</label>
                  <input
                    autoFocus
                    placeholder="e.g. 1.2.3.4 or 2001:db8::1"
                    value={dialogValue}
                    onChange={(e) => setDialogValue(e.target.value)}
                    maxLength={64}
                  />
                  <label>Reason (optional)</label>
                  <input
                    value={dialogValue2}
                    onChange={(e) => setDialogValue2(e.target.value)}
                    maxLength={500}
                  />
                </>
              )}
              {(dialog.kind === 'ban-user' || dialog.kind === 'ban-modpack') && (
                <>
                  <label>Reason (optional)</label>
                  <input
                    autoFocus
                    value={dialogValue}
                    onChange={(e) => setDialogValue(e.target.value)}
                    maxLength={500}
                  />
                </>
              )}
              {dialog.kind === 'reset-password' && (
                <>
                  <label>New password (min 8 chars)</label>
                  <input
                    autoFocus
                    type="password"
                    value={dialogValue}
                    onChange={(e) => setDialogValue(e.target.value)}
                    maxLength={128}
                  />
                  <p className="admin-muted">User's other sessions will be invalidated.</p>
                </>
              )}
              {dialog.kind === 'change-email' && (
                <>
                  <label>New email</label>
                  <input
                    autoFocus
                    type="email"
                    value={dialogValue}
                    onChange={(e) => setDialogValue(e.target.value)}
                    maxLength={100}
                  />
                </>
              )}
              <div className="admin-dialog-actions">
                <button onClick={closeDialog}>Cancel</button>
                <button className="primary" onClick={submitDialog} disabled={loading}>
                  {loading ? '…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
        {versionsModal && (
          <div className="admin-dialog-backdrop" onClick={() => setVersionsModal(null)}>
            <div className="admin-dialog admin-dialog-wide" onClick={(e) => e.stopPropagation()}>
              <h3>Versions — {versionsModal.name}</h3>
              <div className="admin-table" style={{ marginTop: '0.5rem' }}>
                <div className="admin-thead vers">
                  <span>Version</span><span>Status</span><span>Verdict</span><span>Created</span><span>Actions</span>
                </div>
                {versionsList.map(v => (
                  <div key={v.id} className="admin-row vers">
                    <span>{v.version_number}</span>
                    <span>{v.scan_status || '—'}{v.scan_status === 'scanning' && ` (${v.scan_progress || 0}%)`}</span>
                    <span>
                      {v.scan_verdict === 'allow' && <span className="badge ok">allowed</span>}
                      {v.scan_verdict === 'block' && <span className="badge banned">blocked</span>}
                      {v.scan_verdict === 'review' && <span className="badge dim">review</span>}
                      {!v.scan_verdict && <span className="badge dim">pending</span>}
                    </span>
                    <span>{v.created_at ? new Date(v.created_at).toLocaleString() : ''}</span>
                    <span className="actions">
                      <button onClick={() => approveVersion(v, 'allow')}>Approve</button>
                      <button onClick={() => approveVersion(v, 'block')}>Block</button>
                      <button className="danger" onClick={() => deleteVersionAdmin(v)}>Delete</button>
                    </span>
                  </div>
                ))}
                {!versionsList.length && <p className="admin-empty">No versions.</p>}
              </div>
              <div className="admin-dialog-actions">
                <button onClick={() => setVersionsModal(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
        {editModpack && (
          <div className="admin-dialog-backdrop" onClick={() => { setEditModpack(null); setEditVersion(null); }}>
            <div className="admin-dialog admin-dialog-wide" onClick={(e) => e.stopPropagation()}>
              <h3>Edit "{editModpack.name}" — versions</h3>
              <div className="admin-table" style={{ marginTop: '0.5rem' }}>
                <div className="admin-thead vers">
                  <span>Version</span><span>Tag</span><span>Verdict</span><span>Created</span><span>Actions</span>
                </div>
                {versionsList.map(v => (
                  <div key={v.id} className="admin-row vers">
                    <span>{v.version_number}</span>
                    <span>{v.version_tag || '—'}</span>
                    <span>{v.scan_verdict || 'pending'}</span>
                    <span>{v.created_at ? new Date(v.created_at).toLocaleString() : ''}</span>
                    <span className="actions" style={{ position: 'relative' }}>
                      <button onClick={() => openEditVersion(v)}>Edit</button>
                      <button className="danger" onClick={() => deleteVersionAdmin(v)}>Delete</button>
                    </span>
                  </div>
                ))}
                {!versionsList.length && <p className="admin-empty">No versions.</p>}
              </div>
              <div className="admin-dialog-actions">
                <button onClick={() => setEditModpack(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {editVersion && (
          <div className="admin-dialog-backdrop" onClick={() => setEditVersion(null)}>
            <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Edit version {editVersion.version_number}</h3>
              <label>Version number</label>
              <input
                value={editVersionForm.version_number}
                onChange={(e) => setEditVersionForm(f => ({ ...f, version_number: e.target.value }))}
                maxLength={40}
              />
              <label>Tag</label>
              <select
                value={editVersionForm.version_tag || ''}
                onChange={(e) => setEditVersionForm(f => ({ ...f, version_tag: e.target.value }))}
              >
                <option value="">(none)</option>
                <option value="release">release</option>
                <option value="stable">stable</option>
                <option value="beta">beta</option>
              </select>
              <label>Changelog</label>
              <textarea
                rows={6}
                value={editVersionForm.changelog}
                onChange={(e) => setEditVersionForm(f => ({ ...f, changelog: e.target.value }))}
              />
              <div className="admin-dialog-actions">
                <button onClick={() => setEditVersion(null)}>Cancel</button>
                <button className="primary" onClick={saveEditVersion} disabled={loading}>
                  {loading ? '…' : 'Save'}
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
export default AdminPanel;