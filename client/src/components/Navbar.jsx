import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-dark-800 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-bold text-white">Dynasty <span className="text-brand-400">Signals</span></span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/traders" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              Browse Traders
            </Link>

            {user ? (
              <>
                {user.role === 'trader' ? (
                  <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                    My Dashboard
                  </Link>
                ) : (
                  <Link to="/feed" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                    My Feed
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
                  <span className="text-sm text-gray-400">
                    <span className="text-white font-medium">{user.name.split(' ')[0]}</span>
                    {user.email === 'cjventura229822@yahoo.com' ? (
                      <span className="ml-1.5 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/40 font-bold">👑 Owner</span>
                    ) : (
                      <span className="ml-1.5 text-xs bg-dark-700 text-brand-400 px-2 py-0.5 rounded-full border border-brand-900 capitalize">{user.role}</span>
                    )}
                  </span>
                  <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
