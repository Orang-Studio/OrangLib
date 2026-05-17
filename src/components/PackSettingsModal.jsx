import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import API_URL from '../config.js';
import CreateVersionModal from './CreateVersionModal.jsx';
import DeleteConfirmModal from './DeleteConfirmModal.jsx';
import './PackSettingsModal.css';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'versions', label: 'Versions' },
  { id: 'photos', label: 'Photos' },
  { id: 'manage', label: 'Manage' },
];
const MD_TOOLS = [
  { label: 'H1', wrap: ['# ', ''] },
  { label: 'H2', wrap: ['## ', ''] },
  { label: 'H3', wrap: ['### ', ''] },
  { label: 'B', wrap: ['**', '**'] },
  { label: 'I', wrap: ['*', '*'] },
  { label: 'S', wrap: ['~~', '~~'] },
  { label: '<>', wrap: ['`', '`'] },
  { label: '🔗', wrap: ['[', '](url)'] },
];
const PackSettingsModal = ({ isOpen, modpack, onClose, onUpdated, onDeleted, token }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [data, setData] = useState({});
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [previewMd, setPreviewMd] = useState(false);
  const descRef = useRef(null);
  const [versions, setVersions] = useState([]);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState(null);
  const [versionMenuId, setVersionMenuId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoErr, setPhotoErr] = useState('');
  const [transferUser, setTransferUser] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const authHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (modpack) {
      setData({
        name: modpack.name || '',
        description: modpack.description || '',
        environment: modpack.environment || '',
        visibility: modpack.visibility || (modpack.is_public ? 'public' : 'private'),
        unlisted_token: modpack.unlisted_token || null,
        game_version: modpack.game_version || '',
      });
      setIconPreview(modpack.icon_url ? `${API_URL}${modpack.icon_url}?t=${new Date(modpack.updated_at || Date.now()).getTime()}` : null);
      setVersions(modpack.versions || []);
    }
  }, [modpack]);

  useEffect(() => {
    if (isOpen && modpack) {
      loadPhotos();
    }
  }, [isOpen, modpack?.id]);

  const loadPhotos = async () => {
    try {
      const r = await fetch(`${API_URL}/modpacks/${modpack.id}/photos`, { headers: authHeaders() });
      if (r.ok) setPhotos(await r.json());
    } catch (e) {  }
  };

  const refreshModpack = async () => {
    try {
      const r = await fetch(`${API_URL}/modpacks/${modpack.id}`, { headers: authHeaders() });
      if (r.ok) {
        const m = await r.json();
        onUpdated && onUpdated(m);
        setVersions(m.versions || []);
        setData(d => ({ ...d, unlisted_token: m.unlisted_token || null }));
      }
    } catch (e) {  }
  };

  if (!isOpen || !modpack) return null;

  const handleIconChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(png|jpe?g|webp|gif)$/i.test(f.name)) {
      setErr('Icon must be PNG, JPG, WEBP, or GIF');
      return;
    }
    setIconFile(f);
    setIconPreview(URL.createObjectURL(f));
  };

  const saveGeneral = async () => {
    setSaving(true); setErr('');
    try {
      if (iconFile) {
        const fd = new FormData();
        fd.append('file', iconFile);
        const r = await fetch(`${API_URL}/modpacks/${modpack.id}/icon`, {
          method: 'POST', headers: authHeaders(), body: fd,
        });
        if (!r.ok) throw new Error((await r.json()).detail || 'Icon upload failed');
      }
      const payload = {
        name: data.name,
        description: data.description,
        environment: data.environment || null,
      };
      const r = await fetch(`${API_URL}/modpacks/${modpack.id}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error((await r.json()).detail || 'Save failed');
      setIconFile(null);
      await refreshModpack();
      setSavedMsg('Saved');
      setTimeout(() => setSavedMsg(''), 2000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const applyMd = (wrap) => {
    const ta = descRef.current;
    if (!ta) return;
    const [before, after] = wrap;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const val = ta.value;
    const sel = val.slice(s, e);
    const next = val.slice(0, s) + before + sel + after + val.slice(e);
    setData(d => ({ ...d, description: next }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, e + before.length);
    }, 0);
  };


  const handleDeleteVersion = async (vid) => {
    if (!window.confirm('Delete this version?')) return;
    const r = await fetch(`${API_URL}/modpacks/${modpack.id}/versions/${vid}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (r.ok) {
      setVersionMenuId(null);
      await refreshModpack();
    } else {
      alert('Delete failed');
    }
  };


  const handlePhotoFiles = async (files) => {
    setPhotoErr('');
    const arr = Array.from(files);
    for (const f of arr) {
      if (photos.length >= 4) {
        setPhotoErr('Maximum 4 photos.');
        break;
      }
      if (!/\.(png|jpe?g|webp)$/i.test(f.name)) {
        setPhotoErr('Only PNG, JPG, WEBP allowed.');
        continue;
      }
      setPhotoUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', f);
        const r = await fetch(`${API_URL}/modpacks/${modpack.id}/photos`, {
          method: 'POST', headers: authHeaders(), body: fd,
        });
        if (!r.ok) {
          const e = await r.json().catch(() => ({}));
          setPhotoErr(e.detail || 'Upload failed');
          break;
        }
        const p = await r.json();
        setPhotos(prev => [...prev, p]);
      } finally {
        setPhotoUploading(false);
      }
    }
  };

  const handleDeletePhoto = async (pid) => {
    const r = await fetch(`${API_URL}/modpacks/${modpack.id}/photos/${pid}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (r.ok) {
      setPhotos(prev => prev.filter(p => p.id !== pid));
    }
  };


  const setVisibility = async (v) => {
    setSaving(true); setErr('');
    try {
      const r = await fetch(`${API_URL}/modpacks/${modpack.id}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: v }),
      });
      if (!r.ok) throw new Error((await r.json()).detail || 'Update failed');
      const m = await r.json();
      setData(d => ({ ...d, visibility: m.visibility, unlisted_token: m.unlisted_token }));
      onUpdated && onUpdated(m);
      if (v === 'unlisted' && !m.unlisted_token) {
        await regenerateShare();
      } else {
        await refreshModpack();
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const regenerateShare = async () => {
    const r = await fetch(`${API_URL}/modpacks/${modpack.id}/regenerate-share`, {
      method: 'POST', headers: authHeaders(),
    });
    if (r.ok) {
      const j = await r.json();
      setData(d => ({ ...d, unlisted_token: j.unlisted_token }));
    }
  };

  const handleTransfer = async () => {
    if (!transferUser.trim()) return;
    if (!window.confirm(`Transfer ownership to "${transferUser}"? You will lose access.`)) return;
    setSaving(true); setErr('');
    try {
      const r = await fetch(`${API_URL}/modpacks/${modpack.id}/transfer`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: transferUser.trim() }),
      });
      if (!r.ok) throw new Error((await r.json()).detail || 'Transfer failed');
      onUpdated && onUpdated(await r.json());
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const shareUrl = data.unlisted_token
    ? `${window.location.origin}/modpack/${modpack.id}?share=${data.unlisted_token}`
    : '';

  const copyShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {  }
  };

  return (
    <>
      <div className="pack-settings-backdrop" onClick={onClose} />
      <div className="pack-settings-modal" role="dialog">
        <div className="pack-settings-header">
          <h2>Pack Settings</h2>
          <button className="ps-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="pack-settings-body">
          <aside className="ps-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`ps-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </aside>

          <section className="ps-content">
            {err && <div className="ps-error">{err}</div>}
            {savedMsg && <div className="ps-success">{savedMsg}</div>}

            {activeTab === 'general' && (
              <div className="ps-section">
                <div className="ps-row">
                  <div className="ps-icon-upload">
                    <div className="ps-icon-preview">
                      {iconPreview ? <img src={iconPreview} alt="icon" /> : <span>No icon</span>}
                    </div>
                    <label className="ps-btn ps-btn-secondary">
                      Choose icon
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={handleIconChange} />
                    </label>
                  </div>
                  <div className="ps-fields">
                    <label className="ps-label">Name</label>
                    <input
                      className="ps-input"
                      value={data.name || ''}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                    />

                    <label className="ps-label">Type</label>
                    <select
                      className="ps-input"
                      value={data.environment || ''}
                      onChange={(e) => setData({ ...data, environment: e.target.value })}
                    >
                      <option value="">Select type</option>
                      <option value="client">Client</option>
                      <option value="server">Server</option>
                      <option value="both">Client & Server</option>
                    </select>
                  </div>
                </div>

                <label className="ps-label">Description (Markdown)</label>
                <div className="ps-md-toolbar">
                  {MD_TOOLS.map(t => (
                    <button key={t.label} className="ps-md-btn" onClick={() => applyMd(t.wrap)} type="button">{t.label}</button>
                  ))}
                  <button className={`ps-md-btn ps-md-toggle ${previewMd ? 'on' : ''}`} onClick={() => setPreviewMd(p => !p)} type="button">
                    Preview
                  </button>
                </div>
                {previewMd ? (
                  <div className="ps-md-preview">
                    <ReactMarkdown>{data.description || '_No description_'}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    ref={descRef}
                    className="ps-textarea"
                    rows="10"
                    value={data.description || ''}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    placeholder="Describe your modpack..."
                  />
                )}

                <div className="ps-actions">
                  <button className="ps-btn ps-btn-primary" disabled={saving} onClick={saveGeneral}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'versions' && (
              <div className="ps-section">
                <div className="ps-section-header">
                  <h3>Versions</h3>
                  <button
                    className="ps-btn ps-btn-primary"
                    onClick={() => { setEditingVersion(null); setShowVersionModal(true); }}
                  >
                    + Create version
                  </button>
                </div>

                <div className="ps-versions-list">
                  {versions.length === 0 && <p className="ps-empty">No versions yet.</p>}
                  {versions.map(v => (
                    <div key={v.id} className="ps-version-row">
                      <div className="ps-vr-main">
                        <div className="ps-vr-name">{v.version_number}</div>
                        <div className="ps-vr-meta">
                          <span className="ps-vr-pill">{modpack.game_version}</span>
                          <span className="ps-vr-date">{new Date(v.created_at).toLocaleDateString()}</span>
                          <span className="ps-vr-downloads">{v.download_count || 0} downloads</span>
                        </div>
                      </div>
                      <div className="ps-vr-actions">
                        <button
                          className="ps-icon-btn"
                          onClick={() => setVersionMenuId(versionMenuId === v.id ? null : v.id)}
                          aria-label="Version menu"
                        >
                          ⋮
                        </button>
                        {versionMenuId === v.id && (
                          <div className="ps-vr-menu" onMouseLeave={() => setVersionMenuId(null)}>
                            <button onClick={() => { setEditingVersion(v); setShowVersionModal(true); setVersionMenuId(null); }}>Edit</button>
                            <button className="danger" onClick={() => handleDeleteVersion(v.id)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="ps-section">
                <div className="ps-section-header">
                  <h3>Photos</h3>
                  <span className="ps-muted">Up to 4 (PNG, JPG, WEBP)</span>
                </div>

                {photoErr && <div className="ps-error">{photoErr}</div>}

                <div className="ps-photo-grid">
                  {photos.map(p => (
                    <div key={p.id} className="ps-photo">
                      <img src={`${API_URL}${p.url}`} alt="" />
                      <button className="ps-photo-del" onClick={() => handleDeletePhoto(p.id)} aria-label="Delete">×</button>
                    </div>
                  ))}
                  {photos.length < 4 && (
                    <label
                      className="ps-photo-add"
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={(e) => { e.preventDefault(); handlePhotoFiles(e.dataTransfer.files); }}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        hidden
                        onChange={(e) => handlePhotoFiles(e.target.files)}
                      />
                      <span>{photoUploading ? 'Uploading…' : '+ Add Photo'}</span>
                      <span className="ps-muted small">drag & drop</span>
                    </label>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="ps-section">
                <h3>Visibility</h3>
                {modpack.is_banned && (
                  <div className="ps-error" style={{ marginBottom: '0.6rem' }}>
                    This modpack is banned. Visibility is locked to <strong>private</strong> until the ban is lifted.
                  </div>
                )}
                <div className="ps-radio-group">
                  {[
                    { v: 'public', t: 'Public', d: 'Anyone can find and view this pack.' },
                    { v: 'unlisted', t: 'Unlisted', d: 'Only people with the link can view this pack.' },
                    { v: 'private', t: 'Private', d: 'Only you can view this pack.' },
                  ].map(opt => {
                    const locked = modpack.is_banned && opt.v !== 'private';
                    return (
                      <label key={opt.v} className={`ps-radio ${data.visibility === opt.v ? 'active' : ''} ${locked ? 'disabled' : ''}`}>
                        <input
                          type="radio"
                          checked={data.visibility === opt.v}
                          disabled={locked}
                          onChange={() => !locked && setVisibility(opt.v)}
                        />
                        <div>
                          <div className="ps-radio-title">{opt.t}</div>
                          <div className="ps-radio-desc">{opt.d}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {data.visibility === 'unlisted' && (
                  <div className="ps-share">
                    <label className="ps-label">Share link</label>
                    <div className="ps-share-row">
                      <input className="ps-input" readOnly value={shareUrl} />
                      <button className="ps-btn ps-btn-secondary" onClick={copyShare}>{copied ? 'Copied!' : 'Copy'}</button>
                      <button className="ps-btn ps-btn-secondary" onClick={regenerateShare}>Regenerate</button>
                    </div>
                  </div>
                )}

                <h3 style={{ marginTop: '1.5rem' }}>Transfer Ownership</h3>
                <div className="ps-share-row">
                  <input
                    className="ps-input"
                    placeholder="Recipient username"
                    value={transferUser}
                    onChange={(e) => setTransferUser(e.target.value)}
                  />
                  <button className="ps-btn ps-btn-warn" onClick={handleTransfer} disabled={saving || !transferUser.trim()}>
                    Transfer
                  </button>
                </div>

                <h3 style={{ marginTop: '1.5rem', color: '#ff8888' }}>Danger Zone</h3>
                <button className="ps-btn ps-btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Modpack
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {showVersionModal && (
        <CreateVersionModal
          isOpen={showVersionModal}
          onClose={() => { setShowVersionModal(false); setEditingVersion(null); }}
          modpackId={modpack.id}
          modpackGameVersion={modpack.game_version}
          isEditing={!!editingVersion}
          editingVersion={editingVersion}
          token={token}
          onSaved={async () => {
            setShowVersionModal(false);
            setEditingVersion(null);
            await refreshModpack();
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Modpack"
        message={`Are you sure you want to delete "${modpack.name}"? This cannot be undone.`}
        onConfirm={async () => {
          const r = await fetch(`${API_URL}/modpacks/${modpack.id}`, {
            method: 'DELETE', headers: authHeaders(),
          });
          if (r.ok) {
            setShowDeleteConfirm(false);
            onDeleted && onDeleted();
          } else {
            alert('Delete failed');
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default PackSettingsModal;