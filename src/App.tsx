import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './contexts/Web3Context';
import { IPFSProvider } from './contexts/IPFSContext';
import Header from './components/common/Header';
import Home from './components/pages/Home';
import StudentDashboard from './components/dashboard/StudentDashboard';
import InstitutionDashboard from './components/dashboard/InstitutionDashboard';
import VerifierDashboard from './components/dashboard/VerifierDashboard';
import VerifyCredential from './components/pages/VerifyCredential';
import { useWeb3 } from './contexts/Web3Context';

const AppContent: React.FC = () => {
  const { userRole, wallet } = useWeb3();

  const getDashboardRoute = () => {
    if (!wallet.isConnected || !userRole) return '/';
    
    switch (userRole) {
      case 'student':
        return '/dashboard/student';
      case 'institution':
        return '/dashboard/institution';
      case 'verifier':
        return '/dashboard/verifier';
      default:
        return '/';
    }
  };

  // Protected route component
  const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
    children, 
    requiredRole 
  }) => {
    if (!wallet.isConnected) {
      return <Navigate to="/" replace />;
    }
    
    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to={getDashboardRoute()} replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/dashboard/student" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/institution" 
          element={
            <ProtectedRoute requiredRole="institution">
              <InstitutionDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/verifier" 
          element={
            <ProtectedRoute requiredRole="verifier">
              <VerifierDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/verify/:credentialId" element={<VerifyCredential />} />
        <Route path="/dashboard" element={<Navigate to={getDashboardRoute()} replace />} />
        {/* Catch all route - redirect to appropriate dashboard or home */}
        <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Web3Provider>
      <IPFSProvider>
        <Router>
          <AppContent />
        </Router>
      </IPFSProvider>
    </Web3Provider>
  );
}

export default App;