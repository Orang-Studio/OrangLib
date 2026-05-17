import { Link } from 'react-router-dom'
import './Footer.css'
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src="/icons/orange.png" alt="OrangLib" className="footer-logo" />
          <span className="footer-name">OrangLib</span>
        </div>
        <div className="footer-links">
          <a href="https://github.com/Orang-Studio/OrangLaunch/tree/oranglib" target="_blank" rel="noopener noreferrer">GitHub</a>
          <Link to="/docs">API Docs</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
        <div className="footer-copyright">
          © 2026 OrangLib. All rights reserved.
          <div className="recaptcha-badge">
            <small>This part of oranges.lt is currently in alpha and buggy! This website is not affiliated with Mojang.</small>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default Footer