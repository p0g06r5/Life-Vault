// Client-only résumé parsing helpers. No resume is sent to an AI API.
// Always show a preview before importing imperfectly structured PDF/DOCX text.
const sections={
 'summary':'about','professional summary':'about','profile':'about','professional profile':'about','about me':'about','objective':'about',
 'professional experience':'experience','work experience':'experience','employment history':'experience','employment':'experience','experience':'experience',
 'project':'projects','projects':'projects','selected projects':'projects','personal projects':'projects',
 'education':'education','academic background':'education','academic qualifications':'education',
 'certification':'certifications','certifications':'certifications','licenses & certifications':'certifications','licenses and certifications':'certifications','licenses':'certifications','certificates':'certifications',
 'technical skills':'skills','skills':'skills','core competencies':'skills','technical proficiencies':'skills','technologies':'skills'
};
const clean=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').trim();
const date=/\b(?:19|20)\d{2}\b|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\b(?:Present|Current)\b/i;
export function headingOf(raw){
 const key=clean(raw).replace(/[:.\-–—]+$/,'').toLowerCase();
 return sections[key]||null;
}
function splitEntries(lines,kind){
 const items=[];let chunk=[];
 const emit=()=>{
  const arr=chunk.filter(Boolean);chunk=[];
  if(!arr.length)return;
  const first=arr.shift();
  const second=arr[0]||'';
  const heading=first.split(/\s+\|\s+|\s+[—–]\s+|\s+@\s+/);
  const item={id:typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2),title:clean(heading[0]).slice(0,180),organization:clean(heading[1]||(!date.test(second)?'':'')),period:'',description:''};
  if(kind==='experience' || kind==='projects'){
   if(!item.organization&&second&&!/^[•\-\u2022]/.test(second)&&second.length<120&&!date.test(second)){item.organization=clean(arr.shift())}
  }else if(kind==='education'||kind==='certifications'){
   if(!item.organization&&second&&!/^[•\-\u2022]/.test(second)&&!date.test(second)&&second.length<100){item.organization=clean(arr.shift())}
  }
  const match=first.match(/(?:19|20)\d{2}\s*(?:[-–—]|to)\s*(?:(?:19|20)\d{2}|present|current)|(?:19|20)\d{2}/i);
  if(match){item.period=match[0];item.title=clean(item.title.replace(match[0],''))}
  if(!item.period&&arr.length&&date.test(arr[0])&&arr[0].length<95)item.period=clean(arr.shift());
  item.description=arr.map(x=>clean(x.replace(/^[•\-\u2022]\s*/,''))).join('\n').slice(0,2200);
  if(!item.title || item.title.length<2)return;
  items.push(item);
 };
 for(const line of lines){
  const raw=String(line||'');
  if(!raw.trim()){if(chunk.length)emit();continue}
  const value=clean(raw);
  // Once a section has several bullet lines, a new heading followed by a date starts a new entry.
  if(chunk.length>1&&date.test(value)&&!value.startsWith('•')&&chunk.some(x=>/^[•\-\u2022]/.test(x))){emit()}
  chunk.push(value);
 }
 emit();
 return items.slice(0,30);
}
export function parseResumeText(text){
 const lines=String(text||'').replace(/\r/g,'').split('\n').map(clean).slice(0,1200);
 const blocks={experience:[],projects:[],education:[],certifications:[],skills:[],about:[]};
 const intro=[];let current=null;
 for(const line of lines){
  const heading=headingOf(line);
  if(heading){current=heading;continue}
  if(current)blocks[current].push(line);
  else intro.push(line);
 }
 const firstLines=intro.filter(Boolean).slice(0,10);
 const email=String(text||'').match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0]||'';
 const candidate=firstLines.find(l=>/^[\p{L}][\p{L}\p{M}'\-\s.]{3,79}$/u.test(l)&&l.split(' ').length>=2&&l.split(' ').length<=5&&!date.test(l)&&!l.includes('@'))||'';
 const output={name:candidate,email,headline:'',about:blocks.about.filter(Boolean).join('\n').slice(0,2500),skills:[],experience:[],projects:[],education:[],certifications:[]};
 for(const kind of ['experience','projects','education','certifications'])output[kind]=splitEntries(blocks[kind],kind);
 const skills=blocks.skills.join(' · ').split(/[,;•·\n|]/).map(clean).filter(x=>x.length>1&&x.length<=65);
 output.skills=[...new Set(skills.map(x=>x.replace(/^(?:languages|frameworks|databases|cloud|tools)\s*:\s*/i,'')))].filter(Boolean).slice(0,80);
 const note=Object.keys(blocks).filter(k=>blocks[k].length>0);
 return {data:output,recognized:note,characters:clean(text).length};
}
export async function readResumeFile(file){
 if(!file||file.size>8*1024*1024)throw Error('Choose a file smaller than 8 MB.');
 const name=file.name.toLowerCase();
 if(name.endsWith('.pdf')){
  const pdfjs=await import('pdfjs-dist');
  // The browser worker is bundled locally, not loaded from a remote CDN.
  const {default:workerUrl}=await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;
  const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
  if(pdf.numPages>20)throw Error('Please upload a résumé of 20 pages or fewer.');
  const output=[];
  for(let page=1;page<=pdf.numPages;page++){
   const p=await pdf.getPage(page);const c=await p.getTextContent();
   let row=[],previous=null;
   for(const item of c.items){
    if(typeof item.str!=='string')continue;
    const y=item.transform?.[5]??0;
    if(previous!==null&&Math.abs(y-previous)>3){output.push(row.join(' '));row=[]}
    row.push(item.str);
    previous=y;
    if(item.hasEOL){output.push(row.join(' '));row=[];previous=null}
   }
   if(row.length)output.push(row.join(' '));output.push('');
  }
  return output.join('\n');
 }
 if(name.endsWith('.docx')){
  const mammoth=(await import('mammoth/mammoth.browser')).default;
  const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});
  return result.value||'';
 }
 if(name.endsWith('.txt'))return file.text();
 throw Error('Choose a PDF, Word DOCX, or text résumé.');
}
