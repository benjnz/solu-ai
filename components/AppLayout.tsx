import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { logout } from '../services/auth';
import { LogOut } from 'lucide-react';

const AppLayout: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isClient = location.pathname.includes('client');
  const isAssociate = location.pathname.includes('associate');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-amber-200 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="font-bold text-xl tracking-tight">solu<span className="text-slate-400">AI</span></span>
            </Link>
            
            <div className="flex gap-4 items-center">
              {user ? (
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200" />
                        <span className="text-sm font-medium text-slate-700 hidden md:inline">{user.name}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                 </div>
              ) : (
                <>
                  <Link to="/associate" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isAssociate ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                    For Associates
                  </Link>
                  <Link to="/client" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isClient ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                    For Business
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} solu AI. All rights reserved. Powered by Gemini.
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
