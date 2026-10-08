import React,{useEffect,useRef,useState} from 'react';
import {LogIn,LogOut,UserRound,Camera} from 'lucide-react';
import {portraitData} from './portrait.js';
import './auth-badge.css';
export default function AuthBadge({onProfile}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[updating,setUpdating]=useState(false),[error,setError]=useState('');
 const input=useRef(null);
 useEffect(()=>{let live=true;fetch('/api/v1/auth/me',{credentials:'same-origin',cache:'no-store'}).then(async r=>r.ok?(await r.json()).user:null).then(v=>{if(live)setUser(v)}).catch(()=>{}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[]);
 async function upload(file){
  if(!file)return;setUpdating(true);setError('');
  try{
   const avatar=await portraitData(file);
   const r=await fetch('/api/v1/auth/avatar',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({avatar})});
   const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||'Unable to update your photo.');
   setUser(data.user);
   window.dispatchEvent(new CustomEvent('lifevault:avatar',{detail:data.user}));
  }catch(err){setError(err.message)}finally{setUpdating(false)}
 }
 async function signOut(){
  try{const r=await fetch('/api/v1/auth/logout',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error('Sign out failed.');window.location.assign('/login')}catch{setError('Could not sign out. Please try again.')}
 }
 return <div className="lv-account-badge">{loading?<small>Opening account…</small>:user?<><div className="lv-account-user"><button type="button" className="lv-account-photo" onClick={()=>input.current?.click()} title="Change profile picture">{user.avatar?<img src={user.avatar} alt="Your profile"/>:<UserRound size={20}/>}<Camera size={12} className="lv-account-photo-edit"/></button><span><strong>{user.name}</strong><small>My profile · Private account</small></span></div><input ref={input} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={e=>{upload(e.target.files?.[0]);e.target.value=''}}/><div className="lv-account-operations"><button type="button" disabled={updating} onClick={()=>input.current?.click()}><Camera size={14}/>{updating?'Saving photo…':'Edit photo'}</button><button type="button" onClick={signOut}><LogOut size={15}/> Sign out</button></div>{error&&<small role="alert" className="lv-account-error">{error}</small>}</>:<a href="/login"><LogIn size={16}/> Sign in / Create account</a>}</div>;

}
