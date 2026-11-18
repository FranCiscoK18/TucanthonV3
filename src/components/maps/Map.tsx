import { useEffect, useMemo, useRef } from 'react';
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';
import type { AggregatedCase, CitizenReport, Region, VaccinationBrigade, VectorRecord } from '../../types/models';
export interface SelectedMapFeature { title:string; description:string; kind:string; regionId:string; }
export interface MapFilters { diseaseId:string; classification:string; period:string; regionId:string; }
interface Props { variant?:'epidemiologia'|'brigadas'; regions:Region[]; cases?:AggregatedCase[]; vectors?:VectorRecord[]; reports?:CitizenReport[]; brigades?:VaccinationBrigade[]; filters?:MapFilters; visibility?:Record<string,boolean>; onSelect?:(feature:SelectedMapFeature)=>void; }
const empty:FeatureCollection<Point>={type:'FeatureCollection',features:[]};
const collections=['epidemiologia','entomologia','reportes','brigadas'] as const;
const point=(lng:number,lat:number,properties:Record<string,string|number>)=>({type:'Feature' as const,geometry:{type:'Point' as const,coordinates:[lng,lat]},properties});
export function Map({variant='epidemiologia',regions,cases=[],vectors=[],reports=[],brigades=[],filters,visibility,onSelect}:Props){
 const container=useRef<HTMLDivElement>(null);const instance=useRef<MapLibreMap|null>(null);const callback=useRef(onSelect);callback.current=onSelect;
 const geo=useMemo(()=>{
  const f=filters??{diseaseId:'todas',classification:'todas',period:'2026-11',regionId:'todas'};
  const regionAllowed=(id:string)=>f.regionId==='todas'||id===f.regionId;
  const aggregate=new globalThis.Map<string,number>();
  cases.filter(c=>c.period===f.period&&(f.diseaseId==='todas'||c.diseaseId===f.diseaseId)&&(f.classification==='todas'||c.classification===f.classification)&&regionAllowed(c.regionId)).forEach(c=>aggregate.set(c.regionId,(aggregate.get(c.regionId)??0)+c.count));
  const epi=regions.filter(r=>aggregate.has(r.id)).map(r=>point(r.point.longitude,r.point.latitude,{title:r.name,description:`${aggregate.get(r.id)} registros clínicos inventados · DEMO. Agregados por zona, no son ubicaciones de pacientes.`,kind:'institucional-demo',regionId:r.id,count:aggregate.get(r.id)??0}));
  const vector=vectors.filter(v=>v.period===f.period&&(f.diseaseId==='todas'||f.diseaseId===v.diseaseId)&&regionAllowed(v.regionId)).map(v=>{const r=regions.find(item=>item.id===v.regionId)!;return point(r.point.longitude-.006,r.point.latitude+.004,{title:`Índice vectorial · ${r.name}`,description:`Índice ilustrativo ${v.index}. Sin mediciones reales ni inferencia de riesgo individual.`,kind:'estimado-demo',regionId:r.id,index:v.index});});
  const citizens=reports.filter(r=>regionAllowed(r.regionId)).map((r,i)=>{const zone=regions.find(zone=>zone.id===r.regionId)!;return point(zone.point.longitude+.006+(i%3)*.002,zone.point.latitude-.005+(i%2)*.002,{title:`Reporte ciudadano ${r.id.startsWith('demo')?'de ejemplo':'guardado'} · DEMO`,description:`Categoría ${r.category.replaceAll('-',' ')}. Aviso ciudadano no verificado, nunca es caso confirmado.`,kind:'ciudadano-demo',regionId:r.regionId});});
  const campaigns=brigades.filter(b=>regionAllowed(b.regionId)&&(f.diseaseId==='todas'||f.diseaseId===b.diseaseId)).map(b=>point(b.point.longitude+.003,b.point.latitude+.003,{title:b.name,description:`${b.date}, ${b.start}–${b.end}. Campaña ficticia, no acudir.`,kind:'simulado-demo',regionId:b.regionId}));
  return {epidemiologia:{type:'FeatureCollection',features:epi} as FeatureCollection<Point>,entomologia:{type:'FeatureCollection',features:vector} as FeatureCollection<Point>,reportes:{type:'FeatureCollection',features:citizens} as FeatureCollection<Point>,brigadas:{type:'FeatureCollection',features:campaigns} as FeatureCollection<Point>};
 },[cases,vectors,reports,brigades,regions,filters]);
 const latestGeo=useRef(geo);latestGeo.current=geo;const latestVisibility=useRef(visibility);latestVisibility.current=visibility;
 useEffect(()=>{
  if(!container.current||instance.current)return;
  const map=new maplibregl.Map({container:container.current,center:[-86.855,21.155],zoom:11.15,attributionControl:true,style:{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'osm-base',type:'raster',source:'osm'}]}});
  instance.current=map;map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  map.on('load',()=>{
   collections.forEach(id=>map.addSource(id,{type:'geojson',data:latestGeo.current[id]??empty}));
   map.addLayer({id:'epidemiologia',type:'circle',source:'epidemiologia',paint:{'circle-radius':['interpolate',['linear'],['get','count'],0,10,180,30],'circle-color':'#0f3e17','circle-opacity':.65,'circle-stroke-color':'#ffffff','circle-stroke-width':2}});
   map.addLayer({id:'entomologia',type:'circle',source:'entomologia',paint:{'circle-radius':11,'circle-color':'#a16820','circle-opacity':.9,'circle-stroke-color':'#fffefc','circle-stroke-width':3}});
   map.addLayer({id:'reportes',type:'symbol',source:'reportes',layout:{'text-field':'▲','text-size':25,'text-allow-overlap':true},paint:{'text-color':'#2c6572','text-halo-color':'white','text-halo-width':2}});
   map.addLayer({id:'brigadas',type:'symbol',source:'brigadas',layout:{'text-field':'✚','text-size':29,'text-allow-overlap':true},paint:{'text-color':'#153e75','text-halo-color':'white','text-halo-width':2}});
   for(const id of collections){
    map.on('click',id,e=>{const features=map.queryRenderedFeatures(e.point,{layers:[id]});const p=features[0]?.properties;if(p)callback.current?.({title:String(p.title),description:String(p.description),kind:String(p.kind),regionId:String(p.regionId)});});
    map.on('mouseenter',id,()=>{map.getCanvas().style.cursor='pointer';});map.on('mouseleave',id,()=>{map.getCanvas().style.cursor='';});
   }
   for(const id of collections){map.setLayoutProperty(id,'visibility',variant==='brigadas'?(id==='brigadas'?'visible':'none'):(latestVisibility.current?.[id]===false?'none':'visible'));}
  });
  return()=>{map.remove();instance.current=null;};
 },[variant]);
 useEffect(()=>{const map=instance.current;if(!map||!map.isStyleLoaded())return;for(const id of collections){(map.getSource(id) as GeoJSONSource|undefined)?.setData(geo[id]);map.setLayoutProperty(id,'visibility',variant==='brigadas'?(id==='brigadas'?'visible':'none'):(visibility?.[id]===false?'none':'visible'));}},[geo,visibility,variant]);
 return <div ref={container} role="region" aria-label="Mapa interactivo DEMO de Cancún con ubicaciones agregadas ilustrativas" className="h-[360px] w-full overflow-hidden rounded-[14px] bg-[#e1f4df] sm:h-[460px]"/>;
}