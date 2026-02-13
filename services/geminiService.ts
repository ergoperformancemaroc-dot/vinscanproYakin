
import { GoogleGenAI, Type } from "@google/genai";
import { VehicleAnalysis, ScanType } from "../types";

// Déclaration pour TypeScript
declare const __GEMINI_API_KEY__: string;

// Fonction utilitaire sécurisée pour récupérer la clé API
const getApiKey = () => {
  // On utilise la constante injectée par Vite (voir vite.config.ts)
  // Cela évite les erreurs liées à import.meta.env si l'objet n'est pas défini
  try {
    if (typeof __GEMINI_API_KEY__ !== 'undefined' && __GEMINI_API_KEY__) {
      return __GEMINI_API_KEY__;
    }
  } catch (e) {
    console.error("Erreur lecture clé API", e);
  }
  
  // Fallback (ne devrait pas être atteint si vite.config est correct)
  return "";
};

export const analyzeVehicleImage = async (
  base64Image: string, 
  mode: ScanType = 'vin'
): Promise<VehicleAnalysis> => {
  const apiKey = getApiKey();
  
  // Message d'erreur explicite si la clé manque
  if (!apiKey || apiKey.length < 5) {
    console.error("Clé API manquante ou invalide:", apiKey);
    throw new Error("Clé API absente. Configurez VITE_API_KEY dans les variables d'environnement Vercel.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const currentYear = new Date().getFullYear();

  let systemPrompt = "";
  if (mode === 'carte_grise') {
    systemPrompt = `ANALYSE CARTE GRISE MAROC : 
    1. NIV/VIN (champ E).
    2. Marque (D.1) et Modèle (D.3).
    3. Année de fabrication.
    4. Année de 1ère immatriculation (champ B).
    5. Motorisation (champ P.3 : Gasoil, Essence, Hybride, Électrique).
    6. Immatriculation (champ A).
    7. Couleur.

    LOGIQUE DE DÉDUCTION TYPE (VN/VO) :
    - VN (Véhicule Neuf) : Si l'année de 1ère immatriculation (champ B) est ${currentYear} et que le véhicule est identifié comme première main sans immatriculation antérieure.
    - VO (Véhicule d'Occasion) : Si l'année de 1ère immatriculation est inférieure à ${currentYear} ou si des mentions de mutations précédentes sont visibles.
    
    INTERDICTION : Pas de prix, pas d'état esthétique.`;
  } else {
    systemPrompt = `ANALYSE TECHNIQUE CHASSIS :
    1. Numéro de châssis (VIN 17 caractères).
    2. Marque et Modèle précis.
    3. Année de fabrication.
    4. Motorisation (Gasoil, Essence, Hybride, Électrique).
    5. Couleur.

    LOGIQUE DE DÉDUCTION TYPE (VN/VO) :
    - VN (Véhicule Neuf) : Si l'année de fabrication est ${currentYear} ou ${currentYear - 1}, et que l'aspect de la plaque constructeur est celui d'un véhicule sortant d'usine.
    - VO (Véhicule d'Occasion) : Si l'année de fabrication est < ${currentYear - 1}.
    
    En cas de doute sur une plaque VIN, privilégier VO si le modèle n'est plus commercialisé en neuf.
    INTERDICTION : Pas de prix, pas d'état esthétique.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Modèle rapide
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
          { text: systemPrompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vin: { type: Type.STRING },
            brand: { type: Type.STRING },
            model: { type: Type.STRING },
            fuelType: { type: Type.STRING, enum: ["Gasoil", "Essence", "Hybride", "Électrique", "N/A"] },
            yearOfManufacture: { type: Type.STRING },
            registrationYear: { type: Type.STRING },
            licensePlate: { type: Type.STRING },
            type: { 
              type: Type.STRING, 
              enum: ["VN", "VO"],
              description: "VN pour véhicule neuf (année en cours), VO pour occasion."
            },
            color: { type: Type.STRING }
          },
          required: ["brand", "model", "fuelType", "yearOfManufacture", "type"]
        }
      }
    });

    // Utilisation de la propriété .text (et non la méthode .text())
    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA");
    
    const data = JSON.parse(text);
    return {
      ...data,
      inventoryNotes: "" 
    } as VehicleAnalysis;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Traduction des erreurs courantes pour l'utilisateur
    if (error.message?.includes('429')) throw new Error("Quota API dépassé (429). Réessayez dans 1 minute.");
    if (error.message?.includes('400')) throw new Error("Image illisible ou format incorrect.");
    if (error.message?.includes('403')) throw new Error("Clé API invalide ou accès refusé.");
    throw error;
  }
};

export const chatWithExpert = async (
  history: { role: string; text: string }[],
  message: string
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Erreur: Clé API non configurée.";

  const ai = new GoogleGenAI({ apiKey });
  
  const contents = history.map(h => ({
    role: h.role === 'model' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: contents,
      config: {
        systemInstruction: "Tu es un assistant expert en automobile pour le marché marocain. Tu aides à l'identification technique, l'estimation Argus, les conseils d'importation et de dédouanement. Sois précis, professionnel et concis.",
      }
    });
    // Utilisation de la propriété .text
    return response.text || "";
  } catch (e) {
    console.error(e);
    return "Service momentanément indisponible (Erreur connexion IA).";
  }
};
