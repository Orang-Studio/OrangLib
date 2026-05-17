import Pagination from './Pagination.jsx'
import './Header.css'

const Header = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewCount,
  setViewCount,
  currentPage,
  setCurrentPage,
  totalPages,
  sidebarOpen,
  setSidebarOpen,
  mobileSidebarOpen,
  setMobileSidebarOpen
}) => {
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(e.target.value);
    }
  };
  const handleToggle = () => {


    if (window.innerWidth <= 768) {
      setMobileSidebarOpen && setMobileSidebarOpen(s => !s);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };
  return (
    <header className="header">
      <div className="header-top">
        <button
          className="sidebar-toggle"
          onClick={handleToggle}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="search-bar">
          <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search modpacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
      <div className="controls">
        <div className="control-group">
          <span className="control-label">Sort by:</span>
          <div className="dropdown">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="updated">Updated</option>
              <option value="downloads">Downloads</option>
              <option value="name">Name</option>
            </select>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">View:</span>
          <div className="dropdown">
            <select value={viewCount} onChange={(e) => setViewCount(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </header>
  )
}
export default Header