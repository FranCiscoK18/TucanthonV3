import { useCallback, useEffect, useState } from 'react';
export function useDemoData<T>(fetcher:()=>Promise<T>){
 const [data,setData]=useState<T|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);const [iteration,setIteration]=useState(0);
 useEffect(()=>{let active=true;setLoading(true);setError(null);fetcher().then(value=>{if(active)setData(value);}).catch((e:unknown)=>{if(active)setError(e instanceof Error?e.message:'Error al recuperar los datos DEMO');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[fetcher,iteration]);
 const retry=useCallback(()=>setIteration(i=>i+1),[]);return {data,loading,error,retry};
}