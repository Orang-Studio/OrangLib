import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import './LandingPage.css';
const BinaryBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const fontSize = 14;
    let columns, rows, grid, colors;
    const initGrid = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      rows = Math.floor(canvas.height / fontSize);
      const newGrid = [];
      const newColors = [];
      for (let y = 0; y < rows; y++) {
        newGrid[y] = [];
        newColors[y] = [];
        for (let x = 0; x < columns; x++) {
          newGrid[y][x] = (grid && grid[y] && grid[y][x] !== undefined) ? grid[y][x] : (Math.random() > 0.5 ? '1' : '0');
          if (colors && colors[y] && colors[y][x]) {
            newColors[y][x] = colors[y][x];
          } else {
            const hue = 20 + Math.random() * 20;
            const saturation = 80 + Math.random() * 20;
            const lightness = 40 + Math.random() * 20;
            newColors[y][x] = { hue, saturation, lightness };
          }
        }
      }
      grid = newGrid;
      colors = newColors;
    };
    initGrid();
    window.addEventListener('resize', initGrid);
    const draw = () => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const { hue, saturation, lightness } = colors[y][x];
          const opacity = 0.05 + Math.random() * 0.08;
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
          ctx.fillText(grid[y][x], x * fontSize, (y + 1) * fontSize);
        }
      }
    };

    const changeRandomCell = () => {
      const x = Math.floor(Math.random() * columns);
      const y = Math.floor(Math.random() * rows);
      grid[y][x] = grid[y][x] === '1' ? '0' : '1';
    };
    draw();
    const drawInterval = setInterval(draw, 500);
    const changeInterval = setInterval(changeRandomCell, 2000);
    return () => {
      clearInterval(drawInterval);
      clearInterval(changeInterval);
      window.removeEventListener('resize', initGrid);
    };
  }, []);
  return <canvas ref={canvasRef} className="binary-background" />;
};

const LandingPage = () => {
  return (
    <div className="landing-page">
      <BinaryBackground />
      <div className="landing-content">
        <div className="landing-hero">
          <img src="/icons/orange.png" alt="OrangLib" className="landing-logo" />
          <h1 className="landing-title">OrangLib</h1>
          <p className="landing-subtitle">Your ultimate modpack library for Minecraft</p>
          <div className="landing-actions">
            <Link to="/browse" className="landing-btn primary">Browse Modpacks</Link>
            <a
              href="https://github.com/Orang-Studio/OrangLaunch/tree/oranglib"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-btn secondary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <h3>Easy Sharing</h3>
            <p>Share your modpacks with the community in seconds</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3>Discover</h3>
            <p>Find the perfect modpack for your playstyle</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <h3>One-Click Install</h3>
            <p>Download and install modpacks with OrangLaunch</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LandingPage;