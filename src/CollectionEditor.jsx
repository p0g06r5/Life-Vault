import React,{useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,CalendarDays,Check,Images,MapPin,Plus,Sparkles,UploadCloud,GripVertical,Trash2,ShieldCheck} from 'lucide-react';
import AiSuggest from './ai.jsx';
import {arrangePhotos} from './photo-arrange.js';
import {formatCollectionDate} from './collection-date.js';
import './collection-editor.css';
const pad=n=>String(n).padStart(2,'0');
function normalizeDate(v=''){return {month:String(v).slice(0,7),day:/^\d{4}-\d{2}-\d{2}$/.test(v)?v:''}}
export default function CollectionEditor({draft,setDraft,edit,onClose,onSave,addLocal,removePhoto,notice}){
 const [step,setStep]=useState(0),[dragging,setDragging]=useState(false),[busy,setBusy]=useState(false),[mixBusy,setMixBusy]=useState(false),[aiBusy,setAiBusy]=useState(false),[aiError,setAiError]=useState(''),[exactDate,setExactDate]=useState(Boolean(normalizeDate(draft.date).day)),[moving,setMoving]=useState(null);
 const picker=useRef(null);
 const title=draft.title?.trim()||'Untitled collection';
 const set=(key,value)=>setDraft(x=>({...x,[key]:value}));
 async function add(files){
  if(!files?.length)return;setBusy(true);
  try{await addLocal(files)}finally{setBusy(false);setDragging(false)}
 }
 const dateInfo=normalizeDate(draft.date);
 function changeMonth(v){set('date',exactDate&&dateInfo.day?.startsWith(v)?dateInfo.day:v)}
 function changeDay(v){set('date',v)}
 async function arrange(){
  if(mixBusy||draft.photos.length<3)return;
  setMixBusy(true);
  try{
   const arranged=await arrangePhotos(draft.photos);
   setDraft(d=>({...d,photos:arranged}));
  }catch{setAiError('Could not analyze these images in this browser. You can still drag them manually.')}
  finally{setMixBusy(false)}
 }
 function dragPhoto(source,target){
  if(source===null||source===target)return;
  setDraft(x=>{const a=[...x.photos],from=a.findIndex(p=>p.id===source),to=a.findIndex(p=>p.id===target);if(from<0||to<0)return x;const [item]=a.splice(from,1);a.splice(to,0,item);return {...x,photos:a}});
  setMoving(null);
 }
 async function aiArrange(){
  if(aiBusy||draft.photos.length<2)return;
  setAiBusy(true);setAiError('');
  try{
   const photos=draft.photos;
   const text='Photo IDs and user-provided captions (no actual images):\n'+photos.map(p=>p.id+': '+(p.caption?.trim()||'No caption')).join('\n');
   const response=await fetch('/api/assist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({purpose:'photo_order',text})});
   const payload=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(payload.error||'AI arrangement is unavailable.');
   const ids=String(payload.suggestion||'').split(/[\s,\n]+/).map(v=>v.trim()).filter(Boolean);
   const existing=new Set(photos.map(p=>p.id));
   if(ids.length!==photos.length||new Set(ids).size!==photos.length||ids.some(id=>!existing.has(id)))throw Error('AI did not return a valid photo order. Your photos were not changed.');
   const indexed=new Map(photos.map(p=>[p.id,p]));
   setDraft(d=>({...d,photos:ids.map(id=>indexed.get(id)).filter(Boolean)}));
  }catch(e){setAiError(e.message||'Could not reorder your photos.')}finally{setAiBusy(false)}
 }
 const canContinue=Boolean(draft.title?.trim());
 return <div className="lv-create-overlay" role="dialog" aria-modal="true" aria-label="Create a collection">
  <div className="lv-create-shell">
   <header className="lv-create-header">
    <button type="button" className="lv-create-back" onClick={onClose}><ArrowLeft size={17}/> Back to collections</button>
    <span>lifevault <span className="lv-create-rule">/</span> {edit?'Edit collection':'New collection'}</span>
    <button type="button" className="lv-create-close" onClick={onClose} aria-label="Close editor">×</button>
   </header>
   <nav className="lv-create-steps" aria-label="Collection creation progress">
    {['Gather','Give it meaning','Finish'].map((label,i)=><button type="button" key={label} className={step===i?'selected':''} onClick={()=>setStep(i)}><span>{pad(i+1)}</span>{label}</button>)}
   </nav>
   <div className="lv-create-body">
    {step===0&&<section className="lv-create-section">
     <div className="lv-create-eyebrow">01 — BEGIN WITH A MEMORY</div>
     <h2>What are we <em>remembering?</em></h2>
     <p>Give this collection a name, then bring your photos together. You can fill in the story later.</p>
     <label className="lv-create-label" htmlFor="collection-title">Collection name</label>
     <input id="collection-title" className="lv-create-title-input" required maxLength={180} autoFocus value={draft.title} placeholder="The summer we spent together…" onChange={e=>set('title',e.target.value)}/>
     <div className="lv-dropzone" role="button" tabIndex={0} aria-label="Choose photos to add" onClick={()=>picker.current?.click()} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();picker.current?.click()}}} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={e=>{e.preventDefault();setDragging(false)}} onDrop={e=>{e.preventDefault();add(e.dataTransfer.files)}} data-drag={dragging?'true':'false'}>
      <UploadCloud size={30} strokeWidth={1.4}/>
      <strong>{busy?'Adding photographs…':'Drop your photographs here'}</strong>
      <span>or click to choose from your device · JPEG, PNG, WebP and HEIC where supported</span>
      <small>Up to 12 photos, 10 MB each · Original files stay on this device</small>
     </div>
     <input ref={picker} hidden type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={e=>{add(e.target.files);e.target.value=''}}/>
     {draft.photos.length>0&&<div className="lv-create-photo-section">
       <div className="lv-create-photo-heading"><strong>{draft.photos.length} / 12 photographs</strong><div className="lv-create-photo-tools"><button type="button" onClick={arrange} disabled={mixBusy||draft.photos.length<3}><Sparkles size={15}/> {mixBusy?'Mixing…':'Smart visual mix'}</button><button type="button" onClick={aiArrange} disabled={aiBusy||draft.photos.length<2}><Sparkles size={15}/> {aiBusy?'Curating…':'AI story order'}</button></div></div>
       <div className="lv-create-photos">{draft.photos.map((photo,i)=><article key={photo.id} className="lv-create-photo" draggable onDragStart={e=>{e.stopPropagation();setMoving(photo.id);e.dataTransfer.effectAllowed='move'}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.stopPropagation();e.preventDefault();dragPhoto(moving,photo.id)}} onDragEnd={()=>setMoving(null)}>
        <div className="lv-create-photo-frame"><img alt={photo.caption||'Collection photo'} src={photo.url}/><span>{pad(i+1)}</span><button aria-label="Remove photo" type="button" onClick={()=>removePhoto(photo.id)}><Trash2 size={15}/></button></div>
        <label><GripVertical size={14}/> <input value={photo.caption||''} maxLength={180} placeholder="Add a caption…" onChange={e=>setDraft(x=>({...x,photos:x.photos.map(p=>p.id===photo.id?{...p,caption:e.target.value}:p)}))}/></label>
       </article>)}</div>
       <div className="lv-create-hint">Drag photographs to reorder. Smart arrange alternates captioned and uncaptioned photos for a balanced starting layout; it doesn't analyze image contents.</div>
     </div>}
    </section>}
    {step===1&&<section className="lv-create-section">
     <div className="lv-create-eyebrow">02 — THE DETAILS YOU REMEMBER</div><h2>Put the moment <em>into words.</em></h2>
     <p>Just the essentials. Every field here is optional, and you can change them anytime.</p>
     <div className="lv-create-fields"><label><span><MapPin size={17}/> Where was it?</span><input maxLength={180} value={draft.place||''} placeholder="A city, a place, somewhere special" onChange={e=>set('place',e.target.value)}/></label>
     <label><span><CalendarDays size={17}/> When was it?</span><input type={exactDate?'date':'month'} value={exactDate?dateInfo.day:dateInfo.month} onChange={e=>exactDate?changeDay(e.target.value):changeMonth(e.target.value)}/></label></div>
     <label className="lv-create-date-choice"><input type="checkbox" checked={exactDate} onChange={e=>{setExactDate(e.target.checked);set('date',e.target.checked?dateInfo.day:dateInfo.month)}}/> Include the exact day (optional)</label>
     <label className="lv-create-label" htmlFor="collection-story">The story behind it</label>
     <textarea id="collection-story" rows={7} maxLength={2400} value={draft.story||''} placeholder="A feeling, a person, a few details you don't want to forget…" onChange={e=>set('story',e.target.value)}/>
     <div className="lv-create-ai"><Sparkles size={18}/><div><strong>A little help with your words</strong><p>Optional AI only reads the text you submit. It never sees your photographs.</p><AiSuggest purpose="story" text={[draft.title,draft.place,draft.date,draft.story].filter(Boolean).join('\n')} label="Help me tell this story" onApply={value=>set('story',value.slice(0,2400))}/></div></div>
    </section>}
    {step===2&&<section className="lv-create-section">
     <div className="lv-create-eyebrow">03 — READY WHEN YOU ARE</div><h2>A page worth <em>keeping.</em></h2><p>See how your collection comes together before saving it.</p>
     <div className="lv-create-review"><div className="lv-create-review-cover">{draft.photos?.length?<img alt="" src={draft.photos[0].url}/>:<Images size={50} strokeWidth={1}/>}</div><div className="lv-create-review-text"><small>{formatCollectionDate(draft.date)||'A moment of your choosing'} {draft.place?'· '+draft.place:''}</small><h3>{title}</h3><p>{draft.story||'Your story can be added whenever you are ready.'}</p><span>{draft.photos.length} photographs</span></div></div>
     <div className="lv-create-privacy"><ShieldCheck size={21}/><span>Personal collection · Your collection text syncs with your account. Photos selected from your device remain local until cloud media storage is enabled.</span></div>
    </section>}
   </div>
   <footer className="lv-create-footer"><div>{notice&&<span role="status">{notice}</span>}<span>Step {step+1} of 3</span></div><div className="lv-create-footer-actions">{step>0&&<button type="button" className="lv-create-secondary" onClick={()=>setStep(i=>i-1)}>Previous</button>}{step<2?<button type="button" className="lv-create-next" disabled={!canContinue} onClick={()=>setStep(i=>i+1)}>Continue <ArrowRight size={16}/></button>:<button type="button" className="lv-create-next" disabled={!canContinue||busy} onClick={onSave}><Check size={16}/>{edit?'Save collection':'Create collection'}</button>}</div></footer>
  </div>
 </div>
}
