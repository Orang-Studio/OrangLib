import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import './TabComponents.css';
export const CommentsSection = ({ modpackId, isOwner }) => {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const authHeaders = useCallback(() => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, [token]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/modpacks/${modpackId}/comments`, { headers: authHeaders() });
      if (r.ok) setComments(await r.json());
    } finally {
      setLoading(false);
    }
  }, [modpackId, authHeaders]);
  useEffect(() => { load(); }, [load]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!token) { setError('You must be logged in to comment'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const r = await fetch(`${API_URL}/modpacks/${modpackId}/comments`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment.trim() }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.detail || 'Failed to post comment');
      }
      const c = await r.json();
      setComments([c, ...comments]);
      setNewComment('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    const r = await fetch(`${API_URL}/modpacks/${modpackId}/comments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (r.ok) setComments(comments.filter(c => c.id !== id));
  };
  return (
    <div className="comments-section">
      <h3>Comments</h3>
      {token && (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this modpack..."
            rows="3"
            maxLength={2000}
          />
          {error && <div className="comment-error">{error}</div>}
          <button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      <div className="comments-list">
        {loading ? (
          <p className="no-comments">Loading comments…</p>
        ) : comments.length > 0 ? (
          comments.map(comment => {
            const canDelete = user && (user.id === comment.user_id || isOwner);
            return (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{comment.username || 'Unknown'}</span>
                  <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                  {canDelete && (
                    <button
                      className="comment-delete"
                      onClick={() => handleDelete(comment.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      ×
                    </button>
                  )}
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            );
          })
        ) : (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export const PhotosSection = ({ modpackId, isOwner }) => {
  const { token } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const [lightbox, setLightbox] = useState(null);

  const authHeaders = useCallback(() => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, [token]);

  const load = useCallback(async () => {
    const r = await fetch(`${API_URL}/modpacks/${modpackId}/photos`, { headers: authHeaders() });
    if (r.ok) setPhotos(await r.json());
  }, [modpackId, authHeaders]);

  useEffect(() => { load(); }, [load]);

  const upload = async (files) => {
    setErr('');
    const arr = Array.from(files);
    for (const f of arr) {
      if (photos.length >= 4) { setErr('Maximum 4 photos'); break; }
      if (!/\.(png|jpe?g|webp)$/i.test(f.name)) { setErr('Only PNG, JPG, WEBP'); continue; }
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', f);
        const r = await fetch(`${API_URL}/modpacks/${modpackId}/photos`, {
          method: 'POST', headers: authHeaders(), body: fd,
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          setErr(j.detail || 'Upload failed');
          break;
        }
        const p = await r.json();
        setPhotos(prev => [...prev, p]);
      } finally {
        setUploading(false);
      }
    }
  };

  const remove = async (id) => {
    const r = await fetch(`${API_URL}/modpacks/${modpackId}/photos/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (r.ok) setPhotos(p => p.filter(x => x.id !== id));
  };
  return (
    <div className="photos-section">
      <h3>Gallery</h3>
      <p className="photos-info">Upload up to 4 photos (WebP, JPG, PNG)</p>
      {err && <div className="comment-error">{err}</div>}
      <div className="photos-grid">
        {photos.map((photo, idx) => (
          <div key={photo.id} className="photo-item" onClick={() => setLightbox(photo)}>
            <img src={`${API_URL}${photo.url}`} alt={`Photo ${idx + 1}`} loading="lazy" />
            {isOwner && (
              <button
                className="photo-delete"
                onClick={(e) => { e.stopPropagation(); remove(photo.id); }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {photos.length < 4 && isOwner && (
          <label
            className="photo-upload"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
          >
            <input
              type="file"
              multiple
              accept="image/webp,image/jpeg,image/png"
              onChange={(e) => upload(e.target.files)}
              disabled={uploading}
              hidden
            />
            <span>{uploading ? 'Uploading...' : '+ Add Photo'}</span>
          </label>
        )}
      </div>

      {lightbox && (
        <div className="photo-lightbox" onClick={() => setLightbox(null)}>
          <img src={`${API_URL}${lightbox.url}`} alt="" />
        </div>
      )}
    </div>
  );
};

export const ChangesSection = ({ modpackId, versions }) => {
  return (
    <div className="changes-section">
      <h3>Changelog</h3>

      <div className="changes-list">
        {versions && versions.length > 0 ? (
          versions.map(version => (
            <div key={version.id} className="change-item">
              <div className="change-header">
                <span className="change-version">v{version.version_number}</span>
                <span className="change-date">{new Date(version.created_at).toLocaleDateString()}</span>
              </div>
              {version.changelog && (
                <p className="change-text">{version.changelog}</p>
              )}
            </div>
          ))
        ) : (
          <p className="no-changes">No version history yet.</p>
        )}
      </div>
    </div>
  );
};
export default { CommentsSection, PhotosSection, ChangesSection };