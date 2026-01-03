
import React, { useState, useEffect } from 'react';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, JobScope } from '../types';
import { JOB_SCOPES } from '../constants';
import { 
  ShieldCheck, 
  Search, 
  Send, 
  Plus, 
  ChevronRight, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Timer, 
  ArrowLeft,
  Loader2,
  Check,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  History,
  LifeBuoy,
  Printer,
  Smartphone,
  Info,
  ExternalLink,
  ShieldAlert,
  Cpu,
  Camera,
  Layers,
  Fingerprint,
  Scan,
  Fence,
  Settings,
  Construction,
  Wrench,
  Columns3
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PublicClientPortalProps {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
}

const PublicClientPortal: React.FC<PublicClientPortalProps> = ({ workOrders, setWorkOrders }) => {
  const [view, setView] = useState<'HOME' | 'SUBMIT' | 'TRACK'>('HOME');
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<WorkOrder | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [recentTickets, setRecentTickets] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    requestType: 'SERVICE' as 'INSTALLATION' | 'SERVICE',
    clientName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    siteAddress: '',
    jobScope: JobScope.CCTV,
    description: ''
  });

  // Load recent tickets from local storage
  useEffect(() => {
    const saved = localStorage.getItem('sct_recent_tickets');
    if (saved) setRecentTickets(JSON.parse(saved));
  }, []);

  const generateWorkOrderId = () => {
    const existingIds = workOrders.map(wo => {
      const parts = wo.id.split('-');
      return parts.length === 3 ? parseInt(parts[2]) : 0;
    });
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const nextId = maxId + 1;
    return `SCT-WO-${String(nextId).padStart(4, '0')}`;
  };

  const saveToRecent = (id: string) => {
    const updated = [id, ...recentTickets.filter(t => t !== id)].slice(0, 3);
    setRecentTickets(updated);
    localStorage.setItem('sct_recent_tickets', JSON.stringify(updated));
  };

  const handleSearch = (idToSearch?: string) => {
    const query = idToSearch || searchId;
    const order = workOrders.find(wo => wo.id.toUpperCase() === query.trim().toUpperCase());
    setTrackedOrder(order || null);
    if (order) {
      setView('TRACK');
      setSearchId(order.id);
    } else if (!idToSearch) {
      alert("Work order ID not found. Please verify the number.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newId = generateWorkOrderId();
      const typeLabel = formData.requestType === 'INSTALLATION' ? '[NEW INSTALLATION]' : '[MAINTENANCE/REPAIR]';
      
      const order: WorkOrder = {
        id: newId,
        clientName: formData.clientName,
        clientAddress: formData.siteAddress,
        clientContact: formData.mobile,
        clientEmail: formData.email,
        jobScope: formData.jobScope,
        priority: WorkOrderPriority.STANDARD,
        description: `${typeLabel} ${formData.description}`,
        status: WorkOrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        source: 'CLIENT_PORTAL',
        trackingLogs: []
      };

      setWorkOrders([order, ...workOrders]);
      setSubmittedId(newId);
      saveToRecent(newId);
      setLoading(false);
      setFormData({
        requestType: 'SERVICE',
        clientName: '',
        contactPerson: '',
        mobile: '',
        email: '',
        siteAddress: '',
        jobScope: JobScope.CCTV,
        description: ''
      });
    }, 1500);
  };

  const openForm = (type: 'INSTALLATION' | 'SERVICE') => {
    setFormData({ ...formData, requestType: type });
    setView('SUBMIT');
  };

  const getScopeIcon = (scope: JobScope) => {
    switch (scope) {
      case JobScope.CCTV: return <Camera size={24} />;
      case JobScope.CARD_ACCESS: return <Layers size={24} />;
      case JobScope.INTERCOM: return <Smartphone size={24} />;
      case JobScope.BIOMETRICS: return <Fingerprint size={24} />;
      case JobScope.ANPR: return <Scan size={24} />;
      case JobScope.BARRIER: return <Columns3 size={24} />;
      default: return <Settings size={24} />;
    }
  };

  if (submittedId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl p-12 text-center animate-in zoom-in-95 duration-500 border border-slate-100">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
            <Check size={48} strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Success!</h2>
          <p className="text-slate-500 font-medium mt-3">Work order created for Smart City Technologies.</p>
          
          <div className="mt-10 p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Confirmation ID</p>
              <p className="text-4xl font-black font-mono tracking-tighter">{submittedId}</p>
              <p className="text-[10px] text-slate-400 mt-4 font-bold flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                Logged in central operations queue
              </p>
            </div>
            <Cpu className="absolute -bottom-4 -right-4 text-white/5" size={120} />
          </div>

          <div className="mt-12 flex flex-col gap-3">
             <button 
               onClick={() => { setSubmittedId(null); handleSearch(submittedId); }}
               className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
             >
               View Live Progress
             </button>
             <button 
               onClick={() => window.print()}
               className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
             >
               <Printer size={16} /> Print Confirmation
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div onClick={() => setView('HOME')} className="flex items-center gap-4 cursor-pointer">
           <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
             <ShieldCheck size={28} className="text-white" />
           </div>
           <div>
             <span className="text-2xl font-black tracking-tighter block leading-none">SCTWMS</span>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Portal</span>
           </div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Staff Access</Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
            <Info size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 lg:p-12 items-center">
        {view === 'HOME' && (
          <div className="w-full max-w-5xl space-y-12 animate-in fade-in duration-700">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">How can we assist you today?</h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Connect with our technical operations team for site maintenance and emergency system repairs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="group bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col justify-between hover:border-blue-200 transition-all">
                  <div>
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                      <Plus size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Request Service</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      Lodge a new work order for CCTV, Access Control, or other systems. Our dispatch team reviews all requests within 15 minutes.
                    </p>
                  </div>
                  <div className="mt-12 flex flex-col gap-3">
                    <button 
                      onClick={() => openForm('INSTALLATION')}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg"
                    >
                      Request New/Additional Installation <Construction size={18} />
                    </button>
                    <button 
                      onClick={() => openForm('SERVICE')}
                      className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                    >
                      Lodge New Fault <ChevronRight size={18} />
                    </button>
                  </div>
               </div>

               <div className="group bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/10 text-blue-400 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                      <Search size={40} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-4">Track Status</h2>
                    <p className="text-slate-400 font-medium leading-relaxed">
                      Enter your SCT work order ID (e.g., SCT-WO-XXXX) to view live technician tracking, completion reports, and invoices.
                    </p>
                  </div>
                  <div className="mt-12 space-y-4 relative z-10">
                    {recentTickets.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {recentTickets.map(id => (
                          <button 
                            key={id} 
                            onClick={() => handleSearch(id)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-black font-mono transition-all"
                          >
                            {id}
                          </button>
                        ))}
                      </div>
                    )}
                    <button 
                      onClick={() => setView('TRACK')}
                      className="w-full py-6 bg-white/10 hover:bg-white/20 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all border border-white/10 backdrop-blur-sm"
                    >
                      Lookup Existing ID <ChevronRight size={18} />
                    </button>
                  </div>
                  <Cpu className="absolute -bottom-10 -right-10 text-white/[0.03]" size={300} />
               </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <LifeBuoy size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Urgent Assistance?</p>
                  <p className="text-xs text-slate-500 font-medium">Speak directly to our duty operations manager.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a href="tel:63340543" className="px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">6334 0543</a>
                <a href="https://wa.me/80458281" target="_blank" className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2">WhatsApp</a>
              </div>
            </div>
          </div>
        )}

        {view === 'SUBMIT' && (
          <div className="w-full max-w-4xl bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className="p-12 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <button onClick={() => setView('HOME')} className="p-4 bg-white text-slate-400 hover:text-slate-900 rounded-3xl shadow-sm transition-all hover:scale-105">
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Lodge Request</h2>
                    <p className="text-sm text-slate-500 font-medium mt-2">New Site Work Order Submission</p>
                  </div>
               </div>
               <div className="hidden sm:block">
                  <HelpCircle className="text-slate-300" size={32} />
               </div>
            </div>

            <form onSubmit={handleSubmit} className="p-12 space-y-10">
               <div className="space-y-10">
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                       <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                       <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Service Classification</p>
                     </div>
                     <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, requestType: 'INSTALLATION'})}
                          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            formData.requestType === 'INSTALLATION' 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Construction size={18} /> New Install
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, requestType: 'SERVICE'})}
                          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            formData.requestType === 'SERVICE' 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Wrench size={18} /> Repair/Maint
                        </button>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Customer Entity Info</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company / Building Name</label>
                          <div className="relative group">
                            <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input required className="w-full pl-14 pr-4 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold placeholder:text-slate-300" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="e.g. Capitaland (Raffles)" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Person (On-Site)</label>
                          <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input required className="w-full pl-14 pr-4 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold placeholder:text-slate-300" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} placeholder="Full Name" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Hotline</label>
                          <div className="relative group">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input required className="w-full pl-14 pr-4 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold placeholder:text-slate-300" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="+65 XXXX XXXX" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                          <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input required type="email" className="w-full pl-14 pr-4 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold placeholder:text-slate-300" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="billing@domain.com" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Site Address</label>
                       <div className="relative group">
                          <MapPin className="absolute left-5 top-6 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                          <textarea required rows={2} className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:border-blue-500 transition-all outline-none text-sm font-bold resize-none placeholder:text-slate-300" value={formData.siteAddress} onChange={e => setFormData({...formData, siteAddress: e.target.value})} placeholder="Exact block and level for technical arrival..." />
                       </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100"></div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Select System Modality</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {JOB_SCOPES.map(scope => (
                         <button 
                           key={scope}
                           type="button"
                           onClick={() => setFormData({...formData, jobScope: scope})}
                           className={`p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border-2 transition-all flex flex-col items-center justify-center gap-5 text-center min-h-[160px] ${
                             formData.jobScope === scope 
                             ? 'bg-blue-600 border-blue-600 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] scale-105 z-10' 
                             : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:bg-blue-50/30'
                           }`}
                         >
                           <div className={`p-4 rounded-2xl transition-colors ${formData.jobScope === scope ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                              {getScopeIcon(scope)}
                           </div>
                           <span className={formData.jobScope === scope ? 'text-white' : 'text-slate-700'}>{scope}</span>
                         </button>
                       ))}
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requirement Details</label>
                       <textarea 
                         required 
                         rows={4} 
                         className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:border-blue-500 transition-all outline-none text-sm font-bold resize-none placeholder:text-slate-300" 
                         value={formData.description} 
                         onChange={e => setFormData({...formData, description: e.target.value})} 
                         placeholder={formData.requestType === 'INSTALLATION' ? "Describe your site setup or equipment requirements..." : "Describe the technical error or maintenance requirement..."}
                       />
                    </div>
                  </div>
               </div>

               <div className="pt-6">
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-4"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Submit Technical Request</>}
                 </button>
                 <div className="mt-6 flex items-center gap-3 justify-center text-slate-400">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">Secure Data Channel Activated</p>
                 </div>
               </div>
            </form>
          </div>
        )}

        {view === 'TRACK' && (
          <div className="w-full max-w-2xl space-y-8 animate-in slide-in-from-bottom-12 duration-500">
             <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-12 bg-slate-50/50 border-b border-slate-100 flex items-center gap-6">
                  <button onClick={() => { setView('HOME'); setTrackedOrder(null); }} className="p-4 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm transition-all hover:scale-105">
                    <ArrowLeft size={24} />
                  </button>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Track Your Order</h2>
                </div>

                <div className="p-12 space-y-10">
                   <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-3">
                      <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={24} />
                        <input 
                          required
                          className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-lg font-black font-mono tracking-tighter placeholder:font-sans placeholder:font-normal placeholder:tracking-normal" 
                          placeholder="SCT-WO-XXXX" 
                          value={searchId}
                          onChange={e => setSearchId(e.target.value.toUpperCase())}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                      >
                        Lookup
                      </button>
                   </form>

                   {trackedOrder ? (
                     <div className="animate-in fade-in slide-in-from-top-6 duration-700 space-y-10">
                        <div className="p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-blue-900/10">
                           <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-6">
                              <div>
                                 <span className="text-[10px] font-black text-blue-400 bg-white/5 px-3 py-1.5 rounded-xl mb-4 inline-block uppercase tracking-widest border border-white/5 font-mono">{trackedOrder.id}</span>
                                 <h3 className="text-3xl font-black">{trackedOrder.jobScope}</h3>
                                 <p className="text-sm text-slate-400 mt-2 font-bold flex items-center gap-2">
                                    <Building2 size={16} /> {trackedOrder.clientName}
                                 </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                                  trackedOrder.status === WorkOrderStatus.PENDING ? 'bg-amber-500 text-white' :
                                  trackedOrder.status === WorkOrderStatus.ASSIGNED ? 'bg-blue-600 text-white' :
                                  'bg-emerald-500 text-white'
                                }`}>
                                  {trackedOrder.status}
                                </span>
                                <p className="text-[10px] text-slate-500 mt-4 font-black uppercase tracking-widest">Logged: {new Date(trackedOrder.createdAt).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <Cpu className="absolute -bottom-10 -right-10 text-white/[0.03]" size={200} />
                        </div>

                        <div className="px-6 space-y-12">
                           <div className="relative">
                             <div className="absolute top-3 left-0 w-full h-1 bg-slate-100 rounded-full" />
                             <div className={`absolute top-3 left-0 h-1 bg-blue-600 rounded-full transition-all duration-1000 ${
                               trackedOrder.status === WorkOrderStatus.PENDING ? 'w-[16.6%]' : 
                               trackedOrder.status === WorkOrderStatus.ASSIGNED ? 'w-[50%]' : 
                               'w-full'
                             }`} />
                             
                             <div className="relative flex justify-between">
                                <TrackStep label="Logged" active={true} />
                                <TrackStep label="Dispatch" active={trackedOrder.status !== WorkOrderStatus.PENDING} />
                                <TrackStep label="Resolved" active={trackedOrder.status === WorkOrderStatus.COMPLETED || trackedOrder.status === WorkOrderStatus.INVOICED} />
                             </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
                                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <User size={14} /> Assigned Technician
                                 </p>
                                 {trackedOrder.assignedTechnician ? (
                                   <div className="flex items-center gap-4">
                                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-sm border border-blue-100 text-xl">
                                         {trackedOrder.assignedTechnician.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="text-lg font-black text-slate-900 leading-none">{trackedOrder.assignedTechnician}</p>
                                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Field Professional</p>
                                      </div>
                                   </div>
                                 ) : (
                                   <p className="text-sm font-bold text-slate-400 italic">Technician pending dispatch...</p>
                                 )}
                              </div>

                              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <History size={14} /> Action Logs
                                 </p>
                                 <div className="space-y-4">
                                    <TimelineItem label="Order Registered" date={new Date(trackedOrder.createdAt).toLocaleTimeString()} active={true} />
                                    {trackedOrder.checkInTime && <TimelineItem label="Staff On-Site" date={new Date(trackedOrder.checkInTime).toLocaleTimeString()} active={true} />}
                                    {trackedOrder.checkOutTime && <TimelineItem label="Service Complete" date={new Date(trackedOrder.checkOutTime).toLocaleTimeString()} active={true} />}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                           <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                              <ExternalLink size={16} /> Download Service Cert
                           </button>
                           <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                              <Printer size={16} /> Print Status
                           </button>
                        </div>
                     </div>
                   ) : searchId && (
                     <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                           <ShieldAlert className="text-slate-200" size={40} />
                        </div>
                        <p className="text-lg font-black text-slate-900 tracking-tight">Record Not Found</p>
                        <p className="text-sm font-medium text-slate-400 mt-2">Please double check your work order number.</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </main>

      <footer className="p-12 text-center border-t border-slate-100 mt-12">
         <div className="flex flex-col items-center gap-4">
            <div className="bg-slate-900 p-2 rounded-lg">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em]">SMART CITY TECHNOLOGIES PTE LTD</p>
            <p className="text-[9px] text-slate-300 font-medium uppercase tracking-[0.1em]">Singapore Registration: 2024XXXXXZ • Precision Security Engineering</p>
         </div>
      </footer>
    </div>
  );
};

const TrackStep = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex flex-col items-center gap-3">
    <div className={`w-6 h-6 rounded-full border-[6px] transition-all duration-700 ${
      active ? 'bg-blue-600 border-white ring-8 ring-blue-50 scale-125' : 'bg-slate-200 border-white'
    }`} />
    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-blue-900' : 'text-slate-400'}`}>{label}</span>
  </div>
);

const TimelineItem = ({ label, date, active }: { label: string, date: string, active: boolean }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
       <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-200'}`} />
       <p className="text-xs font-bold text-slate-700">{label}</p>
    </div>
    <span className="text-[10px] font-mono text-slate-400">{date}</span>
  </div>
);

export default PublicClientPortal;
