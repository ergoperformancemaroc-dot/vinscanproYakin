
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import ChatExpert from './components/ChatExpert';
import AnalysisResult from './components/AnalysisResult';
import Auth from './components/Auth';
import HistoryView from './components/HistoryView';
import AdminConfig from './components/AdminConfig';
import { ScanResult, User, AppLocation, AppSettings } from './types';

const INITIAL_USERS: User[] = [{
  id: '1',
  username: 'admin',
  password: '1234',
  name: 'Administrateur',
  role: 'admin',
  avatar: 'default' // Figure neutre par défaut
}];

const INITIAL_LOCATIONS: AppLocation[] = [
  { id: 'l1', name: 'RECEPTION' },
  { id: 'l2', name: 'SHOWROOM' },
  { id: 'l3', name: 'DÉPÔT A' }
];

const DEFAULT_SETTINGS: AppSettings = {
  duplicateThresholdHours: 24, // Par défaut 24h
  companyName: 'AUTO EXPERT MAROC',
  appName: 'VIN SCAN PRO'
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [locations, setLocations] = useState<AppLocation[]>(INITIAL_LOCATIONS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  useEffect(() => {
    const savedScans = localStorage.getItem('v2_scans');
    const savedUsers = localStorage.getItem('v2_users');
    const savedLocs = localStorage.getItem('v2_locs');
    const savedSettings = localStorage.getItem('v2_settings');
    
    if (savedScans) setScans(JSON.parse(savedScans));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedLocs) setLocations(JSON.parse(savedLocs));
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const sessionUserStr = localStorage.getItem('v2_session');
    if (sessionUserStr) {
      const sessionUser = JSON.parse(sessionUserStr);
      setUser(sessionUser);
      if (sessionUser.role !== 'admin') {
        setActiveTab('scanner');
      }
    }
  }, []);

  useEffect(() => localStorage.setItem('v2_scans', JSON.stringify(scans)), [scans]);
  useEffect(() => localStorage.setItem('v2_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('v2_locs', JSON.stringify(locations)), [locations]);
  useEffect(() => localStorage.setItem('v2_settings', JSON.stringify(settings)), [settings]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('v2_session', JSON.stringify(u));
    if (u.role !== 'admin') {
      setActiveTab('scanner');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('v2_session');
    setActiveTab('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
    // Mise à jour de la session actuelle
    setUser(updatedUser);
    localStorage.setItem('v2_session', JSON.stringify(updatedUser));

    // Mise à jour de la liste globale des utilisateurs
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(newUsers);
    // Le useEffect s'occupera de sauvegarder 'users' dans le localStorage
  };

  const handleScanComplete = (result: ScanResult) => {
    setScans(prev => [result, ...prev]);
    setSelectedScan(result);
    setActiveTab('analysis');
  };

  const handleClearHistory = () => {
    setScans([]);
  };

  if (!user) return <Auth users={users} onLogin={handleLogin} companyName={settings.companyName} appName={settings.appName} />;

  const renderContent = () => {
    if (activeTab === 'analysis' && selectedScan) {
      return <AnalysisResult result={selectedScan} onBack={() => { setSelectedScan(null); setActiveTab(user.role === 'admin' ? 'dashboard' : 'scanner'); }} />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard scans={scans} onSelectScan={(s) => { setSelectedScan(s); setActiveTab('analysis'); }} />;
      case 'scanner': return <Scanner user={user} locations={locations} onScanComplete={handleScanComplete} existingScans={scans} duplicateThresholdHours={settings.duplicateThresholdHours} />;
      case 'history': return <HistoryView scans={scans} onSelectScan={(s) => { setSelectedScan(s); setActiveTab('analysis'); }} onRemoveScan={(id) => setScans(prev => prev.filter(s => s.id !== id))} onClearHistory={handleClearHistory} user={user} />;
      case 'chat': return <ChatExpert companyName={settings.companyName} appName={settings.appName} />;
      case 'config': return <AdminConfig users={users} locations={locations} settings={settings} onUpdateUsers={setUsers} onUpdateLocations={setLocations} onUpdateSettings={setSettings} />;
      default: return <Dashboard scans={scans} onSelectScan={setSelectedScan} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab === 'analysis' ? (user.role === 'admin' ? 'dashboard' : 'scanner') : activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLogout={handleLogout}
      isAdmin={user.role === 'admin'}
      companyName={settings.companyName}
      appName={settings.appName}
      onUpdateUser={handleUpdateUser}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
