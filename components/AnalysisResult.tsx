
import React from 'react';
import { ScanResult } from '../types';
import { ChevronLeft, Share2, Printer, Clipboard, Shield, Zap, CircleDot, Info, MapPin, Fuel, Calendar, MessageSquareText, Clock } from 'lucide-react';

interface AnalysisResultProps {
  result: ScanResult;
  onBack: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onBack }) => {
  const { analysis, imageUrl, timestamp, userName, location } = result;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const dateStr = new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const text = `🚗 *INVENTAIRE V2 - ${analysis.brand} ${analysis.model}*\n\n📅 *Scan le:* ${dateStr}\n🔢 *VIN:* ${analysis.vin || 'N/A'}\n⛽ *Motorisation:* ${analysis.fuelType}\n🏗️ *Fab:* ${analysis.yearOfManufacture}\n🗓️ *Immat:* ${analysis.registrationYear || 'N/A'}\n📍 *Zone:* ${location}\n🏷️ *Type:* ${analysis.type}\n📝 *Notes:* ${analysis.inventoryNotes || 'N/A'}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-700 print:bg-white print:p-0">
      <button 
        onClick={onBack}
        className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 font-black text-[11px] uppercase tracking-widest mb-10 transition-all group print:hidden"
      >
        <div className="w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ChevronLeft size={20} />
        </div>
        Retour à l'inventaire
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left: Identity */}
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-[3rem] shadow-2xl shadow-indigo-500/10 border-4 border-white">
            <img src={imageUrl} alt="Vehicle" className="w-full aspect-square object-cover" />
            <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl">
              <Shield size={16} className="text-indigo-400" />
              Inventaire Certifié
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
             <div className="flex items-center justify-between">
               <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Fiche Logistique</h3>
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  analysis.type === 'VN' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
               }`}>{analysis.type}</span>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-[1.5rem] flex items-center gap-4">
                  <div className="text-indigo-500"><Fuel size={24} /></div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Énergie</p>
                    <p className="font-black text-slate-900">{analysis.fuelType}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[1.5rem] flex items-center gap-4">
                  <div className="text-indigo-500"><MapPin size={24} /></div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Emplacement</p>
                    <p className="font-black text-slate-900">{location}</p>
                  </div>
                </div>
             </div>

             <div className="bg-slate-50 p-6 rounded-[1.5rem] flex items-center gap-4 w-full">
                <div className="text-slate-400"><Clock size={24} /></div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Date du Scan</p>
                  <p className="font-black text-slate-700 text-sm">
                    {new Date(timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Technical Data */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">{analysis.brand}</h1>
                <h2 className="text-2xl font-bold text-slate-400 mt-2">{analysis.model}</h2>
              </div>
              <div className="flex gap-2 print:hidden">
                <button onClick={handleShare} className="w-12 h-12 bg-slate-50 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all flex items-center justify-center" title="Partager sur WhatsApp">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                    <Zap size={14} className="text-amber-500" /> Numéro de Châssis (VIN)
                  </h4>
                  <div className="bg-indigo-50 px-8 py-5 rounded-2xl border-2 border-indigo-100">
                      <p className="text-2xl font-black font-mono text-indigo-700 tracking-wider text-center break-all">{analysis.vin || 'NON DÉTECTÉ'}</p>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <Calendar size={12} /> Fabrication
                  </h4>
                  <p className="text-xl font-black text-slate-900">{analysis.yearOfManufacture}</p>
                </div>
                <div className={`bg-slate-50 p-6 rounded-2xl border border-slate-100 ${!analysis.registrationYear && 'opacity-50'}`}>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <Calendar size={12} /> Immatriculation
                  </h4>
                  <p className="text-xl font-black text-slate-900">{analysis.registrationYear || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <MessageSquareText size={14} className="text-indigo-500" /> Remarques d'Inventaire
                </h4>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                    {analysis.inventoryNotes || "Aucune remarque saisie."}
                  </p>
                </div>
              </div>

              {analysis.licensePlate && (
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Immatriculation</h4>
                  <div className="inline-block bg-slate-900 px-6 py-3 rounded-xl font-bold text-white tracking-widest shadow-xl">
                    {analysis.licensePlate}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={onBack}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] mt-10 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 text-sm uppercase tracking-widest active:scale-95 print:hidden"
            >
              Fermer la Fiche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
