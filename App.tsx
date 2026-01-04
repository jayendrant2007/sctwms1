import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  FileText, 
  Receipt, 
  PlusCircle, 
  Menu, 
  Bell, 
  Search,
  UserCog,
  Building,
  CalendarClock,
  ShieldCheck,
  Handshake,
  LogOut,
  User,
  History,
  LifeBuoy,
  ExternalLink,
  Settings as SettingsIcon,
  X
} from 'lucide-react';
import Dashboard from './pages/Dashboard.tsx';
import WorkOrders from './pages/WorkOrders.tsx';
import ServiceReports from './pages/ServiceReports.tsx';
import Invoices from './pages/Invoices.tsx';
import Admin from './pages/Admin.tsx';
import Clients from './pages/Clients.tsx';
import Maintenance from './pages/Maintenance.tsx';
import SiteHandoverPage from './pages/SiteHandover.tsx';
import Login from './pages/Login.tsx';
import ClientPortal from './pages/ClientPortal.tsx';
import PublicClientPortal from './pages/PublicClientPortal.tsx';
import Profile from './pages/Profile.tsx';
import { 
  WorkOrder, 
  WorkOrderStatus, 
  WorkOrderPriority,
  ServiceReport, 
  Invoice, 
  Technician, 
  CompanyInfo, 
  JobScope, 
  Client, 
  MaintenanceContract,
  MaintenanceFrequency,
  SiteHandover,
  UserRole,
  AuthUser
} from './types.ts';
import { COMPANY_INFO as INITIAL_COMPANY_INFO } from './constants.tsx';

