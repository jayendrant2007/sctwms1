import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2, ChevronRight, HelpCircle, Info, Key, Fingerprint, ShieldAlert, CheckCircle2, ArrowLeft, Send, User, X } from 'lucide-react';
import { Technician, UserRole, AuthUser, Client } from '../types';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  technicians: Technician[];
  clients: Client[];
  adminCredentials: { email: string; password: string };
  onResetPassword: (email: string, newPass: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, technicians, clients, adminCredentials, onResetPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

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

    // Normalize inputs
    const inputEmail = email.trim().toLowerCase();
    const inputPass = password;

    setTimeout(() => {
      // 1. Admin Login Check (Priority)
      if (inputEmail === adminCredentials.email.toLowerCase() && inputPass === adminCredentials.password) {
        onLogin({
          id: 'admin',
          name: 'SCT Administrator',
          email: adminCredentials.email,
          role: UserRole.ADMIN
        });
        return;
      }

      // 2. Technician Login Check
      const tech = technicians.find(t => t.email.toLowerCase() === inputEmail && t.password === inputPass);
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
      const client = clients.find(c => c.email.toLowerCase() === inputEmail && c.password === inputPass);
      if (client) {
        onLogin({
          id: client.id,
          name: client.name,
          email: client.email,
          role: UserRole.CLIENT
        });
        return;
      }

      setError('Authentication Failed: Invalid email or password. Verify credentials and try again.');
      setLoading(false);
    }, 1000);
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const searchEmail = resetEmail.trim().toLowerCase();

    // Search for user
    let foundUser: { name: string; email: string } | undefined;

    if (adminCredentials.email.toLowerCase() === searchEmail) {
      foundUser = { name: 'SCT Administrator', email: adminCredentials.email };
    } else {
      const tech = technicians.find(t => t.email.toLowerCase() === searchEmail);
      if (tech) {
        foundUser = { name: tech.name, email: tech.email };
      } else {
        const client = clients.find(c => c.email.toLowerCase() === searchEmail);
        if (client) {
          foundUser = { name: client.name, email: client.email };
        }
      }
    }

    if (!foundUser) {
      setError('Identity Not Recognized: This email is not registered in the SCT network.');
      return;
    }

    setLoading(true);
    setTargetUserName(foundUser.name);

    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setResetStep('OTP');
      setLoading(false);
      setShowSimulationToast(true);
      setError('');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetOtp === generatedOtp) {
      setResetStep('NEW_PASS');
      setError('');
      setShowSimulationToast(false);
    } else {
      setError('Invalid security code. Please check the simulated email dispatch.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setError('Error: Passwords do not match.');
      return;
    }
    if (newPass.length < 8) {
      setError('Security requirement: Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Direct call to App's password update handler
      const success = onResetPassword(resetEmail, newPass);
      
      if (success) {
        // SYNCHRONIZATION: Update local form state immediately to match new credentials
        setEmail(resetEmail);
        setPassword(newPass);
        
        setIsResetting(false);
        setResetStep('EMAIL');
        setTargetUserName('');
        setNewPass('');
        setConfirmPass('');
        setError('');
        setLoading(false);
        alert(`Access Restored: Password for ${targetUserName} has been updated in the system.`);
      } else {
        setError('System Error: Failed to commit new credentials to the registry.');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]" />
      </div>

      {showSimulationToast && (
        <div className="fixed top-8 right-8 z-[100] w-full max-w-sm animate-in slide-in-from-right-8 duration-500">
           <div className="bg-slate-900 border-2 border-blue-500/50 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-widest text-[10px]">
                    <ShieldAlert size={16} /> Secure Transmission Intercept
                 </div>
                 <button onClick={() => setShowSimulationToast(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={16} />
                 </button>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                       {targetUserName.charAt(0)}
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Recipient Identity</p>
                       <p className="text-xs text-white font-black mt-1">{targetUserName}</p>
                    </div>
                 </div>
                 <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Subject: SCT Security Reset Code for <b>{resetEmail}</b>
                 </p>
                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Verification Code</p>
                    <p className="text-4xl font-black text-white font-mono tracking-[0.5em]">{generatedOtp}</p>
                 </div>
                 <p className="text-[9px] text-slate-500 italic text-center">Simulated email delivery for local testing.</p>
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20" />
           </div>
        </div>
      )}

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 backdrop-blur-xl">
          {!isResetting ? (
            <>
              <div className="p-10 pb-8 text-center bg-slate-50/50 border-b border-slate-100 relative">
                <button onClick={() => setShowHelp(!showHelp)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-blue-500 transition-colors">
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
                      <input required type="email" placeholder="Enter your registered email" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Password</label>
                      <button type="button" onClick={() => { setIsResetting(true); setResetEmail(email); setError(''); }} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">Forgot Password?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input required type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>Secure Entry <ChevronRight size={16} /></>}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-in slide-in-from-right-8 duration-500">
               <div className="p-10 pb-8 text-center bg-slate-50/50 border-b border-slate-100">
                  <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-[1.75rem] shadow-xl shadow-slate-200 mb-6">
                    <Key className="text-white" size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Recovery</h1>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Authentication Hub</p>
               </div>

               <div className="p-10 space-y-8">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                      <ShieldAlert className="text-red-500" size={18} />
                      <p className="text-xs font-bold text-red-600">{error}</p>
                    </div>
                  )}

                  {resetStep === 'EMAIL' && (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Search</label>
                          <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input required type="email" placeholder="Enter your registered email" className="w-full pl-14 pr-4 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                          </div>
                       </div>
                       <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                         {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Verification Code</>}
                       </button>
                    </form>
                  )}

                  {resetStep === 'OTP' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                       <div className="space-y-4 text-center">
                          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                             <User size={14} className="text-blue-500" />
                             <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">{targetUserName}</span>
                          </div>
                          <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">6-digit Security Code</label>
                            <input required autoFocus maxLength={6} placeholder="••••••" className="w-full text-center py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-500 transition-all outline-none text-4xl font-black font-mono tracking-[0.5em]" value={resetOtp} onChange={e => setResetOtp(e.target.value)} />
                          </div>
                       </div>
                       <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                         Verify Code <ChevronRight size={18} />
                       </button>
                    </form>
                  )}

                  {resetStep === 'NEW_PASS' && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                       <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative">
                              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                              <input required type="password" placeholder="••••••••" className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 outline-none text-sm font-bold" value={newPass} onChange={e => setNewPass(e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                            <div className="relative">
                              <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                              <input required type="password" placeholder="••••••••" className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 outline-none text-sm font-bold" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                            </div>
                          </div>
                       </div>
                       <button type="submit" disabled={loading} className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                         {loading ? <Loader2 className="animate-spin" /> : <>Rewrite Password</>}
                       </button>
                    </form>
                  )}

                  <button onClick={() => { setIsResetting(false); setResetStep('EMAIL'); setError(''); setTargetUserName(''); setShowSimulationToast(false); }} className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">
                    <ArrowLeft size={14} /> Back to Entry Node
                  </button>
               </div>
            </div>
          )}
        </div>

        {showHelp && (
          <div className="bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-widest text-[10px]">
                <Info size={16} /> Technical Node Guide
             </div>
             <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Primary Administrator</p>
                   <p className="text-xs text-white font-mono">{adminCredentials.email}</p>
                   <p className="text-xs text-blue-400 font-mono mt-1">Pass: {adminCredentials.password}</p>
                </div>
             </div>
             <button onClick={() => setShowHelp(false)} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Dismiss Guide</button>
          </div>
        )}

        <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Smart City Technologies Pte Ltd • Singapore</p>
      </div>
    </div>
  );
};

export default Login;