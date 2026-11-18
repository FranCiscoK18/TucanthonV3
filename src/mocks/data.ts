/** Datos totalmente ficticios: NO son datos oficiales, ni representan personas o ubicaciones reales de atención. */
import type { AggregatedCase, Alert, AuditLog, CitizenReport, DataSource, Disease, Doctor, DoctorSchedule, Region, VaccinationBrigade, VectorRecord } from '../types/models';
import { todayISO } from '../utils/format';

export const regions: Region[] = [
  { id:'centro', name:'Zona Centro · DEMO', zone:'centro',point:{longitude:-86.838,latitude:21.162},note:'Centroide ilustrativo, no es un límite administrativo.' },
  { id:'norte',name:'Zona Norte · DEMO',zone:'norte',point:{longitude:-86.833,latitude:21.205},note:'Centroide ilustrativo; ubicación agregada.' },
  { id:'sur',name:'Zona Sur · DEMO',zone:'sur',point:{longitude:-86.854,latitude:21.102},note:'Centroide ilustrativo; ubicación agregada.' },
  { id:'poniente',name:'Zona Poniente · DEMO',zone:'poniente',point:{longitude:-86.902,latitude:21.154},note:'Centroide ilustrativo; ubicación agregada.' },
  { id:'costa',name:'Zona Costa · DEMO',zone:'costa',point:{longitude:-86.790,latitude:21.134},note:'Centroide ilustrativo; ubicación agregada.' },
];
export const diseases: Disease[] = [
  {id:'dengue',name:'Dengue',category:'transmitida-vector',description:'Enfermedad transmitida por vector. Los conteos mostrados son escenarios inventados.',prevention:'Prevención general: retirar recipientes con agua acumulada y consultar fuentes sanitarias autorizadas.'},
  {id:'influenza',name:'Influenza',category:'viral-respiratoria',description:'Enfermedad viral respiratoria representada con series DEMO.',prevention:'Medidas generales: higiene de manos y revisar recomendaciones de autoridades de salud.'},
  {id:'covid',name:'COVID-19',category:'viral-respiratoria',description:'Enfermedad respiratoria; los números de este prototipo son ficticios.',prevention:'Revisar lineamientos sanitarios vigentes en fuentes oficiales.'},
  {id:'sarampion',name:'Sarampión',category:'prevenible-vacunacion',description:'Enfermedad prevenible por vacunación; ningún registro representa casos reales.',prevention:'Consultar cartillas y esquemas de vacunación con personal de salud acreditado.'},
  {id:'chikungunya',name:'Chikungunya',category:'transmitida-vector',description:'Enfermedad transmitida por vector, incorporada solo para demostrar filtros.',prevention:'Prevención ambiental y orientación sanitaria oficial.'},
  {id:'gastro',name:'Enfermedad gastrointestinal',category:'gastrointestinal',description:'Categoría agrupada ficticia utilizada con fines de demostración.',prevention:'Higiene alimentaria y orientación de profesionales de la salud.'},
];
export const categoryNames: Record<Disease['category'],string> = {'viral-respiratoria':'Viral respiratoria','transmitida-vector':'Transmitida por vector','prevenible-vacunacion':'Prevenible por vacunación','gastrointestinal':'Gastrointestinal'};
export const periods = ['2026-06','2026-07','2026-08','2026-09','2026-10','2026-11'];
export const sources: DataSource[] = [
  {id:'fuente-casos',name:'Registro institucional FICTICIO · DEMO',kind:'institucional-demo',date:'2026-11-17',limitation:'Serie completamente inventada, no obtenida de autoridades ni sistemas clínicos.',enabled:true},
  {id:'fuente-vector',name:'Estimador entomológico FICTICIO · DEMO',kind:'estimado-demo',date:'2026-11-17',limitation:'Índice arbitrario; no mide mosquitos reales ni riesgo individual.',enabled:true},
  {id:'fuente-ciudad',name:'Reportes ciudadanos FICTICIOS · DEMO',kind:'ciudadano-demo',date:'2026-11-17',limitation:'Avisos no verificados que jamás equivalen a casos clínicos.',enabled:true},
  {id:'fuente-brigadas',name:'Agenda de campañas FICTICIA · DEMO',kind:'simulado-demo',date:'2026-11-17',limitation:'Fechas y sedes de ejemplo. NO representan jornadas sanitarias disponibles.',enabled:true},
];
const baselines: Record<string, number[]> = {
  dengue:[17,22,25,29,34,47], influenza:[31,25,23,21,26,28], covid:[12,14,11,13,12,15],
  sarampion:[2,2,1,3,2,2],chikungunya:[7,9,11,12,10,14],gastro:[26,27,31,29,32,35],
};
const factors=[.9,1.14,.78,.95,.67];
export const cases: AggregatedCase[] = diseases.flatMap(d => periods.flatMap((period,month) => regions.flatMap((r,i) => (['confirmado-demo','probable-demo'] as const).map((classification,j)=>({
  id:`caso-${d.id}-${period}-${r.id}-${j}`, diseaseId:d.id,regionId:r.id,period,classification,
  count:Math.max(0,Math.round(baselines[d.id][month]*factors[i]*(j===0?.72:.28))),sourceId:'fuente-casos',kind:'institucional-demo' as const,
})))));
export const vectorRecords: VectorRecord[] = regions.flatMap((r,i)=>periods.map((p,j)=>({id:`vector-${r.id}-${p}`,regionId:r.id,diseaseId:'dengue',period:p,index:Math.round((2+i*1.3+j*.7)*10)/10,sourceId:'fuente-vector',kind:'estimado-demo' as const})));
const datePlus=(days:number)=>todayISO(days);
export const brigades: VaccinationBrigade[] = [
  {id:'b-1',name:'Jornada preventiva ilustrativa Norte',diseaseId:'influenza',date:datePlus(2),start:'09:00',end:'13:00',regionId:'norte',location:'Punto comunitario aproximado · zona Norte',point:regions[1].point,target:'Personas adultas · escenario DEMO',requirements:'Identificación ilustrativa (no acudir; evento ficticio)',status:'programada',kind:'simulado-demo'},
  {id:'b-2',name:'Campaña simulada de vacunación Sur',diseaseId:'sarampion',date:datePlus(4),start:'10:00',end:'14:00',regionId:'sur',location:'Punto comunitario aproximado · zona Sur',point:regions[2].point,target:'Población general · escenario DEMO',requirements:'Sin requisitos reales: evento ficticio',status:'programada',kind:'simulado-demo'},
  {id:'b-3',name:'Promoción ambiental Centro',diseaseId:'dengue',date:datePlus(6),start:'08:00',end:'12:00',regionId:'centro',location:'Sector Centro · referencia aproximada',point:regions[0].point,target:'Comunidad general · escenario DEMO',requirements:'Actividad ilustrativa; no corresponde a una campaña oficial',status:'en-revision',kind:'simulado-demo'},
  {id:'b-4',name:'Orientación preventiva Costa',diseaseId:'chikungunya',date:datePlus(8),start:'09:30',end:'12:30',regionId:'costa',location:'Sector Costa · referencia aproximada',point:regions[4].point,target:'Comunidad general · escenario DEMO',requirements:'Actividad ilustrativa, sin convocatoria real',status:'programada',kind:'simulado-demo'},
  {id:'b-5',name:'Jornada ilustrativa Poniente',diseaseId:'influenza',date:datePlus(-2),start:'09:00',end:'12:00',regionId:'poniente',location:'Sector Poniente · referencia aproximada',point:regions[3].point,target:'Personas adultas · DEMO',requirements:'Evento ficticio ya finalizado en el escenario',status:'finalizada',kind:'simulado-demo'},
];
const scheduleFor=(doctorId:string,modalities: ('presencial'|'en-linea')[]):DoctorSchedule[] => Array.from({length:8},(_,index)=>{
  const modality=modalities[index%modalities.length];
  return {id:`s-${doctorId}-${index}`,doctorId,date:datePlus(index+1),times:index%2===0?['09:00','11:00','16:00']:['10:00','12:30','17:30'],modality};
});
const seedDocs=[
  ['d1','Profesional DEMO 01','Medicina general',['fiebre','prevención'],380,['presencial','en-linea'],'centro','Consultorio ilustrativo Centro'],
  ['d2','Profesional DEMO 02','Pediatría',['prevención','vacunación'],520,['presencial'],'norte','Clínica ilustrativa Norte'],
  ['d3','Profesional DEMO 03','Medicina interna',['infecciones respiratorias','consulta general'],650,['presencial','en-linea'],'sur','Consultorio ilustrativo Sur'],
  ['d4','Profesional DEMO 04','Epidemiología',['prevención','orientación preventiva'],600,['en-linea'],'centro','Consultorio virtual ficticio'],
  ['d5','Profesional DEMO 05','Dermatología',['piel','prevención'],490,['presencial'],'poniente','Clínica ilustrativa Poniente'],
  ['d6','Profesional DEMO 06','Medicina familiar',['consulta general','salud comunitaria'],430,['presencial','en-linea'],'costa','Clínica ilustrativa Costa'],
] as const;
export const doctors:Doctor[]=seedDocs.map(([id,name,specialty,problems,price,modalities,regionId,clinic],i)=>({id,name,specialty,problems:[...problems],price,modalities:[...modalities],regionId,clinic,credential:`Cédula completamente ficticia DEMO-${String(i+1).padStart(4,'0')}`,about:'Perfil ficticio creado únicamente para probar la experiencia de búsqueda y agenda. No representa a una persona médica real.',schedule:scheduleFor(id,[...modalities]),kind:'simulado-demo'}));
export const sampleReports:CitizenReport[] = [
  {id:'demo-rep-1',category:'agua-estancada',regionId:'norte',comment:'Observación inventada de agua acumulada para comprobar el filtro.',createdAt:'2026-11-14T09:00:00',status:'en-revision',owner:'ejemplo',kind:'ciudadano-demo'},
  {id:'demo-rep-2',category:'posible-criadero',regionId:'sur',comment:'Posible criadero ilustrativo. No verificado.',createdAt:'2026-11-15T12:00:00',status:'pendiente',owner:'ejemplo',kind:'ciudadano-demo'},
  {id:'demo-rep-3',category:'basura-acumulada',regionId:'centro',comment:'Reporte ficticio de prueba.',createdAt:'2026-11-15T13:30:00',status:'verificado',owner:'ejemplo',kind:'ciudadano-demo'},
  {id:'demo-rep-4',category:'otro',regionId:'poniente',comment:'Situación ambiental simulada.',createdAt:'2026-11-16T16:00:00',status:'pendiente',owner:'ejemplo',kind:'ciudadano-demo'},
];
export const reportCategories:Record<CitizenReport['category'],string>={'posible-criadero':'Posible criadero','agua-estancada':'Agua estancada','basura-acumulada':'Basura acumulada','otro':'Otro riesgo ambiental'};
export const alerts: Alert[] = [
  {id:'a-1',title:'Variación de la serie simulada de dengue',message:'La serie ficticia presenta un incremento frente al periodo anterior. Es un ejercicio estadístico, no evidencia de transmisión local.',date:'2026-11-17',sourceId:'fuente-casos',limitation:'Datos inventados; no implica diagnóstico ni declaración de brote.',severity:'observacion',kind:'simulado-demo'},
  {id:'a-2',title:'Agenda de actividades ilustrativas',message:'Las brigadas mostradas sirven para probar filtros y navegación; no son convocatorias reales.',date:'2026-11-17',sourceId:'fuente-brigadas',limitation:'Verifique campañas reales únicamente con autoridades sanitarias.',severity:'informativa',kind:'simulado-demo'},
];
export const seedAudit:AuditLog[]=[{id:'log-1',action:'Carga de escenario',actor:'Sistema DEMO',date:'2026-11-17T09:00:00',detail:'Se configuró un conjunto de datos completamente ficticios.',kind:'simulado-demo'}];