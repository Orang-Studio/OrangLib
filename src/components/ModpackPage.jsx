import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import PackSettingsModal from './PackSettingsModal.jsx';
import { CommentsSection, PhotosSection, ChangesSection } from './TabComponents.jsx';
import './ModpackPage.css';
import API_URL from '../config.js';
const ModpackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shareToken = searchParams.get('share') || '';
  const { user, token } = useAuth();
  const [modpack, setModpack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [downloadingVersions, setDownloadingVersions] = useState({});
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [versionSortBy, setVersionSortBy] = useState('newest');
  useEffect(() => {
    fetchModpack();
  }, [id]);
  useEffect(() => {
    if (!modpack) return;
    const hasScanning = modpack.versions?.some(v =>
      v.scan_status === 'scanning' || v.scan_status === 'queued'
    );
    if (hasScanning) {
      const interval = setInterval(fetchModpack, 3000);
      return () => clearInterval(interval);
    }
  }, [modpack]);

  const fetchModpack = async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const url = shareToken
        ? `${API_URL}/modpacks/${id}?share=${encodeURIComponent(shareToken)}`
        : `${API_URL}/modpacks/${id}`;
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error('Modpack not found');
      }
      const data = await response.json();
      setModpack(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (versionId) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/modpacks/${id}/versions/${versionId}/scan`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        let errorMessage = 'Failed to start scan';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
        }
        throw new Error(errorMessage);
      }

      fetchModpack();
    } catch (err) {
      console.error('Scan error:', err);
      alert('Failed to start scan: ' + err.message);
    }
  };

  const handleDownload = async (version) => {
    if (version.scan_status !== 'done') {
      if (version.scan_status === 'queued' || version.scan_status === 'scanning') {
        alert(`This file is being scanned for security threats. Scan progress: ${version.scan_progress || 0}%. Please wait for the scan to complete.`);
        return;
      }
    }

    if (version.scan_verdict !== 'allow') {
      if (version.scan_verdict === 'block') {
        alert('This file has been blocked due to security concerns and cannot be downloaded.');
        return;
      } else if (version.scan_verdict === 'review') {
        alert('This file is pending manual verification by our security team. It may be safe, but is awaiting final approval. Please try again later.');
        return;
      }
    }

    setDownloadingVersions(prev => ({ ...prev, [version.id]: true }));

    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch(`${API_URL}/modpacks/${id}/versions/${version.id}/download`, {
        headers
      });

      if (!response.ok) {
        let errorMessage = 'Download failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          if (response.status === 403) {
            errorMessage = 'Access denied. The file may still be scanning or blocked.';
          } else if (response.status === 404) {
            errorMessage = 'File not found.';
          }
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = version.file_name;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setTimeout(fetchModpack, 500);
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed: ' + err.message);
    } finally {
      setDownloadingVersions(prev => ({ ...prev, [version.id]: false }));
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const isOwner = user && modpack && user.id === modpack.owner_id;

  if (loading) {
    return (
      <div className="modpack-page-wrapper">
        <div className={`sidebar-overlay${mobileSidebarOpen ? ' open' : ''}`} onClick={() => setMobileSidebarOpen(false)} />
        <Sidebar mobileOpen={mobileSidebarOpen} />
        <main className="main-content">
          <div className="modpack-mobile-header">
            <button className="sidebar-toggle" onClick={() => setMobileSidebarOpen(s => !s)} aria-label="Toggle sidebar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="modpack-page-loading">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modpack-page-wrapper">
        <div className={`sidebar-overlay${mobileSidebarOpen ? ' open' : ''}`} onClick={() => setMobileSidebarOpen(false)} />
        <Sidebar mobileOpen={mobileSidebarOpen} />
        <main className="main-content">
          <div className="modpack-mobile-header">
            <button className="sidebar-toggle" onClick={() => setMobileSidebarOpen(s => !s)} aria-label="Toggle sidebar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="modpack-page-error">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="modpack-page-wrapper">
      <div className={`sidebar-overlay${mobileSidebarOpen ? ' open' : ''}`} onClick={() => setMobileSidebarOpen(false)} />
      <Sidebar mobileOpen={mobileSidebarOpen} />
      <main className="main-content">
        <div className="modpack-mobile-header">
          <button className="sidebar-toggle" onClick={() => setMobileSidebarOpen(s => !s)} aria-label="Toggle sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="modpack-page">
          <div className="modpack-header">
            <div className="modpack-icon">
              {modpack.icon_url && (
                <img src={`${API_URL}${modpack.icon_url}?t=${new Date(modpack.updated_at || Date.now()).getTime()}`} alt={modpack.name} />
              )}
            </div>
            <div className="modpack-header-info">
              <h1 className="modpack-title">{modpack.name}</h1>
              <div className="modpack-meta">
                <span className="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {modpack.downloads || 0} downloads
                </span>
                <span className="meta-item">By {modpack.owner_username || 'Unknown'}</span>
                <span className={`visibility-badge ${modpack.visibility || (modpack.is_public ? 'public' : 'private')}`}>
                  {(modpack.visibility || (modpack.is_public ? 'public' : 'private')).replace(/^\w/, c => c.toUpperCase())}
                </span>
                {modpack.environment && (
                  <span className="env-badge" title="Environment">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {modpack.environment === 'both' ? 'Client and server' : modpack.environment.replace(/^\w/, c => c.toUpperCase())}
                  </span>
                )}
              </div>
            </div>
          </div>

          {modpack.is_banned && (isOwner || user?.is_admin) && (() => {
            const BAN_DAYS = 6;
            let daysLeft = null;
            if (modpack.banned_at) {
              const deleteAt = new Date(modpack.banned_at).getTime() + BAN_DAYS * 86400000;
              daysLeft = Math.max(0, Math.ceil((deleteAt - Date.now()) / 86400000));
            }
            return (
              <div className="banned-notice">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4.93 4.93L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div>
                  <strong>"{modpack.name}" was banned for breaking the rules.</strong>
                  {modpack.banned_reason && <div>Reason: {modpack.banned_reason}</div>}
                  {daysLeft !== null && (
                    <div>
                      {daysLeft > 0
                        ? <>This pack will be permanently deleted in <strong>{daysLeft} day{daysLeft === 1 ? '' : 's'}</strong> if not resolved.</>
                        : <>This pack is scheduled for deletion.</>}
                    </div>
                  )}
                  <div>While banned, visibility is locked to <strong>private</strong>.</div>
                  {!isOwner && user?.is_admin && <div className="muted">(viewing as admin)</div>}
                </div>
              </div>
            );
          })()}

          {isOwner && (
            <div className="owner-controls">
              <button className="btn btn-edit" onClick={() => setShowSettings(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 113.4 16.96l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06A2 2 0 116.04 3.4l.06.06a1.65 1.65 0 001.82.33H8a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06A2 2 0 1120.6 6.04l-.06.06a1.65 1.65 0 00-.33 1.82V8a1.65 1.65 0 001.51 1H22a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Pack Settings
              </button>
            </div>
          )}

          <div className="modpack-content-wrapper">
            <div className="modpack-main">
              <div className="modpack-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'versions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('versions')}
                >
                  Versions
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('comments')}
                >
                  Comments
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('photos')}
                >
                  Photos
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'changes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('changes')}
                >
                  Changes
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'description' && (
                  <div className="description-content">
                    <h2>Description</h2>
                    <div className="markdown-content">
                      <ReactMarkdown>{modpack.description || 'No description provided.'}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {activeTab === 'versions' && (
                  <div className="versions-content versions-modern">
                    <div className="versions-header">
                      <h2>Versions</h2>
                      <div className="versions-controls">
                        <div className="sort-control">
                          <label>Sort by</label>
                          <select value={versionSortBy} onChange={(e) => setVersionSortBy(e.target.value)}>
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="downloads">Most Downloaded</option>
                          </select>
                        </div>
                        <button className="refresh-btn" onClick={fetchModpack} title="Refresh">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4V9H4.582M4.582 9C5.245 7.329 6.75 6 8.5 6C10.917 6 12.917 7.917 12.917 10.25C12.917 11.5 12.333 12.5 11.5 13.5M4.582 9H9M20 20V15H19.418M19.418 15C18.755 16.671 17.25 18 15.5 18C13.083 18 11.083 16.083 11.083 13.75C11.083 12.5 11.667 11.5 12.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="versions-table">
                      <div className="versions-thead">
                        <span>Name</span>
                        <span>Game version</span>
                        <span>Published</span>
                        <span>Downloads</span>
                        <span></span>
                      </div>
                      {modpack.versions && modpack.versions.length > 0 ? (
                        (() => {
                          const sortedVersions = [...modpack.versions].sort((a, b) => {
                            if (versionSortBy === 'oldest') {
                              return new Date(a.created_at) - new Date(b.created_at);
                            } else if (versionSortBy === 'downloads') {
                              return (b.download_count || 0) - (a.download_count || 0);
                            }
                            return new Date(b.created_at) - new Date(a.created_at);
                          });
                          return sortedVersions.map((version) => {
                          const scanStatus = version.scan_status || 'unknown';
                          const scanVerdict = version.scan_verdict;
                          const scanStage = version.scan_stage || '';
                          const scanProgress = version.scan_progress || 0;
                          
                          const getScanStatusText = () => {
                            if (scanStatus === 'done') {
                              if (scanVerdict === 'allow') return 'Safe';
                              if (scanVerdict === 'block') return 'Not Safe';
                              if (scanVerdict === 'review') return 'Not Verified';
                              return 'Scanned';
                            }
                            if (scanStatus === 'scanning') return `Scanning (${scanProgress}%)`;
                            if (scanStatus === 'queued') return 'Queued for scan';
                            return 'Unknown';
                          };
                          
                          const getScanStatusColor = () => {
                            if (scanStatus === 'done') {
                              if (scanVerdict === 'allow') return 'safe';
                              if (scanVerdict === 'block') return 'blocked';
                              if (scanVerdict === 'review') return 'review';
                            }
                            if (scanStatus === 'scanning') return 'scanning';
                            if (scanStatus === 'queued') return 'queued';
                            return 'unknown';
                          };
                          
                          const canDownload = scanStatus === 'done' && scanVerdict === 'allow';
                          
                          return (
                            <div key={version.id} className="version-row">
                              <div className="vr-name">
                                <span className={`vr-type-dot ${version.version_tag || 'release'}`} title={version.version_tag || 'release'}></span>
                                <div className="vr-name-block">
                                  <span className="vr-name-title">{version.version_number}</span>
                                  <span className={`scan-status ${getScanStatusColor()}`}>{getScanStatusText()}</span>
                                </div>
                              </div>
                              <div className="vr-cell vr-gv">
                                <span className="version-game-tag">{modpack.game_version}</span>
                              </div>
                              <div className="vr-cell vr-date">{formatTimeAgo(version.created_at)}</div>
                              <div className="vr-cell vr-dl">{version.download_count || 0}</div>
                              <div className="vr-cell vr-actions">
                                {scanStatus === 'scanning' && (
                                  <div className="scan-progress inline">
                                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${scanProgress}%` }} /></div>
                                  </div>
                                )}
                                <button
                                  className={`download-btn ${!canDownload ? 'disabled' : ''} ${downloadingVersions[version.id] ? 'downloading' : ''}`}
                                  onClick={() => canDownload && !downloadingVersions[version.id] && handleDownload(version)}
                                  disabled={!canDownload || downloadingVersions[version.id]}
                                  title={canDownload ? 'Download' : getScanStatusText()}
                                >
                                  {downloadingVersions[version.id] ? (
                                    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/>
                                    </svg>
                                  ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        });
                        })()
                      ) : (
                        <p className="no-versions">No versions available yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <CommentsSection modpackId={id} isOwner={isOwner} />
                )}

                {activeTab === 'photos' && (
                  <PhotosSection modpackId={id} isOwner={isOwner} />
                )}

                {activeTab === 'changes' && (
                  <ChangesSection modpackId={id} versions={modpack.versions} />
                )}
              </div>
            </div>

            <div className="modpack-details-panel">
              <h3>Details</h3>
              <div className="detail-item">
                <span className="detail-label">Categories</span>
                <span className="detail-value">{modpack.categories?.join(', ') || 'None'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Game Version</span>
                <span className="detail-value">{modpack.game_version || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created</span>
                <span className="detail-value">{new Date(modpack.created_at).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Updated</span>
                <span className="detail-value">{new Date(modpack.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
      <PackSettingsModal
        isOpen={showSettings}
        modpack={modpack}
        token={token}
        onClose={() => setShowSettings(false)}
        onUpdated={(m) => setModpack(prev => ({ ...prev, ...m }))}
        onDeleted={() => {
          setShowSettings(false);
          navigate('/browse');
        }}
      />
    </div>
  );
};
export default ModpackPage;