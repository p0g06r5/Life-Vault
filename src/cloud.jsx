import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import AuthPage from './AuthPage.jsx';
import './cloud.css';
const Context=createContext(null);
const API='/api/v1';
const request=async(path,options={})=>{
 const response=await fetch(API+path,{...options,credentials:'same-origin',cache:'no-store'});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw Object.assign(new Error(data.error||'The server could not complete your request.'),{status:response.status,code:data.code});
 return data;
};
export function useAccount(){const ctx=useContext(Context);if(!ctx)throw Error('Account is not available');return ctx}
export function useCloudDoc(kind){
 const context=useAccount();
 const initial=context.documents[kind];
 const [value,setValue]=useState(()=>{
  if(kind!=='collections')return initial.body;
  // Device-only photo bytes are never sent to D1 and are scoped to this account.
  let photos={};try{photos=JSON.parse(localStorage.getItem('lifevault-device-photos-'+context.user.id)||'{}')||{}}catch{}
  return Array.isArray(initial.body)?initial.body.map(album=>({...album,photos:[...(album.photos||[]),...((photos[album.id]||[]).filter(p=>p.mode==='local'))]})):initial.body;
 });
 const [status,setStatus]=useState('');
 const first=useRef(true),savedVersion=useRef(initial.version),pending=useRef(Promise.resolve());
 useEffect(()=>{
  if(first.current){first.current=false;return}
  const timer=setTimeout(()=>{
   let captured=value;
   if(kind==='collections'){
    const devicePhotos={};
    for(const album of value){const local=(album.photos||[]).filter(p=>p.mode==='local');if(local.length)devicePhotos[album.id]=local;}
    try{localStorage.setItem('lifevault-device-photos-'+context.user.id,JSON.stringify(devicePhotos))}catch{setStatus('Device photo storage is full. Add fewer photos.')}
    captured=value.map(album=>({...album,photos:(album.photos||[]).filter(p=>p.mode==='remote')}));
   }
   setStatus('Saving…');
   pending.current=pending.current.catch(()=>{}).then(async()=>{
    const result=await request('/documents/'+kind,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({body:captured,version:savedVersion.current})});
    savedVersion.current=result.version;setStatus('Saved securely');
   }).catch(err=>{
    setStatus(err.status===409?'Changes from another device detected. Refresh to resolve.':err.message);
    if(err.status===401)window.location.replace('/login');
   });
  },650);
  return()=>clearTimeout(timer)
 },[value,kind]);
 return [value,setValue,status];
}
export default function CloudWorkspace({children}){
 const [state,setState]=useState({loading:true,user:null,documents:null,error:''});
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{
  let active=true;
  (async()=>{
   try{
    const session=await request('/auth/me');
    if(!active)return;
    const data=await request('/documents');
    if(active)setState({loading:false,user:session.user,documents:data.documents,error:''});
   }catch(e){
    if(active)setState({loading:false,user:null,documents:null,error:e.status===401?'':e.message});
   }
  })();
  return()=>{active=false}
 },[refresh]);
 if(state.loading)return <div className="cloud-wait" role="status"><span className="cloud-spinner"/>Opening your LifeVault…</div>;
 if(!state.user||!state.documents){
  if(location.pathname!=='/login'&&location.pathname!=='/register')history.replaceState({},'', '/login');
  return <AuthPage serverError={state.error} onAuthenticated={()=>setRefresh(v=>v+1)}/>;
 }
 if(['/login','/register'].includes(location.pathname))history.replaceState({},'','/');
 return <Context.Provider value={{...state,reload:()=>setRefresh(v=>v+1)}}>{children}</Context.Provider>;
}
