
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  
  // Stratégie robuste : on cherche dans loadEnv ET process.env
  // Vercel expose parfois les clés système uniquement dans process.env
  const apiKey = env.VITE_API_KEY || env.API_KEY || process.env.VITE_API_KEY || process.env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // Injection via une constante globale pour éviter "Cannot read properties of undefined (reading 'VITE_API_KEY')"
      '__GEMINI_API_KEY__': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
