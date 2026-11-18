/** Todos los registros son inventados y exclusivos de la DEMO. */
export type UserRole = 'ciudadano' | 'medico' | 'institucion' | 'admin';
export type DiseaseCategory = 'viral-respiratoria' | 'transmitida-vector' | 'prevenible-vacunacion' | 'gastrointestinal';
export type CaseClassification = 'confirmado-demo' | 'probable-demo';
export type DataKind = 'institucional-demo' | 'estimado-demo' | 'ciudadano-demo' | 'simulado-demo';
export type GeoPoint = { longitude: number; latitude: number };
export interface Disease { id: string; name: string; category: DiseaseCategory; description: string; prevention: string; }
export interface Region { id: string; name: string; zone: 'norte'|'sur'|'centro'|'poniente'|'costa'; point: GeoPoint; note: string; }
export interface AggregatedCase { id: string; diseaseId: string; regionId: string; period: string; classification: CaseClassification; count: number; sourceId: string; kind: 'institucional-demo'; }
export interface VectorRecord { id: string; regionId: string; diseaseId: string; period: string; index: number; sourceId: string; kind: 'estimado-demo'; }
export interface VaccinationBrigade { id: string; name: string; diseaseId: string; date: string; start: string; end: string; regionId: string; location: string; point: GeoPoint; target: string; requirements: string; status: 'programada'|'en-revision'|'finalizada'; kind: 'simulado-demo'; }
export interface DoctorSchedule { id: string; doctorId: string; date: string; times: string[]; modality: 'presencial'|'en-linea'; }
export interface Doctor { id: string; name: string; specialty: string; problems: string[]; price: number; modalities: ('presencial'|'en-linea')[]; regionId: string; clinic: string; credential: string; about: string; schedule: DoctorSchedule[]; kind: 'simulado-demo'; }
export interface Appointment { id: string; doctorId: string; date: string; time: string; modality: 'presencial'|'en-linea'; patientName: string; createdAt: string; status: 'programada'|'cancelada'; kind: 'simulado-demo'; }
export interface CitizenReport { id: string; category: 'posible-criadero'|'agua-estancada'|'basura-acumulada'|'otro'; regionId: string; comment: string; imageName?: string; createdAt: string; status: 'pendiente'|'en-revision'|'verificado'; owner: 'propio'|'ejemplo'; kind: 'ciudadano-demo'; }
export interface Alert { id: string; title: string; message: string; date: string; sourceId: string; limitation: string; severity: 'informativa'|'observacion'; kind: 'simulado-demo'; }
export interface DataSource { id: string; name: string; kind: DataKind; date: string; limitation: string; enabled: boolean; }
export interface AuditLog { id: string; action: string; actor: string; date: string; detail: string; kind: 'simulado-demo'; }
export interface MapLayerConfig { id:'epidemiologia'|'entomologia'|'reportes'|'brigadas'; label:string; note:string; }