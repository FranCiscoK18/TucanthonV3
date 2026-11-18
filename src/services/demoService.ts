/** Servicios simulados. No realizan solicitudes a APIs sanitarias ni guardan datos en servidores. */
import { alerts, brigades, cases, diseases, doctors, regions, sampleReports, seedAudit, sources, vectorRecords } from '../mocks/data';
import type { Appointment, AuditLog, CitizenReport, DataSource, UserRole } from '../types/models';
import { uid } from '../utils/format';
const KEYS = {session:'epiradar-demo-session',appointments:'epiradar-demo-appointments',reports:'epiradar-demo-reports'} as const;
const delay = (ms=420)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
function safeRead<T>(key:string,fallback:T):T { try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function safeWrite(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value));}catch{throw new Error('No se pudo guardar en este navegador. Comprueba que localStorage esté habilitado.');}}
export const storage = {
  getSession:():UserRole|null=>{const role=safeRead<UserRole|null>(KEYS.session,null);return ['ciudadano','medico','institucion','admin'].includes(role??'')?role:null;},
  setSession:(role:UserRole|null)=>role?safeWrite(KEYS.session,role):localStorage.removeItem(KEYS.session),
};
export async function getDashboardData(){await delay();return {diseases,alerts,regions,brigades,cases};}
export async function getMapData(){await delay(550);return {cases,vectorRecords,regions,brigades,reports:getAllReports()};}
export async function getDiseasesData(){await delay();return {diseases,cases};}
export async function getBrigadesData(){await delay();return brigades;}
export async function getDoctorsData(){await delay();return doctors;}
export async function getAppointments(){await delay(300);return safeRead<Appointment[]>(KEYS.appointments,[]);}
export async function createAppointment(appointment:Omit<Appointment,'id'|'createdAt'|'status'|'kind'>){
  await delay(580);
  const existing=safeRead<Appointment[]>(KEYS.appointments,[]);
  const alreadyTaken=existing.some(a=>a.doctorId===appointment.doctorId&&a.date===appointment.date&&a.time===appointment.time&&a.status==='programada');
  if(alreadyTaken)throw new Error('Ese horario ya fue reservado en esta DEMO. Selecciona otro.');
  const created:Appointment={...appointment,id:uid('cita'),createdAt:new Date().toISOString(),status:'programada',kind:'simulado-demo'};
  safeWrite(KEYS.appointments,[created,...existing]);return created;
}
export async function cancelAppointment(id:string){await delay(350);const all=safeRead<Appointment[]>(KEYS.appointments,[]);safeWrite(KEYS.appointments,all.map(a=>a.id===id?{...a,status:'cancelada'}:a));}
export async function getOwnReports(){await delay(350);return safeRead<CitizenReport[]>(KEYS.reports,[]);}
export function getAllReports(){return [...safeRead<CitizenReport[]>(KEYS.reports,[]),...sampleReports];}
export async function createReport(input:Pick<CitizenReport,'category'|'regionId'|'comment'|'imageName'>){
  await delay(500);
  const created:CitizenReport={...input,id:uid('reporte'),createdAt:new Date().toISOString(),status:'pendiente',owner:'propio',kind:'ciudadano-demo'};
  safeWrite(KEYS.reports,[created,...safeRead<CitizenReport[]>(KEYS.reports,[])]);return created;
}
export async function moderateReport(id:string,status:CitizenReport['status']){
  await delay(400);
  const current=safeRead<CitizenReport[]>(KEYS.reports,[]);
  if(current.some(r=>r.id===id))safeWrite(KEYS.reports,current.map(r=>r.id===id?{...r,status}:r));
  else exampleStatuses.set(id,status);
  recordAudit('Moderación de reporte',`Reporte ${id} → ${status}`);
}
const exampleStatuses=new Map<string,CitizenReport['status']>();
export async function getInstitutionalData(){await delay();return {cases,reports:getAllReports().map(r=>({...r,status:exampleStatuses.get(r.id)??r.status})),regions,diseases,vectorRecords};}
let demoSources: DataSource[]=sources.map(s=>({...s}));
let log:AuditLog[]=[...seedAudit];
const recordAudit=(action:string,detail:string)=>{log=[{id:uid('log'),action,actor:'Administración simulada',date:new Date().toISOString(),detail,kind:'simulado-demo'},...log];};
export async function getAdministrationData(){await delay();return {sources:[...demoSources],reports:getAllReports().map(r=>({...r,status:exampleStatuses.get(r.id)??r.status})),audit:[...log]};}
export async function toggleSource(id:string,enabled:boolean){await delay(300);demoSources=demoSources.map(s=>s.id===id?{...s,enabled}:s);recordAudit('Cambio de fuente',`${id}: ${enabled?'habilitada':'deshabilitada'} en la vista DEMO`);}
export function exportCSV(rows:Record<string,string|number>[],filename:string){
  const cols=Object.keys(rows[0]??{});if(cols.length===0)return;
  const csv=[cols.join(','),...rows.map(row=>cols.map(k=>`"${String(row[k]??'').replace(/^[=+@-]/,"'").replaceAll('"','""')}"`).join(','))].join('\r\n');
  const blob=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}