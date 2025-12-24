import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout'; // Corregido: Usar DashboardLayout
import DashboardPage from './pages/Dashboard'; // Corregido: Usar Dashboard.tsx
import InvoicingLayout from './pages/invoicing/InvoicingLayout';
import BoletasPage from './pages/invoicing/BoletasPage';
import ResumenDiarioPage from './pages/invoicing/ResumenDiarioPage';
import NotasCreditoPage from './pages/invoicing/NotasCreditoPage';
import RecibosPage from './pages/invoicing/RecibosPage'; // New import

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />, // Corregido: Usar DashboardLayout
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'invoicing',
        element: <InvoicingLayout />,
        children: [
          {
            path: 'boletas',
            element: <BoletasPage />,
          },
          {
            path: 'resumen-diario',
            element: <ResumenDiarioPage />,
          },
          {
            path: 'notas-credito',
            element: <NotasCreditoPage />,
          },
          {
            path: 'recibos', // RUTA CONFIRMADA
            element: <RecibosPage />,
          },
          // Add placeholder for disabled routes if needed
          {
            path: 'facturas',
            element: <div>Facturación de Facturas (Próximamente)</div>,
          },
        ],
      },
      // ... other main routes
    ],
  },
]);

export default router;
