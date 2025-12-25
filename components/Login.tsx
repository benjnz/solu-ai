import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../services/auth';
import LoadingAnimation from './LoadingAnimation';
import { useUser } from '../contexts/UserContext';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'associate' ? '/associate' : '/client');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async (role: 'client' | 'associate') => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle(role);
    } catch (error) {
      console.error("Login failed", error);
      setError("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingAnimation message="Authenticating" submessage="Connecting to Google Secure Service..." />
      </div>
    );
  }

  if (user) {
    return null; // Don't render anything while navigating away
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-[80vh] px-4 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Left side: Associate Value Prop */}
      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Become a solu AI <br/>
          <span className="text-amber-600">Associate</span>
        </h1>
        <p className="text-lg text-slate-600">
          Join the elite network of automation experts. Pass our AI vetting process and get matched with high-value enterprise projects instantly.
        </p>
        
        <div className="space-y-4 pt-4">
          {[
            "Access pre-analyzed automation blueprints",
            "Smart matching with enterprise clients",
            "AI-powered vetting & skill verification",
            "Secure payments & project management"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Login Card */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
        <div className="mb-8 flex justify-center">
           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
              <span className="text-4xl">🚀</span>
           </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Associate Portal</h2>
        <p className="text-slate-500 mb-8">Sign in to access your dashboard or start your application.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5"/> 
            <span>{error}</span>
          </div>
        )}

        <button 
          onClick={() => handleGoogleLogin('associate')}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white border border-transparent rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all font-medium group"
        >
          <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
             <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="group-hover:text-amber-400 transition-colors">Continue with Google</span>
        </button>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            By continuing, you agree to solu AI's <a href="#" className="underline hover:text-amber-600">Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
