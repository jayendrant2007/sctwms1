
import React, { useState } from 'react';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, ServiceReport, Invoice, AuthUser, JobScope, MaintenanceContract } from '../types';
import { JOB_SCOPES } from '../constants';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  Plus, 
  LifeBuoy, 
  Search, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  History,
  Timer,
  Navigation,
  Loader2,
  X,
  FileText,
  CalendarClock,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Check,
  Zap,
  Wrench,
  Construction,
  Camera,
  Layers,
  Smartphone,
  Fingerprint,
  Scan,
  Columns3,
  Settings
} from 'lucide-react';

interface ClientPortalProps {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  reports: ServiceReport[];
  invoices: Invoice[];
  authUser: AuthUser;
  contracts: MaintenanceContract[];
}

const ClientPortal: React.FC<ClientPortalProps> = ({ workOrders, setWorkOrders, reports, invoices, authUser, contracts }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newRequest, setNewRequest] = useState({
    requestType: 'SERVICE' as 'INSTALLATION' | 'SERVICE',
    jobScope: JobScope.CCTV,
    description: ''
  });

  // Filter client data
  const myWorkOrders = workOrders.filter(wo => wo.clientEmail === authUser.email || wo.clientId === authUser.id);
  const myReports = reports.filter(r => myWorkOrders.some(wo => wo.id === r.workOrderId));
  const myInvoices = invoices.filter(inv => myWorkOrders.some(wo => wo.id === inv.workOrderId));
  const myContracts = contracts.filter(c => c.clientId === authUser.id);

  const activeJobs = myWorkOrders.filter(wo => 
    wo.status !== WorkOrderStatus.COMPLETED && 
    wo.status !== WorkOrderStatus.INVOICED && 
    wo.status !== WorkOrderStatus.CANCELLED
  );

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const typeLabel = newRequest.requestType === 'INSTALLATION' ? '[NEW INSTALLATION]' : '[MAINTENANCE/REPAIR]';
      const order: WorkOrder = {
        id: `REQ-${Date.now().toString().slice(-6)}`,
        clientId: authUser.id,
        clientName: authUser.name,
        clientAddress: "Referenced Site Location",
        clientContact: "Primary Representative",
        clientEmail: authUser.email,
        jobScope: newRequest.jobScope,
        priority: WorkOrderPriority.STANDARD,
        description: `${typeLabel} ${newRequest.description}`,
        status: WorkOrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        source: 'CLIENT_PORTAL',
        trackingLogs: []
      };

      setWorkOrders([order, ...workOrders]);
      setLoading(false);
      setShowRequestModal(false);
      setNewRequest({ requestType: 'SERVICE', jobScope: JobScope.CCTV, description: '' });
    }, 1000);
  };

  const getScopeIcon = (scope: JobScope) => {
    switch (scope) {
      case JobScope.CCTV: return <Camera size={24} />;
      case JobScope.CARD_ACCESS: return <Layers size={24} />;
      // Fixed: Added missing Smartphone icon for INTERCOM scope
      case JobScope.INTERCOM: return <Smartphone size={24} />;
      case JobScope.BIOMETRICS: return <Fingerprint size={24} />;
      case JobScope.ANPR: return <Scan size={24} />;
      case JobScope.BARRIER: return <Columns3 size={24} />;
      default: return <Settings size={24} />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, {authUser.name.split(' ')[0]}</h2>
          <p className="text-slate-500 font-medium mt-1">Smart City Technologies Operational Dashboard</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 font-black uppercase tracking-widest text-xs"
        >
          <Plus size={20} />
          New Service Request
        </button>
      </header>

      {/* High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="relative z-10">
             <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                 <ClipboardList size={28} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Requests</p>
             </div>
             <p className="text-4xl font-black text-slate-900">{activeJobs.length}</p>
           </div>
           <div className="absolute -bottom-6 -right-6 text-slate-50 opacity-50 group-hover:text-blue-50 transition-colors">
              <Timer size={120} />
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="relative z-10">
             <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                 <CheckCircle2 size={28} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SLA Health</p>
             </div>
             <p className="text-4xl font-black text-slate-900">{myContracts.length > 0 ? '100%' : 'N/A'}</p>
           </div>
           <div className="absolute -bottom-6 -right-6 text-slate-50 opacity-50 group-hover:text-emerald-50 transition-colors">
              <ShieldCheck size={120} />
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="relative z-10">
             <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                 <Receipt size={28} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoiced Total</p>
             </div>
             <p className="text-4xl font-black text-slate-900">${myInvoices.reduce((a, b) => a + b.totalAmount, 0).toLocaleString()}</p>
           </div>
           <div className="absolute -bottom-6 -right-6 text-slate-50 opacity-50 group-hover:text-indigo-50 transition-colors">
              <Receipt size={120} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-10">
           <section className="space-y-6">
             <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Live Deployment Status</h3>
               </div>
               <Navigation size={18} className="text-blue-400" />
             </div>

             {activeJobs.length === 0 ? (
               <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-200 text-center">
                 <LifeBuoy className="mx-auto text-slate-200 mb-4" size={48} />
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Active Service Threads</p>
                 <p className="text-xs text-slate-400 mt-2">Our technical team is standing by if you require assistance.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {activeJobs.map(job => (
                   <div key={job.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
                      <div className="flex justify-between items-start mb-8">
                         <div>
                           <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl mb-3 inline-block uppercase tracking-widest">{job.id}</span>
                           <h4 className="text-2xl font-black text-slate-900 leading-none">{job.jobScope}</h4>
                           <p className="text-xs text-slate-400 mt-2 font-bold flex items-center gap-2">
                              <History size={14} /> Created: {new Date(job.createdAt).toLocaleDateString()}
                           </p>
                         </div>
                         <div className="flex flex-col items-end">
                           <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                             job.status === WorkOrderStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                             'bg-blue-100 text-blue-700'
                           }`}>
                             {job.status}
                           </span>
                           {job.checkInTime && (
                             <p className="text-[10px] text-emerald-600 font-black mt-2 uppercase tracking-tighter flex items-center gap-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                               Staff On-Site
                             </p>
                           )}
                         </div>
                      </div>

                      <div className="relative pt-10 pb-6 px-4">
                         <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                         <div className={`absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full transition-all duration-1000 ${
                           job.status === WorkOrderStatus.PENDING ? 'w-[12.5%]' : 
                           job.status === WorkOrderStatus.ASSIGNED ? 'w-[37.5%]' : 
                           'w-full'
                         }`} />
                         
                         <div className="relative flex justify-between">
                            <StatusDot label="Logged" active={true} />
                            <StatusDot label="Dispatch" active={job.status !== WorkOrderStatus.PENDING} />
                            <StatusDot label="Service" active={job.status === WorkOrderStatus.ASSIGNED && !!job.checkInTime} />
                            <StatusDot label="Review" active={false} />
                         </div>
                      </div>

                      <div className="mt-8 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <ShieldAlert size={14} className="text-blue-500" /> Site Instructions
                         </p>
                         <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{job.description}"</p>
                      </div>
                   </div>
                 ))}
               </div>
             )}
           </section>

           <section className="space-y-6">
             <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">SLA Maintenance Schedules</h3>
             </div>
             
             {myContracts.length === 0 ? (
                <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 text-center">
                  <p className="text-sm text-emerald-800 font-bold opacity-60 italic">No active maintenance contracts found.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myContracts.map(contract => (
                    <div key={contract.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                             <CalendarClock size={28} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{contract.frequency} CYCLE</p>
                             <p className="text-lg font-black text-slate-900 leading-tight mt-1">{contract.jobScope}</p>
                             <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1.5">
                                <Clock size={12} /> Next: {new Date(contract.nextServiceDate).toLocaleDateString()}
                             </p>
                          </div>
                       </div>
                       <ChevronRight size={20} className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
             )}
           </section>
        </div>

        <div className="lg:col-span-2 space-y-10">
           <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Service Documentation</h3>
                </div>
                <FileText size={18} className="text-slate-300" />
              </div>
              
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                {myReports.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm font-bold text-slate-400 italic">No reports available yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {myReports.slice(0, 5).map(report => (
                      <div key={report.id} className="p-6 hover:bg-slate-50/50 transition-colors group cursor-pointer flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center font-black shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                               <Check size={20} strokeWidth={3} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.workOrderId}</p>
                               <p className="text-sm font-black text-slate-800 mt-0.5">Job Completion Certificate</p>
                               <p className="text-[10px] text-slate-500 font-bold mt-1">Verified {new Date(report.completionDate).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl group-hover:text-blue-600 group-hover:border-blue-100 transition-all shadow-sm">
                            <ExternalLink size={16} />
                         </button>
                      </div>
                    ))}
                  </div>
                )}
                {myReports.length > 5 && (
                  <button className="w-full py-5 bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-colors border-t border-slate-100 flex items-center justify-center gap-2">
                     View All Records <ArrowRight size={14} />
                  </button>
                )}
              </div>
           </section>

           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/50">
                       <LifeBuoy size={32} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-widest leading-none text-sm">Command Center</h3>
                       <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mt-2">24/7 Technical Liaison</p>
                    </div>
                 </div>
                 <p className="text-sm text-slate-400 leading-relaxed mb-10 font-medium">
                   Need immediate site response or technical guidance? Connect with our dedicated operations coordinator.
                 </p>
                 <div className="space-y-4">
                    <a href="tel:63340543" className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase">Emergency Hotline</p>
                          <p className="text-lg font-black font-mono">6334 0543</p>
                       </div>
                       <ChevronRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </a>
                    <a href="mailto:services@smartcitytechnologies.com.sg" className="block w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-center text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/40">
                      Open Support Ticket
                    </a>
                 </div>
              </div>
              <ShieldCheck className="absolute -bottom-10 -right-10 text-white/[0.03]" size={240} />
           </div>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-12 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Technical Liaison</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Specify site fault or requirement</p>
                 </div>
                 <button onClick={() => setShowRequestModal(false)} className="p-4 bg-white text-slate-400 hover:text-slate-600 rounded-3xl shadow-sm transition-all">
                    <X size={24} />
                 </button>
              </div>
              <form onSubmit={handleSubmitRequest} className="p-12 space-y-10">
                 <div className="space-y-10">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Classification</label>
                       <div className="flex p-1 bg-slate-100 rounded-2xl">
                          <button 
                            type="button"
                            onClick={() => setNewRequest({...newRequest, requestType: 'INSTALLATION'})}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                              newRequest.requestType === 'INSTALLATION' 
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            <Construction size={16} /> New Install
                          </button>
                          <button 
                            type="button"
                            onClick={() => setNewRequest({...newRequest, requestType: 'SERVICE'})}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                              newRequest.requestType === 'SERVICE' 
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            <Wrench size={16} /> Repair/Maint
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                         <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                         <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Select System Modality</p>
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                         {JOB_SCOPES.map(scope => (
                           <button 
                             key={scope}
                             type="button"
                             onClick={() => setNewRequest({...newRequest, jobScope: scope})}
                             className={`p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border-2 transition-all flex flex-col items-center justify-center gap-5 text-center min-h-[160px] ${
                               newRequest.jobScope === scope 
                               ? 'bg-blue-600 border-blue-600 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] scale-105 z-10' 
                               : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:bg-blue-50/30'
                             }`}
                           >
                             <div className={`p-4 rounded-2xl transition-colors ${newRequest.jobScope === scope ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                {getScopeIcon(scope)}
                             </div>
                             <span className={newRequest.jobScope === scope ? 'text-white' : 'text-slate-700'}>{scope}</span>
                           </button>
                         ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requirement Details</label>
                       <textarea 
                         required
                         rows={4}
                         className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-blue-500 transition-all outline-none text-sm font-bold resize-none"
                         placeholder={newRequest.requestType === 'INSTALLATION' ? "Describe your site setup requirements..." : "Detail the issue for our technical unit..."}
                         value={newRequest.description}
                         onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                    <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
                    <p className="text-xs text-blue-700 font-bold leading-relaxed">
                      Lodge will alert SCT operations for immediate technician dispatch review.
                    </p>
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 disabled:opacity-50"
                 >
                    {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Provision Job Thread</>}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const StatusDot = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex flex-col items-center gap-3">
    <div className={`w-5 h-5 rounded-full border-[5px] transition-all duration-700 ${
      active ? 'bg-blue-600 border-white ring-8 ring-blue-50 scale-125' : 'bg-slate-200 border-white'
    }`} />
    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-blue-900' : 'text-slate-400'}`}>{label}</span>
  </div>
);

export default ClientPortal;
