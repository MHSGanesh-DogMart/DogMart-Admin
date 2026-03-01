import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Layout/Sidebar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Listings from './pages/Listings';
import Sellers from './pages/Sellers';
import ServiceProviders from './pages/ServiceProviders';
import Breeds from './pages/Breeds';
import Categories from './pages/Categories';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Subscriptions from './pages/Subscriptions';
import Locations from './pages/Locations';
import Reviews from './pages/Reviews';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import ServiceBookings from './pages/ServiceBookings';
import Support from './pages/Support';
import FCMManager from './components/FCMManager';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <Sidebar />
    <div className="main-content">{children}</div>
  </div>
);

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsConditions />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
      <Route path="/sellers" element={<ProtectedRoute><AdminLayout><Sellers /></AdminLayout></ProtectedRoute>} />
      <Route path="/service-providers" element={<ProtectedRoute><AdminLayout><ServiceProviders /></AdminLayout></ProtectedRoute>} />
      <Route path="/listings" element={<ProtectedRoute><AdminLayout><Listings /></AdminLayout></ProtectedRoute>} />
      <Route path="/breeds" element={<ProtectedRoute><AdminLayout><Breeds /></AdminLayout></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><AdminLayout><Categories /></AdminLayout></ProtectedRoute>} />
      <Route path="/subscriptions" element={<ProtectedRoute><AdminLayout><Subscriptions /></AdminLayout></ProtectedRoute>} />
      <Route path="/locations" element={<ProtectedRoute><AdminLayout><Locations /></AdminLayout></ProtectedRoute>} />
      <Route path="/reviews" element={<ProtectedRoute><AdminLayout><Reviews /></AdminLayout></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><AdminLayout><Payments /></AdminLayout></ProtectedRoute>} />
      <Route path="/service-bookings" element={<ProtectedRoute><AdminLayout><ServiceBookings /></AdminLayout></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><AdminLayout><Support /></AdminLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FCMManager />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
