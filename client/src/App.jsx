import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SignalAlertProvider } from './context/SignalAlertContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseFollowers from './pages/BrowseFollowers';
import TraderProfile from './pages/TraderProfile';
import TraderDashboard from './pages/TraderDashboard';
import FollowerDashboard from './pages/FollowerDashboard';
import SignalFeed from './pages/SignalFeed';
import TrackRecord from './pages/TrackRecord';
import ProviderApplication from './pages/ProviderApplication';
import AdminApplications from './pages/AdminApplications';
import { Terms, Privacy, RiskDisclosure } from './pages/Legal';
import { Settings, ForgotPassword, ResetPassword } from './pages/Account';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

// Single-provider platform: send "subscribe" intents straight to the official trader
function SubscribeRedirect() {
  const [target, setTarget] = useState(null);
  useEffect(() => {
    axios.get('/api/followers')
      .then(r => setTarget(r.data.officialTraderId ? `/traders/${r.data.officialTraderId}` : '/'))
      .catch(() => setTarget('/'));
  }, []);
  if (!target) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  return <Navigate to={target} replace />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/followers" element={<BrowseFollowers />} />
        <Route path="/traders" element={<BrowseFollowers />} />
        <Route path="/traders/:id" element={<TraderProfile />} />
        <Route path="/track-record" element={<TrackRecord />} />
        <Route path="/become-provider" element={<ProviderApplication />} />
        <Route path="/subscribe" element={<SubscribeRedirect />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/risk" element={<RiskDisclosure />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/settings" element={
          <PrivateRoute><Settings /></PrivateRoute>
        } />
        <Route path="/admin/applications" element={
          <PrivateRoute><AdminApplications /></PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute role="trader"><TraderDashboard /></PrivateRoute>
        } />
        <Route path="/feed" element={
          <PrivateRoute><FollowerDashboard /></PrivateRoute>
        } />
        <Route path="/signals/:traderId" element={
          <PrivateRoute><SignalFeed /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SignalAlertProvider>
          <AppRoutes />
        </SignalAlertProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
