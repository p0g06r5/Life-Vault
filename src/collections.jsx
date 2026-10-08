import React,{useEffect,useState} from 'react';
import {Plus,ArrowLeft,ArrowRight,ArrowUpRight,MapPin,Images,Share2,Trash2,Pencil,Link2,Upload,Check,Copy,Eye,ShieldAlert,Image as ImageIcon,LockKeyhole,Sparkles} from 'lucide-react';
import {makeShareLink,validRemoteImage,imageIsShareable} from './share.jsx';
import './collections.css';
import AiSuggest from './ai.jsx';
import {useCloudDoc} from './cloud.jsx';
const KEY='lifevault-collections-v1';
const fresh=()=>({title:'',place:'',date:'',story:'',photos:[]});
function getInitial(){
 try{const x=JSON.parse(localStorage.getItem(KEY));return Array.isArray(x)?x.filter(y=>y&&typeof y.title==='string').slice(0,100):[]}catch{return []}
}
function fileToSmallData(file){
 return new Promise((resolve,reject)=>{
  if(!file.type.startsWith('image/'))return reject(new Error('Choose an image file.'));
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
 const [edit,setEdit]=useState(null),[draft,setDraft]=useState(fresh),[showEditor,setShowEditor]=useState(false),[newUrl,setNewUrl]=useState(''),[notice,setNotice]=useState(''),[copied,setCopied]=useState(false);
 
 const [smartQuery,setSmartQuery]=useState('');

 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),4500);return()=>clearTimeout(t)},[notice]);
 const detailId=path.startsWith('/collections/')?decodeURIComponent(path.slice('/collections/'.length)):null;
 const active=albums.find(x=>x.id===detailId);
 const start=()=>{setEdit(null);setDraft(fresh());setShowEditor(true);setNewUrl('')};
 const startEdit=album=>{setEdit(album.id);setDraft({...album,photos:[...(album.photos||[])]});setShowEditor(true);setNewUrl('')};
 const save=e=>{
  e.preventDefault();if(!draft.title.trim())return;
  const album={...draft,title:draft.title.trim().slice(0,180),id:edit||uid(),updatedAt:new Date().toISOString(),photos:(draft.photos||[]).slice(0,12)};
  setAlbums(x=>edit?x.map(y=>y.id===edit?album:y):[album,...x]);setShowEditor(false);setNotice(edit?'Collection updated.':'Your collection is ready.');go('/collections/'+encodeURIComponent(album.id));
 };
 const addRemote=()=>{const url=newUrl.trim();if(!validRemoteImage(url)){setNotice('Paste a valid public HTTPS image URL.');return}setDraft(x=>({...x,photos:[...x.photos,{id:uid(),url,mode:'remote',caption:''}].slice(0,12)}));setNewUrl('')};
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
 <article className="album-page"><header className="album-top"><span>MY PERSONAL COLLECTION</span><span>{active.date||'A PAGE FROM MY LIFE'}</span></header><h1>{active.title}</h1><div className="album-info">{active.place&&<span><MapPin size={16}/>{active.place}</span>}<span>{active.photos?.length||0} photos</span></div>
 {active.photos?.length>0?<div className={'album-gallery '+(active.photos.length===1?'alone':'')}>{active.photos.map((photo,i)=><figure key={photo.id||i}><img src={photo.url} alt={photo.caption||'Collection photo '+(i+1)}/>{photo.caption&&<figcaption>{photo.caption}</figcaption>}</figure>)}</div>:<div className="album-empty-photo"><Images size={32}/><span>Photos and memories can live together here.</span></div>}
 {active.story&&<p className="album-story">{active.story}</p>}
 </article>
 <section className="album-sharing"><div><span>SHARE ONLY THIS PAGE</span><h2>Send this chapter, not your whole LifeVault.</h2><p>The generated link contains a snapshot of this page's text and public photo URLs. It does not show your other collections, profile, or vault.</p>{active.photos?.some(p=>p.mode==='local')&&<p className="album-caution"><ShieldAlert size={16}/> Photos added from your device stay in this browser and will NOT appear in the shared link. Use publicly hosted HTTPS photo URLs for shareable images until cloud uploads are implemented.</p>}</div><div className="album-actions"><button className="primary" onClick={()=>share(active)}><Share2 size={17}/>{copied?'Copied':'Share this page'}</button><button className="collect-outline" onClick={()=>previewShare(active)}><Eye size={17}/> See friend's view</button>{!preview&&<button className="collect-outline" onClick={()=>startEdit(active)}><Pencil size={16}/> Edit collection</button>}{!preview&&<button className="collect-danger" onClick={()=>removeAlbum(active)}><Trash2 size={16}/> Delete</button>}</div></section>
 <div className="share-facts"><LockKeyhole size={17}/><span>Anyone with the link can open this snapshot. It is not a secret, authenticated, revocable, or password-protected share. If you edit this collection later, previously copied links will not update.</span></div>
 </>}
 {detailId&&!active&&<div className="collection-empty"><h2>This collection isn't on this device.</h2><p>Collections are currently stored in the browser where they were created.</p><button className="collect-outline" onClick={()=>go('/collections')}>Back to collections</button></div>}
 {showEditor&&<div className="collection-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowEditor(false)}}><form className="collection-modal" role="dialog" aria-modal="true" aria-label="Collection editor" onSubmit={save}><button type="button" className="collection-modal-close" onClick={()=>setShowEditor(false)} aria-label="Close">×</button><div className="collect-eyebrow">MAKE A PAGE OF YOUR OWN</div><h2>{edit?'Edit this collection':'Give this moment its own page.'}</h2><p>Only what you put on this page is included when you create a share link.</p>
 <label>Page title *</label><input required maxLength={180} placeholder="e.g. My trip to Georgia" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/>
 <div className="collect-form-cols"><div><label>Place</label><input value={draft.place||''} maxLength={180} placeholder="Georgia, USA" onChange={e=>setDraft({...draft,place:e.target.value})}/></div><div><label>When</label><input type="date" value={draft.date||''} onChange={e=>setDraft({...draft,date:e.target.value})}/></div></div>
 <label>Your story</label><textarea rows={4} maxLength={2400} value={draft.story||''} placeholder="What happened? What made it special?" onChange={e=>setDraft({...draft,story:e.target.value})}/>
 <AiSuggest purpose="story" text={[draft.title,draft.place,draft.date,draft.story].filter(Boolean).join('\n')} label="Suggest a better story" onApply={value=>setDraft(x=>({...x,story:value.slice(0,2400)}))}/>
 <AiSuggest purpose="title" text={[draft.title,draft.place,draft.date,draft.story].filter(Boolean).join('\n')} label="Suggest a title" onApply={value=>setDraft(x=>({...x,title:value.slice(0,180)}))}/>
 <AiSuggest purpose="chapters" text={[draft.title,draft.place,draft.date,draft.story,...draft.photos.map(p=>p.caption).filter(Boolean)].filter(Boolean).join('\n')} label="Suggest story chapters" onApply={value=>setDraft(x=>({...x,story:[x.story,value].filter(Boolean).join('\n\n').slice(0,2400)}))}/>
 <div className="collect-photo-header"><label>Photos (up to 12)</label><small>{draft.photos.length}/12</small></div>
 <div className="collect-photo-actions"><label className="photo-pick"><Upload size={17}/> Add from device<input hidden type="file" accept="image/*" multiple onChange={e=>{addLocal(e.target.files||[]);e.target.value=''}}/></label><span>Device photos remain on this browser; only their collection text and public image URLs sync across devices.</span></div>
 <div className="collect-url-row"><input placeholder="https://example.com/your-photo.jpg" type="url" value={newUrl} onChange={e=>setNewUrl(e.target.value)} aria-label="Public photo URL"/><button type="button" className="collect-outline" onClick={addRemote}><Link2 size={16}/> Add image URL</button></div>
 <p className="collect-photo-note">Only publicly available HTTPS image URLs can travel in a share link. Cloud uploads aren't connected yet.</p>
 {draft.photos.length>0&&<div className="collect-editor-gallery">{draft.photos.map(photo=><div key={photo.id} className="collect-editor-photo"><img src={photo.url} alt=""/><button type="button" onClick={()=>removePhoto(photo.id)} aria-label="Remove photo">×</button><span>{photo.mode==='local'?'Device only':'Shareable URL'}</span><input placeholder="Optional caption" maxLength={180} value={photo.caption||''} onChange={e=>setDraft({...draft,photos:draft.photos.map(p=>p.id===photo.id?{...p,caption:e.target.value}:p)})}/></div>)}</div>}
 <button type="submit" className="primary collection-save"><Check size={16}/> {edit?'Save changes':'Create collection'}</button></form></div>}
 {syncStatus&&<div className="cloud-save-status" role="status">{syncStatus}</div>}
 {notice&&<div className="collection-toast" role="status">{notice}</div>}
 </div>;
}