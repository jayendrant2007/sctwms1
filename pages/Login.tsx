
import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2, ChevronRight, Key, Fingerprint, ShieldAlert, CheckCircle2, ArrowLeft, Send, User, X } from 'lucide-react';
import { Technician, UserRole, AuthUser, Client, CompanyInfo } from '../types';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  technicians: Technician[];
  clients: Client[];
  adminCredentials: { email: string; password: string };
  onResetPassword: (email: string, newPass: string) => boolean;
  companyInfo: CompanyInfo;
}

const Login: React.FC<LoginProps> = ({ onLogin, technicians, clients, adminCredentials, onResetPassword, companyInfo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Recovery State
  const [isResetting, setIsResetting] = useState(false);
  const [resetStep, setResetStep] = useState<'EMAIL' | 'OTP' | 'NEW_PASS'>('EMAIL');
  const [resetEmail, setResetEmail] = useState('');
  const [targetUserName, setTargetUserName] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showSimulationToast, setShowSimulationToast] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const inputEmail = email.trim().toLowerCase();
    const inputPass = password;
    setTimeout(() => {
      if (inputEmail === adminCredentials.email.toLowerCase() && inputPass === adminCredentials.password) {
        onLogin({ id: 'admin', name: 'SCT Administrator', email: adminCredentials.email, role: UserRole.ADMIN });
        return;
      }
      const tech = technicians.find(t => t.email.toLowerCase() === inputEmail && t.password === inputPass);
      if (tech) {
        onLogin({ id: tech.id, name: tech.name, email: tech.email, role: UserRole.TECHNICIAN });
        return;
      }
      const client = clients.find(c => c.email.toLowerCase() === inputEmail && c.password === inputPass);
      if (client) {
        onLogin({ id: client.id, name: client.name, email: client.email, role: UserRole.CLIENT });
        return;
      }
      setError('Authentication Failed: Invalid email or password.');
      setLoading(false);
    }, 1000);
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const searchEmail = resetEmail.trim().toLowerCase();
    let foundUser: { name: string; email: string } | undefined;
    if (adminCredentials.email.toLowerCase() === searchEmail) { foundUser = { name: 'SCT Administrator', email: adminCredentials.email }; } 
    else { const tech = technicians.find(t => t.email.toLowerCase() === searchEmail); if (tech) foundUser = { name: tech.name, email: tech.email }; else { const client = clients.find(c => c.email.toLowerCase() === searchEmail); if (client) foundUser = { name: client.name, email: client.email }; } }
    if (!foundUser) { setError('Identity Not Recognized.'); return; }
    setLoading(true); setTargetUserName(foundUser.name);
    setTimeout(() => { const code = Math.floor(100000 + Math.random() * 900000).toString(); setGeneratedOtp(code); setResetStep('OTP'); setLoading(false); setShowSimulationToast(true); }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetOtp === generatedOtp) { setResetStep('NEW_PASS'); setError(''); setShowSimulationToast(false); } 
    else { setError('Invalid security code.'); }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    if (newPass.length < 8) { setError('Minimum 8 characters required.'); return; }
    setLoading(true);
    setTimeout(() => {
      const success = onResetPassword(resetEmail, newPass);
      if (success) { setEmail(resetEmail); setPassword(newPass); setIsResetting(false); setResetStep('EMAIL'); setLoading(false); alert(`Access Restored for ${targetUserName}.`); } 
      else { setError('System Error.'); setLoading(false); }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 backdrop-blur-xl">
          {!isResetting ? (
            <>
              <div className="p-10 pb-8 text-center bg-slate-50/50 border-b border-slate-100 relative">
                <div className="inline-flex items-center justify-center mb-6">
                  {companyInfo.logoUrl ? (
                    <div className="w-24 h-24 bg-white p-3 rounded-[1.75rem] shadow-xl shadow-slate-200/50 flex items-center justify-center">
                       <img src={companyInfo.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-600 rounded-[1.75rem] shadow-xl shadow-blue-200">
                       <ShieldCheck className="text-white" size={32} />
                    </div>
                  )}
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">SCTWMS</h1>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 px-4">
                  {companyInfo.motto || "ENTERPRISE RESOURCE HUB"}
                </p>
              </div>
              <form onSubmit={handleLogin} className="p-10 space-y-6">
                {error && (<div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /><p className="text-xs font-bold text-red-600">{error}</p></div>)}
                <div className="space-y-4">
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Login Identity (Email)</label><div className="relative group"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input required type="email" placeholder="Enter your registered email" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 outline-none text-sm font-bold" value={email} onChange={e => setEmail(e.target.value)} /></div></div>
                  <div className="space-y-1.5"><div className="flex items-center justify-between px-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Password</label><button type="button" onClick={() => { setIsResetting(true); setResetEmail(email); setError(''); }} className="text-[10px] font-black text-blue-600 uppercase hover:text-blue-700 tracking-wider">Forgot Password?</button></div><div className="relative group"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input required type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 outline-none text-sm font-bold" value={password} onChange={e => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-900/10">{loading ? <Loader2 className="animate-spin" size={18} /> : <>Secure Entry <ChevronRight size={16} /></>}</button>
              </form>
            </>
          ) : (
            <div className="animate-in slide-in-from-right-8 duration-500">
               <div className="p-10 pb-8 text-center bg-slate-50/50 border-b border-slate-100"><div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-[1.75rem] shadow-xl shadow-slate-200 mb-6"><Key className="text-white" size={32} /></div><h1 className="text-3xl font-black text-slate-900 tracking-tight">Recovery</h1></div>
               <div className="p-10 space-y-8">{error && (<div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3"><ShieldAlert className="text-red-500" size={18} /><p className="text-xs font-bold text-red-600">{error}</p></div>)}{resetStep === 'EMAIL' && (<form onSubmit={handleRequestOtp} className="space-y-6"><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Search</label><div className="relative group"><Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} /><input required type="email" placeholder="Email" className="w-full pl-14 pr-4 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold" value={resetEmail} onChange={e => setResetEmail(e.target.value)} /></div></div><button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">{loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Code</>}</button></form>)}{resetStep === 'OTP' && (<form onSubmit={handleVerifyOtp} className="space-y-6"><div className="space-y-3 text-center"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</label><input required autoFocus maxLength={6} placeholder="••••••" className="w-full text-center py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-500 outline-none text-4xl font-black font-mono tracking-[0.5em]" value={resetOtp} onChange={e => setResetOtp(e.target.value)} /></div><button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-[11px]">Verify</button></form>)}{resetStep === 'NEW_PASS' && (<form onSubmit={handleResetPassword} className="space-y-6"><div className="space-y-4"><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Pass</label><input required type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl focus:border-blue-500 outline-none text-sm font-bold" value={newPass} onChange={e => setNewPass(e.target.value)} /></div><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label><input required type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl focus:border-blue-500 outline-none text-sm font-bold" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} /></div></div><button type="submit" disabled={loading} className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 uppercase tracking-widest text-[11px]">Reset</button></form>}<button onClick={() => { setIsResetting(false); setResetStep('EMAIL'); setError(''); }} className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"><ArrowLeft size={14} /> Back</button></div>
            </div>
          )}
        </div>
        <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Smart City Technologies Pte Ltd</p>
      </div>
    </div>
  );
};

export default Login;
