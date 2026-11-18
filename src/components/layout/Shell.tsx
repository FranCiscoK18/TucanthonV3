import { Activity, CalendarClock, ChevronRight, ClipboardList, HeartPulse, LayoutDashboard, LogOut, MapPinned, Menu, ShieldCheck, Stethoscope, Syringe, UserRoundCog, UsersRound, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '../../types/models';
import { homeForRole, roleLabels, useSession } from '../../app/SessionContext';
const items:{to:string;label:string;icon:LucideIcon;roles:UserRole[]}[]=[
 {to:'/',label:'Inicio',icon:LayoutDashboard,roles:['ciudadano']},
 {to:'/mapa',label:'Mapa epidemiológico',icon:MapPinned,roles:['ciudadano']},
 {to:'/enfermedades',label:'Enfermedades y tendencias',icon:Activity,roles:['ciudadano']},
 {to:'/brigadas',label:'Brigadas y campañas',icon:Syringe,roles:['ciudadano']},
 {to:'/directorio',label:'Directorio médico',icon:Stethoscope,roles:['ciudadano']},
 {to:'/citas',label:'Mis citas',icon:CalendarClock,roles:['ciudadano']},
 {to:'/reportes',label:'Reportes ciudadanos',icon:ClipboardList,roles:['ciudadano']},
 {to:'/medico',label:'Mi perfil y agenda',icon:HeartPulse,roles:['medico']},
 {to:'/institucion',label:'Panel institucional',icon:UsersRound,roles:['institucion','admin']},
 {to:'/administracion',label:'Administración',icon:UserRoundCog,roles:['admin']},
];
export function Shell(){const {role,logout}=useSession();const navigate=useNavigate();const [open,setOpen]=useState(false);
 const visible=items.filter(item=>!!role&&item.roles.includes(role));const exit=()=>{logout();navigate('/acceso');};
 return <div className="min-h-screen bg-cream-paper">
  <header className="sticky top-0 z-30 border-b border-border-mist bg-cream-paper/95 backdrop-blur-sm"><div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-4 sm:px-7 lg:px-9">
   <NavLink to={role?homeForRole[role]:'/acceso'} className="flex items-center gap-3 text-forest-ink" aria-label="EpiRadar Cancún, inicio"><span className="grid size-10 place-items-center rounded-[12px] bg-forest-ink text-white"><HeartPulse size={23}/></span><span className="leading-tight"><strong className="block text-base tracking-tight">EpiRadar <span className="font-normal">Cancún</span></strong><small className="text-[10px] font-semibold uppercase tracking-[.12em]">Inteligencia en salud · DEMO</small></span></NavLink>
   <div className="flex items-center gap-2"><span className="hidden rounded-full bg-[#f4ead9] px-3 py-1.5 text-xs font-bold text-[#604315] sm:inline-flex">ENTORNO DEMO · DATOS FICTICIOS</span><span className="hidden text-sm font-medium text-forest-ink md:inline">{role&&roleLabels[role]}</span><button className="btn-secondary !min-h-10 !px-3" onClick={exit} aria-label="Cerrar sesión DEMO"><LogOut size={16}/><span className="hidden sm:inline">Salir</span></button><button className="btn-secondary !min-h-10 !px-3 lg:hidden" onClick={()=>setOpen(o=>!o)} aria-expanded={open} aria-controls="menu-movil" aria-label={open?'Cerrar menú':'Abrir menú'}>{open?<X size={20}/>:<Menu size={20}/>}</button></div>
  </div></header>
  <div className="mx-auto flex max-w-[1440px]">
   <aside className="hidden min-h-[calc(100vh-70px)] w-[258px] shrink-0 border-r border-border-mist px-4 py-8 lg:block"><p className="eyebrow mb-5 px-3">Navegación</p><nav aria-label="Navegación principal" className="space-y-2">{visible.map(({to,label,icon:Icon})=><NavLink end={to==='/'} key={to} to={to} className={({isActive})=>`flex min-h-11 items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${isActive?'bg-keylime-wash text-forest-ink':'text-charcoal/75 hover:bg-keylime-wash/60'}`}><Icon size={18}/><span>{label}</span><ChevronRight className="ml-auto opacity-50" size={14}/></NavLink>)}</nav><div className="mt-10 rounded-[14px] bg-slate-hush p-4 text-xs leading-5 text-[#24434c]"><ShieldCheck size={20} className="mb-3"/><strong className="block">Prototipo académico</strong>Sin autenticación ni datos epidemiológicos reales.</div></aside>
   {open&&<div id="menu-movil" className="fixed inset-x-0 top-[70px] z-20 border-b border-border-mist bg-cream-paper p-4 lg:hidden"><nav aria-label="Navegación móvil" className="grid max-h-[70vh] grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">{visible.map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to==='/'} onClick={()=>setOpen(false)} className={({isActive})=>`flex min-h-11 items-center gap-3 rounded-[10px] p-3 text-sm ${isActive?'bg-keylime-wash text-forest-ink':'hover:bg-keylime-wash/60'}`}><Icon size={17}/>{label}</NavLink>)}</nav></div>}
   <main id="contenido" className="min-w-0 flex-1 px-4 pb-16 pt-8 sm:px-7 lg:px-9 lg:pt-10"><Outlet/><footer className="mt-14 border-t border-border-mist pt-6 text-xs leading-6 text-charcoal/60"><span className="font-semibold text-forest-ink">EpiRadar Cancún · DEMO</span> · Datos, casos, especialistas, horarios y campañas totalmente ficticios. No sustituye la valoración médica ni la información de autoridades sanitarias.</footer></main>
  </div>
 </div>;
}