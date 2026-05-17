import React, { useState } from 'react';
import './ManageModpackModal.css';

const ManageModpackModal = ({ isOpen, modpack, onClose, onDelete, onUpdate, user, token }) => {
  const [editData, setEditData] = useState(modpack || {});
  const [isSaving, setIsSaving] = useState(false);
  const [transferUser, setTransferUser] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  if (!isOpen || !modpack) return null;
  const isOwner = user && user.id === modpack.owner_id;
  const handleSave = async () => {
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(editData);
    } finally {
      setIsSaving(false);
    }
  };
  const handleTransfer = async () => {
    if (!transferUser.trim()) {
      alert('Please enter a username');
      return;
    }
    console.log('Transferring to:', transferUser);
    setShowTransferModal(false);
  };
  return (
    <>
      <div className="manage-backdrop" onClick={onClose}></div>
      <div className="manage-modal-simplified">
        <div className="manage-header">
          <h2>Manage Modpack</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="manage-content-simplified">
          <div className="form-group">
            <label>
              Modpack Name
              <span className="form-icon" title="Name of your modpack">ℹ️</span>
            </label>
            <input
              type="text"
              value={editData.name || ''}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              disabled={!isOwner}
              placeholder="Enter modpack name"
            />
          </div>

          <div className="form-group">
            <label>
              Description
              <span className="form-icon" title="Markdown is supported">📝 Markdown supported</span>
            </label>
            <textarea
              value={editData.description || ''}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              disabled={!isOwner}
              placeholder="Describe your modpack (supports markdown)"
              rows="6"
            />
          </div>

          <div className="form-group">
            <label>Environment</label>
            <select
              value={editData.environment || ''}
              onChange={(e) => setEditData({...editData, environment: e.target.value})}
              disabled={!isOwner}
            >
              <option value="">Select environment</option>
              <option value="both">Client and Server</option>
              <option value="client">Client Only</option>
              <option value="server">Server Only</option>
            </select>
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <div className="visibility-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="visibility"
                  checked={editData.is_public !== false}
                  onChange={() => setEditData({...editData, is_public: true})}
                  disabled={!isOwner}
                />
                <span>Public</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="visibility"
                  checked={editData.is_public === false}
                  onChange={() => setEditData({...editData, is_public: false})}
                  disabled={!isOwner}
                />
                <span>Private</span>
              </label>
            </div>
          </div>
        </div>

        <div className="manage-footer-simplified">
          <div className="action-buttons">
            <button
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            {isOwner && (
              <>
                <button
                  className="btn btn-info"
                  onClick={() => setShowTransferModal(true)}
                >
                  Transfer
                </button>
                <button
                  className="btn btn-danger"
                  onClick={onDelete}
                >
                  Delete
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {}
        {showTransferModal && (
          <div className="transfer-modal-overlay" onClick={() => setShowTransferModal(false)}>
            <div className="transfer-modal" onClick={e => e.stopPropagation()}>
              <h3>Transfer Modpack Ownership</h3>
              <p>Enter the username of the user you want to transfer ownership to:</p>
              <input
                type="text"
                value={transferUser}
                onChange={(e) => setTransferUser(e.target.value)}
                placeholder="Username"
              />
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleTransfer}>
                  Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default ManageModpackModal;