import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Sidebar.css'

const Sidebar = ({
  isOpen = true,
  mobileOpen = false,
  selectedCategories = [],
  onCategoryToggle,
  selectedVersion = '',
  onVersionSelect
}) => {
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [gameVersionOpen, setGameVersionOpen] = useState(true)
  const [versionSearch, setVersionSearch] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const categories = [
    { icon: '', name: 'Adventure' },
    { icon: '', name: 'Challenging' },
    { icon: '', name: 'Combat' },
    { icon: '', name: 'Kitchen Sink' },
    { icon: '', name: 'Lightweight' },
    { icon: '', name: 'Magic' },
    { icon: '', name: 'Multiplayer' },
    { icon: '', name: 'Optimization' },
    { icon: '', name: 'Quests' },
    { icon: '', name: 'Technology' }
  ]
  const gameVersions = [
  '26.1.2','26.1','1.21.11','1.21.10','1.21.9','1.21.8','1.21.7','1.21.6','1.21.5','1.21.4','1.21.3','1.21.2','1.21.1','1.21',
  '1.20.6','1.20.5','1.20.4','1.20.3','1.20.2','1.20.1','1.20',
  '1.19.4','1.19.3','1.19.2','1.19.1','1.19',
  '1.18.2','1.18.1','1.18',
  '1.17.1','1.17',
  '1.16.5','1.16.4','1.16.3','1.16.2','1.16.1','1.16',
  '1.15.2','1.15.1','1.15',
  '1.14.4','1.14.3','1.14.2','1.14.1','1.14',
  '1.13.2','1.13.1','1.13',
  '1.12.2','1.12.1','1.12',
  '1.11.2','1.11.1','1.11',
  '1.10.2','1.10.1','1.10',
  '1.9.4','1.9.3','1.9.2','1.9.1','1.9',
  '1.8.9','1.8.8','1.8.7','1.8.6','1.8.5','1.8.4','1.8.3','1.8.2','1.8.1','1.8'
  ]
  const filteredVersions = gameVersions.filter(v =>
    v.toLowerCase().includes(versionSearch.toLowerCase())
  )

  const handleLogout = () => {
    logout()
    navigate('/')
  }


  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  if (!isOpen && !isMobile && !mobileOpen) return null;
  return (
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}${!isOpen ? ' desktop-hidden' : ''}`}>
      <div className="logo-section">
        <Link to="/browse" className="logo">
          <img src="/icons/orange.png" alt="OrangLib" className="orange-icon" />
          <span className="logo-text">OrangLib</span>
        </Link>
        {user ? (
          <div className="user-section">
            <Link to="/profile" className="user-name-link">{user.username}</Link>
            <button className="auth-button" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Link to="/login" className="auth-button">Register / Login</Link>
        )}
      </div>
      {user && (
        <div className="sidebar-actions">
          <Link to="/upload" className="upload-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Upload Modpack
          </Link>
          {user.is_admin && (
            <Link to="/admin" className="upload-btn" style={{ background: 'rgba(255,140,0,0.15)', color: '#ffb066' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Admin Panel
            </Link>
          )}
        </div>
      )}
      <div className="sidebar-section">
        <button
          className="section-header"
          onClick={() => setCategoriesOpen(!categoriesOpen)}
        >
          <span>Categories</span>
          <svg className={`chevron ${categoriesOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {categoriesOpen && (
          <ul className="category-list">
            {categories.map((category, index) => (
              <li
                key={index}
                className={`category-item ${selectedCategories.includes(category.name) ? 'selected' : ''}`}
                onClick={() => onCategoryToggle && onCategoryToggle(category.name)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                {selectedCategories.includes(category.name) && (
                  <span className="category-check">✓</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sidebar-section">
        <button
          className="section-header"
          onClick={() => setGameVersionOpen(!gameVersionOpen)}
        >
          <span>Game version</span>
          <svg className={`chevron ${gameVersionOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {gameVersionOpen && (
          <div className="version-content">
            <div className="version-search">
              <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={versionSearch}
                onChange={(e) => setVersionSearch(e.target.value)}
              />
            </div>
            <ul className="version-list">
              {filteredVersions.map((version, index) => (
                <li
                  key={index}
                  className={`version-item ${selectedVersion === version ? 'selected' : ''}`}
                  onClick={() => onVersionSelect && onVersionSelect(version)}
                >
                  {version}
                  {selectedVersion === version && <span className="version-check">✓</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="sidebar-ad">
        <div className="ad-content">
          <h4>OrangLauncher</h4>
          <p>Supports importing mrpack files from OrangLib</p>
          <a href="https://github.com/Orang-Studio/OrangLaunch/releases/" target="_blank" rel="noopener noreferrer" className="ad-link">
            Download Now
          </a>
        </div>
      </div>
    </aside>
  )
}
export default Sidebar