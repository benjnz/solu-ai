import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Users, LayoutDashboard } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-12 animate-in fade-in duration-700">
      <div className="text-center max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider border border-amber-100 mb-4">
           The AI Readiness Blueprint
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Turn Job Descriptions into <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Automated Reality</span>
        </h1>
        <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
          solu AI connects businesses needing efficiency with the world's best automation associates. 
          Generate instant ROI blueprints and hire vetted talent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link to="/client" className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <LayoutDashboard className="w-32 h-32" />
          </div>
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-6">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">I need Automation</h3>
          <p className="text-slate-500 mb-6">Instantly analyze roles, calculate ROI, and find associates to build your workflow.</p>
          <span className="text-amber-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
            Get Started <span className="text-xl">&rarr;</span>
          </span>
        </Link>

        <Link to="/associate" className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Terminal className="w-32 h-32" />
          </div>
           <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white mb-6">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">I am an Associate</h3>
          <p className="text-slate-500 mb-6">Pass AI-powered assessments, prove your skills, and access high-value projects.</p>
          <span className="text-slate-900 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
            Join Talent Pool <span className="text-xl">&rarr;</span>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Home;