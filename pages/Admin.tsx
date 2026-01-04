import React, { useState } from 'react';
import { Technician, CompanyInfo, JobScope, UserRole, Client } from '../types';
import { JOB_SCOPES } from '../constants';
import { 
  Users, 
  Building2, 
  Plus, 
  Trash2, 
  Save, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  MessageSquare,
  ChevronDown,
  Lock,
  Eye, 
  EyeOff,
  ExternalLink,
  Share2,
  Copy,
  CheckCircle,
  AlertTriangle,
  Key,
  X,
  Activity,
  Check,
  Loader2,
  Edit3,
  UserCog,
  Briefcase,
  UserPlus,
  ShieldAlert,
  Search
} from 'lucide-react';

interface AdminProps {
  technicians: Technician[];
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  companyInfo: CompanyInfo;
  setCompanyInfo: React.Dispatch<React.SetStateAction<CompanyInfo>>;
}

const Admin: React.FC<AdminProps> = ({ technicians, setTechnicians, clients, setClients, companyInfo, setCompanyInfo }) => {
  const [activeTab, setActiveTab] = useState<'TECH' | 'CLIENT' | 'COMPANY'>('TECH');
  const [showManageTechModal, setShowManageTechModal] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [particularsClient, setParticularsClient] = useState<Client | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state for adding/editing technicians
  const [techForm, setTechForm] = useState<Partial<Technician>>({
    name: '',
    phone: '',
    email: '',
    password: '',
    specialty: JobScope.CCTV,
    status: 'Available'
  });

  const openAddTech = () => {
    setEditingTech(null);
    setTechForm({
      name: '',
      phone: '',
      email: '',
      password: '',
      specialty: JobScope.CCTV,
      status: 'Available'
    });
    setShowManageTechModal(true);
  };

  const openEditTech = (tech: Technician) => {
    setEditingTech(tech);
    setTechForm({ ...tech });
    setShowManageTechModal(true);
  };

  const handleSaveTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techForm.name || !techForm.email || !techForm.password) {
      alert("Required fields missing (Name, Email, Password).");
      return;
    }

    if (editingTech) {
      // Update existing
      setTechnicians(prev => prev.map(t => t.id === editingTech.id ? { ...t, ...techForm } as Technician : t));
      alert(`Technician ${techForm.name} updated successfully.`);
    } else {
      // Create new
      const newStaff: Technician = {
        id: `T${Date.now()}`,
        name: techForm.name!,
        phone: techForm.phone || '',
        email: techForm.email!,
        password: techForm.password!,
        specialty: (techForm.specialty as JobScope) || JobScope.CCTV,
        status: 'Available',
        role: UserRole.TECHNICIAN
      };
      setTechnicians(prev => [...prev, newStaff]);
      alert(`New technician ${techForm.name} provisioned.`);
    }

    setShowManageTechModal(false);
  };

  const removeTech = (id: string) => {
    if (confirm('Are you sure you want to PERMANENTLY remove this technician account? Access will be revoked immediately.')) {
      setTechnicians(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTechStatus = (id: string, status: Technician['status']) => {
    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleSaveCompanyInfo = () => {
    setIsSavingInfo(true);
    setTimeout(() => {
      setIsSavingInfo(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const handleCopyLink = () => {
    if (companyInfo.whatsappGroupLink) {
      navigator.clipboard.writeText(companyInfo.whatsappGroupLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inviteToWhatsApp = (tech: Technician) => {
    if (!companyInfo.whatsappGroupLink) {
      alert("Configure WhatsApp Group Link in Company Profile first.");
      return;
    }
    const message = encodeURIComponent(`Hi ${tech.name}, join the SCT work group: ${companyInfo.whatsappGroupLink}`);
    window.open(`https://wa.me/${tech.phone.replace(/\s+/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Command Hub</h2>
          <p className="text-slate-500 font-medium">Manage personnel, clients, and corporate infrastructure</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <button 
            onClick={() => setActiveTab('TECH')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'TECH' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users size={16} /> Staff Directory
          </button>
          <button 
            onClick={() => setActiveTab('CLIENT')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'CLIENT' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 size={16} /> Clients
          </button>
          <button 
            onClick={() => setActiveTab('COMPANY')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'COMPANY' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={16} /> Business Profile
          </button>
        </div>
      </header>

      {activeTab === 'TECH' && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Technician Node</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Authorized field engineers</p>
            </div>
            <button 
              onClick={openAddTech}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100"
            >
              <UserPlus size={18} /> Provision New Account
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-8 py-6">Staff Identity</th>
                    <th className="px-8 py-6">Credentials & Role</th>
                    <th className="px-8 py-6">Deployment Status</th>
                    <th className="px-8 py-6 text-right pr-12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {technicians.map(tech => (
                    <tr key={tech.id} className="hover:bg-slate-50/50 group transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {tech.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-tight">{tech.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{tech.specialty}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Mail size={12} className="text-slate-300" /> {tech.email}</p>
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Phone size={12} className="text-slate-300" /> {tech.phone}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                            tech.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 
                            tech.status === 'On Site' ? 'bg-blue-500' : 'bg-amber-500'
                          }`} />
                          <div className="relative">
                            <select 
                              value={tech.status}
                              onChange={(e) => updateTechStatus(tech.id, e.target.value as Technician['status'])}
                              className={`appearance-none text-[10px] font-black uppercase tracking-widest pl-3 pr-8 py-1.5 rounded-xl border-2 outline-none transition-all cursor-pointer ${
                                tech.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                tech.status === 'On Site' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                              }`}
                            >
                              <option value="Available">Available</option>
                              <option value="On Site">On Site</option>
                              <option value="Away">Away</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right pr-10">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => inviteToWhatsApp(tech)} className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl" title="WhatsApp Invite"><MessageSquare size={18} /></button>
                          <button onClick={() => openEditTech(tech)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl" title="Manage Account"><Edit3 size={18} /></button>
                          <button onClick={() => removeTech(tech.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl" title="Revoke Access"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CLIENT' && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Corporate Client Matrix</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Portal access for building management</p>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-8 py-6">Entity</th>
                    <th className="px-8 py-6">Login Node</th>
                    <th className="px-8 py-6">Contact Node</th>
                    <th className="px-8 py-6 text-right pr-12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map(client => (
                    <tr key={client.id} className="hover:bg-slate-50/50 group transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-tight">{client.name}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1">ID: {client.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6"><span className="text-xs font-bold text-blue-600">{client.email}</span></td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-slate-700">{client.contactPerson}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{client.phone}</p>
                      </td>
                      <td className="px-8 py-6 text-right pr-10">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl" onClick={() => { setEditingClientId(client.id); setNewPassword(''); }}><Key size={18} /></button>
                          <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl"><Edit3 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'COMPANY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-right-4">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-4 pb-8 border-b border-slate-100">
              <div className="p-4 bg-blue-600 text-white rounded-3xl">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest leading-none">Identity Core</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Central Business Metadata</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Company Name</label>
                <input 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black"
                  value={companyInfo.name}
                  onChange={e => setCompanyInfo({...companyInfo, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Headquarters Address</label>
                <textarea 
                  rows={2}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold resize-none"
                  value={companyInfo.address}
                  onChange={e => setCompanyInfo({...companyInfo, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Phone</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black" value={companyInfo.phone} onChange={e => setCompanyInfo({...companyInfo, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black" value={companyInfo.email} onChange={e => setCompanyInfo({...companyInfo, email: e.target.value})} />
                </div>
              </div>
              <button 
                onClick={handleSaveCompanyInfo}
                disabled={isSavingInfo}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
                  saveSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isSavingInfo ? <Loader2 className="animate-spin" /> : saveSuccess ? <Check /> : <Save />}
                {saveSuccess ? 'Configuration Saved' : 'Commit Changes'}
              </button>
            </div>
          </div>

          <div className="bg-[#25D366] p-10 rounded-[3rem] text-white shadow-xl shadow-emerald-100/50 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest">Field Liaison Hub</h3>
              </div>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-100 uppercase tracking-widest ml-1">Group Invite Link (Field Unit)</label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-emerald-100/50"
                      value={companyInfo.whatsappGroupLink}
                      placeholder="https://chat.whatsapp.com/..."
                      onChange={e => setCompanyInfo({...companyInfo, whatsappGroupLink: e.target.value})}
                    />
                    <button onClick={handleCopyLink} className="p-4 bg-white text-emerald-600 rounded-2xl shadow-lg hover:bg-emerald-50 transition-all">
                      {copied ? <Check /> : <Copy />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-emerald-50 leading-relaxed font-medium">
                  Field staff receive this link when you trigger an invite from the directory. Ensure the group is monitored by operations.
                </p>
              </div>
            </div>
            <Activity className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-110 transition-transform duration-[3000ms]" size={240} />
          </div>
        </div>
      )}

      {/* Unified Manage Technician Modal */}
      {showManageTechModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-lg shadow-blue-100">
                  <UserCog size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{editingTech ? 'Manage Profile' : 'Provision Staff'}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-2">Field Professional Authentication</p>
                </div>
              </div>
              <button onClick={() => setShowManageTechModal(false)} className="p-4 bg-white text-slate-400 hover:text-slate-600 rounded-[1.5rem] shadow-sm transition-all">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSaveTech} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black" value={techForm.name} onChange={e => setTechForm({...techForm, name: e.target.value})} placeholder="e.g. Michael Tan" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black" value={techForm.phone} onChange={e => setTechForm({...techForm, phone: e.target.value})} placeholder="+65 XXXX XXXX" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SCT Specialty</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black" value={techForm.specialty} onChange={e => setTechForm({...techForm, specialty: e.target.value as JobScope})}>
                    {JOB_SCOPES.map(scope => <option key={scope} value={scope}>{scope}</option>)}
                  </select>
                </div>

                <div className="col-span-2 pt-6 border-t border-slate-100 space-y-6">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={16} className="text-amber-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authentication Credentials</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Login ID)</label>
                    <input required type="email" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black" value={techForm.email} onChange={e => setTechForm({...techForm, email: e.target.value})} placeholder="staff@smartcitytechnologies.com.sg" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black" value={techForm.password} onChange={e => setTechForm({...techForm, password: e.target.value})} placeholder="Minimum 8 characters" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <button type="submit" className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
                <Save size={18} /> {editingTech ? 'Commit Profile Updates' : 'Provision Staff Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Client Password Reset Modal */}
      {editingClientId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Override</h3>
                <p className="text-xs text-slate-500 font-medium">Reset client portal password</p>
              </div>
              <button onClick={() => setEditingClientId(null)} className="text-slate-400"><X /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setClients(prev => prev.map(c => c.id === editingClientId ? { ...c, password: newPassword } : c));
              alert("Client password updated.");
              setEditingClientId(null);
            }} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Portal Password</label>
                <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 8 chars" />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-[10px]">Update Client Credentials</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;