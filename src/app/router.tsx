/** Rutas de la SPA. Las vistas públicas no requieren cuenta; las demás se protegen por rol. */
import { createBrowserRouter } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';
import { AdminPage } from '../pages/AdminPage';
import { BrigadeDetailPage } from '../pages/BrigadeDetailPage';
import { BrigadesPage } from '../pages/BrigadesPage';
import { DiseaseDetailPage } from '../pages/DiseaseDetailPage';
import { DiseasesPage } from '../pages/DiseasesPage';
import { HomePage } from '../pages/HomePage';
import { LandingPage } from '../pages/LandingPage';
import { InstitutionalPage } from '../pages/InstitutionalPage';
import { LoginPage } from '../pages/LoginPage';
import { MapPage } from '../pages/MapPage';
import { MyReportsPage } from '../pages/MyReportsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RegulationsPage } from '../pages/RegulationsPage';
import { ReportNewPage } from '../pages/ReportNewPage';
import { RouteErrorPage } from '../pages/RouteErrorPage';
import { RequireArea } from './RequireArea';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'inicio', element: <HomePage /> },
      { path: 'mapa', element: <MapPage /> },
      { path: 'enfermedades', element: <DiseasesPage /> },
      { path: 'enfermedades/:diseaseId', element: <DiseaseDetailPage /> },
      { path: 'brigadas', element: <BrigadesPage /> },
      { path: 'brigadas/:activityId', element: <BrigadeDetailPage /> },
      { path: 'reportar', element: <ReportNewPage /> },
      { path: 'normativa', element: <RegulationsPage /> },
      { path: 'acceso', element: <LoginPage /> },
      { path: 'mis-reportes', element: <MyReportsPage /> },
      {
        path: 'institucion',
        element: (
          <RequireArea area="institucion">
            <InstitutionalPage />
          </RequireArea>
        ),
      },
      {
        path: 'administracion',
        element: (
          <RequireArea area="administracion">
            <AdminPage />
          </RequireArea>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
