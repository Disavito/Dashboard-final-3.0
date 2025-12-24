import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // Agrega el visualizador. Se ejecutará solo al hacer 'npm run build'
        visualizer({
            filename: 'stats.html', // Nombre del archivo de reporte
            open: true, // Abrir el reporte en el navegador automáticamente
            // Desactivamos los cálculos de compresión que causan el error en este entorno
            gzipSize: false,
            brotliSize: false,
        }),
    ],
    resolve: {
        alias: {
            // Alias para rutas internas del proyecto (ej. '@/components')
            '@': path.resolve(__dirname, './src'),
            // Forzar que 'react' y 'react-dom' siempre resuelvan a la misma instancia
            'react': path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        },
    },
    preview: {
        host: true,
        allowedHosts: ['dashboard3-dashboard3.mv7mvl.easypanel.host']
    }
});
