import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowUpRight, Images, LockKeyhole, MapPin } from 'lucide-react';
import './share.css';

const SHARE_VERSION=1;
const MAX_PAYLOAD=10000;
const titleSafe = value => typeof value==='string' ? value.trim().slice(0,180) : '';
export function validRemoteImage(url){
  if(typeof url!=='string'||url.length>1600) return false;
  try{const parsed=new URL(url);return parsed.protocol==='https:' && !!parsed.hostname}catch{return false}
}
function encodeBase64Url(text){
  const bytes=new TextEncoder().encode(text);
  let output='';for(let i=0;i<bytes.length;i++)output+=String.fromCharCode(bytes[i]);
  return btoa(output).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}
function decodeBase64Url(text){
  const padded=text.replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(padded+'='.repeat((4-padded.length%4)%4));
  return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0)));
}
export function makeShareLink(album){
  const photos=(album.photos||[]).filter(p=>p.mode==='remote'&&validRemoteImage(p.url)).slice(0,8).map(p=>({url:p.url,caption:titleSafe(p.caption)}));
  const page={v:SHARE_VERSION,title:titleSafe(album.title),place:titleSafe(album.place),date:titleSafe(album.date),story:typeof album.story==='string'?album.story.slice(0,2400):'',photos};
  if(!page.title)throw Error('Give this page a title before sharing.');
  const token=encodeBase64Url(JSON.stringify(page));
  if(token.length>MAX_PAYLOAD)throw Error('This share link is too long. Remove some photo URLs or shorten the story.');
  return location.origin+'/share#'+token;
}
export function imageIsShareable(album){return (album.photos||[]).filter(p=>p.mode==='remote'&&validRemoteImage(p.url)).length}
export function parseShareToken(token){
  if(!token||token.length>MAX_PAYLOAD)return null;
  try{
    const x=JSON.parse(decodeBase64Url(token));
    if(x.v!==SHARE_VERSION||!titleSafe(x.title)||typeof x.story!=='string'||!Array.isArray(x.photos))return null;
    return{title:titleSafe(x.title),place:titleSafe(x.place),date:titleSafe(x.date),story:x.story.slice(0,2400),photos:x.photos.slice(0,8).filter(p=>p&&validRemoteImage(p.url)).map(p=>({url:p.url,caption:titleSafe(p.caption)}))};
  }catch{return null}
}
export function SharedPage(){
  const [record,setRecord]=useState(()=>parseShareToken(location.hash.slice(1)));
  useEffect(()=>{const onHash=()=>setRecord(parseShareToken(location.hash.slice(1)));addEventListener('hashchange',onHash);return()=>removeEventListener('hashchange',onHash)},[]);
  return <main className="shared-shell">
   <header className="shared-top"><div className="shared-brand">lifevault <span>· a shared chapter</span></div><span>JUST THIS PAGE</span></header>
   {record?<article className="shared-article">
    <div className="shared-kicker">A LITTLE PART OF SOMEONE'S LIFE</div>
    <h1>{record.title}</h1>
    <div className="shared-meta">{record.place&&<span><MapPin size={15}/>{record.place}</span>}{record.date&&<span>{record.date}</span>}</div>
    {record.photos.length>0&&<div className={'shared-gallery '+(record.photos.length===1?'single':'')}>{record.photos.map((p,i)=><figure key={i}><img src={p.url} alt={p.caption||'Photo '+(i+1)} loading={i===0?'eager':'lazy'} referrerPolicy="no-referrer"/>{p.caption&&<figcaption>{p.caption}</figcaption>}</figure>)}</div>}
    {record.story&&<p className="shared-story">{record.story}</p>}
    <footer className="shared-foot">Shared from LifeVault <span>One page. One story.</span></footer>
   </article>:<div className="shared-unavailable"><LockKeyhole size={28}/><h1>This page isn't available.</h1><p>The link may be incomplete or invalid. Ask the sender for a fresh link.</p></div>}
   <div className="shared-disclaimer">Anyone who has this link can view the information included in it. It is not password protected.</div>
  </main>;
}