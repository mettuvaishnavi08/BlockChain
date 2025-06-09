import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { Web3Provider } from './contexts/Web3Context';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CredentialsPage from './pages/CredentialsPage';
import IssueCredentialPage from './pages/IssueCredentialPage';
import VerificationPage from './pages/VerificationPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Error Pages
import NotFoundPage from './pages/errors/NotFoundPage';

function App() {
  return (
    <Web3Provider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/verify" element={<VerificationPage />} />
              <Route path="/auth/Login" element={<Login />} />
              <Route path="/auth/RegisterPage" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="/credentials" element={
                <ProtectedRoute>
                  <CredentialsPage />
                </ProtectedRoute>
              } />

              <Route path="/issue" element={
                <ProtectedRoute roles={['institution']}>
                  <IssueCredentialPage />
                </ProtectedRoute>
              } />

              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />

              {/* Error Routes */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </Layout>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </Web3Provider>
  );
}

export default App;