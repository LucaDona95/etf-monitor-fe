import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl';


export default defineConfig(({ mode }) => {
  // Controlliamo se siamo in modalità staging o production
  const isHttps = mode === 'staging' || mode === 'production';

  return {
    // Gestiamo il plugin in modo condizionale
    plugins: [
      react(),
      ...(isHttps ? [basicSsl()] : []),
    ],
    server: {
      port: 5173,
      host: true,
      // Rimuovendo "https: isHttps" evitiamo l'errore di TypeScript.
      // Ci pensa il plugin basicSsl() ad attivare l'HTTPS a runtime.
    },
  };
});