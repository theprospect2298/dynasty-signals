import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseTraders from './pages/BrowseTraders';
import TraderProfile from './pages/TraderProfile';
import TraderDashboard from './pages/TraderDashboard';
import FollowerDashboard from './pages/FollowerDashboard';
import SignalFeed from './pages/SignalFeed';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/traders" element={<BrowseTraders />} />
        <Route path="/traders/:id" element={<TraderProfile />} />
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
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
