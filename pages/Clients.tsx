
import React, { useState } from 'react';
import { Client, WorkOrder, Invoice, WorkOrderStatus, UserRole } from '../types';
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Search, 
  MoreVertical, 
  History, 
  Receipt,
  X,
  ChevronRight,
  TrendingUp,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Globe,
  Briefcase,
  Fingerprint,
  Info,
  CalendarDays,
  FileText
} from 'lucide-react';

interface ClientsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  workOrders: WorkOrder[];
  invoices: Invoice[];
}

const Clients: React.FC<ClientsProps> = ({ clients, setClients, workOrders, invoices }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    industry: '',
    uen: '',
    gstRegistered: true
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientWorkOrders = workOrders.filter(wo => wo.clientId === selectedClientId || wo.clientName === selectedClient?.name);
  const clientInvoices = invoices.filter(inv => inv.clientId === selectedClientId || clientWorkOrders.some(wo => wo.id === inv.workOrderId));

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;

    const client: Client = {
      id: `C${Date.now()}`,
      name: newClient.name!,
      address: newClient.address || '',
      phone: newClient.phone || '',
      email: newClient.email || '',
      contactPerson: newClient.contactPerson || '',
      industry: newClient.industry,
      uen: newClient.uen,
      gstRegistered: newClient.gstRegistered,
      createdAt: new Date().toISOString(),
      role: UserRole.CLIENT
    };

    setClients([...clients, client]);
    setShowAddModal(false);
    setNewClient({ name: '', address: '', phone: '', email: '', contactPerson: '', industry: '', uen: '', gstRegistered: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Portfolio Management</h2>
          <p className="text-slate-500 font-medium mt-2">Managing {clients.length} corporate partnerships and entities</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100"
        >
          <Plus size={18} />
          Onboard New Account
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Client List */}
        <div className="xl:col-span-1 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, email, industry..."
              className="w-full pl-14 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm font-bold text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredClients.map(client => (
              <div 
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`group p-6 bg-white rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden ${
                  selectedClientId === client.id 
                  ? 'border-blue-600 ring-4 ring-blue-50 shadow-xl' 
                  : 'border-slate-100 hover:border-blue-200 hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner transition-colors ${
                    selectedClientId === client.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                  }`}>
                    <Building size={28} />
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${client.gstRegistered ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                    {client.gstRegistered ? 'GST Reg' : 'Non-GST'}
                  </div>
                </div>
                
                <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors mb-1 relative z-10">{client.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 relative z-10">
                  <Briefcase size={12} className="text-slate-300" />
                  {client.industry || 'General Services'}
                </p>

                <div className="space-y-2 pt-4 border-t border-slate-50 text-[11px] font-bold text-slate-500 relative z-10">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-300" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-300" />
                    <span>{client.contactPerson}</span>
                  </div>
                </div>
                {selectedClientId === client.id && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Client Detail Panel */}
        <div className="xl:col-span-2">
          {selectedClient ? (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden sticky top-8 animate-in slide-in-from-right-12 duration-500">
              {/* Profile Header */}
              <div className="p-12 bg-slate-900 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center border-4 border-white/5 backdrop-blur-sm">
                      <Building size={48} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-4xl font-black tracking-tight">{selectedClient.name}</h3>
                        <ShieldCheck className="text-emerald-400" size={32} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5"><MapPin size={16} /> {selectedClient.address}</span>
                        <div className="h-4 w-px bg-white/20"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-blue-400">Account #{selectedClient.id}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedClientId(null)} className="p-4 bg-white/10 text-white/40 hover:text-white rounded-3xl transition-all hover:bg-white/20">
                    <X size={32} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 relative z-10">
                  <DetailStat label="Technical Requests" value={clientWorkOrders.length} color="text-blue-400" />
                  <DetailStat label="Maintenance SLA" value={workOrders.filter(w => (w.clientId === selectedClientId) && w.source === 'MAINTENANCE').length} color="text-emerald-400" />
                  <DetailStat label="Financial Volume" value={`$${clientInvoices.reduce((a, b) => a + b.totalAmount, 0).toLocaleString()}`} color="text-white" />
                  <DetailStat label="Outstanding Dues" value={clientInvoices.filter(i => i.status !== 'PAID').length} color="text-amber-400" />
                </div>
                <Globe className="absolute -bottom-20 -right-20 text-white/[0.03]" size={400} />
              </div>

              {/* Detail Content */}
              <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-12">
                   {/* Legal & Profile Section */}
                   <section className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                         <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Entity Governance</h4>
                      </div>
                      <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 grid grid-cols-1 gap-6">
                         <DetailField icon={Fingerprint} label="Unique Entity Number (UEN)" value={selectedClient.uen || 'Not Provided'} />
                         <DetailField icon={Briefcase} label="Sector / Industry" value={selectedClient.industry || 'SME'} />
                         <DetailField icon={ShieldCheck} label="Taxation Compliance" value={selectedClient.gstRegistered ? 'GST Registered Entity' : 'Exempt / Non-GST'} />
                         <DetailField icon={User} label="Primary Stakeholder" value={selectedClient.contactPerson} />
                         <DetailField icon={CalendarDays} label="Onboarded Period" value={new Date(selectedClient.createdAt).toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })} />
                      </div>
                   </section>

                   {/* Billing History */}
                   <section className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                         <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Financial History</h4>
                      </div>
                      <div className="space-y-3">
                        {clientInvoices.length === 0 ? (
                          <div className="p-12 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                            <Receipt size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Invoicing Records Found</p>
                          </div>
                        ) : (
                          clientInvoices.slice().reverse().map(inv => (
                            <div key={inv.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all group">
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                   <Receipt size={18} />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-900 uppercase">{inv.id}</p>
                                  <p className="text-[10px] text-slate-400 font-bold">{new Date(inv.invoiceDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-slate-900 font-mono">${inv.totalAmount.toFixed(2)}</p>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500'
                                }`}>
                                  {inv.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                   </section>
                </div>

                <div className="space-y-12">
                   {/* Site Log Section */}
                   <section className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                         <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Technical Ledger</h4>
                      </div>
                      <div className="space-y-6">
                        {clientWorkOrders.length === 0 ? (
                          <div className="p-12 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                            <History size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Deployment Activity</p>
                          </div>
                        ) : (
                          clientWorkOrders.slice(0, 8).map(wo => (
                            <div key={wo.id} className="relative pl-10 group">
                              <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white ring-4 transition-all ${
                                wo.status === WorkOrderStatus.COMPLETED ? 'bg-emerald-500 ring-emerald-50' : 'bg-blue-500 ring-blue-50 group-hover:scale-125'
                              }`} />
                              <div className="absolute left-1.5 top-5 bottom-0 w-px bg-slate-100 group-last:hidden" />
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-black text-slate-800 leading-none">{wo.jobScope}</p>
                                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">{wo.id}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{wo.description}</p>
                              <div className="mt-2 flex items-center gap-3">
                                 <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(wo.createdAt).toLocaleDateString()}</span>
                                 <div className="w-1 h-1 rounded-full bg-slate-200" />
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{wo.status}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                   </section>

                   <section className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="p-3 bg-white/20 rounded-2xl">
                              <Info size={24} />
                           </div>
                           <h4 className="text-xl font-black uppercase tracking-widest leading-none text-sm">Account Operations</h4>
                        </div>
                        <p className="text-xs text-blue-50 leading-relaxed mb-8 font-medium">
                          Managing this account requires administrative privileges. You can modify billing cycles or update technical SLAs from the Admin hub.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                           <button className="py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                              <ExternalLink size={16} /> Portal Link
                           </button>
                           <button className="py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                              <FileText size={16} /> Edit Data
                           </button>
                        </div>
                      </div>
                      <ShieldCheck className="absolute -bottom-10 -right-10 text-white/[0.05]" size={200} />
                   </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center flex flex-col items-center justify-center min-h-[600px]">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 mb-8 shadow-sm border border-slate-100">
                <Building size={48} />
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest mb-3">Portfolio Intel</h4>
              <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto leading-relaxed">Select a corporate entity from the directory to view complete technical history, site logs, and financial telemetry.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Onboard Entity</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Register new technical partnership</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-4 bg-white text-slate-400 hover:text-slate-600 rounded-3xl shadow-sm transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      required 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                      value={newClient.name}
                      onChange={e => setNewClient({...newClient, name: e.target.value})}
                      placeholder="Legal Entity Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company UEN</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                    value={newClient.uen}
                    onChange={e => setNewClient({...newClient, uen: e.target.value.toUpperCase()})}
                    placeholder="e.g. 2024XXXXXZ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                    value={newClient.industry}
                    onChange={e => setNewClient({...newClient, industry: e.target.value})}
                    placeholder="e.g. Retail, Education"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stakeholder</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                    value={newClient.contactPerson}
                    onChange={e => setNewClient({...newClient, contactPerson: e.target.value})}
                    placeholder="Full Name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                    value={newClient.email}
                    onChange={e => setNewClient({...newClient, email: e.target.value})}
                    placeholder="billing@domain.com"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operating Address</label>
                  <textarea 
                    rows={2} 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:border-blue-500 transition-all outline-none text-sm font-bold resize-none"
                    value={newClient.address}
                    onChange={e => setNewClient({...newClient, address: e.target.value})}
                    placeholder="Physical site location"
                  />
                </div>

                <div className="col-span-2">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-6 rounded-full transition-all relative ${newClient.gstRegistered ? 'bg-blue-600' : 'bg-slate-200'}`} onClick={() => setNewClient({...newClient, gstRegistered: !newClient.gstRegistered})}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newClient.gstRegistered ? 'left-5' : 'left-1'}`} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">GST Registered Entity</span>
                   </label>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 uppercase tracking-widest text-xs">
                  Register Partnership
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const DetailStat = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
    <p className={`text-xl font-black ${color}`}>{value}</p>
  </div>
);

const DetailField = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-center gap-5">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
       <Icon size={20} />
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

export default Clients;