const SidebarLink = ({ to, icon: Icon, label, active, onClick }: { to: string, icon: any, label: string, active: boolean, onClick?: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
      : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

const SidebarContextAwareLink = ({ to, icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  return <SidebarLink to={to} icon={icon} label={label} active={isActive} onClick={onClick} />;
};

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Persistence Helper
  const getSavedData = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  // State with LocalStorage Initialization
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => getSavedData('sct_company_info', INITIAL_COMPANY_INFO));
  
  // Persisted Admin Credentials
  const [adminCredentials, setAdminCredentials] = useState(() => getSavedData('sct_admin_credentials', {
    email: 'admin@smartcitytechnologies.com.sg',
    password: 'admin123'
  }));

  const [clients, setClients] = useState<Client[]>(() => getSavedData('sct_clients', [
    {
      id: 'C1',
      name: 'Securistate Pte Ltd',
      address: '20 Sin Ming Lane,05-66 Singapore 573968',
      phone: '66845650',
      email: 'info@securistate.com',
      password: 'password123',
      contactPerson: 'Mr. Vic',
      industry: 'Security Manpower Agency',
      uen: '201021637W',
      gstRegistered: true,
      createdAt: new Date('2024-01-15').toISOString(),
      role: UserRole.CLIENT
    },
    {
      id: 'C2',
      name: 'Capitaland Facilities',
      address: '168 Robinson Rd, Singapore 068912',
      phone: '6713 2888',
      email: 'facilities@capitaland.com',
      password: 'password123',
      contactPerson: 'Mr. Tan',
      industry: 'Real Estate / Facilities',
      uen: '198900036N',
      gstRegistered: true,
      createdAt: new Date('2024-02-10').toISOString(),
      role: UserRole.CLIENT
    }
  ]));

  const [technicians, setTechnicians] = useState<Technician[]>(() => getSavedData('sct_technicians', [
    { id: 'T1', name: 'Michael Tan', phone: '81234567', email: 'michael.tan@smartcitytechnologies.com.sg', password: 'password123', specialty: JobScope.CCTV, status: 'Available', role: UserRole.TECHNICIAN },
    { id: 'T2', name: 'Jay', phone: '86693833', email: 'jay@smartcitytechnologies.com.sg', password: 'password123', specialty: JobScope.CARD_ACCESS, status: 'Available', role: UserRole.TECHNICIAN },
    { id: 'T3', name: 'Bala', phone: '98918335', email: 'bala.lim@smartcitytechnologies.com.sg', password: 'password123', specialty: JobScope.CARD_ACCESS, status: 'Available', role: UserRole.TECHNICIAN },
  ]));
  
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => getSavedData('sct_work_orders', [
    {
      id: "SCT-WO-0001",
      clientId: 'C1',
      clientName: "Securistate Pte Ltd",
      clientAddress: "20 Sin Ming Lane,05-66 Singapore 573968",
      clientContact: "66845650",
      clientEmail: "info@securistate.com",
      jobScope: JobScope.CCTV,
      priority: WorkOrderPriority.STANDARD,
      description: "Intermittent flickering on camera 04 and 09 at Basement 2 loading bay.",
      status: WorkOrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      source: 'CLIENT_PORTAL',
      trackingLogs: []
    }
  ]));

  const [serviceReports, setServiceReports] = useState<ServiceReport[]>(() => getSavedData('sct_reports', []));
  const [handovers, setHandovers] = useState<SiteHandover[]>(() => getSavedData('sct_handovers', []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getSavedData('sct_invoices', []));
  const [contracts, setContracts] = useState<MaintenanceContract[]>(() => getSavedData('sct_contracts', []));

  // Sync state to LocalStorage whenever changes occur
  useEffect(() => { localStorage.setItem('sct_company_info', JSON.stringify(companyInfo)); }, [companyInfo]);
  useEffect(() => { localStorage.setItem('sct_admin_credentials', JSON.stringify(adminCredentials)); }, [adminCredentials]);
  useEffect(() => { localStorage.setItem('sct_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('sct_technicians', JSON.stringify(technicians)); }, [technicians]);
  useEffect(() => { localStorage.setItem('sct_work_orders', JSON.stringify(workOrders)); }, [workOrders]);
  useEffect(() => { localStorage.setItem('sct_reports', JSON.stringify(serviceReports)); }, [serviceReports]);
  useEffect(() => { localStorage.setItem('sct_handovers', JSON.stringify(handovers)); }, [handovers]);
  useEffect(() => { localStorage.setItem('sct_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('sct_contracts', JSON.stringify(contracts)); }, [contracts]);

  const handleLogout = () => {
    setAuthUser(null);
    setSidebarOpen(false);
  };

  const handleUpdateUserPassword = (userId: string, role: UserRole, newPassword: string) => {
    if (role === UserRole.ADMIN) {
      setAdminCredentials(prev => ({ ...prev, password: newPassword }));
    } else if (role === UserRole.TECHNICIAN) {
      setTechnicians(prev => prev.map(t => t.id === userId ? { ...t, password: newPassword } : t));
    } else if (role === UserRole.CLIENT) {
      setClients(prev => prev.map(c => c.id === userId ? { ...c, password: newPassword } : c));
    }
  };

  // Improved password reset by email (for Login page)
  const handleResetPasswordByEmail = (email: string, newPassword: string): boolean => {
    if (!email) return false;
    const searchEmail = email.trim().toLowerCase();
    let found = false;

    // 1. Check Admin Priority
    if (searchEmail === adminCredentials.email.toLowerCase()) {
      setAdminCredentials(prev => ({ ...prev, password: newPassword }));
      found = true;
    } 
    
    // 2. Check Technicians
    if (!found) {
      const tech = technicians.find(t => t.email.toLowerCase() === searchEmail);
      if (tech) {
        setTechnicians(prev => prev.map(t => t.email.toLowerCase() === searchEmail ? { ...t, password: newPassword } : t));
        found = true;
      }
    }

    // 3. Check Clients
    if (!found) {
      const client = clients.find(c => c.email.toLowerCase() === searchEmail);
      if (client) {
        setClients(prev => prev.map(c => c.email.toLowerCase() === searchEmail ? { ...c, password: newPassword } : c));
        found = true;
      }
    }

    return found;
  };

  return (
    <Router>
      <Routes>
        <Route path="/support" element={<PublicClientPortal workOrders={workOrders} setWorkOrders={setWorkOrders} />} />
        
        <Route path="/*" element={
          !authUser ? (
            <div className="relative">
              <Login 
                onLogin={setAuthUser} 
                technicians={technicians} 
                clients={clients} 
                adminCredentials={adminCredentials}
                onResetPassword={handleResetPasswordByEmail}
              />
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <Link to="/support" className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/20 transition-all font-bold text-sm shadow-2xl">
                  <LifeBuoy size={18} className="text-blue-400" />
                  Client Support Portal (No Login Required)
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
              {/* Sidebar Mobile Overlay */}
              {sidebarOpen && (
                <div 
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[40] lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              <aside 
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 no-print ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 p-2 rounded-lg">
                        <ShieldCheck className="text-white" size={24} />
                      </div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">SCTWMS</h1>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
                      <X size={20} />
                    </button>
                  </div>

                  <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {authUser.role === UserRole.CLIENT ? (
                      <>
                        <SidebarContextAwareLink to="/" icon={LayoutDashboard} label="Dashboard" onClick={() => setSidebarOpen(false)} />
                        <SidebarContextAwareLink to="/work-orders" icon={ClipboardList} label="My Requests" onClick={() => setSidebarOpen(false)} />
                        <SidebarContextAwareLink to="/service-reports" icon={History} label="Service Records" onClick={() => setSidebarOpen(false)} />
                        <SidebarContextAwareLink to="/invoices" icon={Receipt} label="Billing" onClick={() => setSidebarOpen(false)} />
                      </>
                    ) : (
                      <>
                        <SidebarContextAwareLink to="/" icon={LayoutDashboard} label="Overview" onClick={() => setSidebarOpen(false)} />
                        <div className="pt-4 pb-2 px-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operations</p>
                        </div>
                        <SidebarContextAwareLink to="/work-orders" icon={ClipboardList} label={authUser.role === UserRole.ADMIN ? "All Work Orders" : "My Tasks"} onClick={() => setSidebarOpen(false)} />
                        <SidebarContextAwareLink to="/service-reports" icon={FileText} label="Service Reports" onClick={() => setSidebarOpen(false)} />
                        <SidebarContextAwareLink to="/handover" icon={Handshake} label="Site Handover" onClick={() => setSidebarOpen(false)} />
                        
                        {authUser.role === UserRole.ADMIN && (
                          <>
                            <div className="pt-4 pb-2 px-4">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administration</p>
                            </div>
                            <SidebarContextAwareLink to="/maintenance" icon={CalendarClock} label="Maintenance" onClick={() => setSidebarOpen(false)} />
                            <SidebarContextAwareLink to="/clients" icon={Building} label="Clients" onClick={() => setSidebarOpen(false)} />
                            <SidebarContextAwareLink to="/invoices" icon={Receipt} label="Billing" onClick={() => setSidebarOpen(false)} />
                            <SidebarContextAwareLink to="/admin" icon={UserCog} label="User Management" onClick={() => setSidebarOpen(false)} />
                          </>
                        )}
                      </>
                    )}
                    <div className="pt-4 pb-2 px-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</p>
                    </div>
                    <SidebarContextAwareLink to="/profile" icon={SettingsIcon} label="Account Settings" onClick={() => setSidebarOpen(false)} />
                  </nav>

                  <div className="p-4 mt-auto border-t border-slate-100 shrink-0">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center font-black text-xs shadow-sm ${
                          authUser.role === UserRole.ADMIN ? 'bg-slate-900 text-white' : 
                          authUser.role === UserRole.TECHNICIAN ? 'bg-blue-600 text-white' : 
                          'bg-emerald-600 text-white'
                        }`}>
                          {authUser.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">{authUser.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{authUser.role}</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-xs font-black uppercase transition-all"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </aside>

              <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 no-print">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                      <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-2 text-slate-400 overflow-hidden whitespace-nowrap">
                      <CalendarClock size={16} className="shrink-0" />
                      <span className="text-xs font-bold truncate">{new Date().toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                     <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                       <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Active Link</span>
                     </div>
                     <Link to="/profile" className="p-2 text-slate-400 hover:text-blue-600 rounded-full transition-colors group">
                       <SettingsIcon size={20} />
                     </Link>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                  <Routes>
                    <Route path="/profile" element={<Profile authUser={authUser} onUpdatePassword={handleUpdateUserPassword} />} />
                    {authUser.role === UserRole.CLIENT ? (
                      <>
                        <Route path="/" element={<ClientPortal workOrders={workOrders} setWorkOrders={setWorkOrders} reports={serviceReports} invoices={invoices} authUser={authUser} contracts={contracts} />} />
                        <Route path="/work-orders" element={<WorkOrders workOrders={workOrders} setWorkOrders={setWorkOrders} setServiceReports={setServiceReports} technicians={technicians} setTechnicians={setTechnicians} clients={clients} authUser={authUser} />} />
                        <Route path="/service-reports" element={<ServiceReports reports={serviceReports} setReports={setServiceReports} invoices={invoices} setInvoices={setInvoices} workOrders={workOrders} setWorkOrders={setWorkOrders} technicians={technicians} setTechnicians={setTechnicians} companyInfo={companyInfo} />} />
                        <Route path="/invoices" element={<Invoices invoices={invoices} setInvoices={setInvoices} workOrders={workOrders} reports={serviceReports} companyInfo={companyInfo} clients={clients} />} />
                      </>
                    ) : (
                      <>
                        <Route path="/" element={<Dashboard workOrders={workOrders} reports={serviceReports} invoices={invoices} technicians={technicians} authUser={authUser} />} />
                        <Route path="/work-orders" element={<WorkOrders workOrders={workOrders} setWorkOrders={setWorkOrders} setServiceReports={setServiceReports} technicians={technicians} setTechnicians={setTechnicians} clients={clients} authUser={authUser} />} />
                        <Route path="/service-reports" element={<ServiceReports reports={serviceReports} setReports={setServiceReports} invoices={invoices} setInvoices={setInvoices} workOrders={workOrders} setWorkOrders={setWorkOrders} technicians={technicians} setTechnicians={setTechnicians} companyInfo={companyInfo} />} />
                        <Route path="/handover" element={<SiteHandoverPage handovers={handovers} setHandovers={setHandovers} workOrders={workOrders} setWorkOrders={setWorkOrders} companyInfo={companyInfo} />} />
                        
                        {authUser.role === UserRole.ADMIN && (
                          <>
                            <Route path="/clients" element={<Clients clients={clients} setClients={setClients} workOrders={workOrders} invoices={invoices} />} />
                            <Route path="/maintenance" element={<Maintenance contracts={contracts} setContracts={setContracts} clients={clients} workOrders={workOrders} setWorkOrders={setWorkOrders} />} />
                            <Route path="/invoices" element={<Invoices invoices={invoices} setInvoices={setInvoices} workOrders={workOrders} reports={serviceReports} companyInfo={companyInfo} clients={clients} />} />
                            <Route path="/admin" element={<Admin technicians={technicians} setTechnicians={setTechnicians} clients={clients} setClients={setClients} companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} />} />
                          </>
                        )}
                      </>
                    )}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          )
        } />
      </Routes>
    </Router>
  );
};

export default App;