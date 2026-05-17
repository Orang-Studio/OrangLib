import React, { useState, useEffect } from 'react';
import API_URL from '../config.js';
import './CreateVersionModal.css';

const ALLOWED_EXT = /\.(mrpack|zip|tar(\.[a-z0-9]+)?)$/i;
const MAX_SIZE = 50 * 1024 * 1024;
const CreateVersionModal = ({ isOpen, onClose, modpackId, modpackGameVersion, isEditing, editingVersion, token, onSaved }) => {
  const [versionNumber, setVersionNumber] = useState('');
  const [gameVersion, setGameVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isEditing && editingVersion) {
      setVersionNumber(editingVersion.version_number || '');
      setChangelog(editingVersion.changelog || '');
      setGameVersion(modpackGameVersion || '');
    } else {
      setVersionNumber('');
      setChangelog('');
      setGameVersion(modpackGameVersion || '');
    }
    setFile(null);
    setError('');
  }, [isEditing, editingVersion, modpackGameVersion, isOpen]);

  if (!isOpen) return null;

  const pickFile = (f) => {
    if (!f) return;
    if (!ALLOWED_EXT.test(f.name)) {
      setError('Allowed file types: .mrpack, .zip, .tar.*');
      return;
    }
    if (f.size > MAX_SIZE) {
      setError(`File too large. Max ${(MAX_SIZE / 1024 / 1024) | 0} MB`);
      return;
    }
    setFile(f);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!versionNumber.trim()) { setError('Pack version is required'); return; }
    if (!gameVersion.trim()) { setError('Minecraft version is required'); return; }
    if (!isEditing && !file) { setError('Please attach the modpack file'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('version_number', versionNumber.trim());
      fd.append('changelog', changelog || '');
      fd.append('game_version', gameVersion.trim());
      if (file) fd.append('file', file);

      const url = isEditing
        ? `${API_URL}/modpacks/${modpackId}/versions/${editingVersion.id}`
        : `${API_URL}/modpacks/${modpackId}/versions`;
      const method = isEditing ? 'PATCH' : 'POST';

      const r = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.detail || 'Save failed');
      }
      onSaved && onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-version-overlay" onClick={onClose}>
      <div className="create-version-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Version' : 'Create Version'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="version-form">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label>Minecraft Version*</label>
              <input
                type="text"
                value={gameVersion}
                onChange={(e) => setGameVersion(e.target.value)}
                placeholder="e.g., 1.20.1"
                required
              />
            </div>
            <div className="form-group">
              <label>Pack Version*</label>
              <input
                type="text"
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                placeholder="e.g., 1.0.0"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Changes</label>
            <textarea
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="What's new in this version?"
              rows="5"
            />
          </div>
          <div className="form-group">
            <label>{isEditing ? 'Replace file (optional)' : 'Modpack file*'}</label>
            <label
              className={`file-drop ${dragOver ? 'over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
            >
              <input
                type="file"
                accept=".mrpack,.zip,.tar,.tar.gz,.tar.xz,.tar.bz2"
                hidden
                onChange={(e) => pickFile(e.target.files?.[0])}
                disabled={submitting}
              />
              {file ? (
                <div className="file-selected-block">
                  <strong>{file.name}</strong>
                  <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              ) : (
                <div className="file-empty-block">
                  <div className="file-empty-title">Drag &amp; drop your file here</div>
                  <div className="file-empty-sub">or click to browse · .mrpack, .zip, .tar.* (max 50MB)</div>
                </div>
              )}
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEditing ? 'Update Version' : 'Create Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateVersionModal;