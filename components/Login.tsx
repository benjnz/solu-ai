import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import LoadingAnimation from './LoadingAnimation';
import { useUser } from '../contexts/UserContext';
import { CheckCircle, AlertTriangle, Mail, Lock, User, ArrowRight, Terminal } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithEmail, registerWithEmail } = useUser();

  const from = (location.state as any)?.from?.pathname || '/associate';

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await login('associate');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.message || "Authentication failed. Please try again.");
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, 'associate', name);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
      setIsLoggingIn(false);
    }
  };

  if (isLoggingIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingAnimation 
          message={isLogin ? "Signing you in..." : "Joining the elite..."} 
          submessage="Connecting to our secure Associate network." 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen px-3 sm:px-6 py-8 md:py-12 gap-10 md:gap-12 lg:gap-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Left Column: Associate Value Prop */}
      <div className="max-w-md space-y-6 md:space-y-8 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100 mx-auto md:mx-0">
           <Terminal className="w-3.5 h-3.5" /> Sovereign Network
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight uppercase italic">
          Solu AI <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Expert Agent</span>
        </h1>
        <p className="text-base md:text-lg text-slate-500 leading-relaxed font-medium">
          Join the elite network of sovereign automation experts. Solve complex enterprise problems at scale.
        </p>

        <div className="hidden sm:block space-y-5 pt-4">
          <div className="flex items-center gap-4 group">
             <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-500 group-hover:scale-110 transition-transform">
               <CheckCircle className="w-4 h-4" />
             </div>
             <span className="text-slate-700 font-bold">Access exclusive enterprise projects</span>
          </div>
          <div className="flex items-center gap-4 group">
             <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-500 group-hover:scale-110 transition-transform">
               <CheckCircle className="w-4 h-4" />
             </div>
             <span className="text-slate-700 font-bold">AI-powered vetting & skill badges</span>
          </div>
          <div className="flex items-center gap-4 group">
             <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-500 group-hover:scale-110 transition-transform">
               <CheckCircle className="w-4 h-4" />
             </div>
             <span className="text-slate-700 font-bold">Industry-leading payout structures</span>
          </div>
        </div>
      </div>

      {/* Login/Signup Card */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-800 to-slate-900"></div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            {isLogin ? "Associate Access" : "Join Network"}
          </h2>
          <p className="text-slate-500 text-sm font-bold">
            {isLogin ? "Sign in to your expert portal" : "Create your associate profile"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-500">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 active:scale-[0.98]"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-4 text-slate-400 font-black tracking-[0.2em]">or use mail</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] mt-2"
            >
              {isLogin ? "Enter Portal" : "Join Elite"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="pt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-400 font-bold hover:text-slate-900 transition-colors text-xs uppercase tracking-widest"
            >
              {isLogin ? "Need an invitation? Apply now" : "Already an associate? Sign in"}
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
             Are you a business? <Link to="/business-login" className="text-amber-600 hover:text-amber-700 underline underline-offset-4 decoration-2">Client Portal</Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;