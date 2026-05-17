import { Link } from 'react-router-dom';
import Footer from './Footer.jsx';
import './StaticPage.css';
const PrivacyPage = () => {
  return (
    <div className="static-page">
      <header className="static-header">
        <Link to="/" className="back-link">
          <img src="/icons/orange.png" alt="OrangLib" className="header-logo" />
          <span>OrangLib</span>
        </Link>
      </header>
      <main className="static-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: January 28, 2026</p>
        <section className="doc-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as:</p>
          <ul>
            <li><strong>Account Information:</strong> Username, email address, and password when you register</li>
            <li><strong>Content:</strong> Modpacks and related files you upload</li>
            <li><strong>Usage Data:</strong> Information about how you use the service, including download statistics</li>
          </ul>
        </section>
        <section className="doc-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share information:</p>
          <ul>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>4. Data Security</h2>
          <p>We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
        </section>

        <section className="doc-section">
          <h2>5. Cookies</h2>
          <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
        </section>

        <section className="doc-section">
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us through our GitHub repository.</p>
        </section>
      </main>

      <Footer />
    </div>
  );
};
export default PrivacyPage;