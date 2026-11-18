import { AlertTriangle, CheckCircle2, Database, Info, LoaderCircle, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DataKind } from '../../types/models';
export function PageHeader({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:ReactNode}){
 return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-2xl"><p className="eyebrow mb-2">{eyebrow}</p><h1 className="title-serif text-4xl sm:text-5xl lg:text-6xl">{title}</h1><p className="mt-3 text-sm leading-6 text-charcoal/75 sm:text-base">{description}</p></div>{action&&<div>{action}</div>}</div>;
}
const kinds:Record<DataKind,{label:string;className:string}>={
 'institucional-demo':{label:'Registro institucional ficticio · DEMO',className:'bg-keylime-wash text-forest-ink'},
 'estimado-demo':{label:'Indicador estimado · DEMO',className:'bg-slate-hush text-[#193f53]'},
 'ciudadano-demo':{label:'Reporte ciudadano · DEMO',className:'bg-[#f3e5cc] text-[#69450d]'},
 'simulado-demo':{label:'Dato simulado · DEMO',className:'bg-[#e9e9e9] text-[#333]'},
};
export function DataBadge({kind='simulado-demo',short=false}:{kind?:DataKind;short?:boolean}){const item=kinds[kind];return <span className={`inline-flex max-w-full items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${item.className}`}><Database size={12} aria-hidden="true"/>{short?'DEMO · '+kind.replace('-demo',''):item.label}</span>;}
export function Notice({children,tone='info',title}:{children:ReactNode;tone?:'info'|'warning'|'success';title?:string}){
 const Icon=tone==='warning'?AlertTriangle:tone==='success'?CheckCircle2:Info;
 return <div role="note" className={`flex items-start gap-3 rounded-[14px] p-4 text-sm leading-6 ${tone==='warning'?'bg-[#f6edda] text-[#5c4113]':tone==='success'?'bg-keylime-wash text-forest-ink':'bg-slate-hush/55 text-[#21404b]'}`}><Icon size={19} className="mt-0.5 shrink-0" aria-hidden="true"/><div>{title&&<strong className="mb-1 block">{title}</strong>}{children}</div></div>;
}
export function LoadingState({label='Cargando escenario DEMO…'}:{label?:string}){return <div role="status" className="flex min-h-52 items-center justify-center gap-3 rounded-[14px] bg-keylime-wash p-8 text-forest-ink"><LoaderCircle className="animate-spin" size={20}/>{label}</div>;}
export function ErrorState({error,retry}:{error:string;retry:()=>void}){return <div role="alert" className="rounded-[14px] bg-[#f6edda] p-6"><strong className="block">No se pudieron cargar los datos DEMO</strong><p className="mt-2 text-sm">{error}</p><button className="btn-secondary mt-4" onClick={retry}><RotateCcw size={16}/> Reintentar</button></div>;}
export function EmptyState({title,description,action}:{title:string;description:string;action?:ReactNode}){return <div className="rounded-[14px] bg-keylime-wash px-6 py-12 text-center"><p className="title-serif text-3xl">{title}</p><p className="mx-auto mt-2 max-w-md text-sm text-charcoal/75">{description}</p>{action&&<div className="mt-5">{action}</div>}</div>;}
export function Metric({label,value,detail,tint='light'}:{label:string;value:ReactNode;detail:string;tint?:'light'|'sage'|'slate'}){return <div className={`rounded-[14px] p-5 sm:p-6 ${tint==='sage'?'bg-sage-mist':tint==='slate'?'bg-slate-hush':'bg-keylime-wash'}`}><p className="text-xs font-semibold text-forest-ink/85">{label}</p><p className="title-serif mt-2 text-4xl sm:text-5xl">{value}</p><p className="mt-2 text-xs leading-5 text-charcoal/75">{detail}</p></div>;}
export function Field({label,children}:{label:string;children:ReactNode}){return <label className="block"><span className="label">{label}</span>{children}</label>;}
export function StatusPill({status}:{status:string}){return <span className="pill border border-forest-ink/15 capitalize">{status.replaceAll('-',' ')}</span>;}