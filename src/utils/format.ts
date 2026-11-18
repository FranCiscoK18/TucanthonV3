export const money = (value:number) => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(value);
export const shortDate = (value:string) => {
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'});
};
export const monthLabel = (value:string) => new Date(`${value}-15T12:00:00`).toLocaleDateString('es-MX',{month:'short',year:'numeric'});
export const todayISO = (offset=0) => { const date=new Date(); date.setDate(date.getDate()+offset); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; };
export const uid = (prefix:string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;