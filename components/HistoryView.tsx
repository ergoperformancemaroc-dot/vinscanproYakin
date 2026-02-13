
import React, { useState, useMemo } from 'react';
import { ScanResult, User } from '../types';
import { Search, Download, Trash2, Tag, Calendar, ChevronRight, Share2, MapPin, Fuel, AlertTriangle, X } from 'lucide-react';

interface HistoryViewProps {
  scans: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onRemoveScan: (id: string) => void;
  onClearHistory: () => void;
  user: User | null;
}

const HistoryView: React.FC<HistoryViewProps> = ({ scans, onSelectScan, onRemoveScan, onClearHistory, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filteredHistory = useMemo(() => {
    const term = searchTerm.toUpperCase().trim();
    if (!term) return scans;
    return scans.filter(item => 
      (item.analysis.vin && item.analysis.vin.includes(term)) || 
      (item.analysis.licensePlate && item.analysis.licensePlate.includes(term)) ||
      item.analysis.brand.toUpperCase().includes(term) ||
      item.analysis.model.toUpperCase().includes(term) ||
      item.location.toUpperCase().includes(term)
    );
  }, [scans, searchTerm]);

  const exportToCSV = () => {
    if (scans.length === 0) return;
    const headers = ['DATE_SCAN', 'ZONE', 'MARQUE', 'MODELE', 'VIN', 'PLAQUE', 'FAB', 'IMMAT', 'ENERGIE', 'TYPE'];
    const rows = scans.map(s => [
      new Date(s.timestamp).toLocaleString('fr-FR'),
      s.location,
      s.analysis.brand,
      s.analysis.model,
      s.analysis.vin || '',
      s.analysis.licensePlate || '',
      s.analysis.yearOfManufacture,
      s.analysis.registrationYear || 'N/A',
      s.analysis.fuelType,
      s.analysis.type
    ]);
    
    const csvContent = "\ufeff" + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventaire_technique_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const confirmClear = () => {
    onClearHistory();
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic">Stock Technique</h1>
          <p className="text-slate-500 font-medium mt-1">Registre des caractéristiques VN/VO.</p>
        </div>
        <div className="flex gap-3">
          {user?.role === 'admin' && scans.length > 0 && (
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="group flex items-center gap-3 bg-white text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-sm border border-slate-200"
            >
              <Trash2 size={18} className="group-hover:animate-bounce" /> <span className="hidden sm:inline">Vider Stock</span>
            </button>
          )}
          <button onClick={exportToCSV} className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-colors">
            <Download size={18} /> CSV Technique
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
          type="text" 
          placeholder="RECHERCHER PAR VIN, IMMAT, MARQUE..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="w-full bg-white shadow-xl rounded-[2.5rem] px-16 py-6 text-sm font-bold uppercase outline-none border border-transparent focus:border-indigo-100" 
        />
      </div>

      <div className="space-y-4 pb-12">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm font-bold uppercase tracking-widest">Aucun véhicule trouvé</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div key={item.id} className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-xl transition-all flex flex-col sm:flex-row items-center gap-6">
              <img src={item.imageUrl} onClick={() => onSelectScan(item)} className="w-24 h-24 rounded-[2rem] object-cover shadow-lg border-4 border-white cursor-pointer" alt="car" />
              
              <div className="flex-1 min-w-0 space-y-2 cursor-pointer" onClick={() => onSelectScan(item)}>
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-slate-900 text-xl truncate">{item.analysis.brand} {item.analysis.model}</h4>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{item.analysis.fuelType}</span>
                </div>
                <p className="text-sm font-black font-mono text-slate-400 truncate">{item.analysis.vin || 'VIN NON DÉTECTÉ'}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase bg-slate-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <MapPin size={10} /> {item.location}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Calendar size={10} /> Fab: {item.analysis.yearOfManufacture}
                  </span>
                  {item.analysis.registrationYear && (
                    <span className="text-[9px] font-black text-indigo-700 uppercase bg-indigo-50 px-3 py-1.5 rounded-xl">
                      Immat: {item.analysis.registrationYear}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {user?.role === 'admin' && (
                  <button onClick={() => onRemoveScan(item.id)} className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={() => onSelectScan(item)} className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full relative z-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-red-100 animate-pulse">
                <Trash2 size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight italic mb-2">Vider le stock ?</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                Vous êtes sur le point de supprimer définitivement <strong className="text-slate-900">{scans.length} véhicules</strong> de l'inventaire. Cette action est irréversible.
              </p>

              <div className="grid grid-cols-1 gap-3 w-full">
                <button 
                  onClick={confirmClear}
                  className="bg-red-600 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Confirmer Suppression
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="bg-slate-50 text-slate-500 font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                >
                  Annuler
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
