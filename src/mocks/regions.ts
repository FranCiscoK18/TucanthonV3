import type { Region } from '../types';

/**
 * Zonas amplias de Cancún (municipio de Benito Juárez) — DEMO.
 * Los polígonos son ILUSTRATIVOS: no son límites oficiales de supermanzanas
 * ni regiones, y no contienen domicilios. Sirven solo para agregar conteos.
 */
const box = (west: number, south: number, east: number, north: number): Region['polygon'] => [
  [west, south],
  [east, south],
  [east, north],
  [west, north],
  [west, south],
];

export const regions: Region[] = [
  {
    id: 'centro',
    name: 'Centro',
    description: 'Zona central y supermanzanas tradicionales (agregado amplio).',
    centroid: [-86.8325, 21.1625],
    polygon: box(-86.85, 21.145, -86.815, 21.18),
    estimatedPopulation: 120000,
    isDemo: true,
  },
  {
    id: 'norte',
    name: 'Norte · Puerto Juárez',
    description: 'Zona norte y franja costera de Puerto Juárez (agregado amplio).',
    centroid: [-86.825, 21.1975],
    polygon: box(-86.85, 21.18, -86.8, 21.215),
    estimatedPopulation: 95000,
    isDemo: true,
  },
  {
    id: 'noroeste',
    name: 'Noroeste',
    description: 'Colonias y fraccionamientos del noroeste (agregado amplio).',
    centroid: [-86.875, 21.185],
    polygon: box(-86.9, 21.165, -86.85, 21.205),
    estimatedPopulation: 160000,
    isDemo: true,
  },
  {
    id: 'poniente',
    name: 'Poniente',
    description: 'Regiones del poniente de la ciudad (agregado amplio).',
    centroid: [-86.875, 21.145],
    polygon: box(-86.9, 21.125, -86.85, 21.165),
    estimatedPopulation: 150000,
    isDemo: true,
  },
  {
    id: 'sureste',
    name: 'Sureste',
    description: 'Zona sureste, entre el centro y la laguna (agregado amplio).',
    centroid: [-86.8275, 21.125],
    polygon: box(-86.85, 21.105, -86.805, 21.145),
    estimatedPopulation: 110000,
    isDemo: true,
  },
  {
    id: 'sur',
    name: 'Sur',
    description: 'Zona sur y desarrollos habitacionales recientes (agregado amplio).',
    centroid: [-86.85, 21.085],
    polygon: box(-86.88, 21.065, -86.82, 21.105),
    estimatedPopulation: 140000,
    isDemo: true,
  },
  {
    id: 'hotelera',
    name: 'Zona Hotelera',
    description: 'Franja turística entre laguna y mar (población residente estimada).',
    centroid: [-86.7655, 21.1],
    polygon: [
      [-86.792, 21.142],
      [-86.772, 21.146],
      [-86.749, 21.095],
      [-86.759, 21.04],
      [-86.776, 21.04],
      [-86.767, 21.092],
      [-86.789, 21.132],
      [-86.792, 21.142],
    ],
    estimatedPopulation: 25000,
    isDemo: true,
  },
];

export const regionById = (id: string): Region | undefined => regions.find((r) => r.id === id);
export const regionName = (id: string): string => regionById(id)?.name ?? 'Zona no definida';
