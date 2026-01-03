
import React, { useState, useEffect } from 'react';
import { WorkOrder, ServiceReport, Invoice, WorkOrderStatus, Technician, AuthUser, UserRole } from '../types';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Receipt,
  Users,
  Timer,
  Navigation,
  MapPin,
  ArrowUpRight,
  Activity,
  Zap,
  BarChart3,
  Calendar
} from 'lucide-react';

interface DashboardProps {
  workOrders: WorkOrder[];
  reports: ServiceReport[];
  invoices: Invoice[];
  technicians: Technician[];
  authUser: AuthUser;
}

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
    <div className="flex items-center justify-between mb-6">
      <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${color}`}>
        <Icon className="text-white" size={28} />
      </div>
      {trend && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100">
          <TrendingUp size={14} />
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
    <p className="text-4xl font-black text-slate-900 mt-2 tracking-tight">{value}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ workOrders, reports, invoices, technicians, authUser }) => {
  const [now, setNow] = useState(new Date());
  const isAdmin = authUser.role === UserRole.ADMIN;
  
  const filteredOrders = isAdmin ? workOrders : workOrders.filter(wo => wo.assignedTechnicianId === authUser.id);
  const myCompleted = reports.filter(r => r.technicianName === authUser.name).length;
  
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  // Time calculations
  const historicalSeconds = filteredOrders.reduce((acc, wo) => acc + (wo.totalDurationSeconds || 0), 0);
  const activeSeconds = filteredOrders.reduce((acc, wo) => {
    if (wo.checkInTime && !wo.checkOutTime) {
      const diff = Math.max(0, now.getTime() - new Date(wo.checkInTime).getTime());
      return acc + Math.floor(diff / 1000);
    }
    return acc;
  }, 0);

  const totalHoursStr = `${Math.floor((historicalSeconds + activeSeconds) / 3600)}h ${Math.floor(((historicalSeconds + activeSeconds) % 3600) / 60)}m`;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">
             <Activity size={16} /> Operational Command Center
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            {isAdmin ? 'System Overview' : `Field Portal: ${authUser.name.split(' ')[0]}`}
          </h2>
          <p className="text-slate-500 font-medium mt-3">
            {isAdmin ? `Monitoring ${workOrders.length} active service threads across Singapore.` : `You have ${filteredOrders.filter(o => o.status === WorkOrderStatus.ASSIGNED).length} urgent tasks assigned today.`}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-4 py-2 border-r border-slate-100 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Jobs</p>
              <p className="text-lg font-black text-blue-600">{workOrders.filter(w => w.status === WorkOrderStatus.ASSIGNED).length}</p>
           </div>
           <div className="px-4 py-2 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Health</p>
              <p className="text-lg font-black text-emerald-500">100%</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title={isAdmin ? "Fleet Workload" : "My Assignments"} 
          value={filteredOrders.length} 
          icon={ClipboardList} 
          color="bg-blue-600 shadow-blue-100"
          trend={isAdmin ? "+12%" : undefined}
        />
        <StatCard 
          title="Field Deployment" 
          value={totalHoursStr} 
          icon={Clock} 
          color="bg-amber-600 shadow-amber-100"
        />
        <StatCard 
          title={isAdmin ? "Service Certs" : "Job Finishes"} 
          value={isAdmin ? reports.length : myCompleted} 
          icon={CheckCircle2} 
          color="bg-emerald-500 shadow-emerald-100"
        />
        <StatCard 
          title={isAdmin ? "Pipeline Value" : "Node Status"} 
          value={isAdmin ? `$${totalRevenue.toLocaleString()}` : "Online"} 
          icon={isAdmin ? Receipt : Navigation} 
          color="bg-slate-900 shadow-slate-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           {/* Visual Pulse Section */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Job Velocity & Trends</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Weekly service demand analysis</p>
                 </div>
                 <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100">D</button>
                    <button className="px-3 py-1 bg-white text-slate-400 text-[10px] font-black rounded-lg border border-slate-100">W</button>
                    <button className="px-3 py-1 bg-white text-slate-400 text-[10px] font-black rounded-lg border border-slate-100">M</button>
                 </div>
              </div>
              
              <div className="h-64 flex items-end justify-between gap-4 px-2">
                 {[45, 60, 85, 30, 70, 95, 55].map((h, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                      <div className="w-full relative">
                         <div 
                           className={`w-full rounded-2xl transition-all duration-1000 group-hover:brightness-110 group-hover:scale-105 ${i === 5 ? 'bg-blue-600' : 'bg-slate-100'}`} 
                           style={{ height: `${h}%` }}
                         >
                            {i === 5 && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Peak: 95 Ops
                              </div>
                            )}
                         </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Day 0{i+1}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Live Signal Map (Decorative but Professional) */}
           <div className="bg-slate-900 rounded-[3rem] border border-white/5 shadow-2xl p-10 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                 <div>
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                       <h3 className="font-black text-white uppercase tracking-widest text-xs">Live Deployment Matrix</h3>
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
                       Technician geolocation data is synchronized in real-time for precise dispatch efficiency.
                    </p>
                 </div>
                 <button className="px-8 py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all backdrop-blur-md border border-white/10">
                    Access Grid Map
                 </button>
              </div>
              <MapPin className="absolute -bottom-10 -right-10 text-white/[0.03] group-hover:scale-110 transition-transform duration-[3000ms]" size={280} />
              
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
                 <MapMetric label="Active Signals" value="14" />
                 <MapMetric label="Mean Response" value="18m" />
                 <MapMetric label="Buffer Zones" value="03" />
                 <MapMetric label="Sync Status" value="Stable" />
              </div>
           </div>
        </div>

        <div className="space-y-10">
           <section className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Technician Telemetry</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Real-time status</p>
                 </div>
                 <Users size={20} className="text-slate-300" />
              </div>
              <div className="space-y-6">
                 {technicians.map(tech => (
                   <div key={tech.id} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-4">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all group-hover:scale-110 shadow-inner ${tech.status === 'On Site' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                           {tech.name.charAt(0)}
                         </div>
                         <div>
                           <p className="text-sm font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{tech.name}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{tech.specialty}</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 ${
                           tech.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                           tech.status === 'Away' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                         }`}>
                           {tech.status}
                         </span>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-10 py-4 bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-100">
                 Manage Personnel <ArrowUpRight size={14} />
              </button>
           </section>

           <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                    <Zap size={32} />
                 </div>
                 <h4 className="text-2xl font-black tracking-tight mb-3">Quick Actions</h4>
                 <p className="text-xs text-blue-50 leading-relaxed mb-8 opacity-80">
                   Streamline your workflow with automated report triggers and bulk invoicing.
                 </p>
                 <div className="space-y-3">
                    <ActionButton icon={BarChart3} label="Generate Revenue Report" />
                    <ActionButton icon={Calendar} label="Verify Weekly Schedules" />
                    <ActionButton icon={Receipt} label="Batch Digital Dispatches" />
                 </div>
              </div>
              <Activity className="absolute -bottom-6 -right-6 text-white/5 group-hover:scale-125 transition-transform duration-1000" size={140} />
           </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const MapMetric = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
    <p className="text-lg font-black text-white">{value}</p>
  </div>
);

const ActionButton = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white text-white hover:text-blue-600 rounded-2xl transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest group">
     <div className="flex items-center gap-3">
        <Icon size={16} />
        {label}
     </div>
     <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
  </button>
);

const ChevronRight = ({ className, size }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default Dashboard;
