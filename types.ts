
export type UserRole = 'admin' | 'agent';
export type FuelType = 'Gasoil' | 'Essence' | 'Hybride' | 'Électrique' | 'N/A';
export type VehicleType = 'VN' | 'VO';
export type ScanType = 'vin' | 'carte_grise';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface AppLocation {
  id: string;
  name: string;
}

export interface AppSettings {
  duplicateThresholdHours: number;
  companyName: string; // Le client (ex: Auto Expert Maroc)
  appName: string;     // Le logiciel (ex: VIN Scan Pro)
}

export interface VehicleAnalysis {
  vin?: string;
  brand: string;
  model: string;
  fuelType: FuelType;
  yearOfManufacture: string;
  registrationYear?: string;
  licensePlate?: string;
  inventoryNotes: string; // Utilisé pour les remarques manuelles
  type: VehicleType;
  color?: string;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  imageUrl: string;
  analysis: VehicleAnalysis;
  userId: string;
  userName: string;
  locationId: string;
  location: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
