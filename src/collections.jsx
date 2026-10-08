import React,{useEffect,useState} from 'react';
import {Plus,ArrowLeft,ArrowRight,ArrowUpRight,MapPin,Images,Share2,Trash2,Pencil,Link2,Upload,Check,Copy,Eye,ShieldAlert,Image as ImageIcon,LockKeyhole,Sparkles} from 'lucide-react';
import {makeShareLink,validRemoteImage,imageIsShareable} from './share.jsx';
import './collections.css';
import AiSuggest from './ai.jsx';
import {useCloudDoc} from './cloud.jsx';
import CollectionEditor from './CollectionEditor.jsx';
import {formatCollectionDate} from './collection-date.js';
const KEY='lifevault-collections-v1';
const fresh=()=>({title:'',place:'',date:'',story:'',photos:[]});
function getInitial(){
 try{const x=JSON.parse(localStorage.getItem(KEY));return Array.isArray(x)?x.filter(y=>y&&typeof y.title==='string').slice(0,100):[]}catch{return []}
}
function fileToSmallData(file){
 return new Promise((resolve,reject)=>{
  if(!['image/jpeg','image/png','image/webp','image/heic','image/heif'].includes(file.type))return reject(new Error('Choose an image file.'));
  if(file.size>10*1024*1024)return reject(new Error('Choose an image smaller than 10 MB.'));
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error('Could not read this file.'));
  reader.onload=()=>{
   const img=new window.Image();
   img.onerror=()=>reject(new Error('Could not open this image.'));
   img.onload=()=>{
    const scale=Math.min(1,900/Math.max(img.width,img.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
    const ctx=canvas.getContext('2d');if(!ctx)return reject(new Error('Your browser cannot process this image.'));
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    resolve(canvas.toDataURL('image/jpeg',.58));
   };
   img.src=reader.result;
  };
  reader.readAsDataURL(file);
 });
}
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2);
export default function Collections({path,go,preview=false}){
 const [albums,setAlbums,syncStatus]=useCloudDoc('collections');
 const [edit,setEdit]=useState(null),[draft,setDraft]=useState(fresh),[showEditor,setShowEditor]=useState(false),[notice,setNotice]=useState(''),[copied,setCopied]=useState(false);
 
 const [smartQuery,setSmartQuery]=useState('');

 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),4500);return()=>clearTimeout(t)},[notice]);
 const detailId=path.startsWith('/collections/')?decodeURIComponent(path.slice('/collections/'.length)):null;
 const active=albums.find(x=>x.id===detailId);
 const start=()=>{setEdit(null);setDraft(fresh());setShowEditor(true)};
 const startEdit=album=>{setEdit(album.id);setDraft({...album,photos:[...(album.photos||[])]});setShowEditor(true)};
 const save=()=>{if(!draft.title.trim())return;
  const album={...draft,title:draft.title.trim().slice(0,180),id:edit||uid(),updatedAt:new Date().toISOString(),photos:(draft.photos||[]).slice(0,12)};
  setAlbums(x=>edit?x.map(y=>y.id===edit?album:y):[album,...x]);setShowEditor(false);setNotice(edit?'Collection updated.':'Your collection is ready.');go('/collections/'+encodeURIComponent(album.id));
 };
 const addLocal=async files=>{
  const capacity=Math.max(0,12-draft.photos.length);
  const chosen=[...files].slice(0,capacity);
  if(!chosen.length){setNotice('This collection already has 12 images.');return}
  const images=[];
  for(const file of chosen){try{const url=await fileToSmallData(file);images.push({id:uid(),url,mode:'local',caption:''})}catch(error){setNotice(error.message)}}
  setDraft(x=>({...x,photos:[...x.photos,...images].slice(0,12)}));
 };
 const removePhoto=id=>setDraft(x=>({...x,photos:x.photos.filter(p=>p.id!==id)}));
 const removeAlbum=album=>{if(!window.confirm('Delete this collection and its local photos? This cannot be undone.'))return;setAlbums(a=>a.filter(x=>x.id!==album.id));go('/collections')};
 const share=async album=>{
  try{
   const url=makeShareLink(album);
   if(navigator.share){
    try{await navigator.share({title:album.title,text:'Take a look at this LifeVault page',url});setNotice('Shared only this collection snapshot.');return}
    catch(error){if(error.name==='AbortError')return}
   }
   await navigator.clipboard.writeText(url);
   setCopied(true);setNotice('Link copied. It contains just this collection snapshot.');setTimeout(()=>setCopied(false),2500);
  }catch(error){setNotice(error.message||'Unable to share. Try the friend-view preview and copy the URL.')}
 };
 const previewShare=album=>{try{const link=makeShareLink(album);window.open(link,'_blank','noopener,noreferrer')}catch(error){setNotice(error.message)}};
 const usable=album=>imageIsShareable(album);
 return <div className="collect-root">
 {path==='/collections'&&<>
  <div className="collect-hero"><span className="collect-eyebrow">PAGES YOU CAN SHARE ONE AT A TIME</span><h1>Your life, in collections.</h1><p>A trip to Georgia. A family celebration. A favorite place. Create a beautiful, separate page for anything you want to remember—and choose which page to send.</p>{!preview&&<button className="primary" onClick={start}><Plus size={17}/> Make a collection</button>}</div>
  <div className="collect-subheading"><span>YOUR COLLECTIONS</span><strong>{albums.length} {albums.length===1?'page':'pages'}</strong></div>
  {albums.length?<div className="collection-grid">{albums.map(album=><button key={album.id} className="collection-cover" onClick={()=>go('/collections/'+encodeURIComponent(album.id))}><div className="collection-thumb">{album.photos?.length?<img src={album.photos[0].url} alt=""/>:<span className="collection-illustration"><MapPin size={32} strokeWidth={1.2}/></span>}<span className="collection-count"><Images size={13}/> {album.photos?.length||0}</span></div><div className="collection-summary"><small>{album.place||'PERSONAL COLLECTION'}</small><strong>{album.title}</strong><span>{album.story||'Open this collection to see the whole page.'}</span><div>Open this page <ArrowUpRight size={17}/></div></div></button>)}</div>:<div className="collection-empty"><span className="collection-empty-icon"><Images size={32} strokeWidth={1.3}/></span><h2>Where have you been lately?</h2><p>Start with Georgia, a weekend trip, or something you want to share with a friend.</p>{!preview&&<button className="primary" onClick={start}><Plus size={16}/> Create your first page</button>}</div>}
 </>}
 {detailId&&active&&<>
 <button className="collect-back" onClick={()=>go('/collections')}><ArrowLeft size={17}/> All collections</button>
 <article className="album-page"><header className="album-top"><span>MY PERSONAL COLLECTION</span><span>{formatCollectionDate(active.date)||'A PAGE FROM MY LIFE'}</span></header><h1>{active.title}</h1><div className="album-info">{active.place&&<span><MapPin size={16}/>{active.place}</span>}<span>{active.photos?.length||0} photos</span></div>
 {active.photos?.length>0?<div className={'album-gallery '+(active.photos.length===1?'alone':'')}>{active.photos.map((photo,i)=><figure key={photo.id||i}><img src={photo.url} alt={photo.caption||'Collection photo '+(i+1)}/>{photo.caption&&<figcaption>{photo.caption}</figcaption>}</figure>)}</div>:<div className="album-empty-photo"><Images size={32}/><span>Photos and memories can live together here.</span></div>}
 {active.story&&<p className="album-story">{active.story}</p>}
 </article>
 <section className="album-sharing"><div><span>SHARE ONLY THIS PAGE</span><h2>Send this chapter, not your whole LifeVault.</h2><p>Your shared link contains only the selected collection's text and any existing externally hosted photos. Your other memories, profile, and vault stay private.</p>{active.photos?.some(p=>p.mode==='local')&&<p className="album-caution"><ShieldAlert size={16}/> Photos you upload from your device are private to this browser and are not included in shared links yet. Your shared link will include the text, but not these device photos.</p>}</div><div className="album-actions"><button className="primary" onClick={()=>share(active)}><Share2 size={17}/>{copied?'Copied':'Share this page'}</button><button className="collect-outline" onClick={()=>previewShare(active)}><Eye size={17}/> See friend's view</button>{!preview&&<button className="collect-outline" onClick={()=>startEdit(active)}><Pencil size={16}/> Edit collection</button>}{!preview&&<button className="collect-danger" onClick={()=>removeAlbum(active)}><Trash2 size={16}/> Delete</button>}</div></section>
 <div className="share-facts"><LockKeyhole size={17}/><span>Anyone with the link can open this snapshot. It is not a secret, authenticated, revocable, or password-protected share. If you edit this collection later, previously copied links will not update.</span></div>
 </>}
 {detailId&&!active&&<div className="collection-empty"><h2>This collection isn't available.</h2><p>It may have been removed or isn't part of this account.</p><button className="collect-outline" onClick={()=>go('/collections')}>Back to collections</button></div>}
 {showEditor&&<CollectionEditor draft={draft} setDraft={setDraft} edit={edit} onClose={()=>setShowEditor(false)} onSave={save} addLocal={addLocal} removePhoto={removePhoto} notice={notice}/>}
 {syncStatus&&<div className="cloud-save-status" role="status">{syncStatus}</div>}
 {notice&&<div className="collection-toast" role="status">{notice}</div>}
 </div>;
}