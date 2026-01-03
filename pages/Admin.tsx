
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
  Briefcase
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
  const [showAddTech, setShowAddTech] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [particularsTech, setParticularsTech] = useState<Technician | null>(null);
  const [particularsClient, setParticularsClient] = useState<Client | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [newTech, setNewTech] = useState<Partial<Technician>>({
    name: '',
    phone: '',
    email: '',
    password: '',
    specialty: JobScope.CCTV,
    status: 'Available'
  });

  const handleAddTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTech.name || !newTech.phone || !newTech.email || !newTech.password) {
      alert("Please fill in all account credentials.");
      return;
    }
    
    const tech: Technician = {
      id: `T${Date.now()}`,
      name: newTech.name!,
      phone: newTech.phone!,
      email: newTech.email!,
      password: newTech.password!,
      specialty: newTech.specialty as JobScope,
      status: 'Available',
      role: UserRole.TECHNICIAN
    };
    
    setTechnicians([...technicians, tech]);
    setShowAddTech(false);
    setNewTech({ name: '', phone: '', email: '', password: '', specialty: JobScope.CCTV });
    alert("New technician account successfully provisioned and saved.");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'TECH' && editingTechId) {
       setTechnicians(prev => prev.map(t => t.id === editingTechId ? { ...t, password: newPassword } : t));
       alert("Technician password has been successfully reset and saved.");
       setEditingTechId(null);
    } else if (activeTab === 'CLIENT' && editingClientId) {
       setClients(prev => prev.map(c => c.id === editingClientId ? { ...c, password: newPassword } : c));
       alert("Client portal password has been successfully reset and saved.");
       setEditingClientId(null);
    }
    setNewPassword('');
  };

  const handleSaveParticulars = (e: React.FormEvent) => {
    e.preventDefault();
    if (particularsTech) {
      setTechnicians(prev => prev.map(t => t.id === particularsTech.id ? particularsTech : t));
      setParticularsTech(null);
      alert("Staff particulars updated and saved successfully.");
    } else if (particularsClient) {
      setClients(prev => prev.map(c => c.id === particularsClient.id ? particularsClient : c));
      setParticularsClient(null);
      alert("Client record updated and saved successfully.");
    }
  };

  const removeTech = (id: string) => {
    if (confirm('Are you sure you want to remove this technician account? All tracking data for this staff will be archived.')) {
      setTechnicians(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTechStatus = (id: string, status: Technician['status']) => {
    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleSaveCompanyInfo = () => {
    setIsSavingInfo(true);
    // Simulate commit to central ledger
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
      alert("Please set up the WhatsApp Group Link in Company Profile first.");
      return;
    }
    const message = encodeURIComponent(`Hi ${tech.name}, welcome to SMART CITY TECHNOLOGIES. Please join our technician work group here: ${companyInfo.whatsappGroupLink}`);
    window.open(`https://wa.me/${tech.phone.replace(/\s+/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      <header>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Administration</h2>
        <p className="text-slate-500 font-medium">Provision accounts, manage credentials, and configure communication hubs</p>
      </header>

      <div className="flex flex-wrap bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit max-w-full">
        <button 
          onClick={() => setActiveTab('TECH')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'TECH' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users size={18} />
          Staff
        </button>
        <button 
          onClick={() => setActiveTab('CLIENT')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'CLIENT' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 size={18} />
          Clients
        </button>
        <button 
          onClick={() => setActiveTab('COMPANY')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'COMPANY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck size={18} />
          Business
        </button>
      </div>

      {activeTab === 'TECH' ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                Active Staff Directory
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Authorized personnel with system access</p>
            </div>
            <button 
              onClick={() => setShowAddTech(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200"
            >
              <Plus size={16} />
              Provision Account
            </button>
          </div>

          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-6 sm:px-8 py-5">Identity</th>
                    <th className="px-6 sm:px-8 py-5 hidden md:table-cell">Contact & Specialty</th>
                    <th className="px-6 sm:px-8 py-5 hidden lg:table-cell">Group Status</th>
                    <th className="px-6 sm:px-8 py-5">Current Status</th>
                    <th className="px-6 sm:px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {technicians.map(tech => (
                    <tr key={tech.id} className="hover:bg-slate-50/30 group transition-colors">
                      <td className="px-6 sm:px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg uppercase shadow-inner shrink-0">
                            {tech.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-black text-slate-800 leading-tight truncate">{tech.name}</span>
                            <span className="block text-[10px] text-slate-400 font-medium mt-1 lowercase truncate">{tech.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 sm:px-8 py-5 hidden md:table-cell">
                         <div className="space-y-1.5">
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                             <Phone size={12} className="text-slate-300 shrink-0" />
                             {tech.phone}
                           </div>
                           <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                             {tech.specialty}
                           </div>
                         </div>
                      </td>
                      <td className="px-6 sm:px-8 py-5 hidden lg:table-cell">
                         <button 
                          onClick={() => inviteToWhatsApp(tech)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm whitespace-nowrap"
                         >
                           <MessageSquare size={14} />
                           Invite to Group
                         </button>
                      </td>
                      <td className="px-6 sm:px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shrink-0 transition-colors hidden sm:block ${
                            tech.status === 'Available' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                            tech.status === 'On Site' ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 
                            'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          }`} />
                          <div className="relative inline-block w-full max-w-[140px]">
                            <select 
                              value={tech.status}
                              onChange={(e) => updateTechStatus(tech.id, e.target.value as Technician['status'])}
                              className={`appearance-none w-full text-[10px] font-black uppercase px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl outline-none cursor-pointer transition-all border-2 pr-8 sm:pr-10 shadow-sm ${
                                tech.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                tech.status === 'On Site' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                tech.status === 'Away' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              <option value="Available">Available</option>
                              <option value="On Site">On Site</option>
                              <option value="Away">Away</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 sm:px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button 
                            onClick={() => setParticularsTech(tech)}
                            className="p-2 sm:p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                            title="Edit Particulars"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => setEditingTechId(tech.id)}
                            className="p-2 sm:p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Reset Password"
                          >
                            <Key size={16} />
                          </button>
                          <button 
                            onClick={() => removeTech(tech.id)}
                            className="p-2 sm:p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Remove Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'CLIENT' ? (
        <div className="space-y-4 animate-in fade-in duration-300">
           <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                Corporate Access Control
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Manage portal credentials for existing clients</p>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-6 sm:px-8 py-5">Corporate Entity</th>
                    <th className="px-6 sm:px-8 py-5 hidden sm:table-cell">Login ID (Email)</th>
                    <th className="px-6 sm:px-8 py-5 hidden md:table-cell">Contact Node</th>
                    <th className="px-6 sm:px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map(client => (
                    <tr key={client.id} className="hover:bg-slate-50/30 group transition-colors">
                      <td className="px-6 sm:px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg uppercase shadow-inner shrink-0">
                            {client.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-black text-slate-800 leading-tight truncate">{client.name}</span>
                            <span className="block text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter truncate">Acc: {client.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 sm:px-8 py-5 hidden sm:table-cell">
                         <div className="flex items-center gap-2 text-sm font-bold text-blue-600 truncate">
                           <Mail size={14} className="text-blue-300 shrink-0" />
                           {client.email}
                         </div>
                      </td>
                      <td className="px-6 sm:px-8 py-5 hidden md:table-cell">
                         <div className="space-y-1">
                           <span className="block text-xs font-black text-slate-700 uppercase truncate">{client.contactPerson}</span>
                           <span className="block text-[10px] text-slate-400 font-medium">{client.phone}</span>
                         </div>
                      </td>
                      <td className="px-6 sm:px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button 
                            onClick={() => setParticularsClient(client)}
                            className="p-2 sm:p-3 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Edit Client Info"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => setEditingClientId(client.id)}
                            className="p-2 sm:p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Reset Client Password"
                          >
                            <Key size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-2xl sm:rounded-3xl shrink-0">
                <Building2 size={28} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-sm">Business Identity</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Official data for legal documents</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Legal Name</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold text-slate-800"
                    value={companyInfo.name}
                    onChange={e => setCompanyInfo({...companyInfo, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Headquarters Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <textarea 
                    rows={2}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold text-slate-800 resize-none"
                    value={companyInfo.address}
                    onChange={e => setCompanyInfo({...companyInfo, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Main Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold text-slate-800"
                      value={companyInfo.phone}
                      onChange={e => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Digital Mailbox</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold text-slate-800"
                      value={companyInfo.email}
                      onChange={e => setCompanyInfo({...companyInfo, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-4">
                 <button 
                  className={`w-full flex items-center justify-center gap-3 py-4 font-black rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] text-xs ${
                    saveSuccess ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                  }`}
                  onClick={handleSaveCompanyInfo}
                  disabled={isSavingInfo}
                >
                  {isSavingInfo ? <Loader2 className="animate-spin" size={18} /> : saveSuccess ? <Check size={18} /> : <Save size={18} />}
                  {saveSuccess ? 'Records Saved' : 'Update Records'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#25D366] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-widest text-sm">WhatsApp Hub</h3>
                      <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest">Team Comms Control</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-emerald-100 uppercase tracking-widest block ml-1">Team Group Invite Link</label>
                       <div className="flex gap-2">
                         <div className="flex-1 relative">
                            <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200" size={16} />
                            <input 
                              type="text" 
                              placeholder="https://chat.whatsapp.com/..."
                              className="w-full pl-11 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-2xl focus:border-white transition-all outline-none text-xs font-bold text-white placeholder:text-emerald-200"
                              value={companyInfo.whatsappGroupLink}
                              onChange={e => setCompanyInfo({...companyInfo, whatsappGroupLink: e.target.value})}
                            />
                         </div>
                         <button 
                          onClick={handleCopyLink}
                          className="px-4 bg-white text-emerald-600 rounded-2xl font-black hover:bg-emerald-50 transition-all shadow-lg"
                         >
                           {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                         </button>
                       </div>
                    </div>

                    <button 
                      onClick={() => window.open(`https://wa.me/${companyInfo.whatsapp}`, '_blank')}
                      className="w-full py-4 bg-white text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={18} />
                      Open Admin Chat
                    </button>
                 </div>
               </div>
               <MessageSquare className="absolute -bottom-10 -right-10 text-white/5" size={200} />
            </div>
          </div>
        </div>
      )}

      {/* Modals - Common Handling */}
      {showAddTech && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Provision Staff</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Setup authentication for field staff</p>
              </div>
              <button onClick={() => setShowAddTech(false)} className="p-2 sm:p-3 bg-white text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddTech} className="p-6 sm:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Legal Name</label>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl sm:rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                      value={newTech.name}
                      onChange={e => setNewTech({...newTech, name: e.target.value})}
                      placeholder="Michael Tan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mobile Line</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                      value={newTech.phone}
                      onChange={e => setNewTech({...newTech, phone: e.target.value})}
                      placeholder="8045 XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Specialty</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                    value={newTech.specialty}
                    onChange={e => setNewTech({...newTech, specialty: e.target.value as JobScope})}
                  >
                    {JOB_SCOPES.map(scope => (
                      <option key={scope} value={scope}>{scope}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                          required
                          type="email" 
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                          value={newTech.email}
                          onChange={e => setNewTech({...newTech, email: e.target.value})}
                          placeholder="staff@sct.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                          required
                          type={showPassword ? "text" : "password"}
                          className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                          value={newTech.password}
                          onChange={e => setNewTech({...newTech, password: e.target.value})}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-all shadow-xl uppercase tracking-widest text-xs">
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(particularsTech || particularsClient) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Update primary record for {particularsTech?.name || particularsClient?.name}</p>
              </div>
              <button onClick={() => { setParticularsTech(null); setParticularsClient(null); }} className="p-2 bg-white text-slate-400 rounded-xl shadow-sm">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveParticulars} className="p-6 sm:p-10 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                      value={particularsTech?.name || particularsClient?.name || ''}
                      onChange={e => particularsTech 
                        ? setParticularsTech({...particularsTech, name: e.target.value})
                        : particularsClient && setParticularsClient({...particularsClient, name: e.target.value})
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                      value={particularsTech?.phone || particularsClient?.phone || ''}
                      onChange={e => particularsTech
                        ? setParticularsTech({...particularsTech, phone: e.target.value})
                        : particularsClient && setParticularsClient({...particularsClient, phone: e.target.value})
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required
                      type="email" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                      value={particularsTech?.email || particularsClient?.email || ''}
                      onChange={e => particularsTech
                        ? setParticularsTech({...particularsTech, email: e.target.value})
                        : particularsClient && setParticularsClient({...particularsClient, email: e.target.value})
                      }
                    />
                  </div>
                </div>

                {particularsTech && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technical Specialty</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                      value={particularsTech.specialty}
                      onChange={e => setParticularsTech({...particularsTech, specialty: e.target.value as JobScope})}
                    >
                      {JOB_SCOPES.map(scope => (
                        <option key={scope} value={scope}>{scope}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-xl sm:rounded-2xl hover:bg-slate-800 transition-all shadow-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <Save size={18} /> Commit Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {(editingTechId || editingClientId) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Security Override</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Reset system password</p>
              </div>
              <button onClick={() => { setEditingTechId(null); setEditingClientId(null); }} className="p-2 bg-white text-slate-400 rounded-xl">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 sm:p-10 space-y-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    required
                    type="text" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 chars"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-all shadow-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <ShieldCheck size={18} /> Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
