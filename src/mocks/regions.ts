/**
 * Zonas amplias de Cancún (DEMO). Los polígonos son simplificaciones ilustrativas
 * dibujadas a mano: no son límites oficiales de regiones, supermanzanas ni colonias.
 * La población es una estimación DEMO, no un dato censal.
 */
import type { Region } from '../types';

export const regions: Region[] = [
  {
    id: 'centro',
    name: 'Centro',
    shortName: 'Centro',
    description: 'Centro tradicional y supermanzanas cercanas a la avenida Tulum (aproximado).',
    populationEstimate: 110_000,
    polygon: [
      [-86.846, 21.172],
      [-86.818, 21.172],
      [-86.812, 21.16],
      [-86.814, 21.146],
      [-86.826, 21.139],
      [-86.846, 21.141],
      [-86.846, 21.172],
    ],
    anchor: [-86.832, 21.162],
    activityAnchor: [-86.826, 21.146],
    isDemo: true,
  },
  {
    id: 'norte',
    name: 'Norte · Puerto Juárez',
    shortName: 'Norte',
    description: 'Franja norte hacia Puerto Juárez y la costa de Isla Mujeres (aproximado).',
    populationEstimate: 85_000,
    polygon: [
      [-86.846, 21.172],
      [-86.846, 21.212],
      [-86.812, 21.22],
      [-86.803, 21.205],
      [-86.807, 21.186],
      [-86.818, 21.172],
      [-86.846, 21.172],
    ],
    anchor: [-86.828, 21.204],
    activityAnchor: [-86.822, 21.183],
    isDemo: true,
  },
  {
    id: 'noroeste',
    name: 'Noroeste',
    shortName: 'Noroeste',
    description: 'Fraccionamientos del noroeste, hacia la salida a Mérida (aproximado).',
    populationEstimate: 160_000,
    polygon: [
      [-86.9, 21.17],
      [-86.905, 21.195],
      [-86.88, 21.215],
      [-86.846, 21.212],
      [-86.846, 21.172],
      [-86.9, 21.17],
    ],
    anchor: [-86.876, 21.2],
    activityAnchor: [-86.87, 21.18],
    isDemo: true,
  },
  {
    id: 'poniente',
    name: 'Poniente',
    shortName: 'Poniente',
    description: 'Regiones del poniente, alrededor de la avenida López Portillo (aproximado).',
    populationEstimate: 180_000,
    polygon: [
      [-86.905, 21.14],
      [-86.91, 21.155],
      [-86.9, 21.17],
      [-86.846, 21.172],
      [-86.846, 21.141],
      [-86.905, 21.14],
    ],
    anchor: [-86.88, 21.163],
    activityAnchor: [-86.868, 21.148],
    isDemo: true,
  },
  {
    id: 'sur',
    name: 'Sur · Huayacán',
    shortName: 'Sur',
    description: 'Fraccionamientos del sur, alrededor de la avenida Huayacán (aproximado).',
    populationEstimate: 190_000,
    polygon: [
      [-86.905, 21.14],
      [-86.846, 21.141],
      [-86.826, 21.139],
      [-86.828, 21.112],
      [-86.845, 21.095],
      [-86.89, 21.1],
      [-86.9, 21.118],
      [-86.905, 21.14],
    ],
    anchor: [-86.868, 21.13],
    activityAnchor: [-86.856, 21.11],
    isDemo: true,
  },
  {
    id: 'bonfil',
    name: 'Sur poniente · Bonfil',
    shortName: 'Bonfil',
    description: 'Alfredo V. Bonfil y alrededores, rumbo al aeropuerto (aproximado).',
    populationEstimate: 70_000,
    polygon: [
      [-86.89, 21.1],
      [-86.845, 21.095],
      [-86.828, 21.075],
      [-86.85, 21.06],
      [-86.885, 21.068],
      [-86.89, 21.1],
    ],
    anchor: [-86.866, 21.09],
    activityAnchor: [-86.852, 21.074],
    isDemo: true,
  },
  {
    id: 'zona-hotelera',
    name: 'Zona Hotelera',
    shortName: 'Z. Hotelera',
    description: 'Franja turística entre la laguna Nichupté y el mar Caribe (aproximado).',
    populationEstimate: 15_000,
    polygon: [
      [-86.8, 21.1455],
      [-86.775, 21.1425],
      [-86.755, 21.14],
      [-86.742, 21.138],
      [-86.738, 21.134],
      [-86.742, 21.12],
      [-86.748, 21.1],
      [-86.757, 21.08],
      [-86.765, 21.06],
      [-86.772, 21.045],
      [-86.776, 21.033],
      [-86.782, 21.03],
      [-86.786, 21.04],
      [-86.778, 21.06],
      [-86.77, 21.08],
      [-86.761, 21.1],
      [-86.754, 21.12],
      [-86.752, 21.13],
      [-86.77, 21.137],
      [-86.8, 21.14],
      [-86.8, 21.1455],
    ],
    anchor: [-86.751, 21.112],
    activityAnchor: [-86.767, 21.07],
    isDemo: true,
  },
];

export const regionById = new Map(regions.map((region) => [region.id, region]));

export function regionName(id: string): string {
  return regionById.get(id)?.name ?? 'Zona no identificada';
}

/** Población total estimada (DEMO) de las zonas. */
export const totalPopulationEstimate = regions.reduce((sum, region) => sum + region.populationEstimate, 0);
