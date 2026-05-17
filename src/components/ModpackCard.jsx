import { Link } from 'react-router-dom'
import './ModpackCard.css'
import API_URL from '../config.js';
const formatDownloads = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};
const ModpackCard = ({ modpack }) => {
  const iconSrc = modpack.icon_url
    ? `${API_URL}${modpack.icon_url}`
    : '/icons/minecraft-blue.png';
  return (
    <Link to={`/modpack/${modpack.id}`} className="modpack-card">
      <div className="modpack-thumbnail">
        <img
          src={iconSrc}
          alt={modpack.name}
          onError={(e) => {
            e.target.src = '/icons/minecraft-blue.png';
          }}
        />
      </div>
      <div className="modpack-info">
        <h3 className="modpack-name">{modpack.name}</h3>
        {modpack.is_banned && (
          <span className="tag banned-tag">Banned</span>
        )}
        <div className="modpack-tags">
          {modpack.environment && (
            <span className="tag environment">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {modpack.environment === 'both' ? 'Client and server' : modpack.environment.replace(/^\w/, c => c.toUpperCase())}
            </span>
          )}
          {modpack.categories.slice(0, 3).map((category, index) => (
            <span key={index} className="tag category">
              {category}
            </span>
          ))}
        </div>
      </div>
      <div className="modpack-stats">
        <div className="downloads">
          <svg className="download-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="download-count">{formatDownloads(modpack.downloads)}</span>
          <span className="download-label">downloads</span>
        </div>
        <div className="updated">
          <svg className="update-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C8.46819 21 5.43209 18.9387 4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 16V12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Updated {modpack.updatedAt}</span>
        </div>
      </div>
    </Link>
  )
}
export default ModpackCard