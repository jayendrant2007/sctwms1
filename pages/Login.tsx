
import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2, Building2, UserCircle, HelpCircle, ChevronRight, Info } from 'lucide-react';
import { Technician, UserRole, AuthUser, Client } from '../types';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  technicians: Technician[];
  clients: Client[];
}

const Login: React.FC<LoginProps> = ({ onLogin, technicians, clients }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      // 1. Admin Login Check
      if (email === 'admin@smartcitytechnologies.com.sg' && password === 'admin123') {
        onLogin({
          id: 'admin',
          name: 'SCT Administrator',
          email: email,
          role: UserRole.ADMIN
        });
        return;
      }

      // 2. Technician Login Check
      const tech = technicians.find(t => t.email === email && t.password === password);
      if (tech) {
        onLogin({
          id: tech.id,
          name: tech.name,
          email: tech.email,
          role: UserRole.TECHNICIAN
        });
        return;
      }

      // 3. Client Login Check
      const client = clients.find(c => c.email === email && c.password === password);
      if (client) {
        onLogin({
          id: client.id,
          name: client.name,
          email: client.email,
          role: UserRole.CLIENT
        });
        return;
      }

      setError('Invalid credentials. Please verify your email and password.');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 backdrop-blur-xl">
          <div className="p-10 pb-8 text-center bg-slate-50/50 border-b border-slate-100 relative">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-blue-500 transition-colors"
              title="Access Guide"
            >
              <HelpCircle size={24} />
            </button>
            <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-[1.75rem] shadow-xl shadow-blue-200 mb-6">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">SCTWMS</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Enterprise Resource Hub</p>
          </div>

          <form onSubmit={handleLogin} className="p-10 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Login Identity (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    required
                    type="email" 
                    placeholder="Enter your registered email"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold placeholder:text-slate-300"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold placeholder:text-slate-300"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Secure Entry <ChevronRight size={16} /></>}
            </button>
          </form>
        </div>

        {/* Local Machine Quick Access Guide */}
        {showHelp && (
          <div className="bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-widest text-[10px]">
                <Info size={16} /> Local Host Quick Start
             </div>
             <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Administrator Access</p>
                   <p className="text-xs text-white font-mono">admin@smartcitytechnologies.com.sg</p>
                   <p className="text-xs text-blue-400 font-mono mt-1">Pass: admin123</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Technician Node</p>
                   <p className="text-xs text-white font-mono">michael.tan@smartcitytechnologies.com.sg</p>
                   <p className="text-xs text-blue-400 font-mono mt-1">Pass: password123</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Client Portal</p>
                   <p className="text-xs text-white font-mono">facilities@capitaland.com</p>
                   <p className="text-xs text-blue-400 font-mono mt-1">Pass: password123</p>
                </div>
             </div>
             <button 
               onClick={() => setShowHelp(false)}
               className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
             >
               Dismiss Guide
             </button>
          </div>
        )}

        <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
          Smart City Technologies Pte Ltd • Singapore
        </p>
      </div>
    </div>
  );
};

export default Login;
