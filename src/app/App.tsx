import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Shell } from '../components/layout/Shell';
import { Dashboard } from '../pages/Dashboard';
import { EpidemiologicalMap } from '../pages/EpidemiologicalMap';
import { Diseases } from '../pages/Diseases';
import { Brigades } from '../pages/Brigades';
import { Directory } from '../pages/Directory';
import { Appointments } from '../pages/Appointments';
import { Reports } from '../pages/Reports';
import { DoctorPanel } from '../pages/DoctorPanel';
import { InstitutionalPanel } from '../pages/InstitutionalPanel';
import { Administration } from '../pages/Administration';
import { Login } from '../pages/Login';
import { SessionProvider, homeForRole, useSession } from './SessionContext';
import type { UserRole } from '../types/models';
import { EmptyState } from '../components/ui/Elements';
function PrivateShell(){const {role}=useSession();return role?<Shell/>:<Navigate to="/acceso" replace/>;}
function RoleGuard({allowed}:{allowed:UserRole[]}){const {role}=useSession();if(!role)return <Navigate to="/acceso" replace/>;if(!allowed.includes(role))return <EmptyState title="Acceso restringido por rol DEMO" description="Este módulo no está habilitado para el rol seleccionado. El control es ilustrativo y no constituye seguridad real."/>;return <Outlet/>;}
function Fallback(){const {role}=useSession();return <Navigate to={role?homeForRole[role]:'/acceso'} replace/>;}
export function App(){return <SessionProvider><a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-forest-ink focus:p-3 focus:text-white">Saltar al contenido</a><Routes><Route path="/acceso" element={<Login/>}/><Route element={<PrivateShell/>}><Route element={<RoleGuard allowed={['ciudadano']}/>}><Route index element={<Dashboard/>}/><Route path="/mapa" element={<EpidemiologicalMap/>}/><Route path="/enfermedades" element={<Diseases/>}/><Route path="/enfermedades/:id" element={<Diseases/>}/><Route path="/brigadas" element={<Brigades/>}/><Route path="/directorio" element={<Directory/>}/><Route path="/medicos/:id" element={<Directory/>}/><Route path="/citas" element={<Appointments/>}/><Route path="/reportes" element={<Reports/>}/></Route><Route element={<RoleGuard allowed={['medico']}/>}><Route path="/medico" element={<DoctorPanel/>}/></Route><Route element={<RoleGuard allowed={['institucion','admin']}/>}><Route path="/institucion" element={<InstitutionalPanel/>}/></Route><Route element={<RoleGuard allowed={['admin']}/>}><Route path="/administracion" element={<Administration/>}/></Route></Route><Route path="*" element={<Fallback/>}/></Routes></SessionProvider>;}