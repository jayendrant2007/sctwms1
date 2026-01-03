import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, JobScope, ServiceReport, Technician, Client, InternalNote, AuthUser, UserRole, TrackingLog, CompanyInfo } from '../types';
import { JOB_SCOPES, COMPANY_INFO } from '../constants';
import { 
  Plus, 
  UserPlus, 
  MapPin, 
  X, 
  ChevronDown, 
  Building, 
  MessageSquare, 
  Send, 
  Lock,
  Clock,
  Trash2,
  StickyNote,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  LogIn,
  LogOut,
  Navigation,
  Timer as TimerIcon,
  Radar,
  Activity,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserCircle,
  MessagesSquare,
  Share2,
  Flag,
  Radio,
  Settings2,
  Users,
  Camera,
  Layers,
  Smartphone,
  Fingerprint,
  Scan,
  Columns3,
  Settings
} from 'lucide-react';

interface WorkOrdersProps {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  setServiceReports: React.Dispatch<React.SetStateAction<ServiceReport[]>>;
  technicians: Technician[];
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
  clients: Client[];
  authUser: AuthUser;
}

const WorkOrders: React.FC<WorkOrdersProps> = ({ workOrders, setWorkOrders, setServiceReports, technicians, setTechnicians, clients, authUser }) => {
  const location = useLocation();
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [expandedInternalNotesId, setExpandedInternalNotesId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState(location.state?.search || '');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'ALL'>('ALL');
  const [noteInput, setNoteInput] = useState<{ [key: string]: string }>({});
  const [availableOnlyFilter, setAvailableOnlyFilter] = useState(false);
  
  const [newOrder, setNewOrder] = useState({
    clientId: '',
    jobScope: JobScope.CCTV,
    priority: WorkOrderPriority.STANDARD,
    description: ''
  });

  const watchers = useRef<{ [key: string]: number }>({});
  
  const isAdmin = authUser.role === UserRole.ADMIN;
  const isTechnician = authUser.role === UserRole.TECHNICIAN;
  const isStaff = isAdmin || isTechnician;
  
  const filteredOrders = workOrders
    .filter(wo => (authUser.role === UserRole.CLIENT) ? wo.clientEmail === authUser.email : (isAdmin ? true : wo.assignedTechnicianId === authUser.id))
    .filter(wo => statusFilter === 'ALL' ? true : wo.status === statusFilter)
    .filter(wo => priorityFilter === 'ALL' ? true : wo.priority === priorityFilter)
    .filter(wo => 
      wo.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      wo.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredTechnicians = availableOnlyFilter 
    ? technicians.filter(t => t.status === 'Available')
    : technicians;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      // Fix: Cast id to number as Object.values on record types can return unknown[] in some TS environments
      Object.values(watchers.current).forEach(id => navigator.geolocation.clearWatch(id as number));
    };
  }, []);

  const shareToWhatsApp = (order: WorkOrder) => {
    const message = `*SCT TECHNICAL DISPATCH*%0A` +
      `----------------------------%0A` +
      `*ID:* ${order.id}%0A` +
      `*Client:* ${order.clientName}%0A` +
      `*Scope:* ${order.jobScope}%0A` +
      `*Priority:* ${order.priority}%0A` +
      `*Location:* ${order.clientAddress}%0A` +
      `*Assigned:* ${order.assignedTechnician}%0A` +
      `----------------------------%0A` +
      `*Task:* ${order.description}%0A%0A` +
      `Please acknowledge and update check-in via SCTWMS portal.`;

    const waUrl = COMPANY_INFO.whatsappGroupLink 
      ? `${COMPANY_INFO.whatsappGroupLink}?text=${message}`
      : `https://wa.me/${COMPANY_INFO.whatsapp}?text=${message}`;
    
    window.open(waUrl, '_blank');
  };

  const addLog = (orderId: string, event: TrackingLog['event'], pos?: GeolocationPosition, note?: string) => {
    const newLog: TrackingLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      event,
      location: pos ? { lat: pos.coords.latitude, lng: pos.coords.longitude } : undefined,
      note
    };

    setWorkOrders(prev => prev.map(wo => 
      wo.id === orderId ? {
        ...wo,
        trackingLogs: [...(wo.trackingLogs || []), newLog]
      } : wo
    ));
  };

  const handleAdminStatusChange = (orderId: string, newStatus: WorkOrderStatus) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === orderId ? { ...wo, status: newStatus } : wo
    ));
    addLog(orderId, 'STATUS_CHANGE', undefined, `Administrator ${authUser.name} manually overridden status to: ${newStatus.toUpperCase()}`);
  };

  const handleMarkComplete = (orderId: string) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === orderId ? { ...wo, status: WorkOrderStatus.COMPLETED } : wo
    ));
    
    addLog(orderId, 'STATUS_CHANGE', undefined, `Technician ${authUser.name} marked job as COMPLETED. Physical site work finished.`);
    
    const sysNote: InternalNote = {
      id: `NOTE-COMP-${Date.now()}`,
      author: 'SYSTEM',
      text: `NOTIFICATION: Technician ${authUser.name} has finalized Work Order ${orderId}. Ready for service report review and invoicing.`,
      createdAt: new Date().toISOString()
    };

    setWorkOrders(prev => prev.map(wo => 
      wo.id === orderId ? {
        ...wo,
        internalNotes: [...(wo.internalNotes || []), sysNote]
      } : wo
    ));
    
    alert(`Work order ${orderId} has been successfully submitted for administrative review.`);
  };

  const handleAddInternalNote = (orderId: string) => {
    const text = noteInput[orderId];
    if (!text?.trim()) return;

    const newNote: InternalNote = {
      id: `NOTE-${Date.now()}`,
      author: authUser.name,
      text: text,
      createdAt: new Date().toISOString()
    };

    setWorkOrders(prev => prev.map(wo => 
      wo.id === orderId ? {
        ...wo,
        internalNotes: [...(wo.internalNotes || []), newNote]
      } : wo
    ));

    setNoteInput(prev => ({ ...prev, [orderId]: '' }));
  };

  const getPosition = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { enableHighAccuracy: true }
      );
    });
  };

  const startLiveTracking = (orderId: string) => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setWorkOrders(prev => prev.map(wo => 
          wo.id === orderId ? {
            ...wo,
            currentLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude }
          } : wo
        ));
        addLog(orderId, 'LOCATION_UPDATE', pos);
      },
      (err) => console.error("Tracking Error:", err),
      { enableHighAccuracy: true }
    );

    watchers.current[orderId] = watchId;
  };

  const stopLiveTracking = (orderId: string) => {
    if (watchers.current[orderId]) {
      navigator.geolocation.clearWatch(watchers.current[orderId]);
      delete watchers.current[orderId];
    }
  };

  const handleCheckIn = async (orderId: string) => {
    const position = await getPosition();
    const checkInTime = new Date().toISOString();
    
    setWorkOrders(prev => prev.map(wo => 
      wo.id === orderId ? {
        ...wo,
        checkInTime,
        checkInLocation: position ? { lat: position.coords.latitude, lng: position.coords.longitude } : undefined,
        currentLocation: position ? { lat: position.coords.latitude, lng: position.coords.longitude } : undefined
      } : wo
    ));

    addLog(orderId, 'CHECK_IN', position || undefined, 'Technician verified site arrival.');
    startLiveTracking(orderId);
  };

  const handleCheckOut = async (orderId: string) => {
    stopLiveTracking(orderId);
    const position = await getPosition();
    const checkOutTime = new Date().toISOString();
    
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === orderId) {
        const startTime = new Date(wo.checkInTime!).getTime();
        const endTime = new Date(checkOutTime).getTime();
        const diffSeconds = Math.floor(Math.max(0, endTime - startTime) / 1000);
        
        return {
          ...wo,
          checkOutTime,
          checkOutLocation: position ? { lat: position.coords.latitude, lng: position.coords.longitude } : undefined,
          totalDurationSeconds: diffSeconds,
          currentLocation: undefined
        };
      }
      return wo;
    }));

    addLog(orderId, 'CHECK_OUT', position || undefined, 'Technician checked out from site.');
  };

  const formatClockSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : currentTime.getTime();
    const diffSeconds = Math.floor(Math.max(0, endTime - startTime) / 1000);
    return formatClockSeconds(diffSeconds);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === newOrder.clientId);
    if (!client) return;

    const orderId = `SCT-WO-${String(workOrders.length + 1).padStart(4, '0')}`;
    const order: WorkOrder = {
      id: orderId,
      clientId: client.id,
      clientName: client.name,
      clientAddress: client.address,
      clientContact: client.phone,
      clientEmail: client.email,
      jobScope: newOrder.jobScope,
      priority: newOrder.priority,
      description: newOrder.description,
      status: WorkOrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      source: 'AD_HOC',
      trackingLogs: []
    };

    setWorkOrders([order, ...workOrders]);
    setShowNewOrderModal(false);
    setNewOrder({ clientId: '', jobScope: JobScope.CCTV, priority: WorkOrderPriority.STANDARD, description: '' });
  };

  const assignTechnician = (orderId: string, technicianId: string, technicianName: string) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === orderId 
      ? { ...order, status: WorkOrderStatus.ASSIGNED, assignedTechnician: technicianName, assignedTechnicianId: technicianId }
      : order
    ));
    setTechnicians(prev => prev.map(tech => tech.id === technicianId ? { ...tech, status: 'On Site' } : tech));
    addLog(orderId, 'STATUS_CHANGE', undefined, `Order assigned to ${technicianName}.`);
    setAssigningId(null);
  };

  const getPriorityColor = (priority: WorkOrderPriority) => {
    switch (priority) {
      case WorkOrderPriority.URGENT: return 'bg-red-500 text-white';
      case WorkOrderPriority.STANDARD: return 'bg-blue-500 text-white';
      case WorkOrderPriority.LOW: return 'bg-slate-500 text-white';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusStyle = (status: WorkOrderStatus) => {
    switch (status) {
      case WorkOrderStatus.PENDING: return 'bg-amber-50 text-amber-600 border-amber-100';
      case WorkOrderStatus.ASSIGNED: return 'bg-blue-50 text-blue-600 border-blue-100';
      case WorkOrderStatus.COMPLETED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case WorkOrderStatus.HANDOVER: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case WorkOrderStatus.INVOICED: return 'bg-slate-900 text-white border-slate-900';
      case WorkOrderStatus.CANCELLED: return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getScopeIcon = (scope: JobScope) => {
    switch (scope) {
      case JobScope.CCTV: return <Camera size={20} />;
      case JobScope.CARD_ACCESS: return <Layers size={20} />;
      case JobScope.INTERCOM: return <Smartphone size={20} />;
      case JobScope.BIOMETRICS: return <Fingerprint size={20} />;
      case JobScope.ANPR: return <Scan size={20} />;
      case JobScope.BARRIER: return <Columns3 size={20} />;
      default: return <Settings size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isAdmin ? 'Technical Operations' : (authUser.role === UserRole.CLIENT ? 'My Requests' : 'My Field Tasks')}</h2>
          <p className="text-sm text-slate-500 font-medium">Monitoring deployment and live tracking systems</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Client or WO ID..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold min-w-[240px] shadow-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowNewOrderModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold"
            >
              <Plus size={20} />
              Provision Work Order
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
          <Filter size={16} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filters</span>
        </div>
        <div className="flex gap-2">
          {['ALL', ...Object.values(WorkOrderStatus)].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                statusFilter === status 
                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-slate-100" />
        <div className="flex gap-2">
          {['ALL', ...Object.values(WorkOrderPriority)].map(priority => (
            <button
              key={priority}
              onClick={() => setPriorityFilter(priority as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                priorityFilter === priority 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredOrders.map((order) => {
          const isAssigned = order.status !== WorkOrderStatus.PENDING && order.status !== WorkOrderStatus.CANCELLED;
          const hasCheckedIn = !!order.checkInTime;
          const hasCheckedOut = !!order.checkOutTime;
          const isTracking = hasCheckedIn && !hasCheckedOut && !!order.currentLocation;
          const isNotesExpanded = expandedNotesId === order.id;
          const isInternalNotesExpanded = expandedInternalNotesId === order.id;

          return (
            <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all flex flex-col h-fit overflow-hidden animate-in fade-in duration-500">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black font-mono text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl tracking-tighter border border-blue-100">
                      {order.id}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-xl shadow-sm ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </div>
                  
                  <div className="relative group/status">
                    {isAdmin ? (
                      <div className="relative">
                        <select 
                          value={order.status}
                          onChange={(e) => handleAdminStatusChange(order.id, e.target.value as WorkOrderStatus)}
                          className={`appearance-none cursor-pointer text-[10px] font-black uppercase tracking-[0.1em] pl-3 pr-8 py-1.5 rounded-xl border-2 transition-all outline-none ${getStatusStyle(order.status)}`}
                        >
                          {Object.values(WorkOrderStatus).map(s => <option key={s} value={s} className="text-slate-900 bg-white font-bold">{s.toUpperCase()}</option>)}
                        </select>
                        <Settings2 className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={12} />
                      </div>
                    ) : (
                      <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-xl border-2 ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-black text-slate-900 text-2xl leading-tight tracking-tight mb-2">{order.clientName}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                      <ShieldCheck size={12} /> {order.jobScope}
                    </span>
                    {order.source === 'MAINTENANCE' && (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">SLA RECURRING</span>
                    )}
                  </div>
                </div>

                {isTracking && (
                  <div className="mb-8 rounded-[2rem] overflow-hidden h-44 border-4 border-white shadow-xl relative group">
                    <iframe 
                      width="100%" height="100%" style={{ border: 0 }} 
                      src={`https://www.google.com/maps?q=${order.currentLocation?.lat},${order.currentLocation?.lng}&z=16&output=embed`}
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 shadow-lg border border-slate-100">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5"><Radar size={14} className="text-blue-600" /> Active Tracking</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 text-slate-600">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                      <MapPin size={20} className="text-slate-400" />
                    </div>
                    <span className="text-sm font-bold leading-relaxed pt-1 text-slate-500">{order.clientAddress}</span>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-500 leading-relaxed relative">
                    <StickyNote className="absolute -top-3 -right-3 text-slate-200" size={32} />
                    {order.description}
                  </div>
                </div>

                {isAssigned && (order.assignedTechnicianId === authUser.id || isAdmin) && (
                  <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-inner">
                    {!hasCheckedIn ? (
                      <button 
                        onClick={() => handleCheckIn(order.id)}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                      >
                        <LogIn size={20} /> Field Check-In
                      </button>
                    ) : !hasCheckedOut ? (
                      <div className="space-y-4">
                        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.3)] relative overflow-hidden group border-2 border-blue-500/20">
                          <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="flex items-center gap-3 mb-4 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full">
                              <Radio className="text-red-500 animate-pulse" size={14} />
                              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Live Site Deployment</span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <span className="text-5xl font-black font-mono tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                                {calculateDuration(order.checkInTime!)}
                              </span>
                              <div className="mt-4 flex items-center gap-2">
                                <Clock className="text-slate-500" size={12} />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                  Started at {new Date(order.checkInTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] animate-pulse" />
                          <TimerIcon className="absolute -bottom-6 -right-6 text-white/5 group-hover:scale-125 transition-transform duration-[2000ms] rotate-12" size={140} />
                        </div>
                        
                        <button 
                          onClick={() => handleCheckOut(order.id)}
                          className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100"
                        >
                          <LogOut size={20} /> End Visit & Log Duration
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-emerald-500" size={24} />
                            <div>
                              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Visit Logged</p>
                              <p className="text-xs font-bold text-emerald-600">Site work completed</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-emerald-700 font-mono">
                            {Math.floor((order.totalDurationSeconds || 0) / 3600)}h {Math.floor(((order.totalDurationSeconds || 0) % 3600) / 60)}m
                          </span>
                        </div>
                        
                        {isTechnician && order.status === WorkOrderStatus.ASSIGNED && (
                          <button 
                            onClick={() => handleMarkComplete(order.id)}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 animate-in slide-in-from-top-2"
                          >
                            <Flag size={20} /> Finalize & Mark Complete
                          </button>
                        )}
                        
                        {order.status === WorkOrderStatus.COMPLETED && (
                           <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center gap-3">
                              <ShieldCheck className="text-blue-600" size={20} />
                              <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Admin Notified & Work Verified</p>
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isStaff && isAssigned && (
                <div className="bg-slate-900 border-t border-slate-800">
                  <button 
                    onClick={() => setExpandedInternalNotesId(isInternalNotesExpanded ? null : order.id)}
                    className="w-full flex items-center justify-between px-8 py-5 group"
                  >
                    <div className="flex items-center gap-4">
                      <MessagesSquare size={18} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Technical Comms (Staff Only)</span>
                      {order.internalNotes && order.internalNotes.length > 0 && (
                        <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">{order.internalNotes.length}</span>
                      )}
                    </div>
                    <ChevronDown size={18} className={`text-slate-600 transition-transform duration-500 ${isInternalNotesExpanded ? 'rotate-180 text-blue-400' : ''}`} />
                  </button>
                  
                  {isInternalNotesExpanded && (
                    <div className="px-8 pb-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                      <div className="max-h-64 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {(!order.internalNotes || order.internalNotes.length === 0) ? (
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center py-6">No Internal Notes Shared</p>
                        ) : (
                          order.internalNotes.map(note => (
                            <div key={note.id} className={`p-4 rounded-2xl border ${note.author === 'SYSTEM' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/5'} space-y-2`}>
                               <div className="flex justify-between items-center">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${note.author === 'SYSTEM' ? 'text-amber-400' : 'text-blue-400'}`}>{note.author}</span>
                                  <span className="text-[9px] text-slate-500 font-mono">{new Date(note.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                               </div>
                               <p className={`text-xs leading-relaxed ${note.author === 'SYSTEM' ? 'text-amber-100 font-bold' : 'text-slate-300'}`}>{note.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="pt-2 flex gap-2">
                         <input 
                           type="text" 
                           placeholder="Add technical update..."
                           className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:font-normal placeholder:text-slate-600"
                           value={noteInput[order.id] || ''}
                           onChange={(e) => setNoteInput(prev => ({ ...prev, [order.id]: e.target.value }))}
                           onKeyDown={(e) => e.key === 'Enter' && handleAddInternalNote(order.id)}
                         />
                         <button 
                           onClick={() => handleAddInternalNote(order.id)}
                           className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                         >
                           <Send size={16} />
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setExpandedNotesId(isNotesExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between px-8 py-5 group"
                >
                  <div className="flex items-center gap-4">
                    <Activity size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-colors">Operational Ledger</span>
                  </div>
                  <ChevronDown size={18} className={`text-slate-300 transition-transform duration-500 ${isNotesExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                {isNotesExpanded && (
                  <div className="px-8 pb-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="max-h-64 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                       {(!order.trackingLogs || order.trackingLogs.length === 0) ? (
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-6">No Activity Logged</p>
                       ) : (
                         order.trackingLogs?.slice().reverse().map(log => (
                           <div key={log.id} className="relative pl-6 pb-2 group">
                             <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-blue-500 z-10 group-last:bg-emerald-500" />
                             <div className="absolute left-1 top-2 bottom-0 w-px bg-slate-200" />
                             <div className="flex justify-between items-start">
                               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{log.event.replace('_', ' ')}</span>
                               <span className="text-[9px] text-slate-400 font-bold font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                             </div>
                             {log.note && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{log.note}</p>}
                           </div>
                         ))
                       )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-8 py-6 bg-white border-t border-slate-100 mt-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-lg shadow-inner ${order.assignedTechnician ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300 border-2 border-dashed border-slate-200'}`}>
                    {order.assignedTechnician ? order.assignedTechnician.charAt(0) : <UserCircle size={28} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Handler</p>
                    <p className="text-sm font-black text-slate-800 leading-tight">{order.assignedTechnician || 'Dispatch Required'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isAdmin && isAssigned && (
                    <button 
                      onClick={() => shareToWhatsApp(order)}
                      className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-md shadow-emerald-50"
                      title="Share to WhatsApp Group"
                    >
                      <Share2 size={20} />
                    </button>
                  )}
                  {isAdmin && (order.status === WorkOrderStatus.PENDING || order.status === WorkOrderStatus.ASSIGNED) && (
                    <button 
                      onClick={() => setAssigningId(order.id)} 
                      className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-md shadow-blue-50"
                    >
                      <UserPlus size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {assigningId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-12 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Dispatch Unit</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Select field technician for WO {assigningId}</p>
                </div>
                <button onClick={() => setAssigningId(null)} className="p-4 bg-white text-slate-400 hover:text-slate-600 rounded-3xl shadow-sm transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="px-12 pt-8 pb-4">
                <div className="flex items-center justify-between p-1 bg-slate-100 rounded-2xl border border-slate-200">
                   <button 
                    type="button"
                    onClick={() => setAvailableOnlyFilter(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      !availableOnlyFilter 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                   >
                    All Staff
                   </button>
                   <button 
                    type="button"
                    onClick={() => setAvailableOnlyFilter(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      availableOnlyFilter 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                   >
                    <UserCheck size={14} /> Available Only
                   </button>
                </div>
              </div>

              <div className="p-12 pt-2 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredTechnicians.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                     <Users size={32} className="mx-auto text-slate-200 mb-3" />
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No technicians found matching criteria</p>
                  </div>
                ) : (
                  filteredTechnicians.map(tech => (
                    <button 
                      key={tech.id}
                      onClick={() => assignTechnician(assigningId, tech.id, tech.name)}
                      className="w-full flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-50 hover:border-blue-500 hover:bg-white rounded-[2rem] transition-all group"
                    >
                      <div className="flex items-center gap-5 text-left">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all text-xl">
                          {tech.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 leading-none">{tech.name}</p>
                          <p className="text-xs text-slate-500 font-bold mt-2 flex items-center gap-1.5 uppercase tracking-widest"><Navigation size={12} className="text-blue-500" /> {tech.specialty}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        tech.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tech.status}
                      </div>
                    </button>
                  ))
                )}
              </div>
           </div>
        </div>
      )}

      {showNewOrderModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-12 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">New Job Log</h3>
                    <p className="text-sm text-slate-500 font-medium mt-3">Manual technician provisioning portal</p>
                 </div>
                 <button onClick={() => setShowNewOrderModal(false)} className="p-4 bg-white text-slate-400 hover:text-slate-600 rounded-3xl shadow-sm transition-all">
                    <X size={24} />
                 </button>
              </div>
              <form onSubmit={handleCreateOrder} className="p-12 space-y-10">
                 <div className="space-y-10">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity / Partnership</label>
                       <select 
                         required
                         className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black"
                         value={newOrder.clientId}
                         onChange={e => setNewOrder({...newOrder, clientId: e.target.value})}
                       >
                         <option value="">-- Choose Account --</option>
                         {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
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
                             onClick={() => setNewOrder({...newOrder, jobScope: scope})}
                             className={`p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border-2 transition-all flex flex-col items-center justify-center gap-5 text-center min-h-[140px] ${
                               newOrder.jobScope === scope 
                               ? 'bg-blue-600 border-blue-600 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] scale-105 z-10' 
                               : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:bg-blue-50/30'
                             }`}
                           >
                             <div className={`p-4 rounded-2xl transition-colors ${newOrder.jobScope === scope ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                {getScopeIcon(scope)}
                             </div>
                             <span className={newOrder.jobScope === scope ? 'text-white' : 'text-slate-700'}>{scope}</span>
                           </button>
                         ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Urgency Tier</label>
                       <select 
                         className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black"
                         value={newOrder.priority}
                         onChange={e => setNewOrder({...newOrder, priority: e.target.value as WorkOrderPriority})}
                       >
                         {Object.values(WorkOrderPriority).map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Directive Details</label>
                       <textarea 
                         required
                         rows={4}
                         className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-blue-500 transition-all outline-none text-sm font-bold resize-none placeholder:font-normal placeholder:text-slate-300"
                         placeholder="Precise technical directives for the team..."
                         value={newOrder.description}
                         onChange={e => setNewOrder({...newOrder, description: e.target.value})}
                       />
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   className="w-full py-6 bg-blue-600 text-white font-black rounded-[2.5rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4"
                 >
                    <Send size={20} /> Deploy Work Order
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

export default WorkOrders;