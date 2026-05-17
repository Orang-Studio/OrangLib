import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import BanNotification from './components/BanNotification.jsx';
import LandingPage from './components/LandingPage.jsx';
import HomePage from './components/HomePage.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegistrationPage from './components/RegistrationPage.jsx';
import ForgotPasswordPage from './components/ForgotPasswordPage.jsx';
import ResetPasswordPage from './components/ResetPasswordPage.jsx';
import ChangePasswordPage from './components/ChangePasswordPage.jsx';
import ModpackPage from './components/ModpackPage.jsx';
import UploadModpackPage from './components/UploadModpackPage.jsx';
import UserProfilePage from './components/UserProfilePage.jsx';
import DocsPage from './components/DocsPage.jsx';
import TermsPage from './components/TermsPage.jsx';
import PrivacyPage from './components/PrivacyPage.jsx';
import NotFoundPage from './components/NotFoundPage.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import './App.css'
function App() {
  return (
    <AuthProvider>
      <BanNotification />
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/modpack/:id" element={<ModpackPage />} />
          <Route path="/modpack/:id/edit" element={<UploadModpackPage />} />
          <Route path="/upload" element={<UploadModpackPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
export default App