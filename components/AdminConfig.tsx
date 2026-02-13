
import React, { useState } from 'react';
import { User, AppLocation, UserRole, AppSettings } from '../types';
import { Users, MapPin, Plus, Trash2, ShieldCheck, UserPlus, Key, UserCircle, Settings, Clock, Building2, Smartphone } from 'lucide-react';

interface AdminConfigProps {
  users: User[];
  locations: AppLocation[];
  settings: AppSettings;
  onUpdateUsers: (users: User[]) => void;
  onUpdateLocations: (locations: AppLocation[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
}

const AdminConfig: React.FC<AdminConfigProps> = ({ users, locations, settings, onUpdateUsers, onUpdateLocations, onUpdateSettings }) => {
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newLocName, setNewLocName] = useState('');

  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUsername || !newPassword) return;
    
    const newUser: User = {
      id: Date.now().toString(),
      username: newUsername.toLowerCase().trim(),
      password: newPassword,
      name: newName.trim(),
      role: 'agent',
      avatar: 'default' // Utilisation du style neutre par défaut
    };
    onUpdateUsers([...users, newUser]);
    setNewName('');
    setNewUsername('');
    setNewPassword('');
  };

  const addLocation = () => {
    if (!newLocName) return;
    const newLoc: AppLocation = { id: Date.now().toString(), name: newLocName.toUpperCase().trim() };
    onUpdateLocations([...locations, newLoc]);
    setNewLocName('');
  };

  const deleteUser = (id: string) => {
    if (id === '1') return; // Protéger l'admin principal
    onUpdateUsers(users.filter(u => u.id !== id));
  };

  const renderAvatarPreview = (u: User) => {
      if (u.avatar === 'default' || !u.avatar) {
          return (
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                  <UserCircle size={20} />
              </div>
          );
      }
      return <img src={u.avatar} className="w-8 h-8 rounded-lg shadow-sm object-cover bg-white" alt="avatar" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Configuration</h1>
        <p className="text-slate-500 font-medium">Gestion du parc, des accès et paramètres entreprise.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Paramètres Système & Emplacements */}
        <div className="space-y-10 order-2 md:order-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <Settings className="text-indigo-600" size={28} />
              <h3 className="text-xl font-black tracking-tight">Paramètres Entreprise</h3>
            </div>
            
            <div className="space-y-6">
              {/* Le nom du logiciel VIN SCAN PRO est fixe, on ne le configure plus ici */}
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                  <Building2 size={12} className="text-indigo-500" /> Société
                </label>
                <input 
                  type="text" 
                  value={settings.companyName || ''} 
                  onChange={e => onUpdateSettings({...settings, companyName: e.target.value})}
                  placeholder="Ex: AUTO EXPERT MAROC"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                  <Clock size={12} className="text-indigo-500" /> Délai alerte doublon (Heures)
                </label>
                <input 
                  type="number" 
                  value={settings.duplicateThresholdHours} 
                  onChange={e => onUpdateSettings({...settings, duplicateThresholdHours: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <p className="text-[9px] text-slate-400 font-medium mt-2 leading-relaxed">
                  Si le même VIN est scanné dans cet intervalle, une alerte s'affichera lors de la validation.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <MapPin className="text-indigo-600" size={28} />
              <h3 className="text-xl font-black tracking-tight">Zones de Stockage</h3>
            </div>

            <div className="flex gap-2 mb-6">
              <input 
                type="text" value={newLocName} onChange={e => setNewLocName(e.target.value)}
                placeholder="Nouvelle zone (ex: Hall B)..."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
              />
              <button onClick={addLocation} className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
              {locations.map(l => (
                <div key={l.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                  <span className="text-sm font-black text-slate-700">{l.name}</span>
                  <button onClick={() => onUpdateLocations(locations.filter(loc => loc.id !== l.id))} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gestion Utilisateurs */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col order-1 md:order-2">
          <div className="flex items-center gap-4 mb-8">
            <Users className="text-indigo-600" size={28} />
            <h3 className="text-xl font-black tracking-tight">Équipe & Accès</h3>
          </div>
          
          <form onSubmit={addUser} className="space-y-3 mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nouvel Expert / Agent</p>
            <div className="space-y-2">
              <input 
                type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Nom complet (ex: Amine)"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <input 
                type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
                placeholder="Identifiant de connexion"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <input 
                type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
              <UserPlus size={16} /> Créer l'accès
            </button>
          </form>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                <div className="flex items-center gap-3">
                  {renderAvatarPreview(u)}
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-none">{u.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">@{u.username} • {u.role}</p>
                  </div>
                </div>
                {u.id !== '1' && (
                  <button onClick={() => deleteUser(u.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center gap-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
        <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/20"><ShieldCheck size={32} /></div>
        <div>
          <h4 className="font-black text-lg">Sécurité et Permissions</h4>
          <p className="text-slate-400 text-sm font-medium">Les agents (rôle standard) n'ont accès qu'à l'expertise technique et au registre. Seuls les administrateurs peuvent configurer les paramètres de l'entreprise.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;
