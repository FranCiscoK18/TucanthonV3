import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ROUTE_ACCESS } from './access';
import { RequireRole } from './RequireRole';
import { SessionProvider } from './SessionContext';

const Home = lazy(() => import('../pages/Home'));
const HowItWorks = lazy(() => import('../pages/HowItWorks'));
const MapPage = lazy(() => import('../pages/MapPage'));
const Diseases = lazy(() => import('../pages/Diseases'));
const DiseaseDetail = lazy(() => import('../pages/DiseaseDetail'));
const Brigades = lazy(() => import('../pages/Brigades'));
const BrigadeDetail = lazy(() => import('../pages/BrigadeDetail'));
const ReportNew = lazy(() => import('../pages/ReportNew'));
const MyReports = lazy(() => import('../pages/MyReports'));
const Institutional = lazy(() => import('../pages/Institutional'));
const Admin = lazy(() => import('../pages/Admin'));
const Regulations = lazy(() => import('../pages/Regulations'));
const Login = lazy(() => import('../pages/Login'));
const NoPermission = lazy(() => import('../pages/NoPermission'));
const NotFound = lazy(() => import('../pages/NotFound'));

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Público (sin cuenta)
      { path: '/', element: <Home /> },
      { path: '/como-funciona', element: <HowItWorks /> },
      { path: '/mapa', element: <MapPage /> },
      { path: '/enfermedades', element: <Diseases /> },
      { path: '/enfermedades/:id', element: <DiseaseDetail /> },
      { path: '/brigadas', element: <Brigades /> },
      { path: '/brigadas/:id', element: <BrigadeDetail /> },
      { path: '/reportes', element: <ReportNew /> },
      { path: '/normativa', element: <Regulations /> },
      { path: '/acceso', element: <Login /> },
      { path: '/sin-permiso', element: <NoPermission /> },
      // Con sesión mock
      {
        path: '/reportes/mios',
        element: (
          <RequireRole roles={ROUTE_ACCESS.misReportes}>
            <MyReports />
          </RequireRole>
        ),
      },
      {
        path: '/institucion',
        element: (
          <RequireRole roles={ROUTE_ACCESS.institucion}>
            <Institutional />
          </RequireRole>
        ),
      },
      {
        path: '/administracion',
        element: (
          <RequireRole roles={ROUTE_ACCESS.admin}>
            <Admin />
          </RequireRole>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
], {
  future: {
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </SessionProvider>
  );
}
