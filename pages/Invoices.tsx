
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Invoice, WorkOrder, ServiceReport, CompanyInfo, Client } from '../types';
import { getNextInvoiceId } from '../utils/invoiceUtils';
import { 
  Receipt, 
  Download, 
  Mail, 
  Printer, 
  MoreVertical,
  AlertCircle,
  FileEdit,
  Loader2,
  CheckCircle2,
  Trash2,
  Plus,
  X,
  Building,
  Calendar,
  FileText,
  ShieldCheck,
  Zap,
  SendHorizontal,
  ArrowLeft,
  Banknote,
  Coins,
  BarChart3,
  Clock,
  ArrowUpRight,
  Filter,
  ExternalLink,
  Edit3
} from 'lucide-react';

interface InvoicesProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  workOrders: WorkOrder[];
  reports: ServiceReport[];
  clients: Client[];
  companyInfo: CompanyInfo;
}

const Invoices: React.FC<InvoicesProps> = ({ invoices, setInvoices, workOrders, reports, clients, companyInfo }) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'preparing' | 'sending' | 'sent'>('idle');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  
  // State for confirming payment date in detail view
  const [receivedDateInput, setReceivedDateInput] = useState(new Date().toISOString().split('T')[0]);

  // Manual Invoice Form State
  const [newManualInvoice, setNewManualInvoice] = useState<{
    clientId: string;
    serviceReportId: string;
    items: { description: string; amount: number }[];
    dueDate: string;
    paymentReceivedDate: string;
    isAlreadyPaid: boolean;
  }>({
    clientId: '',
    serviceReportId: '',
    items: [{ description: 'Technical Consultation & Site Attendance', amount: 150 }],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentReceivedDate: new Date().toISOString().split('T')[0],
    isAlreadyPaid: false
  });
  
  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);
  const wo = selectedInvoice ? workOrders.find(o => o.id === selectedInvoice.workOrderId) : null;
  const report = selectedInvoice ? reports.find(r => r.id === selectedInvoice.serviceReportId) : null;

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'PAID';
  };

  // Filter logic
  const filteredInvoices = showOverdueOnly 
    ? invoices.filter(inv => isOverdue(inv.dueDate, inv.status))
    : invoices;

  // Aging Calculations
  const calculateAging = () => {
    const today = new Date();
    const buckets = {
      t1: { amount: 0, count: 0 }, // 0-30 days
      t2: { amount: 0, count: 0 }, // 31-60 days
      t3: { amount: 0, count: 0 }  // 61+ days
    };

    invoices.filter(inv => inv.status !== 'PAID').forEach(inv => {
      const dueDate = new Date(inv.dueDate);
      if (dueDate < today) {
        const diffDays = Math.ceil(Math.abs(today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          buckets.t1.amount += inv.totalAmount;
          buckets.t1.count++;
        } else if (diffDays <= 60) {
          buckets.t2.amount += inv.totalAmount;
          buckets.t2.count++;
        } else {
          buckets.t3.amount += inv.totalAmount;
          buckets.t3.count++;
        }
      }
    });
    return buckets;
  };

  const agingData = calculateAging();

  const handleCreateManualInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualInvoice.clientId) return;

    const totalAmount = newManualInvoice.items.reduce((acc, item) => acc + item.amount, 0);
    
    const invoice: Invoice = {
      id: getNextInvoiceId(invoices),
      clientId: newManualInvoice.clientId,
      serviceReportId: newManualInvoice.serviceReportId || undefined,
      workOrderId: reports.find(r => r.id === newManualInvoice.serviceReportId)?.workOrderId,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(newManualInvoice.dueDate).toISOString(),
      paymentReceivedDate: newManualInvoice.isAlreadyPaid ? new Date(newManualInvoice.paymentReceivedDate).toISOString() : undefined,
      paymentTerms: `Standard Payment Terms: 14 Days Net.\nPlease make payment within 14 days. Checks payable to ${companyInfo.name}. For PayNow, please use UEN: 2024XXXXXZ`,
      totalAmount: totalAmount,
      items: newManualInvoice.items,
      status: newManualInvoice.isAlreadyPaid ? 'PAID' : 'DRAFT'
    };

    setInvoices([invoice, ...invoices]);
    setShowCreateModal(false);
    setSelectedInvoiceId(invoice.id);
    
    setNewManualInvoice({
      clientId: '',
      serviceReportId: '',
      items: [{ description: 'Technical Consultation & Site Attendance', amount: 150 }],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentReceivedDate: new Date().toISOString().split('T')[0],
      isAlreadyPaid: false
    });
  };

  const handleUpdateTerms = (terms: string) => {
    if (!selectedInvoiceId) return;
    setInvoices(prev => prev.map(inv => 
      inv.id === selectedInvoiceId ? { ...inv, paymentTerms: terms } : inv
    ));
  };

  const handleUpdateClientName = (name: string) => {
    if (!selectedInvoiceId) return;
    setInvoices(prev => prev.map(inv => 
      inv.id === selectedInvoiceId ? { ...inv, clientNameOverride: name } : inv
    ));
  };

  const handleUpdateWorkOrderId = (id: string) => {
    if (!selectedInvoiceId) return;
    setInvoices(prev => prev.map(inv => 
      inv.id === selectedInvoiceId ? { ...inv, workOrderId: id } : inv
    ));
  };

  const applyTermsPreset = (days: number | 'COD') => {
    if (!selectedInvoiceId) return;
    let template = "";
    if (days === 'COD') {
      template = `Payment Mode: COD (Cash on Delivery).\nPlease settle balance upon site completion. For PayNow: UEN 2024XXXXXZ. Thank you for your business!`;
      handleUpdateDueDate(new Date().toISOString().split('T')[0]);
    } else {
      template = `Payment Terms: ${days} Days Net.\nPlease make payment by the due date. Checks payable to ${companyInfo.name}. For PayNow, please use UEN: 2024XXXXXZ`;
      
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + (days as number));
      handleUpdateDueDate(newDueDate.toISOString().split('T')[0]);
    }
    handleUpdateTerms(template);
  };

  const handleUpdateDueDate = (dateStr: string) => {
    if (!selectedInvoiceId) return;
    setInvoices(prev => prev.map(inv => 
      inv.id === selectedInvoiceId ? { ...inv, dueDate: new Date(dateStr).toISOString() } : inv
    ));
  };

  const handleUpdateReceivedDate = (dateStr: string) => {
    if (!selectedInvoiceId) return;
    setInvoices(prev => prev.map(inv => 
      inv.id === selectedInvoiceId ? { ...inv, paymentReceivedDate: new Date(dateStr).toISOString(), status: 'PAID' } : inv
    ));
  };

  const handleUpdateItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    if (!selectedInvoiceId) return;
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== selectedInvoiceId) return inv;
      const newItems = [...inv.items];
      newItems[index] = { ...newItems[index], [field]: value };
      const newTotal = newItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
      return { ...inv, items: newItems, totalAmount: newTotal };
    }));
  };

  const handleAddItem = () => {
    if (!selectedInvoiceId) return;
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== selectedInvoiceId) return inv;
      const newItems = [...inv.items, { description: 'New Service Item', amount: 0 }];
      return { ...inv, items: newItems };
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (!selectedInvoiceId) return;
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== selectedInvoiceId) return inv;
      const newItems = inv.items.filter((_, i) => i !== index);
      const newTotal = newItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
      return { ...inv, items: newItems, totalAmount: newTotal };
    }));
  };

  const handleMarkAsPaid = (id?: string) => {
    const targetId = id || selectedInvoiceId;
    if (!targetId) return;
    setInvoices(prev => prev.map(inv => 
      inv.id === targetId ? { ...inv, status: 'PAID', paymentReceivedDate: new Date(receivedDateInput).toISOString() } : inv
    ));
    if (!id) alert(`Invoice ${targetId} marked as PAID.`);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    window.print();
    setIsDownloading(false);
  };

  const handleEmailInvoice = async () => {
    if (!selectedInvoice) return;
    setEmailStatus('sending');
    setIsSendingEmail(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setInvoices(prev => prev.map(inv => 
      inv.id === selectedInvoice.id && (inv.status === 'DRAFT' || inv.status === 'SENT') ? { ...inv, status: 'SENT' } : inv
    ));
    setEmailStatus('sent');
    setIsSendingEmail(false);
    setTimeout(() => setEmailStatus('idle'), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Billing & Revenue</h2>
          <p className="text-slate-500 font-medium">Manage receivables and generate tax invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-xs border-2 shadow-sm ${
              showOverdueOnly 
              ? 'bg-red-50 border-red-200 text-red-600 shadow-red-50' 
              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <Filter size={18} />
            {showOverdueOnly ? 'Show All Invoices' : 'Filter Overdue Only'}
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100"
          >
            <Plus size={18} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Aging Analysis Section */}
      <section className="no-print">
         <div className="flex items-center gap-3 mb-6 px-2">
            <BarChart3 className="text-blue-600" size={20} />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Receivables Aging Analysis</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AgingCard 
              label="0-30 Days Overdue" 
              amount={agingData.t1.amount} 
              count={agingData.t1.count} 
              color="text-amber-600" 
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
              icon={Clock}
              isActive={showOverdueOnly}
            />
            <AgingCard 
              label="31-60 Days Overdue" 
              amount={agingData.t2.amount} 
              count={agingData.t2.count} 
              color="text-orange-600" 
              bgColor="bg-orange-50"
              borderColor="border-orange-100"
              icon={AlertCircle}
              isActive={showOverdueOnly}
            />
            <AgingCard 
              label="61+ Days Overdue" 
              amount={agingData.t3.amount} 
              count={agingData.t3.count} 
              color="text-red-600" 
              bgColor="bg-red-50"
              borderColor="border-red-100"
              icon={ShieldCheck}
              isActive={showOverdueOnly}
            />
         </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-4 no-print">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-8 py-6">Invoice Ref</th>
                    <th className="px-8 py-6">Client Entity</th>
                    <th className="px-8 py-6 text-right">Amount (SGD)</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6">Due Date</th>
                    <th className="px-8 py-6">Received Date</th>
                    <th className="px-8 py-6 text-right pr-12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Receipt size={64} className="text-slate-100" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {showOverdueOnly ? 'No overdue invoices found.' : 'Zero invoice entries in the current ledger.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(invoice => {
                      const client = clients.find(c => c.id === invoice.clientId)?.name || workOrders.find(o => o.id === invoice.workOrderId)?.clientName || invoice.clientNameOverride || "Direct Client";
                      const overdue = isOverdue(invoice.dueDate, invoice.status);
                      return (
                        <tr 
                          key={invoice.id} 
                          onClick={() => { setSelectedInvoiceId(invoice.id); setEmailStatus('idle'); }}
                          className={`hover:bg-slate-50/50 cursor-pointer transition-colors group ${selectedInvoiceId === invoice.id ? 'bg-blue-50/50' : ''}`}
                        >
                          <td className="px-8 py-6"><span className="text-sm font-black text-slate-900 font-mono tracking-tighter">{invoice.id}</span></td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <Building size={16} className="text-slate-300" />
                              <span className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{client}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right"><span className="text-sm font-black text-slate-900 font-mono">${invoice.totalAmount.toFixed(2)}</span></td>
                          <td className="px-8 py-6">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-2 ${
                              invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              invoice.status === 'SENT' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                              'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>{invoice.status}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`text-xs font-bold flex items-center gap-2 ${overdue ? 'text-red-500' : 'text-slate-500'}`}>
                              <Calendar size={14} className={overdue ? 'text-red-400' : 'text-slate-300'} /> {new Date(invoice.dueDate).toLocaleDateString()}
                              {overdue && <AlertCircle size={14} className="animate-pulse" />}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            {invoice.paymentReceivedDate ? (
                              <span className="text-xs font-black text-emerald-600 flex items-center gap-2 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                                <Banknote size={14} /> {new Date(invoice.paymentReceivedDate).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Pending</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right pr-10">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {invoice.status !== 'PAID' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedInvoiceId(invoice.id); }}
                                  className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                  title="Record Payment"
                                >
                                  <Coins size={18} />
                                </button>
                              )}
                              <div className="p-2.5 text-slate-300 hover:text-blue-500 transition-colors">
                                <MoreVertical size={18} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          {selectedInvoice ? (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-10 lg:p-12 sticky top-8 animate-in slide-in-from-bottom-6 duration-500 print-only">
              <div className="flex flex-col gap-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-black text-blue-600 tracking-tighter">SCTWMS</h1>
                    <div className="mt-8 text-[11px] text-slate-500 space-y-1.5 font-bold uppercase tracking-widest">
                      <p className="text-slate-900 text-base font-black leading-tight mb-2">{companyInfo.name}</p>
                      <p className="w-56 leading-relaxed">{companyInfo.address}</p>
                      <p>Phone: {companyInfo.phone}</p>
                      <p>Email: {companyInfo.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter">TAX INVOICE</h2>
                    <p className="text-sm font-black text-slate-400 mt-3">#{selectedInvoice.id}</p>
                    <div className="mt-6 space-y-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <p>Issue Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                      <div className="flex items-center justify-end gap-3 no-print bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                         <span className="text-slate-400">Payment Due:</span>
                         <input type="date" className="bg-transparent border-none rounded-lg px-2 py-1 focus:ring-0 outline-none font-black text-slate-900" value={selectedInvoice.dueDate.split('T')[0]} onChange={(e) => handleUpdateDueDate(e.target.value)} />
                      </div>
                      <p className="text-red-500 hidden print:block font-black text-xs">PAYMENT DUE DATE: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Invoice Recipient</h4>
                    <div className="relative group/edit no-print">
                      <div className="flex items-center gap-2 mb-1 opacity-0 group-hover/edit:opacity-100 transition-opacity">
                        <Edit3 size={10} className="text-blue-500" />
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Edit Client Name Override</span>
                      </div>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border-b-2 border-transparent hover:border-blue-200 focus:border-blue-500 focus:bg-white rounded-lg px-2 py-2 font-black text-slate-900 text-xl leading-tight transition-all outline-none"
                        value={selectedInvoice.clientNameOverride !== undefined ? selectedInvoice.clientNameOverride : (clients.find(c => c.id === selectedInvoice.clientId)?.name || wo?.clientName || '')}
                        onChange={(e) => handleUpdateClientName(e.target.value)}
                        placeholder="Client Name"
                      />
                    </div>
                    <p className="font-black text-slate-900 text-xl leading-tight hidden print:block">
                      {selectedInvoice.clientNameOverride || clients.find(c => c.id === selectedInvoice.clientId)?.name || wo?.clientName || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-3">{clients.find(c => c.id === selectedInvoice.clientId)?.address || wo?.clientAddress}</p>
                    <div className="mt-5 space-y-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      <p>{clients.find(c => c.id === selectedInvoice.clientId)?.uen ? `UEN: ${clients.find(c => c.id === selectedInvoice.clientId)?.uen}` : ''}</p>
                      <p>{clients.find(c => c.id === selectedInvoice.clientId)?.email || wo?.clientEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Project Context</h4>
                    <div className="text-[11px] font-black text-slate-900 uppercase flex flex-col items-end gap-1">
                      <div className="flex flex-col items-end group/ref no-print">
                        <div className="flex items-center gap-2 mb-1 opacity-0 group-hover/ref:opacity-100 transition-opacity">
                          <Edit3 size={10} className="text-blue-500" />
                          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Edit Service Ref</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Service Ref:</span>
                          <input 
                            type="text" 
                            className="bg-slate-50 border-b-2 border-transparent hover:border-blue-200 focus:border-blue-500 focus:bg-white rounded font-mono text-blue-600 w-32 text-right p-1 transition-all outline-none"
                            value={selectedInvoice.workOrderId || ''}
                            onChange={(e) => handleUpdateWorkOrderId(e.target.value)}
                            placeholder="Reference ID"
                          />
                        </div>
                      </div>
                      <div className="hidden print:flex items-center justify-end gap-1">
                        <span>Service Ref:</span>
                        <span className="font-mono text-blue-600">{selectedInvoice.workOrderId || 'N/A'}</span>
                      </div>
                      {selectedInvoice.workOrderId && (
                        <Link 
                          to="/work-orders" 
                          state={{ search: selectedInvoice.workOrderId }}
                          className="no-print flex items-center gap-1.5 text-[9px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 mt-1"
                        >
                          <ExternalLink size={12} />
                          View Work Order
                        </Link>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 font-bold">{wo?.jobScope}</p>
                    <p className="text-[11px] text-slate-500 font-bold">Field Engineer: {report?.technicianName || 'Admin'}</p>
                  </div>
                </div>

                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-4 border-slate-900">
                        <th className="text-left py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest">Description of Services</th>
                        <th className="text-right py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest">Amount (SGD)</th>
                        <th className="w-10 no-print"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx} className="group">
                          <td className="py-5 text-sm font-bold text-slate-700">
                            <input type="text" className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-100 rounded px-2 py-1 no-print" value={item.description} onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)} />
                            <span className="hidden print:inline">{item.description}</span>
                          </td>
                          <td className="py-5 text-sm font-black text-slate-900 text-right font-mono">
                            <div className="flex items-center justify-end no-print">
                              <span className="mr-1 text-slate-400 text-xs font-sans font-bold">$</span>
                              <input type="number" className="w-28 bg-transparent border-none text-right focus:ring-1 focus:ring-blue-100 rounded px-2 py-1 font-mono" value={item.amount} onChange={(e) => handleUpdateItem(idx, 'amount', parseFloat(e.target.value) || 0)} />
                            </div>
                            <span className="hidden print:inline">${item.amount.toFixed(2)}</span>
                          </td>
                          <td className="py-5 text-right no-print"><button onClick={() => handleRemoveItem(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="no-print border-t border-slate-50">
                        <td colSpan={3} className="py-8"><button onClick={handleAddItem} className="flex items-center gap-2 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:text-blue-700 transition-colors"><Plus size={18} /> Add Billable Entry</button></td>
                      </tr>
                      <tr className="border-t-4 border-slate-900">
                        <td className="py-8 text-sm font-black text-slate-900 text-right uppercase tracking-widest">Invoice Total (SGD)</td>
                        <td className="py-8 text-3xl font-black text-blue-600 text-right font-mono" colSpan={2}>${selectedInvoice.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 no-print">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <FileEdit size={16} className="text-blue-500" />
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Remittance Configuration</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => applyTermsPreset('COD')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-blue-50 transition-colors shadow-sm">COD</button>
                        <button onClick={() => applyTermsPreset(7)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-blue-50 transition-colors shadow-sm">7D</button>
                        <button onClick={() => applyTermsPreset(14)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-blue-50 transition-colors shadow-sm">14D</button>
                        <button onClick={() => applyTermsPreset(30)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-blue-50 transition-colors shadow-sm">30D</button>
                      </div>
                    </div>
                    <textarea 
                      className="w-full text-xs bg-white border border-slate-200 rounded-[1.5rem] p-5 focus:ring-4 focus:ring-blue-500/5 outline-none min-h-[140px] text-slate-600 font-medium leading-relaxed" 
                      placeholder="Specify custom payment instructions, UEN, or terms..." 
                      value={selectedInvoice.paymentTerms} 
                      onChange={(e) => handleUpdateTerms(e.target.value)} 
                    />
                  </div>

                  <div className={`bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group border-4 transition-colors ${selectedInvoice.status === 'PAID' ? 'border-emerald-500/30' : 'border-white/5'}`}>
                    <div className={`flex items-center gap-3 mb-5 transition-all duration-300 ${selectedInvoice.status === 'PAID' ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {selectedInvoice.status === 'PAID' ? <CheckCircle2 size={20} /> : <Receipt size={20} />}
                      <p className="text-[11px] font-black uppercase tracking-[0.2em]">{selectedInvoice.status === 'PAID' ? 'Settlement Verification' : 'Payment Directives'}</p>
                    </div>
                    <div className="relative z-10 space-y-5">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-3 bg-white/5 px-5 py-4 rounded-2xl border border-white/5 w-fit backdrop-blur-sm">
                                <Calendar size={16} className="text-amber-400" />
                                <p className="text-[11px] font-black uppercase tracking-widest">Due Date: <span className="text-white ml-2 font-mono">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span></p>
                            </div>
                            {selectedInvoice.paymentReceivedDate && (
                              <div className="flex items-center gap-3 bg-emerald-500/10 px-5 py-4 rounded-2xl border border-emerald-500/20 w-fit backdrop-blur-sm">
                                  <Banknote size={16} className="text-emerald-400" />
                                  <p className="text-[11px] font-black uppercase tracking-widest">Received: <span className="text-white ml-2 font-mono">{new Date(selectedInvoice.paymentReceivedDate).toLocaleDateString()}</span></p>
                              </div>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{selectedInvoice.paymentTerms || "No special directives defined."}</p>
                    </div>
                    <ShieldCheck className="absolute -bottom-6 -right-6 text-white/5 group-hover:scale-110 transition-transform duration-1000" size={120} />
                  </div>
                </div>

                <div className="flex flex-col gap-4 no-print pt-6">
                  {emailStatus === 'preparing' ? (
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-blue-500/20 space-y-8 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-3">
                                <SendHorizontal size={20} className="text-blue-500" /> Dispatch Verification
                            </h4>
                            <button onClick={() => setEmailStatus('idle')} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Confirm Payment Due Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input 
                                        type="date" 
                                        className="w-full pl-14 pr-4 py-4.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black"
                                        value={selectedInvoice.dueDate.split('T')[0]}
                                        onChange={(e) => handleUpdateDueDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleEmailInvoice}
                                disabled={isSendingEmail}
                                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4"
                            >
                                {isSendingEmail ? <Loader2 className="animate-spin" size={20} /> : <><Mail size={20} /> Finalize & Dispatch Email</>}
                            </button>
                        </div>
                    </div>
                  ) : (
                    <>
                        <div className="flex gap-4">
                            <button className="flex-1 flex items-center justify-center gap-3 py-5 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px] shadow-sm" onClick={() => window.print()}><Printer size={20} /> Print Document</button>
                            <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex-1 flex items-center justify-center gap-3 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-70 uppercase tracking-widest text-[10px]">{isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />} {isDownloading ? 'Generating...' : 'Download Invoice'}</button>
                        </div>
                        <button 
                            onClick={() => setEmailStatus('preparing')} 
                            disabled={isSendingEmail || selectedInvoice.status === 'PAID'} 
                            className={`w-full flex items-center justify-center gap-3 py-5 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] shadow-lg ${selectedInvoice.status === 'SENT' ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 shadow-slate-200'}`}
                        >
                            {selectedInvoice.status === 'SENT' ? <CheckCircle2 size={20} /> : <Mail size={20} />} {selectedInvoice.status === 'SENT' ? 'Invoiced Electronically' : 'Transmit to Client Contact'}
                        </button>
                        
                        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-emerald-500/20 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block ml-1">Payment Received Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input 
                                        type="date" 
                                        className="w-full pl-14 pr-4 py-4.5 bg-white border-2 border-emerald-100 rounded-2xl focus:border-emerald-500 transition-all outline-none text-sm font-black"
                                        value={selectedInvoice.paymentReceivedDate?.split('T')[0] || receivedDateInput}
                                        onChange={(e) => handleUpdateReceivedDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            {selectedInvoice.status !== 'PAID' && (
                                <button onClick={() => handleMarkAsPaid()} className="w-full flex items-center justify-center gap-3 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest text-xs"><CheckCircle2 size={20} /> Verify Funds Receipt</button>
                            )}
                        </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center no-print flex flex-col items-center justify-center min-h-[700px]">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 mb-8 shadow-sm border border-slate-100">
                <Receipt size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-3">Finance Portal</h3>
              <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto leading-relaxed">Select a generated invoice from the directory to review technical line items, manage remittance terms, or dispatch digital copies to stakeholders.</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-12 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Provision Tax Invoice</h3>
                <p className="text-sm text-slate-500 font-medium mt-2">Direct technical ledger entry</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-4 bg-white text-slate-400 hover:text-slate-600 rounded-3xl shadow-sm transition-all">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleCreateManualInvoice} className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Entity</label>
                  <select 
                    required 
                    className="w-full px-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black appearance-none"
                    value={newManualInvoice.clientId}
                    onChange={e => setNewManualInvoice({...newManualInvoice, clientId: e.target.value})}
                  >
                    <option value="">-- Select Corporate Account --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Reference (SR)</label>
                  <select 
                    className="w-full px-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black appearance-none"
                    value={newManualInvoice.serviceReportId}
                    onChange={e => setNewManualInvoice({...newManualInvoice, serviceReportId: e.target.value})}
                  >
                    <option value="">-- Ad-hoc / Non-Reference --</option>
                    {reports
                      .filter(r => !invoices.some(inv => inv.serviceReportId === r.id))
                      .filter(r => !newManualInvoice.clientId || workOrders.find(wo => wo.id === r.workOrderId)?.clientId === newManualInvoice.clientId)
                      .map(r => (
                        <option key={r.id} value={r.id}>{r.id} - Job: {r.workOrderId}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Due Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                      type="date" 
                      className="w-full pl-14 pr-4 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black"
                      value={newManualInvoice.dueDate}
                      onChange={e => setNewManualInvoice({...newManualInvoice, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2 ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settle Instantly?</label>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={newManualInvoice.isAlreadyPaid}
                      onChange={e => setNewManualInvoice({...newManualInvoice, isAlreadyPaid: e.target.checked})}
                    />
                  </div>
                  {newManualInvoice.isAlreadyPaid && (
                    <div className="relative group animate-in slide-in-from-top-2">
                      <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                      <input 
                        type="date" 
                        className="w-full pl-14 pr-4 py-4.5 bg-emerald-50 border-2 border-emerald-50 rounded-2xl focus:border-emerald-500 transition-all outline-none text-sm font-black"
                        value={newManualInvoice.paymentReceivedDate}
                        onChange={e => setNewManualInvoice({...newManualInvoice, paymentReceivedDate: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxable Line Items</label>
                  <button 
                    type="button"
                    onClick={() => setNewManualInvoice({...newManualInvoice, items: [...newManualInvoice.items, { description: '', amount: 0 }]})}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:text-blue-700 transition-colors"
                  >
                    <Plus size={16} /> Add Charge Line
                  </button>
                </div>
                
                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-3 custom-scrollbar">
                  {newManualInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <input 
                        required
                        placeholder="Service Description"
                        className="flex-1 px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-bold"
                        value={item.description}
                        onChange={e => {
                          const newItems = [...newManualInvoice.items];
                          newItems[idx].description = e.target.value;
                          setNewManualInvoice({...newManualInvoice, items: newItems});
                        }}
                      />
                      <div className="relative w-40">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-black">$</span>
                        <input 
                          required
                          type="number"
                          placeholder="0.00"
                          className="w-full pl-10 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all outline-none text-sm font-black text-right font-mono"
                          value={item.amount}
                          onChange={e => {
                            const newItems = [...newManualInvoice.items];
                            newItems[idx].amount = parseFloat(e.target.value) || 0;
                            setNewManualInvoice({...newManualInvoice, items: newItems});
                          }}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => setNewManualInvoice({...newManualInvoice, items: newManualInvoice.items.filter((_, i) => i !== idx)})}
                        className="p-4 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Calculated Total</p>
                  <p className="text-4xl font-black text-slate-900 font-mono tracking-tighter">
                    ${newManualInvoice.items.reduce((acc, item) => acc + item.amount, 0).toFixed(2)}
                  </p>
                </div>
                <button 
                  type="submit" 
                  className="px-12 py-6 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 uppercase tracking-widest text-xs flex items-center justify-center gap-4"
                >
                  <FileText size={20} /> Provision Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for Aging Cards
const AgingCard = ({ label, amount, count, color, bgColor, borderColor, icon: Icon, isActive }: any) => (
  <div className={`p-8 rounded-[2.5rem] border-2 transition-all hover:shadow-lg ${bgColor} ${borderColor} ${isActive ? 'ring-2 ring-offset-2 ring-slate-100' : ''}`}>
    <div className="flex items-center justify-between mb-5">
      <div className={`p-3 rounded-2xl bg-white shadow-sm ${color}`}>
        <Icon size={24} />
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl shadow-sm border border-slate-100">
        <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{count} {count === 1 ? 'Entry' : 'Entries'}</span>
      </div>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className={`text-3xl font-black font-mono tracking-tighter ${color}`}>${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
    <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
       Collection required <ArrowUpRight size={12} />
    </div>
  </div>
);

export default Invoices;
