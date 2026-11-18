import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { storage } from '../services/demoService';
import type { UserRole } from '../types/models';
interface SessionValue {role:UserRole|null;login:(role:UserRole)=>void;logout:()=>void;}
const SessionContext=createContext<SessionValue|null>(null);
export function SessionProvider({children}:{children:ReactNode}){
 const [role,setRole]=useState<UserRole|null>(()=>storage.getSession());
 const value=useMemo<SessionValue>(()=>({role,login:(newRole)=>{storage.setSession(newRole);setRole(newRole);},logout:()=>{storage.setSession(null);setRole(null);}}),[role]);
 return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
export function useSession(){const ctx=useContext(SessionContext);if(!ctx)throw new Error('SessionProvider es obligatorio');return ctx;}
export const homeForRole:Record<UserRole,string>={ciudadano:'/',medico:'/medico',institucion:'/institucion',admin:'/administracion'};
export const roleLabels:Record<UserRole,string>={ciudadano:'Ciudadanía',medico:'Personal médico',institucion:'Institución',admin:'Administración'};