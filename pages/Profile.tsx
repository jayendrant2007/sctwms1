
import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  UserCircle,
  Key,
  Smartphone,
  ShieldAlert,
  Save,
  Loader2
} from 'lucide-react';

interface ProfileProps {
  authUser: AuthUser;
  onUpdatePassword: (userId: string, role: UserRole, newPass: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ authUser, onUpdatePassword }) => {
  const [showNewPass, setShowNewPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert("New passwords do not match.");
      return;
    }
    if (newPass.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onUpdatePassword(authUser.id, authUser.role, newPass);
      setLoading(false);
      setSuccess(true);
      setNewPass('');
      setConfirmPass('');
      // Persistence is handled by the parent App component's useEffect
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-10">
        <div>
          <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-[0.2em] text-xs mb-3">
            <ShieldCheck size={16} /> Secure Account Hub
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Profile & Security</h2>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
            authUser.role === UserRole.ADMIN ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
          }`}>
            {authUser.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">{authUser.name}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{authUser.role} ACCESS</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <UserCircle size={16} className="text-blue-500" /> Identity Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Registered Email</label>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-600 flex items-center gap-3">
                  <Mail size={16} className="text-slate-300" />
                  {authUser.email}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">System Access ID</label>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-mono font-bold text-slate-600">
                  {authUser.id}
                </div>
              </div>
            </div>
          </section>

          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
             <div className="flex items-center gap-3 mb-6">
               <ShieldAlert className="text-blue-400" size={24} />
               <h3 className="font-black uppercase tracking-widest text-xs">Security Advisory</h3>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed">
               Always use a strong, unique password. Passwords should be updated periodically to maintain SCT compliance standards. Avoid using personal dates or common phrases.
             </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-blue-500/5 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3 leading-none">
                <Key size={24} className="text-blue-600" /> Change Credentials
              </h3>
              
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">New System Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                      required
                      type={showNewPass ? "text" : "password"}
                      className="w-full pl-14 pr-12 py-4 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:border-blue-500 transition-all outline-none text-sm font-bold placeholder:text-slate-300"
                      placeholder="Minimum 8 characters"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Verify Password</label>
                  <div className="relative group">
                    <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                      required
                      type={showNewPass ? "text" : "password"}
                      className="w-full pl-14 pr-12 py-4 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:border-blue-500 transition-all outline-none text-sm font-bold placeholder:text-slate-300"
                      placeholder="Confirm your entry"
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-6">
                   <button 
                    disabled={loading || !newPass || !confirmPass}
                    className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3 transition-all shadow-xl ${
                      success 
                      ? 'bg-emerald-600 text-white shadow-emerald-100' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200 disabled:opacity-50'
                    }`}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : success ? <><CheckCircle2 size={18} /> Credentials Updated</> : <><Save size={18} /> Update Password</>}
                  </button>
                </div>
              </form>
            </div>
            <Lock className="absolute -bottom-10 -right-10 text-slate-50/50 pointer-events-none" size={240} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
