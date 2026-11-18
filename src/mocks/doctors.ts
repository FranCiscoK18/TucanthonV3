/**
 * Directorio DEMO de servicios de salud. Nombres claramente ficticios («Ejemplo»,
 * «Muestra», «Prueba»…), cédulas simuladas y precios ilustrativos. Ninguna persona real.
 */
import type { Appointment, CareModality, Doctor, DoctorSchedule, ProviderType } from '../types';
import { addDays, cancunLocalToIso } from '../utils/dates';
import { getDemoClock } from './clock';

export const providerTypeLabels: Record<ProviderType, string> = {
  medico: 'Médico o médica',
  consultorio: 'Consultorio',
  clinica: 'Clínica',
};

interface ScheduleSeed {
  weekdays: number[];
  start: string;
  end: string;
  slotMinutes: number;
  modalities: CareModality[];
}

interface DoctorSeed extends Omit<Doctor, 'schedule' | 'isDemo' | 'credential'> {
  blocks: ScheduleSeed[];
}

const seeds: DoctorSeed[] = [
  {
    id: 'itzel-ejemplo',
    providerType: 'medico',
    name: 'Dra. Itzel Ejemplo',
    specialty: 'Medicina general',
    healthTopics: ['Fiebre y malestar general', 'Chequeo general', 'Orientación sobre dengue'],
    priceMXN: 450,
    modalities: ['presencial', 'en-linea'],
    regionId: 'centro',
    locationHint: 'Consultorio en la zona Centro',
    languages: ['Español', 'Inglés'],
    bio: 'Perfil ficticio para probar la búsqueda y la agenda. Atiende consulta general y orientación preventiva.',
    blocks: [
      { weekdays: [1, 2, 3, 4, 5], start: '09:00', end: '13:00', slotMinutes: 30, modalities: ['presencial'] },
      { weekdays: [1, 3, 5], start: '16:00', end: '19:00', slotMinutes: 30, modalities: ['en-linea'] },
    ],
  },
  {
    id: 'mateo-muestra',
    providerType: 'medico',
    name: 'Dr. Mateo Muestra',
    specialty: 'Pediatría',
    healthTopics: ['Salud infantil', 'Vacunación', 'Fiebre y malestar general'],
    priceMXN: 650,
    modalities: ['presencial'],
    regionId: 'noroeste',
    locationHint: 'Consultorio en la zona Noroeste',
    languages: ['Español'],
    bio: 'Perfil ficticio de pediatría para la demostración. Revisión de cartillas y consulta infantil.',
    blocks: [{ weekdays: [1, 2, 3, 4, 5, 6], start: '10:00', end: '14:00', slotMinutes: 30, modalities: ['presencial'] }],
  },
  {
    id: 'consultorio-ceiba',
    providerType: 'consultorio',
    name: 'Consultorio Ceiba',
    specialty: 'Medicina familiar',
    healthTopics: ['Chequeo general', 'Enfermedades crónicas', 'Tos y vías respiratorias'],
    priceMXN: 350,
    modalities: ['presencial'],
    regionId: 'sur',
    locationHint: 'Consultorio en la zona Sur',
    languages: ['Español', 'Maya'],
    bio: 'Consultorio ficticio de medicina familiar con horario extendido.',
    blocks: [
      { weekdays: [1, 2, 3, 4, 5], start: '08:00', end: '14:00', slotMinutes: 30, modalities: ['presencial'] },
      { weekdays: [6], start: '09:00', end: '13:00', slotMinutes: 30, modalities: ['presencial'] },
    ],
  },
  {
    id: 'clinica-manglar',
    providerType: 'clinica',
    name: 'Clínica Manglar',
    specialty: 'Medicina interna e infectología',
    healthTopics: ['Fiebre y malestar general', 'Orientación sobre dengue', 'Enfermedades crónicas'],
    priceMXN: 850,
    modalities: ['presencial', 'en-linea'],
    regionId: 'poniente',
    locationHint: 'Clínica en la zona Poniente',
    languages: ['Español', 'Inglés'],
    bio: 'Clínica ficticia con consulta de medicina interna e infectología.',
    blocks: [
      { weekdays: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', slotMinutes: 45, modalities: ['presencial'] },
      { weekdays: [2, 4], start: '18:00', end: '20:00', slotMinutes: 30, modalities: ['en-linea'] },
    ],
  },
  {
    id: 'sofia-prueba',
    providerType: 'medico',
    name: 'Dra. Sofía Prueba',
    specialty: 'Ginecología y obstetricia',
    healthTopics: ['Embarazo', 'Vacunación', 'Chequeo general'],
    priceMXN: 750,
    modalities: ['presencial'],
    regionId: 'norte',
    locationHint: 'Consultorio en la zona Norte',
    languages: ['Español'],
    bio: 'Perfil ficticio de ginecología y obstetricia para la demostración.',
    blocks: [{ weekdays: [1, 3, 5], start: '10:00', end: '15:00', slotMinutes: 30, modalities: ['presencial'] }],
  },
  {
    id: 'andres-simulado',
    providerType: 'medico',
    name: 'Dr. Andrés Simulado',
    specialty: 'Medicina interna',
    healthTopics: ['Enfermedades crónicas', 'Tos y vías respiratorias', 'Chequeo general'],
    priceMXN: 900,
    modalities: ['en-linea'],
    regionId: 'zona-hotelera',
    locationHint: 'Atención en línea',
    languages: ['Español', 'Inglés', 'Francés'],
    bio: 'Perfil ficticio que solo ofrece consulta en línea.',
    blocks: [{ weekdays: [1, 2, 3, 4, 5], start: '12:00', end: '18:00', slotMinutes: 30, modalities: ['en-linea'] }],
  },
  {
    id: 'consultorio-sascab',
    providerType: 'consultorio',
    name: 'Consultorio Sascab',
    specialty: 'Medicina general',
    healthTopics: ['Malestar estomacal', 'Fiebre y malestar general', 'Chequeo general'],
    priceMXN: 250,
    modalities: ['presencial'],
    regionId: 'bonfil',
    locationHint: 'Consultorio en la zona Bonfil',
    languages: ['Español', 'Maya'],
    bio: 'Consultorio ficticio de bajo costo con atención por la tarde.',
    blocks: [{ weekdays: [1, 2, 3, 4, 5, 6], start: '15:00', end: '20:00', slotMinutes: 30, modalities: ['presencial'] }],
  },
  {
    id: 'valeria-ficticia',
    providerType: 'medico',
    name: 'Dra. Valeria Ficticia',
    specialty: 'Dermatología',
    healthTopics: ['Piel y sarpullido', 'Picaduras', 'Chequeo general'],
    priceMXN: 800,
    modalities: ['presencial', 'en-linea'],
    regionId: 'centro',
    locationHint: 'Consultorio en la zona Centro',
    languages: ['Español'],
    bio: 'Perfil ficticio de dermatología para la demostración.',
    blocks: [
      { weekdays: [2, 4], start: '09:00', end: '14:00', slotMinutes: 30, modalities: ['presencial'] },
      { weekdays: [5], start: '10:00', end: '13:00', slotMinutes: 30, modalities: ['en-linea'] },
    ],
  },
  {
    id: 'clinica-chaca',
    providerType: 'clinica',
    name: 'Clínica Chacá',
    specialty: 'Geriatría',
    healthTopics: ['Personas mayores', 'Enfermedades crónicas', 'Vacunación'],
    priceMXN: 700,
    modalities: ['presencial'],
    regionId: 'sur',
    locationHint: 'Clínica en la zona Sur',
    languages: ['Español'],
    bio: 'Clínica ficticia enfocada en la atención de personas mayores.',
    blocks: [{ weekdays: [1, 2, 3, 4, 5], start: '08:00', end: '13:00', slotMinutes: 45, modalities: ['presencial'] }],
  },
  {
    id: 'julian-ejemplar',
    providerType: 'medico',
    name: 'Dr. Julián Ejemplar',
    specialty: 'Neumología',
    healthTopics: ['Tos y vías respiratorias', 'Enfermedades crónicas'],
    priceMXN: 950,
    modalities: ['presencial', 'en-linea'],
    regionId: 'poniente',
    locationHint: 'Consultorio en la zona Poniente',
    languages: ['Español', 'Inglés'],
    bio: 'Perfil ficticio de neumología para la demostración.',
    blocks: [
      { weekdays: [1, 3], start: '16:00', end: '20:00', slotMinutes: 30, modalities: ['presencial'] },
      { weekdays: [6], start: '09:00', end: '12:00', slotMinutes: 30, modalities: ['en-linea'] },
    ],
  },
];

export const doctors: Doctor[] = seeds.map(({ blocks, ...seed }, index) => {
  const schedule: DoctorSchedule[] = blocks.flatMap((block) =>
    block.weekdays.map((weekday) => ({
      doctorId: seed.id,
      weekday,
      start: block.start,
      end: block.end,
      slotMinutes: block.slotMinutes,
      modalities: block.modalities,
      isDemo: true as const,
    })),
  );
  return {
    ...seed,
    credential: `Cédula DEMO-${String(index + 1).padStart(4, '0')} (simulada, no verificable)`,
    schedule,
    isDemo: true as const,
  };
});

export const doctorById = new Map(doctors.map((doctor) => [doctor.id, doctor]));

/** Perfil del directorio vinculado a la sesión mock del rol `medico`. */
export const LINKED_DOCTOR_ID = 'itzel-ejemplo';

export const specialties = [...new Set(doctors.map((doctor) => doctor.specialty))].sort((a, b) => a.localeCompare(b, 'es'));
export const healthTopics = [...new Set(doctors.flatMap((doctor) => doctor.healthTopics))].sort((a, b) =>
  a.localeCompare(b, 'es'),
);

/** Citas de ejemplo para la agenda del perfil médico vinculado (sin datos de pacientes). */
export function getSeedAppointments(): Appointment[] {
  const { today } = getDemoClock();
  const plan: Array<[number, string, CareModality]> = [
    [1, '09:30', 'presencial'],
    [1, '11:00', 'presencial'],
    [1, '16:30', 'en-linea'],
    [2, '10:00', 'presencial'],
    [3, '09:00', 'presencial'],
    [3, '17:00', 'en-linea'],
    [5, '12:00', 'presencial'],
  ];
  return plan.map(([offset, time, modality], index) => {
    const date = addDays(today, offset);
    return {
      id: `cita-ejemplo-${index + 1}`,
      folio: `CITA-EJEMPLO-${String(index + 1).padStart(2, '0')}`,
      doctorId: LINKED_DOCTOR_ID,
      modality,
      date,
      time,
      status: 'confirmada' as const,
      createdAt: cancunLocalToIso(addDays(today, -1), '12:00'),
      origin: 'ejemplo' as const,
      isDemo: true as const,
    };
  });
}
