import { useId } from 'react';
import { monthLabel } from '../../utils/format';
export function TrendChart({points,label='Registros ilustrativos'}:{points:{period:string;value:number}[];label?:string}){
 const uid=useId().replace(/:/g,'');if(!points.length)return <p>No hay datos DEMO para graficar.</p>;
 const max=Math.max(5,...points.map(x=>x.value));const width=700,height=240,padding=45;
 const coords=points.map((p,i)=>({x:padding+(width-2*padding)*(points.length===1?.5:i/(points.length-1)),y:height-padding-(p.value/max)*(height-2*padding)}));
 const path=coords.map((c,i)=>`${i?'L':'M'}${c.x},${c.y}`).join(' ');
 return <div className="w-full"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${uid}-title ${uid}-desc`} className="w-full overflow-visible"><title id={`${uid}-title`}>Tendencia de {label} · DEMO</title><desc id={`${uid}-desc`}>{points.map(p=>`${monthLabel(p.period)}: ${p.value}`).join('; ')}. Serie inventada.</desc>
 {[0,.5,1].map(f=><g key={f}><line x1={padding} y1={height-padding-f*(height-2*padding)} x2={width-padding} y2={height-padding-f*(height-2*padding)} stroke="#c2d3c4" strokeDasharray="4 5"/><text x={padding-10} y={height-padding-f*(height-2*padding)+5} textAnchor="end" fill="#395541" fontSize="12">{Math.round(f*max)}</text></g>)}
 <path d={path} fill="none" stroke="#0f3e17" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>{coords.map((c,i)=><g key={i}><circle cx={c.x} cy={c.y} r="5" fill="#fffefc" stroke="#0f3e17" strokeWidth="3"/><text x={c.x} y={height-12} textAnchor="middle" fill="#395541" fontSize="12">{monthLabel(points[i].period).split(' ')[0]}</text></g>)}
 </svg><p className="mt-1 text-center text-xs text-charcoal/70">Eje vertical: registros ficticios (conteo) · Eje horizontal: meses de 2026 · DEMO</p></div>;
}