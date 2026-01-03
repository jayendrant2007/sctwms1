
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
  
  // Local form state for new report
  const [selectedWOId, setSelectedWOId] = useState('');
  const [findings, setFindings] = useState('');
  const [actions, setActions] = useState('');
  const [parts, setParts] = useState<{ item: string; quantity: number }[]>([]);
  const [newPart, setNewPart] = useState({ item: '', quantity: 1 });

  const assignedOrders = workOrders.filter(o => o.status === WorkOrderStatus.ASSIGNED);
  const previewReport = reports.find(r => r.id === previewReportId);
  const previewWO = previewReport ? workOrders.find(o => o.id === previewReport.workOrderId) : null;

  const handleAddPart = () => {
    if (!newPart.item) return;
    setParts([...parts, { ...newPart }]);
    setNewPart({ item: '', quantity: 1 });
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const formatSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const handlePolish = async () => {
    if (!findings || !actions) return;
    setIsPolishing(true);
    const result = await polishServiceReport(findings, actions);
    setFindings(result.polishedFindings);
    setActions(result.polishedActions);
    setIsPolishing(false);
  };

  const submitReport = () => {
    if (!selectedWOId) return;
    const wo = workOrders.find(o => o.id === selectedWOId);
    if (!wo) return;

    const newReport: ServiceReport = {
      id: `SR-${Date.now()}`,
      workOrderId: selectedWOId,
      technicianName: wo.assignedTechnician || 'Unknown',
      findings,
      actionsTaken: actions,
      partsUsed: parts,
      completionDate: new Date().toISOString(),
      clientAcknowledged: true,
      reviewedByAdmin: false,
      manHours: wo.totalDurationSeconds ? formatSeconds(wo.totalDurationSeconds) : undefined
    };

    setReports([newReport, ...reports]);
    setWorkOrders(prev => prev.map(o => o.id === selectedWOId ? { ...o, status: WorkOrderStatus.COMPLETED } : o));
    
    // Release Technician (Set back to Available)
    if (wo.assignedTechnician) {
      setTechnicians(prev => prev.map(tech => 
        tech.name === wo.assignedTechnician ? { ...tech, status: 'Available' } : tech
      ));
    }

    // Reset form
    setSelectedWOId('');
    setFindings('');
    setActions('');
    setParts([]);
    setActiveTab('REVIEW');
  };

  const markAsReviewed = (reportId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, reviewedByAdmin: true } : r));
  };

  const rejectReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report && confirm('Are you sure you want to send this report back to the technician?')) {
      const wo = workOrders.find(o => o.id === report.workOrderId);
      setWorkOrders(prev => prev.map(o => o.id === report.workOrderId ? { ...o, status: WorkOrderStatus.ASSIGNED } : o));
      
      // Set technician back to 'On Site' since job is still ongoing
      if (wo?.assignedTechnician) {
        setTechnicians(prev => prev.map(tech => 
          tech.name === wo.assignedTechnician ? { ...tech, status: 'On Site' } : tech
        ));
      }

      setReports(prev => prev.filter(r => r.id !== reportId));
    }
  };

  const generateInvoiceFromReport = async (report: ServiceReport) => {
    setIsGeneratingInvoice(report.id);
    try {
      const wo = workOrders.find(o => o.id === report.workOrderId);
      const reportContext = `Scope: ${wo?.jobScope}. Findings: ${report.findings}. Actions: ${report.actionsTaken}. Man-Hours: ${report.manHours}. Parts: ${report.partsUsed.map(p => `${p.quantity}x ${p.item}`).join(', ')}`;
      const suggestedItems = await generateInvoiceSummary(reportContext);
      
      const totalAmount = suggestedItems.reduce((acc: number, item: any) => acc + item.amount, 0);

      const invoiceDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(invoiceDate.getDate() + 14);

      const sequentialId = getNextInvoiceId(invoices);

      const newInvoice: Invoice = {
        id: sequentialId,
        serviceReportId: report.id,
        workOrderId: report.workOrderId,
        invoiceDate: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        paymentTerms: `Please make payment within 14 days. Checks payable to ${companyInfo.name}. For PayNow, please use UEN: 2024XXXXXZ`,
        totalAmount: totalAmount,
        items: suggestedItems,
        status: 'DRAFT'
      };
      
      setInvoices(prev => [newInvoice, ...prev]);
      setWorkOrders(prev => prev.map(o => o.id === report.workOrderId ? { ...o, status: WorkOrderStatus.INVOICED } : o));
    } catch (error) {
      console.error("Failed to generate invoice:", error);
    } finally {
      setIsGeneratingInvoice(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Service Reports</h2>
          <p className="text-slate-500">Field documentation and certificates</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('CREATE')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'CREATE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Create Report
          </button>
          <button 
            onClick={() => setActiveTab('REVIEW')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'REVIEW' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Admin Review ({reports.filter(r => !r.reviewedByAdmin).length})
          </button>
        </div>
      </header>

      {activeTab === 'CREATE' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300 no-print">
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest">
                  <FileText size={18} />
                  <span>Job Documentation</span>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Work Order Reference</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    value={selectedWOId}
                    onChange={e => setSelectedWOId(e.target.value)}
                  >
                    <option value="">-- Select Active Assignment --</option>
                    {assignedOrders.map(wo => (
                      <option key={wo.id} value={wo.id}>{wo.id} - {wo.clientName} ({wo.jobScope})</option>
                    ))}
                  </select>
                </div>

                {selectedWOId && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="text-blue-600" size={18} />
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Recorded Man-Hours</span>
                    </div>
                    <span className="text-sm font-black text-blue-700 font-mono">
                      {workOrders.find(wo => wo.id === selectedWOId)?.totalDurationSeconds 
                        ? formatSeconds(workOrders.find(wo => wo.id === selectedWOId)!.totalDurationSeconds!)
                        : '0h 0m'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Technical Findings</label>
                    <textarea 
                      rows={8} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm" 
                      placeholder="Symptoms observed, fault analysis..." 
                      value={findings} 
                      onChange={e => setFindings(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Actions Taken</label>
                    <textarea 
                      rows={8} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm" 
                      placeholder="Repairs done, tests performed, final status..." 
                      value={actions} 
                      onChange={e => setActions(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handlePolish} 
                    disabled={isPolishing || !findings || !actions} 
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="text-amber-400" size={16} /> 
                    {isPolishing ? 'Gemini AI working...' : 'Polish Report with AI'}
                  </button>
                </div>
              </div>

              {/* Parts Tracker */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest">
                  <Receipt size={18} />
                  <span>Parts & Consumables</span>
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Item Description (e.g. 1TB HDD)" 
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                    value={newPart.item}
                    onChange={e => setNewPart({...newPart, item: e.target.value})}
                  />
                  <input 
                    type="number" 
                    className="w-20 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                    value={newPart.quantity}
                    onChange={e => setNewPart({...newPart, quantity: parseInt(e.target.value) || 1})}
                  />
                  <button 
                    onClick={handleAddPart}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100"
                  >
                    <Plus size={24} />
                  </button>
                </div>

                {parts.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white border-b border-slate-200">
                        <tr className="text-[10px] uppercase font-black text-slate-400">
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3 text-center w-24">Qty</th>
                          <th className="px-4 py-3 text-right w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parts.map((p, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 font-medium text-slate-700">{p.item}</td>
                            <td className="px-4 py-3 text-center text-slate-500 font-bold">{p.quantity}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => removePart(i)} className="text-red-400 hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button 
                  onClick={submitReport} 
                  disabled={!selectedWOId || !findings || !actions} 
                  className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                  Submit Completion Report
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-3xl p-6 h-fit border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-blue-500" />
                  Service Log Info
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Check</label>
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      Job Completed on Site
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Technician Note</label>
                    <p className="text-xs text-slate-500 italic">Always verify system functionality with the client before submitting the report.</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-100">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-widest">
                  <AlertCircle size={18} />
                  Handover Tip
                </h4>
                <p className="text-xs text-blue-50 leading-relaxed">
                  Upon submission, this report becomes a Service Completion Certificate. You can print it immediately for the client to sign.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-left-4 duration-300 no-print">
          {reports.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Reports Found</h3>
              <p className="text-slate-500">Service completions will appear here for review.</p>
            </div>
          ) : (
            reports.map(report => {
              const wo = workOrders.find(o => o.id === report.workOrderId);
              const isAlreadyInvoiced = wo?.status === WorkOrderStatus.INVOICED;
              
              return (
                <div key={report.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-200 transition-colors">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${report.reviewedByAdmin ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {report.reviewedByAdmin ? <ClipboardCheck size={24} /> : <CheckCircle size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{wo?.clientName}</h3>
                          <span className="text-xs font-mono text-slate-400 uppercase">{report.id}</span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          Tech: <b>{report.technicianName}</b> • Done: {new Date(report.completionDate).toLocaleDateString()}
                          {report.manHours && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-500 uppercase">
                              <Timer size={10} /> {report.manHours}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setPreviewReportId(report.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Full Certificate"
                      >
                        <Eye size={20} />
                      </button>

                      {!report.reviewedByAdmin ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => rejectReport(report.id)}
                            className="px-4 py-2 text-red-600 text-xs font-bold hover:bg-red-50 rounded-xl transition-all"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => markAsReviewed(report.id)}
                            className="px-6 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-50"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {!isAlreadyInvoiced && (
                            <button 
                              onClick={() => generateInvoiceFromReport(report)}
                              disabled={isGeneratingInvoice === report.id}
                              className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-50 disabled:opacity-70"
                            >
                              {isGeneratingInvoice === report.id ? 'Working...' : 'Convert to Invoice'}
                            </button>
                          )}
                          {isAlreadyInvoiced && (
                            <span className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs flex items-center gap-2">
                              <Receipt size={14} /> Invoiced
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technician Observations</h4>
                      <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 line-clamp-3">{report.findings}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Summary</h4>
                      <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 line-clamp-3">{report.actionsTaken}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Report Document Preview Overlay */}
      {previewReportId && previewReport && previewWO && (
        <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10">
          <div className="bg-white w-full max-w-4xl h-full flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Overlay Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
              <button 
                onClick={() => setPreviewReportId(null)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm"
              >
                <ArrowLeft size={18} />
                Back to List
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-sm transition-all"
                >
                  <Printer size={18} />
                  Print Certificate
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-16 print:p-0">
              <div className="max-w-3xl mx-auto space-y-12 print-only">
                {/* Brand Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <h1 className="text-3xl font-black text-blue-600 tracking-tighter">SCTWMS</h1>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p className="font-bold text-slate-900 uppercase">{companyInfo.name}</p>
                      <p className="w-64">{companyInfo.address}</p>
                      <p>Phone: {companyInfo.phone} | Email: {companyInfo.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-slate-900 text-white px-6 py-2 rounded-lg font-black uppercase text-sm tracking-widest mb-4">
                      Service Completion Cert
                    </div>
                    <p className="text-xs font-bold text-slate-400">Cert No: <span className="text-slate-900">{previewReport.id}</span></p>
                    <p className="text-xs font-bold text-slate-400">Date: <span className="text-slate-900">{new Date(previewReport.completionDate).toLocaleDateString()}</span></p>
                  </div>
                </div>

                <div className="h-px bg-slate-200"></div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Client Details:</h4>
                    <p className="font-bold text-slate-900 text-lg leading-tight">{previewWO.clientName}</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{previewWO.clientAddress}</p>
                    <p className="text-xs text-slate-500 mt-1">Contact: {previewWO.clientContact}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Job Reference:</h4>
                    <p className="text-sm font-bold text-slate-900">Work Order: {previewWO.id}</p>
                    <p className="text-sm font-medium text-blue-600 mt-1">{previewWO.jobScope}</p>
                    <p className="text-xs text-slate-500 mt-1">Technician: {previewReport.technicianName}</p>
                    {previewReport.manHours && <p className="text-xs text-slate-500 mt-1">Service Duration: <b>{previewReport.manHours}</b></p>}
                  </div>
                </div>

                {/* Technical Sections */}
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded w-fit">Findings & Diagnosis</h4>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{previewReport.findings}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded w-fit">Actions & Resolution</h4>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{previewReport.actionsTaken}</p>
                  </div>
                </div>

                {/* Parts Table */}
                {previewReport.partsUsed.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded w-fit">Parts/Consumables Replaced</h4>
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b-2 border-slate-900">
                          <th className="py-2">Item Description</th>
                          <th className="py-2 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewReport.partsUsed.map((p, i) => (
                          <tr key={i}>
                            <td className="py-3 text-slate-700 font-medium">{p.item}</td>
                            <td className="py-3 text-right text-slate-900 font-bold">{p.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="h-px bg-slate-200"></div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-20 pt-10">
                  <div className="space-y-12">
                    <div className="h-px bg-slate-300 w-full"></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Technician Acknowledgment</p>
                      <p className="text-xs font-bold text-slate-900 mt-1">{previewReport.technicianName}</p>
                      <p className="text-[10px] text-slate-500">Smart City Technologies Pte Ltd</p>
                    </div>
                  </div>
                  <div className="space-y-12">
                    <div className="h-px bg-slate-300 w-full"></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Client Verification</p>
                      <p className="text-xs font-bold text-slate-900 mt-1">Authorized Representative</p>
                      <p className="text-[10px] text-slate-500 italic mt-1">Digitally certified as complete</p>
                    </div>
                  </div>
                </div>

                {/* Footer Brand */}
                <div className="text-center pt-20">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">Security • Integration • Precision</p>
                  <p className="text-[8px] text-slate-300 mt-2 uppercase">© {new Date().getFullYear()} {companyInfo.name}. All Rights Reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceReports;
