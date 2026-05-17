import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import ModpackGrid from './ModpackGrid.jsx';
import Footer from './Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import API_URL from '../config.js';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [viewCount, setViewCount] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [modpacks, setModpacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { token } = useAuth();
  const fetchModpacks = useCallback(async () => {
    try {
      setLoading(true);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: viewCount.toString(),
        sort_by: sortBy
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategories.length > 0) params.append('categories', selectedCategories.join(','));
      if (selectedVersion) params.append('game_version', selectedVersion);
      const response = await fetch(`${API_URL}/modpacks?${params}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setModpacks(data.items.map(m => ({
          id: m.id,
          name: m.name,
          icon_url: m.icon_url,
          environment: m.environment || null,
          categories: m.categories || [],
          downloads: m.downloads,
          updatedAt: getTimeAgo(m.updated_at)
        })));
        setTotalPages(data.total_pages);
      } else {
        setModpacks([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch modpacks:', error);
      setModpacks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, viewCount, sortBy, searchQuery, selectedCategories, selectedVersion]);
  useEffect(() => {
    fetchModpacks();
  }, [fetchModpacks]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedVersion, viewCount, sortBy]);
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 60) return '1 month ago';
    return `${Math.floor(days / 30)} months ago`;
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleVersionSelect = (version) => {
    setSelectedVersion(prev => prev === version ? '' : version);
  };

  return (
    <>
      <div className={`sidebar-overlay${mobileSidebarOpen ? ' open' : ''}`} onClick={() => setMobileSidebarOpen(false)} />
      <Sidebar
        isOpen={sidebarOpen}
        mobileOpen={mobileSidebarOpen}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        selectedVersion={selectedVersion}
        onVersionSelect={handleVersionSelect}
      />
      <main className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewCount={viewCount}
          setViewCount={setViewCount}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />
        {loading ? (
          <div style={{ padding: '2rem', color: '#888' }}>Loading modpacks...</div>
        ) : modpacks.length === 0 ? (
          <div style={{ padding: '2rem', color: '#888' }}>No modpacks found</div>
        ) : (
          <ModpackGrid modpacks={modpacks} />
        )}
        <Footer />
      </main>
    </>
  );
};
export default HomePage;