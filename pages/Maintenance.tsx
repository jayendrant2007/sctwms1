
import React, { useState } from 'react';
import { MaintenanceContract, Client, JobScope, MaintenanceFrequency, WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../types';
import { JOB_SCOPES } from '../constants';
import { 
  CalendarClock, 
  Plus, 
  RefreshCw, 
  Search, 
  Building, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  X,
  CreditCard,
  History,
  Clock
} from 'lucide-react';

interface MaintenanceProps {
  contracts: MaintenanceContract[];
  setContracts: React.Dispatch<React.SetStateAction<MaintenanceContract[]>>;
  clients: Client[];
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
}

const Maintenance: React.FC<MaintenanceProps> = ({ contracts, setContracts, clients, workOrders, setWorkOrders }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newContract, setNewContract] = useState<Partial<MaintenanceContract>>({
    clientId: '',
    jobScope: JobScope.CCTV,
    frequency: MaintenanceFrequency.QUARTERLY,
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    contractValue: 0
  });

  const handleAddContract = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === newContract.clientId);
    if (!client) return;

    const contract: MaintenanceContract = {
      id: `MC-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: client.id,
      clientName: client.name,
      jobScope: newContract.jobScope as JobScope,
      frequency: newContract.frequency as MaintenanceFrequency,
      description: newContract.description || '',
      startDate: newContract.startDate!,
      nextServiceDate: newContract.startDate!,
      status: 'ACTIVE',
      contractValue: newContract.contractValue || 0
    };

    setContracts([contract, ...contracts]);
    setShowAddModal(false);
  };

  const syncSchedules = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const today = new Date();
    const newOrders: WorkOrder[] = [];
    
    const updatedContracts = contracts.map(contract => {
      const nextDate = new Date(contract.nextServiceDate);
      
      if (nextDate <= today && contract.status === 'ACTIVE') {
        const client = clients.find(c => c.id === contract.clientId);
        if (client) {
          const wo: WorkOrder = {
            id: `MWO-${Date.now()}-${Math.floor(Math.random() * 100)}`,
            clientId: client.id,
            clientName: client.name,
            clientAddress: client.address,
            clientContact: client.phone,
            clientEmail: client.email,
            jobScope: contract.jobScope,
            // Added required priority property
            priority: WorkOrderPriority.STANDARD,
            description: `[RECURRING MAINTENANCE] ${contract.description}`,
            status: WorkOrderStatus.PENDING,
            createdAt: today.toISOString(),
            source: 'MAINTENANCE',
            contractId: contract.id
          };
          newOrders.push(wo);

          // Update next service date based on frequency
          const updatedNextDate = new Date(nextDate);
          if (contract.frequency === MaintenanceFrequency.MONTHLY) updatedNextDate.setMonth(nextDate.getMonth() + 1);
          if (contract.frequency === MaintenanceFrequency.QUARTERLY) updatedNextDate.setMonth(nextDate.getMonth() + 3);
          if (contract.frequency === MaintenanceFrequency.BI_ANNUALLY) updatedNextDate.setMonth(nextDate.getMonth() + 6);
          if (contract.frequency === MaintenanceFrequency.ANNUALLY) updatedNextDate.setFullYear(nextDate.getFullYear() + 1);

          return { ...contract, nextServiceDate: updatedNextDate.toISOString().split('T')[0] };
        }
      }
      return contract;
    });

    if (newOrders.length > 0) {
      setWorkOrders([...newOrders, ...workOrders]);
      setContracts(updatedContracts);
      alert(`${newOrders.length} maintenance work orders have been generated.`);
    } else {
      alert("No schedules due for generation at this time.");
    }
    
    setSyncing(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Maintenance Contracts</h2>
          <p className="text-sm text-slate-500 font-medium">Manage recurring service level agreements (SLA)</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={syncSchedules}
            disabled={syncing}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Schedules'}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100"
          >
            <Plus size={20} />
            New Contract
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contract Info</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Due</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contracts.map(contract => (
                    <tr key={contract.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Building size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">{contract.clientName}</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">{contract.jobScope}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full tracking-widest">
                          <Clock size={12} />
                          {contract.frequency}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <p className={`text-xs font-bold ${
                             new Date(contract.nextServiceDate) <= new Date() ? 'text-red-500' : 'text-slate-700'
                           }`}>
                             {new Date(contract.nextServiceDate).toLocaleDateString()}
                           </p>
                           {new Date(contract.nextServiceDate) <= new Date() && <AlertCircle size={14} className="text-red-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-mono font-bold text-sm text-slate-900">
                        ${contract.contractValue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No maintenance contracts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xl font-bold mb-2">Scheduling Insights</h3>
               <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                 Recurring orders reduce manual entry and ensure your clients never miss critical safety inspections.
               </p>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                   <span className="text-sm font-medium">Contracts Active</span>
                   <span className="text-xl font-black">{contracts.filter(c => c.status === 'ACTIVE').length}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                   <span className="text-sm font-medium">Tasks Due Today</span>
                   <span className="text-xl font-black text-amber-300">
                     {contracts.filter(c => new Date(c.nextServiceDate) <= new Date()).length}
                   </span>
                 </div>
               </div>
             </div>
             <CalendarClock className="absolute -bottom-6 -right-6 text-white/5" size={120} />
           </div>

           <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
             <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
               <History size={18} className="text-blue-500" />
               Recent Generation Log
             </h4>
             <div className="space-y-3">
               {workOrders.filter(wo => wo.source === 'MAINTENANCE').slice(0, 3).map(wo => (
                 <div key={wo.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                   <div className="min-w-0">
                     <p className="text-xs font-bold text-slate-800 truncate">{wo.clientName}</p>
                     <p className="text-[10px] text-slate-500 font-mono uppercase">{wo.id}</p>
                   </div>
                   <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                 </div>
               ))}
               {workOrders.filter(wo => wo.source === 'MAINTENANCE').length === 0 && (
                 <p className="text-[10px] text-slate-400 italic">No automated orders generated yet.</p>
               )}
             </div>
           </div>
        </div>
      </div>

      {/* New Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">New Maintenance SLA</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddContract} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Client Partnership</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                    value={newContract.clientId}
                    onChange={e => setNewContract({...newContract, clientId: e.target.value})}
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Job Scope</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                    value={newContract.jobScope}
                    onChange={e => setNewContract({...newContract, jobScope: e.target.value as JobScope})}
                  >
                    {JOB_SCOPES.map(scope => <option key={scope} value={scope}>{scope}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Recurrence</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                    value={newContract.frequency}
                    onChange={e => setNewContract({...newContract, frequency: e.target.value as MaintenanceFrequency})}
                  >
                    {Object.values(MaintenanceFrequency).map(freq => <option key={freq} value={freq}>{freq}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold"
                    value={newContract.startDate}
                    onChange={e => setNewContract({...newContract, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Value per Visit (SGD)</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold"
                      value={newContract.contractValue}
                      onChange={e => setNewContract({...newContract, contractValue: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Service Description / SLA Terms</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm resize-none"
                    placeholder="Details of the recurring task..."
                    value={newContract.description}
                    onChange={e => setNewContract({...newContract, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-50 uppercase tracking-widest text-sm">
                  Register Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;