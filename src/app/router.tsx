/** Rutas de la SPA. Las vistas públicas no requieren cuenta; las demás se protegen por rol. */
import { createBrowserRouter } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';
import { AdminPage } from '../pages/AdminPage';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { BrigadeDetailPage } from '../pages/BrigadeDetailPage';
import { BrigadesPage } from '../pages/BrigadesPage';
import { DirectoryPage } from '../pages/DirectoryPage';
import { DiseaseDetailPage } from '../pages/DiseaseDetailPage';
import { DiseasesPage } from '../pages/DiseasesPage';
import { DoctorPanelPage } from '../pages/DoctorPanelPage';
import { DoctorProfilePage } from '../pages/DoctorProfilePage';
import { HomePage } from '../pages/HomePage';
import { HowItWorksPage } from '../pages/HowItWorksPage';
import { InstitutionalPage } from '../pages/InstitutionalPage';
import { LoginPage } from '../pages/LoginPage';
import { MapPage } from '../pages/MapPage';
import { MyReportsPage } from '../pages/MyReportsPage';
import { NewAppointmentPage } from '../pages/NewAppointmentPage';
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
      { index: true, element: <HomePage /> },
      { path: 'como-funciona', element: <HowItWorksPage /> },
      { path: 'mapa', element: <MapPage /> },
      { path: 'enfermedades', element: <DiseasesPage /> },
      { path: 'enfermedades/:diseaseId', element: <DiseaseDetailPage /> },
      { path: 'brigadas', element: <BrigadesPage /> },
      { path: 'brigadas/:activityId', element: <BrigadeDetailPage /> },
      { path: 'directorio', element: <DirectoryPage /> },
      { path: 'directorio/:doctorId', element: <DoctorProfilePage /> },
      { path: 'reportar', element: <ReportNewPage /> },
      { path: 'normativa', element: <RegulationsPage /> },
      { path: 'acceso', element: <LoginPage /> },
      {
        path: 'mis-reportes',
        element: (
          <RequireArea area="mis-reportes">
            <MyReportsPage />
          </RequireArea>
        ),
      },
      {
        path: 'citas',
        element: (
          <RequireArea area="citas">
            <AppointmentsPage />
          </RequireArea>
        ),
      },
      {
        path: 'citas/nueva',
        element: (
          <RequireArea area="citas">
            <NewAppointmentPage />
          </RequireArea>
        ),
      },
      {
        path: 'medico',
        element: (
          <RequireArea area="medico">
            <DoctorPanelPage />
          </RequireArea>
        ),
      },
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
