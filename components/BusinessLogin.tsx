import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Mail, Lock, User, ArrowRight, AlertCircle, Building2, BrainCircuit } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';

const BusinessLogin: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithEmail, registerWithEmail } = useUser();

  const from = (location.state as any)?.from?.pathname || '/client';

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login('client');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to login with Google');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, 'client', name);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingAnimation 
          message={isLogin ? "Signing you in..." : "Creating your business account..."} 
          submessage="Connecting to our secure AI infrastructure." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding/Value Prop */}
        <div className="hidden lg:block space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-sm font-bold tracking-wide uppercase">
            <Building2 className="w-4 h-4" /> Enterprise Access
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase italic">
            Scale with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Enterprise AI</span>
          </h1>

          <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
            Join hundreds of forward-thinking companies using solu AI to deconstruct roles and deploy automated agents.
          </p>
          
          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0 border border-slate-100">
                <BrainCircuit className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Sovereign ROI Blueprinting</h4>
                <p className="text-slate-500">Instantly see the strategic value of autonomous agents.</p>
              </div>

            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0 border border-slate-100">
                <User className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Vetted Expert Network</h4>
                <p className="text-slate-500">Access the top 1% of automation associates globally.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Identity Provider (Login Card) */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600"></div>
            
            <div className="mb-10 text-center lg:text-left">
              <div className="lg:hidden inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100 mb-6">
                <Building2 className="w-3.5 h-3.5" /> Enterprise Access
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter">
                {isLogin ? "Welcome Back" : "Start your Journey"}
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-base px-4 lg:px-0">
                {isLogin ? "Sign in to your business dashboard" : "Create your account to get started"}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-500">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Google Auth Button */}
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 active:scale-[0.98]"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">or email</span>
                </div>
              </div>

              {/* Email Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 px-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-slate-700"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 px-1">Business Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-slate-700"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 px-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-slate-700"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] mt-4"
                >
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="pt-8 text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-slate-500 font-bold hover:text-amber-600 transition-colors text-sm"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-center text-slate-400 text-sm font-medium">
            Looking for the <Link to="/login" className="text-slate-900 hover:text-amber-600 underline">Associate Portal</Link>?
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessLogin;
