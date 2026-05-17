import React, { useState, useEffect } from 'react';
import './ModerationPanel.css';
import API_URL from '../config.js';
const ModerationPanel = ({ user, token }) => {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    fetchModerationData();
  }, []);
  const fetchModerationData = async () => {
    setLoading(true);
    try {


      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;

    try {
      const response = await fetch(`${API_URL}/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      fetchModerationData();
    } catch (err) {
      setError(err.message);
    }
  };
  const handlePardonUser = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/pardon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) { 
        throw new Error('Failed to pardon user');
      }

      fetchModerationData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMakeModerator = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/promote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'moderator' })
      });

      if (!response.ok) {
        throw new Error('Failed to promote user');
      }

      fetchModerationData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="moderation-panel">
      <h2>Moderation Controls</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="moderation-tabs">
        <button
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'banned' ? 'active' : ''}`}
          onClick={() => setActiveTab('banned')}
        >
          Banned Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'pardon' ? 'active' : ''}`}
          onClick={() => setActiveTab('pardon')}
        >
          Pardon Users
        </button>
      </div>

      <div className="moderation-search">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'members' && (
        <div className="moderation-content">
          <div className="members-grid">
            {members.length > 0 ? (
              members.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-info">
                    <h4>{member.username}</h4>
                    <p className="member-role">{member.role}</p>
                  </div>
                  <div className="member-actions">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => {}}
                    >
                      View Info
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleMakeModerator(member.id)}
                    >
                      Make Mod
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleBanUser(member.id)}
                    >
                      Ban
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No members found</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'banned' && (
        <div className="moderation-content">
          <div className="banned-list">
            {bannedUsers.length > 0 ? (
              bannedUsers.map(user => (
                <div key={user.id} className="banned-item">
                  <div className="banned-info">
                    <h4>{user.username}</h4>
                    <p>Banned: {new Date(user.banned_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handlePardonUser(user.id)}
                  >
                    Pardon
                  </button>
                </div>
              ))
            ) : (
              <p>No banned users</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pardon' && (
        <div className="moderation-content">
          <div className="pardon-section">
            <p>Select a user from the "Banned Users" tab and click "Pardon" to remove their ban.</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default ModerationPanel;