import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import './UploadModpackPage.css';
import API_URL from '../config.js';
const MAX_MODPACK_FILE_SIZE = 50 * 1024 * 1024;
const isAllowedModpackFile = (fileName) => {
  const lowerName = (fileName || '').toLowerCase();
  return lowerName.endsWith('.zip') || lowerName.endsWith('.mrpack') || lowerName.includes('.tar.');
};

const UploadModpackPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useAuth();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game_version: '26.1.2',
    categories: [],
    is_public: true
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [modpackFile, setModpackFile] = useState(null);
  const [versionNumber, setVersionNumber] = useState('1.0.0');
  const [changelog, setChangelog] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  useEffect(() => {
    if (isEditMode && token) {
      fetchModpack();
    }
  }, [id, token]);
  const fetchModpack = async () => {
    try {
      const response = await fetch(`${API_URL}/modpacks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Modpack not found');
      }
      const data = await response.json();
      setFormData({
        name: data.name || '',
        description: data.description || '',
        game_version: data.game_version || '26.1.2',
        categories: data.categories || [],
        is_public: data.is_public !== false
      });
      if (data.icon_url) {
        setIconPreview(`${API_URL}${data.icon_url}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const categories = [
    'Adventure', 'Challenging', 'Combat', 'Kitchen Sink',
    'Lightweight', 'Magic', 'Multiplayer', 'Optimization',
    'Quests', 'Technology'
  ];
  const gameVersions = ['26.1.2', '26.1', '1.21.11', '1.21.10', '1.21.9', '1.21.8', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2'];
  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleModpackFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!isAllowedModpackFile(file.name)) {
        setError('Invalid file type. Allowed: .zip, .mrpack, .tar.*');
        e.target.value = '';
        setModpackFile(null);
        return;
      }

      if (file.size > MAX_MODPACK_FILE_SIZE) {
        setError('File too large. Maximum size is 50 MB.');
        e.target.value = '';
        setModpackFile(null);
        return;
      }

      setModpackFile(file);
      setError('');
    }
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in');
      return;
    }

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    const authToken = token || getCookie('token');

    if (!authToken) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      let modpackId = id;

      if (isEditMode) {
        setUploadProgress('Updating modpack...');
        const response = await fetch(`${API_URL}/modpacks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'Failed to update modpack');
        }
      } else {
        setUploadProgress('Creating modpack...');
        const response = await fetch(`${API_URL}/modpacks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'Failed to create modpack');
        }

        const modpack = await response.json();
        modpackId = modpack.id;
      }

      if (iconFile) {
        setUploadProgress('Uploading icon...');
        const iconFormData = new FormData();
        iconFormData.append('file', iconFile);

        await fetch(`${API_URL}/modpacks/${modpackId}/icon`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: iconFormData
        });
      }

      if (modpackFile) {
        setUploadProgress('Uploading modpack file...');
        const fileFormData = new FormData();
        fileFormData.append('file', modpackFile);
        fileFormData.append('version_number', versionNumber);
        if (changelog) fileFormData.append('changelog', changelog);

        const uploadResponse = await fetch(`${API_URL}/modpacks/${modpackId}/versions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: fileFormData
        });

        if (!uploadResponse.ok) {
          const err = await uploadResponse.json();
          throw new Error(err.detail || 'Failed to upload modpack file');
        }
      }

      navigate(`/modpack/${modpackId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  if (!user) {
    return (
      <>
        <Sidebar />
        <main className="main-content">
          <div className="upload-page">
            <div className="login-required">
              <h2>Login Required</h2>
              <p>You must be logged in to upload a modpack.</p>
              <button onClick={() => navigate('/login')} className="btn btn-primary">
                Go to Login
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <div className="upload-page">
          <h1>Upload Modpack</h1>
          {error && <div className="error-message">{error}</div>}
          {uploadProgress && <div className="upload-progress">{uploadProgress}</div>}

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-row">
              <div className="form-group icon-upload">
                <label>Icon</label>
                <div className="icon-preview-container">
                  {iconPreview ? (
                    <img src={iconPreview} alt="Icon preview" className="icon-preview" />
                  ) : (
                    <div className="icon-placeholder">
                      <span>No icon</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={handleIconChange}
                    id="icon-input"
                    className="file-input-hidden"
                  />
                  <label htmlFor="icon-input" className="btn btn-secondary">
                    Choose Icon
                  </label>
                </div>
              </div>

              <div className="form-group flex-1">
                <label htmlFor="name">Modpack Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter modpack name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your modpack..."
                rows={5}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="game_version">Game Version</label>
                <select
                  id="game_version"
                  value={formData.game_version}
                  onChange={(e) => setFormData({ ...formData, game_version: e.target.value })}
                >
                  {gameVersions.map(version => (
                    <option key={version} value={version}>{version}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="visibility-option">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  />
                  Make this modpack public
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Categories</label>
              <div className="categories-grid">
                {categories.map(category => (
                  <label key={category} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div className="file-upload-section">
              <h2>Initial Version (Optional)</h2>
              <p className="help-text">
                Upload your modpack file (.zip, .mrpack, .tar.*). Maximum size: 50 MB.
              </p>
              <div className="upload-warning">
                <strong>Recommended:</strong> Use <code>.mrpack</code> format for better integration with OrangLauncher.
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="modpack-file">Modpack File</label>
                  <input
                    type="file"
                    id="modpack-file"
                    accept=".zip,.mrpack,.tar.gz,.tar.xz,.tar.bz2,.tar.lz,.tar.zst"
                    onChange={handleModpackFileChange}
                  />
                  {modpackFile && (
                    <span className="file-selected">
                      Selected: {modpackFile.name} ({(modpackFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="version">Version Number</label>
                  <input
                    type="text"
                    id="version"
                    value={versionNumber}
                    onChange={(e) => setVersionNumber(e.target.value)}
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              {modpackFile && (
                <div className="form-group">
                  <label htmlFor="changelog">Changelog</label>
                  <textarea
                    id="changelog"
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    placeholder="What's new in this version..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Modpack'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};
export default UploadModpackPage;