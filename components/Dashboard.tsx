
import React from 'react';
import { ScanResult } from '../types';
import { ClipboardList, Package, TrendingUp, Tag, ShieldCheck, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  scans: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ scans = [], onSelectScan }) => {
  const vnCount = scans.filter(s => s.analysis.type === 'VN').length;
  const voCount = scans.filter(s => s.analysis.type === 'VO').length;

  const brandCounts = scans.reduce((acc: Record<string, number>, scan) => {
    const brand = scan.analysis.brand;
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(brandCounts)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2 italic">Pilotage</h1>
          <p className="text-slate-500 font-medium text-lg">Supervision du parc automobile.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">VN</div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Neuf</p>
                <p className="text-3xl font-black text-slate-900">{vnCount}</p>
             </div>
          </div>
          <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
             <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center font-black text-xl">VO</div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Occasion</p>
                <p className="text-3xl font-black text-slate-900">{voCount}</p>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
                <ClipboardList size={28} className="text-indigo-600" />
                Flux d'Expertises
              </h3>
            </div>
            <div className="p-6">
              {scans.length === 0 ? (
                <div className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 m-4">
                   <Package size={64} className="text-slate-200 mx-auto mb-6" />
                   <p className="text-slate-400 font-black uppercase tracking-widest text-[11px]">Registre vide</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scans.slice(0, 5).map((scan) => (
                    <div 
                      key={scan.id} 
                      onClick={() => onSelectScan(scan)}
                      className="group cursor-pointer bg-white border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 rounded-[2rem] p-5 transition-all duration-300 flex items-center gap-6"
                    >
                      <div className="relative shrink-0">
                        <img src={scan.imageUrl} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-lg border-4 border-white" alt="car" />
                        <span className={`absolute -top-3 -right-3 px-3 py-1 rounded-xl text-[9px] font-black tracking-widest text-white shadow-xl ${scan.analysis.type === 'VN' ? 'bg-indigo-600' : 'bg-slate-900'}`}>
                          {scan.analysis.type}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-slate-900 text-xl leading-none truncate">{scan.analysis.brand} {scan.analysis.model}</h4>
                          <span className="text-[10px] font-black text-slate-300 uppercase">
                            {new Date(scan.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full">
                             <Tag size={12} className="text-indigo-400" /> {scan.analysis.licensePlate || 'N/A'}
                           </span>
                           <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">{scan.location}</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <TrendingUp size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-10">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-10 uppercase tracking-tighter">Parc par Marque</h3>
              {chartData && chartData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: -10 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-300 font-black uppercase text-[10px]">Attente données</div>
              )}
           </div>

           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="flex items-center gap-5 mb-8">
                 <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md"><ShieldCheck size={28} /></div>
                 <h4 className="text-2xl font-black italic tracking-tighter">Statut Global</h4>
              </div>
              <div className="space-y-5">
                 <div className="bg-white/10 p-5 rounded-[1.5rem] border border-white/10">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Activité Récente</p>
                    <p className="text-sm font-bold">{scans.length} expertises réalisées.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
