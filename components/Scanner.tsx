
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Search, AlertCircle, Upload, Scan, FileText, Copy, MapPin, CheckCircle2, MessageSquareText, Clock, Edit3, ArrowRight, Building2 } from 'lucide-react';
import { analyzeVehicleImage } from '../services/geminiService';
import { ScanResult, VehicleAnalysis, ScanType, User, AppLocation, FuelType, VehicleType } from '../types';

interface ScannerProps {
  user: User;
  locations: AppLocation[];
  onScanComplete: (result: ScanResult) => void;
  existingScans: ScanResult[];
  duplicateThresholdHours: number;
}

const Scanner: React.FC<ScannerProps> = ({ user, locations, onScanComplete, existingScans, duplicateThresholdHours }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanMode, setScanMode] = useState<ScanType>('vin');
  
  // Gestion de la zone
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [isZoneConfirmed, setIsZoneConfirmed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  
  // États pour la validation manuelle
  const [step, setStep] = useState<'capture' | 'review'>('capture');
  const [pendingAnalysis, setPendingAnalysis] = useState<VehicleAnalysis | null>(null);
  const [pendingImageData, setPendingImageData] = useState<string>('');
  const [manualRemarks, setManualRemarks] = useState('');
  const [duplicateMatch, setDuplicateMatch] = useState<ScanResult | null>(null);

  // Initialisation de la zone par défaut si disponible, mais sans confirmer automatiquement
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations]);

  const confirmZone = () => {
    if (selectedLocationId) {
      setIsZoneConfirmed(true);
      startCamera(); // Optionnel : démarrer la caméra direct après choix
    }
  };

  const changeZone = () => {
    setIsZoneConfirmed(false);
    setIsCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error(err);
      setError("Caméra inaccessible. Vérifiez les permissions.");
    }
  };

  const handleAnalysis = async (dataUrl: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeVehicleImage(dataUrl, scanMode);
      
      // Détection de doublon basée sur le VIN et la période de référence
      const currentTime = Date.now();
      const thresholdMs = duplicateThresholdHours * 3600 * 1000;
      
      const duplicate = existingScans.find(s => 
        s.analysis.vin === analysis.vin && 
        analysis.vin && 
        (currentTime - s.timestamp) < thresholdMs
      );
      
      setPendingAnalysis(analysis);
      setPendingImageData(dataUrl);
      setDuplicateMatch(duplicate || null);
      setStep('review');
    } catch (err: any) {
      console.error("Scan error full object:", err);
      // Affichage de l'erreur technique pour le débogage
      const errorMessage = err.message || "Erreur inconnue";
      setError(`ERREUR : ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confirmInventory = () => {
    if (!pendingAnalysis) return;
    
    const loc = locations.find(l => l.id === selectedLocationId);
    const result: ScanResult = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageUrl: pendingImageData,
      analysis: {
        ...pendingAnalysis,
        inventoryNotes: manualRemarks
      },
      userId: user.id,
      userName: user.name,
      locationId: selectedLocationId,
      location: loc?.name || 'Inconnue'
    };
    onScanComplete(result);
    resetScanner();
  };

  const resetScanner = () => {
    setStep('capture');
    setPendingAnalysis(null);
    setPendingImageData('');
    setManualRemarks('');
    setDuplicateMatch(null);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
    handleAnalysis(dataUrl);
  };

  // ÉTAPE 0 : SÉLECTION OBLIGATOIRE DE LA ZONE
  if (!isZoneConfirmed) {
    return (
      <div className="max-w-md mx-auto min-h-[60vh] flex flex-col justify-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <MapPin size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 italic tracking-tight mb-2">Configuration</h2>
          <p className="text-slate-500 font-medium text-sm mb-8">
            Veuillez sélectionner la zone de stockage avant de commencer l'inventaire.
          </p>

          <div className="space-y-4 text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Zone actuelle
            </label>
            <div className="relative">
              <select 
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 appearance-none outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg"
              >
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Building2 size={20} />
              </div>
            </div>

            <button 
              onClick={confirmZone}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-widest mt-6 group"
            >
              Commencer le Scan <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ÉTAPE DE VALIDATION (REVIEW)
  if (step === 'review' && pendingAnalysis) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <header className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Validation Inventaire</h2>
            <button onClick={resetScanner} className="text-slate-400 font-bold text-xs uppercase hover:text-red-500 transition-colors">Annuler</button>
          </header>

          {duplicateMatch && (
            <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-4 shadow-sm animate-pulse">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-[11px] font-black text-amber-900 uppercase tracking-widest leading-none mb-1">Alerte Doublon Récent</p>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Ce véhicule a déjà été scanné il y a moins de <strong>{duplicateThresholdHours}h</strong>.<br/>
                  Dernière position : <strong>{duplicateMatch.location}</strong>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              <img src={pendingImageData} className="w-full h-40 rounded-3xl object-cover shadow-xl border-4 border-slate-50" alt="Captured" />
              <div className="mt-3">
                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Type VN/VO</label>
                 <select 
                  value={pendingAnalysis.type} 
                  onChange={(e) => setPendingAnalysis({...pendingAnalysis, type: e.target.value as VehicleType})}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white outline-none border-2 border-transparent focus:border-indigo-200 transition-all ${pendingAnalysis.type === 'VN' ? 'bg-indigo-600' : 'bg-slate-900'}`}
                 >
                   <option value="VN" className="text-slate-900 bg-white">VN (Neuf)</option>
                   <option value="VO" className="text-slate-900 bg-white">VO (Occasion)</option>
                 </select>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Marque</label>
                   <input 
                    type="text" 
                    value={pendingAnalysis.brand} 
                    onChange={(e) => setPendingAnalysis({...pendingAnalysis, brand: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-300"
                   />
                </div>
                <div>
                   <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Modèle</label>
                   <input 
                    type="text" 
                    value={pendingAnalysis.model} 
                    onChange={(e) => setPendingAnalysis({...pendingAnalysis, model: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-300"
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Année Fab.</label>
                   <input 
                    type="text" 
                    value={pendingAnalysis.yearOfManufacture} 
                    onChange={(e) => setPendingAnalysis({...pendingAnalysis, yearOfManufacture: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-300"
                   />
                 </div>
                 <div>
                   <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Carburant</label>
                   <select 
                    value={pendingAnalysis.fuelType} 
                    onChange={(e) => setPendingAnalysis({...pendingAnalysis, fuelType: e.target.value as FuelType})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 appearance-none"
                   >
                     <option value="Gasoil">Gasoil</option>
                     <option value="Essence">Essence</option>
                     <option value="Hybride">Hybride</option>
                     <option value="Électrique">Électrique</option>
                     <option value="N/A">N/A</option>
                   </select>
                 </div>
              </div>

              <div>
                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">VIN (Châssis)</label>
                 <div className="relative">
                   <input 
                    type="text" 
                    value={pendingAnalysis.vin || ''} 
                    onChange={(e) => setPendingAnalysis({...pendingAnalysis, vin: e.target.value.toUpperCase()})}
                    placeholder="VIN NON DÉTECTÉ"
                    className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-xl px-4 py-2 text-sm font-black font-mono text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-indigo-300 uppercase"
                   />
                   <Edit3 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                <MapPin size={12} className="text-indigo-500" /> Zone de stockage (Confirmée)
              </label>
              <div className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl py-4 px-4 flex items-center justify-between">
                <span className="font-bold text-indigo-900">{locations.find(l => l.id === selectedLocationId)?.name}</span>
                <button onClick={() => setStep('capture')} className="text-xs font-black uppercase text-indigo-400">Modifier scan</button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                <MessageSquareText size={12} className="text-indigo-500" /> Remarques (Manuel)
              </label>
              <textarea 
                value={manualRemarks}
                onChange={(e) => setManualRemarks(e.target.value)}
                placeholder="Ex: Rayure aile gauche, manque double de clé..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500/10 resize-none"
              />
            </div>

            <button 
              onClick={confirmInventory}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              <CheckCircle2 size={20} /> Valider l'Inventaire
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ÉTAPE DE SCAN (CAMERA ACTIVE OU PRÊTE)
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      
      {/* Indicateur de zone active */}
      <div className="bg-indigo-900 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
             <MapPin size={18} className="text-indigo-200" />
          </div>
          <div>
             <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Zone Active</p>
             <p className="text-lg font-bold leading-none">{locations.find(l => l.id === selectedLocationId)?.name}</p>
          </div>
        </div>
        <button 
          onClick={changeZone}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors backdrop-blur-sm"
        >
          Changer
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Scanner Inventaire</h2>
          <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
            <button onClick={() => setScanMode('vin')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${scanMode === 'vin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>VIN</button>
            <button onClick={() => setScanMode('carte_grise')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${scanMode === 'carte_grise' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Carte Grise</button>
          </div>
        </div>

        <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden mb-8 border-4 border-slate-50 shadow-2xl">
          {isAnalyzing && (
            <div className="absolute inset-0 z-30 bg-slate-950/80 flex flex-col items-center justify-center text-white backdrop-blur-xl">
              <Search size={48} className="text-indigo-500 animate-pulse mb-4" />
              <p className="font-black text-lg italic">Lecture Technique...</p>
            </div>
          )}

          {!isCameraActive ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button onClick={startCamera} className="flex-1 bg-indigo-600 text-white p-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl active:scale-95"><Camera size={24} /> Caméra</button>
                <label className="flex-1 bg-slate-100 text-slate-700 p-5 rounded-2xl font-black flex items-center justify-center gap-3 cursor-pointer"><Upload size={24} /> Photo
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (re) => handleAnalysis(re.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {isCameraActive && (
          <div className="flex justify-center">
            <button onClick={captureImage} className="w-20 h-20 bg-white rounded-full p-2 shadow-2xl border-4 border-slate-50 active:scale-90 transition-all">
              <div className="w-full h-full bg-indigo-600 rounded-full"></div>
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 animate-pulse">
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
