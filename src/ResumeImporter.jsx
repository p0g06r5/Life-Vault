import React,{useRef,useState} from 'react';
import {ArrowLeft,Check,FileText,UploadCloud,X} from 'lucide-react';
import {parseResumeText,readResumeFile} from './resume-import.mjs';
import './resume-import.css';
const labels={experience:'Experience',education:'Education',certifications:'Certifications',projects:'Projects',skills:'Skills'};
export default function ResumeImporter({onClose,onImport}){
 const ref=useRef(null);
 const [filename,setFilename]=useState(''),[preview,setPreview]=useState(null),[selected,setSelected]=useState(Object.keys(labels)),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function handle(file){
  if(!file)return;
  setBusy(true);setError('');setPreview(null);
  try{
   const text=await readResumeFile(file);
   if(text.trim().length<40)throw Error('There is no readable text in this file. Scanned/image-only PDFs need OCR, which is not included yet.');
   const result=parseResumeText(text);
   if(!result.recognized.length)throw Error('No recognizable résumé sections found. Try adding standard headings such as Experience, Education, Skills and Certifications.');
   setFilename(file.name);setPreview(result);
   setSelected(Object.keys(labels).filter(k=>result.data[k].length));
  }catch(e){setError(e.message||'Unable to read this résumé.')}finally{setBusy(false)}
 }
 function finish(){
  if(!selected.length){setError('Choose at least one section.');return}
  onImport(preview.data,selected);onClose();
 }
 return <div className="lv-resume-overlay" role="dialog" aria-modal="true" aria-label="Import résumé"><div className="lv-resume-window">
  <header><button type="button" onClick={onClose}><ArrowLeft size={17}/> Back to professional</button><span>LifeVault / Résumé studio</span><button type="button" onClick={onClose} aria-label="Close"><X size={19}/></button></header>
  <div className="lv-resume-body"><span className="lv-resume-eyebrow">YOUR CAREER, THOUGHTFULLY ORGANIZED</span><h2>Build your portfolio<br/><em>from your résumé.</em></h2><p>Upload your résumé and LifeVault will sort its readable text into experience, education, projects, skills and certifications. You decide what to import.</p>
   <div className="lv-resume-upload" tabIndex={0} role="button" onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')ref.current?.click()}} onClick={()=>ref.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handle(e.dataTransfer.files?.[0])}}>
    <UploadCloud size={31}/><strong>{busy?'Reading your résumé…':filename||'Drop your résumé here'}</strong><span>or choose a PDF, Word DOCX, or TXT file</span><small>Up to 8 MB · Your original file stays in this browser; extracted sections sync only after your approval.</small>
    <input ref={ref} hidden type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={e=>{handle(e.target.files?.[0]);e.target.value=''}}/>
   </div>
   {error&&<div className="lv-resume-error" role="alert">{error}</div>}
   {preview&&<div className="lv-resume-review"><div className="lv-resume-review-head"><div><span>REVIEW BEFORE IMPORTING</span><h3>Here's what we found.</h3></div><small>{preview.characters.toLocaleString()} characters extracted</small></div>
    {Object.entries(labels).map(([kind,label])=><label key={kind} className="lv-resume-review-row"><input type="checkbox" disabled={!preview.data[kind].length} checked={selected.includes(kind)} onChange={e=>setSelected(list=>e.target.checked?[...list,kind]:list.filter(x=>x!==kind))}/><div><strong>{label}</strong><span>{preview.data[kind].length} {kind==='skills'?'skills':'items'} found</span>{kind!=='skills'&&preview.data[kind][0]&&<small>{preview.data[kind][0].title}</small>}</div></label>)}
    <p><FileText size={16}/> Text extraction is best-effort. Please inspect and correct imported entries; formatting and dates may need adjustment. Existing portfolio content will be kept.</p>
    <button type="button" className="lv-resume-confirm" onClick={finish}><Check size={17}/> Import selected sections</button>
   </div>}
  </div>
 </div></div>;
}
