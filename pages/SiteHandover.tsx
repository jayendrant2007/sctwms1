
import React, { useState } from 'react';
import { WorkOrder, WorkOrderStatus, SiteHandover, CompanyInfo } from '../types';
import { 
  Handshake, 
  CheckCircle2, 
  XCircle, 
  User, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Printer,
  ChevronRight,
  ClipboardCheck,
  Building,
  ArrowLeft,
  PenTool,
  Check
} from 'lucide-react';

interface SiteHandoverProps {
  handovers: SiteHandover[];
  setHandovers: React.Dispatch<React.SetStateAction<SiteHandover[]>>;
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  companyInfo: CompanyInfo;
}

const SiteHandoverPage: React.FC<SiteHandoverProps> = ({ handovers, setHandovers, workOrders, setWorkOrders, companyInfo }) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [selectedWOId, setSelectedWOId] = useState<string | null>(null);
  const [previewHandoverId, setPreviewHandoverId] = useState<string | null>(null);

  // Form State
  const [checklist, setChecklist] = useState({
    systemTested: false,
    areaCleaned: false,
    manualsExplained: false,
    defectsReported: false
  });
  const [clientName, setClientName] = useState('');
  const [remarks, setRemarks] = useState('');

  const pendingOrders = workOrders.filter(o => o.status === WorkOrderStatus.COMPLETED);
  const currentWO = workOrders.find(o => o.id === selectedWOId);
  const previewHandover = handovers.find(h => h.id === previewHandoverId);
  const previewWO = previewHandover ? workOrders.find(o => o.id === previewHandover.workOrderId) : null;

  const handleSubmitHandover = () => {
    if (!currentWO || !clientName) return;

    const newHandover: SiteHandover = {
      id: `HO-${Date.now()}`,
      workOrderId: currentWO.id,
      clientName: currentWO.clientName,
      technicianName: currentWO.assignedTechnician || 'Staff',
      handoverDate: new Date().toISOString(),
      checklist: { ...checklist },
      clientSignatureName: clientName,
      remarks: remarks
    };

    setHandovers([newHandover, ...handovers]);
    setWorkOrders(prev => prev.map(o => o.id === currentWO.id ? { ...o, status: WorkOrderStatus.HANDOVER } : o));
    
    // Reset Form
    setSelectedWOId(null);
    setChecklist({ systemTested: false, areaCleaned: false, manualsExplained: false, defectsReported: false });
    setClientName('');
    setRemarks('');
    setActiveTab('HISTORY');
  };

  const progress = Object.values(checklist).filter(Boolean).length;
  const progressPercent = (progress / 4) * 100;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Site Handover</h2>
          <p className="text-sm text-slate-500 font-medium">Verify technical checks and capture client acknowledgment</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'PENDING' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Pending ({pendingOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'HISTORY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            History ({handovers.length})
          </button>
        </div>
      </header>

      {activeTab === 'PENDING' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Orders Awaiting Handover</h3>
            {pendingOrders.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center">
                <p className="text-sm text-slate-400 italic">No completed jobs pending handover.</p>
              </div>
            ) : (
              pendingOrders.map(wo => (
                <button 
                  key={wo.id}
                  onClick={() => setSelectedWOId(wo.id)}
                  className={`w-full text-left p-6 rounded-3xl border transition-all ${
                    selectedWOId === wo.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' 
                    : 'bg-white border-slate-200 text-slate-900 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedWOId === wo.id ? 'text-blue-100' : 'text-blue-600'}`}>
                      {wo.id}
                    </span>
                    <ChevronRight size={18} className={selectedWOId === wo.id ? 'text-white' : 'text-slate-300'} />
                  </div>
                  <h4 className="font-bold leading-tight">{wo.clientName}</h4>
                  <p className={`text-[10px] mt-1 uppercase font-bold tracking-widest ${selectedWOId === wo.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {wo.jobScope}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {currentWO ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                      <Handshake size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Final Handover Verification</h3>
                      <p className="text-sm text-slate-500">Ref: <b>{currentWO.id}</b> • Client: <b>{currentWO.clientName}</b></p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Verification Progress</span>
                      <span>{progress} of 4 Complete</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <HandoverToggle 
                      label="System Tested & Functional" 
                      description="Witnessed by client representative"
                      active={checklist.systemTested} 
                      onClick={() => setChecklist({...checklist, systemTested: !checklist.systemTested})} 
                    />
                    <HandoverToggle 
                      label="Area Cleaned & Cleared" 
                      description="No debris or tools left on site"
                      active={checklist.areaCleaned} 
                      onClick={() => setChecklist({...checklist, areaCleaned: !checklist.areaCleaned})} 
                    />
                    <HandoverToggle 
                      label="Manuals & Ops Explained" 
                      description="Client trained on basic operation"
                      active={checklist.manualsExplained} 
                      onClick={() => setChecklist({...checklist, manualsExplained: !checklist.manualsExplained})} 
                    />
                    <HandoverToggle 
                      label="Defects/Notes Reported" 
                      description="All issues logged in report"
                      active={checklist.defectsReported} 
                      onClick={() => setChecklist({...checklist, defectsReported: !checklist.defectsReported})} 
                    />
                  </div>

                  <div className="h-px bg-slate-100"></div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Client Representative Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold"
                            placeholder="Full Name"
                            value={clientName}
                            onChange={e => setClientName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Handover Remarks</label>
                        <textarea 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none text-sm resize-none"
                          rows={1}
                          placeholder="Any specific client feedback..."
                          value={remarks}
                          onChange={e => setRemarks(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmitHandover}
                    disabled={progress < 4 || !clientName}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    <ClipboardCheck size={20} />
                    Complete Site Handover
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 text-center h-[500px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300 mb-4">
                  <Handshake size={32} />
                </div>
                <h4 className="font-bold text-slate-800">Ready for Handover?</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                  Select a completed work order from the sidebar to begin the formal site handover and verification process.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 no-print animate-in fade-in duration-300">
          {handovers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-400 italic">No handover history available.</p>
            </div>
          ) : (
            handovers.map(ho => (
              <div key={ho.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{ho.clientName}</h4>
                    <p className="text-xs text-slate-500">Tech: <b>{ho.technicianName}</b> • Ref: <b>{ho.workOrderId}</b></p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right hidden sm:block">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Handed Over On</p>
                     <p className="text-xs font-bold text-slate-700">{new Date(ho.handoverDate).toLocaleDateString()}</p>
                   </div>
                   <button 
                     onClick={() => setPreviewHandoverId(ho.id)}
                     className="p-3 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                   >
                     <Printer size={20} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Handover Certificate Modal */}
      {previewHandoverId && previewHandover && previewWO && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10 no-print">
          <div className="bg-white w-full max-w-4xl h-full flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
              <button 
                onClick={() => setPreviewHandoverId(null)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm"
              >
                <ArrowLeft size={18} />
                Close Preview
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-sm transition-all"
              >
                <Printer size={18} />
                Print Certificate
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 lg:p-20">
              {/* This inner div is what actually prints */}
              <div className="max-w-3xl mx-auto space-y-16 print-only">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-6">
                    <h1 className="text-3xl font-black text-blue-600 tracking-tighter">SCTWMS</h1>
                    <div className="text-[10px] text-slate-500 space-y-1.5 uppercase tracking-widest font-bold">
                      <p className="text-slate-900 text-sm font-black">{companyInfo.name}</p>
                      <p className="w-64 leading-relaxed">{companyInfo.address}</p>
                      <p>Phone: {companyInfo.phone} | Web: {companyInfo.web}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-[0.2em] mb-6 shadow-xl shadow-emerald-100 print:bg-slate-100 print:text-black print:border print:border-slate-200 print:shadow-none">
                      Site Handover Certificate
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificate Ref</p>
                    <p className="font-mono font-bold text-slate-900">{previewHandover.id}</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Project Context */}
                <div className="grid grid-cols-2 gap-16">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Client Detail</h4>
                    <p className="font-black text-slate-900 text-xl leading-tight mb-2">{previewHandover.clientName}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{previewWO.clientAddress}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Service Context</h4>
                    <p className="text-sm font-black text-slate-900">Work Order: {previewWO.id}</p>
                    <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-widest">{previewWO.jobScope}</p>
                    <p className="text-xs text-slate-500 mt-4">Technician: <b>{previewHandover.technicianName}</b></p>
                    <p className="text-xs text-slate-500">Handover Date: <b>{new Date(previewHandover.handoverDate).toLocaleDateString()}</b></p>
                  </div>
                </div>

                {/* Verification Table */}
                <div className="space-y-6 break-inside-avoid">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-lg w-fit">Technical Verification Checklist</h4>
                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden print:rounded-none print:border-slate-200">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                        <HandoverRow label="System testing witnessed and functional" status={previewHandover.checklist.systemTested} />
                        <HandoverRow label="Site cleared of installation debris and tools" status={previewHandover.checklist.areaCleaned} />
                        <HandoverRow label="Operational manuals and basic training provided" status={previewHandover.checklist.manualsExplained} />
                        <HandoverRow label="All technical defects logged and communicated" status={previewHandover.checklist.defectsReported} />
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Remarks */}
                {previewHandover.remarks && (
                  <div className="space-y-3 break-inside-avoid">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Special Remarks / Feedback</h4>
                    <p className="text-sm text-slate-600 leading-relaxed p-6 bg-slate-50 rounded-3xl italic print:bg-white print:border print:border-slate-100">"{previewHandover.remarks}"</p>
                  </div>
                )}

                {/* Signature Panel */}
                <div className="grid grid-cols-2 gap-24 pt-10 break-inside-avoid">
                  <div className="space-y-12">
                     <div className="h-0.5 bg-slate-200 relative">
                       <div className="absolute -top-8 left-0 text-blue-500 italic font-medium opacity-50 print:opacity-100 print:text-slate-400">Verified by SCT</div>
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Signature</p>
                       <p className="text-sm font-black text-slate-900 mt-1">{previewHandover.technicianName}</p>
                       <p className="text-[10px] text-slate-400 font-bold">Operations Team</p>
                     </div>
                  </div>
                  <div className="space-y-12">
                     <div className="h-0.5 bg-slate-200 relative">
                       <div className="absolute -top-8 left-0 text-slate-300 italic font-medium opacity-50 flex items-center gap-2 print:opacity-100 print:text-slate-400">
                         <Check size={14} /> Signed Digitally
                       </div>
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Acknowledgment</p>
                       <p className="text-sm font-black text-slate-900 mt-1">{previewHandover.clientSignatureName}</p>
                       <p className="text-[10px] text-slate-400 font-bold">Authorized Representative</p>
                     </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-24 border-t border-slate-50 print:border-slate-100">
                  <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] print:text-slate-400">Precision • Integrity • Safety</p>
                  <p className="text-[8px] text-slate-400 mt-4 uppercase">This is a system-generated site handover certificate. Smart City Technologies Pte Ltd.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const HandoverToggle = ({ label, description, active, onClick }: { label: string, description: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all text-left ${
      active 
      ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-50' 
      : 'bg-white border-slate-100 hover:border-blue-200'
    }`}
  >
    <div className="min-w-0 flex-1">
      <p className={`font-black text-sm ${active ? 'text-emerald-900' : 'text-slate-800'}`}>{label}</p>
      <p className={`text-[10px] font-medium mt-0.5 ${active ? 'text-emerald-600' : 'text-slate-400'}`}>{description}</p>
    </div>
    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
      active ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-300'
    }`}>
      {active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
    </div>
  </button>
);

const HandoverRow = ({ label, status }: { label: string, status: boolean }) => (
  <tr className="group">
    <td className="py-5 px-6">
      <p className="text-sm font-bold text-slate-700">{label}</p>
    </td>
    <td className="py-5 px-6 text-right whitespace-nowrap">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
        status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
      } print:bg-transparent print:border print:border-slate-200`}>
        {status ? <Check size={12} className="print:text-black" /> : <XCircle size={12} className="print:text-black" />}
        {status ? 'Verified' : 'Unchecked'}
      </div>
    </td>
  </tr>
);

export default SiteHandoverPage;
