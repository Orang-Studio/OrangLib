import { Link } from 'react-router-dom';
import Footer from './Footer.jsx';
import './StaticPage.css';
const TermsPage = () => {
  return (
    <div className="static-page">
      <header className="static-header">
        <Link to="/" className="back-link">
          <img src="/icons/orange.png" alt="OrangLib" className="header-logo" />
          <span>OrangLib</span>
        </Link>
      </header>
      <main className="static-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: January 28, 2026</p>

        <section className="doc-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using OrangLib, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.</p>
        </section>
        <section className="doc-section">
          <h2>2. Use License</h2>
          <p>Permission is granted to use OrangLib for personal and commercial purposes, subject to the following restrictions:</p>
          <ul>
            <li>You must not modify or copy the materials except for personal use</li>
            <li>You must not use the materials for any unlawful purpose</li>
            <li>You must not attempt to reverse engineer any software contained on OrangLib</li>
            <li>You must not remove any copyright or proprietary notations from the materials</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>3. User Content</h2>
          <p>Users may upload modpacks and related content. By uploading content, you:</p>
          <ul>
            <li>Warrant that you have the right to distribute the content</li>
            <li>Grant OrangLib a non-exclusive license to host and distribute the content</li>
            <li>Agree not to upload malicious or illegal content</li>
          </ul>
        </section>
        <section className="doc-section">
          <h2>4. Disclaimer</h2>
          <p>The materials on OrangLib are provided on an 'as is' basis. OrangLib makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</p>
        </section>
        <section className="doc-section">
          <h2>5. Limitations</h2>
          <p>In no event shall OrangLib or its suppliers be liable for any damages arising out of the use or inability to use the materials on OrangLib, even if OrangLib has been notified of the possibility of such damage.</p>
        </section>
        <section className="doc-section">
          <h2>6. Contact</h2>
          <p>If you have any questions about these Terms, please contact us through our GitHub repository.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};
export default TermsPage;