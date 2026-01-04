
import React, { useState } from 'react';
import { WorkOrder, WorkOrderStatus, ServiceReport, Invoice, CompanyInfo, Technician } from '../types';
import { polishServiceReport, generateInvoiceSummary } from '../services/geminiService';
import { getNextInvoiceId } from '../utils/invoiceUtils';
import { 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Loader2, 
  History,
  Receipt,
  ClipboardCheck,
  Plus,
  Trash2,
  Clock,
  Printer,
  X,
  Eye,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Timer
} from 'lucide-react';

interface ServiceReportsProps {
  reports: ServiceReport[];
  setReports: React.Dispatch<React.SetStateAction<ServiceReport[]>>;
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  technicians: Technician[];
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
  companyInfo: CompanyInfo;
}

const ServiceReports: React.FC<ServiceReportsProps> = ({ reports, setReports, workOrders, setWorkOrders, invoices, setInvoices, technicians, setTechnicians, companyInfo }) => {
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'CREATE' | 'REVIEW'>('CREATE');
  const [previewReportId, setPreviewReportId] = useState<string | null>(null);
  const [selectedWOId, setSelectedWOId] = useState('');
  const [findings, setFindings] = useState('');
  const [actions, setActions] = useState('');
  const [parts, setParts] = useState<{ item: string; quantity: number }[]>([]);
  const [newPart, setNewPart] = useState({ item: '', quantity: 1 });

  const assignedOrders = workOrders.filter(o => o.status === WorkOrderStatus.ASSIGNED);
  const previewReport = reports.find(r => r.id === previewReportId);
  const previewWO = previewReport ? workOrders.find(o => o.id === previewReport.workOrderId) : null;

  const handleAddPart = () => { if (!newPart.item) return; setParts([...parts, { ...newPart }]); setNewPart({ item: '', quantity: 1 }); };
  const removePart = (index: number) => { setParts(parts.filter((_, i) => i !== index)); };
  const formatSeconds = (seconds: number) => { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); return `${h}h ${m}m`; };

  const handlePolish = async () => { if (!findings || !actions) return; setIsPolishing(true); const result = await polishServiceReport(findings, actions); setFindings(result.polishedFindings); setActions(result.polishedActions); setIsPolishing(false); };

  const submitReport = () => {
    if (!selectedWOId) return;
    const wo = workOrders.find(o => o.id === selectedWOId);
    if (!wo) return;
    const newReport: ServiceReport = { id: `SR-${Date.now()}`, workOrderId: selectedWOId, technicianName: wo.assignedTechnician || 'Unknown', findings, actionsTaken: actions, partsUsed: parts, completionDate: new Date().toISOString(), clientAcknowledged: true, reviewedByAdmin: false, manHours: wo.totalDurationSeconds ? formatSeconds(wo.totalDurationSeconds) : undefined };
    setReports([newReport, ...reports]);
    setWorkOrders(prev => prev.map(o => o.id === selectedWOId ? { ...o, status: WorkOrderStatus.COMPLETED } : o));
    if (wo.assignedTechnician) { setTechnicians(prev => prev.map(tech => tech.name === wo.assignedTechnician ? { ...tech, status: 'Available' } : tech)); }
    setSelectedWOId(''); setFindings(''); setActions(''); setParts([]); setActiveTab('REVIEW');
  };

  const markAsReviewed = (reportId: string) => { setReports(prev => prev.map(r => r.id === reportId ? { ...r, reviewedByAdmin: true } : r)); };

  const generateInvoiceFromReport = async (report: ServiceReport) => {
    setIsGeneratingInvoice(report.id);
    try {
      const wo = workOrders.find(o => o.id === report.workOrderId);
      const reportContext = `Scope: ${wo?.jobScope}. Findings: ${report.findings}. Actions: ${report.actionsTaken}. Man-Hours: ${report.manHours}. Parts: ${report.partsUsed.map(p => `${p.quantity}x ${p.item}`).join(', ')}`;
      const suggestedItems = await generateInvoiceSummary(reportContext);
      const totalAmount = suggestedItems.reduce((acc: number, item: any) => acc + item.amount, 0);
      const invoiceDate = new Date(); const dueDate = new Date(); dueDate.setDate(invoiceDate.getDate() + 14);
      const sequentialId = getNextInvoiceId(invoices);
      const newInvoice: Invoice = { id: sequentialId, serviceReportId: report.id, workOrderId: report.workOrderId, invoiceDate: invoiceDate.toISOString(), dueDate: dueDate.toISOString(), paymentTerms: `Please make payment within 14 days. Checks payable to ${companyInfo.name}. For PayNow, please use UEN: 2024XXXXXZ`, totalAmount: totalAmount, items: suggestedItems, status: 'DRAFT' };
      setInvoices(prev => [newInvoice, ...prev]); setWorkOrders(prev => prev.map(o => o.id === report.workOrderId ? { ...o, status: WorkOrderStatus.INVOICED } : o));
    } catch (error) { console.error("Failed to generate invoice:", error); } finally { setIsGeneratingInvoice(null); }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div><h2 className="text-2xl font-bold text-slate-900">Service Reports</h2><p className="text-slate-500">Field documentation and certificates</p></div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm"><button onClick={() => setActiveTab('CREATE')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'CREATE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Create Report</button><button onClick={() => setActiveTab('REVIEW')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'REVIEW' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Admin Review ({reports.filter(r => !r.reviewedByAdmin).length})</button></div>
      </header>

      {/* Tabs CREATE/REVIEW logic remains same, focus on preview logic update */}
      {activeTab === 'CREATE' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300 no-print">
           <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest"><FileText size={18} /><span>Job Documentation</span></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Work Order Reference</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" value={selectedWOId} onChange={e => setSelectedWOId(e.target.value)}><option value="">-- Select Active Assignment --</option>{assignedOrders.map(wo => (<option key={wo.id} value={wo.id}>{wo.id} - {wo.clientName} ({wo.jobScope})</option>))}</select></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Technical Findings</label><textarea rows={8} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm" placeholder="Symptoms observed..." value={findings} onChange={e => setFindings(e.target.value)} /></div><div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Actions Taken</label><textarea rows={8} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm" placeholder="Repairs done..." value={actions} onChange={e => setActions(e.target.value)} /></div></div>
                <div className="pt-2"><button onClick={handlePolish} disabled={isPolishing || !findings || !actions} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"><Sparkles className="text-amber-400" size={16} />{isPolishing ? 'Gemini AI working...' : 'Polish Report with AI'}</button></div>
              </div>
              <div className="pt-6"><button onClick={submitReport} disabled={!selectedWOId || !findings || !actions} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 uppercase tracking-widest text-sm">Submit Completion Report</button></div>
            </div>
            <div className="space-y-6"><div className="bg-slate-50 rounded-3xl p-6 h-fit border border-slate-100"><h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-blue-500" />Service Log Info</h4><p className="text-xs text-slate-500 italic">Verify system functionality before submission.</p></div></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 no-print">{reports.map(report => (<div key={report.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex justify-between items-center"><div className="flex items-center gap-4"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><FileText size={24} /></div><div><h3 className="font-bold">{report.id}</h3><p className="text-sm text-slate-500">{report.technicianName}</p></div></div><button onClick={() => setPreviewReportId(report.id)} className="p-2 text-slate-400 hover:text-blue-600"><Eye size={20} /></button></div>))}</div>
      )}

      {/* Report Document Preview */}
      {previewReportId && previewReport && previewWO && (
        <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10">
          <div className="bg-white w-full max-w-4xl h-full flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print"><button onClick={() => setPreviewReportId(null)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm"><ArrowLeft size={18} />Back to List</button><button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-sm"><Printer size={18} />Print Certificate</button></div>
            <div className="flex-1 overflow-y-auto p-8 lg:p-16 print:p-0">
              <div className="max-w-3xl mx-auto space-y-12 print-only">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    {companyInfo.logoUrl ? (
                      <img src={companyInfo.logoUrl} className="h-20 w-auto object-contain" />
                    ) : (
                      <h1 className="text-3xl font-black text-blue-600 tracking-tighter">SCTWMS</h1>
                    )}
                    <div className="text-xs text-slate-500 space-y-1"><p className="font-bold text-slate-900 uppercase">{companyInfo.name}</p><p className="w-64">{companyInfo.address}</p><p>Phone: {companyInfo.phone} | Email: {companyInfo.email}</p></div>
                  </div>
                  <div className="text-right"><div className="bg-slate-900 text-white px-6 py-2 rounded-lg font-black uppercase text-sm tracking-widest mb-4">Service Completion Cert</div><p className="text-xs font-bold text-slate-400">Cert No: <span className="text-slate-900">{previewReport.id}</span></p><p className="text-xs font-bold text-slate-400">Date: <span className="text-slate-900">{new Date(previewReport.completionDate).toLocaleDateString()}</span></p></div>
                </div>
                <div className="h-px bg-slate-200"></div>
                <div className="grid grid-cols-2 gap-12"><div><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Client Details:</h4><p className="font-bold text-slate-900 text-lg">{previewWO.clientName}</p><p className="text-xs text-slate-500 mt-2">{previewWO.clientAddress}</p></div><div className="text-right"><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Job Reference:</h4><p className="text-sm font-bold">Work Order: {previewWO.id}</p><p className="text-sm text-blue-600 mt-1">{previewWO.jobScope}</p></div></div>
                <div className="space-y-8"><div className="space-y-3"><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded w-fit">Findings & Diagnosis</h4><p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{previewReport.findings}</p></div><div className="space-y-3"><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded w-fit">Actions & Resolution</h4><p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{previewReport.actionsTaken}</p></div></div>
                <div className="h-px bg-slate-200"></div>
                <div className="grid grid-cols-2 gap-20 pt-10"><div className="space-y-12"><div className="h-px bg-slate-300 w-full"></div><div><p className="text-[10px] font-bold text-slate-400 uppercase">Technician Acknowledgment</p><p className="text-xs font-bold text-slate-900 mt-1">{previewReport.technicianName}</p></div></div><div className="space-y-12"><div className="h-px bg-slate-300 w-full"></div><div><p className="text-[10px] font-bold text-slate-400 uppercase">Client Verification</p><p className="text-xs font-bold text-slate-900 mt-1">Authorized Representative</p></div></div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceReports;
